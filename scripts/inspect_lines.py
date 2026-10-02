import json
import re

for name in ['magical', 'masterMika']:
    with open(f'src/data/{name}Compact.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"\n--- {name} ---")
    dark_counts = {}
    for s in data['steps']:
        m = re.search(r'fill="#([0-9a-fA-F]{6})"', s['x'])
        if not m:
            continue
        h = m.group(1)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        if lum < 80:
            dark_counts[s['l']] = dark_counts.get(s['l'], 0) + 1
    print(f"Strokes with lum < 80 by layer: {dark_counts}")

    # Also check lum < 110
    mid_dark = {}
    for s in data['steps']:
        m = re.search(r'fill="#([0-9a-fA-F]{6})"', s['x'])
        if not m:
            continue
        h = m.group(1)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        if lum < 110:
            mid_dark[s['l']] = mid_dark.get(s['l'], 0) + 1
    print(f"Strokes with lum < 110 by layer: {mid_dark}")
