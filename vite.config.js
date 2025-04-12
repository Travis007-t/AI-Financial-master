import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 仅在开发环境引入vue-devtools插件
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 确保只在开发环境加载devtools插件
  const isProd = mode === 'production'
  const isDev = !isProd
  
  return {
    plugins: [
      vue(),
      // 仅在开发环境加载vue-devtools插件
      isDev ? vueDevTools() : null,
    ].filter(Boolean), // 过滤掉null值
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 生产环境附加配置
    build: {
      // 分离CSS文件
      cssCodeSplit: true,
      // 最小化构建输出
      minify: 'terser',
      // Terser选项
      terserOptions: {
        compress: {
          // 删除console语句
          drop_console: isProd,
          // 删除调试语句
          drop_debugger: isProd
        }
      }
    }
  }
})
