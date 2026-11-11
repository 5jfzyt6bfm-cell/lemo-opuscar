#!/bin/sh
# One command: word timings → picture → events → voice/score/foley mix → master → subtitles.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
# mux.sh needs ffmpeg 7+; we used the static build from the imageio-ffmpeg wheel (../mesozoic/bin/ffmpeg) when the system's is older.
[ -x "$HERE/../mesozoic/bin/ffmpeg" ] && PATH="$HERE/../mesozoic/bin:$PATH"
cd "$LIB"
# word timings (needs pocketsphinx in a venv: python -m venv .tools && .tools/bin/pip install pocketsphinx soundfile scipy)
# [ -f "$HERE/words.json" ] || "$HERE/../mesozoic/.tools/bin/python" "$HERE/align.py"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
.venv/bin/python "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/one-week-in-the-jurassic.mp4" 24 2
.venv/bin/python core/render/srt.py "$HERE/cues.json" "$HERE/one-week-in-the-jurassic.srt"
