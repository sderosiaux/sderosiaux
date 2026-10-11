#!/usr/bin/env bash
# Renders the values wheel to looping GIFs in ../assets (light + dark, served via <picture>).
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d)
for theme in Light Dark; do
  npx remotion render src/index.ts "ValuesWheel$theme" "$tmp/$theme.mp4" --codec=h264 --crf=10 --log=error
  # Flat art: no dithering keeps edges clean and LZW-friendly; 25 fps = exact 4cs GIF delay.
  ffmpeg -loglevel error -y -i "$tmp/$theme.mp4" \
    -vf "fps=25,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
    -loop 0 "../assets/values-$(echo "$theme" | tr '[:upper:]' '[:lower:]').gif"
done
rm -rf "$tmp"
