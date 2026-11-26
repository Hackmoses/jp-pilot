#!/usr/bin/env python3
"""
Generate British model word audio clips (Kokoro lang_code='b', voice='bm_george', CPU-only),
verify with Whisper small.en (CPU-only), and build an offline mobile-friendly teacher check page.

Usage:
  ~/venvs/kokoro/bin/python audio/generate_english_words.py --mode words [--ids accommodate,debt,...]
  ~/venvs/chatterbox/bin/python audio/generate_english_words.py --mode whisper [--ids accommodate,debt,...]
  python3 audio/generate_english_words.py --mode check-page
"""

from __future__ import annotations

import argparse
import base64
import csv
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORDS_JSON = ROOT / "lessons-bank" / "english-oral-words.json"
WORDS_OUT_DIR = ROOT / "app" / "public" / "audio" / "words"
VOICE_TRIAL_DIR = ROOT / "voice-trial"
CSV_PATH = VOICE_TRIAL_DIR / "english-words-phonemes.csv"
CHECK_HTML_PATH = VOICE_TRIAL_DIR / "english-words-check.html"
STATE_DIR = Path("/tmp/jp-english-words")
ROWS_STATE_PATH = STATE_DIR / "generated_rows.json"

# British Misaki phoneme inventory from hexgrad/misaki EN_PHONES.md
BRITISH_VOCAB = frozenset("AIWYbdfhijklmnpstuvwzðŋɑɔəɛɜɡɪɹʃʊʌʒʤʧˈˌθᵊQaɒː")
MISAKI_VOWEL_CHARS = set("AIWYQɑɔəɛɜɪʊʌaɒiu")


def ffprobe_duration_ms(path: Path) -> int:
    """Return container duration in integer milliseconds using ffprobe."""
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path),
    ]
    res = subprocess.run(cmd, check=True, capture_output=True, text=True)
    return int(round(float(res.stdout.strip()) * 1000))


def encode_opus_webm(wav_path: Path, webm_path: Path) -> None:
    """Encode a WAV file to 16k mono 48kHz Opus WebM optimized for voice."""
    webm_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-i", str(wav_path),
        "-c:a", "libopus", "-b:a", "16k", "-ac", "1", "-ar", "48000",
        "-application", "voip",
        str(webm_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)


def atomic_write_json(path: Path, payload: dict) -> None:
    """Write JSON atomically via a temporary sibling file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def measure_silence_ms(webm_path: Path, threshold_db: float = -40.0) -> tuple[float, float]:
    """Measure leading and trailing silence in milliseconds for a WebM clip."""
    import numpy as np
    sr = 48000
    cmd = [
        "ffmpeg", "-v", "error", "-i", str(webm_path),
        "-f", "f32le", "-ac", "1", "-ar", str(sr), "pipe:1",
    ]
    res = subprocess.run(cmd, check=True, capture_output=True)
    samples = np.frombuffer(res.stdout, dtype=np.float32)
    if samples.size == 0:
        return 0.0, 0.0

    win = int(sr * 0.010)
    hop = int(sr * 0.005)
    thresh = 10.0 ** (threshold_db / 20.0)
    starts = list(range(0, max(1, len(samples) - win + 1), hop))
    active = [
        s for s in starts
        if float(np.sqrt(np.mean(samples[s : s + win] ** 2))) >= thresh
    ]
    if not active:
        dur_ms = len(samples) * 1000.0 / sr
        return dur_ms, dur_ms
    lead_ms = active[0] * 1000.0 / sr
    trail_ms = max(0.0, (len(samples) - (active[-1] + win)) * 1000.0 / sr)
    return round(lead_ms, 1), round(trail_ms, 1)


def _convert_ipa_segment(seg: str) -> str:
    """Convert one IPA syllable (without stress marks or dots) to Misaki British tokens."""
    for old, new in (
        ("eɪ", "A"),
        ("aɪ", "I"),
        ("aʊ", "W"),
        ("ɔɪ", "Y"),
        ("əʊ", "Q"),
        ("eə", "ɛː"),
        ("tʃ", "ʧ"),
        ("dʒ", "ʤ"),
    ):
        seg = seg.replace(old, new)

    for old, new in (
        ("æ", "a"),
        ("e", "ɛ"),
        ("r", "ɹ"),
        ("g", "ɡ"),
    ):
        seg = seg.replace(old, new)
    return seg


def _place_stress_before_vowel(misaki_syl: str, mark: str) -> str:
    """Place stress mark immediately before the first vowel nucleus in a syllable."""
    for idx, ch in enumerate(misaki_syl):
        if ch in MISAKI_VOWEL_CHARS:
            return misaki_syl[:idx] + mark + misaki_syl[idx:]
    return mark + misaki_syl


def ipa_to_misaki_gb(ipa: str, stress: int) -> str:
    """Convert checked British dictionary IPA and 1-indexed primary stress to Misaki British phonemes."""
    raw = ipa.strip()
    if raw.startswith("/") and raw.endswith("/"):
        raw = raw[1:-1]

    syllables = raw.split(".") if "." in raw else [raw]
    expanded_syls: list[str] = []
    for syl in syllables:
        for part in re.split(r"(?=[ˈˌ])", syl):
            if part:
                expanded_syls.append(part)
    syllables = expanded_syls

    has_explicit_primary = any("ˈ" in s for s in syllables)
    converted_parts: list[str] = []
    primary_syl_idx: int | None = None

    for idx, syl in enumerate(syllables, 1):
        mark = ""
        clean_syl = syl
        if "ˈ" in clean_syl:
            mark = "ˈ"
            clean_syl = clean_syl.replace("ˈ", "")
            primary_syl_idx = idx
        elif "ˌ" in clean_syl:
            mark = "ˌ"
            clean_syl = clean_syl.replace("ˌ", "")

        m_syl = _convert_ipa_segment(clean_syl)

        if not has_explicit_primary and len(syllables) == 1 and idx == stress and m_syl != "ə":
            mark = "ˈ"
            primary_syl_idx = idx

        if mark:
            m_syl = _place_stress_before_vowel(m_syl, mark)
        converted_parts.append(m_syl)

    if len(syllables) > 1 and primary_syl_idx is not None:
        assert primary_syl_idx == stress, (
            f"Stress mismatch for {ipa!r}: expected syllable {stress}, found ˈ on {primary_syl_idx}"
        )

    out = "".join(converted_parts)
    bad = [ch for ch in out if ch not in BRITISH_VOCAB]
    assert not bad, f"Non-Misaki characters {bad!r} in conversion of {ipa!r} -> {out!r}"
    return out


def phonemes_equivalent(kokoro_ps: str, dict_ps: str) -> bool:
    """Compare Kokoro British G2P output against dictionary Misaki phonemes."""
    return kokoro_ps.replace("ᵊ", "ə") == dict_ps.replace("ᵊ", "ə")


def select_target_words(lesson_prefix: str, ids_filter: set[str] | None = None) -> list[dict]:
    """Load word entries filtered by lesson prefix and optional explicit ID list."""
    words = json.loads(WORDS_JSON.read_text(encoding="utf-8"))
    if lesson_prefix:
        words = [w for w in words if w.get("lesson", "").startswith(lesson_prefix)]
    if ids_filter is not None:
        selected = [w for w in words if w["id"] in ids_filter]
        missing = ids_filter - {w["id"] for w in selected}
        if missing:
            raise ValueError(f"Unknown or out-of-scope word ids: {sorted(missing)}")
        return selected
    return words


def load_rows_state() -> dict[str, dict]:
    if ROWS_STATE_PATH.exists():
        return json.loads(ROWS_STATE_PATH.read_text(encoding="utf-8"))
    return {}


def save_rows_state(rows_by_id: dict[str, dict]) -> None:
    atomic_write_json(ROWS_STATE_PATH, rows_by_id)


def run_words_mode(lesson_prefix: str, ids_filter: set[str] | None = None) -> int:
    """Generate British Kokoro word clips on CPU, skipping any existing .webm files."""
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline

    words = select_target_words(lesson_prefix, ids_filter)
    WORDS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    VOICE_TRIAL_DIR.mkdir(parents=True, exist_ok=True)
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading Kokoro KPipeline(lang_code='b', device='cpu')...", flush=True)
    pipeline = KPipeline(lang_code="b", device="cpu")

    tmp_wav = STATE_DIR / "word_tmp.wav"
    rows_state = load_rows_state()
    csv_rows: list[dict] = []
    manifest_entries: list[dict] = []
    generated_count = 0
    skipped_count = 0
    override_count = 0

    def _extract_word_from_carrier(word_prompt: str) -> tuple[np.ndarray, str]:
        carrier = f"The word is: {word_prompt}."
        results = list(pipeline(carrier, voice="bm_george", split_pattern=None))
        if not results:
            raise RuntimeError(f"Kokoro returned no results for {carrier!r}")
        res = results[0]
        arr = (
            res.audio.detach().cpu().numpy().astype(np.float32)
            if hasattr(res.audio, "detach")
            else np.asarray(res.audio, dtype=np.float32)
        )
        toks = list(res.tokens or [])
        colon_idx = next((i for i, t in enumerate(toks) if t.text.strip() == ":"), None)
        if colon_idx is None or colon_idx + 1 >= len(toks):
            raise RuntimeError(
                f"Could not locate ':' boundary in tokens for {carrier!r}: {[(t.text, t.phonemes) for t in toks]}"
            )
        target_toks = [t for t in toks[colon_idx + 1 :] if t.text.strip(".,!?;:")]
        if not target_toks:
            raise RuntimeError(
                f"No target tokens after ':' for {carrier!r}: {[(t.text, t.phonemes) for t in toks]}"
            )
        colon_tok = toks[colon_idx]
        first_tok = target_toks[0]
        used_ps = "".join(str(t.phonemes or "") for t in target_toks).strip()

        sr = 24000
        c_start = max(0, int((colon_tok.start_ts or 0.0) * sr))
        w_start = max(c_start + 1, int((first_tok.start_ts or 0.0) * sr))
        win = int(0.010 * sr)
        hop = int(0.002 * sr)
        best_pos = w_start
        best_rms = float("inf")
        search_end = min(len(arr) - win, w_start + int(0.005 * sr))
        for pos in range(c_start, max(c_start + 1, search_end), hop):
            rms = float(np.sqrt(np.mean(arr[pos : pos + win] ** 2)))
            if rms < best_rms:
                best_rms = rms
                best_pos = pos + win // 2

        raw_seg = arr[best_pos:].copy()
        fade_in_n = min(int(0.004 * sr), len(raw_seg) // 4)
        if fade_in_n > 1:
            fi = 0.5 * (1.0 - np.cos(np.linspace(0.0, np.pi, fade_in_n, dtype=np.float32)))
            raw_seg[:fade_in_n] *= fi

        t_win = int(0.010 * sr)
        t_hop = int(0.005 * sr)
        thresh = 10.0 ** (-55.0 / 20.0)
        active = [
            s for s in range(0, max(1, len(raw_seg) - t_win + 1), t_hop)
            if float(np.sqrt(np.mean(raw_seg[s : s + t_win] ** 2))) >= thresh
        ]
        if active:
            a0 = max(0, active[0] - int(0.025 * sr))
            a1 = min(len(raw_seg), active[-1] + t_win + int(0.045 * sr))
            core = raw_seg[a0:a1].copy()
        else:
            core = raw_seg

        fade_n = min(int(0.005 * sr), len(core) // 4)
        if fade_n > 1:
            fade = 0.5 * (1.0 - np.cos(np.linspace(0.0, np.pi, fade_n, dtype=np.float32)))
            core[:fade_n] *= fade
            core[-fade_n:] *= fade[::-1]

        pad_lead = np.zeros(int(0.080 * sr), dtype=np.float32)
        pad_trail = np.zeros(int(0.100 * sr), dtype=np.float32)
        return np.concatenate([pad_lead, core, pad_trail]), used_ps

    try:
        for idx, item in enumerate(words, 1):
            wid = item["id"]
            word = item["word"]
            ipa = item["ipa"]
            stress = int(item["stress"])
            out_webm = WORDS_OUT_DIR / f"{wid}.webm"

            if out_webm.exists():
                skipped_count += 1
                dur_ms = ffprobe_duration_ms(out_webm)
                assert dur_ms > 0 and out_webm.stat().st_size > 0, f"Invalid existing clip: {out_webm}"
                prev = rows_state.get(wid)
                if prev:
                    row = dict(prev)
                else:
                    kokoro_ps, _ = pipeline.g2p(word)
                    kokoro_ps = kokoro_ps.strip()
                    dict_ps = ipa_to_misaki_gb(ipa, stress)
                    ovr = not phonemes_equivalent(kokoro_ps, dict_ps)
                    row = {
                        "id": wid,
                        "word": word,
                        "dictionary_ipa": ipa,
                        "stress": stress,
                        "kokoro_phonemes": kokoro_ps,
                        "dict_misaki_phonemes": dict_ps,
                        "phonemes_used": dict_ps if ovr else kokoro_ps,
                        "override_needed": "yes" if ovr else "no",
                    }
                    rows_state[wid] = row
                if row["override_needed"] == "yes":
                    override_count += 1
                csv_rows.append(row)
                manifest_entries.append({
                    "id": wid,
                    "word": word,
                    "ipa": ipa,
                    "durationMs": dur_ms,
                })
                print(f"[{idx:3d}/{len(words)}] {wid:18s} SKIPPED  dur={dur_ms}ms", flush=True)
                continue

            kokoro_ps, _ = pipeline.g2p(word)
            kokoro_ps = kokoro_ps.strip()
            dict_ps = ipa_to_misaki_gb(ipa, stress)
            override = not phonemes_equivalent(kokoro_ps, dict_ps)

            if not override:
                final_arr, used_ps = _extract_word_from_carrier(word)
                if not phonemes_equivalent(used_ps, dict_ps):
                    override = True
                    final_arr, used_ps = _extract_word_from_carrier(f"[{word}](/{dict_ps}/)")
            else:
                final_arr, used_ps = _extract_word_from_carrier(f"[{word}](/{dict_ps}/)")

            if override:
                override_count += 1

            if not np.isfinite(final_arr).all() or final_arr.size == 0 or float(np.max(np.abs(final_arr))) < 1e-4:
                raise RuntimeError(f"Kokoro produced invalid/silent audio for {wid}")

            sr = 24000
            sf.write(str(tmp_wav), final_arr, sr)
            encode_opus_webm(tmp_wav, out_webm)
            dur_ms = ffprobe_duration_ms(out_webm)
            assert dur_ms > 0 and out_webm.stat().st_size > 0, f"Invalid generated clip: {out_webm}"
            lead_ms, trail_ms = measure_silence_ms(out_webm)
            generated_count += 1

            row = {
                "id": wid,
                "word": word,
                "dictionary_ipa": ipa,
                "stress": stress,
                "kokoro_phonemes": kokoro_ps,
                "dict_misaki_phonemes": dict_ps,
                "phonemes_used": used_ps,
                "override_needed": "yes" if override else "no",
            }
            rows_state[wid] = row
            save_rows_state(rows_state)
            csv_rows.append(row)
            manifest_entries.append({
                "id": wid,
                "word": word,
                "ipa": ipa,
                "durationMs": dur_ms,
            })

            tag = "OVERRIDE" if override else "MATCH   "
            print(
                f"[{idx:3d}/{len(words)}] {wid:18s} {tag} kokoro={kokoro_ps:16s} "
                f"used={used_ps:16s} dur={dur_ms}ms pad=({lead_ms}/{trail_ms}ms)",
                flush=True,
            )
    finally:
        if tmp_wav.exists():
            tmp_wav.unlink()

    if ids_filter is None:
        with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "id", "word", "dictionary_ipa", "stress",
                    "kokoro_phonemes", "dict_misaki_phonemes",
                    "phonemes_used", "override_needed",
                ],
            )
            writer.writeheader()
            writer.writerows(csv_rows)
        atomic_write_json(WORDS_OUT_DIR / "manifest.json", {"words": manifest_entries})
        print(
            f"\nDone: {generated_count} generated, {skipped_count} skipped, "
            f"{override_count} override(s) across {len(csv_rows)} words."
        )
        print(f"Wrote {CSV_PATH} and {WORDS_OUT_DIR / 'manifest.json'}")
    else:
        atomic_write_json(
            STATE_DIR / "smoke_test.json",
            {
                "generated": generated_count,
                "skipped": skipped_count,
                "overrides": override_count,
                "rows": csv_rows,
                "manifest": manifest_entries,
            },
        )
        print(
            f"\nSmoke test complete: {generated_count} generated, {skipped_count} skipped, "
            f"{override_count} override(s)."
        )

    return 0


def run_whisper_mode(lesson_prefix: str, ids_filter: set[str] | None = None) -> int:
    """Verify word clips using Whisper small.en strictly on CPU."""
    import whisper

    words = select_target_words(lesson_prefix, ids_filter)
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    print("Loading Whisper small.en on CPU...", flush=True)
    w_model = whisper.load_model("small.en", device="cpu")

    results: list[dict] = []
    flagged: list[dict] = []

    for idx, item in enumerate(words, 1):
        wid = item["id"]
        word = item["word"]
        ipa = item["ipa"]
        webm_path = WORDS_OUT_DIR / f"{wid}.webm"
        if not webm_path.exists():
            raise FileNotFoundError(f"Missing word clip: {webm_path}")

        res = w_model.transcribe(str(webm_path), fp16=False, language="en")
        heard_raw = res["text"].strip()
        heard_norm = re.sub(r"[^a-z']", "", heard_raw.lower())
        expected_norm = re.sub(r"[^a-z']", "", word.lower())
        match = (heard_norm == expected_norm)

        row = {
            "id": wid,
            "word": word,
            "ipa": ipa,
            "heard": heard_raw,
            "heardNorm": heard_norm,
            "match": match,
        }
        results.append(row)
        if not match:
            flagged.append(row)
            print(f"[{idx:3d}/{len(words)}] FLAG {wid:18s} expected={word!r} heard={heard_raw!r}", flush=True)

    out_path = STATE_DIR / ("words_whisper_test.json" if ids_filter else "words_whisper.json")
    atomic_write_json(out_path, {"results": results, "flagged": flagged})
    print(f"\nWhisper summary: {len(results) - len(flagged)}/{len(results)} matched, {len(flagged)} flagged.")
    return 0


def run_check_page_mode(lesson_prefix: str) -> int:
    """Generate a self-contained mobile-friendly HTML page for teacher review."""
    words = select_target_words(lesson_prefix)

    csv_by_id: dict[str, dict] = {}
    if CSV_PATH.exists():
        with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
            for row in csv.DictReader(f):
                csv_by_id[row["id"]] = row

    whisper_by_id: dict[str, dict] = {}
    whisper_json = STATE_DIR / "words_whisper.json"
    if whisper_json.exists():
        w_data = json.loads(whisper_json.read_text(encoding="utf-8"))
        for row in w_data.get("results", []):
            whisper_by_id[row["id"]] = row

    items_payload: list[dict] = []
    for item in words:
        wid = item["id"]
        webm_path = WORDS_OUT_DIR / f"{wid}.webm"
        if not webm_path.exists():
            raise FileNotFoundError(f"Missing word clip for check page: {webm_path}")
        b64 = base64.b64encode(webm_path.read_bytes()).decode("ascii")
        c_row = csv_by_id.get(wid, {})
        w_row = whisper_by_id.get(wid, {})
        items_payload.append({
            "id": wid,
            "word": item["word"],
            "ipa": item["ipa"],
            "stress": item["stress"],
            "lesson": item["lesson"],
            "override": c_row.get("override_needed", "no") == "yes",
            "kokoroPs": c_row.get("kokoro_phonemes", ""),
            "usedPs": c_row.get("phonemes_used", ""),
            "whisperMatch": w_row.get("match", True),
            "whisperHeard": w_row.get("heard", ""),
            "audioB64": b64,
        })

    data_json = json.dumps(items_payload, ensure_ascii=False)
    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>English Words — Teacher Check ({len(items_payload)} words)</title>
  <style>
    :root {{
      --bg: #0f1419;
      --card: #182028;
      --card2: #202a35;
      --border: #2e3d4c;
      --text: #f0f4f8;
      --muted: #9fb3c8;
      --accent: #38bdf8;
      --ok-bg: #114432;
      --ok-bd: #22c55e;
      --ok-fg: #86efac;
      --redo-bg: #4c1d24;
      --redo-bd: #f43f5e;
      --redo-fg: #fda4af;
      --warn-bg: #3b2f13;
      --warn-fg: #fcd34d;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.4;
      -webkit-tap-highlight-color: transparent;
    }}
    .wrap {{ max-width: 860px; margin: 0 auto; padding-bottom: 48px; }}
    .topbar {{
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(15, 20, 25, 0.96);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 14px;
    }}
    h1 {{ margin: 0 0 4px; font-size: 1.1rem; }}
    .sub {{ margin: 0 0 10px; font-size: 0.84rem; color: var(--muted); }}
    .actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }}
    .counts {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.82rem;
      margin-right: auto;
    }}
    .pill {{
      background: var(--card2);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 10px;
      font-weight: 600;
    }}
    .pill.ok {{ color: var(--ok-fg); border-color: #1f6b4f; }}
    .pill.redo {{ color: var(--redo-fg); border-color: #7f2936; }}
    .btn {{
      appearance: none;
      border: 1px solid var(--border);
      background: var(--card2);
      color: var(--text);
      border-radius: 10px;
      min-height: 44px;
      padding: 8px 14px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }}
    .btn.primary {{
      background: #0284c7;
      border-color: #38bdf8;
      color: #fff;
    }}
    .filters {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }}
    .filter-btn {{
      appearance: none;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--muted);
      border-radius: 999px;
      min-height: 36px;
      padding: 4px 12px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }}
    .filter-btn.active {{
      background: var(--accent);
      color: #07131d;
      border-color: var(--accent);
    }}
    .row {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .row.approved {{ border-color: var(--ok-bd); }}
    .row.redo {{ border-color: var(--redo-bd); }}
    .word-title {{
      font-size: 1.15rem;
      font-weight: 700;
    }}
    .word-meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-top: 2px;
      font-size: 0.88rem;
      color: var(--muted);
    }}
    .ipa {{
      font-family: "SF Mono", Menlo, Consolas, monospace;
      color: var(--text);
      background: var(--card2);
      padding: 2px 7px;
      border-radius: 6px;
      border: 1px solid var(--border);
    }}
    .tag {{
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--card2);
      color: var(--muted);
    }}
    .tag.ovr {{ color: var(--accent); border-color: #1e4e68; }}
    .tag.flag {{ color: var(--warn-fg); background: var(--warn-bg); border-color: #6b531b; }}
    .controls {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }}
    .play-btn.playing {{
      border-color: var(--accent);
      background: #0c4a6e;
    }}
    .approve-btn.selected {{
      background: var(--ok-bg);
      border-color: var(--ok-bd);
      color: var(--ok-fg);
    }}
    .redo-btn.selected {{
      background: var(--redo-bg);
      border-color: var(--redo-bd);
      color: var(--redo-fg);
    }}
    .note {{
      width: 100%;
      min-height: 38px;
      background: var(--card2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 10px;
      color: var(--text);
      font-size: 0.85rem;
    }}
    @media (min-width: 680px) {{
      .row-top {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }}
      .controls {{
        min-width: 300px;
      }}
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <h1>English Foundations — British Model Words Check</h1>
      <p class="sub">Offline teacher review for all {len(items_payload)} Kokoro (bm_george) word clips. Choices save automatically in this browser.</p>
      <div class="actions">
        <div class="counts">
          <span class="pill" id="c-total">Total: {len(items_payload)}</span>
          <span class="pill ok" id="c-ok">Approved: 0</span>
          <span class="pill redo" id="c-redo">Redo: 0</span>
          <span class="pill" id="c-pend">Pending: {len(items_payload)}</span>
        </div>
        <button type="button" class="btn primary" id="download-csv">Download CSV</button>
      </div>
      <div class="filters" id="filters">
        <button type="button" class="filter-btn active" data-filter="all">All</button>
        <button type="button" class="filter-btn" data-filter="pending">Pending</button>
        <button type="button" class="filter-btn" data-filter="approve">Approved</button>
        <button type="button" class="filter-btn" data-filter="redo">Redo</button>
        <button type="button" class="filter-btn" data-filter="flagged">Whisper Flagged</button>
        <button type="button" class="filter-btn" data-filter="override">Overridden</button>
      </div>
    </div>
    <div id="list"></div>
  </div>
  <audio id="player" preload="none"></audio>
  <script>
    const WORDS = {data_json};
    const STORAGE_KEY = 'jp-english-words-check-v1';
    let state = {{}};
    try {{
      state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{{}}') || {{}};
    }} catch {{ state = {{}}; }}

    let activeFilter = 'all';
    const player = document.getElementById('player');
    let activePlayBtn = null;
    let activeBlobUrl = null;
    const listEl = document.getElementById('list');

    function saveState() {{
      try {{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }} catch {{}}
      updateCounts();
    }}

    function b64ToBlobUrl(b64) {{
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([bytes], {{ type: 'audio/webm' }}));
    }}

    function playWord(item, btn) {{
      if (activePlayBtn) activePlayBtn.classList.remove('playing');
      if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl);
      activeBlobUrl = b64ToBlobUrl(item.audioB64);
      activePlayBtn = btn;
      btn.classList.add('playing');
      player.src = activeBlobUrl;
      player.play().catch(() => {{}});
    }}

    player.addEventListener('ended', () => {{
      if (activePlayBtn) activePlayBtn.classList.remove('playing');
      activePlayBtn = null;
    }});

    function updateCounts() {{
      let ok = 0, redo = 0;
      for (const item of WORDS) {{
        const c = state[item.id]?.choice;
        if (c === 'approve') ok++;
        else if (c === 'redo') redo++;
      }}
      document.getElementById('c-ok').textContent = 'Approved: ' + ok;
      document.getElementById('c-redo').textContent = 'Redo: ' + redo;
      document.getElementById('c-pend').textContent = 'Pending: ' + (WORDS.length - ok - redo);
    }}

    function formatLesson(lesson) {{
      if (lesson.startsWith('english-foundations-')) return 'Foundations ' + lesson.slice('english-foundations-'.length);
      if (lesson.startsWith('english-oral-')) return 'Oral ' + lesson.slice('english-oral-'.length);
      return lesson;
    }}

    function matchesFilter(item) {{
      const c = state[item.id]?.choice || '';
      if (activeFilter === 'pending') return !c;
      if (activeFilter === 'approve') return c === 'approve';
      if (activeFilter === 'redo') return c === 'redo';
      if (activeFilter === 'flagged') return !item.whisperMatch;
      if (activeFilter === 'override') return item.override;
      return true;
    }}

    function render() {{
      listEl.innerHTML = '';
      for (const item of WORDS) {{
        if (!matchesFilter(item)) continue;
        const entry = state[item.id] || {{}};
        const choice = entry.choice || '';
        const row = document.createElement('div');
        row.className = 'row' + (choice === 'approve' ? ' approved' : choice === 'redo' ? ' redo' : '');

        const top = document.createElement('div');
        top.className = 'row-top';

        const info = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'word-title';
        title.textContent = item.word + (item.id !== item.word ? ' (' + item.id + ')' : '');
        info.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'word-meta';
        const ipa = document.createElement('span');
        ipa.className = 'ipa';
        ipa.textContent = item.ipa;
        meta.appendChild(ipa);

        const stress = document.createElement('span');
        stress.textContent = 'Stress: syllable ' + item.stress;
        meta.appendChild(stress);

        const lessonTag = document.createElement('span');
        lessonTag.className = 'tag';
        lessonTag.textContent = formatLesson(item.lesson);
        meta.appendChild(lessonTag);

        if (item.override) {{
          const ovr = document.createElement('span');
          ovr.className = 'tag ovr';
          ovr.textContent = 'Override';
          meta.appendChild(ovr);
        }}
        if (!item.whisperMatch) {{
          const fl = document.createElement('span');
          fl.className = 'tag flag';
          fl.textContent = 'Whisper: ' + (item.whisperHeard || '∅');
          meta.appendChild(fl);
        }}
        info.appendChild(meta);
        top.appendChild(info);

        const controls = document.createElement('div');
        controls.className = 'controls';

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'btn play-btn';
        playBtn.textContent = '▶ Play';
        playBtn.onclick = () => playWord(item, playBtn);

        const appBtn = document.createElement('button');
        appBtn.type = 'button';
        appBtn.className = 'btn approve-btn' + (choice === 'approve' ? ' selected' : '');
        appBtn.textContent = '✓ Approve';
        appBtn.onclick = () => {{
          const cur = state[item.id] || {{}};
          cur.choice = cur.choice === 'approve' ? '' : 'approve';
          state[item.id] = cur;
          saveState();
          render();
        }};

        const redoBtn = document.createElement('button');
        redoBtn.type = 'button';
        redoBtn.className = 'btn redo-btn' + (choice === 'redo' ? ' selected' : '');
        redoBtn.textContent = '✕ Redo';
        redoBtn.onclick = () => {{
          const cur = state[item.id] || {{}};
          cur.choice = cur.choice === 'redo' ? '' : 'redo';
          state[item.id] = cur;
          saveState();
          render();
        }};

        controls.append(playBtn, appBtn, redoBtn);
        top.appendChild(controls);
        row.appendChild(top);

        const note = document.createElement('input');
        note.type = 'text';
        note.className = 'note';
        note.placeholder = 'Optional note (e.g. vowel too short, wrong stress)...';
        note.value = entry.note || '';
        note.oninput = () => {{
          const cur = state[item.id] || {{}};
          cur.note = note.value;
          state[item.id] = cur;
          saveState();
        }};
        row.appendChild(note);
        listEl.appendChild(row);
      }}
      updateCounts();
    }}

    document.getElementById('filters').addEventListener('click', (e) => {{
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b === btn));
      render();
    }});

    function csvCell(v) {{
      const s = String(v ?? '');
      return '"' + s.replaceAll('"', '""') + '"';
    }}

    document.getElementById('download-csv').addEventListener('click', () => {{
      const header = ['id', 'word', 'ipa', 'stress', 'lesson', 'choice', 'override_needed', 'whisper_heard', 'note'];
      const lines = [header.join(',')];
      for (const item of WORDS) {{
        const entry = state[item.id] || {{}};
        lines.push([
          item.id,
          item.word,
          item.ipa,
          item.stress,
          item.lesson,
          entry.choice || 'pending',
          item.override ? 'yes' : 'no',
          item.whisperHeard || '',
          entry.note || '',
        ].map(csvCell).join(','));
      }}
      const blob = new Blob([lines.join('\\n') + '\\n'], {{ type: 'text/csv;charset=utf-8' }});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'english-words-check.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }});

    render();
  </script>
</body>
</html>
"""
    VOICE_TRIAL_DIR.mkdir(parents=True, exist_ok=True)
    CHECK_HTML_PATH.write_text(html_doc, encoding="utf-8")
    print(f"Wrote {CHECK_HTML_PATH} ({CHECK_HTML_PATH.stat().st_size:,} bytes, {len(items_payload)} words)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate British model word clips and teacher check page")
    parser.add_argument("--mode", required=True, choices=["words", "whisper", "check-page"])
    parser.add_argument("--only-lesson-prefix", default="english-foundations-")
    parser.add_argument("--ids", default="", help="Comma-separated word IDs")
    args = parser.parse_args()

    ids_filter = {x.strip() for x in args.ids.split(",") if x.strip()} if args.ids else None

    if args.mode == "words":
        return run_words_mode(args.only_lesson_prefix, ids_filter)
    if args.mode == "whisper":
        return run_whisper_mode(args.only_lesson_prefix, ids_filter)
    if args.mode == "check-page":
        return run_check_page_mode(args.only_lesson_prefix)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
