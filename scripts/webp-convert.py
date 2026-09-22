#!/usr/bin/env python3
"""
Convert album originals to web-sized WebP derivatives.

Reads NUL-separated (source, full_out, thumb_out) triplets on stdin, which is
how build-gallery-derivatives.sh feeds it, and writes both sizes for each photo.

Honouring EXIF orientation is the reason this exists rather than a plain cwebp
call: cameras record portrait shots as landscape pixels plus an orientation
tag, and cwebp ignores the tag, so those photos came out rotated 90 degrees.
ImageOps.exif_transpose applies the tag before anything else, so every later
step sees the image the way it is meant to be displayed.
"""

import os
import sys
from concurrent.futures import ProcessPoolExecutor

from PIL import Image, ImageOps

FULL_EDGE = 1400
FULL_Q = 76
THUMB_EDGE = 500
THUMB_Q = 70
JOBS = 8


def _is_fresh(out: str, src: str) -> bool:
    return os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src)


def convert(job):
    src, full_out, thumb_out = job
    targets = [
        (full_out, FULL_EDGE, FULL_Q),
        (thumb_out, THUMB_EDGE, THUMB_Q),
    ]
    stale = [t for t in targets if not _is_fresh(t[0], src)]
    if not stale:
        return None

    try:
        with Image.open(src) as im:
            # Apply the EXIF orientation tag, then drop it: the pixels now carry
            # the orientation themselves.
            im = ImageOps.exif_transpose(im)
            im = im.convert("RGB")

            for out, edge, quality in stale:
                resized = im.copy()
                # thumbnail() fits inside a square, so it scales on the longest
                # edge and never upscales.
                resized.thumbnail((edge, edge), Image.LANCZOS)
                os.makedirs(os.path.dirname(out), exist_ok=True)
                resized.save(out, "WEBP", quality=quality, method=4)
    except Exception as exc:  # noqa: BLE001 - report and keep going
        return f"{src}: {exc}"
    return None


def main() -> int:
    parts = sys.stdin.buffer.read().split(b"\0")
    fields = [p.decode("utf-8") for p in parts if p]
    if len(fields) % 3 != 0:
        print(f"malformed job list: {len(fields)} fields is not a multiple of 3", file=sys.stderr)
        return 1

    jobs = [tuple(fields[i : i + 3]) for i in range(0, len(fields), 3)]
    if not jobs:
        return 0

    done = 0
    failures = []
    with ProcessPoolExecutor(max_workers=JOBS) as pool:
        for error in pool.map(convert, jobs, chunksize=8):
            done += 1
            if error:
                failures.append(error)
            if done % 200 == 0 or done == len(jobs):
                print(f"  converted {done}/{len(jobs)}", flush=True)

    for failure in failures:
        print(f"  FAILED {failure}", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
