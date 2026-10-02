import xml.etree.ElementTree as ET
import json
import math

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 6:
        return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return (255, 255, 255)

def classify_layer_and_stage(path_elem, idx, total):
    fill = path_elem.attrib.get('fill', '#FFFFFF')
    d = path_elem.attrib.get('d', '')
    t = path_elem.attrib.get('transform', '')
    rgb = hex_to_rgb(fill)
    r, g, b = rgb
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    # Estimate path length / complexity
    path_len = len(d)

    # Layer Classification
    # 1. Dark line art / lashes / contours
    if lum < 100:
        layer_id = 'line_art'
        layer_name = '线条勾勒'
    # 2. Iris / Gold / Amber / Pupils
    elif (r > 160 and g > 120 and b < 120 and r > b + 40) or (r > 200 and g > 160 and b < 100):
        layer_id = 'iris'
        layer_name = '虹膜笔触'
    # 3. Hair / Sakura Pink / Magenta / Lilac
    elif (r > 190 and b > 140 and r > g + 20) or (r > 200 and g < 185 and b > 145) or (b > 180 and r > 170 and g < 175):
        layer_id = 'hair'
        layer_name = '发型轮廓'
    # 4. Clothes / Navy / White / Ribbon
    elif (b > 120 and b > r + 20 and b > g + 20) or (lum > 225 and abs(r - g) < 20 and abs(r - b) < 20):
        layer_id = 'clothes'
        layer_name = '服饰层次'
    # 5. Shadow & Highlight / Skin / Blushes
    else:
        layer_id = 'shadow_highlight'
        layer_name = '阴影高光'

    # Stage Assignment based on natural painting progression
    # Stage 2: 11..160 (Base flat colors, underpainting)
    # Stage 3: 161..420 (Cel shading & midtone structure)
    # Stage 4: 421..670 (Fine details & features)
    # Stage 5: 671..740+ (Highlights & divine radiance)
    progress = idx / total
    if progress < 0.22:
        stage_id = 'stage-2'
        stage_name = '02底色铺设'
        stage_desc = '铺设角色底层固有色与剪影块面'
    elif progress < 0.60:
        stage_id = 'stage-3'
        stage_name = '03结构阴影'
        stage_desc = '赛璐璐明暗转折与结构阴影雕琢'
    elif progress < 0.90:
        stage_id = 'stage-4'
        stage_name = '04细部雕琢'
        stage_desc = '发丝飞扬微结构、眼眸晶莹质感与服饰蕾丝'
    else:
        stage_id = 'stage-5'
        stage_name = '05神圣光晕'
        stage_desc = '高光辉映、天使光环与粒子润部'

    return layer_id, layer_name, stage_id, stage_name, stage_desc

tree = ET.parse('test_crisp.svg')
root = tree.getroot()
paths = list(root)
print(f'Parsed {len(paths)} paths successfully.')
