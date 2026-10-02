import json
import glob
import re

def get_fill_and_lum(xml):
    m = re.search(r'fill="#([0-9a-fA-F]{6})"', xml)
    if not m:
        return '#FFFFFF', (255, 255, 255), 255
    h = m.group(1)
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return '#' + h, (r, g, b), lum

files = sorted(glob.glob('src/data/*Compact.json'))
print(f"Analyzing all {len(files)} compact dataset files:")

for f in files:
    name = f.replace('src/data\\', '').replace('Compact.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    steps = data['steps']
    total = len(steps)
    counts = {}
    for s in steps:
        l = s['l']
        counts[l] = counts.get(l, 0) + 1
    
    # check for suspicious values
    notes = []
    if counts.get('background', 0) < 2:
        notes.append(f"LOW BG: {counts.get('background', 0)}")
    if counts.get('skin_body', 0) < 5:
        notes.append(f"LOW SKIN: {counts.get('skin_body', 0)}")
    if counts.get('line_art', 0) < 20:
        notes.append(f"LOW LINEART: {counts.get('line_art', 0)}")
    if counts.get('iris', 0) < 5:
        notes.append(f"LOW IRIS: {counts.get('iris', 0)}")
    
    status = " [!] " + ", ".join(notes) if notes else " [OK]"
    print(f"{name:12s} ({total:4d} steps): bg={counts.get('background', 0):3d}, skin={counts.get('skin_body', 0):4d}, hair={counts.get('hair', 0):4d}, iris={counts.get('iris', 0):3d}, clothes={counts.get('clothes', 0):4d}, shade={counts.get('shadow_highlight', 0):4d}, line={counts.get('line_art', 0):4d} {status}")
