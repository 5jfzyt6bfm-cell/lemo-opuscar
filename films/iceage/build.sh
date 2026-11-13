#!/bin/sh
# One command: picture → events → voice/score/foley mix → master → subtitles.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
[ -x "$HERE/../mesozoic/bin/ffmpeg" ] && PATH="$HERE/../mesozoic/bin:$PATH"   # mux.sh needs ffmpeg 7+
cd "$LIB"
# word timings: words.json/sents.json are committed; to redo them, run align.py with PocketSphinx in a venv
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
.venv/bin/python "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/ice-age-predators.mp4" 24 2
.venv/bin/python core/render/srt.py "$HERE/cues.json" "$HERE/ice-age-predators.srt"
