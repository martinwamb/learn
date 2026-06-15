#!/usr/bin/env bash
# Render Synfig SIF files → WebM for the lesson player mascot.
# Run once after deploy: npm run render-animations
set -e

SIF_DIR="/tmp/synfig-anim"
OUT_DIR="/var/www/learn/public/animations"

echo "=== Generating Synfig SIF files ==="
python3 "$(dirname "$0")/create-animations.py"

mkdir -p "$OUT_DIR"

CLIPS=(
  "idle:loop:24:3"
  "talking:loop:24:2"
  "thinking:loop:24:2"
  "correct:once:24:2"
  "wrong:once:24:2"
  "celebrate:once:24:3"
)

for entry in "${CLIPS[@]}"; do
  IFS=':' read -r name _mode fps _dur <<< "$entry"
  SIF="$SIF_DIR/${name}.sif"
  WEBM="$OUT_DIR/${name}.webm"

  if [ ! -f "$SIF" ]; then
    echo "  [skip] $SIF not found"
    continue
  fi

  echo "  Rendering $name..."
  synfig \
    -i "$SIF" \
    -o "$WEBM" \
    --target ffmpeg \
    --video-codec libvpx-vp9 \
    --fps "$fps" \
    -w 480 -h 480 \
    2>&1 | grep -E 'error|Error|frame|done|warning' || true

  if [ -f "$WEBM" ]; then
    SIZE=$(du -sh "$WEBM" | cut -f1)
    echo "    ✓ $WEBM ($SIZE)"
  else
    echo "    ✗ $WEBM not created — trying mp4 fallback"
    MP4="$OUT_DIR/${name}.mp4"
    synfig \
      -i "$SIF" \
      -o "$MP4" \
      --target ffmpeg \
      --video-codec libx264 \
      --fps "$fps" \
      -w 480 -h 480 \
      2>&1 | grep -E 'error|Error|frame|done|warning' || true
    [ -f "$MP4" ] && echo "    ✓ $MP4 (mp4 fallback)" || echo "    ✗ render failed"
  fi
done

echo ""
echo "=== Animation rendering complete ==="
ls -lh "$OUT_DIR/" 2>/dev/null || echo "(no files in $OUT_DIR)"
