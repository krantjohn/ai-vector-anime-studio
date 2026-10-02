import json
import glob

chars = ['sylphie', 'masterMika', 'plana', 'kisaki', 'shiroko']
for c in chars:
    path = f'src/data/{c}Compact.json'
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"\n=== Character: {c} (Total: {len(data['steps'])} steps) ===")
    layer_counts = {}
    layer_samples = {}
    for s in data['steps']:
        l = s['l']
        layer_counts[l] = layer_counts.get(l, 0) + 1
        if l not in layer_samples:
            layer_samples[l] = []
        if len(layer_samples[l]) < 2:
            layer_samples[l].append((s['i'], s.get('t', ''), s.get('e', ''), s['x'][:80]))
    for l, count in sorted(layer_counts.items()):
        print(f"  Layer {l:18s}: {count:4d} strokes. Samples:")
        for sm in layer_samples.get(l, []):
            print(f"     Step {sm[0]}: title='{sm[1]}' id='{sm[2]}'")
