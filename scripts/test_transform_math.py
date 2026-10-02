import re

def compute_transformed_bbox(xml_str):
    m_d = re.search(r'd="([^"]+)"', xml_str)
    if not m_d:
        return 0, 0, 0, 0, 0, 0, 0, 0
    d = m_d.group(1)
    nums = [float(x) for x in re.findall(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', d)]
    if len(nums) < 4:
        return 0, 0, 0, 0, 0, 0, 0, 0
    
    xs = nums[0::2]
    ys = nums[1::2]
    min_x_raw, max_x_raw = min(xs), max(xs)
    min_y_raw, max_y_raw = min(ys), max(ys)
    
    # Parse transforms
    # Find all translates and scales
    translates = [ (float(a), float(b)) for a, b in re.findall(r'translate\(([\d.-]+)\s*,\s*([\d.-]+)\)', xml_str) ]
    scales = [ (float(a), float(b)) for a, b in re.findall(r'scale\(([\d.-]+)\s*,\s*([\d.-]+)\)', xml_str) ]
    
    # If pattern is translate(tx1, ty1) scale(sx, sy) translate(tx2, ty2)
    # Applied right to left on points:
    # x_final = (x_raw + tx2) * sx + tx1
    # y_final = (y_raw + ty2) * sy + ty1
    tx1, ty1 = translates[0] if len(translates) > 0 else (0.0, 0.0)
    tx2, ty2 = translates[1] if len(translates) > 1 else (0.0, 0.0)
    sx, sy = scales[0] if len(scales) > 0 else (1.0, 1.0)
    
    min_x = (min_x_raw + tx2) * sx + tx1
    max_x = (max_x_raw + tx2) * sx + tx1
    min_y = (min_y_raw + ty2) * sy + ty1
    max_y = (max_y_raw + ty2) * sy + ty1
    
    w = max_x - min_x
    h = max_y - min_y
    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    return min_x, min_y, max_x, max_y, w, h, cx, cy

# Test on sylphie-p4
xml_test = '<path id="sylphie-p4" fill="#5D70C6" d="M0 0 C0.7 0 1.3 0 2 0 C1.3 7.5 -0.4 14.7 -18.7 37.0 -10.5 25.6 -4.3 13.3 0 0 Z " transform="translate(26.7, 0) scale(0.8333, 0.8333) translate(429,578)" />'
print("sylphie-p4 coords:", compute_transformed_bbox(xml_test))
