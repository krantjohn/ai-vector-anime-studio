import sys
import os
import json
import argparse
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

def classify_layer(path_elem):
    fill = path_elem.attrib.get('fill', '#FFFFFF')
    rgb = hex_to_rgb(fill)
    r, g, b = rgb
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    # Background canvas plates & large rects
    d = path_elem.attrib.get('d', '')
    if 'C0 0' in d or 'C295' in d or lum > 250:
        return 'background', '背景特效'

    # Dark line art / lashes / contours
    if lum < 85:
        return 'line_art', '线条勾勒'
    # Iris / Gold / Amber / Pupils
    if (r > 160 and g > 120 and b < 120 and r > b + 40) or (r > 200 and g > 160 and b < 100):
        return 'iris', '五官眼眸'
    # Skin & Body (warm light peach / ivory)
    if is_skin_tone(r, g, b, lum):
        return 'skin_body', '身体肤色'
    # Hair / Sakura Pink / Magenta / Lilac / Purple
    if (r > 190 and b > 140 and r > g + 20) or (r > 200 and g < 185 and b > 145) or (b > 180 and r > 170 and g < 175):
        return 'hair', '发型轮廓'
    # Clothes / Navy / White / Ribbon
    if (b > 120 and b > r + 20 and b > g + 20) or (lum > 225 and abs(r - g) < 20 and abs(r - b) < 20):
        return 'clothes', '服饰层次'
    # Shadow & Highlight / Blushes
    return 'shadow_highlight', '阴影高光'

def vectorize_image_to_project(image_path, title='AI 矢量演进工程', target_steps=10000):
    norm_png = os.path.splitext(image_path)[0] + '_norm.png'
    try:
        with Image.open(image_path) as im:
            im.convert('RGB').save(norm_png, 'PNG')
        src_for_vtracer = norm_png
    except Exception as e:
        sys.stderr.write(f"[PIL Normalization Error on {image_path}]: {e}\n")
        src_for_vtracer = image_path

    temp_svg = os.path.splitext(image_path)[0] + '_temp_vec.svg'
    
    # 1. Run vtracer with crisp spline parameters
    try:
        vtracer.convert_image_to_svg_py(
            src_for_vtracer,
            temp_svg,
            colormode='color',
            hierarchical='stacked',
            mode='spline',
            filter_speckle=10,
            color_precision=6,
            layer_difference=20
        )
    finally:
        if os.path.exists(norm_png):
            try:
                os.remove(norm_png)
            except Exception:
                pass

    tree = ET.parse(temp_svg)
    root = tree.getroot()
    raw_paths = list(root)

    # Clean up temp file
    try:
        os.remove(temp_svg)
    except Exception:
        pass

    # Read original SVG width & height to calculate aspect ratio scale
    orig_w = float(root.attrib.get('width', 800))
    orig_h = float(root.attrib.get('height', 1000))
    scale_y = 1000.0 / orig_h if orig_h > 0 else 1.0
    scale_x = scale_y
    scaled_w = orig_w * scale_x
    offset_x = (800.0 - scaled_w) / 2.0

    steps = []
    current_id = 1

    # Stage 1: Sketch wireframes
    stage_1_steps = [
        {
            'title': '头部透视结构球与空间仰角定界',
            'desc': '确立头部骨架中心与微倾透视空间骨架',
            'layerId': 'line_art',
            'layerName': '线条勾勒',
            'elementId': 'sketch-head-sphere',
            'xml': '<circle id="sketch-head-sphere" data-sketch="true" cx="400" cy="330" r="140" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.5" />'
        },
        {
            'title': '三庭五眼对齐轴线与视平线',
            'desc': '五官对齐中轴基准线与眼眶透视参考线',
            'layerId': 'line_art',
            'layerName': '线条勾勒',
            'elementId': 'sketch-axes',
            'xml': '<path id="sketch-axes" data-sketch="true" d="M 400 180 L 400 520 M 260 330 L 540 330" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.2" />'
        },
        {
            'title': '少女柔美下颌骨与面部轮廓草图',
            'desc': '3/4侧脸微收下颌曲线与下巴定位',
            'layerId': 'line_art',
            'layerName': '线条勾勒',
            'elementId': 'sketch-jaw',
            'xml': '<path id="sketch-jaw" data-sketch="true" d="M 270 290 Q 285 400 400 430 Q 515 400 530 290" stroke="#38BDF8" fill="none" opacity="0.45" stroke-width="1.5" />'
        },
        {
            'title': '眼眶视平线与双眼空间比例框位',
            'desc': '确立左右眼眶在空间中的透视透光区域',
            'layerId': 'line_art',
            'layerName': '线条勾勒',
            'elementId': 'sketch-eyes',
            'xml': '<g id="sketch-eyes" data-sketch="true" stroke="#38BDF8" fill="none" opacity="0.4" stroke-width="1.2"><rect x="310" y="300" width="70" height="50" rx="4" /><rect x="420" y="300" width="70" height="50" rx="4" /></g>'
        },
        {
            'title': '发量轮廓与长发动势辅助线',
            'desc': '确立蓬松发包与主要发束动态走势',
            'layerId': 'hair',
            'layerName': '发型轮廓',
            'elementId': 'sketch-hair-mass',
            'xml': '<path id="sketch-hair-mass" data-sketch="true" d="M 200 280 C 180 440 180 650 150 820 M 240 190 C 350 100 550 100 590 270" stroke="#F472B6" stroke-dasharray="6,4" fill="none" opacity="0.4" stroke-width="1.5" />'
        },
        {
            'title': '身体姿态与服饰轮廓骨架',
            'desc': '确立肩颈比例、衣领及上半身体态基准',
            'layerId': 'skin_body',
            'layerName': '身体肤色',
            'elementId': 'sketch-torso',
            'xml': '<path id="sketch-torso" data-sketch="true" d="M 330 430 C 320 540 230 630 190 850 M 470 430 C 480 540 570 630 610 850" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.35" stroke-width="1.2" />'
        }
    ]

    for s in stage_1_steps:
        steps.append({
            'id': current_id,
            'stageId': 'stage-1',
            'stageName': '01初版草图',
            'layerId': s['layerId'],
            'layerName': s['layerName'],
            'title': s['title'],
            'description': s['desc'],
            'elementId': s['elementId'],
            'xmlPatch': s['xml'],
            'addedLines': [f"+ {s['xml']}"],
            'removedLines': [],
            'diff': {'type': 'add', 'addedLines': [f"+ {s['xml']}"]}
        })
        current_id += 1

    # Stages 2 to 5: Vector Micro-Steps
    total_raw = len(raw_paths)
    s2_cut = int(total_raw * 0.22)
    s3_cut = int(total_raw * 0.60)
    s4_cut = int(total_raw * 0.90)

    for i, p in enumerate(raw_paths):
        d = p.attrib.get('d', '')
        fill = p.attrib.get('fill', '#000000')
        t = p.attrib.get('transform', '')
        combined_t = f'translate({offset_x:.1f}, 0) scale({scale_x:.4f}, {scale_y:.4f}) {t}'.strip()
        layer_id, layer_name = classify_layer(p)

        if i < s2_cut:
            stage_id = 'stage-2'
            stage_name = '02底色铺设'
            stage_desc = '底色铺设 · 固有色与剪影块面'
        elif i < s3_cut:
            stage_id = 'stage-3'
            stage_name = '03结构阴影'
            stage_desc = '结构阴影 · 赛璐璐转折与体积建模'
        elif i < s4_cut:
            stage_id = 'stage-4'
            stage_name = '04细部雕琢'
            stage_desc = '细部雕琢 · 发丝细节与局部纹理'
        else:
            stage_id = 'stage-5'
            stage_name = '05神圣光晕'
            stage_desc = '氛围润色 · 高光漫射与神圣微光'

        elem_id = f'vec-step-{i+1}'
        xml_patch = f'<path id="{elem_id}" fill="{fill}" d="{d}" transform="{combined_t}" />'

        steps.append({
            'id': current_id,
            'stageId': stage_id,
            'stageName': stage_name,
            'layerId': layer_id,
            'layerName': layer_name,
            'title': f'{layer_name}微步 #{i+1}',
            'description': f'{stage_desc} (填充色: {fill})',
            'elementId': elem_id,
            'xmlPatch': xml_patch,
            'addedLines': [f"+ {xml_patch}"],
            'removedLines': [],
            'diff': {'type': 'add', 'addedLines': [f"+ {xml_patch}"]}
        })
        current_id += 1

    # Stages definition with safe boundaries
    s1 = [s for s in steps if s['stageId'] == 'stage-1']
    s2 = [s for s in steps if s['stageId'] == 'stage-2']
    s3 = [s for s in steps if s['stageId'] == 'stage-3']
    s4 = [s for s in steps if s['stageId'] == 'stage-4']
    s5 = [s for s in steps if s['stageId'] == 'stage-5']

    def safe_step_range(step_list, fallback_start, fallback_end):
        if step_list:
            return step_list[0]['id'], step_list[-1]['id']
        return fallback_start, fallback_end

    total_step_count = len(steps)
    s1_start, s1_end = safe_step_range(s1, 1, max(1, int(total_step_count * 0.2)))
    s2_start, s2_end = safe_step_range(s2, s1_end + 1, max(s1_end + 1, int(total_step_count * 0.45)))
    s3_start, s3_end = safe_step_range(s3, s2_end + 1, max(s2_end + 1, int(total_step_count * 0.70)))
    s4_start, s4_end = safe_step_range(s4, s3_end + 1, max(s3_end + 1, int(total_step_count * 0.88)))
    s5_start, s5_end = safe_step_range(s5, s4_end + 1, total_step_count)

    stages = [
        {'id': 'stage-1', 'stageNumber': 1, 'name': '01初版草图', 'subtitle': f'草稿定位 ({len(s1)}微步)', 'startStep': s1_start, 'endStep': s1_end, 'description': '结构骨架与比例定位'},
        {'id': 'stage-2', 'stageNumber': 2, 'name': '02底色铺设', 'subtitle': f'底色铺设 ({len(s2)}微步)', 'startStep': s2_start, 'endStep': s2_end, 'description': '角色底层固有色与剪影块面'},
        {'id': 'stage-3', 'stageNumber': 3, 'name': '03结构阴影', 'subtitle': f'明暗交界 ({len(s3)}微步)', 'startStep': s3_start, 'endStep': s3_end, 'description': '赛璐璐体积阴影与遮挡关系'},
        {'id': 'stage-4', 'stageNumber': 4, 'name': '04细部雕琢', 'subtitle': f'精细雕琢 ({len(s4)}微步)', 'startStep': s4_start, 'endStep': s4_end, 'description': '发丝飞扬微结构与五官质感'},
        {'id': 'stage-5', 'stageNumber': 5, 'name': '05神圣光晕', 'subtitle': f'终景润色 ({len(s5)}微步)', 'startStep': s5_start, 'endStep': s5_end, 'description': '漫射高光、辉映与神圣氛围'},
    ]

    base_project = {
        'title': title,
        'version': '2.0.0-vectorized',
        'canvasWidth': 800,
        'canvasHeight': 1000,
        'viewBox': '0 0 800 1000',
        'stages': stages,
        'steps': steps
    }

    if target_steps > len(steps):
        # Expand steps to 10,000 steps
        expanded_steps = []
        base_count = len(steps)
        exp_factor = target_steps // base_count
        rem = target_steps % base_count
        global_id = 1

        for i in range(base_count):
            base_s = steps[i]
            sub_count = exp_factor + (1 if i < rem else 0)
            for sub in range(sub_count):
                prog = (sub + 1) / sub_count
                is_final = sub == (sub_count - 1)
                sub_id = global_id
                global_id += 1

                sub_patch = base_s['xmlPatch']
                if not is_final and '<path' in sub_patch:
                    op = max(0.15, round(prog, 2))
                    sub_patch = sub_patch.replace('<path ', f'<path data-micro-step="{sub_id}" opacity="{op}" ')

                expanded_steps.append({
                    'id': sub_id,
                    'step': sub_id,
                    'stageId': base_s['stageId'],
                    'stageName': base_s['stageName'],
                    'layerId': base_s['layerId'],
                    'layerName': base_s['layerName'],
                    'title': f"{base_s['title']} (微步 {sub+1}/{sub_count})" if sub_count > 1 else base_s['title'],
                    'description': base_s['description'],
                    'elementId': f"{base_s['elementId']}-p{sub+1}",
                    'xmlPatch': sub_patch,
                    'addedLines': [f"+ {sub_patch}"],
                    'removedLines': [],
                    'diff': {'type': 'add', 'addedLines': [f"+ {sub_patch}"]}
                })

        # Remap stages
        new_stages = []
        for st in stages:
            m = [s for s in expanded_steps if s['stageId'] == st['id']]
            new_stages.append({
                'id': st['id'],
                'stageNumber': st['stageNumber'],
                'name': st['name'],
                'subtitle': f"{st['name']} ({len(m)} 微步)",
                'startStep': m[0]['id'] if m else 1,
                'endStep': m[-1]['id'] if m else target_steps,
                'description': st['description']
            })

        return {
            'title': f'{title} (10,000步精修版)',
            'version': '2.0.0-density-10k',
            'canvasWidth': 800,
            'canvasHeight': 1000,
            'viewBox': '0 0 800 1000',
            'stages': new_stages,
            'steps': expanded_steps
        }

    return base_project

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--title', default='AI 矢量演进工程')
    parser.add_argument('--steps', type=int, default=10000)
    args = parser.parse_args()

    proj = vectorize_image_to_project(args.input, args.title, args.steps)
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(proj, f, ensure_ascii=False)
    print(f'Successfully vectorized {args.input} to {args.output} with {len(proj["steps"])} steps.')
