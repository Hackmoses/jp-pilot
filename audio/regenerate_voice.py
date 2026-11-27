#!/usr/bin/env python3
"""
Resumable per-subject voice regeneration script using Chatterbox TTS + strict Whisper verification.

Usage:
  python audio/regenerate_voice.py --subject chemistry --spoken-file audio/spoken-chemistry.json
  PYTORCH_ENABLE_MPS_FALLBACK=1 ~/venvs/chatterbox/bin/python audio/regenerate_voice.py \
    --subject chemistry --spoken-file audio/spoken-chemistry.json --device auto
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
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
SCALE = {"hundred": 100, "thousand": 1000, "million": 1_000_000}

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
    "kilometers": "kilometres",
    "kilometer": "kilometre",
    "sulphur": "sulfur",
    "sulphate": "sulfate",
    "sulphates": "sulfates",
    "aluminium": "aluminum",
    "ionizes": "ionises",
    "vapour": "vapor",
    "vapours": "vapors",
    "coloured": "colored",
    "colour": "color",
    "factorise": "factorize",
    "factorising": "factorizing",
    "rationalise": "rationalize",
    "rationalising": "rationalizing",
    "oxide's": "oxide",
    "oxides": "oxide",
    "carbonate's": "carbonate",
    "oxygen's": "oxygen",
    "faraday's": "faradays",
    "faradies": "faradays",
    "farady": "faraday",
    "mol": "moles",
    "mole": "moles",
    "mm": "millimetres",
    "g": "grams",
    "cm": "centimetres",
    "dm": "decimetres",
    "km": "kilometres",
    "kg": "kilograms",
    "hz": "hertz",
    "kw": "kilowatts",
    "amps": "amperes",
    "amp": "ampere",
    "milliamps": "milliamperes",
    "milliamp": "milliampere",
    "milliampers": "milliamperes",
    "milliamper": "milliampere",
    "cobo": "kobo",
    "cobu": "kobo",
    "thirds": "third",
    "fourths": "fourth",
    "fifths": "fifth",
    "sixths": "sixth",
    "sevenths": "seventh",
    "eighths": "eighth",
    "eights": "eighth",
    "ninths": "ninth",
    "tenths": "tenth",
    "fifteenths": "fifteenth",
    "tetraoxosulphate": "tetraoxosulfate",
    "poh": "poh",
    "ph": "ph",
}

ORDINAL_WORDS = {
    1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth",
    6: "sixth", 7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth",
    11: "eleventh", 12: "twelfth", 13: "thirteenth", 14: "fourteenth", 15: "fifteenth",
    16: "sixteenth", 17: "seventeenth", 18: "eighteenth", 19: "nineteenth", 20: "twentieth",
}
ORDINAL_TO_CARDINAL = {v: str(k) for k, v in ORDINAL_WORDS.items()}
PLURAL_DIGIT_WORDS = {
    "0": "zeros", "1": "ones", "2": "twos", "3": "threes", "4": "fours",
    "5": "fives", "6": "sixes", "7": "sevens", "8": "eights", "9": "nines",
}

UNIT_CANON = {
    "mole": "mole", "moles": "mole", "mol": "mole",
    "gram": "gram", "grams": "gram", "g": "gram",
    "kilogram": "kilogram", "kilograms": "kilogram", "kg": "kilogram",
    "decimetre": "decimetre", "decimetres": "decimetre", "decimeter": "decimetre", "decimeters": "decimetre",
    "centimetre": "centimetre", "centimetres": "centimetre", "centimeter": "centimetre", "centimeters": "centimetre",
    "millimetre": "millimetre", "millimetres": "millimetre", "millimeter": "millimetre", "millimeters": "millimetre",
    "kilometre": "kilometre", "kilometres": "kilometre", "kilometer": "kilometre", "kilometers": "kilometre", "km": "kilometre",
    "metre": "metre", "metres": "metre", "meter": "metre", "meters": "metre",
    "atmosphere": "atmosphere", "atmospheres": "atmosphere", "atm": "atmosphere",
    "kelvin": "kelvin", "kelvins": "kelvin",
    "coulomb": "coulomb", "coulombs": "coulomb",
    "amp": "amp", "amps": "amp", "ampere": "amp", "amperes": "amp",
    "milliampere": "milliampere", "milliamperes": "milliampere", "milliamp": "milliampere", "milliamps": "milliampere", "ma": "milliampere",
    "joule": "joule", "joules": "joule",
    "newton": "newton", "newtons": "newton",
    "watt": "watt", "watts": "watt",
    "kilowatt": "kilowatt", "kilowatts": "kilowatt", "kw": "kilowatt",
    "volt": "volt", "volts": "volt",
    "ohm": "ohm", "ohms": "ohm",
    "hertz": "hertz", "hz": "hertz",
    "pascal": "pascal", "pascals": "pascal",
    "farad": "farad", "farads": "farad",
    "microfarad": "microfarad", "microfarads": "microfarad",
    "second": "second", "seconds": "second",
    "minute": "minute", "minutes": "minute",
    "hour": "hour", "hours": "hour",
    "year": "year", "years": "year",
    "degree": "degree", "degrees": "degree",
    "naira": "naira",
    "kobo": "kobo",
    "pound": "pound", "pounds": "pound",
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
    "nitrogen", "sulfur", "ethane", "steam", "tetraoxosulfate", "trioxonitrate",
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
    s = s.replace("cm³", " cubic centimetres ").replace("dm³", " cubic decimetres ")
    s = s.replace("²", " squared ").replace("³", " cubed ")
    s = s.replace("ch2o", " c h 2 o ")
    s = re.sub(r"\b(\d+)(?:st|nd|rd|th)s?\b", lambda m: f" {ORDINAL_WORDS[int(m.group(1))]} " if int(m.group(1)) in ORDINAL_WORDS else f" {m.group(1)} ", s)
    s = re.sub(r"\b([0-9])'?s\b", lambda m: f" {PLURAL_DIGIT_WORDS[m.group(1)]} ", s)
    s = re.sub(r"\b(1[0-9]|20)'?s\b", lambda m: f" {ORDINAL_WORDS[int(m.group(1))]} ", s)
    s = re.sub(r"\bs\.i\.?\b", " s i ", s)
    s = re.sub(r"\be\.m\.f\.?\b", " e m f ", s)
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
    # Collapse multi-token chemical/Whisper variants
    merged: list[str] = []
    i = 0
    while i < len(out):
        if i + 2 < len(out) and out[i] == "p" and out[i + 1] == "o" and out[i + 2] == "h":
            merged.append("poh")
            i += 3
        elif i + 1 < len(out) and out[i] == "p" and out[i + 1] == "h":
            merged.append("ph")
            i += 2
        elif i + 1 < len(out) and out[i] == "tetra" and out[i + 1] in {"oxosulfate", "oxosulphate"}:
            merged.append("tetraoxosulfate")
            i += 2
        elif i + 2 < len(out) and out[i] == "tetra" and out[i + 1] == "oxo" and out[i + 2] in {"sulfate", "sulphate"}:
            merged.append("tetraoxosulfate")
            i += 3
        elif i + 1 < len(out) and out[i] == "tri" and out[i + 1] == "oxonitrate":
            merged.append("trioxonitrate")
            i += 2
        elif i + 1 < len(out) and out[i] == "trioxo" and out[i + 1] == "nitrate":
            merged.append("trioxonitrate")
            i += 2
        elif i + 2 < len(out) and out[i] == "tri" and out[i + 1] == "oxo" and out[i + 2] == "nitrate":
            merged.append("trioxonitrate")
            i += 3
        elif i + 2 < len(out) and out[i] == "gas" and out[i + 1] == "." and out[i + 2] == "why":
            merged.extend(["gas", "y"])
            i += 3
        elif i + 1 < len(out) and out[i] == "gas" and out[i + 1] == "why":
            merged.extend(["gas", "y"])
            i += 2
        elif i + 1 < len(out) and out[i] in {"centimetres", "decimetres"} and out[i + 1] == "cubed":
            merged.extend(["cubic", out[i]])
            i += 2
        elif out[i] == "tf":
            merged.extend(["t", "f"])
            i += 1
        elif out[i] == "kf":
            merged.extend(["k", "f"])
            i += 1
        elif out[i] == "si":
            merged.extend(["s", "i"])
            i += 1
        elif out[i] == "emf":
            merged.extend(["e", "m", "f"])
            i += 1
        elif out[i] == "mgh":
            merged.extend(["m", "g", "h"])
            i += 1
        elif out[i] == "hht":
            merged.extend(["h", "h", "t"])
            i += 1
        elif out[i] == "hth":
            merged.extend(["h", "t", "h"])
            i += 1
        elif out[i] == "thh":
            merged.extend(["t", "h", "h"])
            i += 1
        elif out[i] == "ff":
            merged.extend(["f", "f"])
            i += 1
        elif out[i] == "kwh":
            merged.extend(["kilowatt", "hours"])
            i += 1
        elif out[i] == "rms":
            merged.extend(["r", "m", "s"])
            i += 1
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
        if idx + 1 < n and tokens[idx + 1] in SCALE:
            try:
                scaled = Decimal(t0.replace(",", "")) * SCALE[tokens[idx + 1]]
                norm = format(scaled.normalize(), "f")
                if "." in norm:
                    norm = norm.rstrip("0").rstrip(".")
                return norm or "0", idx + 2
            except InvalidOperation:
                pass
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
        if (
            w == "and"
            and saw_word
            and (current % 100 == 0)
            and j + 1 < n
            and (tokens[j + 1] in ONES or tokens[j + 1] in TENS)
            and not (j + 2 < n and tokens[j + 2] == "hundred" and (current >= 100 or total > 0))
        ):
            j += 1
            continue
        if w in ONES:
            can_append_ones = (
                (not saw_word)
                or (current >= 100 and current % 100 == 0)
                or (total > 0 and current == 0)
                or (20 <= (current % 100) <= 90 and (current % 10 == 0) and 1 <= ONES[w] <= 9)
            )
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
        elif w == "hundred" and saw_word and 1 <= current <= 9:
            current = current * 100
            j += 1
        elif w in {"thousand", "million"} and saw_word:
            total += (current or 1) * SCALE[w]
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


def merge_split_tokens(tokens: list[str], target_vocab: set[str]) -> list[str]:
    """Merge adjacent word pairs [a, b] when a+b appears in target_vocab or known unit/spelling dicts."""
    merged: list[str] = []
    i = 0
    while i < len(tokens):
        if i + 1 < len(tokens) and tokens[i].isalpha() and tokens[i + 1].isalpha():
            comb = tokens[i] + tokens[i + 1]
            comb_canon = SPELLING_EQUIV.get(comb, comb)
            if comb in target_vocab or comb_canon in target_vocab or comb in UNIT_CANON or comb_canon in UNIT_CANON or comb in SPELLING_EQUIV:
                merged.append(comb_canon)
                i += 2
                continue
        merged.append(tokens[i])
        i += 1
    return merged


def extract_units(text: str, extra_vocab: set[str] | None = None) -> Counter:
    tokens = tokenize_basic(text)
    if extra_vocab is not None:
        tokens = merge_split_tokens(tokens, extra_vocab)
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


def normalize_words_for_diff(text: str, other_vocab: set[str] | None = None) -> list[str]:
    tokens = tokenize_basic(text, keep_punct=True)
    if other_vocab is not None:
        tokens = merge_split_tokens(tokens, other_vocab)
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
        elif tokens[i] == "and" and i > 0 and tokens[i - 1] in {"hundred", "thousand", "million"}:
            i += 1
        else:
            out.append(tokens[i])
            i += 1
    return out


def _normalize_binary_nums(exp_nums: list[str], heard_nums: list[str], step_text: str) -> list[str]:
    """If step_text contains a binary literal like '1101 in base 2' and Whisper outputs '1101', expand to digits."""
    m = re.search(r"\b([01]{3,})\s+in\s+base\s+2\b", step_text, flags=re.IGNORECASE)
    if not m:
        return heard_nums
    bits_str = m.group(1)
    bits_list = list(bits_str)
    out: list[str] = []
    for tok in heard_nums:
        if tok == bits_str and bits_list == exp_nums[: len(bits_list)]:
            out.extend(bits_list)
        elif tok == bits_str:
            # Check if bits_list appears as a contiguous slice of exp_nums
            found = any(exp_nums[k : k + len(bits_list)] == bits_list for k in range(len(exp_nums) - len(bits_list) + 1))
            if found:
                out.extend(bits_list)
            else:
                out.append(tok)
        else:
            out.append(tok)
    return out


def _apply_whisper_habits(tokens: list[str], exp_units: Counter, exp_vocab: set[str], exp_words_raw: list[str]) -> list[str]:
    """Normalize specific known Whisper transcription habits ONLY when the target unit/word is expected."""
    out: list[str] = []
    n = len(tokens)
    exp_ords = {w for w in exp_words_raw if w in ORDINAL_TO_CARDINAL}
    exp_cardinal_for_ord = {ORDINAL_TO_CARDINAL[w]: w for w in exp_ords}

    def is_num_tok(t: str) -> bool:
        return bool(re.fullmatch(r"\d+(?:,\d{3})*(?:\.\d+)?", t)) or t in ONES or t in TENS

    for i, t in enumerate(tokens):
        prev_is_num = i > 0 and is_num_tok(tokens[i - 1])
        if t in {"jewel", "jewels", "jew", "jews"} and ("joule" in exp_units or "joule" in exp_vocab or "joules" in exp_vocab):
            out.append("joules")
        elif t in {"nailah", "neither"} and ("naira" in exp_units or "naira" in exp_vocab):
            out.append("naira")
        elif t == "n" and prev_is_num and ("naira" in exp_units or "naira" in exp_vocab):
            out.append("naira")
        elif t == "a" and prev_is_num and "amp" in exp_units:
            out.append("amperes")
        elif t == "v" and prev_is_num and "volt" in exp_units:
            out.append("volts")
        elif t == "w" and prev_is_num and "watt" in exp_units:
            out.append("watts")
        elif t == "m" and prev_is_num and "metre" in exp_units:
            out.append("metres")
        elif t in exp_cardinal_for_ord and prev_is_num:
            # e.g., "1 8" when expected has "eighth" -> "1 eighth"
            out.append(exp_cardinal_for_ord[t])
        else:
            out.append(t)
    return out


def _align_heard_nums_with_exp(exp_nums: list[str], heard_tokens: list[str]) -> list[str]:
    """Merge split decimal digits like ['7.1', '4'] -> ['7.14'] when matching exp_nums."""
    exp_set = set(exp_nums)
    merged: list[str] = []
    i = 0
    while i < len(heard_tokens):
        t = heard_tokens[i]
        if (
            i + 1 < len(heard_tokens)
            and re.fullmatch(r"\d+\.\d+", t)
            and re.fullmatch(r"\d+", heard_tokens[i + 1])
        ):
            cand = canon_decimal(t + heard_tokens[i + 1])
            if cand in exp_set and (t not in exp_set or re.fullmatch(r"0+", heard_tokens[i + 1])):
                merged.append(cand)
                i += 2
                continue
        merged.append(t)
        i += 1
    return merged


def _expand_grouped_digits(exp_nums: list[str], heard_nums: list[str]) -> list[str]:
    """Expand multi-digit integer like '511' or '1101' into ['5','1','1'] when exp_nums has that exact single-digit run."""
    out: list[str] = []
    ei = 0
    for tok in heard_nums:
        if re.fullmatch(r"\d{2,}", tok):
            digits = list(tok)
            if ei + len(digits) <= len(exp_nums) and exp_nums[ei : ei + len(digits)] == digits:
                out.extend(digits)
                ei += len(digits)
                continue
            # Also check anywhere in remaining exp_nums in case an earlier mismatch shifted index
            found_idx = next(
                (k for k in range(len(exp_nums) - len(digits) + 1) if exp_nums[k : k + len(digits)] == digits),
                None,
            )
            if found_idx is not None:
                out.extend(digits)
                ei = found_idx + len(digits)
                continue
        out.append(tok)
        if ei < len(exp_nums) and exp_nums[ei] == tok:
            ei += 1
    return out


def strict_verify(spoken_line: str, step_text: str, heard_text: str) -> dict:
    exp_vocab = set(tokenize_basic(spoken_line))
    heard_vocab = set(tokenize_basic(heard_text))

    exp_units = extract_units(spoken_line, heard_vocab)
    exp_words_base = normalize_words_for_diff(spoken_line, heard_vocab)

    raw_heard_tokens = tokenize_basic(heard_text, keep_punct=True)
    raw_heard_tokens = merge_split_tokens(raw_heard_tokens, exp_vocab)
    raw_heard_tokens = _apply_whisper_habits(raw_heard_tokens, exp_units, exp_vocab, exp_words_base)

    exp_nums = extract_numbers(spoken_line)
    step_nums = extract_numbers(step_text)

    # Extract numbers from normalized heard tokens (and fix split decimals like 7.1 4)
    raw_heard_tokens = _align_heard_nums_with_exp(exp_nums, raw_heard_tokens)
    heard_nums: list[str] = []
    heard_words: list[str] = []
    i = 0
    while i < len(raw_heard_tokens):
        if raw_heard_tokens[i] in {".", ",", ";", ":"}:
            i += 1
            continue
        parsed = parse_number_words_at(raw_heard_tokens, i)
        if parsed:
            heard_nums.append(parsed[0])
            heard_words.append(parsed[0])
            i = parsed[1]
        elif raw_heard_tokens[i] == "and" and i > 0 and raw_heard_tokens[i - 1] in {"hundred", "thousand", "million"}:
            i += 1
        else:
            heard_words.append(raw_heard_tokens[i])
            i += 1

    heard_nums = _normalize_binary_nums(exp_nums, heard_nums, step_text)
    heard_nums = _expand_grouped_digits(exp_nums, heard_nums)
    heard_words = _expand_grouped_digits(exp_nums, heard_words)

    heard_units = Counter()
    for t in raw_heard_tokens:
        if t in UNIT_CANON:
            heard_units[UNIT_CANON[t]] += 1

    exp_chem = extract_chem_terms(spoken_line)
    heard_chem = extract_chem_terms(heard_text)

    exp_words = exp_words_base
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
    if ratio < 0.78:
        reasons.append(f"word_mismatch_low_ratio: {ratio:.2f}")

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
    if device_used == "cuda" and torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    elif device_used == "mps" and hasattr(torch, "mps") and hasattr(torch.mps, "manual_seed"):
        torch.mps.manual_seed(seed)


def resolve_device(requested: str) -> str:
    req = requested.strip().lower()
    if req == "auto":
        if torch.cuda.is_available():
            return "cuda"
        if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
        return "cpu"
    if req == "cuda":
        if not torch.cuda.is_available():
            raise RuntimeError("Requested --device cuda, but CUDA is not available.")
        return "cuda"
    if req == "mps":
        if not (hasattr(torch.backends, "mps") and torch.backends.mps.is_available()):
            raise RuntimeError("Requested --device mps, but MPS is not available.")
        return "mps"
    if req == "cpu":
        return "cpu"
    raise ValueError(f"Unsupported device: {requested!r}")


def load_chatterbox(requested_device: str = "auto") -> tuple[ChatterboxTTS, str, float]:
    orig_load = torch.load
    target = resolve_device(requested_device)
    if target == "mps":
        os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

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

    if requested_device == "auto" and target in {"cuda", "mps"}:
        try:
            model, sec = _load(target)
            return model, target, sec
        except Exception as exc:
            print(f"{target.upper()} load failed ({type(exc).__name__}: {exc}); falling back to CPU", flush=True)
        model, sec = _load("cpu")
        return model, "cpu", sec

    model, sec = _load(target)
    return model, target, sec


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
    if device_used == "cuda":
        torch.cuda.synchronize()
    elif device_used == "mps":
        torch.mps.synchronize()
        torch.mps.empty_cache()
    gen_sec = time.perf_counter() - t0
    arr = wav.squeeze().detach().cpu().numpy().astype(np.float32)
    if not np.isfinite(arr).all() or arr.size == 0 or float(np.max(np.abs(arr))) < 1e-4:
        raise RuntimeError(f"Generated invalid/silent audio (size={arr.size})")
    return arr, gen_sec


def sync_checkpoint(state_dir: Path, copy_dir: Path | None) -> None:
    if copy_dir is None:
        return
    copy_dir.mkdir(parents=True, exist_ok=True)
    shutil.copytree(state_dir, copy_dir, dirs_exist_ok=True)


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
    parser.add_argument("--state-dir", default="/tmp/jp-regen-voice-all")
    parser.add_argument("--checkpoint-copy-dir", default="")
    parser.add_argument("--checkpoint-every", type=int, default=20)
    parser.add_argument("--skip-needs-review", action="store_true")
    parser.add_argument("--only-new", action="store_true", help="Voice only clips with no audio yet (and Kokoro fallbacks); keep everything else")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--paths-file", default="", help="Voice only the clip paths listed in this file (one per line), replacing what is there")
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument(
        "--device",
        choices=("auto", "cuda", "mps", "cpu"),
        default="auto",
        help="Torch device to use (auto picks cuda, then mps, then cpu)",
    )
    args = parser.parse_args()

    subject = args.subject.strip().lower()
    ref_wav = ROOT / args.ref
    if not ref_wav.exists():
        raise FileNotFoundError(f"Missing reference WAV: {ref_wav}")

    spoken_doc = json.loads((ROOT / args.spoken_file).read_text(encoding="utf-8"))
    spoken_clips = spoken_doc["clips"]
    only_paths: set[str] | None = None
    if args.paths_file:
        only_paths = {line.strip() for line in (ROOT / args.paths_file).read_text(encoding="utf-8").splitlines()
                      if line.strip() and not line.startswith("#")}
        spoken_clips = [c for c in spoken_clips if c["path"] in only_paths]
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
    copy_dir = Path(args.checkpoint_copy_dir).expanduser() if args.checkpoint_copy_dir else None
    state_path = state_dir / f"state_{subject}.json"
    if not state_path.exists() and copy_dir is not None and (copy_dir / f"state_{subject}.json").exists():
        shutil.copytree(copy_dir, state_dir, dirs_exist_ok=True)
        print(f"Restored checkpoint from {copy_dir} into {state_dir}", flush=True)
    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {"clips": {}}
    clips_state: dict[str, dict] = state.setdefault("clips", {})

    def ensure_manifest_entry(item: dict) -> dict:
        rel_path = item["path"]
        if rel_path in manifest_by_path:
            return manifest_by_path[rel_path]
        line_sha = hashlib.sha256(item["stepText"].encode("utf-8")).hexdigest()
        entry = {
            "animationId": item["animationId"],
            "step": item["step"],
            "path": rel_path,
            "durationMs": 0,
            "lineSha256": line_sha,
            "voice": "pending",
        }
        manifest["clips"].append(entry)
        manifest_by_path[rel_path] = entry
        return entry

    # One solution must never mix voices. With --only-new, if any clip of a track (a solution's
    # quick steps, or its Teach me steps) needs voicing, the whole track is voiced again in this voice.
    def track_of(path: str) -> str:
        parts = path.split("/")
        return "/".join(parts[:3]) if len(parts) > 2 and parts[1] == "teach" else "/".join(parts[:2])

    tracks_to_redo: set[str] = set()
    if args.only_new:
        for c in spoken_clips:
            e = manifest_by_path.get(c["path"])
            op = PUBLIC_DIR / c["path"]
            if e is None or str(e.get("voice", "")).startswith("kokoro") or not op.exists() or op.stat().st_size == 0:
                tracks_to_redo.add(track_of(c["path"]))
        print(f"[only-new] tracks to voice in full: {len(tracks_to_redo)}", flush=True)

    # Record beforeBytes and sync lineSha256 from origin/main (or compute for new clips)
    skipped_review = []
    clean_items = []
    already_charon_count = 0
    for item in spoken_clips:
        rel_path = item["path"]
        orig_entry = orig_by_path.get(rel_path)
        cur_entry = manifest_by_path.get(rel_path)
        if orig_entry is not None and cur_entry is not None:
            cur_entry["lineSha256"] = orig_entry["lineSha256"]

        st = clips_state.setdefault(rel_path, {})
        if "beforeBytes" not in st:
            raw_orig = git_show_bytes(f"origin/main:app/public/{rel_path}") if orig_entry is not None else None
            st["beforeBytes"] = len(raw_orig) if raw_orig is not None else 0
        st["needsReview"] = bool(item.get("needsReview"))
        st["issues"] = item.get("issues", [])

        out_path = PUBLIC_DIR / rel_path
        if (
            not args.force
            and only_paths is None
            and orig_entry is not None
            and orig_entry.get("voice") == args.voice_name
            and cur_entry is not None
            and cur_entry.get("voice") == args.voice_name
            and out_path.exists()
            and out_path.stat().st_size > 0
            and st.get("status") in {None, "already_charon"}
        ):
            st.update({
                "status": "already_charon",
                "stepText": item["stepText"],
                "spokenLine": item["spokenLine"],
                "afterBytes": out_path.stat().st_size,
                "durationMs": cur_entry["durationMs"],
                "genSec": 0.0,
            })
            already_charon_count += 1
            continue

        # --only-new keeps every clip that already has audio in a real voice. It voices only
        # clips with no audio yet, plus old Kokoro fallbacks.
        if (
            args.only_new
            and only_paths is None
            and track_of(rel_path) not in tracks_to_redo
            and cur_entry is not None
            and not str(cur_entry.get("voice", "")).startswith("kokoro")
            and out_path.exists()
            and out_path.stat().st_size > 0
        ):
            st.update({"status": "kept_existing", "stepText": item["stepText"], "spokenLine": item["spokenLine"],
                       "afterBytes": out_path.stat().st_size, "durationMs": cur_entry.get("durationMs", 0), "genSec": 0.0})
            already_charon_count += 1
            continue

        if args.skip_needs_review and item.get("needsReview"):
            if orig_entry is not None and cur_entry is not None:
                after_b = restore_from_origin_main(rel_path, orig_entry, cur_entry)
                dur_ms = orig_entry["durationMs"]
            else:
                after_b = 0
                dur_ms = 0
            st.update({
                "status": "skipped_text_needs_review",
                "stepText": item["stepText"],
                "issues": item.get("issues", []),
                "afterBytes": after_b,
                "durationMs": dur_ms,
                "genSec": 0.0,
            })
            skipped_review.append(item)
        else:
            clean_items.append(item)

    atomic_write_json(MANIFEST_PATH, manifest)
    atomic_write_json(state_path, state)
    print(
        f"Subject '{subject}': total={len(spoken_clips)}, already_charon={already_charon_count}, "
        f"to_voice={len(clean_items)}, needs_review_flagged={sum(1 for i in spoken_clips if i.get('needsReview'))}, "
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
        cur_entry = manifest_by_path.get(rel_path)
        out_path = PUBLIC_DIR / rel_path
        already_accepted = (
            not args.no_resume
            and st.get("status") in {"passed", "passed_retry"}
            and out_path.exists()
            and out_path.stat().st_size > 0
            and cur_entry is not None
            and cur_entry.get("voice") == args.voice_name
        )
        already_rejected = (
            not args.no_resume
            and st.get("status") == "rejected_whisper_mismatch"
            and ((orig_by_path.get(rel_path) is not None and out_path.exists() and (cur_entry is None or cur_entry.get("voice") != args.voice_name)) or (orig_by_path.get(rel_path) is None))
        )
        if already_accepted:
            verified_cache.setdefault(item["spokenLine"], out_path)
        elif already_rejected:
            continue
        else:
            pending.append(item)

    print(f"Pending clips to process: {len(pending)} / {len(clean_items)}", flush=True)

    gen_wav = state_dir / "gen.wav"
    tmp_webm_1 = state_dir / "attempt1.webm"
    tmp_webm_2 = state_dir / "attempt2.webm"
    batch_start = time.perf_counter()

    if pending:
        print("Loading ChatterboxTTS...", flush=True)
        model, device_used, load_sec = load_chatterbox(args.device)
        print(f"Chatterbox loaded on {device_used} in {load_sec:.2f}s (sr={model.sr})", flush=True)
        whisper_device = "cuda" if device_used == "cuda" else "cpu"
        print(f"Loading Whisper small.en on {whisper_device.upper()}...", flush=True)
        whisper_model = whisper.load_model("small.en", device=whisper_device)
        print(f"Calling prepare_conditionals() ONCE for {ref_wav} (exaggeration={args.exaggeration})...", flush=True)
        model.prepare_conditionals(str(ref_wav), exaggeration=args.exaggeration)
        state["deviceUsed"] = device_used
        atomic_write_json(state_path, state)

        for pos, item in enumerate(pending, 1):
            rel_path = item["path"]
            step_text = item["stepText"]
            spoken_line = item["spokenLine"]
            orig_entry = orig_by_path.get(rel_path)
            cur_entry = ensure_manifest_entry(item)
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
                    "wordDiff": st.get("wordDiff", ""),
                    "reasons": [],
                    "whisperText": st.get("whisperText", "(copied verified duplicate)"),
                })
                atomic_write_json(MANIFEST_PATH, manifest)
                atomic_write_json(state_path, state)
                if args.checkpoint_every > 0 and pos % args.checkpoint_every == 0:
                    sync_checkpoint(state_dir, copy_dir)
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
                failed_dir = state_dir / "failed_attempts"
                failed_dir.mkdir(parents=True, exist_ok=True)
                slug = rel_path.replace("/", "__").removesuffix(".webm")
                saved_attempts: list[str] = []
                if tmp_webm_1.exists():
                    dest1 = failed_dir / f"{slug}_attempt1.webm"
                    shutil.copy2(tmp_webm_1, dest1)
                    saved_attempts.append(str(dest1))
                if retried and tmp_webm_2.exists():
                    dest2 = failed_dir / f"{slug}_attempt2.webm"
                    shutil.copy2(tmp_webm_2, dest2)
                    saved_attempts.append(str(dest2))
                if orig_entry is not None:
                    after_bytes = restore_from_origin_main(rel_path, orig_entry, cur_entry)
                    dur_ms = orig_entry["durationMs"]
                    rej_status = "REJECTED_RESTORED_AF_HEART"
                else:
                    if out_path.exists():
                        out_path.unlink()
                    manifest["clips"] = [c for c in manifest["clips"] if c["path"] != rel_path]
                    manifest_by_path.pop(rel_path, None)
                    after_bytes = 0
                    dur_ms = 0
                    rej_status = "REJECTED_NEW_NO_FALLBACK"
                st.update({
                    "status": "rejected_whisper_mismatch",
                    "deduped": False,
                    "retried": retried,
                    "stepText": step_text,
                    "spokenLine": spoken_line,
                    "whisperText": chosen_w,
                    "attempt1Whisper": w1,
                    "attempt2Whisper": w2 if retried else None,
                    "failedAttempts": saved_attempts,
                    "wordDiff": chosen_v["wordDiff"],
                    "reasons": chosen_v["reasons"],
                    "afterBytes": after_bytes,
                    "durationMs": dur_ms,
                    "genSec": round(total_gen_sec, 3),
                })
                print(
                    f"[{pos}/{len(pending)}] {rel_path} {rej_status} "
                    f"reasons={chosen_v['reasons']} | step={step_text!r} | heard={chosen_w!r}",
                    flush=True,
                )

            atomic_write_json(MANIFEST_PATH, manifest)
            atomic_write_json(state_path, state)
            if args.checkpoint_every > 0 and pos % args.checkpoint_every == 0:
                sync_checkpoint(state_dir, copy_dir)
                print(f"  -> Checkpoint synced to {copy_dir} ({pos}/{len(pending)})", flush=True)

    sync_checkpoint(state_dir, copy_dir)
    if copy_dir is not None:
        print(f"Final subject checkpoint synced to {copy_dir}", flush=True)

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
    pct_str = f"{after_total / before_total * 100:.1f}%" if before_total else "n/a (new clips)"
    print(f"Before total bytes: {before_total:,} ({before_total / (1024*1024):.2f} MB)", flush=True)
    print(f"After  total bytes: {after_total:,} ({after_total / (1024*1024):.2f} MB) ({pct_str})", flush=True)
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
