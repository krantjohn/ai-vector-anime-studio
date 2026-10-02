import os
import re
import json
import glob

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 6:
        try:
            return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
        except ValueError:
            pass
    return (255, 255, 255)

def get_lum(rgb):
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]

for f in sorted(glob.glob('src/data/*Compact.json')):
    char_name = os.path.basename(f).replace('Compact.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    steps = data.get('steps', [])
    print(f"=== {char_name} (Total: {len(steps)}) ===")
    layer_counts = {}
    for s in steps:
        l = s.get('l', 'unknown')
        layer_counts[l] = layer_counts.get(l, 0) + 1
    print("Current counts:", layer_counts)
