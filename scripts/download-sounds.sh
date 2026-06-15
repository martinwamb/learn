#!/usr/bin/env bash
# Download background music and sound effects from Freesound API.
# Run once: npm run download-sounds
# Idempotent — skips files that already exist.
set -e

API_KEY="bcv8iLR9GQKCoE8iGv3z6ZjQwRizEoEG5YEwfuLY"
BASE_URL="https://freesound.org/apiv2/search/text/"
OUT_DIR="/var/www/learn/public/audio/sfx"

mkdir -p "$OUT_DIR"

download_sound() {
  local filename="$1"
  local query="$2"
  local filter="$3"
  local dest="$OUT_DIR/$filename"

  if [ -f "$dest" ]; then
    echo "  [skip] $filename already exists"
    return
  fi

  echo "  Searching Freesound: \"$query\" ..."

  # Fetch first result; pick preview-hq-mp3 URL
  local url
  url=$(python3 - << PYEOF
import requests, sys
r = requests.get(
    "$BASE_URL",
    params={
        "query": "$query",
        "filter": "$filter",
        "page_size": 5,
        "fields": "id,name,previews,duration",
        "sort": "rating_desc",
    },
    headers={"Authorization": "Token $API_KEY"},
    timeout=20,
)
if r.status_code != 200:
    sys.exit(1)
results = r.json().get("results", [])
for s in results:
    preview = s.get("previews", {}).get("preview-hq-mp3") or s.get("previews", {}).get("preview-lq-mp3")
    if preview:
        print(preview)
        break
PYEOF
)

  if [ -z "$url" ]; then
    echo "  [warn] No result found for \"$query\", skipping"
    return
  fi

  echo "  Downloading $filename from $url ..."
  wget -q -O "$dest" "$url"
  SIZE=$(du -sh "$dest" | cut -f1)
  echo "  OK  $filename ($SIZE)"
}

echo "=== Downloading lesson sound effects ==="

download_sound "bg-music.mp3"  \
  "children happy background music loop" \
  "duration:[15 TO 120]"

download_sound "correct.mp3" \
  "correct answer chime bright positive" \
  "duration:[0.3 TO 3]"

download_sound "wrong.mp3" \
  "wrong answer buzz soft gentle" \
  "duration:[0.3 TO 3]"

download_sound "celebrate.mp3" \
  "celebration fanfare short kids" \
  "duration:[1 TO 6]"

download_sound "question.mp3" \
  "notification ping soft bell" \
  "duration:[0.1 TO 2]"

echo ""
echo "=== Done ==="
ls -lh "$OUT_DIR/"
