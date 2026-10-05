import sys
import os
import json
import argparse
import xml.etree.ElementTree as ET
import cv2
import numpy as np
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

def vectorize_layer_mask(bgr, mask, out_svg, filter_spec=10, layer_diff=20):
    h, w, _ = bgr.shape
    isolated = np.full((h, w, 3), 255, dtype=np.uint8)
    isolated[mask] = bgr[mask]
    temp_png = out_svg.replace('.svg', '.png')
    cv2.imwrite(temp_png, isolated)

    try:
        vtracer.convert_image_to_svg_py(
            temp_png,
            out_svg,
            colormode='color',
            hierarchical='stacked',
            mode='spline',
            filter_speckle=filter_spec,
            color_precision=6,
            layer_difference=layer_diff
        )
    finally:
        if os.path.exists(temp_png):
            try:
                os.remove(temp_png)
            except Exception:
                pass

    tree = ET.parse(out_svg)
    root = tree.getroot()
    clean_paths = []
    for p in list(root):
        fill = p.attrib.get('fill', '#FFFFFF').upper()
        d = p.attrib.get('d', '')
        # Exclude pure white canvas bounding rect
        if fill in ['#FFFFFF', '#FEFEFE', '#FDFDFD'] and ('C0 0' in d or len(d) < 200):
            continue
        clean_paths.append(p)
    return clean_paths

def decompose_and_vectorize_image(image_path, title='AI 矢量演进工程', target_steps=10000):
    bgr = cv2.imread(image_path)
    if bgr is None:
        raise ValueError(f"Failed to read image at {image_path}")

    h, w, _ = bgr.shape
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    # 1. Automatic Face & Head Landmark Localization
    skin_raw = (hsv[:,:,0] >= 3) & (hsv[:,:,0] <= 24) & (hsv[:,:,1] >= 12) & (hsv[:,:,1] <= 85) & (hsv[:,:,2] >= 170)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    skin_clean = cv2.morphologyEx(skin_raw.astype(np.uint8), cv2.MORPH_OPEN, kernel)

    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(skin_clean)
    face_comp = -1
    max_area = 0
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        cx, cy = centroids[i]
        if 0.18 * h < cy < 0.55 * h and 0.25 * w < cx < 0.85 * w:
            if area > max_area:
                max_area = area
                face_comp = i

    if face_comp > 0:
        face_cx, face_cy = centroids[face_comp]
        fx, fy = stats[face_comp, cv2.CC_STAT_LEFT], stats[face_comp, cv2.CC_STAT_TOP]
        fw, fh = stats[face_comp, cv2.CC_STAT_WIDTH], stats[face_comp, cv2.CC_STAT_HEIGHT]
    else:
        face_cx, face_cy = w * 0.5, h * 0.35
        fx, fy, fw, fh = int(w * 0.35), int(h * 0.25), int(w * 0.3), int(h * 0.2)

    # 2. Build Structural Head Zone
    head_zone = np.zeros((h, w), dtype=np.uint8)
    cv2.ellipse(head_zone, (int(face_cx), int(face_cy - 40)), (int(fw * 1.8), int(fh * 1.9)), -10, 0, 360, 255, -1)
    cv2.ellipse(head_zone, (int(face_cx - 240), int(face_cy - 120)), (170, 190), -25, 0, 360, 255, -1)
    cv2.ellipse(head_zone, (int(face_cx + 170), int(face_cy + 20)), (160, 230), 20, 0, 360, 255, -1)

    # 3. Detect Hair Colors & Head Accessories
    # Color signature in head zone outside of skin
    head_pixels = hsv[head_zone > 0]
    head_skin = skin_clean[head_zone > 0] > 0
    hair_candidate_pixels = head_pixels[~head_skin]

    pink_all = ((hsv[:,:,0] >= 160) | (hsv[:,:,0] <= 14)) & (hsv[:,:,1] >= 28) & (hsv[:,:,2] >= 110)
    pink_hair = (pink_all & (head_zone > 0)).astype(np.uint8)

    kernel_hair = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    hair_hull = cv2.morphologyEx(pink_hair, cv2.MORPH_CLOSE, kernel_hair)
    hair_hull = cv2.dilate(hair_hull, kernel_hair, iterations=1)

    dark_elements = (hsv[:,:,2] < 75)
    face_box_mask = np.zeros((h, w), dtype=bool)
    face_box_mask[max(0, fy+15):min(h, fy+fh-10), max(0, fx+15):min(w, fx+fw-15)] = True

    # HAIR MASK (Strictly within head zone, excluding skin and eye interiors)
    mask_hair = (hair_hull > 0) & (~skin_clean.astype(bool)) & (~face_box_mask)
    mask_hair = mask_hair & (pink_all | (dark_elements & (head_zone > 0)))

    # IRIS & FACIAL EXPRESSION MASK
    eye_zone = np.zeros((h, w), dtype=bool)
    eye_zone[max(0, fy-10):min(h, fy+fh+15), max(0, fx-10):min(w, fx+fw+10)] = True
    mask_iris = eye_zone & (pink_all | dark_elements) & (~mask_hair)

    # SKIN MASK
    mask_skin = skin_clean.astype(bool) & (~mask_iris) & (~mask_hair)

    # CLOTHES MASK (Character central torso / lower body)
    char_zone = np.zeros((h, w), dtype=bool)
    pts = np.array([[int(w*0.2), int(h*0.32)], [int(w*0.9), int(h*0.32)], [int(w*0.95), int(h*0.72)], [int(w*0.65), int(h*0.99)], [int(w*0.15), int(h*0.99)], [int(w*0.08), int(h*0.65)]], np.int32)
    cv2.fillPoly(char_zone.view(np.uint8), [pts], 1)
    char_zone = char_zone.astype(bool)
    mask_clothes = char_zone & (~mask_hair) & (~mask_skin) & (~mask_iris)

    # BACKGROUND MASK
    mask_bg = (~mask_hair) & (~mask_skin) & (~mask_iris) & (~mask_clothes)

    # 4. Perform Layer-wise Vectorization
    temp_dir = os.path.dirname(image_path)
    os.makedirs(temp_dir, exist_ok=True)

    bg_svg = os.path.join(temp_dir, 'tmp_bg.svg')
    skin_svg = os.path.join(temp_dir, 'tmp_skin.svg')
    clothes_svg = os.path.join(temp_dir, 'tmp_clothes.svg')
    iris_svg = os.path.join(temp_dir, 'tmp_iris.svg')
    hair_svg = os.path.join(temp_dir, 'tmp_hair.svg')

    try:
        paths_bg = vectorize_layer_mask(bgr, mask_bg, bg_svg, 15, 24)
        paths_skin = vectorize_layer_mask(bgr, mask_skin, skin_svg, 8, 16)
        paths_clothes = vectorize_layer_mask(bgr, mask_clothes, clothes_svg, 10, 20)
        paths_iris = vectorize_layer_mask(bgr, mask_iris, iris_svg, 4, 12)
        paths_hair = vectorize_layer_mask(bgr, mask_hair, hair_svg, 8, 16)
    finally:
        for p in [bg_svg, skin_svg, clothes_svg, iris_svg, hair_svg]:
            if os.path.exists(p):
                try: os.remove(p)
                except Exception: pass

    # Coordinate scaling to standard Studio 800x1000 viewBox
    target_h = 1000.0
    scale_y = target_h / float(h)
    scale_x = scale_y
    scaled_w = float(w) * scale_x
    offset_x = (800.0 - scaled_w) / 2.0

    ordered_groups = [
        ('background', '背景特效', paths_bg),
        ('skin_body', '身体肤色', paths_skin),
        ('iris', '五官眼眸', paths_iris),
        ('clothes', '服饰层次', paths_clothes),
        ('hair', '发型轮廓', paths_hair),
    ]

    all_items = []
    for lid, lname, plist in ordered_groups:
        for p in plist:
            all_items.append({
                'layer_id': lid,
                'layer_name': lname,
                'fill': p.attrib.get('fill', '#FFFFFF'),
                'd': p.attrib.get('d', ''),
                'orig_t': p.attrib.get('transform', '')
            })

    total_paths = len(all_items)
    steps = []
    current_id = 1

    # Stage 1 Guide Sketch
    s1_steps = [
        {
            'title': '头部透视结构球与空间仰角定界',
            'desc': '确立头部骨架中心与微倾透视空间骨架',
            'layerId': 'hair',
            'layerName': '发型轮廓',
            'elementId': 'sketch-head-sphere',
            'xml': f'<circle id="sketch-head-sphere" data-sketch="true" cx="{400}" cy="{330}" r="140" stroke="#F472B6" stroke-dasharray="4,4" fill="none" opacity="0.4" stroke-width="1.5" />'
        },
        {
            'title': '体态轮廓与服饰结构骨架',
            'desc': '确立肩颈比例、腰跨与服饰外轮廓基准',
            'layerId': 'clothes',
            'layerName': '服饰层次',
            'elementId': 'sketch-torso-axis',
            'xml': '<path id="sketch-torso-axis" data-sketch="true" d="M 330 430 C 320 540 230 630 190 850 M 470 430 C 480 540 570 630 610 850" stroke="#38BDF8" stroke-dasharray="4,4" fill="none" opacity="0.35" stroke-width="1.2" />'
        }
    ]

    for s in s1_steps:
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

    s2_cut = int(total_paths * 0.25)
    s3_cut = int(total_paths * 0.55)
    s4_cut = int(total_paths * 0.85)

    for i, item in enumerate(all_items):
        d = item['d']
        fill = item['fill']
        orig_t = item['orig_t']
        comb_t = f'translate({offset_x:.1f}, 0) scale({scale_x:.4f}, {scale_y:.4f}) {orig_t}'.strip()
        elem_id = f'vec-step-{i+1}'
        xml_patch = f'<path id="{elem_id}" fill="{fill}" d="{d}" transform="{comb_t}" />'

        if i < s2_cut:
            stage_id = 'stage-2'
            stage_name = '02底色铺设'
            desc = f"{item['layer_name']} · 底色与固有块面构建"
        elif i < s3_cut:
            stage_id = 'stage-3'
            stage_name = '03结构阴影'
            desc = f"{item['layer_name']} · 结构转折与立体阴影建模"
        elif i < s4_cut:
            stage_id = 'stage-4'
            stage_name = '04细部雕琢'
            desc = f"{item['layer_name']} · 局部高精轮廓与过渡细节"
        else:
            stage_id = 'stage-5'
            stage_name = '05神圣光晕'
            desc = f"{item['layer_name']} · 高光漫射与神圣微光渲染"

        steps.append({
            'id': current_id,
            'stageId': stage_id,
            'stageName': stage_name,
            'layerId': item['layer_id'],
            'layerName': item['layer_name'],
            'title': f"{item['layer_name']} 矢量切件 #{i+1}",
            'description': desc,
            'elementId': elem_id,
            'xmlPatch': xml_patch,
            'addedLines': [f"+ {xml_patch}"],
            'removedLines': [],
            'diff': {'type': 'add', 'addedLines': [f"+ {xml_patch}"]}
        })
        current_id += 1

    stages = [
        {
            'id': 'stage-1',
            'name': '01初版草图',
            'title': '初版草图 · 空间透视与姿态骨架',
            'description': '空间透视中轴基准与动态定界',
            'startStep': 1,
            'endStep': len(s1_steps),
            'themeColor': '#38BDF8'
        },
        {
            'id': 'stage-2',
            'name': '02底色铺设',
            'title': '底色铺设 · 固有色与剪影块面',
            'description': '确立背景、身体、发束固有底色',
            'startStep': len(s1_steps) + 1,
            'endStep': len(s1_steps) + s2_cut,
            'themeColor': '#A78BFA'
        },
        {
            'id': 'stage-3',
            'name': '03结构阴影',
            'title': '结构阴影 · 赛璐璐转折与体积建模',
            'description': '发丝阴影、裙褶结构与面部闭塞阴影',
            'startStep': len(s1_steps) + s2_cut + 1,
            'endStep': len(s1_steps) + s3_cut,
            'themeColor': '#818CF8'
        },
        {
            'id': 'stage-4',
            'name': '04细部雕琢',
            'title': '细部雕琢 · 发丝细节与局部纹理',
            'description': '五官瞳眸高精刻画与服饰细节',
            'startStep': len(s1_steps) + s3_cut + 1,
            'endStep': len(s1_steps) + s4_cut,
            'themeColor': '#F472B6'
        },
        {
            'id': 'stage-5',
            'name': '05神圣光晕',
            'title': '氛围润色 · 高光漫射与神圣微光',
            'description': '高光点睛、发丝反光与环境微光',
            'startStep': len(s1_steps) + s4_cut + 1,
            'endStep': len(steps),
            'themeColor': '#FDE047'
        }
    ]

    return {
        'title': title,
        'version': '1.0.0',
        'viewBox': '0 0 800 1000',
        'canvasWidth': 800,
        'canvasHeight': 1000,
        'stages': stages,
        'steps': steps
    }

def main():
    parser = argparse.ArgumentParser(description="Layer-Wise Semantic Vectorization Service")
    parser.add_argument("--input", required=True, help="Path to input image")
    parser.add_argument("--output", required=True, help="Path to output JSON")
    parser.add_argument("--title", default="AI 图像矢量化工程", help="Project title")
    parser.add_argument("--steps", type=int, default=10000, help="Target steps")
    args = parser.parse_args()

    try:
        project = decompose_and_vectorize_image(args.input, title=args.title, target_steps=args.steps)
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(project, f, ensure_ascii=False, indent=2)
        print(f"Successfully generated layered vector project with {len(project['steps'])} steps.")
    except Exception as e:
        sys.stderr.write(f"[Vectorize Service Error]: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
