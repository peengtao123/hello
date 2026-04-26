import './assets/main.css'
import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化用户状态（检查是否有保存的 token）
const userStore = useUserStore()
userStore.initUserState()

// 初始化主题
const themeStore = useThemeStore()
themeStore.loadTheme()

app.mount('#app')
