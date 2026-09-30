import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Усе, що починається з /api, Vite перекидає на сервер.
      // Для браузера клієнт і API опиняються на одному origin — тому слово
      // CORS у цьому курсі не звучить. У проді те саме зробить nginx (Л7).
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
