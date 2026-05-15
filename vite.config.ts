import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    assetsInclude: ['**/*.wasm', '**/*.binary'],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    optimizeDeps: {
      exclude: ['web-tree-sitter']
    },
    build: {
      rollupOptions: {
        external: ['fsevents', 'worker_threads', 'module'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      configureServer(server) {
        // Log all requests to help debug 404s
        server.middlewares.use((req, res, next) => {
          if (req.url?.includes('/api/')) {
            console.log(`[API Proxy] ${req.method} ${req.url}`);
          }
          next();
        });

        server.middlewares.use(async (req, res, next) => {
          if (!req.url) return next();
          
          const url = new URL(req.url, `http://${req.headers.host}`);
          const path = url.pathname.replace(/\/$/, ''); // Normalize path
          
          const sendJson = (data: any, status = 200) => {
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          // --- SYSTEM INFO ---
          if (path.endsWith('/api/system-info') && req.method === 'GET') {
            try {
              const si = await import('systeminformation');
              const [cpu, mem, os, disk, battery, gpu] = await Promise.all([
                si.cpu(), si.mem(), si.osInfo(), si.fsSize(), si.battery(), si.graphics()
              ]);
              return sendJson({ cpu, memory: { total: mem.total, free: mem.free, used: mem.used }, os, storage: disk, battery, graphics: gpu });
            } catch (err: any) {
              return sendJson({ error: err.message }, 500);
            }
          }

          // --- TERMINAL ---
          if (path.endsWith('/api/terminal') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { command, env: extraEnv } = JSON.parse(body || '{}');
                if (!command) return sendJson({ error: "No command provided" }, 400);
                
                const { spawn } = await import('child_process');
                const child = spawn(command, { env: { ...process.env, ...extraEnv }, shell: true, timeout: 120000 });

                let stdout = '', stderr = '';
                child.stdout.on('data', d => stdout += d);
                child.stderr.on('data', d => stderr += d);
                child.on('close', code => sendJson({ stdout, stderr, code }));
                child.on('error', err => sendJson({ stdout, stderr, error: err.message }, 500));
              } catch (e: any) {
                sendJson({ error: "Invalid JSON or Server Error" }, 400);
              }
            });
            return;
          }
          next();
        });
      }
    },
  };
});
