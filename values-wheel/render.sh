#!/usr/bin/env bash
# Renders the values wheel to looping GIFs in ../assets (light + dark, served via <picture>).
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d)
for theme in light dark; do
  case $theme in light) comp=ValuesWheelLight canvas=FFFFFF ;; dark) comp=ValuesWheelDark canvas=0D1117 ;; esac
  # PNG frames, not h264: yuv420p shifts #FFFFFF to #FDFDFD and the canvas no longer matches GitHub's.
  npx remotion render src/index.ts "$comp" "$tmp/$theme" --sequence --image-format=png --log=error
  # 25 fps = exact 4cs GIF delay. Flat art: no dithering keeps edges clean and LZW-friendly.
  ffmpeg -loglevel error -y -framerate 30 -pattern_type glob -i "$tmp/$theme/*.png" \
    -vf "fps=25,scale=960:-1:flags=lanczos,palettegen=max_colors=96:stats_mode=diff" "$tmp/$theme-palette.png"
  python3 pin-palette.py "$tmp/$theme-palette.png" "$canvas"
  ffmpeg -loglevel error -y -framerate 30 -pattern_type glob -i "$tmp/$theme/*.png" -i "$tmp/$theme-palette.png" \
    -lavfi "fps=25,scale=960:-1:flags=lanczos[v];[v][1:v]paletteuse=dither=none:diff_mode=rectangle" \
    -loop 0 "../assets/values-$theme.gif"
done
rm -rf "$tmp"
