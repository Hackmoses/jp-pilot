#!/usr/bin/env python3
"""
Generate English Oral Forms audio:
  1. British model words via Kokoro (lang_code='b', voice='bm_george')
  2. Whisper small.en verification on word clips
  3. Narration clips via Chatterbox Charon (MPS, ref WAV, exaggeration=0.6, cfg_weight=0.4)
     with exact 600ms silences at {{word:id}} placeholders and Whisper beat timestamps
  4. Offline mobile-friendly teacher check HTML page

Usage:
  PYTORCH_ENABLE_MPS_FALLBACK=1 ~/venvs/kokoro/bin/python audio/generate_english_oral_voice.py --mode words [--ids bird,bumper,...]
  ~/venvs/chatterbox/bin/python audio/generate_english_oral_voice.py --mode whisper-words [--ids bird,bumper,...]
  PYTORCH_ENABLE_MPS_FALLBACK=1 ~/venvs/chatterbox/bin/python audio/generate_english_oral_voice.py --mode narration --ref /Users/mo/jp-pilot/voice-samples/reference.wav
  python3 audio/generate_english_oral_voice.py --mode check-page
"""

from __future__ import annotations

import argparse
import base64
import csv
import difflib
import html
import json
import os
import random
import re
import subprocess
import sys
import time
from pathlib import Path

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
WORDS_JSON = ROOT / "lessons-bank" / "english-oral-words.json"
LESSONS_JSON = ROOT / "lessons-bank" / "english-oral.json"
WORDS_OUT_DIR = ROOT / "app" / "public" / "audio" / "words"
LESSONS_OUT_DIR = ROOT / "app" / "public" / "audio" / "lessons"
VOICE_TRIAL_DIR = ROOT / "voice-trial"
CSV_PATH = VOICE_TRIAL_DIR / "english-words-phonemes.csv"
CHECK_HTML_PATH = VOICE_TRIAL_DIR / "english-words-check.html"
STATE_DIR = Path("/tmp/jp-english-oral-voice")

# British Misaki phoneme inventory from hexgrad/misaki EN_PHONES.md
BRITISH_VOCAB = frozenset("AIWYbdfhijklmnpstuvwzðŋɑɔəɛɜɡɪɹʃʊʌʒʤʧˈˌθᵊQaɒː")
MISAKI_VOWEL_CHARS = set("AIWYQɑɔəɛɜɪʊʌaɒiu")

# Audio / FFmpeg helpers
def ffprobe_duration_ms(path: Path) -> int:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path),
    ]
    res = subprocess.run(cmd, check=True, capture_output=True, text=True)
    return int(round(float(res.stdout.strip()) * 1000))


def encode_opus_webm(wav_path: Path, webm_path: Path) -> None:
    webm_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-i", str(wav_path),
        "-c:a", "libopus", "-b:a", "16k", "-ac", "1", "-ar", "48000",
        "-application", "voip",
        str(webm_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)


def atomic_write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def trim_silence(
    arr: np.ndarray,
    sr: int,
    threshold_db: float = -38.0,
    lead_ms: int = 40,
    trail_ms: int = 60,
) -> np.ndarray:
    if arr.size == 0:
        return arr
    peak = float(np.max(np.abs(arr)))
    if peak < 1e-6:
        return arr

    win = max(1, int(sr * 0.020))
    hop = max(1, int(sr * 0.005))
    thresh = min(10.0 ** (threshold_db / 20.0), 0.1 * peak)

    if len(arr) <= win:
        return arr

    starts = list(range(0, len(arr) - win + 1, hop))
    if starts[-1] + win < len(arr):
        starts.append(len(arr) - win)

    active_indices = [
        i for i, s in enumerate(starts)
        if float(np.sqrt(np.mean(arr[s : s + win] ** 2))) >= thresh
    ]
    if not active_indices:
        return arr

    first_sample = starts[active_indices[0]]
    last_sample = starts[active_indices[-1]] + win

    start = max(0, first_sample - int(sr * lead_ms / 1000))
    end = min(len(arr), last_sample + int(sr * trail_ms / 1000))
    trimmed = arr[start:end].copy()

    fade_n = min(int(sr * 0.005), len(trimmed) // 4)
    if fade_n > 1:
        fade_in = 0.5 * (1.0 - np.cos(np.linspace(0.0, np.pi, fade_n, dtype=np.float32)))
        trimmed[:fade_n] *= fade_in
        trimmed[-fade_n:] *= fade_in[::-1]

    return trimmed


def measure_silence_ms(webm_path: Path, threshold_db: float = -40.0) -> tuple[float, float]:
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


# ---------------------------------------------------------------------------
# Part 1: IPA -> Misaki British phoneme conversion & Kokoro word generation
# ---------------------------------------------------------------------------

def _convert_ipa_segment(seg: str) -> str:
    """Convert one IPA syllable (without stress marks or dots) to Misaki British tokens."""
    # Multi-character diphthongs / affricates first
    for old, new in (
        ("eɪ", "A"),
        ("aɪ", "I"),
        ("aʊ", "W"),
        ("ɔɪ", "Y"),
        ("əʊ", "Q"),
        ("eə", "ɛː"),  # Confirmed via Kokoro British G2P: hair -> hˈɛː
        ("tʃ", "ʧ"),
        ("dʒ", "ʤ"),
    ):
        seg = seg.replace(old, new)

    # Single-character mappings
    for old, new in (
        ("æ", "a"),   # British TRAP vowel in EN_PHONES.md
        ("e", "ɛ"),   # DRESS vowel
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
    """
    Convert checked British dictionary IPA (e.g. '/ˌtɜː.mɪˈneɪ.ʃən/') and 1-indexed
    primary stress syllable into Misaki's British phoneme alphabet.
    """
    raw = ipa.strip()
    if raw.startswith("/") and raw.endswith("/"):
        raw = raw[1:-1]

    # Split into syllables on '.'
    syllables = raw.split(".") if "." in raw else [raw]

    # Handle case where stress mark appears mid-token without a preceding dot (e.g. '/əˈbaʊt/')
    expanded_syls: list[str] = []
    for syl in syllables:
        parts = re.split(r"(?=[ˈˌ])", syl)
        for p in parts:
            if p:
                expanded_syls.append(p)
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

        # For single-syllable words without an explicit ˈ in IPA, add ˈ before vowel
        # unless the whole word is a bare unstressed schwa (/ə/ for "a").
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
    """
    Compare Kokoro British G2P output against dictionary Misaki phonemes.
    Normalizes only Misaki's internal muted schwa `ᵊ` to `ə` so suffixes like
    -əl/-ən match when vowel quality and stress already agree.
    """
    return kokoro_ps.replace("ᵊ", "ə") == dict_ps.replace("ᵊ", "ə")


def run_words_mode(ids_filter: set[str] | None = None) -> int:
    import soundfile as sf
    from kokoro import KPipeline

    words = json.loads(WORDS_JSON.read_text(encoding="utf-8"))
    if ids_filter is not None:
        words = [w for w in words if w["id"] in ids_filter]
        missing = ids_filter - {w["id"] for w in words}
        if missing:
            raise ValueError(f"Unknown word ids: {sorted(missing)}")

    WORDS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    VOICE_TRIAL_DIR.mkdir(parents=True, exist_ok=True)
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading Kokoro KPipeline(lang_code='b', device='cpu')...", flush=True)
    pipeline = KPipeline(lang_code="b", device="cpu")

    tmp_wav = STATE_DIR / "word_tmp.wav"
    csv_rows: list[dict] = []
    manifest_entries: list[dict] = []
    override_count = 0

    def _extract_word_from_carrier(word_prompt: str) -> tuple[np.ndarray, str]:
        carrier = f"The word is: {word_prompt}."
        results = list(pipeline(carrier, voice="bm_george", split_pattern=None))
        if not results:
            raise RuntimeError(f"Kokoro returned no results for {carrier!r}")
        res = results[0]
        arr = res.audio.detach().cpu().numpy().astype(np.float32) if hasattr(res.audio, "detach") else np.asarray(res.audio, dtype=np.float32)
        toks = list(res.tokens or [])
        colon_idx = next((i for i, t in enumerate(toks) if t.text.strip() == ":"), None)
        if colon_idx is None or colon_idx + 1 >= len(toks):
            raise RuntimeError(f"Could not locate ':' boundary in tokens for {carrier!r}: {[(t.text, t.phonemes) for t in toks]}")
        target_toks = [t for t in toks[colon_idx + 1 :] if t.text.strip(".,!?;:")]
        if not target_toks:
            raise RuntimeError(f"No target tokens after ':' for {carrier!r}: {[(t.text, t.phonemes) for t in toks]}")
        colon_tok = toks[colon_idx]
        first_tok = target_toks[0]
        used_ps = "".join(str(t.phonemes or "") for t in target_toks).strip()

        sr = 24000
        # Find quietest 10ms window inside the ':' pause before the word starts
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

        # Gentle outer silence trim at -55 dB (preserves quiet voiceless stops/fricatives)
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

    for idx, item in enumerate(words, 1):
        wid = item["id"]
        word = item["word"]
        ipa = item["ipa"]
        stress = int(item["stress"])

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
        out_webm = WORDS_OUT_DIR / f"{wid}.webm"
        encode_opus_webm(tmp_wav, out_webm)
        dur_ms = ffprobe_duration_ms(out_webm)

        csv_rows.append({
            "id": wid,
            "word": word,
            "dictionary_ipa": ipa,
            "stress": stress,
            "kokoro_phonemes": kokoro_ps,
            "dict_misaki_phonemes": dict_ps,
            "phonemes_used": used_ps,
            "override_needed": "yes" if override else "no",
        })
        manifest_entries.append({
            "id": wid,
            "word": word,
            "ipa": ipa,
            "durationMs": dur_ms,
        })

        tag = "OVERRIDE" if override else "MATCH   "
        print(
            f"[{idx:3d}/{len(words)}] {wid:15s} {tag} kokoro={kokoro_ps:16s} used={used_ps:16s} dur={dur_ms}ms",
            flush=True,
        )

    # When running the full list (no filter), write full CSV & manifest
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
        print(f"\nWrote {CSV_PATH} ({len(csv_rows)} rows) and {WORDS_OUT_DIR / 'manifest.json'}")
    else:
        print(f"\n5-word test complete: {len(csv_rows)} clips generated, {override_count} override(s).")

    return 0


# ---------------------------------------------------------------------------
# Part 2: Whisper verification on word clips
# ---------------------------------------------------------------------------

def run_whisper_words_mode(ids_filter: set[str] | None = None) -> int:
    import whisper

    words = json.loads(WORDS_JSON.read_text(encoding="utf-8"))
    if ids_filter is not None:
        words = [w for w in words if w["id"] in ids_filter]

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
            print(f"[{idx:3d}/{len(words)}] FLAG {wid:15s} expected={word!r} heard={heard_raw!r}", flush=True)

    out_path = STATE_DIR / ("words_whisper_test.json" if ids_filter else "words_whisper.json")
    atomic_write_json(out_path, {"results": results, "flagged": flagged})
    print(f"\nWhisper words summary: {len(results) - len(flagged)}/{len(results)} matched, {len(flagged)} flagged.")
    return 0


# ---------------------------------------------------------------------------
# Part 3: Chatterbox Charon narration with 600ms {{word:id}} silences
# ---------------------------------------------------------------------------

ONES = {
    0: "zero", 1: "one", 2: "two", 3: "three", 4: "four",
    5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
    10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen",
    15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen",
}
TENS = {
    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",
    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety",
}
SPELLING_EQUIV = {
    "centre": "center",
    "colour": "color",
    "capitalised": "capitalized",
    "recognise": "recognize",
}


def int_to_words(n: int) -> list[str]:
    if n < 20:
        return [ONES[n]]
    if n < 100:
        t, r = divmod(n, 10)
        return [TENS[t * 10]] + ([ONES[r]] if r else [])
    if n < 1000:
        h, r = divmod(n, 100)
        return [ONES[h], "hundred"] + (int_to_words(r) if r else [])
    return [str(n)]


IPA_TTS_REPLACEMENTS = (
    ("the mark ˈ", "the stress mark"),
    ("ˈ", "stress mark"),
    ("~Monday", "Monday"),
    ("/ɪə/ and /eə/", "the two centring glide symbols"),
    ("for /e/", "for the short e vowel"),
    ("/e/", "the short e vowel"),
    ("/ɜː/", "the long central vowel"),
    ("/iː/", "the long e vowel"),
    ("steady vowel /ɪ/", "steady short i vowel"),
    ("/ɪ/", "the short i vowel"),
    ("/uː/", "the long u vowel"),
    ("relaxed /ʊ/", "relaxed short u vowel"),
    ("short /ʊ/", "the short u vowel"),
    ("/ʊ/", "the short u vowel"),
    ("/ʌ/", "the short central vowel"),
    ("/æ/", "the short a vowel"),
    ("/ɒ/", "the short o vowel"),
    ("rounded /ɔː/", "the rounded long o vowel"),
    ("/ɔː/", "the long o vowel"),
    ("/ɑː/", "the long a vowel"),
    ("/ə/", "schwa"),
    ("write it /eɪ/", "write it as the e i glide"),
    ("/eɪ/", "the e i glide"),
    ("The glide /aɪ/", "The a i glide"),
    ("sound /aɪ/", "sound as the a i glide"),
    ("/aɪ/", "the a i glide"),
    ("/ɔɪ/", "the o i glide"),
    ("/əʊ/", "the oh glide"),
    ("/aʊ/", "the ow glide"),
    ("/ɪə/", "the first centring glide"),
    ("/eə/", "the second centring glide"),
    ("/ʊə/", "the rounded centring glide"),
    ("with /t/", "with a t sound"),
    ("/t/", "the t sound"),
    ("/θ/", "the voiceless t h sound"),
    ("use /d/", "use a d sound"),
    ("/d/", "the d sound"),
    ("/ð/", "the voiced t h sound"),
    ("/ʃ/", "the s h sound"),
    ("/tʃ/", "the c h sound"),
)

CONNECTOR_CARRIERS: dict[str, tuple[str, list[str]]] = {
    "and": ("Okay, and, again.", ["and"]),
    "then": ("Okay, then, again.", ["then"]),
    "too.": ("Okay, too. Again.", ["too"]),
    "Hear": ("Okay. Hear, this example.", ["hear"]),
    "Now hear": ("Okay. Now hear, this example.", ["now", "hear"]),
    "Then hear": ("Okay. Then hear, this example.", ["then", "hear"]),
    "Next hear": ("Okay. Next hear, this example.", ["next", "hear"]),
    "Listen to": ("Okay. Listen to, this example.", ["listen", "to"]),
    "Now listen to": ("Okay. Now listen to, this example.", ["now", "listen", "to"]),
    "Compare": ("Okay. Compare, these two.", ["compare"]),
    "Try": ("Okay. Try, this example.", ["try"]),
}


def tts_text_for_chunk(text: str) -> str:
    """Convert literal IPA symbols and ~Monday to spoken English for Chatterbox TTS only."""
    s = text
    for old, new in IPA_TTS_REPLACEMENTS:
        s = s.replace(old, new)
    assert not any(ch in s for ch in ("/", "ˈ", "~")), f"Unconverted symbol in TTS text: {s!r}"
    return s


def normalize_spoken_prose(text: str) -> list[str]:
    """Normalize prose (with IPA tokens verbalized and {{word:id}} removed) for Whisper sanity check."""
    s = re.sub(r"\{\{word:[^}]+\}\}", " ", text)
    s = tts_text_for_chunk(s)
    s = s.lower().replace("’", "'").replace("‘", "'").replace("-", " ")
    tokens = re.findall(r"[a-z0-9]+(?:'[a-z]+)?", s)
    out: list[str] = []
    for tok in tokens:
        if tok.isdigit():
            out.extend(int_to_words(int(tok)))
        else:
            out.append(SPELLING_EQUIV.get(tok, tok))
    return out


def strip_punct(word: str) -> str:
    return re.sub(r"^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$", "", word).lower()


def split_say_segments(say: str) -> list[tuple[str, str]]:
    """
    Split a scene's `say` line into ordered ('TEXT', prose_chunk) and ('WORD', word_id) parts.
    Leaves spoken words completely intact while dropping bare punctuation separators between
    consecutive {{word:id}} placeholders.
    """
    parts = re.split(r"(\{\{word:[^}]+\}\})", say)
    items: list[tuple[str, str]] = []
    for p in parts:
        m = re.fullmatch(r"\{\{word:([^}]+)\}\}", p)
        if m:
            items.append(("WORD", m.group(1)))
            continue
        txt = p.strip()
        if not txt:
            continue
        # Only speak chunks containing actual letters/digits/IPA/stress symbols
        if not re.search(r"[A-Za-z0-9/ˈ]", txt):
            continue
        # Remove leading separator punctuation (e.g. ", " or ". ") left after a {{word:id}}
        txt_clean = re.sub(r"^[.,;:\s]+", "", txt).strip()
        if txt_clean:
            items.append(("TEXT", txt_clean))
    return items


def load_english_oral_scenes() -> list[dict]:
    data = json.loads(LESSONS_JSON.read_text(encoding="utf-8"))
    scenes: list[dict] = []
    seen: set[str] = set()
    for lesson in data["lessons"]:
        for sc in list(lesson["scenes"]) + list((lesson.get("pastQuestion") or {}).get("scenes", [])):
            sid = sc["id"]
            assert sid not in seen, f"Duplicate scene id: {sid}"
            seen.add(sid)
            scenes.append(sc)
    assert len(scenes) == 34, f"Expected 34 English Oral scenes, got {len(scenes)}"
    return scenes


def set_seed(seed: int, device_used: str) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if device_used == "mps" and hasattr(torch, "mps") and hasattr(torch.mps, "manual_seed"):
        torch.mps.manual_seed(seed)


def load_chatterbox():
    import torch
    from chatterbox.tts import ChatterboxTTS

    orig_load = torch.load

    def _load(device_str: str):
        def patched(*args, **kwargs):
            ml = kwargs.get("map_location")
            if ml is None or str(ml).startswith("cuda"):
                kwargs["map_location"] = torch.device(device_str)
            return orig_load(*args, **kwargs)

        torch.load = patched
        try:
            t0 = time.perf_counter()
            model = ChatterboxTTS.from_pretrained(device=device_str)
            return model, time.perf_counter() - t0
        finally:
            torch.load = orig_load

    if torch.backends.mps.is_available():
        try:
            model, sec = _load("mps")
            return model, "mps", sec
        except Exception as exc:
            print(f"MPS load failed ({type(exc).__name__}: {exc}); falling back to CPU", flush=True)
    model, sec = _load("cpu")
    return model, "cpu", sec


def generate_chatterbox_chunk(
    model,
    device_used: str,
    text: str,
    exaggeration: float,
    cfg_weight: float,
    seed: int,
) -> tuple[np.ndarray, float]:
    import torch

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if device_used == "mps" and hasattr(torch, "mps") and hasattr(torch.mps, "manual_seed"):
        torch.mps.manual_seed(seed)

    t0 = time.perf_counter()
    wav = model.generate(text, exaggeration=exaggeration, cfg_weight=cfg_weight)
    if device_used == "mps":
        torch.mps.synchronize()
    gen_sec = time.perf_counter() - t0
    arr = wav.squeeze().detach().cpu().numpy().astype(np.float32)
    if not np.isfinite(arr).all() or arr.size == 0 or float(np.max(np.abs(arr))) < 1e-4:
        raise RuntimeError(f"Generated invalid/silent audio for {text!r}")
    return arr, gen_sec


def _snap_to_valley(arr: np.ndarray, sr: int, target_sec: float, radius_ms: int = 45) -> int:
    """Find the lowest-RMS 10ms frame within +/- radius_ms of target_sec."""
    center = int(round(target_sec * sr))
    rad = int(sr * radius_ms / 1000)
    win = max(1, int(sr * 0.010))
    hop = max(1, int(sr * 0.002))
    lo = max(0, center - rad)
    hi = min(len(arr) - win, center + rad)
    if hi <= lo:
        return max(0, min(len(arr), center))
    best_pos = center
    best_rms = float("inf")
    for pos in range(lo, hi + 1, hop):
        rms = float(np.sqrt(np.mean(arr[pos : pos + win] ** 2)))
        if rms < best_rms:
            best_rms = rms
            best_pos = pos + win // 2
    return max(0, min(len(arr), best_pos))


def synthesize_carrier_connector(
    model,
    device_used: str,
    whisper_model,
    connector: str,
    exaggeration: float,
    cfg_weight: float,
    chunk_wav_path: Path,
    seeds: tuple[int, ...] = (42, 1337, 2025, 7777),
) -> tuple[np.ndarray, float, dict]:
    """
    Synthesize a short 1-3 word connector inside a natural carrier sentence,
    locate the target words via Whisper word_timestamps, snap boundaries to
    quiet valleys, and verify the sliced clip via Whisper.
    """
    import soundfile as sf

    carrier_text, target_words = CONNECTOR_CARRIERS[connector]
    homophone_map = {"here": "hear", "to": "too", "two": "too"}
    canon = lambda w: homophone_map.get(w, w)
    target_canon = [canon(w) for w in target_words]
    sr = model.sr
    total_sec = 0.0
    best_arr = None
    best_heard = ""
    best_ratio = -1.0

    for seed in seeds:
        arr_raw, sec = generate_chatterbox_chunk(
            model, device_used, carrier_text, exaggeration, cfg_weight, seed
        )
        total_sec += sec
        trimmed_full = trim_silence(arr_raw, sr, threshold_db=-38.0, lead_ms=40, trail_ms=40)
        sf.write(str(chunk_wav_path), trimmed_full, sr)
        w_res = whisper_model.transcribe(str(chunk_wav_path), fp16=False, language="en", word_timestamps=True)
        w_words = extract_whisper_words(w_res)
        w_norms = [canon(strip_punct(w["word"])) for w in w_words]

        # Find contiguous match of target_canon (after the first carrier word)
        n_t = len(target_canon)
        match_span = None
        for i in range(1, max(1, len(w_norms) - n_t + 1)):
            if w_norms[i : i + n_t] == target_canon:
                match_span = (w_words[i]["startMs"] / 1000.0, w_words[i + n_t - 1]["endMs"] / 1000.0)
                break
        if match_span is None:
            print(f"    [carrier miss] {connector!r} seed={seed}: heard={w_res['text']!r}", flush=True)
            continue

        s0 = _snap_to_valley(trimmed_full, sr, max(0.0, match_span[0] - 0.005), radius_ms=30)
        s1 = _snap_to_valley(trimmed_full, sr, min(len(trimmed_full) / sr, match_span[1] + 0.020), radius_ms=35)
        if s1 <= s0 + int(0.08 * sr):
            continue

        sliced = trim_silence(trimmed_full[s0:s1].copy(), sr, threshold_db=-45.0, lead_ms=25, trail_ms=40)
        dur_sec = len(sliced) / float(sr)
        if not (0.12 <= dur_sec <= 1.45):
            print(f"    [carrier dur={dur_sec:.2f}s] {connector!r} seed={seed}", flush=True)
            continue

        # Re-verify the sliced clip directly with Whisper
        sf.write(str(chunk_wav_path), sliced, sr)
        v_res = whisper_model.transcribe(str(chunk_wav_path), fp16=False, language="en")
        v_heard = v_res["text"].strip()
        v_norms = [canon(w) for w in normalize_spoken_prose(v_heard)]
        ratio = difflib.SequenceMatcher(None, target_canon, v_norms, autojunk=False).ratio()

        if ratio > best_ratio:
            best_ratio = ratio
            best_arr = sliced
            best_heard = v_heard

        if ratio >= 0.99:
            break

    if best_arr is None:
        raise RuntimeError(f"Failed to extract clean carrier connector for {connector!r}")
    return best_arr, total_sec, {"heard": best_heard, "score": round(best_ratio, 3), "carrier": carrier_text}


def synthesize_text_chunk(
    model,
    device_used: str,
    whisper_model,
    chunk_text: str,
    exaggeration: float,
    cfg_weight: float,
    chunk_wav_path: Path,
    seeds: tuple[int, ...] = (42, 1337, 2025, 9001),
) -> tuple[np.ndarray, float, dict]:
    """
    Generate and trim a text chunk with Chatterbox using TTS-friendly IPA verbalization.
    Short connectors in CONNECTOR_CARRIERS are extracted from carrier sentences.
    """
    import soundfile as sf

    if chunk_text in CONNECTOR_CARRIERS:
        return synthesize_carrier_connector(
            model, device_used, whisper_model, chunk_text, exaggeration, cfg_weight, chunk_wav_path
        )

    tts_text = tts_text_for_chunk(chunk_text)
    exp_words = normalize_spoken_prose(chunk_text)
    is_short = len(tts_text.split()) <= 3
    max_attempts = len(seeds) if is_short else 2

    best_arr = None
    best_score = -1.0
    best_heard = ""
    total_sec = 0.0

    for attempt_idx in range(max_attempts):
        seed = seeds[attempt_idx]
        arr_raw, sec = generate_chatterbox_chunk(
            model, device_used, tts_text, exaggeration, cfg_weight, seed
        )
        total_sec += sec
        trimmed = trim_silence(arr_raw, model.sr, threshold_db=-38.0, lead_ms=30, trail_ms=45)
        dur_sec = len(trimmed) / float(model.sr)

        # Write temporary wav for Whisper verification
        sf.write(str(chunk_wav_path), trimmed, model.sr)
        w_res = whisper_model.transcribe(str(chunk_wav_path), fp16=False, language="en")
        heard = w_res["text"].strip()
        heard_words = normalize_spoken_prose(heard)

        if exp_words:
            ratio = difflib.SequenceMatcher(None, exp_words, heard_words, autojunk=False).ratio()
        else:
            ratio = 1.0

        sane_dur = (not is_short) or (dur_sec <= 1.8)
        score = ratio + (0.5 if sane_dur else -0.5)

        if score > best_score:
            best_score = score
            best_arr = trimmed
            best_heard = heard

        if ratio >= 0.99 and sane_dur:
            break

    assert best_arr is not None
    return best_arr, total_sec, {"heard": best_heard, "score": round(best_score, 3)}


def extract_whisper_words(w_res: dict) -> list[dict]:
    words: list[dict] = []
    for seg in w_res.get("segments", []):
        for w in seg.get("words", []):
            raw = str(w.get("word", "")).strip()
            if not raw:
                continue
            start_ms = int(round(float(w.get("start", 0.0)) * 1000))
            end_ms = int(round(float(w.get("end", 0.0)) * 1000))
            words.append({"word": raw, "startMs": start_ms, "endMs": end_ms})
    return words


def extract_beat_timings(scene: dict, duration_ms: int, whisper_words: list[dict]) -> tuple[list[dict], list[dict]]:
    """
    Align each beat word in scene['beats'] to Whisper word timestamps.
    Matches beat words ignoring trailing/leading punctuation so e.g. 'steady' matches 'steady.'.
    """
    say_tokens = scene["say"].strip().split()
    say_norms = [strip_punct(t) for t in say_tokens]
    whisper_norms = [strip_punct(w["word"]) for w in whisper_words]

    # Build aligned map from non-placeholder say tokens -> whisper word index
    # Filter out {{word:id}} and IPA tokens when doing sequence matching
    prose_indices = [
        i for i, t in enumerate(say_tokens)
        if not t.startswith("{{word:") and not (t.startswith("/") and t.rstrip(".,!?").endswith("/")) and say_norms[i]
    ]
    prose_norms = [SPELLING_EQUIV.get(say_norms[i], say_norms[i]) for i in prose_indices]
    heard_norms = [SPELLING_EQUIV.get(wn, wn) for wn in whisper_norms]

    sm = difflib.SequenceMatcher(None, prose_norms, heard_norms, autojunk=False)
    say_idx_to_w_idx: dict[int, int] = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                say_idx_to_w_idx[prose_indices[i1 + k]] = j1 + k
        elif tag == "replace" and (i2 - i1) == 1 and (j2 - j1) == 1:
            if difflib.SequenceMatcher(None, prose_norms[i1], heard_norms[j1]).ratio() >= 0.72:
                say_idx_to_w_idx[prose_indices[i1]] = j1

    prev_say_idx = -1
    prev_w_idx = -1
    positions: list[dict] = []
    missing_beats: list[dict] = []

    for beat in scene["beats"]:
        beat_word = beat["word"]
        beat_norm = SPELLING_EQUIV.get(strip_punct(beat_word), strip_punct(beat_word))

        # Find exact or punctuation-stripped token index in say_tokens
        exact_idx = None
        for idx in range(prev_say_idx + 1, len(say_tokens)):
            if say_tokens[idx] == beat_word or strip_punct(say_tokens[idx]) == strip_punct(beat_word):
                exact_idx = idx
                break
        if exact_idx is None:
            raise ValueError(f"Beat word {beat_word!r} not found in {scene['id']} after index {prev_say_idx}")

        matched_w_idx = say_idx_to_w_idx.get(exact_idx)
        if matched_w_idx is not None and matched_w_idx <= prev_w_idx:
            matched_w_idx = None

        if matched_w_idx is None:
            cands = [
                wi for wi in range(prev_w_idx + 1, len(whisper_words))
                if heard_norms[wi] == beat_norm
            ]
            if cands:
                matched_w_idx = cands[0]
            else:
                fuzzy = [
                    wi for wi in range(prev_w_idx + 1, len(whisper_words))
                    if difflib.SequenceMatcher(None, heard_norms[wi], beat_norm).ratio() >= 0.78
                ]
                if fuzzy:
                    matched_w_idx = fuzzy[0]

        if matched_w_idx is not None:
            t_ms = max(0, min(duration_ms, whisper_words[matched_w_idx]["startMs"]))
            prev_w_idx = matched_w_idx
            positions.append({"word": beat_word, "index": exact_idx, "time": t_ms})
        else:
            positions.append({"word": beat_word, "index": exact_idx, "time": None})

        prev_say_idx = exact_idx

    # Interpolate any missing beat
    anchor_idx = 0
    anchor_time = 0
    for i, pos in enumerate(positions):
        if pos["time"] is not None:
            anchor_idx = pos["index"]
            anchor_time = pos["time"]
        else:
            nxt = next((p for p in positions[i + 1 :] if p["time"] is not None), None)
            end_idx = nxt["index"] if nxt is not None else len(say_tokens)
            end_time = nxt["time"] if nxt is not None else duration_ms
            denom = max(1, end_idx - anchor_idx)
            est = anchor_time + (end_time - anchor_time) * (pos["index"] - anchor_idx) / denom
            est_int = max(0, min(duration_ms, int(round(est))))
            pos["time"] = est_int
            missing_beats.append({"sceneId": scene["id"], "word": pos["word"], "estimatedAtMs": est_int})

    # Strictly rising within [0, duration_ms]
    n = len(positions)
    for i in range(n):
        t = max(0, min(duration_ms, int(positions[i]["time"])))
        if i > 0 and t <= positions[i - 1]["time"]:
            t = min(duration_ms, positions[i - 1]["time"] + 1)
        positions[i]["time"] = t
    for i in range(n - 2, -1, -1):
        if positions[i]["time"] >= positions[i + 1]["time"]:
            positions[i]["time"] = max(0, positions[i + 1]["time"] - 1)

    return [{"word": p["word"], "atMs": int(p["time"])} for p in positions], missing_beats


def build_combined_lessons_manifest(
    existing_non_oral: list[dict],
    oral_scenes: list[dict],
    scenes_state: dict[str, dict],
) -> dict:
    entries = list(existing_non_oral)
    for sc in oral_scenes:
        sid = sc["id"]
        st = scenes_state.get(sid)
        if not st or not st.get("done"):
            continue
        entries.append({
            "sceneId": sid,
            "durationMs": st["durationMs"],
            "beats": st["beats"],
            "inserts": st["inserts"],
        })
    return {"scenes": entries}


def run_narration_mode(
    ref_arg: str,
    exaggeration: float = 0.6,
    cfg_weight: float = 0.4,
    no_resume: bool = False,
    scene_filter: str = "",
) -> int:
    import soundfile as sf
    import whisper

    ref_wav = Path(ref_arg) if Path(ref_arg).is_absolute() else ROOT / ref_arg
    if not ref_wav.exists():
        raise FileNotFoundError(f"Missing reference WAV: {ref_wav}")

    LESSONS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    manifest_path = LESSONS_OUT_DIR / "manifest.json"
    state_path = STATE_DIR / "narration_state.json"

    # Preserve any non-english-oral scenes already in manifest.json
    existing_non_oral: list[dict] = []
    if manifest_path.exists():
        prev_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        prev_scenes = prev_manifest if isinstance(prev_manifest, list) else prev_manifest.get("scenes", [])
        existing_non_oral = [s for s in prev_scenes if not str(s.get("sceneId", "")).startswith("english-oral-")]

    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {"scenes": {}, "chunkCache": {}}
    scenes_state: dict[str, dict] = state.setdefault("scenes", {})

    all_scenes = load_english_oral_scenes()
    target_scenes = all_scenes
    if scene_filter:
        target_scenes = [s for s in all_scenes if s["id"] == scene_filter]
        if not target_scenes:
            raise ValueError(f"Unknown scene id: {scene_filter}")

    pending: list[dict] = []
    for sc in target_scenes:
        sid = sc["id"]
        st = scenes_state.get(sid, {})
        webm_path = LESSONS_OUT_DIR / f"{sid}.webm"
        already_done = (
            not no_resume
            and st.get("done") is True
            and webm_path.exists()
            and webm_path.stat().st_size > 0
            and st.get("say") == sc["say"]
        )
        if not already_done:
            pending.append(sc)

    print(f"English Oral scenes: {len(target_scenes)} | Pending: {len(pending)}", flush=True)

    chunk_cache_dir = STATE_DIR / "chunk_cache"
    chunk_cache_dir.mkdir(parents=True, exist_ok=True)
    tmp_chunk_wav = STATE_DIR / "tmp_chunk.wav"
    tmp_scene_wav = STATE_DIR / "tmp_scene.wav"

    batch_start = time.perf_counter()
    if pending:
        print("Loading Whisper small.en on CPU...", flush=True)
        whisper_model = whisper.load_model("small.en", device="cpu")

        print("Loading ChatterboxTTS...", flush=True)
        model, device_used, load_sec = load_chatterbox()
        print(f"Chatterbox loaded on {device_used} in {load_sec:.2f}s (sr={model.sr})", flush=True)
        print(f"Calling prepare_conditionals() ONCE for {ref_wav} (exaggeration={exaggeration})...", flush=True)
        model.prepare_conditionals(str(ref_wav), exaggeration=exaggeration)
        state["deviceUsed"] = device_used
        atomic_write_json(state_path, state)

        sr = model.sr
        silence_600 = np.zeros(int(round(0.600 * sr)), dtype=np.float32)

        for pos, sc in enumerate(pending, 1):
            sid = sc["id"]
            say = sc["say"]
            items = split_say_segments(say)
            out_path = LESSONS_OUT_DIR / f"{sid}.webm"

            audio_parts: list[np.ndarray] = []
            inserts: list[dict] = []
            cursor_samples = 0
            scene_gen_sec = 0.0
            chunk_logs: list[dict] = []

            for kind, val in items:
                if kind == "WORD":
                    at_ms = int(round(cursor_samples * 1000.0 / sr))
                    inserts.append({"wordId": val, "atMs": at_ms})
                    audio_parts.append(silence_600)
                    cursor_samples += len(silence_600)
                else:
                    # Cache short connector chunks (<= 2 words, pure ASCII) across scenes
                    is_cacheable = len(val.split()) <= 2 and val.isascii() and "/" not in val
                    cache_key = re.sub(r"[^a-zA-Z0-9]+", "_", val).strip("_").lower()
                    cache_wav = chunk_cache_dir / f"{cache_key}.wav"

                    if is_cacheable and cache_wav.exists():
                        arr_chunk, c_sr = sf.read(str(cache_wav), dtype="float32")
                        assert c_sr == sr
                        c_info = {"cached": True}
                    else:
                        arr_chunk, c_sec, c_info = synthesize_text_chunk(
                            model, device_used, whisper_model, val, exaggeration, cfg_weight, tmp_chunk_wav
                        )
                        scene_gen_sec += c_sec
                        if is_cacheable:
                            sf.write(str(cache_wav), arr_chunk, sr)

                    audio_parts.append(arr_chunk)
                    cursor_samples += len(arr_chunk)
                    chunk_logs.append({"text": val, **c_info})

            full_arr = np.concatenate(audio_parts) if audio_parts else np.zeros(int(0.2 * sr), dtype=np.float32)
            sf.write(str(tmp_scene_wav), full_arr, sr)
            encode_opus_webm(tmp_scene_wav, out_path)

            dur_ms = ffprobe_duration_ms(out_path)
            size_bytes = out_path.stat().st_size
            lead_ms, trail_ms = measure_silence_ms(out_path)

            # Clamp insert atMs within [0, dur_ms] and verify strictly rising
            for i, ins in enumerate(inserts):
                ins["atMs"] = max(0, min(dur_ms, ins["atMs"]))
                if i > 0 and ins["atMs"] <= inserts[i - 1]["atMs"]:
                    ins["atMs"] = min(dur_ms, inserts[i - 1]["atMs"] + 1)

            w_res = whisper_model.transcribe(str(out_path), fp16=False, language="en", word_timestamps=True)
            w_text = w_res["text"].strip()
            whisper_words = extract_whisper_words(w_res)
            beats_out, missing_beats = extract_beat_timings(sc, dur_ms, whisper_words)

            exp_prose = normalize_spoken_prose(say)
            heard_prose = normalize_spoken_prose(w_text)
            prose_ratio = difflib.SequenceMatcher(None, exp_prose, heard_prose, autojunk=False).ratio()

            scenes_state[sid] = {
                "done": True,
                "say": say,
                "durationMs": dur_ms,
                "bytes": size_bytes,
                "leadSilenceMs": lead_ms,
                "trailSilenceMs": trail_ms,
                "genSec": round(scene_gen_sec, 3),
                "whisperText": w_text,
                "proseRatio": round(prose_ratio, 3),
                "beats": beats_out,
                "missingBeats": missing_beats,
                "inserts": inserts,
                "chunks": chunk_logs,
            }

            atomic_write_json(state_path, state)
            atomic_write_json(manifest_path, build_combined_lessons_manifest(existing_non_oral, all_scenes, scenes_state))

            ends_with_word = items and items[-1][0] == "WORD"
            sil_warn = lead_ms >= 150.0 or (not ends_with_word and trail_ms >= 150.0)
            tags = []
            if missing_beats:
                tags.append(f"MISSING_BEATS={len(missing_beats)}")
            if sil_warn:
                tags.append(f"SIL_WARN=({lead_ms:.0f},{trail_ms:.0f})")
            if prose_ratio < 0.85:
                tags.append(f"WHISPER_RATIO={prose_ratio:.2f}")
            tag_str = (" [" + " ".join(tags) + "]") if tags else ""
            print(
                f"[{pos:2d}/{len(pending)}] {sid:18s} gen={scene_gen_sec:5.2f}s dur={dur_ms:5d}ms "
                f"bytes={size_bytes:6d} inserts={len(inserts)} beats={len(beats_out)} sil=({lead_ms:.0f},{trail_ms:.0f}){tag_str}",
                flush=True,
            )

    manifest_payload = build_combined_lessons_manifest(existing_non_oral, all_scenes, scenes_state)
    atomic_write_json(manifest_path, manifest_payload)

    wall_sec = time.perf_counter() - batch_start
    completed = [scenes_state[s["id"]] for s in target_scenes if scenes_state.get(s["id"], {}).get("done")]
    total_bytes = sum(st["bytes"] for st in completed)
    print(f"\nNarration summary: {len(completed)}/{len(target_scenes)} scenes, {total_bytes:,} bytes, wall={wall_sec:.1f}s")
    return 0


# ---------------------------------------------------------------------------
# Part 4: Offline mobile-friendly teacher check page
# ---------------------------------------------------------------------------

def run_check_page_mode() -> int:
    words = json.loads(WORDS_JSON.read_text(encoding="utf-8"))
    VOICE_TRIAL_DIR.mkdir(parents=True, exist_ok=True)

    csv_by_id: dict[str, dict] = {}
    if CSV_PATH.exists():
        with CSV_PATH.open("r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                csv_by_id[row["id"]] = row

    whisper_by_id: dict[str, dict] = {}
    w_path = STATE_DIR / "words_whisper.json"
    if w_path.exists():
        w_data = json.loads(w_path.read_text(encoding="utf-8"))
        for row in w_data.get("results", []):
            whisper_by_id[row["id"]] = row

    items_payload: list[dict] = []
    for item in words:
        wid = item["id"]
        webm_path = WORDS_OUT_DIR / f"{wid}.webm"
        if not webm_path.exists():
            raise FileNotFoundError(f"Missing word audio for check page: {webm_path}")
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
  <title>English Oral Words — Teacher Check ({len(items_payload)} words)</title>
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
    .row-head {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      flex-wrap: wrap;
    }}
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
      <h1>English Oral Forms — British Model Words Check</h1>
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
    const STORAGE_KEY = 'jp-english-oral-words-check-v1';
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
        lessonTag.textContent = item.lesson.replace('english-oral-', 'Lesson ');
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
    CHECK_HTML_PATH.write_text(html_doc, encoding="utf-8")
    print(f"Wrote {CHECK_HTML_PATH} ({CHECK_HTML_PATH.stat().st_size:,} bytes, {len(items_payload)} words)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate English Oral Forms audio and teacher check page")
    parser.add_argument("--mode", required=True, choices=["words", "whisper-words", "narration", "check-page"])
    parser.add_argument("--ids", default="", help="Comma-separated word IDs for --mode words / whisper-words")
    parser.add_argument("--ref", default="/Users/mo/jp-pilot/voice-samples/reference.wav")
    parser.add_argument("--exaggeration", type=float, default=0.6)
    parser.add_argument("--cfg-weight", type=float, default=0.4)
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--scene", default="")
    args = parser.parse_args()

    ids_filter = {x.strip() for x in args.ids.split(",") if x.strip()} if args.ids else None

    if args.mode == "words":
        return run_words_mode(ids_filter)
    if args.mode == "whisper-words":
        return run_whisper_words_mode(ids_filter)
    if args.mode == "narration":
        return run_narration_mode(args.ref, args.exaggeration, args.cfg_weight, args.no_resume, args.scene)
    if args.mode == "check-page":
        return run_check_page_mode()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
