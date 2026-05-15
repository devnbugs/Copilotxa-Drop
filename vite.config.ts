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
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/terminal' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { command, env: extraEnv } = JSON.parse(body);
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                
                // Merge system env with extra env
                const mergedEnv = { ...process.env, ...extraEnv };
                
                const { stdout, stderr } = await execAsync(command, { env: mergedEnv });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ stdout, stderr }));
              } catch (error: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message, stderr: error.stderr }));
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
