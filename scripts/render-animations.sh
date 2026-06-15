#!/usr/bin/env bash
# Render Synfig SIF files → MP4 for the lesson player mascot.
# Run once after deploy: npm run render-animations
set -e

SIF_DIR="/tmp/synfig-anim"
OUT_DIR="/var/www/learn/public/animations"

echo "=== Generating Synfig SIF files ==="
python3 "$(dirname "$0")/create-animations.py"

mkdir -p "$OUT_DIR"

# name:fps:duration_seconds
CLIPS=(
  "idle:24:3"
  "talking:24:2"
  "thinking:24:2"
  "correct:24:2"
  "wrong:24:2"
  "celebrate:24:3"
)

for entry in "${CLIPS[@]}"; do
  IFS=':' read -r name fps _dur <<< "$entry"
  SIF="$SIF_DIR/${name}.sif"
  OUT="$OUT_DIR/${name}.mp4"

  if [ ! -f "$SIF" ]; then
    echo "  [skip] $SIF not found"
    continue
  fi

  echo "  Rendering $name.mp4 ..."
  synfig \
    -i "$SIF" \
    -o "$OUT" \
    --target ffmpeg \
    --video-codec libx264 \
    --video-bitrate 1024 \
    --fps "$fps" \
    -w 480 -h 480 \
    2>&1 | grep -E 'error|Error|warning|frame [0-9]|done|complete' | head -20 || true

  if [ -f "$OUT" ]; then
    SIZE=$(du -sh "$OUT" | cut -f1)
    echo "    OK  $OUT ($SIZE)"
  else
    echo "    FAIL  $OUT not created"
  fi
done

echo ""
echo "=== Animation rendering complete ==="
ls -lh "$OUT_DIR/" 2>/dev/null || echo "(no files in $OUT_DIR)"
