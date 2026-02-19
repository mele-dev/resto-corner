import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Permitir acceso desde la red local
    port: 3004,
    strictPort: false, // Permitir usar otro puerto si 3004 está ocupado
    // Configuración HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
      // Reducir la frecuencia de actualizaciones HMR
      clientPort: 3004,
    },
    // Prevenir reinicios innecesarios
    optimizeDeps: {
      // Mantener dependencias pre-empaquetadas para evitar reinicios
      holdUntilCrawlEnd: true,
    },
    watch: {
      // Ignorar cambios en archivos que no necesitan recarga
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.vite/**',
        '**/*.log',
        '**/coverage/**',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/ESTADO*.md',
        '**/SOLUCION*.md',
        '**/VERIFICAR*.md',
        '**/PASOS*.md',
        '**/INICIAR*.md',
        '**/CONFIGURACION*.md',
        '**/USAR*.md',
        '**/INSTALAR*.md',
        '**/DESPLIEGUE*.md',
        '**/RENDER*.md',
        '**/CONFIGURAR*.md',
        '**/*.tmp',
        '**/*.temp',
        '**/.cache/**',
        '**/OneDrive/**',
        '**/.vscode/**',
        '**/.idea/**',
      ],
      // Usar polling solo si es necesario (más estable en algunos sistemas)
      usePolling: false,
      // Intervalo de polling si se habilita (en ms)
      interval: 1000,
      // Ignorar cambios en archivos de solo lectura o temporales
      atomic: true,
      // Delay antes de procesar cambios (reduce reinicios innecesarios)
      delay: 500,
    },
    allowedHosts: [
      'michele-comfiest-soo.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5002', // Backend local cuando accedes desde localhost
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            // Silenciar errores de proxy para evitar reinicios
            console.warn('Proxy error (ignorado):', err.message);
            if (!res.headersSent && res && typeof res.writeHead === 'function') {
              try {
                res.writeHead(502, {
                  'Content-Type': 'text/plain',
                });
                res.end('Backend no disponible');
              } catch (e) {
                // Ignorar errores al escribir respuesta
              }
            }
          });
        },
      },
      '/admin/api': {
        target: 'http://localhost:5002', // Backend local cuando accedes desde localhost
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('Proxy error (ignorado):', err.message);
            if (!res.headersSent && res && typeof res.writeHead === 'function') {
              try {
                res.writeHead(502, {
                  'Content-Type': 'text/plain',
                });
                res.end('Backend no disponible');
              } catch (e) {
                // Ignorar errores al escribir respuesta
              }
            }
          });
        },
      },
      '/images': {
        target: 'http://localhost:5002', // Backend local cuando accedes desde localhost
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err) => {
            console.warn('Proxy error (ignorado):', err.message);
          });
        },
      },
      '/hubs': {
        target: 'http://localhost:5002', // Backend local cuando accedes desde localhost
        changeOrigin: true,
        ws: true, // Habilitar WebSocket proxy para SignalR
        secure: false,
        rewrite: (path) => path,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err) => {
            console.warn('Proxy error (ignorado):', err.message);
          });
        },
      },
    },
  },
})

