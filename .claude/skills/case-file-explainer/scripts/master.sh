#!/bin/sh
# Fallback master for ffmpeg 6, where core/render/mux.sh's decode check misreads a good file:
# the same steps by hand: two-pass loudnorm to -14 LUFS (linear), a true-peak limit, light grain, x264 + AAC.
#   sh tools/master.sh video.mp4 mix.wav out.mp4 [grain]
set -e
V=$1; A=$2; O=$3; GR=${4:-3}
J=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
M=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(':'.join(f'{k}={d[v]}' for k,v in [('measured_I','input_i'),('measured_TP','input_tp'),('measured_LRA','input_lra'),('measured_thresh','input_thresh'),('offset','target_offset')]))")
ffmpeg -v error -y -i "$V" -i "$A" -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11:$M:linear=true,aresample=48000,alimiter=limit=0.84:level=false[a];[0:v]noise=c0s=$GR:allf=t,format=yuv420p[v]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 192k -shortest -movflags +faststart "$O.part.mp4"
mv "$O.part.mp4" "$O"
ffmpeg -hide_banner -nostats -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
