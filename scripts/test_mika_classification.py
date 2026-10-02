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
    if r > 195 and g > 155 and b > 135:
        if r >= g and g >= b - 12:
            rb_diff = r - b
            rg_diff = r - g
            if 10 <= rb_diff <= 75 and rg_diff <= 42:
                if lum > 165:
                    return True
    if 170 <= r <= 225 and 130 <= g <= 185 and 110 <= b <= 165:
        if r > g and g >= b - 5:
            if 15 <= (r - b) <= 65 and (r - g) <= 38:
                return True
    return False

def classify_mika_stroke(idx, title, elem_id, xml_str):
    fill, (r, g, b), lum, min_x, min_y, max_x, max_y, w, h, cx, cy = parse_bbox_and_pos(xml_str)
    t_lower = (title + ' ' + elem_id).lower()

    # Stage 1 Sketches
    if idx == 1 or idx == 2:
        return 'line_art', '线条勾勒'
    if idx == 3 or idx == 8:
        return 'skin_body', '身体骨架'
    if idx == 4 or idx == 5:
        return 'iris', '五官眼眸'
    if idx == 6:
        return 'hair', '发型轮廓'
    if idx == 7 or idx == 9:
        return 'clothes', '服饰结构'
    if idx == 10:
        return 'background', '光环基准'

    # Background canvas plates
    if (w >= 450 and h >= 550 and (min_x <= 100 or min_y <= 100)) or (w >= 600 and h >= 800):
        return 'background', '环境背景'
    if any(k in t_lower for k in ['halo', 'sparkle', 'particle', 'star-pupil', 'butterfly', 'butterflies', 'cloud', 'sky']):
        if 'star-pupil' in t_lower:
            return 'iris', '星芒瞳孔'
        return 'background', '背景特效'

    # Eyes & Iris
    if any(k in t_lower for k in ['iris', 'pupil', 'sclera', 'catchlight', 'star-pupil', 'eyelash', 'brow', 'lips', 'mouth']):
        return 'iris', '五官眼眸'
    if (250 <= cx <= 540 and 220 <= cy <= 440) and w < 85 and h < 75:
        if (r > 165 and g > 115 and b < 125 and r > b + 35) or (r > 200 and g > 145 and b < 110):
            return 'iris', '五官眼眸'
        if lum > 245 and w < 60 and h < 45:
            return 'iris', '晶莹眼部'
        if lum < 50 and w < 30 and h < 30:
            return 'iris', '曜黑瞳孔'

    # Line Art
    if 'fill="none"' in xml_str and 'stroke=' in xml_str:
        return 'line_art', '线条勾勒'
    if lum < 90 and not (cy > 450 and w > 100 and h > 100) and (w < 400 or h < 400):
        # Dark lines in upper/mid body
        if (r < 80 and g < 90 and b < 120):
            return 'line_art', '线条勾勒'

    # Skin & Body
    if is_skin_tone(r, g, b, lum):
        # Exclude hair if distinctly pink and in upper head
        if (r > 205 and b > 155 and r - g > 30 and cy < 380 and (w > 60 or h > 60)):
            return 'hair', '发型轮廓'
        return 'skin_body', '身体肌肤'

    # Shadow & Highlights
    if any(k in t_lower for k in ['shadow', 'highlight', 'shade', 'blush', 'occlusion', 'specular', 'ring', 'gloss']):
        return 'shadow_highlight', '光影阴影'
    # Blush
    if (r > 215 and g < 165 and b < 175 and 320 <= cy <= 480 and w < 85 and h < 55):
        return 'shadow_highlight', '元气腮红'
    # Hair / Cloth specular
    if lum > 240 and cy < 350 and w < 160 and h < 50:
        return 'shadow_highlight', '发顶高光'

    # Hair vs Clothes
    # Pink hair
    if (r > 175 and b > 130 and r > g + 15) or (r > 195 and b > 150) or (r > 170 and b > 140 and g < 155):
        if cy < 650:
            return 'hair', '发型轮廓'
    
    # Clothes (White capelet, uniform, ribbons, skirt)
    if any(k in t_lower for k in ['clothes', 'dress', 'skirt', 'shirt', 'collar', 'ribbon', 'uniform', 'capelet', 'scrunchie', 'button', 'brooch', 'corset', 'boots', 'socks']):
        return 'clothes', '服饰配饰'
    
    # Blue ribbons / skirt / scrunchie
    if (b > 115 and b > r + 15 and b > g + 10):
        return 'clothes', '服饰层次'
    # White capelet / shirt
    if lum > 215 and cy > 350:
        return 'clothes', '服饰层次'

    if cy < 380:
        return 'hair', '发型轮廓'
    return 'clothes', '服饰层次'

with open('src/data/masterMikaCompact.json', 'r', encoding='utf-8') as f:
    mika = json.load(f)

counts = {}
for s in mika['steps']:
    layer, _ = classify_mika_stroke(s['i'], s.get('t', ''), s.get('e', ''), s['x'])
    counts[layer] = counts.get(layer, 0) + 1

print("Master Mika New Classification Counts:")
for k, v in sorted(counts.items()):
    print(f"  {k:18s}: {v}")
