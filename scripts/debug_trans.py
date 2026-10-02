import re

xml_test = '<path id="sylphie-p4" fill="#5D70C6" d="M0 0 C0.7 0 1.3 0 2 0 C1.3 7.5 -0.4 14.7 -18.7 37.0 -10.5 25.6 -4.3 13.3 0 0 Z " transform="translate(26.7, 0) scale(0.8333, 0.8333) translate(429,578)" />'
m_d = re.search(r'\bd="([^"]+)"', xml_test)
d = m_d.group(1)
print("Matched d:", d[:30])
nums = [float(x) for x in re.findall(r'[-+]?(?:\d*\.\d+|\d+)', d)]
print("nums len:", len(nums))
xs_raw = nums[0::2]
ys_raw = nums[1::2]

translates = [(float(a), float(b)) for a, b in re.findall(r'translate\(([\d.-]+)\s*,\s*([\d.-]+)\)', xml_test)]
scales = [(float(a), float(b)) for a, b in re.findall(r'scale\(([\d.-]+)\s*,\s*([\d.-]+)\)', xml_test)]
tx1, ty1 = translates[0] if len(translates) > 0 else (0.0, 0.0)
tx2, ty2 = translates[1] if len(translates) > 1 else (0.0, 0.0)
sx, sy = scales[0] if len(scales) > 0 else (1.0, 1.0)

xs = [(x + tx2) * sx + tx1 for x in xs_raw]
ys = [(y + ty2) * sy + ty1 for y in ys_raw]
print(f"Final x: [{min(xs):.1f}, {max(xs):.1f}]")
print(f"Final y: [{min(ys):.1f}, {max(ys):.1f}]")
print(f"Center: ({sum(xs)/len(xs):.1f}, {sum(ys)/len(ys):.1f})")
