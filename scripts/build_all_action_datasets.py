import os
import sys
import json
import re
import cv2
import numpy as np
import xml.etree.ElementTree as ET
import vtracer

def read_img_safe(p):
    data = np.fromfile(p, dtype=np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 6:
        try:
            return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
        except ValueError:
            pass
    return (255, 255, 255)

def round_d(d):
    return re.sub(r'(\d+\.\d{2,})', lambda m: f'{float(m.group(1)):.1f}', d)

def preprocess_with_enhanced_lineart(input_img_path, output_png_path, target_h=1200, ink_thresh=22, cel_sigma=65):
    img = read_img_safe(input_img_path)
    if img is None:
        raise ValueError(f"Cannot read image: {input_img_path}")
    h, w = img.shape[:2]
    target_w = int(w * (target_h / h))
    img_up = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_CUBIC)

    # 1. Edge-preserving smoothing for clean line detection
    gray = cv2.cvtColor(img_up, cv2.COLOR_BGR2GRAY)
    smooth_gray = cv2.bilateralFilter(gray, 9, 60, 60)

    # 2. Difference of Gaussians (DoG) for crisp manga line detection
    g1 = cv2.GaussianBlur(smooth_gray, (0, 0), 0.6)
    g2 = cv2.GaussianBlur(smooth_gray, (0, 0), 1.8)
    dog = cv2.subtract(g2, g1)
    norm = cv2.normalize(dog, None, 0, 255, cv2.NORM_MINMAX)

    # Threshold for solid, continuous ink
    _, ink_mask = cv2.threshold(norm, ink_thresh, 255, cv2.THRESH_BINARY)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    ink_clean = cv2.morphologyEx(ink_mask, cv2.MORPH_CLOSE, kernel)

    # 3. Bilateral cel smoothing: eliminate fragmented oil-paint dabs
    cel = cv2.bilateralFilter(img_up, d=11, sigmaColor=cel_sigma, sigmaSpace=cel_sigma)
    cel = cv2.bilateralFilter(cel, d=9, sigmaColor=int(cel_sigma * 0.8), sigmaSpace=int(cel_sigma * 0.8))

    # 4. Superimpose weighted black ink onto cel flats
    ink_blur = cv2.GaussianBlur(ink_clean, (3, 3), 0.5)
    ink_factor = (255 - ink_blur).astype(np.float32) / 255.0
    ink_3ch = np.dstack([ink_factor, ink_factor, ink_factor])

    # Deep obsidian ink (#14121F) on boundaries
    composite = (cel.astype(np.float32) * (0.08 + 0.92 * ink_3ch)).clip(0, 255).astype(np.uint8)

    os.makedirs(os.path.dirname(output_png_path), exist_ok=True)
    cv2.imwrite(output_png_path, composite)
    print(f"Preprocessed with enhanced lineart: {output_png_path}")

def is_skin_tone(r, g, b, lum):
    # Warm peach/ivory/cream anime skin tones
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

def classify_layer(path_elem, archetype_type):
    fill = path_elem.attrib.get('fill', '#FFFFFF')
    rgb = hex_to_rgb(fill)
    r, g, b = rgb
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    d_str = path_elem.attrib.get('d', '')
    
    # Estimate path bounding box if coordinates present
    nums = [float(x) for x in re.findall(r'[-+]?(?:\d*\.\d+|\d+)', d_str)]
    w, h, cx, cy = 0.0, 0.0, 400.0, 500.0
    if len(nums) >= 4:
        xs, ys = nums[0::2], nums[1::2]
        w = max(xs) - min(xs)
        h = max(ys) - min(ys)
        cx = (min(xs) + max(xs)) / 2.0
        cy = (min(ys) + max(ys)) / 2.0

    # 1. Background Plates & Ambient Effects
    if (w >= 450 and h >= 550 and (cx < 200 or cy < 200)) or (w >= 650 and h >= 800):
        return 'background', '背景特效'

    # 2. Line Art: Deep obsidian & dark colored ink
    if path_elem.attrib.get('fill') == 'none' and 'stroke' in path_elem.attrib:
        return 'line_art', '线条勾勒'
    if lum < 65 and not (cy > 450 and w > 100 and h > 100):
        return 'line_art', '线条勾勒'
    if lum < 78 and w < 250 and h < 250:
        return 'line_art', '线条勾勒'

    # 3. Eyes & Iris
    if (240 <= cx <= 560 and 200 <= cy <= 510) and w < 85 and h < 75:
        if (r > 165 and g > 115 and b < 125 and r > b + 30) or (r > 195 and g > 140 and b < 110):
            return 'iris', '五官眼眸'
        if archetype_type in ['makima', 'tennis'] and (r > 160 and g < 100 and b < 100):
            return 'iris', '五官眼眸'
        if archetype_type in ['ethereal', 'miku'] and (b > 140 and g > 110 and r < 130):
            return 'iris', '五官眼眸'
        if lum > 240 and w < 60 and h < 45:
            return 'iris', '五官眼眸'
        if lum < 45 and w < 30 and h < 30:
            return 'iris', '五官眼眸'

    # 4. Skin & Body
    if is_skin_tone(r, g, b, lum):
        if archetype_type == 'stretch' and (r > 205 and b > 155 and r - g > 25 and cy < 360 and (w > 60 or h > 60)):
            return 'hair', '发型轮廓'
        if archetype_type == 'foxear' and (r > 210 and g > 170 and b < 110):
            return 'hair', '发型轮廓'
        return 'skin_body', '身体肤色'

    # 5. Hair & Clothes by Archetype
    if archetype_type == 'stretch':  # Morning stretch: pink hair, white shirt
        if (r > 200 and b > 160 and g < 170) or (r > 190 and b > 180):
            return 'hair', '发型轮廓'
        if lum > 210 or (lum < 110 and cy > 450):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'glance':  # Backless glance: lilac hair, dark gown
        if (lum < 90) or (r > 130 and g < 100 and b > 130 and cy > 450):
            return 'clothes', '服饰层次'
        if (b > 140 and r > 130 and abs(r-b) < 40) or (lum > 160 and b > g and cy < 500):
            return 'hair', '发型轮廓'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'tennis':  # Athletic tennis: silver hair, red polo
        if (r > 160 and g < 110 and b < 110) or (r > 180 and g > 150 and b > 150 and cy > 420):
            return 'clothes', '服饰层次'
        if (lum > 170 and abs(r-b) < 20 and abs(r-g) < 20 and cy < 450):
            return 'hair', '发型轮廓'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'ethereal':  # Ethereal floating spirit: white dress, silver hair, blue eyes
        if lum > 215 and cy > 420:
            return 'clothes', '服饰层次'
        if (lum > 175 and abs(r-b) < 25 and cy < 450):
            return 'hair', '发型轮廓'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'makima':  # Makima: crimson hair, gold concentric eyes, suit
        if (r > 150 and g < 70 and b < 80) or (r > 180 and g < 90):
            return 'hair', '发型轮廓'
        if (lum < 95) or (lum > 220 and cy > 400):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'miku':  # Miku: cyan twintails, blue-white swimsuit
        if (g > 150 and b > 150 and r < 140) or (b > 160 and g > 140 and r < 120):
            return 'hair', '发型轮廓'
        if (b > 150 and r < 130) or (lum < 95 and cy > 400):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'foxear':  # Fox-ear field maiden: golden hair, orange flowers
        if (r > 180 and g > 140 and b < 100) or (r > 200 and g > 160 and b < 110):
            return 'hair', '发型轮廓'
        if (lum > 180 and r > 160 and g > 150 and b > 140) or (r > 190 and g < 110 and b < 60):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    # 6. Fallback
    if cy < 360:
        return 'hair', '发型轮廓'
    elif cy > 450:
        return 'clothes', '服饰层次'
    return 'shadow_highlight', '阴影高光'

def build_compact_dataset(svg_path, archetype_type, output_path, title, stage1_sketches, stage5_overlays):
    print(f"\nBuilding compact dataset [{archetype_type}]: {svg_path}...")
    tree = ET.parse(svg_path)
    root = tree.getroot()
    raw_paths = list(root)
    print(f"[{archetype_type}] Found {len(raw_paths)} true spline paths.")

    orig_w = float(root.attrib.get('width', 800))
    orig_h = float(root.attrib.get('height', 1000))
    scale_y = 1000.0 / orig_h if orig_h > 0 else 1.0
    scale_x = scale_y
    scaled_w = orig_w * scale_x
    offset_x = (800.0 - scaled_w) / 2.0

    steps = []
    current_id = 1

    # Stage 1: Hand-drawn Sketches & Structure
    for s in stage1_sketches:
        steps.append({
            'i': current_id,
            's': 'stage-1',
            'l': s['l'],
            't': s['t'],
            'd': s['d'],
            'e': s['e'],
            'x': s['x']
        })
        current_id += 1

    # Stage 2 (Base Color), Stage 3 (Cel Shading), Stage 4 (Details & Crisp Ink Lines)
    total_raw = len(raw_paths)
    s2_cut = int(total_raw * 0.20)
    s3_cut = int(total_raw * 0.60)

    for i, p in enumerate(raw_paths):
        d = round_d(p.attrib.get('d', ''))
        fill = p.attrib.get('fill', '#000000')
        t = p.attrib.get('transform', '')
        combined_t = f'translate({offset_x:.1f}, 0) scale({scale_x:.4f}, {scale_y:.4f}) {t}'.strip()
        layer_id, layer_name = classify_layer(p, archetype_type)

        if i < s2_cut:
            stage_id = 'stage-2'
            stage_desc = '底色平涂 · 纯净赛璐璐大块面'
        elif i < s3_cut:
            stage_id = 'stage-3'
            stage_desc = '硬边转折 · 结构光影与几何切面'
        else:
            stage_id = 'stage-4'
            stage_desc = '重磅墨线 · 高清晰度发丝与微结构统摄'

        elem_id = f'{archetype_type}-p{i+1}'
        xml_patch = f'<path id="{elem_id}" fill="{fill}" d="{d}" transform="{combined_t}" />'

        steps.append({
            'i': current_id,
            's': stage_id,
            'l': layer_id,
            't': f'{layer_name}精细笔触 #{i+1}',
            'd': f'{stage_desc} (色值: {fill})',
            'e': elem_id,
            'x': xml_patch
        })
        current_id += 1

    # Stage 5: Master Polish & Atmosphere
    for s in stage5_overlays:
        steps.append({
            'i': current_id,
            's': 'stage-5',
            'l': s['l'],
            't': s['t'],
            'd': s['d'],
            'e': s['e'],
            'x': s['x']
        })
        current_id += 1

    s1 = [s for s in steps if s['s'] == 'stage-1']
    s2 = [s for s in steps if s['s'] == 'stage-2']
    s3 = [s for s in steps if s['s'] == 'stage-3']
    s4 = [s for s in steps if s['s'] == 'stage-4']
    s5 = [s for s in steps if s['s'] == 'stage-5']

    stages = [
        {'id': 'stage-1', 'stageNumber': 1, 'name': '01初版草图', 'subtitle': f'手绘构图与五官透视定位 ({len(s1)}真笔步)', 'startStep': s1[0]['i'], 'endStep': s1[-1]['i'], 'description': '确定动态中轴、脸部三庭五眼视平线与角色神韵'},
        {'id': 'stage-2', 'stageNumber': 2, 'name': '02底色铺设', 'subtitle': f'通透二次元平涂大色块 ({len(s2)}真笔步)', 'startStep': s2[0]['i'], 'endStep': s2[-1]['i'], 'description': '平涂纯净通透动漫基底色，拒绝油画混杂斑块'},
        {'id': 'stage-3', 'stageNumber': 3, 'name': '03结构阴影', 'subtitle': f'硬边赛璐璐切面光影 ({len(s3)}真笔步)', 'startStep': s3[0]['i'], 'endStep': s3[-1]['i'], 'description': '精准切割一阶与二阶遮挡投影，利落几何折面'},
        {'id': 'stage-4', 'stageNumber': 4, 'name': '04细部雕琢', 'subtitle': f'加重黑墨线与高阶微结构 ({len(s4)}真笔步)', 'startStep': s4[0]['i'], 'endStep': s4[-1]['i'], 'description': '重磅墨线统摄轮廓、发丝尖锐转折、眼睫毛体量与服饰精工'},
        {'id': 'stage-5', 'stageNumber': 5, 'name': '05神圣光晕', 'subtitle': f'点睛高光与大师润色 ({len(s5)}真笔步)', 'startStep': s5[0]['i'], 'endStep': s5[-1]['i'], 'description': '瞳孔四角星芒、手绘签名、环境高光覆层，商业插画终局'}
    ]

    out_data = {
        'title': title,
        'stages': stages,
        'steps': steps
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(out_data, f, ensure_ascii=False)

    file_size_mb = os.path.getsize(output_path) / 1024 / 1024
    print(f"Successfully generated {output_path}: {len(steps)} true strokes. Size: {file_size_mb:.2f} MB")

def main():
    ref_dir = 'C:/Users/Administrator/.gemini/antigravity/brain/8fbe7062-9c3c-414d-bf07-0dc5d17a8192/ref_study'

    configs = [
        {
            'key': 'stretch',
            'raw': os.path.join(ref_dir, 'action_stretch.jpg'),
            'prep': 'scratch/stretch_sharp_pre.png',
            'svg': 'scratch/stretch_sharp_svg.svg',
            'out': 'src/data/stretchCompact.json',
            'title': '晨光舒展 · 伸懒腰少女 (Morning Stretch - Soft Dawn Maiden)',
            's1': [
                {'l': 'line_art', 't': '双臂上扬舒展中轴骨架', 'd': '清晨伸懒腰仰头微倾中轴曲线', 'e': 'stretch-sk-pose', 'x': '<path id="stretch-sk-pose" data-sketch="true" d="M 400 350 C 360 200 480 80 520 40 M 380 500 L 380 900" stroke="#F43F5E" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
                {'l': 'line_art', 't': '微仰闭目甜美侧脸轮廓', 'd': '侧仰角三庭五眼视平线与微笑唇线', 'e': 'stretch-sk-face', 'x': '<circle id="stretch-sk-face" data-sketch="true" cx="420" cy="440" r="100" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.2" />'}
            ],
            's5': [
                {'l': 'shadow_highlight', 't': '窗边透射丁达尔晨曦光柱', 'd': '大师点睛 · 清晨第一缕微风与窗光粒子', 'e': 'stretch-sunbeam', 'x': '<g id="stretch-sunbeam"><polygon points="100,0 280,0 600,1000 380,1000" fill="#FEF08A" opacity="0.12" /><circle cx="340" cy="380" r="3.5" fill="#FFFFFF" opacity="0.8" /></g>'}
            ]
        },
        {
            'key': 'glance',
            'raw': os.path.join(ref_dir, 'action_glance.jpg'),
            'prep': 'scratch/glance_sharp_pre.png',
            'svg': 'scratch/glance_sharp_svg.svg',
            'out': 'src/data/glanceCompact.json',
            'title': '高贵晚宴 · 露背礼服回眸 (Backless Evening Gown Glance)',
            's1': [
                {'l': 'line_art', 't': '侧身回眸 S 型脊椎流线骨架', 'd': '优雅大露背与侧头回眸视线对齐', 'e': 'glance-sk-spine', 'x': '<path id="glance-sk-spine" data-sketch="true" d="M 460 200 C 400 380 430 600 380 850" stroke="#A855F7" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
                {'l': 'clothes', 't': '黑丝绒晚礼服腰臀大转折', 'd': '高定晚礼服剪裁边缘定界', 'e': 'glance-sk-dress', 'x': '<path id="glance-sk-dress" data-sketch="true" d="M 360 550 Q 450 620 480 750" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.2" />'}
            ],
            's5': [
                {'l': 'shadow_highlight', 't': '背部脊椎柔滑丝缎轮廓光', 'd': '大师点睛 · 晚宴水晶吊灯侧逆光', 'e': 'glance-rim-light', 'x': '<g id="glance-rim-light"><path d="M 450 320 Q 420 500 440 680" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.85" /><circle cx="390" cy="360" r="3" fill="#E9D5FF" /></g>'}
            ]
        },
        {
            'key': 'tennis',
            'raw': os.path.join(ref_dir, 'action_tennis.jpg'),
            'prep': 'scratch/tennis_sharp_pre.png',
            'svg': 'scratch/tennis_sharp_svg.svg',
            'out': 'src/data/tennisCompact.json',
            'title': '青春活力 · 银发红瞳网球少女 (Athletic Tennis Girl)',
            's1': [
                {'l': 'line_art', 't': '网球击球挥拍斜角动势中轴', 'd': '侧身握拍与红白遮阳帽空间透视', 'e': 'tennis-sk-swing', 'x': '<path id="tennis-sk-swing" data-sketch="true" d="M 520 180 L 320 850 M 240 680 L 150 920" stroke="#EF4444" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'}
            ],
            's5': [
                {'l': 'shadow_highlight', 't': '红宝石晶亮汗珠与阳光折射', 'd': '大师点睛 · 运动活力汗水高光与晴空光晕', 'e': 'tennis-sweat-glint', 'x': '<g id="tennis-sweat-glint"><circle cx="410" cy="420" r="2.5" fill="#FFFFFF" /><circle cx="430" cy="450" r="2" fill="#FFFFFF" opacity="0.9" /></g>'}
            ]
        },
        {
            'key': 'ethereal',
            'raw': os.path.join(ref_dir, 'action_ethereal.jpg'),
            'prep': 'scratch/ethereal_sharp_pre.png',
            'svg': 'scratch/ethereal_sharp_svg.svg',
            'out': 'src/data/etherealCompact.json',
            'title': '空灵幻梦 · 悬浮抱膝精灵 (Ethereal Floating Spirit)',
            's1': [
                {'l': 'line_art', 't': '半空悬浮抱膝赤足动态框', 'd': '零重力漂浮姿态与白裙失重蓬松感', 'e': 'ethereal-sk-float', 'x': '<ellipse id="ethereal-sk-float" data-sketch="true" cx="440" cy="480" rx="200" ry="240" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.5" />'}
            ],
            's5': [
                {'l': 'shadow_highlight', 't': '身侧环绕幽灵小精灵微光', 'd': '大师点睛 · 灵动陪伴小幽灵与星尘光环', 'e': 'ethereal-spirits', 'x': '<g id="ethereal-spirits" fill="#BAE6FD" opacity="0.85"><circle cx="280" cy="320" r="5" /><circle cx="620" cy="400" r="6" /><circle cx="340" cy="650" r="4" /></g>'}
            ]
        },
        {
            'key': 'makima',
            'raw': os.path.join(ref_dir, 'action_makima.png'),
            'prep': 'scratch/makima_sharp_pre.png',
            'svg': 'scratch/makima_sharp_svg.svg',
            'out': 'src/data/makimaCompact.json',
            'title': '支配恶魔 · 单手遮面狂气魔眼 (Makima - Dominant Gaze)',
            's1': [
                {'l': 'line_art', 't': '掌心遮面手部极端透视骨架', 'd': '手掌骨节张开与指缝露出的单只金色魔眼定位', 'e': 'makima-sk-hand', 'x': '<path id="makima-sk-hand" data-sketch="true" d="M 420 320 L 300 240 M 440 310 L 380 180 M 460 320 L 460 160 M 480 330 L 530 200" stroke="#F43F5E" stroke-dasharray="4,4" fill="none" opacity="0.5" stroke-width="1.8" />'}
            ],
            's5': [
                {'l': 'iris', 't': '猩红背景下金色同心圆支配魔眼', 'd': '大师点睛 · 标志性金色环状多重同心圆瞳孔', 'e': 'makima-eye-rings', 'x': '<g id="makima-eye-rings"><circle cx="445" cy="380" r="9" stroke="#FBBF24" stroke-width="1.5" fill="none" opacity="0.95" /><circle cx="445" cy="380" r="5" stroke="#F59E0B" stroke-width="1.2" fill="none" /><circle cx="445" cy="380" r="2" fill="#D97706" /></g>'}
            ]
        },
        {
            'key': 'miku',
            'raw': os.path.join(ref_dir, 'action_miku.jpg'),
            'prep': 'scratch/miku_sharp_pre.png',
            'svg': 'scratch/miku_sharp_svg.svg',
            'out': 'src/data/mikuCompact.json',
            'title': '清爽夏日 · 初音双马尾泳装原画 (Miku Summer Swimwear)',
            's1': [
                {'l': 'hair', 't': '双侧及膝飘逸苍绿双马尾大动势', 'd': '标志性对称超长双马尾抛物线', 'e': 'miku-sk-twintails', 'x': '<path id="miku-sk-twintails" data-sketch="true" d="M 320 280 C 180 400 120 700 140 920 M 480 280 C 620 400 680 700 660 920" stroke="#10B981" stroke-dasharray="5,4" fill="none" opacity="0.45" stroke-width="1.5" />'}
            ],
            's5': [
                {'l': 'shadow_highlight', 't': '手绘日文签名与元气腮红', 'd': '大师点睛 · 画师亲笔签名与阳光高光', 'e': 'miku-signature', 'x': '<g id="miku-signature"><circle cx="375" cy="365" r="3" fill="#FFFFFF" /><circle cx="445" cy="365" r="3" fill="#FFFFFF" /></g>'}
            ]
        },
        {
            'key': 'foxear',
            'raw': os.path.join(ref_dir, 'action_foxear.jpg'),
            'prep': 'scratch/foxear_sharp_pre.png',
            'svg': 'scratch/foxear_sharp_svg.svg',
            'out': 'src/data/foxearCompact.json',
            'title': '田园花海 · 金发兽耳抚花少女 (Fox-Ear Field Maiden)',
            's1': [
                {'l': 'hair', 't': '毛茸茸狐耳与金发麻花辫中轴', 'd': '头顶兽耳三角形与单侧下垂麻花辫', 'e': 'foxear-sk-ears', 'x': '<polygon id="foxear-sk-ears" data-sketch="true" points="480,240 520,100 580,220" stroke="#F59E0B" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'}
            ],
            's5': [
                {'l': 'shadow_highlight', 't': '万寿菊花瓣透光碎金与湖蓝眼眸高光', 'd': '大师点睛 · 阳光穿透金橘花瓣环境泛光', 'e': 'foxear-bloom-glow', 'x': '<g id="foxear-bloom-glow" fill="#FEF08A" opacity="0.8"><circle cx="420" cy="480" r="3" /><circle cx="490" cy="520" r="4" /></g>'}
            ]
        }
    ]

    for c in configs:
        preprocess_with_enhanced_lineart(c['raw'], c['prep'], target_h=1200, ink_thresh=22, cel_sigma=65)
        vtracer.convert_image_to_svg_py(
            c['prep'], c['svg'],
            colormode='color',
            hierarchical='stacked',
            mode='spline',
            filter_speckle=8,
            color_precision=7,
            layer_difference=16
        )
        build_compact_dataset(c['svg'], c['key'], c['out'], c['title'], c['s1'], c['s5'])

    print("\nAll 7 new master action datasets successfully vectorized and created!")

if __name__ == '__main__':
    main()
