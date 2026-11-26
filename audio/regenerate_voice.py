#!/usr/bin/env python3
"""
Resumable per-subject voice regeneration script using Chatterbox TTS + strict Whisper verification.

Usage:
  PYTORCH_ENABLE_MPS_FALLBACK=1 ~/venvs/chatterbox/bin/python audio/regenerate_voice.py \
    --subject chemistry --spoken-file audio/spoken-chemistry.json
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import random
import re
import shutil
import subprocess
import time
from collections import Counter
from decimal import Decimal, InvalidOperation
from pathlib import Path

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import numpy as np
import soundfile as sf
import torch
import whisper
from chatterbox.tts import ChatterboxTTS

ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / "audio" / "manifest.json"
PUBLIC_DIR = ROOT / "app" / "public"
DATA_DIR = ROOT / "data"

ONES = {
    "zero": 0, "oh": 0, "one": 1, "two": 2, "three": 3, "four": 4,
    "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
    "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
}
TENS = {
    "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
    "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
}
SCALE = {"hundred": 100, "thousand": 1000}

SPELLING_EQUIV = {
    "meters": "metres",
    "meter": "metre",
    "liters": "litres",
    "liter": "litre",
    "decimeters": "decimetres",
    "decimeter": "decimetre",
    "centimeters": "centimetres",
    "centimeter": "centimetre",
    "millimeters": "millimetres",
    "millimeter": "millimetre",
    "sulphur": "sulfur",
    "aluminium": "aluminum",
    "ionizes": "ionises",
    "oxide's": "oxide",
    "oxides": "oxide",
    "carbonate's": "carbonate",
    "oxygen's": "oxygen",
    "faraday's": "faradays",
    "faradies": "faradays",
    "farady": "faraday",
    "mol": "moles",
    "mole": "moles",
    "poh": "poh",
    "ph": "ph",
}

UNIT_CANON = {
    "mole": "mole", "moles": "mole", "mol": "mole",
    "gram": "gram", "grams": "gram",
    "decimetre": "decimetre", "decimetres": "decimetre", "decimeter": "decimetre", "decimeters": "decimetre",
    "centimetre": "centimetre", "centimetres": "centimetre", "centimeter": "centimetre", "centimeters": "centimetre",
    "millimetre": "millimetre", "millimetres": "millimetre", "millimeter": "millimetre", "millimeters": "millimetre",
    "metre": "metre", "metres": "metre", "meter": "metre", "meters": "metre",
    "atmosphere": "atmosphere", "atmospheres": "atmosphere", "atm": "atmosphere",
    "kelvin": "kelvin", "kelvins": "kelvin",
    "coulomb": "coulomb", "coulombs": "coulomb",
    "amp": "amp", "amps": "amp", "ampere": "amp", "amperes": "amp",
    "second": "second", "seconds": "second",
    "faraday": "faraday", "faradays": "faraday", "faradies": "faraday", "faraday's": "faraday",
    "percent": "percent",
    "celsius": "celsius",
    "molar": "molar",
    "squared": "squared",
    "cubed": "cubed",
    "cubic": "cubic",
}

CHEM_TERMS = {
    "iron", "oxide", "calcium", "carbonate", "ammonium", "nitrate",
    "copper", "hydrochloric", "acid", "hydrogen", "chloride", "oxygen",
    "nitrogen", "sulfur", "ethane", "steam", "tetraoxosulfate",
    "potassium", "hydroxide", "nickel", "chromium", "dichromate",
    "aluminum", "ammonia", "chlorine", "sodium", "ph", "poh",
}


def canon_decimal(s: str) -> str:
    try:
        d = Decimal(s.replace(",", ""))
    except InvalidOperation:
        return s
    norm = format(d.normalize(), "f")
    if "." in norm:
        norm = norm.rstrip("0").rstrip(".")
    return norm or "0"


def tokenize_basic(text: str, keep_punct: bool = False) -> list[str]:
    s = text.lower().replace("’", "'").replace("‘", "'")
    s = s.replace("%", " percent ")
    s = s.replace("°c", " degrees celsius ").replace("°", " degrees ")
    s = s.replace("²", " squared ").replace("³", " cubed ")
    s = s.replace("ch2o", " c h 2 o ")
    s = re.sub(r"(\d+)\s*-\s*(\d+)", r"\1 \2", s)
    s = re.sub(r"(\d+):(\d+)", r"\1 \2", s)
    s = s.replace("-", " ")
    # Separate number+unit like 10a, 1930s, 2g, 2x
    s = re.sub(r"(\d)([a-z])", r"\1 \2", s)
    pattern = r"[a-z]+(?:'[a-z]+)?|\d+(?:,\d{3})*(?:\.\d+)?|[.,;:]" if keep_punct else r"[a-z]+(?:'[a-z]+)?|\d+(?:,\d{3})*(?:\.\d+)?"
    raw = re.findall(pattern, s)
    out: list[str] = []
    for tok in raw:
        if tok in {".", ",", ";", ":"}:
            out.append(tok)
            continue
        if tok == "p" or tok == "o" or tok == "h":
            out.append(tok)
            continue
        out.append(SPELLING_EQUIV.get(tok, tok))
    # Collapse "p h" -> "ph", "p o h" -> "poh", "tetra oxo sulfate" -> "tetraoxosulfate"
    merged: list[str] = []
    i = 0
    while i < len(out):
        if i + 2 < len(out) and out[i] == "p" and out[i + 1] == "o" and out[i + 2] == "h":
            merged.append("poh")
            i += 3
        elif i + 1 < len(out) and out[i] == "p" and out[i + 1] == "h":
            merged.append("ph")
            i += 2
        elif i + 2 < len(out) and out[i] == "tetra" and out[i + 1] == "oxo" and out[i + 2] == "sulfate":
            merged.append("tetraoxosulfate")
            i += 3
        else:
            merged.append(out[i])
            i += 1
    return merged


def parse_number_words_at(tokens: list[str], idx: int) -> tuple[str, int] | None:
    """Parse spoken English number starting at idx (including decimals like 'zero point five seven nine')."""
    n = len(tokens)
    if idx >= n:
        return None
    t0 = tokens[idx]
    if re.fullmatch(r"\d+(?:,\d{3})*(?:\.\d+)?", t0):
        return canon_decimal(t0), idx + 1

    if t0 not in ONES and t0 not in TENS:
        return None

    current = 0
    total = 0
    j = idx
    saw_word = False
    while j < n:
        w = tokens[j]
        if w in {".", ",", ";", ":"}:
            break
        if w == "and" and saw_word and (current % 100 == 0) and j + 1 < n and (tokens[j + 1] in ONES or tokens[j + 1] in TENS):
            j += 1
            continue
        if w in ONES:
            can_append_ones = (not saw_word) or (current % 100 == 0) or (20 <= (current % 100) <= 90 and (current % 10 == 0) and 1 <= ONES[w] <= 9)
            if not can_append_ones:
                break
            current += ONES[w]
            saw_word = True
            j += 1
        elif w in TENS:
            if saw_word and (current % 100 != 0):
                break
            current += TENS[w]
            saw_word = True
            j += 1
        elif w == "hundred" and saw_word:
            current = (current or 1) * 100
            j += 1
        elif w == "thousand" and saw_word:
            total += (current or 1) * 1000
            current = 0
            j += 1
        else:
            break

    int_val = total + current
    if j < n and tokens[j] == "point" and j + 1 < n and (tokens[j + 1] in ONES or re.fullmatch(r"\d+", tokens[j + 1])):
        j += 1
        frac_digits = []
        while j < n:
            fw = tokens[j]
            if fw in ONES and ONES[fw] < 10:
                frac_digits.append(str(ONES[fw]))
                j += 1
            elif re.fullmatch(r"\d+", fw):
                frac_digits.append(fw)
                j += 1
            else:
                break
        if frac_digits:
            return canon_decimal(f"{int_val}.{''.join(frac_digits)}"), j
    return canon_decimal(str(int_val)), j


def extract_numbers(text: str) -> list[str]:
    tokens = tokenize_basic(text, keep_punct=True)
    nums: list[str] = []
    i = 0
    while i < len(tokens):
        parsed = parse_number_words_at(tokens, i)
        if parsed:
            val, next_i = parsed
            nums.append(val)
            i = next_i
        else:
            i += 1
    return nums


def extract_units(text: str) -> Counter:
    tokens = tokenize_basic(text)
    c = Counter()
    for t in tokens:
        if t in UNIT_CANON:
            c[UNIT_CANON[t]] += 1
    return c


def extract_chem_terms(text: str) -> set[str]:
    tokens = tokenize_basic(text)
    found = {t for t in tokens if t in CHEM_TERMS}
    # Check "gas x", "gas y", "c h 2 o"
    joined = " ".join(tokens)
    for phrase in ("gas x", "gas y", "c h 2 o"):
        if phrase in joined:
            found.add(phrase)
    return found


def normalize_words_for_diff(text: str) -> list[str]:
    tokens = tokenize_basic(text, keep_punct=True)
    out: list[str] = []
    i = 0
    while i < len(tokens):
        if tokens[i] in {".", ",", ";", ":"}:
            i += 1
            continue
        parsed = parse_number_words_at(tokens, i)
        if parsed:
            out.append(parsed[0])
            i = parsed[1]
        elif tokens[i] == "and" and i > 0 and tokens[i - 1] in {"hundred", "thousand"}:
            i += 1
        else:
            out.append(tokens[i])
            i += 1
    return out


def strict_verify(spoken_line: str, step_text: str, heard_text: str) -> dict:
    exp_nums = extract_numbers(spoken_line)
    step_nums = extract_numbers(step_text)
    # Sanity: spokenLine numbers must match stepText numbers (except if stepText used 'half' -> keep consistent)
    heard_nums = extract_numbers(heard_text)

    exp_units = extract_units(spoken_line)
    heard_units = extract_units(heard_text)

    exp_chem = extract_chem_terms(spoken_line)
    heard_chem = extract_chem_terms(heard_text)

    exp_words = normalize_words_for_diff(spoken_line)
    heard_words = normalize_words_for_diff(heard_text)
    ratio = difflib.SequenceMatcher(None, exp_words, heard_words).ratio()

    reasons = []
    if exp_nums != heard_nums:
        reasons.append(f"number_mismatch: exp={exp_nums} heard={heard_nums}")
    if exp_units != heard_units:
        # Allow minor pluralization already canonized; report exact missing/extra
        missing_u = list((exp_units - heard_units).elements())
        extra_u = list((heard_units - exp_units).elements())
        if missing_u or extra_u:
            reasons.append(f"unit_mismatch: missing={missing_u} extra={extra_u}")
    missing_c = sorted(exp_chem - heard_chem)
    if missing_c:
        reasons.append(f"formula_or_term_missing: {missing_c}")

    word_diff = ""
    if exp_words != heard_words:
        sm = difflib.SequenceMatcher(None, exp_words, heard_words)
        parts = []
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                continue
            parts.append(f"{tag}: [{' '.join(exp_words[i1:i2]) or '∅'}] -> [{' '.join(heard_words[j1:j2]) or '∅'}]")
        word_diff = "; ".join(parts)

    strict_ok = len(reasons) == 0
    exact_words_ok = strict_ok and (exp_words == heard_words)
    return {
        "strictOk": strict_ok,
        "exactWordsOk": exact_words_ok,
        "reasons": reasons,
        "wordDiff": word_diff,
        "ratio": ratio,
        "expNums": exp_nums,
        "stepNums": step_nums,
        "heardNums": heard_nums,
    }


def git_show_bytes(ref_path: str) -> bytes | None:
    res = subprocess.run(["git", "show", ref_path], capture_output=True)
    return res.stdout if res.returncode == 0 else None


def restore_from_origin_main(rel_path: str, orig_manifest_entry: dict, manifest_entry: dict) -> int:
    raw = git_show_bytes(f"origin/main:app/public/{rel_path}")
    out_path = PUBLIC_DIR / rel_path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if raw is not None:
        out_path.write_bytes(raw)
    manifest_entry["voice"] = orig_manifest_entry["voice"]
    manifest_entry["durationMs"] = orig_manifest_entry["durationMs"]
    manifest_entry["lineSha256"] = orig_manifest_entry["lineSha256"]
    return out_path.stat().st_size


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
        "-c:a", "libopus", "-b:a", "32k", "-ac", "1", "-ar", "48000",
        "-vbr", "on", "-application", "voip",
        str(webm_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)


def atomic_write_json(path: Path, payload: dict) -> None:
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
        torch.mps.empty_cache()
    gen_sec = time.perf_counter() - t0
    arr = wav.squeeze().detach().cpu().numpy().astype(np.float32)
    if not np.isfinite(arr).all() or arr.size == 0 or float(np.max(np.abs(arr))) < 1e-4:
        raise RuntimeError(f"Generated invalid/silent audio (size={arr.size})")
    return arr, gen_sec


def main() -> int:
    parser = argparse.ArgumentParser(description="Resumable voice regenerator from clean spoken JSON")
    parser.add_argument("--subject", required=True, help="Target subject (e.g. chemistry)")
    parser.add_argument("--spoken-file", required=True, help="Path to spoken-<subject>.json")
    parser.add_argument("--ref", default="voice-samples/reference.wav")
    parser.add_argument("--exaggeration", type=float, default=0.6)
    parser.add_argument("--cfg-weight", type=float, default=0.4)
    parser.add_argument("--voice-name", default="chatterbox-charon")
    parser.add_argument("--base-seed", type=int, default=42)
    parser.add_argument("--retry-seed", type=int, default=1337)
    parser.add_argument("--state-dir", default="/tmp/jp-regen-voice-v2")
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    subject = args.subject.strip().lower()
    ref_wav = ROOT / args.ref
    if not ref_wav.exists():
        raise FileNotFoundError(f"Missing reference WAV: {ref_wav}")

    spoken_doc = json.loads((ROOT / args.spoken_file).read_text(encoding="utf-8"))
    spoken_clips = spoken_doc["clips"]
    if args.limit > 0:
        spoken_clips = spoken_clips[: args.limit]

    orig_manifest_raw = git_show_bytes("origin/main:audio/manifest.json")
    if orig_manifest_raw is None:
        raise RuntimeError("Could not read origin/main:audio/manifest.json")
    orig_manifest = json.loads(orig_manifest_raw.decode("utf-8"))
    orig_by_path = {c["path"]: c for c in orig_manifest["clips"]}

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest_by_path = {c["path"]: c for c in manifest["clips"]}

    state_dir = Path(args.state_dir)
    state_dir.mkdir(parents=True, exist_ok=True)
    state_path = state_dir / f"state_{subject}.json"
    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {"clips": {}}
    clips_state: dict[str, dict] = state.setdefault("clips", {})

    # Restore origin/main lineSha256 and record beforeBytes; restore needsReview clips immediately
    skipped_review = []
    clean_items = []
    for item in spoken_clips:
        rel_path = item["path"]
        orig_entry = orig_by_path[rel_path]
        cur_entry = manifest_by_path[rel_path]
        cur_entry["lineSha256"] = orig_entry["lineSha256"]

        st = clips_state.setdefault(rel_path, {})
        if "beforeBytes" not in st:
            raw_orig = git_show_bytes(f"origin/main:app/public/{rel_path}")
            st["beforeBytes"] = len(raw_orig) if raw_orig is not None else 0

        if item.get("needsReview"):
            after_b = restore_from_origin_main(rel_path, orig_entry, cur_entry)
            st.update({
                "status": "skipped_text_needs_review",
                "stepText": item["stepText"],
                "issues": item.get("issues", []),
                "afterBytes": after_b,
                "durationMs": orig_entry["durationMs"],
                "genSec": 0.0,
            })
            skipped_review.append(item)
        else:
            clean_items.append(item)

    atomic_write_json(MANIFEST_PATH, manifest)
    atomic_write_json(state_path, state)
    print(
        f"Subject '{subject}': total={len(spoken_clips)}, clean={len(clean_items)}, "
        f"skipped_needs_review={len(skipped_review)}",
        flush=True,
    )

    pending = []
    verified_cache: dict[str, Path] = {}
    cache_dir = state_dir / "verified_cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    for item in clean_items:
        rel_path = item["path"]
        st = clips_state[rel_path]
        cur_entry = manifest_by_path[rel_path]
        out_path = PUBLIC_DIR / rel_path
        already_accepted = (
            not args.no_resume
            and st.get("status") in {"passed", "passed_retry"}
            and out_path.exists()
            and out_path.stat().st_size > 0
            and cur_entry.get("voice") == args.voice_name
        )
        if already_accepted:
            verified_cache.setdefault(item["spokenLine"], out_path)
        else:
            pending.append(item)

    print(f"Pending clean clips to process: {len(pending)} / {len(clean_items)}", flush=True)

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

        for pos, item in enumerate(pending, 1):
            rel_path = item["path"]
            step_text = item["stepText"]
            spoken_line = item["spokenLine"]
            orig_entry = orig_by_path[rel_path]
            cur_entry = manifest_by_path[rel_path]
            st = clips_state[rel_path]
            out_path = PUBLIC_DIR / rel_path
            out_path.parent.mkdir(parents=True, exist_ok=True)

            # Reuse identical already-verified spokenLine clip from this run if available
            if spoken_line in verified_cache and verified_cache[spoken_line].exists():
                shutil.copy2(verified_cache[spoken_line], out_path)
                dur_ms = ffprobe_duration_ms(out_path)
                after_bytes = out_path.stat().st_size
                cur_entry["voice"] = args.voice_name
                cur_entry["durationMs"] = dur_ms
                st.update({
                    "status": "passed",
                    "deduped": True,
                    "stepText": step_text,
                    "spokenLine": spoken_line,
                    "afterBytes": after_bytes,
                    "durationMs": dur_ms,
                    "genSec": 0.0,
                    "whisperText": st.get("whisperText", "(copied verified duplicate)"),
                })
                atomic_write_json(MANIFEST_PATH, manifest)
                atomic_write_json(state_path, state)
                print(f"[{pos}/{len(pending)}] {rel_path} DEDUP_OK dur={dur_ms}ms bytes={st['beforeBytes']}->{after_bytes}", flush=True)
                continue

            # Attempt 1
            arr1, gen_sec1 = generate_audio(
                model, device_used, spoken_line, args.exaggeration, args.cfg_weight, args.base_seed
            )
            sf.write(str(gen_wav), arr1, model.sr)
            encode_opus_webm(gen_wav, tmp_webm_1)
            w1 = whisper_model.transcribe(str(tmp_webm_1), fp16=False, language="en")["text"].strip()
            v1 = strict_verify(spoken_line, step_text, w1)

            chosen_w = w1
            chosen_v = v1
            chosen_webm = tmp_webm_1
            total_gen_sec = gen_sec1
            retried = False

            if not v1["exactWordsOk"]:
                retried = True
                arr2, gen_sec2 = generate_audio(
                    model, device_used, spoken_line, args.exaggeration, args.cfg_weight, args.retry_seed
                )
                sf.write(str(gen_wav), arr2, model.sr)
                encode_opus_webm(gen_wav, tmp_webm_2)
                w2 = whisper_model.transcribe(str(tmp_webm_2), fp16=False, language="en")["text"].strip()
                v2 = strict_verify(spoken_line, step_text, w2)
                total_gen_sec += gen_sec2

                if v2["exactWordsOk"] or (v2["strictOk"] and not v1["strictOk"]) or (
                    v2["strictOk"] == v1["strictOk"] and v2["ratio"] > v1["ratio"]
                ):
                    chosen_w = w2
                    chosen_v = v2
                    chosen_webm = tmp_webm_2

            if chosen_v["strictOk"]:
                os.replace(chosen_webm, out_path)
                dur_ms = ffprobe_duration_ms(out_path)
                after_bytes = out_path.stat().st_size
                cur_entry["voice"] = args.voice_name
                cur_entry["durationMs"] = dur_ms
                status_tag = "passed_retry" if retried else "passed"
                verified_cache[spoken_line] = out_path
                st.update({
                    "status": status_tag,
                    "deduped": False,
                    "retried": retried,
                    "stepText": step_text,
                    "spokenLine": spoken_line,
                    "whisperText": chosen_w,
                    "wordDiff": chosen_v["wordDiff"],
                    "reasons": [],
                    "afterBytes": after_bytes,
                    "durationMs": dur_ms,
                    "genSec": round(total_gen_sec, 3),
                })
                note = f" (minor word diff: {chosen_v['wordDiff']})" if chosen_v["wordDiff"] else ""
                print(
                    f"[{pos}/{len(pending)}] {rel_path} {'PASS_RETRY' if retried else 'PASS'} "
                    f"gen={total_gen_sec:.2f}s dur={dur_ms}ms bytes={st['beforeBytes']}->{after_bytes}{note}",
                    flush=True,
                )
            else:
                after_bytes = restore_from_origin_main(rel_path, orig_entry, cur_entry)
                st.update({
                    "status": "rejected_whisper_mismatch",
                    "deduped": False,
                    "retried": retried,
                    "stepText": step_text,
                    "spokenLine": spoken_line,
                    "whisperText": chosen_w,
                    "wordDiff": chosen_v["wordDiff"],
                    "reasons": chosen_v["reasons"],
                    "afterBytes": after_bytes,
                    "durationMs": orig_entry["durationMs"],
                    "genSec": round(total_gen_sec, 3),
                })
                print(
                    f"[{pos}/{len(pending)}] {rel_path} REJECTED_RESTORED_AF_HEART "
                    f"reasons={chosen_v['reasons']} | step={step_text!r} | heard={chosen_w!r}",
                    flush=True,
                )

            atomic_write_json(MANIFEST_PATH, manifest)
            atomic_write_json(state_path, state)

    wall_sec = time.perf_counter() - batch_start

    passed = [c["path"] for c in spoken_clips if clips_state[c["path"]]["status"] in {"passed", "passed_retry"}]
    passed_minor = [
        (c["path"], clips_state[c["path"]]["stepText"], clips_state[c["path"]]["whisperText"], clips_state[c["path"]]["wordDiff"])
        for c in spoken_clips
        if clips_state[c["path"]]["status"] in {"passed", "passed_retry"} and clips_state[c["path"]].get("wordDiff")
    ]
    rejected = [
        (c["path"], clips_state[c["path"]]["stepText"], clips_state[c["path"]]["whisperText"], clips_state[c["path"]]["reasons"])
        for c in spoken_clips
        if clips_state[c["path"]]["status"] == "rejected_whisper_mismatch"
    ]
    before_total = sum(clips_state[c["path"]]["beforeBytes"] for c in spoken_clips)
    after_total = sum(clips_state[c["path"]]["afterBytes"] for c in spoken_clips)
    total_gen = sum(clips_state[c["path"]].get("genSec", 0.0) for c in spoken_clips)

    print("\n=== SUMMARY ===", flush=True)
    print(f"Subject: {subject} | Total: {len(spoken_clips)}", flush=True)
    print(f"Passed & accepted (chatterbox-charon): {len(passed)}", flush=True)
    print(f"Skipped (step text needs review): {len(skipped_review)}", flush=True)
    print(f"Rejected & restored to af_heart (Whisper number/unit/formula fail): {len(rejected)}", flush=True)
    print(f"Before total bytes: {before_total:,} ({before_total / (1024*1024):.2f} MB)", flush=True)
    print(f"After  total bytes: {after_total:,} ({after_total / (1024*1024):.2f} MB) ({after_total / before_total * 100:.1f}%)", flush=True)
    print(f"Wall time: {wall_sec:.1f}s ({wall_sec/60:.2f} min) | Sum genSec: {total_gen:.1f}s", flush=True)
    if rejected:
        print("\nRejected clips (restored to af_heart):", flush=True)
        for p, s_txt, w_txt, rsn in rejected:
            print(f"  {p} | {rsn} | step={s_txt!r} | heard={w_txt!r}", flush=True)
    if passed_minor:
        print("\nPassed strict checks with minor non-numeric word diff:", flush=True)
        for p, s_txt, w_txt, wd in passed_minor:
            print(f"  {p} | {wd} | step={s_txt!r} | heard={w_txt!r}", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
