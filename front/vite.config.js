import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // server: {
  //   // http://localhost:5173/api/login -> http://www.test.com/login
  //   proxy: {
  //     '/server/': {
  //       target: 'http://127.0.0.1:8181/', //目标域名
  //       changeOrigin: true, //需要代理跨域
  //       //rewrite: (path) => path.replace(/^\/api/, ''), //路径重写，把'/api'替换为''
  //     },
  //   },
  // },
})
