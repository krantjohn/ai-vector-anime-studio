import json

for name in ['kisaki', 'miku', 'stretch', 'shrine']:
    with open(f'src/data/{name}Compact.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"\n{name} background strokes:")
    for s in data['steps']:
        if s['l'] == 'background':
            print(f"  Step {s['i']}: {s.get('t')} {s.get('e')} {s['x'][:100]}")
