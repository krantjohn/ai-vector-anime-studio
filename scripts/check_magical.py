import json
import re

with open('src/data/magicalCompact.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for s in data['steps'][:50]:
    m = re.search(r'fill="#([0-9a-fA-F]{6})"', s['x'])
    if m:
        h = m.group(1)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        if lum < 100:
            print(f"Step {s['i']}: layer={s['l']} fill=#{h} lum={lum:.1f} title={s.get('t')}")
