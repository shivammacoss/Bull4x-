import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // 127.0.0.1 avoids some Windows setups where "localhost" hits ::1 first while Node listens on IPv4 only
  const backendTarget = env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/website/src'),
      },
    },
    server: {
      // Reduces stale JS after git pull (browser holding old EmployeeLogin OTP bundle)
      headers: {
        'Cache-Control': 'no-store',
      },
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendTarget,
          changeOrigin: true,
          ws: true,
          // Avoid flaky WS upgrades when backend restarts or is slow to accept
          timeout: 60000,
          proxyTimeout: 60000,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
