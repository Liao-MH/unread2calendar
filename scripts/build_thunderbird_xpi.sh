#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ADDON_DIR="$ROOT_DIR/thunderbird-addon"
DIST_DIR="$ROOT_DIR/dist"

if [[ ! -f "$ADDON_DIR/manifest.json" ]]; then
  echo "manifest.json not found in $ADDON_DIR" >&2
  exit 1
fi

VERSION="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$ADDON_DIR/manifest.json" | head -n1)"
if [[ -z "$VERSION" ]]; then
  echo "Failed to parse version from manifest.json" >&2
  exit 1
fi

mkdir -p "$DIST_DIR"
OUT="$DIST_DIR/email2calendar-thunderbird-$VERSION.xpi"
rm -f "$OUT"

(
  cd "$ADDON_DIR"
  zip -qr "$OUT" .
)

echo "Built: $OUT"
