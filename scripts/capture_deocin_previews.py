import os
import time
import subprocess
import urllib.request

artifacts_dir = os.path.abspath('artifacts')
os.makedirs(artifacts_dir, exist_ok=True)

normal_png = os.path.join(artifacts_dir, 'deocin_live2d_normal.png')
exploded_png = os.path.join(artifacts_dir, 'deocin_live2d_exploded.png')

preview_cmd = ['cmd.exe', '/c', 'npx.cmd', 'vite', 'preview', '--port', '4173', '--strictPort']
proc = subprocess.Popen(preview_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

print("Waiting for Vite preview server at port 4173...")
ready = False
for _ in range(30):
    time.sleep(0.5)
    try:
        with urllib.request.urlopen('http://localhost:4173', timeout=1) as resp:
            if resp.status == 200:
                ready = True
                break
    except Exception:
        pass

if not ready:
    proc.kill()
    raise RuntimeError("Vite preview server failed to start within 15 seconds")

print("Vite preview server is ready! Taking Edge headless screenshots...")
edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

# 1. Normal View (Full intact sailor girl masterpiece)
url_normal = 'http://localhost:4173/?project=deocin'
print(f"Capturing normal view from {url_normal}...")
shot_cmd_normal = [
    edge_exe,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    f'--screenshot={normal_png}',
    url_normal
]
res1 = subprocess.run(shot_cmd_normal, capture_output=True, text=True)
print(f"Normal screenshot result: code={res1.returncode}, exists={os.path.exists(normal_png)}, size={os.path.getsize(normal_png) if os.path.exists(normal_png) else 0} bytes")

# 2. Exploded Dissection View (Hair front shifted right, revealing closed cranium & Illustrator measurement HUD)
url_exploded = 'http://localhost:4173/?project=deocin&exploded=true&dx=280&dy=35'
print(f"Capturing exploded dissection view from {url_exploded}...")
shot_cmd_exploded = [
    edge_exe,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    f'--screenshot={exploded_png}',
    url_exploded
]
res2 = subprocess.run(shot_cmd_exploded, capture_output=True, text=True)
print(f"Exploded screenshot result: code={res2.returncode}, exists={os.path.exists(exploded_png)}, size={os.path.getsize(exploded_png) if os.path.exists(exploded_png) else 0} bytes")

# Terminate server
proc.terminate()
try:
    proc.wait(timeout=2)
except Exception:
    proc.kill()

print("Server stopped.")

# Final verification
assert os.path.exists(normal_png) and os.path.getsize(normal_png) > 50000, "Normal screenshot missing or too small"
assert os.path.exists(exploded_png) and os.path.getsize(exploded_png) > 50000, "Exploded screenshot missing or too small"

print("SUCCESS: Both Deocin Live2D screenshots captured and verified!")
print(f"  - Normal:   {normal_png} ({os.path.getsize(normal_png):,} bytes)")
print(f"  - Exploded: {exploded_png} ({os.path.getsize(exploded_png):,} bytes)")
