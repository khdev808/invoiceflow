#!/usr/bin/env python3
"""Validate all admin landing page locale files have complete key coverage."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EN_FILE = ROOT / "en.ts"
LOCALES_DIR = ROOT / "locales"

EXPECTED_CODES = [
    "es", "fr", "de", "pt", "it",
    "nl", "tr", "pl", "zh", "ja", "ko", "ar", "hi", "ru", "vi", "id", "th",
    "bn", "uk", "ro", "sv", "no", "da", "fi", "cs", "el", "he", "ms", "fil", "ur", "zh-TW",
]


def load_keys(path: Path) -> set[str]:
    text = path.read_text(encoding="utf-8")
    return set(re.findall(r"^\s+(\w+):", text, re.MULTILINE))


def main() -> int:
    en_keys = load_keys(EN_FILE)
    expected_count = len(en_keys)
    print(f"English source keys: {expected_count}")

    errors: list[str] = []
    ok = 0

    for code in EXPECTED_CODES:
        path = LOCALES_DIR / f"{code}.ts"
        if not path.exists():
            errors.append(f"MISSING FILE: {code}.ts")
            continue
        locale_keys = load_keys(path)
        missing = en_keys - locale_keys
        extra = locale_keys - en_keys
        if missing:
            errors.append(f"{code}.ts: missing {len(missing)} keys: {sorted(missing)[:5]}...")
        if extra:
            errors.append(f"{code}.ts: extra {len(extra)} keys: {sorted(extra)[:5]}...")
        if not missing and not extra:
            ok += 1
            print(f"  ✓ {code}.ts ({len(locale_keys)} keys)")

    print(f"\nResult: {ok}/{len(EXPECTED_CODES)} locale files valid")
    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  ✗ {e}")
        return 1
    print("All locale files exist and have complete key coverage.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
