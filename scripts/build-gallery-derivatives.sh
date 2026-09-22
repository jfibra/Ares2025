#!/usr/bin/env bash
#
# Builds web-sized WebP derivatives for the gallery.
#
#   Source:  public/albums/<Album Name>/**/*.jpg   (full-res originals, git-ignored)
#   Output:  public/gallery/<album-slug>/full/*.webp   (lightbox)
#            public/gallery/<album-slug>/thumb/*.webp  (grid)
#   Manifest: lib/gallery-photos.generated.ts
#
# Each top-level folder under public/albums becomes one album; nested subfolders
# are flattened, ordered by path then filename. To add an album later, drop the
# folder in public/albums and re-run this script. Existing, up-to-date
# derivatives are skipped, so re-runs are cheap.
#
# Any folder whose name starts with "_" is skipped, at album or subfolder level.
# That is how you retire photos without deleting the originals: rename e.g.
# "WIDE" to "_WIDE" and re-run. Derivatives that are no longer in the manifest
# are pruned, so retired photos drop off the site on the next run. Archiving a
# whole album removes its derivative folder too; a derivative folder with no
# source folder at all is reported but left alone, so an album is never lost
# just because its originals are offline.
#
# Byte-identical photos within an album are collapsed to a single copy, so the
# same shot delivered in several source folders shows up once. Duplicates that
# span two albums are reported, not removed.
#
# Pass --clean to discard public/gallery and rebuild everything from scratch;
# needed after changing the size or quality settings above, since the normal
# run skips derivatives that are newer than their source.
#
# Sizes, quality and EXIF orientation handling live in scripts/webp-convert.py.
#
# Requires: python3 with Pillow (pip3 install Pillow).

set -euo pipefail

# --- driver -------------------------------------------------------------------
cd "$(dirname "$0")/.."
SRC_ROOT="public/albums"
OUT_ROOT="public/gallery"
MANIFEST="lib/gallery-photos.generated.ts"
SELF="scripts/build-gallery-derivatives.sh"
CONVERTER="scripts/webp-convert.py"

python3 -c "import PIL" 2>/dev/null || { echo "Pillow not found — pip3 install Pillow"; exit 1; }
[ -d "$SRC_ROOT" ] || { echo "no $SRC_ROOT directory"; exit 1; }

if [ "${1:-}" = "--clean" ]; then
  echo "--clean: discarding $OUT_ROOT"
  rm -rf "${OUT_ROOT:?}"
fi

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -e 's/_/-/g' -e 's/[^a-z0-9]\{1,\}/-/g' -e 's/^-*//' -e 's/-*$//'
}
titleize() { echo "$1" | sed 's/_/ - /g'; }

jobs_file=$(mktemp)
manifest_body=$(mktemp)
active_slugs=$(mktemp)
archived_slugs=$(mktemp)
all_hashes=$(mktemp)
trap 'rm -f "$jobs_file" "$manifest_body" "$active_slugs" "$archived_slugs" "$all_hashes"' EXIT

for album_dir in "$SRC_ROOT"/*/; do
  album_name=$(basename "$album_dir")
  slug=$(slugify "$album_name")

  case "$album_name" in
    _*) echo "$album_name -> skipped (archived)"; echo "$slug" >> "$archived_slugs"; continue ;;
  esac

  keep_file=$(mktemp)
  album_chunk=$(mktemp)
  seen_hashes=$(mktemp)
  i=0
  dupes=0
  while IFS= read -r src; do
    # Collapse byte-identical photos delivered in more than one source folder.
    hash=$(md5 -q "$src")
    if grep -qxF "$hash" "$seen_hashes"; then
      dupes=$((dupes + 1))
      continue
    fi
    echo "$hash" >> "$seen_hashes"
    echo "$hash $slug" >> "$all_hashes"
    i=$((i + 1))
    base=$(basename "${src%.*}" | tr '[:upper:] ' '[:lower:]-' | sed -e 's/[^a-z0-9-]//g')
    name=$(printf "%03d-%s" "$i" "$base")
    printf '%s\0%s\0%s\0' "$src" "$OUT_ROOT/$slug/full/$name.webp" "$OUT_ROOT/$slug/thumb/$name.webp" >> "$jobs_file"
    echo "$name" >> "$keep_file"
    echo "      \"$name\"," >> "$album_chunk"
  done < <(find "$album_dir" -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -not -path '*/_*' | LC_ALL=C sort)

  [ "$dupes" -gt 0 ] && echo "  skipped $dupes duplicate photo(s)"

  if [ "$i" -eq 0 ]; then
    # Every photo archived or the folder is empty: treat the album as retired.
    echo "$album_name -> skipped (no photos)"
    echo "$slug" >> "$archived_slugs"
    rm -f "$keep_file" "$album_chunk" "$seen_hashes"
    continue
  fi

  echo "$slug" >> "$active_slugs"
  mkdir -p "$OUT_ROOT/$slug/full" "$OUT_ROOT/$slug/thumb"

  {
    echo "  \"$slug\": {"
    echo "    title: \"$(titleize "$album_name")\","
    echo "    photos: ["
    cat "$album_chunk"
    echo "    ],"
    echo "  },"
  } >> "$manifest_body"

  # Prune derivatives that are no longer part of this album (renamed, removed or
  # archived sources), so retired photos stop being served.
  pruned=0
  for variant in full thumb; do
    for existing in "$OUT_ROOT/$slug/$variant"/*.webp; do
      [ -e "$existing" ] || continue
      if ! grep -qxF "$(basename "${existing%.webp}")" "$keep_file"; then
        rm -f "$existing"
        pruned=$((pruned + 1))
      fi
    done
  done
  [ "$pruned" -gt 0 ] && echo "  pruned $pruned stale derivative(s)"

  rm -f "$keep_file" "$album_chunk" "$seen_hashes"
  echo "$album_name -> $slug ($i photos)"
done

# Derivative folders whose album was archived are removed; ones whose source is
# simply absent are reported, never deleted.
for out_dir in "$OUT_ROOT"/*/; do
  [ -d "$out_dir" ] || continue
  out_slug=$(basename "$out_dir")
  grep -qxF "$out_slug" "$active_slugs" && continue
  if grep -qxF "$out_slug" "$archived_slugs"; then
    rm -rf "$out_dir"
    echo "removed derivatives for retired album: $out_slug"
  else
    echo "note: $out_dir has no source folder in $SRC_ROOT — left in place"
  fi
done

# Never overwrite a good manifest with an empty one: if no album produced any
# photos, the originals are probably missing rather than genuinely gone.
if [ ! -s "$manifest_body" ]; then
  echo "no albums found in $SRC_ROOT — leaving $MANIFEST and $OUT_ROOT untouched."
  echo "If the originals are on another drive, reconnect it and re-run."
  exit 1
fi

cross=$(sort "$all_hashes" | awk '{print $1}' | uniq -d | wc -l | tr -d ' ')
if [ "$cross" -gt 0 ]; then
  echo "note: $cross photo(s) appear in more than one album:"
  sort "$all_hashes" | awk '{c[$1]=c[$1]" "$2} END {for (h in c) if (split(c[h], a, " ") > 1) print "  " c[h]}' |
    sort | uniq -c | sort -rn | head -10
fi

echo "Converting (this takes a few minutes on a cold run)..."
python3 "$CONVERTER" < "$jobs_file" || { echo "conversion reported failures (see above)"; exit 1; }

{
  echo "// GENERATED FILE — do not edit by hand."
  echo "// Run \`bash $SELF\` to regenerate from public/albums."
  echo ""
  echo "export type GeneratedAlbum = {"
  echo "  title: string"
  echo "  /** Derivative basenames; URLs are /gallery/<slug>/{thumb,full}/<name>.webp */"
  echo "  photos: string[]"
  echo "}"
  echo ""
  echo "export const generatedAlbums: Record<string, GeneratedAlbum> = {"
  cat "$manifest_body"
  echo "}"
} > "$MANIFEST"

echo "Wrote $MANIFEST"
du -sh "$OUT_ROOT"
