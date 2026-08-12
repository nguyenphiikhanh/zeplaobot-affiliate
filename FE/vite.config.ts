import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.BACKEND_TARGET || env.BASE_API_URL || 'http://localhost:3030'

  return {
    plugins: [vue(), tailwindcss()],
    define: {
      'import.meta.env.BASE_API_URL': JSON.stringify(env.BASE_API_URL || ''),
    },
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

