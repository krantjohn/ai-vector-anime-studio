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

def parse_bbox_and_pos(xml_str):
    m_fill = re.search(r'\bfill="([^"]+)"', xml_str)
    fill = m_fill.group(1) if m_fill else '#FFFFFF'
    rgb = hex_to_rgb(fill)
    lum = get_lum(*rgb)

    translates = [(float(a), float(b)) for a, b in re.findall(r'translate\(([\d.-]+)\s*,\s*([\d.-]+)\)', xml_str)]
    scales = [(float(a), float(b)) for a, b in re.findall(r'scale\(([\d.-]+)\s*,\s*([\d.-]+)\)', xml_str)]
    tx1, ty1 = translates[0] if len(translates) > 0 else (0.0, 0.0)
    tx2, ty2 = translates[1] if len(translates) > 1 else (0.0, 0.0)
    sx, sy = scales[0] if len(scales) > 0 else (1.0, 1.0)

    min_x, min_y, max_x, max_y = 0.0, 0.0, 0.0, 0.0
    m_d = re.search(r'\bd="([^"]+)"', xml_str)
    if m_d:
        nums = [float(x) for x in re.findall(r'[-+]?(?:\d*\.\d+|\d+)', m_d.group(1))]
        if len(nums) >= 4:
            xs_raw = nums[0::2]
            ys_raw = nums[1::2]
            xs = [(x + tx2) * sx + tx1 for x in xs_raw]
            ys = [(y + ty2) * sy + ty1 for y in ys_raw]
            min_x, max_x = min(xs), max(xs)
            min_y, max_y = min(ys), max(ys)
    else:
        m_cx = re.search(r'\bcx="([\d.-]+)"', xml_str)
        m_cy = re.search(r'\bcy="([\d.-]+)"', xml_str)
        m_r = re.search(r'\br="([\d.-]+)"', xml_str)
        if m_cx and m_cy:
            cx_raw, cy_raw = float(m_cx.group(1)), float(m_cy.group(1))
            r_raw = float(m_r.group(1)) if m_r else 20.0
            min_x, max_x = cx_raw - r_raw, cx_raw + r_raw
            min_y, max_y = cy_raw - r_raw, cy_raw + r_raw

    w = max(0.0, max_x - min_x)
    h = max(0.0, max_y - min_y)
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    return fill, rgb, lum, min_x, min_y, max_x, max_y, w, h, cx, cy

def is_skin_tone(r, g, b, lum):
    # Warm peach/ivory/cream skin
    if r > 200 and g > 160 and b > 140:
        if r >= g and g >= b - 12:
            rb_diff = r - b
            rg_diff = r - g
            if 10 <= rb_diff <= 70 and rg_diff <= 38:
                if lum > 175:
                    return True
    if 175 <= r <= 225 and 135 <= g <= 185 and 115 <= b <= 165:
        if r > g and g >= b - 5:
            if 15 <= (r - b) <= 60 and (r - g) <= 35:
                return True
    return False

def classify_sylphie_stroke(idx, title, elem_id, xml_str):
    fill, (r, g, b), lum, min_x, min_y, max_x, max_y, w, h, cx, cy = parse_bbox_and_pos(xml_str)
    t_lower = (title + ' ' + elem_id).lower()

    # Stage 1 sketches
    if idx == 1:
        return 'line_art', '脊椎中轴'
    if idx == 2:
        return 'skin_body', '面部轮廓'
    if idx == 3:
        return 'iris', '晶莹眼部'
    if idx == 4:
        return 'hair', '飘逸粉发'
    if idx == 5:
        return 'clothes', '星空法裙'
    if idx == 6:
        return 'background', '星蝶轨迹'

    # Background canvas plates & butterflies
    if (w >= 450 and h >= 550 and (min_x <= 100 or min_y <= 100)) or (w >= 650 and h >= 800):
        return 'background', '环境背景'
    if any(k in t_lower for k in ['butterfl', 'particle', 'bloom', 'aura', 'sparkle', 'stardust', 'sky', 'cloud']):
        return 'background', '星蝶特效'
    if elem_id in ['sylphie-p1', 'sylphie-p2']:
        return 'background', '星空背景'

    # Line Art: deep black ink
    if 'fill="none"' in xml_str and 'stroke=' in xml_str:
        return 'line_art', '线条勾勒'
    if lum < 65 and not (cy > 450 and w > 100 and h > 100):
        return 'line_art', '线条勾勒'

    # Eyes & Iris
    if any(k in t_lower for k in ['iris', 'pupil', 'sclera', 'catchlight', 'star-pupil', 'eyelash', 'brow', 'lips', 'mouth']):
        return 'iris', '五官眼眸'
    if (320 <= cx <= 520 and 220 <= cy <= 360) and w < 85 and h < 75:
        if (r > 175 and g > 130 and b < 170 and r > b + 15) or (r > 185 and g > 140 and b < 160 and r > b + 25) or (r > 200 and g > 160 and b < 125):
            return 'iris', '五官眼眸'
        if lum > 240 and w < 50 and h < 45:
            return 'iris', '晶莹高光'
        if lum < 50 and w < 25 and h < 25:
            return 'iris', '曜黑瞳孔'

    # Skin & Body
    if is_skin_tone(r, g, b, lum):
        if (r > 205 and b > 155 and r - g > 30 and cy < 360 and (w > 60 or h > 60)):
            return 'hair', '发型轮廓'
        return 'skin_body', '身体肌肤'

    # Hair: Sakura-pink flowing hair & butterfly bows
    if (r > 190 and b > 140 and r > g + 15) or (r > 210 and b > 165) or \
       (r > 180 and b > 160 and g < 155) or (r > 170 and b > 150 and r > g + 20) or \
       (r > 160 and b > 140 and r > g + 10 and cy < 580):
        return 'hair', '发型轮廓'

    # Clothes: Starry blue-purple gradient gown, white corset bodice, thigh-high boots
    if (lum > 210 and cy > 360) or (b > 130 and b > r + 15) or (b > 140 and g < 130) or \
       (lum < 110 and b > g) or (b > 120 and abs(r-b) < 30 and g < 130) or \
       (b > 115 and b > r + 10) or (b > 125 and g < 135):
        return 'clothes', '服饰层次'

    # Shadow & celestial highlights / blushes / ambient occlusion
    return 'shadow_highlight', '阴影高光'

with open('src/data/sylphieCompact.json', 'r', encoding='utf-8') as f:
    syl = json.load(f)

counts = {}
for s in syl['steps']:
    layer, _ = classify_sylphie_stroke(s['i'], s.get('t', ''), s.get('e', ''), s['x'])
    counts[layer] = counts.get(layer, 0) + 1

print("Sylphie New Classification Counts:")
for k, v in sorted(counts.items()):
    print(f"  {k:18s}: {v}")
