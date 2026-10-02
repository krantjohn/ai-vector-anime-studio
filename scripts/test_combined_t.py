import xml.etree.ElementTree as ET

tree = ET.parse('test_crisp.svg')
root = tree.getroot()
paths = list(root)

svg_out = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">',
    '  <rect width="800" height="1000" fill="#FFFFFF" />',
    '  <g id="test-root">'
]

for p in paths:
    d = p.attrib.get('d', '')
    fill = p.attrib.get('fill', '#000000')
    t = p.attrib.get('transform', '')
    combined_t = f'translate(58.7, 0) scale(0.9766, 0.9766) {t}'.strip()
    svg_out.append(f'    <path fill="{fill}" d="{d}" transform="{combined_t}" />')

svg_out.append('  </g>')
svg_out.append('</svg>')

with open('test_combined_t.svg', 'w', encoding='utf-8') as f:
    f.write('\n'.join(svg_out))

print('Wrote test_combined_t.svg')
