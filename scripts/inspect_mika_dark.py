import json
import re

with open('src/data/masterMikaCompact.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def get_rgb(xml):
    m = re.search(r'fill="#([0-9a-fA-F]{6})"', xml)
    if not m:
        return (255, 255, 255), 255
    h = m.group(1)
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return (r, g, b), lum

print("Analyzing Mika's dark/ink strokes:")
dark_strokes = []
for s in data['steps']:
    rgb, lum = get_rgb(s['x'])
    if lum < 100:
        dark_strokes.append((s['i'], s['l'], lum, rgb, s.get('t', ''), s['x'][:90]))

print(f"Total strokes with lum < 100 in Mika: {len(dark_strokes)}")
from collections import Counter
print("Current layers of lum < 100:", Counter(x[1] for x in dark_strokes))
for x in dark_strokes[:25]:
    print(f"  Step {x[0]:4d}: layer={x[1]:16s} lum={x[2]:5.1f} rgb={x[3]} title={x[4]}")
