import os
import time
import subprocess
import urllib.request

artifacts_dir = os.path.abspath('artifacts')
os.makedirs(artifacts_dir, exist_ok=True)
png_path = os.path.join(artifacts_dir, 'studio_sylphie_live_ui.png')

preview_cmd = ['cmd.exe', '/c', 'npx.cmd', 'vite', 'preview', '--port', '4173', '--strictPort']
proc = subprocess.Popen(preview_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

url = 'http://localhost:4173/?project=sylphie'
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

print("Vite preview server is ready! Taking Edge headless screenshot...")
edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
shot_cmd = [
    edge_exe,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    f'--screenshot={png_path}',
    url
]

res = subprocess.run(shot_cmd, capture_output=True, text=True)
print("Screenshot result:", res.returncode, "file exists:", os.path.exists(png_path))
if os.path.exists(png_path):
    print("Screenshot size:", os.path.getsize(png_path), "bytes")

# Terminate server
proc.terminate()
try:
    proc.wait(timeout=2)
except Exception:
    proc.kill()

print("Server stopped. Screenshot captured successfully!")
