import os
import sys
import json
import re
import cv2
import numpy as np
import xml.etree.ElementTree as ET
import vtracer

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
    img = cv2.imread(input_img_path)
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

def classify_sylphie_layer(path_elem):
    fill = path_elem.attrib.get('fill', '#FFFFFF')
    rgb = hex_to_rgb(fill)
    r, g, b = rgb
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    t = path_elem.attrib.get('transform', '')
    m = re.search(r'translate\(([\d.]+),([\d.]+)\)', t)
    x, y = (float(m.group(1)), float(m.group(2))) if m else (0, 0)

    # 1. Line art: deep dark ink is ALWAYS crisp lineart
    if lum < 65:
        return 'line_art', '线条勾勒'

    # 2. Iris: Radiant celestial gold & amber stars, pupils, eye area, golden star ornaments
    if (360 <= x <= 540 and 230 <= y <= 335 and (r > 175 and g > 130 and b < 170 and r > b + 15)) or \
       (r > 185 and g > 140 and b < 160 and r > b + 25) or \
       (r > 200 and g > 160 and b < 125):
        return 'iris', '虹膜笔触'

    # 3. Hair: Sakura-pink flowing hair & butterfly bows
    if (r > 190 and b > 140 and r > g + 15) or (r > 210 and b > 165) or \
       (r > 180 and b > 160 and g < 155) or (r > 170 and b > 150 and r > g + 20):
        return 'hair', '发型轮廓'

    # 4. Clothes: Starry blue-purple gradient gown, white corset bodice, thigh-high boots
    if (lum > 210) or (b > 130 and b > r + 15) or (b > 140 and g < 130) or \
       (lum < 110 and b > g) or (b > 120 and abs(r-b) < 30 and g < 130):
        return 'clothes', '服饰层次'

    # 5. Shadow & celestial highlights / butterflies / sparkles
    return 'shadow_highlight', '阴影高光'

def build_sylphie_dataset(svg_path, output_path, title):
    print(f"\nParsing vector SVG: {svg_path}...")
    tree = ET.parse(svg_path)
    root = tree.getroot()
    raw_paths = list(root)
    print(f"Found {len(raw_paths)} true spline paths.")

    orig_w = float(root.attrib.get('width', 800))
    orig_h = float(root.attrib.get('height', 1000))
    scale_y = 1000.0 / orig_h if orig_h > 0 else 1.0
    scale_x = scale_y
    scaled_w = orig_w * scale_x
    offset_x = (800.0 - scaled_w) / 2.0

    steps = []
    current_id = 1

    # Stage 1: Hand-drawn Sketches & Structure (Original Hand-drawn Blueprint)
    stage1_sketches = [
        {
            'l': 'line_art',
            't': '动态脊椎中轴与零重力浮空身姿定界',
            'd': '原创少女纤细身段：S型动势中轴线、头肩比例与零重力微倾视平线',
            'e': 'sylphie-sk-spine',
            'x': '<path id="sylphie-sk-spine" data-sketch="true" d="M 400 120 C 400 240 380 440 430 680 C 450 780 430 880 400 960 M 240 340 L 560 340" stroke="#EC4899" stroke-dasharray="6,4" fill="none" opacity="0.5" stroke-width="1.8" />'
        },
        {
            'l': 'line_art',
            't': '面部三庭五眼与下颌骨架透视',
            'd': '元气微仰视面部椭圆、下颌V字收束与三庭五眼对齐基准',
            'e': 'sylphie-sk-face',
            'x': '<circle id="sylphie-sk-face" data-sketch="true" cx="400" cy="270" r="130" stroke="#F59E0B" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" /><path data-sketch="true" d="M 310 270 Q 400 250 490 270 M 330 350 Q 400 400 470 350" stroke="#F59E0B" stroke-dasharray="3,3" fill="none" opacity="0.4" stroke-width="1.2" />'
        },
        {
            'l': 'iris',
            't': '双眼黄金分割定位与晶莹金瞳定界',
            'd': '左右璀璨金瞳视平线定位矩形、双眼皮折痕与瞳距测量',
            'e': 'sylphie-sk-eyes',
            'x': '<g id="sylphie-sk-eyes" data-sketch="true" stroke="#F59E0B" stroke-dasharray="3,3" fill="none" opacity="0.45" stroke-width="1.2"><rect x="345" y="250" width="48" height="42" rx="4" /><rect x="415" y="250" width="48" height="42" rx="4" /></g>'
        },
        {
            'l': 'hair',
            't': '飘逸动感樱粉长发与双侧星蝶发饰大动势',
            'd': '两侧发丝受星风吹拂向外蓬松扬起，星形发夹与波浪流线',
            'e': 'sylphie-sk-hair',
            'x': '<path id="sylphie-sk-hair" data-sketch="true" d="M 340 180 C 200 120 80 200 60 340 C 40 480 180 540 280 460 M 460 180 C 600 100 740 180 760 320 C 780 460 640 520 540 460" stroke="#F472B6" stroke-dasharray="6,4" fill="none" opacity="0.5" stroke-width="1.8" />'
        },
        {
            'l': 'clothes',
            't': '星空渐变洛丽塔法裙与轻盈手套骨架',
            'd': '双层伞裙外张动势、收腰马甲线、双手平展召唤姿态与过膝靴比例',
            'e': 'sylphie-sk-dress',
            'x': '<path id="sylphie-sk-dress" data-sketch="true" d="M 280 420 L 160 480 M 520 420 L 640 480 M 340 440 Q 400 560 460 440 M 240 520 C 140 680 180 840 320 880 M 560 520 C 660 680 620 840 480 880" stroke="#818CF8" stroke-dasharray="5,4" fill="none" opacity="0.45" stroke-width="1.5" />'
        },
        {
            'l': 'shadow_highlight',
            't': '流光星蝶与星辉幻月召唤轨迹',
            'd': '半空飞舞的流光星蝶飞行弧线与身后斜倚新月透视定界',
            'e': 'sylphie-sk-butterflies',
            'x': '<ellipse id="sylphie-sk-butterflies" data-sketch="true" cx="640" cy="180" rx="100" ry="80" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.5" /><path data-sketch="true" d="M 160 360 Q 220 320 200 400 M 600 300 Q 660 260 640 340" stroke="#38BDF8" stroke-dasharray="3,3" fill="none" opacity="0.4" />'
        }
    ]

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
    s2_cut = int(total_raw * 0.22)
    s3_cut = int(total_raw * 0.62)

    for i, p in enumerate(raw_paths):
        d = round_d(p.attrib.get('d', ''))
        fill = p.attrib.get('fill', '#000000')
        t = p.attrib.get('transform', '')
        combined_t = f'translate({offset_x:.1f}, 0) scale({scale_x:.4f}, {scale_y:.4f}) {t}'.strip()
        layer_id, layer_name = classify_sylphie_layer(p)

        if i < s2_cut:
            stage_id = 'stage-2'
            stage_desc = '底色平涂 · 樱粉金辉固有色通透铺设'
        elif i < s3_cut:
            stage_id = 'stage-3'
            stage_desc = '结构阴影 · 纯净赛璐璐硬折面建模'
        else:
            stage_id = 'stage-4'
            stage_desc = '细部雕琢 · DoG加重黑墨线与星辉微结构'

        elem_id = f'sylphie-p{i+1}'
        xml_patch = f'<path id="{elem_id}" fill="{fill}" d="{d}" transform="{combined_t}" />'

        steps.append({
            'i': current_id,
            's': stage_id,
            'l': layer_id,
            't': f'{layer_name}手绘笔触 #{i+1}',
            'd': f'{stage_desc} (色值: {fill})',
            'e': elem_id,
            'x': xml_patch
        })
        current_id += 1

    # Stage 5: Master Polish & Atmosphere (Luminous Celestial Butterfly Glow & Star Spangles)
    stage5_overlays = [
        {
            'l': 'iris',
            't': '晶莹璀璨星辉金瞳 · 四角星芒瞳孔与纯白双高光点睛',
            'd': '大师点睛 · 希尔菲专属金瞳双反光与流转星芒，赋予双眸灵动灵魂',
            'e': 'sylphie-eye-stars',
            'x': '<g id="sylphie-eye-stars"><circle cx="368" cy="272" r="3.5" fill="#FFFFFF" /><circle cx="432" cy="272" r="3.5" fill="#FFFFFF" /><circle cx="372" cy="276" r="1.8" fill="#FEF08A" /><circle cx="428" cy="276" r="1.8" fill="#FEF08A" /><path d="M 370 270 L 372 264 L 374 270 L 380 272 L 374 274 L 372 280 L 370 274 L 364 272 Z" fill="#FDE047" opacity="0.95" /><path d="M 430 270 L 432 264 L 434 270 L 440 272 L 434 274 L 432 280 L 430 274 L 424 272 Z" fill="#FDE047" opacity="0.95" /></g>'
        },
        {
            'l': 'shadow_highlight',
            't': '召唤流光星蝶 · 半空晶莹展翅微光粒子',
            'd': '原创神效 · 希尔菲掌心汇聚召唤的光辉灵蝶，青蓝粉紫半透双翼与发光蝶身',
            'e': 'sylphie-star-butterflies',
            'x': '<g id="sylphie-star-butterflies"><circle cx="190" cy="380" r="4.5" fill="#67E8F9" opacity="0.9" /><circle cx="610" cy="300" r="5" fill="#A5F3FC" opacity="0.9" /><circle cx="160" cy="460" r="3.5" fill="#F472B6" opacity="0.85" /><circle cx="640" cy="420" r="4.5" fill="#C084FC" opacity="0.9" /><path d="M 188 376 C 175 365 170 380 188 380 C 170 380 175 395 188 384" stroke="#67E8F9" stroke-width="2" fill="none" opacity="0.85" /><path d="M 612 296 C 625 285 630 300 612 300 C 630 300 625 315 612 304" stroke="#A5F3FC" stroke-width="2" fill="none" opacity="0.85" /></g>'
        },
        {
            'l': 'shadow_highlight',
            't': '星辉幻月 · 身后浮空星月光环与流转星轮',
            'd': '商业插画终局 · 身后静卧的星辉弯月透亮微光与金星点缀',
            'e': 'sylphie-moon-halo',
            'x': '<g id="sylphie-moon-halo"><path d="M 660 70 C 720 100 740 180 700 240 C 670 190 670 120 660 70 Z" fill="#FDE047" opacity="0.85" /><circle cx="680" cy="140" r="2.5" fill="#FFFFFF" opacity="0.95" /></g>'
        },
        {
            'l': 'shadow_highlight',
            't': '星辉月华发顶天使微光与飘浮星芒粒子',
            'd': '大师润色 · 飘逸樱粉长发上的金色星辉微粒与星云环境漫射光',
            'e': 'sylphie-sparkles-ambient',
            'x': '<g id="sylphie-sparkles-ambient"><circle cx="320" cy="190" r="2.5" fill="#FEF08A" opacity="0.8" /><circle cx="480" cy="180" r="3" fill="#FEF08A" opacity="0.85" /><circle cx="280" cy="240" r="2" fill="#FFFFFF" opacity="0.9" /><circle cx="520" cy="240" r="2.5" fill="#FFFFFF" opacity="0.9" /><circle cx="400" cy="480" r="3" fill="#FDE047" opacity="0.8" /><rect id="sylphie-ambient-tint" x="0" y="0" width="800" height="1000" fill="#FAF5FF" opacity="0.015" /></g>'
        }
    ]

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

    # Stage metadata
    s1 = [s for s in steps if s['s'] == 'stage-1']
    s2 = [s for s in steps if s['s'] == 'stage-2']
    s3 = [s for s in steps if s['s'] == 'stage-3']
    s4 = [s for s in steps if s['s'] == 'stage-4']
    s5 = [s for s in steps if s['s'] == 'stage-5']

    stages = [
        {'id': 'stage-1', 'stageNumber': 1, 'name': '01初版草图', 'subtitle': f'原创构图与少女体态定位 ({len(s1)}真笔步)', 'startStep': s1[0]['i'], 'endStep': s1[-1]['i'], 'description': '原创少女身形骨架、微仰神情透视与长发星蝶动势'},
        {'id': 'stage-2', 'stageNumber': 2, 'name': '02底色铺设', 'subtitle': f'通透樱粉金辉固有色平涂 ({len(s2)}真笔步)', 'startStep': s2[0]['i'], 'endStep': s2[-1]['i'], 'description': '樱粉柔发、象牙肌肤与星空蓝紫华丽大块面平涂，拒绝脏灰'},
        {'id': 'stage-3', 'stageNumber': 3, 'name': '03结构阴影', 'subtitle': f'纯净硬边赛璐璐光影切面 ({len(s3)}真笔步)', 'startStep': s3[0]['i'], 'endStep': s3[-1]['i'], 'description': '发丝交叠投影、衣褶双层光影与纤细少女骨骼明暗建模'},
        {'id': 'stage-4', 'stageNumber': 4, 'name': '04细部雕琢', 'subtitle': f'加重黑墨线与星芒精细结构 ({len(s4)}真笔步)', 'startStep': s4[0]['i'], 'endStep': s4[-1]['i'], 'description': '精工DoG加重黑墨线骨架、金丝蕾丝花纹、靴口装饰与纤指微结构'},
        {'id': 'stage-5', 'stageNumber': 5, 'name': '05神圣光晕', 'subtitle': f'璀璨星辉金瞳与流光星蝶点睛 ({len(s5)}真笔步)', 'startStep': s5[0]['i'], 'endStep': s5[-1]['i'], 'description': '星瞳专属四角星芒、掌心晶莹流光星蝶、星辉幻月与终极润色'}
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
    return out_data

if __name__ == '__main__':
    out_svg = 'scratch/sylphie_vector.svg'
    out_json = 'src/data/sylphieCompact.json'
    title = '星辉蝶愿 · 希尔菲 (Sylphie - Starlight Chrysalis Original Masterpiece)'
    build_sylphie_dataset(out_svg, out_json, title)
