#!/usr/bin/env python3
"""Install owner-supplied cake photography from a single ZIP upload.

Run by GitHub Actions after imports/mads-original-photos.zip is uploaded.
Checks exact cakes.json paths, validates WebP signatures and keeps the ZIP out
of the permanent repository history after processing (upload commit remains in history).
"""
import json
from pathlib import Path
from zipfile import ZipFile, BadZipFile

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / "imports" / "mads-original-photos.zip"
CATALOGUE = ROOT / "cakes.json"
EXTRAS = {"PHOTO_SELECTION_REFERENCE.csv", "UPLOAD_INSTRUCTIONS.txt"}
MAX_FILE = 1_500_000
MAX_TOTAL = 20_000_000

def main():
    if not ARCHIVE.is_file():
        raise SystemExit("Missing imports/mads-original-photos.zip; upload the supplied ZIP first.")
    catalogue = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    expected = {row["coverImage"] for row in catalogue["cakes"]}
    if len(expected) != 33 or any(not p.startswith("assets/creations/") or not p.endswith(".webp") for p in expected):
        raise SystemExit("Expected 33 original photos under assets/creations in cakes.json")
    try:
        with ZipFile(ARCHIVE) as archive:
            files = [i for i in archive.infolist() if not i.is_dir()]
            names = [f.filename for f in files]
            if len(names) != len(set(names)):
                raise ValueError("ZIP contains duplicate entries")
            missing = expected - set(names)
            unexpected = set(names) - expected - EXTRAS
            if missing or unexpected:
                raise ValueError(f"ZIP mismatch: missing={sorted(missing)}, unexpected={sorted(unexpected)}")
            if sum(f.file_size for f in files) > MAX_TOTAL:
                raise ValueError("Unpacked ZIP exceeds 20 MB")
            for entry in files:
                if entry.filename in EXTRAS:
                    continue
                if not (1000 <= entry.file_size <= MAX_FILE):
                    raise ValueError(f"Invalid image size: {entry.filename}")
                with archive.open(entry) as stream:
                    content = stream.read(MAX_FILE + 1)
                if len(content) != entry.file_size or content[:4] != b"RIFF" or content[8:12] != b"WEBP":
                    raise ValueError(f"Not a valid WebP: {entry.filename}")
                destination = ROOT / entry.filename
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(content)
    except (BadZipFile, OSError, ValueError) as exc:
        raise SystemExit(f"Photo upload rejected: {exc}") from exc
    ARCHIVE.unlink()
    print(f"Installed {len(expected)} verified original cake photos; removed import ZIP.")

if __name__ == "__main__":
    main()
