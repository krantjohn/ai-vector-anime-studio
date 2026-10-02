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
    if r > 190 and g > 150 and b > 130:
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

def classify_any_stroke(char_name, idx, title, elem_id, xml_str):
    fill, (r, g, b), lum, min_x, min_y, max_x, max_y, w, h, cx, cy = parse_bbox_and_pos(xml_str)
    t_lower = (title + ' ' + elem_id).lower()

    # 1. Stage 1 Guide Sketches
    if 'data-sketch="true"' in xml_str:
        if any(k in t_lower for k in ['eye', 'iris', 'pupil', 'sclera']):
            return 'iris', '五官眼眸'
        if any(k in t_lower for k in ['hair', 'bangs', 'twin', 'odango']):
            return 'hair', '发型轮廓'
        if any(k in t_lower for k in ['jaw', 'face', 'neck', 'spine', 'torso', 'body', 'finger', 'hand']):
            return 'skin_body', '身体骨架'
        if any(k in t_lower for k in ['dress', 'cloth', 'collar', 'shirt', 'corset', 'skirt', 'polo']):
            return 'clothes', '服饰结构'
        if any(k in t_lower for k in ['halo', 'wing', 'butterfl', 'sparkle']):
            return 'background', '特效引导'
        return 'line_art', '线条勾勒'

    # 2. Background Plates & Ambient Effects
    if elem_id in [f'{char_name}-p1', f'{char_name}-p2', 'mika-p1', 'mika-p2', 'mika-p3', 'sylphie-p1', 'sylphie-p2']:
        return 'background', '环境背景'
    if (w >= 450 and h >= 550 and (min_x <= 100 or min_y <= 100)) or (w >= 650 and h >= 800):
        return 'background', '环境背景'
    if any(k in t_lower for k in ['butterfl', 'particle', 'bloom', 'aura', 'sparkle', 'stardust', 'sky', 'cloud', 'ocean', 'backdrop', 'beach-sand', 'umbrella']):
        return 'background', '背景特效'
    if 'halo' in t_lower and not ('hair' in t_lower):
        return 'background', '神圣光环'

    # 3. Line Art: Pure stroke outlines & Deep Obsidian Ink Lines
    if 'fill="none"' in xml_str and 'stroke=' in xml_str:
        return 'line_art', '线条勾勒'
    if lum < 65 and not (cy > 450 and w > 100 and h > 100):
        if char_name in ['kisaki', 'shrine'] and cy < 450 and (w > 50 or h > 50):
            return 'hair', '发型轮廓'
        return 'line_art', '线条勾勒'
    if char_name == 'masterMika' and lum < 90 and (r < 80 and g < 90 and b < 120) and (w < 400 or h < 400):
        return 'line_art', '线条勾勒'

    # 4. Eyes & Facial Features
    if any(k in t_lower for k in ['iris', 'pupil', 'sclera', 'catchlight', 'star-pupil', 'eyelash', 'brow', 'lips', 'mouth', 'teeth', 'smile']):
        return 'iris', '五官眼眸'
    if (240 <= cx <= 560 and 200 <= cy <= 450) and w < 85 and h < 75:
        # Amber/gold iris
        if (r > 165 and g > 115 and b < 125 and r > b + 30) or (r > 195 and g > 140 and b < 110):
            return 'iris', '五官眼眸'
        # Red iris (Vampire, Tennis, Makima)
        if char_name in ['vampire', 'tennis', 'makima'] and (r > 160 and g < 100 and b < 100):
            return 'iris', '赤红眼瞳'
        # Blue/cyan iris (Plana, Ethereal, Miku)
        if char_name in ['plana', 'ethereal', 'miku'] and (b > 140 and g > 110 and r < 130):
            return 'iris', '蔚蓝眼眸'
        # White sclera / glints
        if lum > 240 and w < 60 and h < 45:
            return 'iris', '晶莹眼部'
        # Deep pupil
        if lum < 45 and w < 30 and h < 30:
            return 'iris', '曜黑瞳孔'

    # 5. Skin & Body
    if is_skin_tone(r, g, b, lum):
        if char_name in ['sylphie', 'masterMika', 'penia', 'stretch'] and (r > 205 and b > 155 and r - g > 25 and cy < 360 and (w > 60 or h > 60)):
            return 'hair', '发型轮廓'
        if char_name == 'foxear' and (r > 210 and g > 170 and b < 110):
            return 'hair', '发型轮廓'
        return 'skin_body', '身体肌肤'

    # 6. Hair vs Clothes by Character Palette
    if char_name in ['sylphie', 'masterMika', 'penia', 'stretch']: # Pink hair
        if (r > 175 and b > 130 and r > g + 15) or (r > 195 and b > 150) or (r > 170 and b > 140 and g < 155) or (r > 160 and b > 140 and r > g + 10):
            if cy < 650:
                return 'hair', '发型轮廓'
    elif char_name == 'miku': # Cyan hair
        if (g > 120 and b > 130 and r < 150) or (b > 135 and g > 130 and r < 130) or (g > 150 and b > 150 and r < 140):
            return 'hair', '发型轮廓'
    elif char_name == 'foxear': # Golden hair
        if (r > 170 and g > 130 and b < 125 and r - b > 55) or (r > 180 and g > 140 and b < 100):
            return 'hair', '发型轮廓'
    elif char_name == 'makima': # Crimson hair
        if (r > 140 and g < 95 and b < 95) or (r > 150 and g < 70 and b < 80):
            return 'hair', '发型轮廓'
    elif char_name == 'glance': # Lilac hair
        if (b > 125 and r > 115 and abs(r-b) < 45 and lum > 130) or (b > 140 and r > 130 and abs(r-b) < 40):
            if cy < 500:
                return 'hair', '发型轮廓'
    elif char_name in ['tennis', 'ethereal', 'vampire', 'plana', 'shiroko']: # Silver / white hair
        if (lum > 145 and abs(r-b) < 30 and abs(r-g) < 30) and cy < 480:
            return 'hair', '发型轮廓'
    elif char_name == 'rico': # Indigo hair
        if (b > 110 and b > r + 15 and b > g + 10) and cy < 520:
            return 'hair', '发型轮廓'
    elif char_name in ['kisaki', 'shrine']: # Black hair
        if lum < 95 and cy < 520:
            return 'hair', '发型轮廓'

    # Explicit Clothes keywords
    if any(k in t_lower for k in ['clothes', 'dress', 'skirt', 'shirt', 'collar', 'ribbon', 'uniform', 'capelet', 'scrunchie', 'button', 'brooch', 'corset', 'boots', 'socks', 'suit', 'tie', 'kimono', 'swimsuit', 'polo']):
        return 'clothes', '服饰配饰'
    
    # Clothes specific color rules per character
    if char_name in ['sylphie']:
        if (b > 115 and b > r + 10) or (b > 125 and g < 135) or (lum < 110 and b > g) or (b > 120 and abs(r-b) < 30 and g < 130):
            return 'clothes', '服饰层次'
    elif char_name in ['masterMika']:
        if (b > 115 and b > r + 10) or (lum > 215 and cy > 350):
            return 'clothes', '服饰层次'
    elif char_name in ['tennis']:
        if (r > 160 and g < 110 and b < 110) or (r > 180 and g > 150 and b > 150):
            return 'clothes', '服饰层次'
    elif char_name in ['glance']:
        if (lum < 95) or (r > 130 and g < 100 and b > 130):
            return 'clothes', '服饰层次'
    elif char_name in ['makima']:
        if (lum < 95) or (lum > 220 and cy > 350):
            return 'clothes', '服饰层次'
    elif char_name in ['miku']:
        if (b > 140 and r < 130) or (lum < 95) or (lum > 220 and cy > 350):
            return 'clothes', '服饰层次'
    elif char_name in ['foxear']:
        if (lum > 180 and r > 160 and g > 150 and b > 140) or (r > 190 and g < 110 and b < 60):
            return 'clothes', '服饰层次'

    # 7. Shading & Highlights
    if any(k in t_lower for k in ['shadow', 'highlight', 'shade', 'blush', 'occlusion', 'specular', 'ring', 'gloss']):
        return 'shadow_highlight', '光影阴影'
    if (r > 215 and g < 165 and b < 175 and 300 <= cy <= 480 and w < 85 and h < 55):
        return 'shadow_highlight', '元气腮红'
    if lum > 240 and cy < 340 and w < 160 and h < 50:
        return 'shadow_highlight', '发顶高光'

    # 8. Spatial Fallbacks
    if cy < 360:
        return 'hair', '发型轮廓'
    elif cy > 420:
        return 'clothes', '服饰层次'
    else:
        return 'shadow_highlight', '阴影高光'

# Test on all 18 files
for f in sorted(glob.glob('src/data/*Compact.json')):
    char_name = os.path.basename(f).replace('Compact.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    steps = data.get('steps', [])
    counts = {}
    for s in steps:
        nl, _ = classify_any_stroke(char_name, s['i'], s.get('t', ''), s.get('e', ''), s.get('x', ''))
        counts[nl] = counts.get(nl, 0) + 1
    print(f"{char_name:12s} (total {len(steps):4d}): {counts}")
