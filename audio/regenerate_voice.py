#!/usr/bin/env python3
"""
Resumable per-subject voice regeneration script using Chatterbox TTS + Whisper verification.

Usage:
  PYTORCH_ENABLE_MPS_FALLBACK=1 ~/venvs/chatterbox/bin/python audio/regenerate_voice.py --subject chemistry
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
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
MANIFEST_PATH = ROOT / "audio" / "manifest.json"
SPOKEN_PATH = ROOT / "audio" / "spoken.json"
PUBLIC_DIR = ROOT / "app" / "public"
DATA_DIR = ROOT / "data"

SUBJECT_ALIASES = {
    "chem": "chemistry",
    "chemistry": "chemistry",
    "phys": "physics",
    "physics": "physics",
    "math": "mathematics",
    "maths": "mathematics",
    "mathematics": "mathematics",
    "biol": "biology",
    "biology": "biology",
    "acct": "accounting",
    "accounting": "accounting",
    "comm": "commerce",
    "commerce": "commerce",
    "comp": "computer",
    "computer": "computer",
    "econ": "economics",
    "economics": "economics",
    "geog": "geography",
    "geography": "geography",
    "all": "all",
}

QID_PREFIX_TO_SUBJECT = {
    "chem": "chemistry",
    "phys": "physics",
    "math": "mathematics",
    "biol": "biology",
    "acct": "accounting",
    "comm": "commerce",
    "comp": "computer",
    "econ": "economics",
    "geog": "geography",
}

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
}

ROMAN_ELEMENTS = {"iron", "copper", "lead", "tin", "manganese", "chromium", "mercury", "cobalt", "nickel"}
ROMAN_MAP = {"i": "one", "ii": "two", "iii": "three", "iv": "four", "v": "five", "vi": "six"}


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
        return int_to_words(int(tok))
    return [tok]


def normalize_for_compare(text: str) -> list[str]:
    s = text.lower().replace("’", "'").replace("‘", "'")
    s = s.replace("%", " percent ")
    s = s.replace("°c", " degrees celsius ").replace("°", " degrees ")
    s = s.replace("m/s²", " metres per second squared ").replace("m/s^2", " metres per second squared ")
    s = s.replace("dm³", " cubic decimetres ").replace("cm³", " cubic centimetres ")
    s = re.sub(r"(\d+)\s*-\s*(\d+)", r"\1 \2", s)
    s = s.replace("-", " ")
    raw_tokens = re.findall(r"[a-z0-9]+(?:'[a-z]+)?(?:\.[0-9]+)?", s)
    out: list[str] = []
    for i, tok in enumerate(raw_tokens):
        if tok in ROMAN_MAP and i > 0 and raw_tokens[i - 1] in ROMAN_ELEMENTS:
            out.append(ROMAN_MAP[tok])
            continue
        if re.fullmatch(r"\d+(?:\.\d+)?", tok):
            out.extend(number_token_to_words(tok))
            continue
        mapped = SPELLING_EQUIV.get(tok, tok)
        out.extend(mapped.split())
    cleaned: list[str] = []
    for idx, w in enumerate(out):
        if w == "and" and idx > 0 and out[idx - 1] in {"hundred", "thousand"}:
            continue
        cleaned.append(w)
    return cleaned


def compare_transcript(expected: str, heard: str) -> dict:
    exp_words = normalize_for_compare(expected)
    heard_words = normalize_for_compare(heard)
    sm = difflib.SequenceMatcher(None, exp_words, heard_words)
    ratio = sm.ratio()
    if exp_words == heard_words:
        return {"match": True, "diff": "", "ratio": 1.0, "opcodes": []}
    parts = []
    opcodes = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        exp_chunk = " ".join(exp_words[i1:i2]) or "∅"
        heard_chunk = " ".join(heard_words[j1:j2]) or "∅"
        parts.append(f"{tag}: [{exp_chunk}] -> [{heard_chunk}]")
        opcodes.append((tag, exp_chunk, heard_chunk))
    return {"match": False, "diff": "; ".join(parts), "ratio": ratio, "opcodes": opcodes}


def clean_whisper_prompt_text(text: str) -> str:
    s = " ".join(text.strip().split())
    s = s.replace("°C", " degrees Celsius").replace("°", " degrees")
    s = s.replace("%", " percent")
    return s


def canonical_subject_from_filename(fname: str) -> str:
    stem = fname.replace("animations-", "").replace(".json", "")
    if stem.endswith("-jamb"):
        stem = stem[:-5]
    return SUBJECT_ALIASES.get(stem, stem)


def load_animation_catalog() -> tuple[dict[str, str], dict[str, dict]]:
    """Returns (anim_id -> canonical subject, anim_id -> animation dict)."""
    id_to_subject: dict[str, str] = {}
    id_to_anim: dict[str, dict] = {}

    root_anim_file = DATA_DIR / "animations.json"
    if root_anim_file.exists():
        data = json.loads(root_anim_file.read_text(encoding="utf-8"))
        for anim in data.get("animations", []):
            aid = anim["id"]
            qid = str(anim.get("questionId", ""))
            prefix = qid.split("-")[0].lower()
            subj = QID_PREFIX_TO_SUBJECT.get(prefix, "unknown")
            id_to_subject[aid] = subj
            id_to_anim[aid] = anim

    subjects_dir = DATA_DIR / "subjects"
    if subjects_dir.exists():
        for path in sorted(subjects_dir.glob("animations-*.json")):
            subj = canonical_subject_from_filename(path.name)
            data = json.loads(path.read_text(encoding="utf-8"))
            for anim in data.get("animations", []):
                aid = anim["id"]
                id_to_subject[aid] = subj
                id_to_anim[aid] = anim

    return id_to_subject, id_to_anim


def git_show_bytes(ref_path: str) -> bytes | None:
    res = subprocess.run(["git", "show", ref_path], capture_output=True)
    if res.returncode == 0:
        return res.stdout
    return None


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
    gen_sec = time.perf_counter() - t0
    arr = wav.squeeze().detach().cpu().numpy().astype(np.float32)
    if not np.isfinite(arr).all() or arr.size == 0 or float(np.max(np.abs(arr))) < 1e-4:
        raise RuntimeError(f"Generated invalid/silent audio (size={arr.size})")
    return arr, gen_sec


def main() -> int:
    parser = argparse.ArgumentParser(description="Resumable per-subject Chatterbox voice regenerator")
    parser.add_argument("--subject", required=True, help="Subject name (e.g. chemistry, physics, mathematics, biology, all)")
    parser.add_argument("--ref", default="voice-samples/reference.wav", help="Reference WAV path")
    parser.add_argument("--exaggeration", type=float, default=0.6)
    parser.add_argument("--cfg-weight", type=float, default=0.4)
    parser.add_argument("--voice-name", default="chatterbox-charon")
    parser.add_argument("--base-seed", type=int, default=42)
    parser.add_argument("--retry-seed", type=int, default=1337)
    parser.add_argument("--state-dir", default="/tmp/jp-regen-voice")
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    subject = SUBJECT_ALIASES.get(args.subject.strip().lower())
    if not subject:
        raise ValueError(f"Unknown subject: {args.subject}")

    ref_wav = ROOT / args.ref
    if not ref_wav.exists():
        raise FileNotFoundError(f"Missing reference WAV: {ref_wav}")

    state_dir = Path(args.state_dir)
    state_dir.mkdir(parents=True, exist_ok=True)
    state_path = state_dir / f"state_{subject}.json"
    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {"clips": {}}
    clips_state: dict[str, dict] = state.setdefault("clips", {})

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    spoken_json = json.loads(SPOKEN_PATH.read_text(encoding="utf-8")) if SPOKEN_PATH.exists() else {}
    id_to_subject, id_to_anim = load_animation_catalog()

    target_entries: list[tuple[int, dict]] = []
    for idx, clip in enumerate(manifest["clips"]):
        aid = clip["animationId"]
        clip_subj = id_to_subject.get(aid, "unknown")
        if subject == "all" or clip_subj == subject:
            target_entries.append((idx, clip))

    if args.limit > 0:
        target_entries = target_entries[: args.limit]

    print(f"Subject '{subject}': {len(target_entries)} target clips in audio/manifest.json", flush=True)
    if not target_entries:
        return 0

    print("Loading Whisper small.en on CPU...", flush=True)
    whisper_model = whisper.load_model("small.en", device="cpu")

    # Step A: Resolve beforeBytes and spokenText from origin/main or data JSON before touching clips
    orig_tmp_webm = state_dir / "orig_af_heart.webm"
    resolved_count = 0
    for _, clip in target_entries:
        rel_path = clip["path"]
        entry = clips_state.setdefault(rel_path, {})
        if "beforeBytes" not in entry:
            raw_orig = git_show_bytes(f"origin/main:app/public/{rel_path}")
            if raw_orig is not None:
                entry["beforeBytes"] = len(raw_orig)
            else:
                local_file = PUBLIC_DIR / rel_path
                entry["beforeBytes"] = local_file.stat().st_size if local_file.exists() else 0

        if "spokenText" not in entry:
            aid = clip["animationId"]
            step = clip["step"]
            is_teach = rel_path.startswith("audio/teach/")
            anim = id_to_anim.get(aid, {})
            arr = anim.get("teach", []) if is_teach else anim.get("steps", [])
            st = next((s for s in arr if s["n"] == step), None)
            json_narr = st["narration"] if st else ""

            if not is_teach and aid in spoken_json and 1 <= step <= len(spoken_json[aid]):
                cand = spoken_json[aid][step - 1]
                if hashlib.sha256(cand.encode("utf-8")).hexdigest() == clip["lineSha256"]:
                    entry["spokenText"] = cand
                    entry["textSource"] = "spoken.json"

            if "spokenText" not in entry and json_narr:
                if hashlib.sha256(json_narr.encode("utf-8")).hexdigest() == clip["lineSha256"]:
                    entry["spokenText"] = json_narr
                    entry["textSource"] = "data_json"

            if "spokenText" not in entry:
                raw_orig = git_show_bytes(f"origin/main:app/public/{rel_path}")
                if raw_orig is None:
                    raw_orig = (PUBLIC_DIR / rel_path).read_bytes()
                orig_tmp_webm.write_bytes(raw_orig)
                w_res = whisper_model.transcribe(
                    str(orig_tmp_webm),
                    fp16=False,
                    language="en",
                    initial_prompt=json_narr or None,
                )
                heard_orig = clean_whisper_prompt_text(w_res["text"])
                entry["spokenText"] = heard_orig
                entry["afHeartWhisper"] = w_res["text"].strip()
                entry["textSource"] = "whisper_af_heart"
            resolved_count += 1
            atomic_write_json(state_path, state)

    if resolved_count:
        print(f"Resolved spoken text for {resolved_count} clip(s); saved state to {state_path}", flush=True)

    # Filter clips needing generation
    pending: list[tuple[int, dict]] = []
    for idx, clip in target_entries:
        rel_path = clip["path"]
        entry = clips_state[rel_path]
        out_path = PUBLIC_DIR / rel_path
        already_done = (
            not args.no_resume
            and entry.get("done") is True
            and out_path.exists()
            and out_path.stat().st_size > 0
            and clip.get("voice") == args.voice_name
        )
        if not already_done:
            pending.append((idx, clip))

    print(f"Pending clips to generate: {len(pending)} / {len(target_entries)}", flush=True)

    gen_wav = state_dir / "gen.wav"
    tmp_webm_1 = state_dir / "attempt1.webm"
    tmp_webm_2 = state_dir / "attempt2.webm"

    batch_start = time.perf_counter()
    if pending:
        print("Loading ChatterboxTTS...", flush=True)
        model, device_used, load_sec = load_chatterbox()
        print(f"Chatterbox loaded on {device_used} in {load_sec:.2f}s (sr={model.sr})", flush=True)
        print(f"Calling prepare_conditionals() ONCE for {ref_wav} (exaggeration={args.exaggeration})...", flush=True)
        model.prepare_conditionals(str(ref_wav), exaggeration=args.exaggeration)
        state["deviceUsed"] = device_used
        atomic_write_json(state_path, state)

        for pos, (manifest_idx, clip) in enumerate(pending, 1):
            rel_path = clip["path"]
            entry = clips_state[rel_path]
            text = entry["spokenText"]
            out_path = PUBLIC_DIR / rel_path
            out_path.parent.mkdir(parents=True, exist_ok=True)

            # Attempt 1
            arr1, gen_sec1 = generate_audio(
                model, device_used, text, args.exaggeration, args.cfg_weight, args.base_seed
            )
            sf.write(str(gen_wav), arr1, model.sr)
            encode_opus_webm(gen_wav, tmp_webm_1)
            w1 = whisper_model.transcribe(str(tmp_webm_1), fp16=False, language="en")["text"].strip()
            cmp1 = compare_transcript(text, w1)

            chosen_webm = tmp_webm_1
            chosen_w = w1
            chosen_cmp = cmp1
            chosen_gen_sec = gen_sec1
            retried = False
            ok_like_af = False
            af_diff = ""

            if not cmp1["match"]:
                # Check if af_heart had the exact same mismatch when spokenText wasn't from af_heart
                if entry.get("textSource") != "whisper_af_heart":
                    if "afHeartWhisper" not in entry:
                        raw_orig = git_show_bytes(f"origin/main:app/public/{rel_path}")
                        if raw_orig is not None:
                            orig_tmp_webm.write_bytes(raw_orig)
                            entry["afHeartWhisper"] = whisper_model.transcribe(
                                str(orig_tmp_webm), fp16=False, language="en"
                            )["text"].strip()
                    if entry.get("afHeartWhisper"):
                        af_cmp = compare_transcript(text, entry["afHeartWhisper"])
                        af_diff = af_cmp["diff"]
                        if not af_cmp["match"] and cmp1["opcodes"] == af_cmp["opcodes"]:
                            ok_like_af = True

            if not cmp1["match"] and not ok_like_af:
                retried = True
                arr2, gen_sec2 = generate_audio(
                    model, device_used, text, args.exaggeration, args.cfg_weight, args.retry_seed
                )
                sf.write(str(gen_wav), arr2, model.sr)
                encode_opus_webm(gen_wav, tmp_webm_2)
                w2 = whisper_model.transcribe(str(tmp_webm_2), fp16=False, language="en")["text"].strip()
                cmp2 = compare_transcript(text, w2)
                if cmp2["match"] or cmp2["ratio"] > cmp1["ratio"]:
                    chosen_webm = tmp_webm_2
                    chosen_w = w2
                    chosen_cmp = cmp2
                    chosen_gen_sec = gen_sec1 + gen_sec2

            os.replace(chosen_webm, out_path)
            dur_ms = ffprobe_duration_ms(out_path)
            after_bytes = out_path.stat().st_size

            manifest["clips"][manifest_idx]["voice"] = args.voice_name
            manifest["clips"][manifest_idx]["durationMs"] = dur_ms

            still_failing = (not chosen_cmp["match"]) and (not ok_like_af)
            entry.update({
                "done": True,
                "afterBytes": after_bytes,
                "durationMs": dur_ms,
                "genSec": round(chosen_gen_sec, 3),
                "whisperText": chosen_w,
                "whisperMatch": chosen_cmp["match"],
                "whisperDiff": chosen_cmp["diff"],
                "retried": retried,
                "okLikeAfHeart": ok_like_af,
                "afHeartDiff": af_diff,
                "stillFailing": still_failing,
            })

            atomic_write_json(MANIFEST_PATH, manifest)
            atomic_write_json(state_path, state)

            status = "OK" if chosen_cmp["match"] else ("OK_AF" if ok_like_af else "FAIL")
            retry_tag = " [RETRIED]" if retried else ""
            print(
                f"[{pos}/{len(pending)}] {rel_path} {status}{retry_tag} "
                f"gen={chosen_gen_sec:.2f}s dur={dur_ms}ms "
                f"bytes={entry['beforeBytes']}->{after_bytes}",
                flush=True,
            )
            if still_failing:
                print(f"    expected: {text!r}", flush=True)
                print(f"    whisper : {chosen_w!r} ({chosen_cmp['diff']})", flush=True)

    wall_sec = time.perf_counter() - batch_start

    # Summary across all target entries
    before_total = sum(clips_state[c["path"]]["beforeBytes"] for _, c in target_entries)
    after_total = sum(clips_state[c["path"]]["afterBytes"] for _, c in target_entries)
    total_gen = sum(clips_state[c["path"]].get("genSec", 0.0) for _, c in target_entries)
    retried_list = [c["path"] for _, c in target_entries if clips_state[c["path"]].get("retried")]
    failing_list = [
        (c["path"], clips_state[c["path"]]["spokenText"], clips_state[c["path"]]["whisperText"], clips_state[c["path"]]["whisperDiff"])
        for _, c in target_entries
        if clips_state[c["path"]].get("stillFailing")
    ]
    ok_af_list = [
        (c["path"], clips_state[c["path"]]["whisperDiff"])
        for _, c in target_entries
        if clips_state[c["path"]].get("okLikeAfHeart")
    ]

    print("\n=== SUMMARY ===", flush=True)
    print(f"Subject: {subject} | Clips done: {len(target_entries)}", flush=True)
    print(f"Before bytes: {before_total:,} ({before_total / 1024:.1f} KB / {before_total / (1024*1024):.2f} MB)", flush=True)
    print(f"After  bytes: {after_total:,} ({after_total / 1024:.1f} KB / {after_total / (1024*1024):.2f} MB)", flush=True)
    pct = (after_total / before_total * 100.0) if before_total else 0.0
    print(f"Size ratio  : {pct:.1f}%", flush=True)
    print(f"Wall time   : {wall_sec:.1f}s ({wall_sec/60:.2f} min) | Sum genSec: {total_gen:.1f}s | Avg genSec/clip: {total_gen/len(target_entries):.2f}s", flush=True)
    print(f"Retried     : {len(retried_list)}", flush=True)
    print(f"Matched af_heart diff (OK): {len(ok_af_list)} {ok_af_list}", flush=True)
    print(f"Still failing Whisper: {len(failing_list)}", flush=True)
    for p, exp, got, diff in failing_list:
        print(f"  FAIL {p}: diff={diff} | exp={exp!r} | got={got!r}", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
