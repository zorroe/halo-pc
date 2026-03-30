import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/login': {
        target: 'http://192.168.1.101:19876',
        changeOrigin: true,
      },
      '/sms': {
        target: 'http://192.168.1.101:19876',
        changeOrigin: true,
      },
      '/captcha': {
        target: 'http://192.168.1.101:19876',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://192.168.1.101:19876',
        changeOrigin: true,
      },
    },
  },
})
