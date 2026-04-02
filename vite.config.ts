import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    proxy: {
      // 音乐 API 统一前缀 /api/music 转发到后端服务
      '/api/music': {
        target: 'http://192.168.1.101:19876',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/music/, ''), // 去掉前缀再转发
      },
    },
  },
})
