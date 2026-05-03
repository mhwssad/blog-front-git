import { createApp } from 'vue'
import { createPinia } from 'pinia'

// UnoCSS
import 'uno.css'

// Element Plus 样式
import 'element-plus/dist/index.css'

// 全局样式（包含 reset.css）
import '@/styles/index.css'
// 布局变量
import '@/styles/variables.css'

import App from './App.vue'
import router from './router'
import { registerElementPlusIcons } from './plugins/element-plus'
import { registerPermissionDirective } from './plugins/permission'
import { installLogger } from './utils/logger'
import { log } from './composables/useLogger'

const app = createApp(App)

installLogger(app)

// 注册 Element Plus 图标
registerElementPlusIcons(app)
registerPermissionDirective(app)

app.use(createPinia())
app.use(router)

router.onError(error => {
  log.router.error('Router navigation error', error)
})

app.mount('#app')
