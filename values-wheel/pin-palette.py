"""Snap the palette entry nearest to the canvas color onto the exact canvas color.

palettegen averages colors per box, so the GitHub canvas (#FFFFFF / #0D1117) comes out
a few units off and the GIF shows as a faint rectangle on the page.
"""
import sys
from PIL import Image

path, hex_color = sys.argv[1], sys.argv[2].lstrip('#')
target = tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))
img = Image.open(path).convert('RGB')
px = img.load()
coords = [(x, y) for y in range(img.height) for x in range(img.width)]
nearest = min(coords, key=lambda c: sum((a - b) ** 2 for a, b in zip(px[c], target)))
px[nearest] = target
img.save(path)
