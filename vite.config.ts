/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

function vectorizeApiPlugin(): Plugin {
  return {
    name: 'vectorize-api',
    configureServer(server) {
      server.middlewares.use('/api/vectorize', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const bodyStr = Buffer.concat(chunks).toString('utf-8');
            const data = JSON.parse(bodyStr);
            const { imageBase64, title = 'AI 创作矢量工程', steps = 10000 } = data;

            if (!imageBase64) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing imageBase64' }));
              return;
            }

            const tempDir = path.resolve(__dirname, 'scratch');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempImg = path.join(tempDir, `upload_${Date.now()}.png`);
            const tempOut = path.join(tempDir, `out_${Date.now()}.json`);

            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(tempImg, Buffer.from(cleanBase64, 'base64'));

            const pythonExe = 'python';
            const scriptPath = path.resolve(__dirname, 'scripts/vectorize_service.py');

            const proc = spawn(pythonExe, [
              scriptPath,
              '--input', tempImg,
              '--output', tempOut,
              '--title', title,
              '--steps', String(steps)
            ], { shell: true });

            let stderrStr = '';
            proc.stderr?.on('data', (d) => { stderrStr += d.toString(); });

            proc.on('close', (code) => {
              if (code === 0 && fs.existsSync(tempOut)) {
                const resultJson = fs.readFileSync(tempOut, 'utf-8');
                try { fs.unlinkSync(tempImg); fs.unlinkSync(tempOut); } catch {}
                res.setHeader('Content-Type', 'application/json');
                res.end(resultJson);
              } else {
                console.error('[Vectorize Error]:', stderrStr);
                try { if (fs.existsSync(tempImg)) fs.unlinkSync(tempImg); } catch {}
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: stderrStr || 'Vectorization failed' }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), vectorizeApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
  },
});
