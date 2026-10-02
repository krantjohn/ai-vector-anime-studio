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

def is_skin_color(r, g, b, lum):
    # Anime skin tones: warm peach, ivory, soft cream, light blush skin
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

def classify_stroke(char_name, step_idx, total_steps, stage_id, title, elem_id, xml_str):
    fill, (r, g, b), lum, min_x, min_y, max_x, max_y, w, h, cx, cy = parse_bbox_and_pos(xml_str)
    t_lower = (title + ' ' + elem_id).lower()

    # 1. Dedicated Named Sketch Elements (Stage 1)
    if 'data-sketch="true"' in xml_str:
        if any(k in t_lower for k in ['eye', 'iris', 'pupil', 'sclera']):
            return 'iris', '五官眼眸'
        if any(k in t_lower for k in ['hair', 'bangs', 'twin', 'odango']):
            return 'hair', '发型轮廓'
        if any(k in t_lower for k in ['jaw', 'face', 'neck', 'spine', 'torso', 'body', 'finger', 'hand']):
            return 'skin_body', '身体骨架'
        if any(k in t_lower for k in ['dress', 'cloth', 'collar', 'shirt', 'corset', 'skirt']):
            return 'clothes', '服饰结构'
        if any(k in t_lower for k in ['halo', 'wing', 'butterfl', 'sparkle']):
            return 'background', '特效引导'
        return 'line_art', '线条勾勒'

    # 2. Background & Environment & Canvas Plates
    # Giant canvas plates
    if (w >= 450 and h >= 550 and (min_x <= 100 or min_y <= 100)) or (w >= 650 and h >= 800):
        return 'background', '环境背景'
    if 'canvas-paper-bg' in elem_id or 'backdrop' in t_lower or 'background' in t_lower:
        return 'background', '环境背景'
    # Floating atmospheric particles, magical butterflies, sparkles, stardust, halos
    if any(k in t_lower for k in ['butterfl', 'particle', 'bloom', 'aura', 'sparkle', 'stardust', 'sky', 'cloud', 'ocean', 'beach-sand', 'umbrella']):
        return 'background', '背景特效'
    if 'halo' in t_lower and not ('hair' in t_lower):
        return 'background', '神圣光环'

    # 3. Eyes & Facial Features (Iris, pupil, catchlight, sclera, smile lips)
    if any(k in t_lower for k in ['iris', 'pupil', 'sclera', 'catchlight', 'star-pupil', 'eyelash', 'brow', 'lips', 'mouth', 'teeth', 'smile']):
        return 'iris', '五官眼眸'
    # Spatial eye zone detection (240 <= cx <= 560 and 200 <= cy <= 450)
    if (250 <= cx <= 550 and 200 <= cy <= 450) and w < 90 and h < 75:
        # Amber/gold eye
        if (r > 165 and g > 115 and b < 125 and r > b + 35) or (r > 200 and g > 145 and b < 110):
            return 'iris', '五官眼眸'
        # White sclera or glint
        if lum > 240 and w < 65 and h < 50:
            return 'iris', '晶莹眼部'
        # Deep black pupil
        if lum < 45 and w < 30 and h < 30:
            return 'iris', '曜黑瞳孔'

    # 4. Line Art: Crisp ink contours & Difference of Gaussians lines
    # Pure stroke line
    if 'fill="none"' in xml_str and 'stroke=' in xml_str:
        return 'line_art', '线条勾勒'
    # Dark black/obsidian ink
    if lum < 60:
        # Check if it's black hair (Kisaki, Shrine, Makima)
        if char_name in ['kisaki', 'shrine', 'cyberpunk'] and cy < 520 and (w > 50 or h > 50):
            if not ('line' in t_lower or 'ink' in t_lower or 'contour' in t_lower):
                return 'hair', '发型轮廓'
        # Check if it's dark clothes in the lower body (Makima suit, Kisaki gown)
        if cy > 480 and (w > 80 and h > 80):
            return 'clothes', '服饰层次'
        return 'line_art', '线条勾勒'

    # 5. Skin & Body
    if any(k in t_lower for k in ['skin', 'neck', 'face-base', 'clavicle', 'shoulder', 'arm', 'leg', 'thigh', 'hand', 'finger', 'bare']):
        return 'skin_body', '身体肌肤'
    if is_skin_color(r, g, b, lum):
        # Disambiguate pink hair
        is_pink_char = char_name in ['sylphie', 'masterMika', 'penia', 'stretch']
        if is_pink_char and (r > 205 and b > 150 and r - g > 25 and cy < 380 and (w > 60 or h > 60)):
            return 'hair', '发型轮廓'
        return 'skin_body', '身体肌肤'

    # 6. Shading & Highlights
    if any(k in t_lower for k in ['shadow', 'highlight', 'shade', 'blush', 'occlusion', 'specular', 'ring', 'gloss']):
        return 'shadow_highlight', '光影阴影'
    # Cheek blushes
    if (r > 215 and g < 165 and b < 175 and 320 <= cy <= 480 and w < 90 and h < 60):
        return 'shadow_highlight', '元气腮红'
    # Angel ring / hair highlights
    if lum > 235 and cy < 340 and w < 160 and h < 50:
        return 'shadow_highlight', '发顶高光'

    # 7. Hair vs Clothes
    if any(k in t_lower for k in ['hair', 'bangs', 'sidelock', 'ahoge', 'twintail', 'odango', 'braid', 'cowlick']):
        return 'hair', '发型轮廓'
    if any(k in t_lower for k in ['clothes', 'dress', 'skirt', 'shirt', 'collar', 'ribbon', 'uniform', 'capelet', 'scrunchie', 'button', 'brooch', 'corset', 'boots', 'socks', 'suit', 'tie', 'kimono', 'swimsuit']):
        return 'clothes', '服饰配饰'

    # Character hair palette
    if char_name in ['sylphie', 'masterMika', 'penia', 'stretch']:
        # Pink hair
        if (r > 175 and b > 130 and r > g + 15) or (r > 195 and b > 150) or (r > 170 and b > 140 and g < 155):
            if cy < 650:
                return 'hair', '发型轮廓'
    elif char_name == 'miku':
        # Cyan hair
        if (g > 120 and b > 130 and r < 150) or (b > 135 and g > 130 and r < 130):
            return 'hair', '发型轮廓'
    elif char_name == 'foxear':
        # Golden hair
        if (r > 170 and g > 130 and b < 125 and r - b > 55):
            if cy < 600:
                return 'hair', '发型轮廓'
    elif char_name == 'makima':
        # Crimson hair
        if (r > 140 and g < 95 and b < 95):
            if cy < 550:
                return 'hair', '发型轮廓'
    elif char_name == 'glance':
        # Lilac hair
        if (b > 125 and r > 115 and abs(r-b) < 45 and lum > 130):
            if cy < 500:
                return 'hair', '发型轮廓'
    elif char_name in ['tennis', 'ethereal', 'vampire', 'plana', 'shiroko']:
        # Silver / white hair
        if (lum > 145 and abs(r-b) < 30 and abs(r-g) < 30):
            if cy < 480:
                return 'hair', '发型轮廓'
    elif char_name == 'rico':
        # Indigo hair
        if (b > 110 and b > r + 15 and b > g + 10):
            if cy < 520:
                return 'hair', '发型轮廓'

    # Fallbacks based on spatial position:
    # Upper head area -> hair
    if cy < 380:
        return 'hair', '发型轮廓'
    # Lower / torso area -> clothes
    return 'clothes', '服饰层次'

# Run on all datasets
for f in sorted(glob.glob('src/data/*Compact.json')):
    char_name = os.path.basename(f).replace('Compact.json', '')
    with open(f, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    steps = data.get('steps', [])
    new_counts = {}
    for s in steps:
        nl, _ = classify_stroke(char_name, s['i'], len(steps), s['s'], s.get('t', ''), s.get('e', ''), s.get('x', ''))
        new_counts[nl] = new_counts.get(nl, 0) + 1
    print(f"{char_name:12s} (total {len(steps):4d}): {new_counts}")
