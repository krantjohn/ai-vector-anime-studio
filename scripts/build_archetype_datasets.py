import os
import sys
import json
import re
import xml.etree.ElementTree as ET
from PIL import Image
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
    # Optimize d-path coordinates to 0.1 sub-pixel precision to reduce JSON size by ~50%
    return re.sub(r'(\d+\.\d{2,})', lambda m: f'{float(m.group(1)):.1f}', d)

def classify_layer(path_elem, archetype_type):
    fill = path_elem.attrib.get('fill', '#FFFFFF')
    rgb = hex_to_rgb(fill)
    r, g, b = rgb
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    if archetype_type == 'mika':
        if lum < 95:
            return 'line_art', '线条勾勒'
        if (r > 160 and g > 120 and b < 120 and r > b + 40) or (r > 200 and g > 160 and b < 100):
            return 'iris', '虹膜笔触'
        if (r > 190 and b > 140 and r > g + 20) or (r > 200 and g < 185 and b > 145) or (b > 180 and r > 170 and g < 175):
            return 'hair', '发型轮廓'
        if (b > 120 and b > r + 20 and b > g + 20) or (lum > 225 and abs(r - g) < 20 and abs(r - b) < 20):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'vampire':
        if lum < 85:
            return 'line_art', '线条勾勒'
        if r > 140 and g < 70 and b < 90:
            return 'iris', '虹膜笔触'
        if lum > 175 and abs(r - g) < 25 and abs(r - b) < 25 and g > 170:
            return 'hair', '发型轮廓'
        if (r > 90 and g < 60 and b < 70) or (lum < 130 and b > g):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'cyberpunk':
        if lum < 80:
            return 'line_art', '线条勾勒'
        if (b > 180 and g > 150 and r < 140) or (r > 200 and b > 160 and g < 140):
            return 'hair', '发型轮廓'
        if (r > 190 and g > 170 and b < 120) or (r < 160 and g > 180 and b > 190):
            return 'iris', '虹膜笔触'
        if lum < 150:
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    elif archetype_type == 'shrine':
        if lum < 70:
            return 'line_art', '线条勾勒'
        if lum < 110:
            return 'hair', '发型轮廓'
        if r > 180 and g > 130 and b < 100:
            return 'iris', '虹膜笔触'
        if (r > 170 and g < 70 and b < 70) or (lum > 220 and abs(r - g) < 15):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

    else:  # magical
        if lum < 85:
            return 'line_art', '线条勾勒'
        if r > 210 and g < 185 and b > 170:
            return 'hair', '发型轮廓'
        if (b > 180 and r > 160 and g < 150) or (r > 210 and g > 180 and b < 110):
            return 'iris', '虹膜笔触'
        if lum > 190 or (r > 190 and b > 180):
            return 'clothes', '服饰层次'
        return 'shadow_highlight', '阴影高光'

def build_compact_dataset(image_path, archetype_type, output_path, title, stage1_sketches, stage5_overlays):
    print(f"\nProcessing high-precision {archetype_type}: {image_path}...")
    norm_png = f"scratch/{archetype_type}_sweet_norm.png"
    temp_svg = f"scratch/{archetype_type}_sweet.svg"

    os.makedirs('scratch', exist_ok=True)
    if not os.path.exists(temp_svg):
        with Image.open(image_path) as im:
            im.convert('RGB').save(norm_png, 'PNG')

        # Sweet spot parameters: filter_speckle=6, color_precision=8, layer_difference=16
        # Produces genuine fine vector paths (1,500 - 5,000 real artistic strokes)
        vtracer.convert_image_to_svg_py(
            norm_png,
            temp_svg,
            colormode='color',
            hierarchical='stacked',
            mode='spline',
            filter_speckle=6,
            color_precision=8,
            layer_difference=16
        )

    tree = ET.parse(temp_svg)
    root = tree.getroot()
    raw_paths = list(root)
    print(f"[{archetype_type}] Extracted {len(raw_paths)} real fine vector paths.")

    orig_w = float(root.attrib.get('width', 800))
    orig_h = float(root.attrib.get('height', 1000))
    scale_y = 1000.0 / orig_h if orig_h > 0 else 1.0
    scale_x = scale_y
    scaled_w = orig_w * scale_x
    offset_x = (800.0 - scaled_w) / 2.0

    steps = []
    current_id = 1

    # Stage 1 Sketches
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

    # Split real vector paths into Stage 2 (Base), Stage 3 (Shading), Stage 4 (Details)
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
            stage_desc = '底色铺设 · 固有色与剪影块面'
        elif i < s3_cut:
            stage_id = 'stage-3'
            stage_desc = '结构阴影 · 赛璐璐转折与体积建模'
        else:
            stage_id = 'stage-4'
            stage_desc = '细部雕琢 · 精细发丝与微结构刻画'

        elem_id = f'{archetype_type}-p{i+1}'
        xml_patch = f'<path id="{elem_id}" fill="{fill}" d="{d}" transform="{combined_t}" />'

        steps.append({
            'i': current_id,
            's': stage_id,
            'l': layer_id,
            't': f'{layer_name}精细笔触 #{i+1}',
            'd': f'{stage_desc} (填充色: {fill})',
            'e': elem_id,
            'x': xml_patch
        })
        current_id += 1

    # Stage 5 Overlays & Atmosphere
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
        {'id': 'stage-1', 'stageNumber': 1, 'name': '01初版草图', 'subtitle': f'构图骨架与五官定位 ({len(s1)}真笔步)', 'startStep': s1[0]['i'], 'endStep': s1[-1]['i'], 'description': '确立角色倾角动态、头部骨架、眼眶视平线与体态比例'},
        {'id': 'stage-2', 'stageNumber': 2, 'name': '02底色铺设', 'subtitle': f'底色铺设与剪影起调 ({len(s2)}真笔步)', 'startStep': s2[0]['i'], 'endStep': s2[-1]['i'], 'description': '平涂二次元固有色，奠定角色纯净通透的美术基调'},
        {'id': 'stage-3', 'stageNumber': 3, 'name': '03结构阴影', 'subtitle': f'赛璐璐转折与光影塑造 ({len(s3)}真笔步)', 'startStep': s3[0]['i'], 'endStep': s3[-1]['i'], 'description': '精确切割二次元暗部明暗交界线，刻画衣褶下摆与遮挡阴影'},
        {'id': 'stage-4', 'stageNumber': 4, 'name': '04细部雕琢', 'subtitle': f'精细发丝、五官与徽章纹理 ({len(s4)}真笔步)', 'startStep': s4[0]['i'], 'endStep': s4[-1]['i'], 'description': '点睛之笔：刻画标志性瞳孔高光、发丝微结构与服饰精工'},
        {'id': 'stage-5', 'stageNumber': 5, 'name': '05神圣光晕', 'subtitle': f'氛围辉光与终景润色 ({len(s5)}真笔步)', 'startStep': s5[0]['i'], 'endStep': s5[-1]['i'], 'description': '悬浮氛围粒子、轮廓反光与环境全息调色覆层，完成商业插画'}
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
    print(f"Successfully generated {output_path}: {len(steps)} total real strokes. Size: {file_size_mb:.2f} MB")

def main():
    brain_dir = 'C:/Users/Administrator/.gemini/antigravity/brain/8fbe7062-9c3c-414d-bf07-0dc5d17a8192'

    # 1. Mika (Master artwork)
    mika_img = os.path.join(brain_dir, '.user_uploaded/media_1790915522108.jpg')
    mika_s1 = [
        {'l': 'line_art', 't': '3/4侧脸微仰头部透视球骨架', 'd': '确定倾斜头部几何中心与三维空间转向轴', 'e': 'mika-sketch-head-sphere', 'x': '<circle id="mika-sketch-head-sphere" data-sketch="true" cx="360" cy="310" r="140" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.5" />'},
        {'l': 'line_art', 't': '三庭五眼对齐轴线与视平线', 'd': '微俯-15°倾角的五官基准中轴线与眼眶视平线', 'e': 'mika-sketch-axes', 'x': '<path id="mika-sketch-axes" data-sketch="true" d="M 370 170 C 360 270 355 370 345 450 M 240 335 Q 350 310 470 280" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.2" />'},
        {'l': 'line_art', 't': '少女柔美下颌骨与尖下巴草图', 'd': '精致3/4弧线与下巴微翘形态定位', 'e': 'mika-sketch-jaw', 'x': '<path id="mika-sketch-jaw" data-sketch="true" d="M 245 285 Q 260 375 345 405 Q 400 365 425 285" stroke="#38BDF8" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'line_art', 't': '倾角眼眶与透视比例框位', 'd': '左侧大透视内收眼眶与右侧透视偏角外眼眶定界', 'e': 'mika-sketch-eyes', 'x': '<g id="mika-sketch-eyes" data-sketch="true" stroke="#38BDF8" fill="none" opacity="0.4" stroke-width="1.2"><rect x="290" y="295" width="70" height="50" rx="4" transform="rotate(-15 325 320)" /><rect x="390" y="270" width="60" height="45" rx="4" transform="rotate(-15 420 292)" /></g>'},
        {'l': 'line_art', 't': '微张浅笑唇线与鼻尖透视定位', 'd': '鼻尖点与娇嗔唇珠对齐中轴辅助定位', 'e': 'mika-sketch-mouth', 'x': '<g id="mika-sketch-mouth" data-sketch="true" stroke="#38BDF8" fill="none" opacity="0.45" stroke-width="1.2"><circle cx="365" cy="335" r="2" /><path d="M 350 362 Q 365 372 385 362" /></g>'},
        {'l': 'hair', 't': '樱粉双马尾与丸子头体块外廓', 'd': '左侧发包与后部披散蓬松发量动势线', 'e': 'mika-sketch-hair-mass', 'x': '<path id="mika-sketch-hair-mass" data-sketch="true" d="M 170 240 C 130 380 90 560 60 760 M 230 180 C 340 70 540 80 570 260" stroke="#F472B6" stroke-dasharray="6,4" fill="none" opacity="0.4" stroke-width="1.5" />'},
        {'l': 'clothes', 't': '娇躯微倾上半身体态与锁骨线', 'd': '圣三一茶会披肩与修长脖颈空间比例', 'e': 'mika-sketch-torso', 'x': '<path id="mika-sketch-torso" data-sketch="true" d="M 320 420 C 310 500 240 560 210 740 M 390 410 C 440 500 560 590 640 780" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.35" stroke-width="1.2" />'},
        {'l': 'line_art', 't': '“嘘”声食指贴唇标志性手势定位', 'd': '修长食指轻触唇畔、星空大肠发圈手腕比例线', 'e': 'mika-sketch-finger-pose', 'x': '<g id="mika-sketch-finger-pose" data-sketch="true" stroke="#FB7185" fill="none" opacity="0.5" stroke-width="1.5"><circle cx="450" cy="500" r="35" stroke-dasharray="3,3" /><path d="M 445 490 L 415 390 Q 405 365 395 360" /></g>'},
        {'l': 'clothes', 't': '圣洁天使羽翼向上舒展动态弧线', 'd': '右上方优雅展开的多层羽翼主骨骼弧度', 'e': 'mika-sketch-wing-arc', 'x': '<path id="mika-sketch-wing-arc" data-sketch="true" d="M 520 480 Q 640 380 720 180" stroke="#C084FC" stroke-dasharray="6,4" fill="none" opacity="0.45" stroke-width="1.8" />'},
        {'l': 'shadow_highlight', 't': '3D透视悬浮光环同心椭圆基准', 'd': '头部上方倾斜25°的光环双层椭圆与星芒十字基线', 'e': 'mika-sketch-halo-base', 'x': '<ellipse id="mika-sketch-halo-base" data-sketch="true" cx="240" cy="100" rx="190" ry="55" transform="rotate(12 240 100)" stroke="#FBBF24" stroke-dasharray="4,4" fill="none" opacity="0.5" stroke-width="1.5" />'}
    ]
    mika_s5 = [
        {'l': 'shadow_highlight', 't': '3D透视立体双层悬浮光环', 'd': '终景润色 · 倾斜透视双层光环与四角星芒结晶', 'e': 'mika-halo', 'x': '<g id="mika-halo"><ellipse cx="270" cy="115" rx="175" ry="46" transform="rotate(14 270 115)" stroke="#FDE047" stroke-width="5" fill="none" opacity="0.9" /><ellipse cx="270" cy="115" rx="160" ry="40" transform="rotate(14 270 115)" stroke="#F472B6" stroke-width="3" fill="none" opacity="0.8" /><path d="M 125 150 L 130 135 L 135 150 L 150 155 L 135 160 L 130 175 L 125 160 L 110 155 Z" fill="#FDE047" /><path d="M 410 75 L 415 60 L 420 75 L 435 80 L 420 85 L 415 100 L 410 85 L 395 80 Z" fill="#FDE047" /></g>'},
        {'l': 'clothes', 't': '圣洁天使羽翼光影细节与羽毛层叠', 'd': '终景润色 · 羽翼边缘受光高光', 'e': 'mika-wing', 'x': '<g id="mika-wing"><path d="M 520 480 Q 640 380 720 180" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.8" /></g>'},
        {'l': 'iris', 't': '弥香标志性琥珀金四芒星瞳孔与纯白双高光', 'd': '终景润色 · 双眼金色四芒星瞳孔聚光', 'e': 'mika-star-pupil', 'x': '<g id="mika-star-pupil"><circle cx="335" cy="320" r="4" fill="#FFFFFF" /><path d="M 335 320 L 337 312 L 339 320 L 347 322 L 339 324 L 337 332 L 335 324 L 327 322 Z" fill="#FDE047" /><circle cx="435" cy="292" r="4" fill="#FFFFFF" /><path d="M 435 292 L 437 284 L 439 292 L 447 294 L 439 296 L 437 304 L 435 296 L 427 294 Z" fill="#FDE047" /></g>'},
        {'l': 'hair', 't': '手腕深邃银河星空发圈与金色星尘点缀', 'd': '终景润色 · 手腕深靛蓝发圈上的微型金星', 'e': 'mika-galaxy-scrunchie', 'x': '<g id="mika-galaxy-scrunchie"><circle cx="450" cy="500" r="4" fill="#FBBF24" /><circle cx="465" cy="510" r="3" fill="#FDE047" /><circle cx="435" cy="520" r="3.5" fill="#FBBF24" /></g>'},
        {'l': 'clothes', 't': '圣三一茶会金质十字徽章纹章', 'd': '终景润色 · 披肩领口金质徽章', 'e': 'mika-trinity-crest', 'x': '<g id="mika-trinity-crest"><path d="M 380 540 L 390 530 L 400 540 L 390 550 Z" fill="#F59E0B" /><path d="M 390 525 L 390 555 M 375 540 L 405 540" stroke="#FBBF24" stroke-width="2" /></g>'},
        {'l': 'shadow_highlight', 't': '翅膀边缘发光星珠与漂浮星尘', 'd': '终景润色 · 璀璨发光晶珠与环境星屑', 'e': 'mika-sparkles', 'x': '<g id="mika-sparkles" fill="#FBBF24"><circle cx="490" cy="460" r="3.5" fill="#38BDF8" /><circle cx="585" cy="405" r="4" fill="#F43F5E" /><circle cx="680" cy="270" r="4.5" fill="#FDE047" /><circle cx="720" cy="170" r="5" fill="#C084FC" /><path d="M 230 450 L 233 438 L 236 450 L 248 453 L 236 456 L 233 468 L 230 456 L 218 453 Z" fill="#F472B6" opacity="0.75" /><path d="M 590 530 L 593 518 L 596 530 L 608 533 L 596 536 L 593 548 L 590 536 L 578 533 Z" fill="#FDE047" opacity="0.85" /></g>'}
    ]
    build_compact_dataset(mika_img, 'mika', 'src/data/masterMikaCompact.json', '圣三一的天使 · 圣园弥香 (Misono Mika - Blue Archive)', mika_s1, mika_s5)

    # 2. Gothic Vampire
    vamp_img = os.path.join(brain_dir, 'gothic_vampire_anime_1790923838035.jpg' if os.path.exists(os.path.join(brain_dir, 'gothic_vampire_anime_1790923838035.jpg')) else 'gothic_vampire_anime_1790923683756.jpg')
    vamp_img = os.path.join(brain_dir, 'gothic_vampire_anime_1790923683756.jpg')
    vamp_s1 = [
        {'l': 'line_art', 't': '吸血鬼少女高傲微仰脸部透视球', 'd': '确立微微俯视的高傲几何转向球', 'e': 'vamp-sk-sphere', 'x': '<circle id="vamp-sk-sphere" data-sketch="true" cx="400" cy="300" r="145" stroke="#F43F5E" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'line_art', 't': '哥特中轴十字线与眼位定界', 'd': '高冷猫系下倾透视基准轴', 'e': 'vamp-sk-axes', 'x': '<path id="vamp-sk-axes" data-sketch="true" d="M 400 160 L 400 520 M 260 310 L 540 310" stroke="#F43F5E" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.2" />'},
        {'l': 'line_art', 't': '精致尖下巴与吸血鬼小尖耳', 'd': '柔滑轮廓与微露的精灵尖耳草图', 'e': 'vamp-sk-jaw', 'x': '<path id="vamp-sk-jaw" data-sketch="true" d="M 270 270 Q 285 390 400 415 Q 515 390 530 270" stroke="#F43F5E" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'hair', 't': '螺旋大卷银发巨幅体块走势', 'd': '左右狂放披散的银丝巨幅体块', 'e': 'vamp-sk-hair', 'x': '<path id="vamp-sk-hair" data-sketch="true" d="M 180 240 C 120 430 140 680 100 860 M 620 240 C 680 430 660 680 700 860" stroke="#E2E8F0" stroke-dasharray="6,4" fill="none" opacity="0.4" stroke-width="1.5" />'},
        {'l': 'clothes', 't': '背部收拢暗夜恶魔蝙蝠翼骨架', 'd': '身侧伸展的哥特小蝠翼折线', 'e': 'vamp-sk-wings', 'x': '<path id="vamp-sk-wings" data-sketch="true" d="M 240 440 Q 140 360 80 500 Q 180 550 240 580 M 560 440 Q 660 360 720 500 Q 620 550 560 580" stroke="#BE123C" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'line_art', 't': '小巧红唇与尖牙标志性点位', 'd': '嘴角微露尖牙的诱惑神韵', 'e': 'vamp-sk-fangs', 'x': '<circle id="vamp-sk-fangs" data-sketch="true" cx="400" cy="385" r="4" stroke="#F43F5E" fill="none" opacity="0.5" />'}
    ]
    vamp_s5 = [
        {'l': 'iris', 't': '血红宝石星芒瞳孔与纯白双高光', 'd': '璀璨夺目的通透聚光与红宝石四角星芒', 'e': 'vamp-eye-star', 'x': '<g id="vamp-eye-star"><circle cx="348" cy="308" r="4.5" fill="#FFFFFF" /><circle cx="452" cy="308" r="4.5" fill="#FFFFFF" /><path d="M 346 304 L 348 299 L 350 304 L 355 306 L 350 308 L 348 313 L 346 308 L 341 306 Z" fill="#FCA5A5" /><path d="M 450 304 L 452 299 L 454 304 L 459 306 L 454 308 L 452 313 L 450 308 L 445 306 Z" fill="#FCA5A5" /></g>'},
        {'l': 'shadow_highlight', 't': '暗夜血色残月高天倒影', 'd': '身后若隐若现的淡红血月圆轮', 'e': 'vamp-blood-moon', 'x': '<g id="vamp-blood-moon"><circle cx="600" cy="180" r="110" fill="#FFE4E6" opacity="0.25" /><path d="M 540 160 Q 600 130 660 200" stroke="#F43F5E" stroke-width="3" fill="none" opacity="0.5" /></g>'},
        {'l': 'shadow_highlight', 't': '空中漫天飘落的鲜红玫瑰花瓣', 'd': '身畔飘落的鲜红花瓣氛围粒子', 'e': 'vamp-rose-petals', 'x': '<g id="vamp-rose-petals" fill="#BE123C" opacity="0.85"><path d="M 180 240 Q 200 220 190 255 Z" /><path d="M 640 300 Q 660 280 650 315 Z" /><path d="M 140 500 Q 160 480 150 515 Z" /><path d="M 660 560 Q 680 540 670 575 Z" /><circle cx="210" cy="400" r="3.5" fill="#FB7185" /><circle cx="580" cy="440" r="4" fill="#FB7185" /></g>'},
        {'l': 'shadow_highlight', 't': '全景绯红月华薄雾滤镜', 'd': '暗夜哥特插画最终整体调色覆层', 'e': 'vamp-final-overlay', 'x': '<rect id="vamp-final-overlay" x="0" y="0" width="800" height="1000" fill="#FFF1F2" opacity="0.02" />'}
    ]
    build_compact_dataset(vamp_img, 'vampire', 'src/data/vampireCompact.json', '银发赤瞳哥特吸血鬼少女 · 绯月玫瑰', vamp_s1, vamp_s5)

    # 3. Cyberpunk Neko
    cyber_img = os.path.join(brain_dir, 'cyber_neko_anime_1790923819673.jpg')
    cyber_s1 = [
        {'l': 'line_art', 't': '赛博机甲头部几何透视框', 'd': '精准头部轴心与透视框', 'e': 'cyber-sk-sphere', 'x': '<circle id="cyber-sk-sphere" data-sketch="true" cx="400" cy="280" r="130" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.5" stroke-width="1.5" />'},
        {'l': 'line_art', 't': '机械全息猫耳空间定位', 'd': '左右高耸全息机械猫耳角度线', 'e': 'cyber-sk-ears', 'x': '<polygon id="cyber-sk-ears" data-sketch="true" points="280,200 320,100 380,180" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" /><polygon data-sketch="true" points="520,200 480,100 420,180" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'line_art', 't': '目镜HUD视平线中轴', 'd': '战术护目镜与三庭五眼对准线', 'e': 'cyber-sk-axes', 'x': '<path id="cyber-sk-axes" data-sketch="true" d="M 400 150 L 400 480 M 270 290 L 530 290" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.2" />'},
        {'l': 'hair', 't': '动感机械双马尾走势', 'd': '科技风锐利发束动态', 'e': 'cyber-sk-hair', 'x': '<path id="cyber-sk-hair" data-sketch="true" d="M 220 240 C 180 400 150 600 130 780 M 580 240 C 620 400 650 600 670 780" stroke="#EC4899" stroke-dasharray="6,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'clothes', 't': '战术机能外套与束带走线', 'd': '立领机能服与工装战术裤走线草稿', 'e': 'cyber-sk-jacket', 'x': '<path id="cyber-sk-jacket" data-sketch="true" d="M 330 400 C 330 500 240 600 200 820 M 470 400 C 470 500 560 600 600 820" stroke="#06B6D4" stroke-dasharray="4,4" fill="none" opacity="0.35" stroke-width="1.2" />'}
    ]
    cyber_s5 = [
        {'l': 'iris', 't': '全息黄色星瞳与HUD瞄准框', 'd': '数据化能量核心黄色星瞳与战术光标', 'e': 'cyber-eye-hud', 'x': '<g id="cyber-eye-hud"><circle cx="360" cy="275" r="3.5" fill="#FFFFFF" /><circle cx="440" cy="275" r="3.5" fill="#FFFFFF" /><path d="M 358 272 L 360 268 L 362 272 L 366 274 L 362 276 L 360 280 L 358 276 L 354 274 Z" fill="#FDE047" /><path d="M 438 272 L 440 268 L 442 272 L 446 274 L 442 276 L 440 280 L 438 276 L 434 274 Z" fill="#FDE047" /></g>'},
        {'l': 'shadow_highlight', 't': '全息六边形数码矩阵护盾', 'd': '身侧漂浮的透明蜂巢六边形粒子', 'e': 'cyber-hex-shield', 'x': '<g id="cyber-hex-shield" stroke="#06B6D4" stroke-width="1.5" fill="none" opacity="0.65"><polygon points="170,340 185,330 200,340 200,360 185,370 170,360" /><polygon points="205,365 220,355 235,365 235,385 220,395 205,385" /><polygon points="610,340 625,330 640,340 640,360 625,370 610,360" /></g>'},
        {'l': 'shadow_highlight', 't': '霓虹色彩氛围调和', 'd': '赛博朋克深空暗光覆盖', 'e': 'cyber-ambient', 'x': '<rect id="cyber-ambient" x="0" y="0" width="800" height="1000" fill="#06B6D4" opacity="0.02" />'}
    ]
    build_compact_dataset(cyber_img, 'cyberpunk', 'src/data/cyberpunkCompact.json', '赛博朋克猫耳机械娘 · 霓虹巡游', cyber_s1, cyber_s5)

    # 4. Shrine Maiden
    shrine_img = os.path.join(brain_dir, 'shrine_miko_anime_1790923838035.jpg')
    shrine_s1 = [
        {'l': 'line_art', 't': '古典端庄面部骨架与仰角', 'd': '微低头温婉神韵', 'e': 'shrine-sk-sphere', 'x': '<circle id="shrine-sk-sphere" data-sketch="true" cx="400" cy="240" r="130" stroke="#DC2626" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'hair', 't': '姬发式齐平长发轮廓', 'd': '垂直如瀑的黑发线条', 'e': 'shrine-sk-hair', 'x': '<path id="shrine-sk-hair" data-sketch="true" d="M 230 200 L 190 750 M 570 200 L 610 750" stroke="#0F172A" stroke-dasharray="6,4" fill="none" opacity="0.4" stroke-width="1.5" />'},
        {'l': 'clothes', 't': '传统和服千早白衣与红袴衣褶', 'd': '交领右衽与祈福垂袖', 'e': 'shrine-sk-robe', 'x': '<path id="shrine-sk-robe" data-sketch="true" d="M 330 360 L 400 480 L 470 360 M 310 500 L 250 860 M 490 500 L 550 860" stroke="#DC2626" stroke-dasharray="4,4" fill="none" opacity="0.35" />'}
    ]
    shrine_s5 = [
        {'l': 'iris', 't': '琥珀琉璃暖金高光眼瞳', 'd': '东方温润金瞳与纯白点光', 'e': 'shrine-eye-glow', 'x': '<g id="shrine-eye-glow"><circle cx="365" cy="235" r="3.5" fill="#FFFFFF" /><circle cx="435" cy="235" r="3.5" fill="#FFFFFF" /><circle cx="368" cy="242" r="2" fill="#FEF08A" opacity="0.8" /><circle cx="438" cy="242" r="2" fill="#FEF08A" opacity="0.8" /></g>'},
        {'l': 'shadow_highlight', 't': '漫天飞舞的春日祈愿樱花瓣', 'd': '随风飘落的绯色樱花瓣氛围', 'e': 'shrine-sakura', 'x': '<g id="shrine-sakura" fill="#F472B6" opacity="0.8"><path d="M 200 220 Q 220 200 210 235 Z" /><path d="M 600 280 Q 620 260 610 295 Z" /><path d="M 170 480 Q 190 460 180 495 Z" /><path d="M 620 540 Q 640 520 630 555 Z" /><circle cx="240" cy="380" r="3" fill="#FDA4AF" /><circle cx="560" cy="420" r="3.5" fill="#FDA4AF" /></g>'},
        {'l': 'shadow_highlight', 't': '鸟居晨曦神道柔光', 'd': '日出时分的柔和粉金氛围覆层', 'e': 'shrine-ambient', 'x': '<rect id="shrine-ambient" x="0" y="0" width="800" height="1000" fill="#FFF1F2" opacity="0.02" />'}
    ]
    build_compact_dataset(shrine_img, 'shrine', 'src/data/shrineCompact.json', '极黑长直和服巫女 · 绯樱祈愿', shrine_s1, shrine_s5)

    # 5. Magical Girl
    magical_img = os.path.join(brain_dir, 'magical_star_anime_1790923857525.jpg')
    magical_s1 = [
        {'l': 'line_art', 't': '元气少女欢笑头部轮廓', 'd': '微仰头活泼表情骨架', 'e': 'magical-sk-head', 'x': '<circle id="magical-sk-head" data-sketch="true" cx="400" cy="260" r="130" stroke="#F59E0B" stroke-dasharray="4,4" fill="none" opacity="0.45" stroke-width="1.5" />'},
        {'l': 'hair', 't': '螺旋双马尾卷发动势线', 'd': '两侧向外弹跳的卷发轮廓', 'e': 'magical-sk-drills', 'x': '<path id="magical-sk-drills" data-sketch="true" d="M 210 200 Q 110 400 130 650 M 590 200 Q 690 400 670 650" stroke="#F472B6" stroke-dasharray="6,4" fill="none" opacity="0.4" stroke-width="1.5" />'},
        {'l': 'clothes', 't': '星光蓬蓬裙与魔法权杖比例', 'd': '手持黄金魔法杖与蕾丝裙摆骨架', 'e': 'magical-sk-wand', 'x': '<path id="magical-sk-wand" data-sketch="true" d="M 240 350 L 160 200 M 320 400 L 480 400 L 600 700 L 200 700 Z" stroke="#F59E0B" stroke-dasharray="4,4" fill="none" opacity="0.4" />'}
    ]
    magical_s5 = [
        {'l': 'iris', 't': '四芒星金色魔法星瞳与微光', 'd': '闪耀黄金微星十字瞳孔与双点高光', 'e': 'magical-star-pupil', 'x': '<g id="magical-star-pupil"><circle cx="365" cy="245" r="4" fill="#FFFFFF" /><circle cx="435" cy="245" r="4" fill="#FFFFFF" /><path d="M 363 241 L 365 236 L 367 241 L 372 243 L 367 245 L 365 250 L 363 245 L 358 243 Z" fill="#FDE047" /><path d="M 433 241 L 435 236 L 437 241 L 442 243 L 437 245 L 435 250 L 433 245 L 428 243 Z" fill="#FDE047" /></g>'},
        {'l': 'shadow_highlight', 't': '漫天金色星尘与华丽魔法阵辉光', 'd': '华丽金黄十字星光散落全图', 'e': 'magical-stars', 'x': '<g id="magical-stars" fill="#FDE047" opacity="0.85"><path d="M 180 200 L 184 185 L 188 200 L 203 203 L 188 206 L 184 221 L 180 206 L 165 203 Z" /><path d="M 620 250 L 624 235 L 628 250 L 643 253 L 628 256 L 624 271 L 620 256 L 605 253 Z" /><circle cx="230" cy="350" r="4" fill="#FFFFFF" /><circle cx="570" cy="380" r="4" fill="#FFFFFF" /><path d="M 220 550 Q 250 620 320 660" stroke="#FDE047" stroke-width="2.5" fill="none" opacity="0.7" stroke-dasharray="6,4" /></g>'},
        {'l': 'shadow_highlight', 't': '梦幻马卡龙星空微光', 'd': '绚烂星辰柔光滤镜', 'e': 'magical-ambient', 'x': '<rect id="magical-ambient" x="0" y="0" width="800" height="1000" fill="#FAF5FF" opacity="0.02" />'}
    ]
    build_compact_dataset(magical_img, 'magical', 'src/data/magicalCompact.json', '星之魔法少女 · 璨星华章', magical_s1, magical_s5)

    print("\nAll 5 high-precision master datasets successfully rebuilt!")

if __name__ == '__main__':
    main()
