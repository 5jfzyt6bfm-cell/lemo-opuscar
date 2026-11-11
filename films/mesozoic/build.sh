#!/bin/sh
# One command: picture → events → score/foley/voice mix → master (with and without score).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
# ffmpeg 7+ is needed by mux.sh; put one first on PATH if the system's is older (we used imageio-ffmpeg's binary in bin/).
[ -x "$HERE/bin/ffmpeg" ] && PATH="$HERE/bin:$PATH"
cd "$LIB"
[ -f "$HERE/voices/dur.json" ] || .venv/bin/python core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
.venv/bin/python "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/mesozoic.mp4" 24 2
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix_nomusic.wav" "$HERE/mesozoic_no-music.mp4" 24 2
.venv/bin/python core/render/srt.py "$HERE/cues.json" "$HERE/mesozoic.srt"
