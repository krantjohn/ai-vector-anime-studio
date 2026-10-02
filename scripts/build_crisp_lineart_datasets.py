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

def preprocess_with_enhanced_lineart(input_img_path, output_png_path, target_h=1500, ink_thresh=20, cel_sigma=70):
    img = cv2.imread(input_img_path)
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
    # Morphological close with 2x2 kernel to connect pen strokes smoothly
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

def classify_layer(path_elem, archetype_type):
    fill = path_elem.attrib.get('fill', '#FFFFFF')
    rgb = hex_to_rgb(fill)
    r, g, b = rgb
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    # Lines: deep dark ink is ALWAYS lineart
    if lum < 65:
        return 'line_art', '线条勾勒'

    if archetype_type == 'penia':
        if (r > 130 and b > 150 and g < 140) or (b > 150 and r < 140):
            return 'iris', '虹膜笔触'
        if (r > 200 and g > 155 and b > 175 and r > g) or (r > 210 and b > 190):
            return 'hair', '发型轮廓'
        if (b > 140 and b > r + 30) or (lum < 110 and b > g):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'kisaki':
        if (b > 110 and b > r + 15 and b > g + 10) or (lum < 95 and b > r):
            return 'hair', '发型轮廓'
        if (r > 120 and b > 140 and g < 130) or (b > 140 and r < 140):
            return 'iris', '虹膜笔触'
        if (lum < 110) or (r > 130 and g > 110 and b < 90):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'plana':
        if (r > 170 and g < 100) or (r > 180 and b > 100 and g < 110):
            return 'iris', '虹膜笔触'
        if (lum > 175 and abs(r - b) < 25 and abs(r - g) < 25) or (r > 200 and b > 180 and g < 170):
            return 'hair', '发型轮廓'
        if (lum > 215) or (lum < 110):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'shiroko':
        if (g > 120 and b > 130 and r < 110) or (b > 140 and g > 130 and r < 130):
            return 'iris', '虹膜笔触'
        if (lum > 150 and abs(r - b) < 25 and abs(r - g) < 25):
            return 'hair', '发型轮廓'
        if lum < 100:
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'rico':
        if (b > 140 and r < 130 and g < 140) or (b > 160 and g > 140 and r < 130):
            return 'iris', '虹膜笔触'
        if (b > 130 and b > r + 15) or (lum > 160 and b > g):
            return 'hair', '发型轮廓'
        if (r > 160 and g < 110 and b < 110) or (lum < 95):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    return 'shadow_highlight', '阴影高光'

def build_compact_dataset(svg_path, archetype_type, output_path, title, stage1_sketches, stage5_overlays):
    print(f"\nBuilding crisp lineart dataset [{archetype_type}]: {svg_path}...")
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

    # Stage metadata
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

    # Master Sketched & Overlays definitions
    # 1. Plana (什亭之匣 · 普拉娜)
    plana_raw = os.path.join(ref_dir, 'theme_plana.jpg')
    plana_prep = 'scratch/plana_sharp_pre.png'
    plana_svg = 'scratch/plana_sharp_svg.svg'
    preprocess_with_enhanced_lineart(plana_raw, plana_prep, target_h=1500, ink_thresh=20, cel_sigma=70)
    vtracer.convert_image_to_svg_py(plana_prep, plana_svg, colormode='color', hierarchical='stacked', mode='spline', filter_speckle=6, color_precision=8, layer_difference=14)
    plana_s1 = [
        {'l': 'line_art', 't': '什亭之匣微俯身娇小骨架与视线', 'd': '微倾头身比例中轴与大透视视平线', 'e': 'plana-sk-pose', 'x': '<circle id="plana-sk-pose" data-sketch="true" cx="500" cy="270" r="140" stroke="#F43F5E" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'clothes', 't': '白兔耳发带与荷叶边泳装外轮廓', 'd': '经典单边兔耳发带与纯白波浪褶边草稿', 'e': 'plana-sk-frills', 'x': '<path id="plana-sk-frills" data-sketch="true" d="M 400 140 Q 320 60 410 20 M 340 450 Q 500 500 660 430" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.2" />'},
        {'l': 'clothes', 't': '黑色遮阳伞与小鲸鱼挂件倾斜轴', 'd': '手握长柄伞与伞尖小鲸鱼空间定位', 'e': 'plana-sk-umbrella', 'x': '<path id="plana-sk-umbrella" data-sketch="true" d="M 280 440 L 120 720" stroke="#0F172A" stroke-dasharray="5,3" fill="none" opacity="0.4" stroke-width="1.5" />'}
    ]
    plana_s5 = [
        {'l': 'shadow_highlight', 't': '悬浮霓虹粉红双层立体光环', 'd': '大师点睛 · 普拉娜标志性深粉色立体环形光环', 'e': 'plana-halo', 'x': '<g id="plana-halo"><ellipse cx="600" cy="85" rx="90" ry="32" transform="rotate(-8 600 85)" stroke="#F43F5E" stroke-width="4.5" fill="none" opacity="0.9" /><ellipse cx="600" cy="85" rx="80" ry="26" transform="rotate(-8 600 85)" stroke="#FDA4AF" stroke-width="2.5" fill="none" opacity="0.8" /></g>'},
        {'l': 'iris', 't': '绯红深邃眼眸与泪光水润点光', 'd': '大师点睛 · 纯白高光与红宝石反光', 'e': 'plana-eyes-glow', 'x': '<g id="plana-eyes-glow"><circle cx="495" cy="275" r="3.5" fill="#FFFFFF" /><circle cx="560" cy="285" r="3.5" fill="#FFFFFF" /><circle cx="497" cy="280" r="1.5" fill="#FDA4AF" /></g>'},
        {'l': 'shadow_highlight', 't': '清澈蔚蓝海浪与阳光飞溅水珠', 'd': '商业插画终局 · 夏日阳光海面透亮粒子', 'e': 'plana-water-sparkles', 'x': '<g id="plana-water-sparkles" fill="#FFFFFF" opacity="0.8"><circle cx="210" cy="620" r="3.5" /><circle cx="680" cy="180" r="4" /><circle cx="750" cy="240" r="3" /><circle cx="280" cy="680" r="2.5" /></g>'}
    ]
    build_compact_dataset(plana_svg, 'plana', 'src/data/planaCompact.json', '什亭之匣 · 普拉娜 (Plana - Blue Archive Summer Beach)', plana_s1, plana_s5)

    # 2. Kisaki (玄龙门主 · 龙华妃姬)
    kisaki_raw = os.path.join(ref_dir, 'theme_kisaki.jpg')
    kisaki_prep = 'scratch/kisaki_sharp_pre.png'
    kisaki_svg = 'scratch/kisaki_sharp_svg.svg'
    preprocess_with_enhanced_lineart(kisaki_raw, kisaki_prep, target_h=1500, ink_thresh=22, cel_sigma=65)
    vtracer.convert_image_to_svg_py(kisaki_prep, kisaki_svg, colormode='color', hierarchical='stacked', mode='spline', filter_speckle=6, color_precision=8, layer_difference=14)
    kisaki_s1 = [
        {'l': 'line_art', 't': '沙滩躺椅 45° 仰卧慵懒体态骨架', 'd': '玄龙门主沙滩椅透视中轴与双腿舒展比例', 'e': 'kisaki-sk-pose', 'x': '<path id="kisaki-sk-pose" data-sketch="true" d="M 400 200 L 400 950 M 260 220 L 560 220 M 300 480 Q 400 520 500 480" stroke="#818CF8" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'line_art', 't': '墨镜与紫瞳微敛视平线', 'd': '指尖轻推墨镜架、微俯视高贵凤眼定界', 'e': 'kisaki-sk-glasses', 'x': '<g id="kisaki-sk-glasses" data-sketch="true" stroke="#818CF8" fill="none" opacity="0.4" stroke-width="1.2"><ellipse cx="440" cy="380" rx="30" ry="20" /><ellipse cx="540" cy="360" rx="32" ry="22" /></g>'},
        {'l': 'clothes', 't': '遮阳伞金色家纹与黑金轻纱走向', 'd': '东方绸缎沙滩袍与和风伞面骨架', 'e': 'kisaki-sk-robe', 'x': '<path id="kisaki-sk-robe" data-sketch="true" d="M 220 180 Q 120 40 40 160 M 240 420 Q 200 660 160 880 M 560 380 Q 640 600 680 820" stroke="#FBBF24" stroke-dasharray="6,4" fill="none" opacity="0.4" stroke-width="1.5" />'}
    ]
    kisaki_s5 = [
        {'l': 'shadow_highlight', 't': '金丝太阳镜片炫彩反光与通透高光', 'd': '大师点睛 · 太阳镜深蓝镜片受光切线', 'e': 'kisaki-sunglasses-glint', 'x': '<g id="kisaki-sunglasses-glint"><path d="M 430 370 L 460 365" stroke="#FFFFFF" stroke-width="2" opacity="0.8" /><path d="M 530 350 L 565 345" stroke="#FFFFFF" stroke-width="2" opacity="0.8" /><circle cx="485" cy="325" r="2.5" fill="#FDE047" /></g>'},
        {'l': 'shadow_highlight', 't': '象牙白肌肤与锁骨高光点睛', 'd': '大师润色 · 阳光直射下的剔透肌肤高光', 'e': 'kisaki-skin-highlights', 'x': '<g id="kisaki-skin-highlights" fill="#FFFFFF" opacity="0.75"><circle cx="490" cy="510" r="3" /><circle cx="430" cy="740" r="4" /><circle cx="370" cy="880" r="3.5" /></g>'},
        {'l': 'shadow_highlight', 't': '蔚蓝海风与夏日海面泛光覆层', 'd': '商业插画终局 · 清冽海滨微风光影调色', 'e': 'kisaki-ambient', 'x': '<rect id="kisaki-ambient" x="0" y="0" width="800" height="1000" fill="#F0FDF4" opacity="0.015" />'}
    ]
    build_compact_dataset(kisaki_svg, 'kisaki', 'src/data/kisakiCompact.json', '玄龙门主 · 龙华妃姬 (Kisaki - Blue Archive Summer Lounger)', kisaki_s1, kisaki_s5)

    # 3. Shiroko Terror (阿拜多斯 · 砂狼白子·恐怖)
    shiroko_raw = os.path.join(ref_dir, 'HS-JUGIagAANXLV.jpg')
    shiroko_prep = 'scratch/shiroko_sharp_pre.png'
    shiroko_svg = 'scratch/shiroko_sharp_svg.svg'
    preprocess_with_enhanced_lineart(shiroko_raw, shiroko_prep, target_h=1500, ink_thresh=20, cel_sigma=65)
    vtracer.convert_image_to_svg_py(shiroko_prep, shiroko_svg, colormode='color', hierarchical='stacked', mode='spline', filter_speckle=6, color_precision=8, layer_difference=14)
    shiroko_s1 = [
        {'l': 'line_art', 't': '俯视猫系凌厉五官与尖下巴骨架', 'd': '冷傲俯视神情三庭五眼对齐轴', 'e': 'shiroko-sk-head', 'x': '<circle id="shiroko-sk-head" data-sketch="true" cx="490" cy="360" r="140" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'hair', 't': '直立雪白狼耳与狂放银发轮廓', 'd': '高耸狼耳几何三角框与飘逸发束动势', 'e': 'shiroko-sk-ears', 'x': '<polygon id="shiroko-sk-ears" data-sketch="true" points="350,220 400,30 460,180" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" /><polygon data-sketch="true" points="630,180 670,30 730,220" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'clothes', 't': '破碎光环与战术围脖领口比例', 'd': '暗黑裂纹光环与立领风衣线条', 'e': 'shiroko-sk-collar', 'x': '<path id="shiroko-sk-collar" data-sketch="true" d="M 400 480 Q 490 540 580 480 M 340 560 L 240 820 M 640 560 L 740 820" stroke="#0F172A" stroke-dasharray="5,3" fill="none" opacity="0.4" stroke-width="1.5" />'}
    ]
    shiroko_s5 = [
        {'l': 'shadow_highlight', 't': '身后悬浮破碎青蓝裂纹光环', 'd': '大师点睛 · 砂狼白子·恐怖专属破碎光环', 'e': 'shiroko-broken-halo', 'x': '<g id="shiroko-broken-halo" stroke="#38BDF8" stroke-width="3" fill="none" opacity="0.85"><ellipse cx="530" cy="110" rx="160" ry="45" transform="rotate(-5 530 110)" stroke-dasharray="40,15,60,20" /><ellipse cx="530" cy="110" rx="150" ry="40" transform="rotate(-5 530 110)" stroke-dasharray="25,20,50,15" stroke-width="1.5" /></g>'},
        {'l': 'iris', 't': '青碧冷傲猫瞳与淡青十字发卡闪光', 'd': '大师点睛 · 标志性青碧猫眼双高光与十字金属星芒', 'e': 'shiroko-eyes-glint', 'x': '<g id="shiroko-eyes-glint"><circle cx="430" cy="390" r="3.5" fill="#FFFFFF" /><circle cx="560" cy="395" r="3.5" fill="#FFFFFF" /><circle cx="433" cy="393" r="1.5" fill="#67E8F9" /><circle cx="563" cy="398" r="1.5" fill="#67E8F9" /><path d="M 645 280 L 647 265 L 649 280 L 664 282 L 649 284 L 647 299 L 645 284 L 630 282 Z" fill="#67E8F9" opacity="0.9" /></g>'},
        {'l': 'shadow_highlight', 't': '深邃冷酷夜空深蓝暗调覆层', 'd': '商业插画终局 · 阿拜多斯荒原夜色冷辉', 'e': 'shiroko-ambient', 'x': '<rect id="shiroko-ambient" x="0" y="0" width="800" height="1000" fill="#0C4A6E" opacity="0.02" />'}
    ]
    build_compact_dataset(shiroko_svg, 'shiroko', 'src/data/shirokoCompact.json', '阿拜多斯 · 砂狼白子·恐怖 (Shiroko Terror - Blue Archive)', shiroko_s1, shiroko_s5)

    # 4. Rico (光影交错 · 苹果少女)
    rico_raw = os.path.join(ref_dir, 'HTA4xHuaYAAoJXY.jpg')
    rico_prep = 'scratch/rico_sharp_pre.png'
    rico_svg = 'scratch/rico_sharp_svg.svg'
    preprocess_with_enhanced_lineart(rico_raw, rico_prep, target_h=1500, ink_thresh=22, cel_sigma=65)
    vtracer.convert_image_to_svg_py(rico_prep, rico_svg, colormode='color', hierarchical='stacked', mode='spline', filter_speckle=6, color_precision=8, layer_difference=14)
    rico_s1 = [
        {'l': 'line_art', 't': '斜切光照下面部与捧苹果双手透视', 'd': '强烈光影斜切面、双手托腮捧苹果几何中心', 'e': 'rico-sk-pose', 'x': '<circle id="rico-sk-pose" data-sketch="true" cx="440" cy="390" r="150" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" /><ellipse data-sketch="true" cx="420" cy="620" rx="60" ry="50" stroke="#EF4444" stroke-dasharray="4,4" fill="none" opacity="0.45" />'},
        {'l': 'hair', 't': '巨幅波浪蓝发与蕾丝花边轮廓', 'd': '飘散长发波浪线与双肩黑蕾丝褶皱定位', 'e': 'rico-sk-hair', 'x': '<path id="rico-sk-hair" data-sketch="true" d="M 220 300 C 140 500 120 720 100 880 M 660 300 C 740 500 760 720 780 880" stroke="#38BDF8" stroke-dasharray="6,4" fill="none" opacity="0.4" stroke-width="1.5" />'},
        {'l': 'shadow_highlight', 't': '强烈斜切明暗交界线基准', 'd': '左上方射入的硬边光柱斜切光影界线', 'e': 'rico-sk-light-beam', 'x': '<path id="rico-sk-light-beam" data-sketch="true" d="M 180 40 L 640 880" stroke="#FDE047" stroke-dasharray="8,4" fill="none" opacity="0.5" stroke-width="2" />'}
    ]
    rico_s5 = [
        {'l': 'shadow_highlight', 't': '红润苹果表面水润 Specular 高光', 'd': '大师点睛 · 鲜红苹果表皮纯白圆润受光点', 'e': 'rico-apple-glint', 'x': '<g id="rico-apple-glint"><ellipse cx="430" cy="580" rx="14" ry="9" transform="rotate(-15 430 580)" fill="#FFFFFF" opacity="0.85" /><circle cx="450" cy="590" r="3" fill="#FFFFFF" opacity="0.9" /></g>'},
        {'l': 'iris', 't': '清透湛蓝大眼高光与微张小巧红唇', 'd': '大师点睛 · 动人湛蓝瞳孔反光与脸颊羞涩粉晕', 'e': 'rico-eyes-glow', 'x': '<g id="rico-eyes-glow"><circle cx="370" cy="425" r="4.5" fill="#FFFFFF" /><circle cx="530" cy="385" r="4.5" fill="#FFFFFF" /><circle cx="373" cy="430" r="2" fill="#93C5FD" /><circle cx="533" cy="390" r="2" fill="#93C5FD" /></g>'},
        {'l': 'shadow_highlight', 't': '斜切光斑尘埃与亲笔粉色签名 "Rico"', 'd': '商业插画终局 · 光柱浮尘粒子与画师手绘签名', 'e': 'rico-sig-dust', 'x': '<g id="rico-sig-dust"><circle cx="480" cy="220" r="3" fill="#FFFFFF" opacity="0.7" /><circle cx="520" cy="310" r="2.5" fill="#FFFFFF" opacity="0.6" /><circle cx="390" cy="340" r="2" fill="#FFFFFF" opacity="0.7" /><path d="M 680 720 Q 720 680 750 740 Q 720 800 680 760" stroke="#F43F5E" stroke-width="2" fill="none" opacity="0.8" /></g>'}
    ]
    build_compact_dataset(rico_svg, 'rico', 'src/data/ricoCompact.json', '光影交错 · 苹果少女 (Rico - Chiaroscuro Anime Girl)', rico_s1, rico_s5)

    print("\nAll datasets regenerated with enhanced lineart & clean anime cel fields!")

if __name__ == '__main__':
    main()
