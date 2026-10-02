import json
import re

with open('src/data/magicalCompact.json', 'r', encoding='utf-8') as f:
    magical = json.load(f)

with open('src/data/masterMikaCompact.json', 'r', encoding='utf-8') as f:
    mika = json.load(f)

# Let's see what strokes in magical have lum < 85
magical_dark = []
for s in magical['steps']:
    m = re.search(r'fill="#([0-9a-fA-F]{6})"', s['x'])
    if m:
        h = m.group(1)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        lum = 0.299*r + 0.587*g + 0.114*b
        if lum < 85:
            magical_dark.append((s['i'], s['l'], lum, h, s.get('t', '')))

print(f"Magical strokes with lum < 85: {len(magical_dark)}")

# And for Mika
mika_dark = []
for s in mika['steps']:
    m = re.search(r'fill="#([0-9a-fA-F]{6})"', s['x'])
    if m:
        h = m.group(1)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        lum = 0.299*r + 0.587*g + 0.114*b
        if lum < 92 and (r < 95 and g < 95 and b < 135):
            mika_dark.append((s['i'], s['l'], lum, h, s.get('t', '')))

print(f"Mika dark line candidates: {len(mika_dark)}")
