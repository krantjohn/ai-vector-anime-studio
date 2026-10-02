import re
import json

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 6:
        try:
            return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
        except ValueError:
            pass
    return (255, 255, 255)

def get_lum(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b

def parse_path_info(xml_str):
    m_fill = re.search(r'fill="([^"]+)"', xml_str)
    fill = m_fill.group(1) if m_fill else '#FFFFFF'
    rgb = hex_to_rgb(fill)
    lum = get_lum(*rgb)

    m_trans = re.search(r'transform="translate\(([\d.-]+),([\d.-]+)\)"', xml_str)
    tx, ty = (float(m_trans.group(1)), float(m_trans.group(2))) if m_trans else (0.0, 0.0)

    m_d = re.search(r'd="([^"]+)"', xml_str)
    if m_d:
        nums = [float(x) for x in re.findall(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', m_d.group(1))]
        if len(nums) >= 4:
            xs = [x + tx for x in nums[0::2]]
            ys = [y + ty for y in nums[1::2]]
            min_x, max_x = min(xs), max(xs)
            min_y, max_y = min(ys), max(ys)
            return fill, rgb, lum, tx, ty, min_x, min_y, max_x - min_x, max_y - min_y
    return fill, rgb, lum, tx, ty, 0, 0, 0, 0

with open('src/data/masterMikaCompact.json', 'r', encoding='utf-8') as f:
    mika = json.load(f)

print("First 20 paths in Mika with absolute coords:")
for s in mika['steps'][10:30]:
    fill, rgb, lum, tx, ty, min_x, min_y, w, h = parse_path_info(s['x'])
    print(f"Step {s['i']:4d}: layer={s['l']:16s} fill={fill} lum={lum:5.1f} pos=({min_x:5.1f},{min_y:5.1f}) size=({w:5.1f},{h:5.1f}) title={s['t']}")
