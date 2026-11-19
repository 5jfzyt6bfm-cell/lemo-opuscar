#!/bin/sh
# One command: "Attention That Won't Steer" (Case File Explainer demo, 30 s, 1920x1080, 24 fps)
#   sh demo/build.sh                 writes test.mp4 and test.jpg next to demo/
#   OUT=<dir> sh demo/build.sh       writes them to <dir> instead
# Steps: picture events -> score + foley (numpy) -> every frame -> master (-14 LUFS, grain 3) -> poster.
# Needs only the library's core tier (setup.sh deps). Fonts are in fonts/ (OFL, see CREDITS).
set -e
LIB=${LIB:-/home/user/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
HERE=$(cd "$(dirname "$0")" && pwd)
DEST=${OUT:-$(cd "$HERE/.." && pwd)}; mkdir -p "$DEST"; DEST=$(cd "$DEST" && pwd)
WORK=${WORK:-$DEST/.build}; mkdir -p "$WORK"
PY="$LIB/.venv/bin/python"
cd "$LIB"
# 1. sound events from the page; mix.py reads events.json next to itself, so it runs from a scratch copy
cp -r "$HERE/." "$WORK/src"; rm -rf "$WORK/src/out"
node core/render/events.mjs "$WORK/src"
"$PY" "$WORK/src/mix.py"
# 2. picture
node core/render/video.mjs "$WORK/src" --fps 24 --workers 4 --out "$WORK/video.mp4"
# 3. master: the library's mux.sh (ffmpeg 7+), else the same steps by hand (ffmpeg 6)
sh core/render/mux.sh "$WORK/video.mp4" "$WORK/src/out/mix.wav" "$DEST/test.mp4" 24 3 \
  || sh "$HERE/tools/master.sh" "$WORK/video.mp4" "$WORK/src/out/mix.wav" "$DEST/test.mp4" 3
# 4. poster: the hyperfocus (counter at 4 hours, the reserved teal on her face)
node core/render/still.mjs "$WORK/src" 13.2 --out "$WORK" --prefix p_
cp "$WORK/p_13.2.jpg" "$DEST/test.jpg"
rm -rf "$WORK"
echo "done: $DEST/test.mp4"
