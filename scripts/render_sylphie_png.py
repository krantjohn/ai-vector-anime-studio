import os
import subprocess

svg_path = os.path.abspath('artifacts/sylphie_rendered.svg')
html_path = os.path.abspath('scratch/render_sylphie.html')
png_path = os.path.abspath('artifacts/sylphie_rendered.png')

with open(svg_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

html = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0c0a1d; display: flex; justify-content: center; align-items: center; width: 800px; height: 1000px; overflow: hidden; }
    svg { width: 800px; height: 1000px; }
  </style>
</head>
<body>
""" + svg_content + """
</body>
</html>"""

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
cmd = [
    edge_exe,
    '--headless=new',
    '--disable-gpu',
    '--window-size=800,1000',
    f'--screenshot={png_path}',
    f'file:///{html_path.replace(os.sep, "/")}'
]

print('Running screenshot command...')
res = subprocess.run(cmd, capture_output=True, text=True)
print('Screenshot result:', res.returncode, 'exists:', os.path.exists(png_path))
if os.path.exists(png_path):
    print('Size:', os.path.getsize(png_path), 'bytes')
