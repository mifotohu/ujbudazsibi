import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { handleEmailDispatch } from './api/send-email';

function emailLivePlugin() {
  return {
    name: 'email-live-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/send-email', (req: any, res: any) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
          res.statusCode = 200;
          res.end();
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          try {
            const data = JSON.parse(body || '{}');
            const result = await handleEmailDispatch(data);
            console.log(`[E-mail Dispatcher] Szolgáltató: ${result.provider} | Sikeres: ${result.success} | Címzett: ${data.applicantEmail || 'ujbudazsibi@gmail.com'} | Tárgy: ${data.subject}`);
            res.statusCode = result.success ? 200 : 500;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('[E-mail Dispatcher Error]', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err?.message || 'Szerver hiba' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), emailLivePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
