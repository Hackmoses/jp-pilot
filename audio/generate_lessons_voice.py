#!/usr/bin/env python3
"""
Resumable Charon voice generator & beat-timestamp aligner for the 10 JP concept lessons (61 scenes).

Usage:
  PYTORCH_ENABLE_MPS_FALLBACK=1 ~/venvs/chatterbox/bin/python audio/generate_lessons_voice.py \
      --ref /Users/mo/jp-pilot/voice-samples/reference.wav
"""

from __future__ import annotations

import argparse
import difflib
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
import soundfile as sf
import torch
import whisper
from chatterbox.tts import ChatterboxTTS

ROOT = Path(__file__).resolve().parent.parent
LESSON_FILES = [
    ROOT / "lessons-bank" / "physics-12-waves.json",
    ROOT / "lessons-bank" / "chemistry-2-mole.json",
]
DEFAULT_OUT_DIR = ROOT / "app" / "public" / "audio" / "lessons"

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
    "meters": "metres",
    "meter": "metre",
    "centimeters": "centimetres",
    "centimeter": "centimetre",
    "decimeters": "decimetres",
    "decimeter": "decimetre",
    "liters": "litres",
    "liter": "litre",
    "liter's": "litre's",
    "sulphur": "sulfur",
    "aluminium": "aluminum",
    "oxides": "oxide's",
    "mole": "moles",
    "mol": "moles",
    "ph": "p h",
    "stp": "s t p",
    "jam": "jamb",
}

PROPER_NAME_WORDS = {"avogadro", "danfo", "jamb", "kelvin", "celsius", "hertz"}
ROMAN_ELEMENTS = {"iron", "copper", "lead", "tin", "manganese", "chromium", "mercury", "cobalt", "nickel"}
ROMAN_MAP = {"i": "one", "ii": "two", "iii": "three", "iv": "four", "v": "five", "vi": "six"}

TTS_RESPELL_RULES: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bPeriod\b"), "Peeriud"),
    (re.compile(r"\bperiod\b"), "peeriud"),
    (re.compile(r"\bRarefaction\b"), "Rareifaction"),
    (re.compile(r"\brarefaction\b"), "rareifaction"),
    (re.compile(r"\bJAMB\b"), "Jamb"),
]


def apply_tts_respellings(text: str) -> str:
    """Respell known TTS trouble words for Chatterbox input without altering displayed lesson text."""
    out = text
    for pattern, replacement in TTS_RESPELL_RULES:
        out = pattern.sub(replacement, out)
    return out


def int_to_words(n: int) -> list[str]:
    if n < 0:
        return ["minus"] + int_to_words(-n)
    if n < 20:
        return [ONES[n]]
    if n < 100:
        t, r = divmod(n, 10)
        return [TENS[t * 10]] + ([ONES[r]] if r else [])
    if n < 1000:
        h, r = divmod(n, 100)
        words = [ONES[h], "hundred"]
        if r:
            words.extend(int_to_words(r))
        return words
    if n < 1_000_000:
        k, r = divmod(n, 1000)
        words = int_to_words(k) + ["thousand"]
        if r:
            words.extend(int_to_words(r))
        return words
    return [str(n)]


def number_token_to_words(tok: str) -> list[str]:
    if "." in tok:
        parts = tok.split(".")
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            left = int_to_words(int(parts[0]))
            right = [ONES[int(d)] for d in parts[1]]
            return left + ["point"] + right
    if tok.isdigit():
        val = int(tok)
        if 2010 <= val <= 2029:
            return ["twenty"] + int_to_words(val - 2000)
        return int_to_words(val)
    return [tok]


def preprocess_text_for_norm(text: str) -> str:
    s = text.lower().replace("’", "'").replace("‘", "'")
    s = re.sub(r"(\d),(\d{3})\b", r"\1\2", s)
    s = re.sub(r"(?<!\d)\.(\d+)", r"0.\1", s)
    s = re.sub(r"(\d)\s*[×x]\s*(\d)", r"\1 times \2", s)
    s = re.sub(r"\b10\^23\b", " ten to the power of twenty three ", s)
    s = re.sub(r"\bs\.?\s*t\.?\s*p\.?\b", " s t p ", s)
    s = s.replace("%", " percent ")
    s = s.replace("°c", " degrees celsius ").replace("°", " degrees ")
    s = s.replace("m/s²", " metres per second squared ").replace("m/s^2", " metres per second squared ")
    s = s.replace("dm³", " cubic decimetres ").replace("cm³", " cubic centimetres ")
    s = re.sub(r"(\d+)\s*-\s*(\d+)", r"\1 \2", s)
    s = s.replace("-", " ")
    return s


def expand_raw_token(tok: str, prev_raw: str | None) -> list[str]:
    if tok in ROMAN_MAP and prev_raw in ROMAN_ELEMENTS:
        return [ROMAN_MAP[tok]]
    if re.fullmatch(r"\d+(?:\.\d+)?", tok):
        return number_token_to_words(tok)
    mapped = SPELLING_EQUIV.get(tok, tok)
    return mapped.split()


def normalize_for_compare(text: str) -> list[str]:
    s = preprocess_text_for_norm(text)
    raw_tokens = re.findall(r"[a-z0-9]+(?:'[a-z]+)?(?:\.[0-9]+)?", s)
    out: list[str] = []
    for i, tok in enumerate(raw_tokens):
        prev = raw_tokens[i - 1] if i > 0 else None
        out.extend(expand_raw_token(tok, prev))
    cleaned: list[str] = []
    for idx, w in enumerate(out):
        if w == "and" and idx > 0 and out[idx - 1] in {"hundred", "thousand"}:
            continue
        cleaned.append(w)
    return cleaned


def is_trailing_zero_diff(words_a: list[str], words_b: list[str], i1: int, i2: int, j1: int, j2: int) -> bool:
    """Allow '0.4' vs '0.40' where only a trailing 'zero' differs after 'point'."""
    if i2 - i1 == 1 and j2 - j1 == 0 and words_a[i1] == "zero":
        return i1 >= 2 and "point" in words_a[max(0, i1 - 4):i1]
    if j2 - j1 == 1 and i2 - i1 == 0 and words_b[j1] == "zero":
        return j1 >= 2 and "point" in words_b[max(0, j1 - 4):j1]
    return False


def is_acceptable_name_diff(exp_chunk: list[str], heard_chunk: list[str]) -> bool:
    if len(exp_chunk) == 1 and len(heard_chunk) == 1:
        e, h = exp_chunk[0], heard_chunk[0]
        if e in PROPER_NAME_WORDS or h in PROPER_NAME_WORDS:
            return difflib.SequenceMatcher(None, e, h).ratio() >= 0.72
    return False


def compare_transcript(expected: str, heard: str) -> dict:
    exp_words = normalize_for_compare(expected)
    heard_words = normalize_for_compare(heard)
    sm = difflib.SequenceMatcher(None, exp_words, heard_words, autojunk=False)
    ratio = sm.ratio()
    if exp_words == heard_words:
        return {
            "match": True,
            "exactMatch": True,
            "diff": "",
            "spellingDiffs": [],
            "ratio": 1.0,
            "opcodes": [],
        }

    hard_parts: list[str] = []
    spelling_diffs: list[str] = []
    opcodes: list[tuple[str, str, str]] = []

    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        exp_sub = exp_words[i1:i2]
        heard_sub = heard_words[j1:j2]
        exp_chunk = " ".join(exp_sub) or "∅"
        heard_chunk = " ".join(heard_sub) or "∅"
        desc = f"{tag}: [{exp_chunk}] -> [{heard_chunk}]"
        if is_trailing_zero_diff(exp_words, heard_words, i1, i2, j1, j2) or is_acceptable_name_diff(exp_sub, heard_sub):
            spelling_diffs.append(desc)
        else:
            hard_parts.append(desc)
            opcodes.append((tag, exp_chunk, heard_chunk))

    return {
        "match": len(hard_parts) == 0,
        "exactMatch": False,
        "diff": "; ".join(hard_parts),
        "spellingDiffs": spelling_diffs,
        "ratio": ratio,
        "opcodes": opcodes,
    }


def normalize_single_beat(word: str) -> str:
    norm = normalize_for_compare(word)
    return " ".join(norm) if norm else word.lower().strip(".,!?;:\"'")


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


def flatten_tokens_with_ptrs(tokens: list[str]) -> tuple[list[str], list[int]]:
    flat: list[str] = []
    ptrs: list[int] = []
    for idx, tok in enumerate(tokens):
        s = preprocess_text_for_norm(tok)
        raw_parts = re.findall(r"[a-z0-9]+(?:'[a-z]+)?(?:\.[0-9]+)?", s)
        tok_expanded: list[str] = []
        for pi, part in enumerate(raw_parts):
            prev = raw_parts[pi - 1] if pi > 0 else None
            tok_expanded.extend(expand_raw_token(part, prev))
        for w in tok_expanded:
            if w == "and" and flat and flat[-1] in {"hundred", "thousand"}:
                continue
            flat.append(w)
            ptrs.append(idx)
    return flat, ptrs


def extract_beat_timings(scene: dict, duration_ms: int, whisper_words: list[dict]) -> tuple[list[dict], list[dict]]:
    """
    Returns (beats_out, missing_beats).
    beats_out: [{"word": str, "atMs": int}, ...] in exact lesson order, strictly rising within [0, duration_ms].
    """
    say_tokens = scene["say"].strip().split()
    beats_in = scene["beats"]

    exp_flat, exp_ptrs = flatten_tokens_with_ptrs(say_tokens)
    heard_tokens = [w["word"] for w in whisper_words]
    heard_flat, heard_ptrs = flatten_tokens_with_ptrs(heard_tokens)

    sm = difflib.SequenceMatcher(None, exp_flat, heard_flat, autojunk=False)
    say_idx_to_whisper: dict[int, tuple[int, str]] = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                s_idx = exp_ptrs[i1 + k]
                if s_idx not in say_idx_to_whisper:
                    say_idx_to_whisper[s_idx] = (heard_ptrs[j1 + k], heard_flat[j1 + k])
        elif tag == "replace" and (i2 - i1) == 1 and (j2 - j1) == 1:
            if difflib.SequenceMatcher(None, exp_flat[i1], heard_flat[j1]).ratio() >= 0.72:
                s_idx = exp_ptrs[i1]
                if s_idx not in say_idx_to_whisper:
                    say_idx_to_whisper[s_idx] = (heard_ptrs[j1], heard_flat[j1])

    # Precompute normalized form for each whisper word
    whisper_norms = [normalize_single_beat(w["word"]) for w in whisper_words]

    prev_say_idx = -1
    prev_whisper_idx = -1
    positions: list[dict] = []
    missing_beats: list[dict] = []

    for beat in beats_in:
        beat_word = beat["word"]
        exact_idx = say_tokens.index(beat_word, prev_say_idx + 1)
        beat_norm = normalize_single_beat(beat_word)

        matched_w_idx: int | None = None

        # Strategy 1: direct SequenceMatcher alignment for exact_idx
        aligned = say_idx_to_whisper.get(exact_idx)
        if aligned is not None:
            cand_w_idx, cand_norm = aligned
            if cand_w_idx > prev_whisper_idx and (
                cand_norm == beat_norm or difflib.SequenceMatcher(None, cand_norm, beat_norm).ratio() >= 0.72
            ):
                matched_w_idx = cand_w_idx

        # Strategy 2: k-th matching occurrence after prev_whisper_idx
        if matched_w_idx is None:
            k_target = sum(
                1 for t in say_tokens[prev_say_idx + 1 : exact_idx + 1]
                if normalize_single_beat(t) == beat_norm
            )
            k_target = max(1, k_target)
            exact_cands = [
                wi for wi in range(prev_whisper_idx + 1, len(whisper_words))
                if whisper_norms[wi] == beat_norm
            ]
            if len(exact_cands) >= k_target:
                matched_w_idx = exact_cands[k_target - 1]
            elif exact_cands:
                matched_w_idx = exact_cands[0]
            else:
                fuzzy_cands = [
                    wi for wi in range(prev_whisper_idx + 1, len(whisper_words))
                    if difflib.SequenceMatcher(None, whisper_norms[wi], beat_norm).ratio() >= 0.80
                ]
                if len(fuzzy_cands) >= k_target:
                    matched_w_idx = fuzzy_cands[k_target - 1]
                elif fuzzy_cands:
                    matched_w_idx = fuzzy_cands[0]

        if matched_w_idx is not None:
            t_ms = max(0, min(duration_ms, whisper_words[matched_w_idx]["startMs"]))
            prev_whisper_idx = matched_w_idx
            positions.append({"word": beat_word, "index": exact_idx, "time": t_ms, "found": True})
        else:
            positions.append({"word": beat_word, "index": exact_idx, "time": None, "found": False})

        prev_say_idx = exact_idx

    # Fill missing beat times via word-position interpolation (matching lesson.ts beatTimes)
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
            missing_beats.append({
                "sceneId": scene["id"],
                "word": pos["word"],
                "estimatedAtMs": est_int,
                "tokenIndex": pos["index"],
                "totalTokens": len(say_tokens),
            })

    # Enforce strictly rising atMs within [0, duration_ms]
    n = len(positions)
    for i in range(n):
        t = max(0, min(duration_ms, int(positions[i]["time"])))
        if i > 0 and t <= positions[i - 1]["time"]:
            t = min(duration_ms, positions[i - 1]["time"] + 1)
        positions[i]["time"] = t
    # Backward pass in case clamping at duration_ms created duplicates
    for i in range(n - 2, -1, -1):
        if positions[i]["time"] >= positions[i + 1]["time"]:
            positions[i]["time"] = max(0, positions[i + 1]["time"] - 1)

    beats_out = [{"word": p["word"], "atMs": int(p["time"])} for p in positions]
    return beats_out, missing_beats


def trim_silence(
    arr: np.ndarray,
    sr: int,
    threshold_db: float = -38.0,
    lead_ms: int = 35,
    trail_ms: int = 35,
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
    """Decode .webm to 48kHz mono PCM and return (leading_silence_ms, trailing_silence_ms)."""
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
    cmd = [
        "ffmpeg", "-y", "-i", str(wav_path),
        "-c:a", "libopus", "-b:a", "16k", "-ac", "1", "-ar", "48000",
        "-application", "voip",
        str(webm_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)


def unique_failed_path(failed_dir: Path, name: str) -> Path:
    cand = failed_dir / name
    if not cand.exists():
        return cand
    stem = cand.stem
    suffix = cand.suffix
    idx = 2
    while (failed_dir / f"{stem}-v{idx}{suffix}").exists():
        idx += 1
    return failed_dir / f"{stem}-v{idx}{suffix}"


def atomic_write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def set_seed(seed: int, device_used: str) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if device_used == "mps" and hasattr(torch, "mps") and hasattr(torch.mps, "manual_seed"):
        torch.mps.manual_seed(seed)


def load_chatterbox() -> tuple[ChatterboxTTS, str, float]:
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


def generate_audio(
    model: ChatterboxTTS,
    device_used: str,
    text: str,
    exaggeration: float,
    cfg_weight: float,
    seed: int,
) -> tuple[np.ndarray, float]:
    set_seed(seed, device_used)
    t0 = time.perf_counter()
    wav = model.generate(text, exaggeration=exaggeration, cfg_weight=cfg_weight)
    if device_used == "mps":
        torch.mps.synchronize()
    gen_sec = time.perf_counter() - t0
    arr = wav.squeeze().detach().cpu().numpy().astype(np.float32)
    if not np.isfinite(arr).all() or arr.size == 0 or float(np.max(np.abs(arr))) < 1e-4:
        raise RuntimeError(f"Generated invalid/silent audio (size={arr.size})")
    return arr, gen_sec


def load_all_scenes() -> list[dict]:
    scenes: list[dict] = []
    seen_ids: set[str] = set()
    for path in LESSON_FILES:
        data = json.loads(path.read_text(encoding="utf-8"))
        for lesson in data["lessons"]:
            lesson_scenes = list(lesson["scenes"]) + list((lesson.get("pastQuestion") or {}).get("scenes", []))
            for sc in lesson_scenes:
                sid = sc["id"]
                assert sid not in seen_ids, f"Duplicate scene id: {sid}"
                seen_ids.add(sid)
                scenes.append(sc)
    assert len(scenes) == 61, f"Expected 61 scenes, found {len(scenes)}"
    return scenes


def build_manifest(
    all_scenes: list[dict],
    scenes_state: dict[str, dict],
    existing_entries: dict[str, dict] | None = None,
) -> dict:
    entries: list[dict] = []
    for sc in all_scenes:
        sid = sc["id"]
        st = scenes_state.get(sid)
        if st and st.get("done"):
            entries.append({
                "sceneId": sid,
                "durationMs": st["durationMs"],
                "beats": st["beats"],
            })
        elif existing_entries and sid in existing_entries:
            entries.append(existing_entries[sid])
    return {"scenes": entries}


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Charon voice & beat-timed manifest for 10 concept lessons")
    parser.add_argument("--ref", default="voice-samples/reference.wav", help="Reference WAV path")
    parser.add_argument("--exaggeration", type=float, default=0.6)
    parser.add_argument("--cfg-weight", type=float, default=0.4)
    parser.add_argument("--base-seed", type=int, default=42)
    parser.add_argument("--retry-seed", type=int, default=1337)
    parser.add_argument("--extra-seeds", default="", help="Comma-separated additional fallback seeds if retry-seed fails")
    parser.add_argument("--state-dir", default="/tmp/jp-lessons-voice")
    parser.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR))
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--scene", default="", help="Only process one scene ID")
    parser.add_argument("--scenes", default="", help="Comma-separated list of scene IDs to process")
    parser.add_argument("--lead-ms", type=int, default=35)
    parser.add_argument("--trail-ms", type=int, default=35)
    args = parser.parse_args()

    ref_wav = Path(args.ref) if Path(args.ref).is_absolute() else ROOT / args.ref
    if not ref_wav.exists():
        raise FileNotFoundError(f"Missing reference WAV: {ref_wav}")

    out_dir = Path(args.out_dir) if Path(args.out_dir).is_absolute() else ROOT / args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.json"
    existing_manifest_entries: dict[str, dict] = {}
    if manifest_path.exists():
        existing_data = json.loads(manifest_path.read_text(encoding="utf-8"))
        for entry in existing_data.get("scenes", []):
            existing_manifest_entries[entry["sceneId"]] = entry

    state_dir = Path(args.state_dir)
    state_dir.mkdir(parents=True, exist_ok=True)
    failed_dir = state_dir / "failed"
    failed_dir.mkdir(parents=True, exist_ok=True)
    state_path = state_dir / "state.json"
    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {"scenes": {}}
    scenes_state: dict[str, dict] = state.setdefault("scenes", {})

    all_scenes = load_all_scenes()
    target_scenes = all_scenes
    if args.scene:
        target_scenes = [s for s in all_scenes if s["id"] == args.scene]
        if not target_scenes:
            raise ValueError(f"Unknown scene id: {args.scene}")
    elif args.scenes:
        wanted = [s.strip() for s in args.scenes.split(",") if s.strip()]
        by_id = {s["id"]: s for s in all_scenes}
        unknown = [sid for sid in wanted if sid not in by_id]
        if unknown:
            raise ValueError(f"Unknown scene ids: {unknown}")
        target_scenes = [by_id[sid] for sid in wanted]
    if args.limit > 0:
        target_scenes = target_scenes[: args.limit]

    pending: list[dict] = []
    for sc in target_scenes:
        sid = sc["id"]
        st = scenes_state.get(sid, {})
        webm_path = out_dir / f"{sid}.webm"
        tts_text = apply_tts_respellings(sc["say"])
        already_done = (
            not args.no_resume
            and st.get("done") is True
            and webm_path.exists()
            and webm_path.stat().st_size > 0
            and st.get("say") == sc["say"]
            and st.get("ttsText", sc["say"]) == tts_text
        )
        if not already_done:
            pending.append(sc)

    print(f"Total target scenes: {len(target_scenes)} | Pending: {len(pending)}", flush=True)

    gen_wav = state_dir / "gen.wav"
    tmp_webm_1 = state_dir / "attempt1.webm"
    tmp_webm_2 = state_dir / "attempt2.webm"

    batch_start = time.perf_counter()
    if pending:
        print("Loading Whisper small.en on CPU...", flush=True)
        whisper_model = whisper.load_model("small.en", device="cpu")

        print("Loading ChatterboxTTS...", flush=True)
        model, device_used, load_sec = load_chatterbox()
        print(f"Chatterbox loaded on {device_used} in {load_sec:.2f}s (sr={model.sr})", flush=True)
        print(f"Calling prepare_conditionals() ONCE for {ref_wav} (exaggeration={args.exaggeration})...", flush=True)
        model.prepare_conditionals(str(ref_wav), exaggeration=args.exaggeration)
        state["deviceUsed"] = device_used
        atomic_write_json(state_path, state)

        for pos, sc in enumerate(pending, 1):
            sid = sc["id"]
            text = sc["say"]
            tts_text = apply_tts_respellings(text)
            out_path = out_dir / f"{sid}.webm"

            # Attempt 1 + retries across candidate seeds
            candidate_seeds = [args.base_seed, args.retry_seed] + [
                int(s.strip()) for s in args.extra_seeds.split(",") if s.strip()
            ]
            chosen_webm: Path | None = None
            chosen_w_res: dict = {}
            chosen_w_text = ""
            chosen_cmp: dict = {}
            chosen_gen_sec = 0.0
            chosen_seed = args.base_seed
            retried = False
            failed_attempts: list[dict] = list(scenes_state.get(sid, {}).get("failedAttempts", []))

            for attempt_num, cand_seed in enumerate(candidate_seeds, 1):
                if attempt_num > 1:
                    retried = True
                arr, gen_sec = generate_audio(
                    model, device_used, tts_text, args.exaggeration, args.cfg_weight, cand_seed
                )
                trimmed = trim_silence(arr, model.sr, lead_ms=args.lead_ms, trail_ms=args.trail_ms)
                sf.write(str(gen_wav), trimmed, model.sr)
                cand_webm = state_dir / f"attempt{attempt_num}.webm"
                encode_opus_webm(gen_wav, cand_webm)
                w_res = whisper_model.transcribe(str(cand_webm), fp16=False, language="en", word_timestamps=True)
                w_text = w_res["text"].strip()
                cmp_res = compare_transcript(text, w_text)
                chosen_gen_sec += gen_sec

                if chosen_webm is None:
                    chosen_webm = cand_webm
                    chosen_w_res = w_res
                    chosen_w_text = w_text
                    chosen_cmp = cmp_res
                    chosen_seed = cand_seed
                elif cmp_res["match"] or (not chosen_cmp["match"] and cmp_res["ratio"] > chosen_cmp["ratio"]):
                    fail_copy = unique_failed_path(failed_dir, f"{sid}-attempt{attempt_num - 1}-seed{chosen_seed}.webm")
                    os.replace(chosen_webm, fail_copy)
                    failed_attempts.append({
                        "attempt": attempt_num - 1,
                        "seed": chosen_seed,
                        "path": str(fail_copy),
                        "whisperText": chosen_w_text,
                        "diff": chosen_cmp["diff"],
                    })
                    chosen_webm = cand_webm
                    chosen_w_res = w_res
                    chosen_w_text = w_text
                    chosen_cmp = cmp_res
                    chosen_seed = cand_seed
                else:
                    fail_copy = unique_failed_path(failed_dir, f"{sid}-attempt{attempt_num}-seed{cand_seed}.webm")
                    os.replace(cand_webm, fail_copy)
                    failed_attempts.append({
                        "attempt": attempt_num,
                        "seed": cand_seed,
                        "path": str(fail_copy),
                        "whisperText": w_text,
                        "diff": cmp_res["diff"],
                    })

                if chosen_cmp["match"]:
                    break

            assert chosen_webm is not None

            if not chosen_cmp["match"]:
                # Keep a copy of the final chosen clip in failed_dir as well if it still failed Whisper
                fail_copy = unique_failed_path(failed_dir, f"{sid}-chosen-seed{chosen_seed}.webm")
                fail_copy.write_bytes(chosen_webm.read_bytes())
                failed_attempts.append({
                    "attempt": "chosen",
                    "seed": chosen_seed,
                    "path": str(fail_copy),
                    "whisperText": chosen_w_text,
                    "diff": chosen_cmp["diff"],
                })

            os.replace(chosen_webm, out_path)
            dur_ms = ffprobe_duration_ms(out_path)
            size_bytes = out_path.stat().st_size
            lead_ms, trail_ms = measure_silence_ms(out_path)

            whisper_words = extract_whisper_words(chosen_w_res)
            beats_out, missing_beats = extract_beat_timings(sc, dur_ms, whisper_words)

            scenes_state[sid] = {
                "done": True,
                "say": text,
                "ttsText": tts_text,
                "seed": chosen_seed,
                "durationMs": dur_ms,
                "bytes": size_bytes,
                "leadSilenceMs": lead_ms,
                "trailSilenceMs": trail_ms,
                "genSec": round(chosen_gen_sec, 3),
                "whisperText": chosen_w_text,
                "whisperMatch": chosen_cmp["match"],
                "whisperExactMatch": chosen_cmp["exactMatch"],
                "whisperDiff": chosen_cmp["diff"],
                "spellingDiffs": chosen_cmp["spellingDiffs"],
                "retried": retried,
                "failedAttempts": failed_attempts,
                "beats": beats_out,
                "missingBeats": missing_beats,
            }

            atomic_write_json(state_path, state)
            atomic_write_json(manifest_path, build_manifest(all_scenes, scenes_state, existing_manifest_entries))

            status = "OK" if chosen_cmp["match"] else "FAIL"
            retry_tag = " [RETRIED]" if retried else ""
            miss_tag = f" [MISSING_BEATS={len(missing_beats)}]" if missing_beats else ""
            print(
                f"[{pos}/{len(pending)}] {sid} {status}{retry_tag}{miss_tag} "
                f"gen={chosen_gen_sec:.2f}s dur={dur_ms}ms bytes={size_bytes} "
                f"sil=({lead_ms:.0f}ms,{trail_ms:.0f}ms)",
                flush=True,
            )
            print(f"    ttsText : {tts_text!r}", flush=True)
            print(f"    whisper : {chosen_w_text!r}", flush=True)
            if chosen_cmp["spellingDiffs"]:
                print(f"    spelling-diffs: {chosen_cmp['spellingDiffs']}", flush=True)
            if not chosen_cmp["match"]:
                print(f"    diff    : {chosen_cmp['diff']}", flush=True)
            if missing_beats:
                print(f"    missing beats: {missing_beats}", flush=True)

    # Always ensure manifest is up to date from state
    manifest_payload = build_manifest(all_scenes, scenes_state, existing_manifest_entries)
    atomic_write_json(manifest_path, manifest_payload)

    wall_sec = time.perf_counter() - batch_start
    completed = [scenes_state[s["id"]] for s in target_scenes if scenes_state.get(s["id"], {}).get("done")]
    total_bytes = sum(st["bytes"] for st in completed)
    total_gen = sum(st.get("genSec", 0.0) for st in completed)
    retried_ids = [s["id"] for s in target_scenes if scenes_state.get(s["id"], {}).get("retried")]
    failing = [
        (s["id"], scenes_state[s["id"]]["whisperDiff"], scenes_state[s["id"]]["say"], scenes_state[s["id"]]["whisperText"])
        for s in target_scenes
        if scenes_state.get(s["id"], {}).get("done") and not scenes_state[s["id"]]["whisperMatch"]
    ]
    all_missing = [
        m
        for s in target_scenes
        for m in scenes_state.get(s["id"], {}).get("missingBeats", [])
    ]
    silence_over = [
        (s["id"], scenes_state[s["id"]]["leadSilenceMs"], scenes_state[s["id"]]["trailSilenceMs"])
        for s in target_scenes
        if scenes_state.get(s["id"], {}).get("done")
        and (scenes_state[s["id"]]["leadSilenceMs"] >= 60.0 or scenes_state[s["id"]]["trailSilenceMs"] >= 60.0)
    ]

    print("\n=== SUMMARY ===", flush=True)
    print(f"Clips completed: {len(completed)} / {len(target_scenes)}", flush=True)
    print(f"Total bytes: {total_bytes:,} ({total_bytes / 1024:.1f} KB / {total_bytes / (1024 * 1024):.2f} MB)", flush=True)
    if completed:
        by_dur = sorted(
            [(s["id"], scenes_state[s["id"]]["durationMs"], scenes_state[s["id"]]["bytes"]) for s in target_scenes if scenes_state.get(s["id"], {}).get("done")],
            key=lambda x: x[1],
        )
        print(f"Shortest scene: {by_dur[0][0]} ({by_dur[0][1]} ms, {by_dur[0][2]:,} bytes)", flush=True)
        print(f"Longest  scene: {by_dur[-1][0]} ({by_dur[-1][1]} ms, {by_dur[-1][2]:,} bytes)", flush=True)
        print(f"Wall time: {wall_sec:.1f}s ({wall_sec/60:.2f} min) | Sum genSec: {total_gen:.1f}s", flush=True)
    print(f"Retried: {len(retried_ids)} {retried_ids}", flush=True)
    print(f"Whisper failures remaining: {len(failing)}", flush=True)
    for sid, diff, exp, got in failing:
        print(f"  FAIL {sid}: {diff}\n    exp={exp!r}\n    got={got!r}", flush=True)
    print(f"Missing beat words (word-position estimated): {len(all_missing)}", flush=True)
    for m in all_missing:
        print(f"  MISSING {m['sceneId']}: word={m['word']!r} est_atMs={m['estimatedAtMs']}", flush=True)
    print(f"Silence >= 60ms warnings: {len(silence_over)} {silence_over}", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
