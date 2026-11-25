#!/usr/bin/env python3
"""
Stage 1 Chatterbox voice audition runner.
Generates 18 clips (6 lines x 3 settings), encodes Opus .webm matching app/public/audio,
runs Whisper transcription & word-match verification, records timings, and builds voice-trial/index.html.
"""

from __future__ import annotations

import difflib
import html
import json
import os
import re
import shutil
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
TRIAL_DIR = ROOT / "voice-trial"
CLIPS_DIR = TRIAL_DIR / "clips"
WAV_TMP_DIR = Path("/tmp/jp-voice-trial-wavs")
REF_WAV = ROOT / "voice-samples" / "reference.wav"
LINES_JSON = TRIAL_DIR / "lines.json"
MANIFEST_JSON = ROOT / "audio" / "manifest.json"
RESULTS_JSON = TRIAL_DIR / "results.json"
INDEX_HTML = TRIAL_DIR / "index.html"

SETTINGS = [
    {
        "id": "default",
        "label": "Default (exag 0.5, cfg 0.5)",
        "kwargs": {},
    },
    {
        "id": "exag035",
        "label": "Exaggeration 0.35",
        "kwargs": {"exaggeration": 0.35},
    },
    {
        "id": "exag060_cfg040",
        "label": "Exaggeration 0.6, CFG 0.4",
        "kwargs": {"exaggeration": 0.6, "cfg_weight": 0.4},
    },
]

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


SPELLING_EQUIV = {
    "meters": "metres",
    "meter": "metre",
    "oxides": "oxide's",
}

ROMAN_MAP = {"ii": "two", "iii": "three", "iv": "four"}


def normalize_for_compare(text: str) -> list[str]:
    s = text.lower().replace("’", "'").replace("‘", "'")
    s = s.replace("m/s²", " metres per second squared ").replace("m/s^2", " metres per second squared ")
    s = re.sub(r"(\d+)\s*-\s*(\d+)", r"\1 \2", s)
    s = s.replace("-", " ")
    # Extract alphanumeric + dot + apostrophe tokens
    raw_tokens = re.findall(r"[a-z0-9]+(?:'[a-z]+)?(?:\.[0-9]+)?", s)
    out: list[str] = []
    for i, tok in enumerate(raw_tokens):
        if tok in ROMAN_MAP and i > 0 and raw_tokens[i - 1] in {"iron", "copper", "lead", "tin"}:
            out.append(ROMAN_MAP[tok])
            continue
        if re.fullmatch(r"\d+(?:\.\d+)?", tok):
            out.extend(number_token_to_words(tok))
            continue
        tok = SPELLING_EQUIV.get(tok, tok)
        out.append(tok)
    # Remove optional "and" immediately after "hundred" / "thousand" so "one hundred and sixty" == "one hundred sixty"
    cleaned: list[str] = []
    for idx, w in enumerate(out):
        if w == "and" and idx > 0 and out[idx - 1] in {"hundred", "thousand"}:
            continue
        cleaned.append(w)
    return cleaned


def compare_transcript(expected: str, heard: str) -> dict:
    exp_words = normalize_for_compare(expected)
    heard_words = normalize_for_compare(heard)
    if exp_words == heard_words:
        return {"match": True, "flagged": False, "diff": "", "expectedWords": exp_words, "heardWords": heard_words}
    sm = difflib.SequenceMatcher(None, exp_words, heard_words)
    parts = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        exp_chunk = " ".join(exp_words[i1:i2]) or "∅"
        heard_chunk = " ".join(heard_words[j1:j2]) or "∅"
        parts.append(f"{tag}: [{exp_chunk}] -> [{heard_chunk}]")
    return {
        "match": False,
        "flagged": True,
        "diff": "; ".join(parts),
        "expectedWords": exp_words,
        "heardWords": heard_words,
    }


def ffprobe_info(path: Path) -> dict:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=codec_name,sample_rate,channels",
        "-of", "json", str(path),
    ]
    res = subprocess.run(cmd, check=True, capture_output=True, text=True)
    data = json.loads(res.stdout)
    fmt = data.get("format", {})
    stream = (data.get("streams") or [{}])[0]
    return {
        "sizeBytes": path.stat().st_size,
        "durationSec": round(float(fmt.get("duration", 0.0)), 3),
        "bitRate": int(float(fmt.get("bit_rate", 0) or 0)),
        "codec": stream.get("codec_name", ""),
        "sampleRate": int(stream.get("sample_rate", 0) or 0),
        "channels": int(stream.get("channels", 0) or 0),
    }


def encode_opus_webm(wav_path: Path, webm_path: Path) -> None:
    cmd = [
        "ffmpeg", "-y", "-i", str(wav_path),
        "-c:a", "libopus", "-b:a", "32k", "-ac", "1", "-ar", "48000",
        "-vbr", "on", "-application", "voip",
        str(webm_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)


def load_chatterbox_with_fallback():
    orig_torch_load = torch.load

    def _load_on_device(device_str: str):
        def patched_load(*args, **kwargs):
            ml = kwargs.get("map_location")
            if ml is None or str(ml).startswith("cuda"):
                kwargs["map_location"] = torch.device(device_str)
            return orig_torch_load(*args, **kwargs)

        torch.load = patched_load
        try:
            t0 = time.perf_counter()
            model = ChatterboxTTS.from_pretrained(device=device_str)
            load_sec = time.perf_counter() - t0
            return model, load_sec
        finally:
            torch.load = orig_torch_load

    if torch.backends.mps.is_available():
        try:
            print("Loading ChatterboxTTS on MPS...", flush=True)
            model, load_sec = _load_on_device("mps")
            return model, "mps", load_sec, None
        except Exception as e:
            err = f"MPS load failed: {type(e).__name__}: {e}"
            print(err, flush=True)
            print("Falling back to CPU...", flush=True)
            model, load_sec = _load_on_device("cpu")
            return model, "cpu", load_sec, err

    model, load_sec = _load_on_device("cpu")
    return model, "cpu", load_sec, "MPS unavailable"


def generate_one(model, device_used: str, text: str, ref_wav: Path, kwargs: dict):
    t0 = time.perf_counter()
    wav = model.generate(text, audio_prompt_path=str(ref_wav), **kwargs)
    if device_used == "mps":
        torch.mps.synchronize()
    gen_sec = time.perf_counter() - t0
    arr = wav.squeeze().detach().cpu().numpy().astype(np.float32)
    if not np.isfinite(arr).all() or arr.size == 0 or float(np.max(np.abs(arr))) < 1e-5:
        raise RuntimeError(f"Generated invalid/silent audio (size={arr.size}, peak={float(np.max(np.abs(arr))) if arr.size else 0})")
    return arr, gen_sec


def build_html(results: dict) -> str:
    s = results["summary"]
    rows_html = []
    for row in results["lines"]:
        af = row["afHeart"]
        af_kb = af["sizeBytes"] / 1024.0
        cells = []
        # Cell 1: af_heart
        af_w = af["whisper"]
        af_badge = '<span class="badge ok">OK</span>' if not af_w["flagged"] else '<span class="badge warn">DIFF</span>'
        af_diff_html = f'<div class="diff">{html.escape(af_w["diff"])}</div>' if af_w["flagged"] else ""
        cells.append(f"""
        <div class="clip-card ref">
          <div class="clip-head">
            <span class="clip-label">af_heart (current)</span>
            <span class="badge neutral">REF</span>
          </div>
          <audio controls preload="none" src="clips/{html.escape(af['clipFile'])}"></audio>
          <div class="meta">
            <span>{af_kb:.1f} KB ({af['sizeBytes']:,} B)</span>
            <span>{af['durationSec']:.2f}s</span>
            <span>~{af['bitRate']/1000:.1f} kbps</span>
          </div>
          <div class="whisper">
            <div class="w-head">{af_badge} Whisper:</div>
            <div class="w-text">{html.escape(af_w['text'])}</div>
            {af_diff_html}
          </div>
        </div>""")

        for clip in row["chatterbox"]:
            kb = clip["sizeBytes"] / 1024.0
            ratio_pct = (clip["sizeBytes"] / af["sizeBytes"] * 100.0) if af["sizeBytes"] else 0.0
            w = clip["whisper"]
            badge = '<span class="badge ok">MATCH</span>' if not w["flagged"] else '<span class="badge flag">FLAG</span>'
            diff_html = f'<div class="diff">{html.escape(w["diff"])}</div>' if w["flagged"] else ""
            cells.append(f"""
            <div class="clip-card {'flagged' if w['flagged'] else ''}">
              <div class="clip-head">
                <span class="clip-label">{html.escape(clip['label'])}</span>
                {badge}
              </div>
              <audio controls preload="none" src="clips/{html.escape(clip['clipFile'])}"></audio>
              <div class="meta">
                <span>{kb:.1f} KB ({ratio_pct:.0f}% vs af_heart)</span>
                <span>{clip['durationSec']:.2f}s</span>
                <span>gen {clip['genSec']:.2f}s</span>
              </div>
              <div class="whisper">
                <div class="w-head">Whisper:</div>
                <div class="w-text">{html.escape(w['text'])}</div>
                {diff_html}
              </div>
            </div>""")

        rows_html.append(f"""
        <section class="line-row">
          <div class="line-header">
            <div class="line-tags">
              <span class="tag cat">{html.escape(row['category'])}</span>
              <span class="tag id">{html.escape(row['animId'])} &middot; step {row['step']}</span>
              <span class="tag src">{html.escape(row['source'])}</span>
            </div>
            <p class="line-text">{html.escape(row['text'])}</p>
          </div>
          <div class="clips-grid">
            {''.join(cells)}
          </div>
        </section>""")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JP Voice Trial — Chatterbox Nigerian Teacher Audition</title>
  <style>
    :root {{
      --bg: #0f1419;
      --card: #182028;
      --card2: #1f2933;
      --border: #2c3a47;
      --text: #f0f4f8;
      --muted: #9fb3c8;
      --accent: #38bdf8;
      --ok-bg: #0f3d2e;
      --ok-fg: #6ee7b7;
      --flag-bg: #4c1d24;
      --flag-fg: #fda4af;
      --warn-bg: #3b2f13;
      --warn-fg: #fcd34d;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
    }}
    .wrap {{ max-width: 1200px; margin: 0 auto; }}
    header {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 18px;
    }}
    h1 {{ margin: 0 0 6px; font-size: 1.25rem; }}
    .sub {{ color: var(--muted); font-size: 0.9rem; margin: 0 0 12px; }}
    .stats {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 10px;
    }}
    .stat {{
      background: var(--card2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
    }}
    .stat .k {{ font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }}
    .stat .v {{ font-size: 1rem; font-weight: 600; margin-top: 2px; }}
    .line-row {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 16px;
    }}
    .line-header {{ margin-bottom: 12px; }}
    .line-tags {{ display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }}
    .tag {{
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--card2);
      border: 1px solid var(--border);
      color: var(--muted);
    }}
    .tag.cat {{ color: var(--accent); border-color: #1e4e68; font-weight: 600; }}
    .line-text {{ margin: 0; font-size: 1.02rem; font-weight: 600; }}
    .clips-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px;
    }}
    .clip-card {{
      background: var(--card2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }}
    .clip-card.ref {{ border-color: #2f4b5e; }}
    .clip-card.flagged {{ border-color: #7f2936; }}
    .clip-head {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }}
    .clip-label {{ font-size: 0.85rem; font-weight: 600; }}
    .badge {{
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
      letter-spacing: 0.03em;
    }}
    .badge.ok {{ background: var(--ok-bg); color: var(--ok-fg); }}
    .badge.flag {{ background: var(--flag-bg); color: var(--flag-fg); }}
    .badge.warn {{ background: var(--warn-bg); color: var(--warn-fg); }}
    .badge.neutral {{ background: #22303c; color: var(--muted); }}
    audio {{ width: 100%; height: 38px; }}
    .meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 0.76rem;
      color: var(--muted);
    }}
    .whisper {{
      font-size: 0.8rem;
      background: rgba(0, 0, 0, 0.22);
      border-radius: 6px;
      padding: 7px 8px;
    }}
    .w-head {{ color: var(--muted); font-size: 0.72rem; margin-bottom: 2px; }}
    .w-text {{ color: var(--text); }}
    .diff {{ color: var(--flag-fg); font-size: 0.74rem; margin-top: 4px; word-break: break-word; }}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>JP Voice Trial — Chatterbox Audition (Stage 1)</h1>
      <p class="sub">Offline audition comparing existing Kokoro <code>af_heart</code> against Chatterbox cloning <code>reference.wav</code> across 3 settings.</p>
      <div class="stats">
        <div class="stat"><div class="k">Device</div><div class="v">{html.escape(s['deviceUsed'].upper())}</div></div>
        <div class="stat"><div class="k">Clips</div><div class="v">{s['generatedCount']} Chatterbox + {s['lineCount']} af_heart</div></div>
        <div class="stat"><div class="k">Avg Speed</div><div class="v">{s['avgGenSec']:.2f}s / clip</div></div>
        <div class="stat"><div class="k">Full Corpus ({s['manifestClipCount']} clips)</div><div class="v">~{s['estFullMinutes']:.1f} min ({s['estFullHours']:.2f} hr)</div></div>
        <div class="stat"><div class="k">Whisper Matches</div><div class="v">{s['whisperMatchedCount']} / {s['generatedCount']} exact</div></div>
        <div class="stat"><div class="k">Opus Profile</div><div class="v">libopus 32k mono 48kHz</div></div>
      </div>
    </header>
    {''.join(rows_html)}
  </div>
  <script>
    const players = Array.from(document.querySelectorAll('audio'));
    for (const p of players) {{
      p.addEventListener('play', () => {{
        for (const other of players) {{
          if (other !== p && !other.paused) other.pause();
        }}
      }});
    }}
  </script>
</body>
</html>
"""


def main() -> int:
    CLIPS_DIR.mkdir(parents=True, exist_ok=True)
    WAV_TMP_DIR.mkdir(parents=True, exist_ok=True)

    if not REF_WAV.exists():
        raise FileNotFoundError(f"Missing reference voice: {REF_WAV}")

    lines_data = json.loads(LINES_JSON.read_text(encoding="utf-8"))["lines"]
    manifest_data = json.loads(MANIFEST_JSON.read_text(encoding="utf-8"))
    manifest_clip_count = len(manifest_data["clips"])

    model, device_used, load_sec, fallback_note = load_chatterbox_with_fallback()
    print(f"Chatterbox loaded on {device_used} in {load_sec:.2f}s (sr={model.sr})", flush=True)

    def run_generation_pass(cur_model, cur_device: str):
        pass_lines = []
        pass_secs = []
        for line in lines_data:
            lid = line["id"]
            text = line["text"]
            af_src = ROOT / line["afHeartPath"]
            af_dst_name = f"{lid}_af_heart.webm"
            af_dst = CLIPS_DIR / af_dst_name
            shutil.copy2(af_src, af_dst)
            af_info = ffprobe_info(af_dst)

            cb_entries = []
            for setting in SETTINGS:
                sid = setting["id"]
                wav_path = WAV_TMP_DIR / f"{lid}_{sid}.wav"
                webm_name = f"{lid}_{sid}.webm"
                webm_path = CLIPS_DIR / webm_name

                arr, gen_sec = generate_one(cur_model, cur_device, text, REF_WAV, setting["kwargs"])
                sf.write(str(wav_path), arr, cur_model.sr)
                encode_opus_webm(wav_path, webm_path)
                info = ffprobe_info(webm_path)
                rms = float(np.sqrt(np.mean(arr ** 2)))
                peak = float(np.max(np.abs(arr)))

                pass_secs.append(gen_sec)
                print(
                    f"[{lid} | {sid}] gen={gen_sec:.2f}s dur={info['durationSec']:.2f}s size={info['sizeBytes']}B rms={rms:.4f} peak={peak:.4f}",
                    flush=True,
                )
                cb_entries.append({
                    "settingId": sid,
                    "label": setting["label"],
                    "clipFile": webm_name,
                    "genSec": round(gen_sec, 3),
                    "rms": round(rms, 5),
                    "peak": round(peak, 5),
                    **info,
                })

            pass_lines.append({
                **line,
                "afHeart": {
                    "clipFile": af_dst_name,
                    **af_info,
                },
                "chatterbox": cb_entries,
            })
        return pass_lines, pass_secs

    try:
        results_lines, all_gen_secs = run_generation_pass(model, device_used)
    except Exception as exc:
        if device_used == "mps":
            fallback_note = f"MPS generate failed ({type(exc).__name__}: {exc}); fell back to CPU"
            print(fallback_note, flush=True)
            device_used = "cpu"
            orig_load = torch.load
            torch.load = lambda *a, **kw: orig_load(*a, **{**kw, "map_location": torch.device("cpu")})
            try:
                t0 = time.perf_counter()
                model = ChatterboxTTS.from_pretrained(device="cpu")
                load_sec = time.perf_counter() - t0
            finally:
                torch.load = orig_load
            results_lines, all_gen_secs = run_generation_pass(model, device_used)
        else:
            raise

    print("Loading Whisper small.en on CPU for transcription checks...", flush=True)
    whisper_model = whisper.load_model("small.en", device="cpu")

    flagged_count = 0
    matched_count = 0
    for row in results_lines:
        af_path = CLIPS_DIR / row["afHeart"]["clipFile"]
        af_res = whisper_model.transcribe(str(af_path), fp16=False, language="en")
        af_txt = af_res["text"].strip()
        row["afHeart"]["whisper"] = {"text": af_txt, **compare_transcript(row["text"], af_txt)}

        for clip in row["chatterbox"]:
            cpath = CLIPS_DIR / clip["clipFile"]
            w_res = whisper_model.transcribe(str(cpath), fp16=False, language="en")
            w_txt = w_res["text"].strip()
            cmp = compare_transcript(row["text"], w_txt)
            clip["whisper"] = {"text": w_txt, **cmp}
            if cmp["flagged"]:
                flagged_count += 1
            else:
                matched_count += 1
            status = "FLAG" if cmp["flagged"] else "OK"
            print(f"Whisper [{clip['clipFile']}] {status}: {w_txt!r}", flush=True)
            if cmp["flagged"]:
                print(f"   Diff: {cmp['diff']}", flush=True)

    avg_gen = sum(all_gen_secs) / len(all_gen_secs)
    avg_gen_warm = sum(all_gen_secs[1:]) / len(all_gen_secs[1:]) if len(all_gen_secs) > 1 else avg_gen
    est_sec = avg_gen * manifest_clip_count
    est_warm_sec = avg_gen_warm * manifest_clip_count

    results = {
        "summary": {
            "deviceUsed": device_used,
            "fallbackNote": fallback_note,
            "modelLoadSec": round(load_sec, 2),
            "sampleRateHz": int(model.sr),
            "lineCount": len(results_lines),
            "generatedCount": len(all_gen_secs),
            "whisperModel": "small.en",
            "whisperMatchedCount": matched_count,
            "whisperFlaggedCount": flagged_count,
            "avgGenSec": round(avg_gen, 3),
            "avgGenWarmSec": round(avg_gen_warm, 3),
            "totalGenSec": round(sum(all_gen_secs), 2),
            "manifestClipCount": manifest_clip_count,
            "estFullSec": round(est_sec, 1),
            "estFullMinutes": round(est_sec / 60.0, 1),
            "estFullHours": round(est_sec / 3600.0, 2),
            "estFullWarmMinutes": round(est_warm_sec / 60.0, 1),
            "estFullWarmHours": round(est_warm_sec / 3600.0, 2),
        },
        "lines": results_lines,
    }

    RESULTS_JSON.write_text(json.dumps(results, indent=2), encoding="utf-8")
    INDEX_HTML.write_text(build_html(results), encoding="utf-8")
    print(f"\nDone! Wrote {RESULTS_JSON} and {INDEX_HTML}", flush=True)
    print(f"Device: {device_used} | Avg gen: {avg_gen:.2f}s/clip (warm: {avg_gen_warm:.2f}s/clip) | Est {manifest_clip_count} clips: {est_sec/60:.1f} min", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
