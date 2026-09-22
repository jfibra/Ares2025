#!/usr/bin/env python3
"""
Write lib/gallery-photos.generated.ts.

Each photo is emitted with its aspect ratio so the gallery can reserve the
right space before an image loads, which is what keeps a masonry layout from
jumping around while hundreds of lazy-loaded photos arrive.

Two ways in:

  build-gallery-derivatives.sh pipes TSV rows on stdin, one per photo:
      slug <TAB> title <TAB> name <TAB> path/to/full.webp

  --from-existing rebuilds the manifest from the current one plus the files
  already in public/gallery, for when the originals aren't on this machine.
"""

import os
import re
import sys

from PIL import Image

MANIFEST = "lib/gallery-photos.generated.ts"
OUT_ROOT = "public/gallery"
BUILDER = "scripts/build-gallery-derivatives.sh"


def ratio_of(path: str) -> float:
    with Image.open(path) as im:
        w, h = im.size
    return round(w / h, 3) if h else 1.0


def rows_from_stdin():
    for line in sys.stdin:
        line = line.rstrip("\n")
        if not line:
            continue
        slug, title, name, full_path = line.split("\t")
        yield slug, title, name, full_path


def rows_from_existing():
    """Re-read the album order and titles out of the manifest we already have."""
    src = open(MANIFEST).read()
    for slug, title, body in re.findall(
        r'"([^"]+)":\s*\{\s*title:\s*"([^"]*)",\s*photos:\s*\[(.*?)\],\s*\},',
        src,
        re.S,
    ):
        for name in re.findall(r'"([^"]+)"', body):
            yield slug, title, name, os.path.join(OUT_ROOT, slug, "full", f"{name}.webp")


def main() -> int:
    source = rows_from_existing() if "--from-existing" in sys.argv else rows_from_stdin()

    albums: dict[str, dict] = {}
    missing = 0
    for slug, title, name, full_path in source:
        album = albums.setdefault(slug, {"title": title, "photos": []})
        try:
            album["photos"].append((name, ratio_of(full_path)))
        except (FileNotFoundError, OSError):
            missing += 1
            album["photos"].append((name, 1.5))

    if not albums:
        print("no albums to write — refusing to overwrite the manifest", file=sys.stderr)
        return 1

    out = [
        "// GENERATED FILE — do not edit by hand.",
        f"// Run `bash {BUILDER}` to regenerate from public/albums.",
        "",
        "/** [derivative basename, width / height of the full image]. */",
        "export type GeneratedPhoto = [name: string, ratio: number]",
        "",
        "export type GeneratedAlbum = {",
        "  title: string",
        "  /** URLs are /gallery/<slug>/{thumb,full}/<name>.webp */",
        "  photos: GeneratedPhoto[]",
        "}",
        "",
        "export const generatedAlbums: Record<string, GeneratedAlbum> = {",
    ]
    for slug, album in albums.items():
        out.append(f'  "{slug}": {{')
        out.append(f'    title: "{album["title"]}",')
        out.append("    photos: [")
        for name, ratio in album["photos"]:
            out.append(f'      ["{name}", {ratio}],')
        out.append("    ],")
        out.append("  },")
    out.append("}")
    out.append("")

    open(MANIFEST, "w").write("\n".join(out))

    total = sum(len(a["photos"]) for a in albums.values())
    print(f"wrote {MANIFEST}: {len(albums)} albums, {total} photos", end="")
    print(f" ({missing} without a readable image, defaulted to 1.5)" if missing else "")
    return 0


if __name__ == "__main__":
    sys.exit(main())
