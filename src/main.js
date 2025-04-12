import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 引入Naive UI
import naive from 'naive-ui'

// Vue开发工具配置
if (import.meta.env.PROD) {
  // 生产环境中禁用Vue DevTools
  console.log('生产环境：禁用Vue DevTools')
  
  // 动态添加CSS禁用开发工具面板
  const style = document.createElement('style')
  style.textContent = `
    /* 隐藏Vue开发工具面板 */
    .vue-devtools__panel,
    .__vue-devtools__,
    #__vconsole,
    .__vite-inspector,
    .VueTour,
    .__vue-devtools-host__ {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `
  document.head.appendChild(style)
} else {
  // 开发环境下保留开发工具
  console.log('开发环境：Vue DevTools可用')
}

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(naive)

app.mount('#app')
