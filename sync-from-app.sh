#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="${GUTSPHERE_DEMO_SRC:-$ROOT/../gutsphere_app/docs/prototypes/demo-v2}"

if [[ ! -f "$SRC/index.html" ]]; then
  echo "Cannot find demo source at $SRC"
  echo "Set GUTSPHERE_DEMO_SRC to docs/prototypes/demo-v2"
  exit 1
fi

cp "$SRC/index.html" "$ROOT/index.html"
cp "$SRC/index.html" "$ROOT/404.html"
cp "$SRC/package.json" "$SRC/server.mjs" "$SRC/validate_prototype.py" "$SRC/spec.md" "$ROOT/"
rm -rf "$ROOT/shared" "$ROOT/screens" "$ROOT/conditions"
cp -R "$SRC/shared" "$SRC/screens" "$SRC/conditions" "$ROOT/"
touch "$ROOT/.nojekyll"

echo "Synced static demo from $SRC"
