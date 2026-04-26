# 管理后台系统技术文档

## 📋 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术架构](#2-技术架构)
- [3. 核心功能模块](#3-核心功能模块)
- [4. 主题系统详解](#4-主题系统详解)
- [5. 登录与安全机制](#5-登录与安全机制)
- [6. 布局与路由设计](#6-布局与路由设计)
- [7. 状态管理](#7-状态管理)
- [8. API 交互](#8-api-交互)
- [9. 性能优化](#9-性能优化)
- [10. 开发规范](#10-开发规范)
- [11. 部署指南](#11-部署指南)

---

## 1. 项目概述

### 1.1 项目简介

本项目是一个基于 **Vue 3 + TypeScript + Vite** 的现代化管理后台系统模板，集成了完整的用户认证、权限管理、主题定制、页面缓存等企业级功能。

### 1.2 核心特性

✅ **现代化技术栈**：Vue 3.5+、TypeScript 6.0+、Vite 8.0+  
✅ **完整认证体系**：登录验证、Token 管理、路由守卫  
✅ **智能滑块验证码**：防暴力破解，3次失败后强制验证  
✅ **多主题系统**：8种预设主题、自定义颜色、自动切换  
✅ **页面缓存**：Keep-alive 实现无刷新切换  
✅ **统一布局架构**：全局布局组件 + 嵌套路由  
✅ **类型安全**：完整的 TypeScript 类型定义  
✅ **测试覆盖**：单元测试 (Vitest) + E2E 测试 (Playwright)  

### 1.3 应用场景

- 🏢 企业管理后台
- 📊 数据监控平台
- 🛒 电商管理系统
- 🎓 在线教育平台
- 🏥 医疗信息系统

---

## 2. 技术架构

### 2.1 技术栈选型

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **核心框架** | Vue 3 | 3.5.31+ | 组合式 API，响应式系统 |
| **构建工具** | Vite | 8.0.3+ | 快速冷启动，热更新 |
| **语言** | TypeScript | 6.0.0+ | 静态类型检查 |
| **状态管理** | Pinia | 3.0.4+ | Vue 官方推荐的状态管理库 |
| **路由管理** | Vue Router | 5.0.4+ | 声明式路由，导航守卫 |
| **HTTP 客户端** | Axios | 1.15.0+ | 请求拦截，错误处理 |
| **UI 组件** | 原生 HTML/CSS | - | 自定义样式，无第三方依赖 |
| **单元测试** | Vitest | 4.1.2+ | 兼容 Vite 的测试框架 |
| **E2E 测试** | Playwright | 1.58.2+ | 跨浏览器端到端测试 |
| **代码规范** | ESLint + Prettier | 10.1.0+ / 3.8.1+ | 代码质量保障 |

### 2.2 项目结构

```
hello/
├── src/
│   ├── api/                    # API 接口层
│   │   ├── auth.ts            # 认证相关接口
│   │   └── mock.ts            # Mock 数据接口
│   ├── assets/                 # 静态资源
│   │   ├── main.css           # 全局样式
│   │   └── theme.css          # 主题样式变量
│   ├── components/             # 公共组件
│   │   └── SliderCaptcha.vue  # 滑块验证码组件
│   ├── layouts/                # 布局组件
│   │   └── AdminLayout.vue    # 管理后台统一布局
│   ├── router/                 # 路由配置
│   │   └── index.ts           # 路由定义与守卫
│   ├── stores/                 # Pinia 状态管理
│   │   ├── user.ts            # 用户状态
│   │   └── theme.ts           # 主题状态
│   ├── views/                  # 页面视图
│   │   ├── HomeView.vue       # 首页仪表盘
│   │   ├── LoginView.vue      # 登录页
│   │   ├── UserManageView.vue # 用户管理
│   │   ├── ProductManageView.vue # 商品管理
│   │   ├── OrderManageView.vue   # 订单管理
│   │   └── SystemSettingsView.vue # 系统设置
│   ├── App.vue                # 根组件
│   └── main.ts                # 应用入口
├── tests/                      # 测试文件
├── package.json               # 项目依赖
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # TypeScript 配置
└── THEME_GUIDE.md             # 主题使用指南
```

### 2.3 架构图

```
┌─────────────────────────────────────────┐
│              用户界面层 (Views)           │
│  Home | Login | Users | Products | ...  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          布局组件层 (Layouts)            │
│         AdminLayout (统一布局)           │
│  Sidebar | TopBar | RouterView          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         状态管理层 (Pinia Stores)        │
│    UserStore | ThemeStore               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          路由层 (Vue Router)             │
│    路由守卫 | 嵌套路由 | 动态路由         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          API 层 (Axios)                  │
│    请求拦截 | 响应拦截 | 错误处理         │
└─────────────────────────────────────────┘
```

---

## 3. 核心功能模块

### 3.1 用户认证系统

#### 3.1.1 登录流程

```typescript
// 1. 表单验证
用户名 ≥ 3 字符
密码 ≥ 6 字符

// 2. 滑块验证码检查
if (loginFailCount >= 3) {
  必须完成滑块验证
} else {
  可直接提交
}

// 3. 提交登录请求
POST /api/login
{ username, password }

// 4. 处理响应
成功: 
  - 保存 Token 到 localStorage
  - 清除失败次数计数
  - 跳转到目标页面
失败:
  - 显示错误提示
  - 增加失败次数
  - 达到3次后强制滑块验证
```

#### 3.1.2 Token 管理

```typescript
// Token 存储
localStorage.setItem('token', token)

// Token 读取
const token = localStorage.getItem('token')

// Token 清除（退出登录）
localStorage.removeItem('token')
router.push('/login')
```

#### 3.1.3 路由守卫

```typescript
// 全局前置守卫
router.beforeEach((to) => {
  // 需要认证的页面
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      return { name: 'login' } // 重定向到登录页
    }
  }
  
  // 已登录访问登录页，跳转到首页
  if (to.name === 'login' && localStorage.getItem('token')) {
    return { name: 'home' }
  }
  
  return true // 允许导航
})
```

### 3.2 滑块验证码组件

#### 3.2.1 核心特性

- ✅ **随机缺口生成**：每次刷新位置不同
- ✅ **5种渐变背景**：防止图像识别
- ✅ **±5px 容错范围**：提升用户体验
- ✅ **双元素设计**：碎片 + 缺口目标
- ✅ **多端支持**：鼠标 + 触摸事件
- ✅ **内存管理**：自动清理事件监听器

#### 3.2.2 z-index 层级管理

```css
拼图碎片: z-index: 10     /* 最高层级，可拖动 */
提示文字: z-index: 5      /* 在碎片上方 */
缺口目标: z-index: 3      /* 底层，显示位置 */
容器:   z-index: 1        /* 基础层级 */
```

#### 3.2.3 使用示例

```vue
<template>
  <SliderCaptcha
    @success="handleCaptchaSuccess"
    @fail="handleCaptchaFail"
  />
</template>

<script setup lang="ts">
import SliderCaptcha from '@/components/SliderCaptcha.vue'

const handleCaptchaSuccess = () => {
  console.log('验证成功，可以提交登录')
}

const handleCaptchaFail = () => {
  console.log('验证失败，请重试')
}
</script>
```

### 3.3 登录失败次数控制

#### 3.3.1 安全策略

| 失败次数 | 行为 | 说明 |
|---------|------|------|
| 0-2 次 | 无需验证 | 正常登录流程 |
| ≥3 次 | 强制滑块验证 | 防止暴力破解 |
| 登录成功 | 清零计数 | 恢复正常状态 |

#### 3.3.2 实现细节

```typescript
// 状态管理
const loginFailCount = ref(0)

// 初始化：从 localStorage 恢复
onMounted(() => {
  const saved = localStorage.getItem('loginFailCount')
  if (saved) {
    loginFailCount.value = parseInt(saved)
  }
})

// 登录失败处理
const handleLoginFail = () => {
  loginFailCount.value++
  localStorage.setItem('loginFailCount', String(loginFailCount.value))
  
  if (loginFailCount.value >= 3) {
    showWarning('已连续失败3次，请完成滑块验证')
  }
}

// 登录成功处理
const handleLoginSuccess = () => {
  loginFailCount.value = 0
  localStorage.removeItem('loginFailCount')
}
```

---

## 4. 主题系统详解

### 4.1 系统架构

```
主题系统
├── Store 层 (theme.ts)
│   ├── 状态管理
│   ├── 预设主题配置
│   ├── 导入/导出功能
│   ├── 预览图生成
│   └── 自动切换逻辑
│
├── UI 层 (SystemSettingsView.vue)
│   ├── 预设主题选择器
│   ├── 自定义颜色选择器
│   ├── 导入/导出按钮
│   └── 自动切换控制面板
│
└── CSS 层 (theme.css)
    ├── CSS 变量定义
    ├── 亮色主题样式
    └── 暗色主题样式
```

### 4.2 8种预设主题

| 主题名称 | 模式 | 主色调 | 次要颜色 | 描述 |
|---------|------|--------|---------|------|
| 亮色主题 | Light | #667eea | #764ba2 | 清新明亮的紫色渐变 |
| 暗色主题 | Dark | #4a5568 | #2d3748 | 护眼深色模式 |
| 蓝色主题 | Light | #1890ff | #096dd9 | 专业的商务蓝 |
| 绿色主题 | Light | #52c41a | #389e0d | 自然清新的绿色 |
| 橙色主题 | Light | #fa8c16 | #d46b08 | 活力温暖的橙色 |
| 粉色主题 | Light | #eb2f96 | #c41d7f | 浪漫温柔的粉色 |
| 青色主题 | Light | #13c2c2 | #08979c | 冷静清爽的青色 |
| 深紫主题 | Dark | #722ed1 | #531dab | 神秘优雅的深紫色 |

### 4.3 核心功能

#### 4.3.1 主题导入/导出

```typescript
// 导出主题
const json = themeStore.exportTheme()
// 输出格式：
{
  "name": "My Custom Theme",
  "mode": "light",
  "primaryColor": "#667eea",
  "secondaryColor": "#764ba2",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}

// 导入主题
const success = themeStore.importTheme(jsonString)
// 返回 boolean，表示是否成功
```

#### 4.3.2 主题预览图生成

```typescript
// 使用 Canvas API 生成 PNG 图片
const base64 = await themeStore.generateThemePreview()

// 包含内容：
// - 渐变背景（主色调 → 次要色）
// - 主题信息文字
// - 颜色示例色块
```

#### 4.3.3 用户级别偏好

```typescript
// 为不同用户设置独立主题
themeStore.setUserId('admin')     // 管理员主题
themeStore.setUserId('user001')   // 用户001主题

// 存储键名：
// - themeConfig_admin
// - themeConfig_user001
```

#### 4.3.4 自动切换主题

```typescript
// 启用自动切换
themeStore.toggleAutoSwitch(true)

// 设置时间表
themeStore.setAutoSwitchSchedule(
  '06:00',  // 早上6点 → 亮色
  '18:00'   // 晚上6点 → 暗色
)

// 工作原理：
// - 每分钟检查一次当前时间
// - 根据设定自动切换主题
// - 支持跨天时间段
// - 页面刷新后继续保持
```

### 4.4 CSS 变量系统

```css
:root {
  --primary-color: #667eea;      /* 主色调 */
  --secondary-color: #764ba2;    /* 次要颜色 */
  --bg-color: #f5f7fa;           /* 背景色 */
  --text-color: #333;            /* 文字颜色 */
  --card-bg: #ffffff;            /* 卡片背景 */
  --border-color: #e8e8e8;       /* 边框颜色 */
  --sidebar-bg: linear-gradient(...); /* 侧边栏背景 */
  --header-bg: #ffffff;          /* 顶部导航背景 */
}

/* 使用示例 */
.my-component {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
```

---

## 5. 登录与安全机制

### 5.1 安全防护措施

#### 5.1.1 防暴力破解

- **失败次数限制**：3次失败后强制滑块验证
- **滑块验证码**：随机位置 + 渐变背景
- **Token 过期**：会话超时自动退出

#### 5.1.2 XSS 防护

- **输入验证**：前端表单验证 + 后端校验
- **输出转义**：Vue 自动转义模板内容
- **HttpOnly Cookie**：敏感信息不存储在 localStorage

#### 5.1.3 CSRF 防护

- **Token 验证**：每个请求携带 Token
- **SameSite Cookie**：防止跨站请求伪造

### 5.2 会话管理

```typescript
// 会话超时配置
const sessionTimeout = 30 // 分钟

// 检测用户活动
let lastActivity = Date.now()

window.addEventListener('mousemove', () => {
  lastActivity = Date.now()
})

// 定时检查
setInterval(() => {
  if (Date.now() - lastActivity > sessionTimeout * 60 * 1000) {
    // 超时，清除 Token 并跳转登录页
    localStorage.removeItem('token')
    router.push('/login')
  }
}, 60000) // 每分钟检查
```

---

## 6. 布局与路由设计

### 6.1 统一布局架构

#### 6.1.1 设计理念

采用**全局布局组件 + 嵌套路由**的方式，避免在每个页面重复编写侧边栏、顶部导航等布局代码。

#### 6.1.2 组件结构

```vue
<!-- AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="logo">管理系统</div>
      <nav class="sidebar-nav">
        <ul class="menu-list">
          <li v-for="menu in menus" :key="menu.id"
              :class="{ active: activeMenu === menu.id }"
              @click="switchMenu(menu.path)">
            <span class="menu-icon">{{ menu.icon }}</span>
            <span class="menu-name">{{ menu.name }}</span>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-bar">
        <div class="breadcrumb">
          <span v-for="item in breadcrumbs">{{ item }}</span>
        </div>
        <div class="user-info">
          <span class="welcome-text">欢迎，{{ userStore.username }}</span>
          <button @click="handleLogout">退出登录</button>
        </div>
      </header>

      <!-- 内容区域 - 渲染子路由 -->
      <div class="content-area">
        <RouterView v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </RouterView>
      </div>
    </main>
  </div>
</template>
```

### 6.2 嵌套路由配置

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    component: AdminLayout, // 父组件：承载布局
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: HomeView, meta: { title: '首页' } },
      { path: 'users', name: 'users', component: UserManageView, meta: { title: '用户管理' } },
      { path: 'products', name: 'products', component: ProductManageView, meta: { title: '商品管理' } },
      { path: 'orders', name: 'orders', component: OrderManageView, meta: { title: '订单管理' } },
      { path: 'settings', name: 'settings', component: SystemSettingsView, meta: { title: '系统设置' } },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  }
]
```

### 6.3 Keep-alive 页面缓存

```vue
<RouterView v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" :key="route.fullPath" />
  </keep-alive>
</RouterView>
```

**优势**：
- ✅ 已访问的页面会被缓存
- ✅ 再次访问时不会重新创建组件实例
- ✅ 保持表单数据、滚动位置等状态
- ✅ 提升页面切换速度

---

## 7. 状态管理

### 7.1 Pinia Store 设计

#### 7.1.1 用户状态 (UserStore)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const username = ref<string>('')
  const userInfo = ref<any>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 动作
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUsername(name: string) {
    username.value = name
  }

  function logout() {
    token.value = ''
    username.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  function initUserState() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return {
    token,
    username,
    userInfo,
    isLoggedIn,
    setToken,
    setUsername,
    logout,
    initUserState
  }
})
```

#### 7.1.2 主题状态 (ThemeStore)

详见 [主题系统详解](#4-主题系统详解)

### 7.2 状态持久化

```typescript
// 自动保存到 localStorage
watch(token, (newToken) => {
  if (newToken) {
    localStorage.setItem('token', newToken)
  } else {
    localStorage.removeItem('token')
  }
})

// 页面刷新时恢复
onMounted(() => {
  const saved = localStorage.getItem('token')
  if (saved) {
    token.value = saved
  }
})
```

---

## 8. API 交互

### 8.1 Axios 封装

```typescript
// api/auth.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 失效，清除并跳转登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### 8.2 API 接口定义

```typescript
// 登录接口
export async function login(username: string, password: string) {
  return apiClient.post('/login', { username, password })
}

// 获取用户信息
export async function getUserInfo() {
  return apiClient.get('/user/info')
}

// 退出登录
export async function logout() {
  return apiClient.post('/logout')
}
```

### 8.3 Mock 数据

```typescript
// api/mock.ts
const mockUsers = [
  { username: 'admin', password: '123456', role: 'admin' },
  { username: 'user', password: '123456', role: 'user' },
  { username: 'test', password: 'test123', role: 'user' }
]

export function mockLogin(username: string, password: string) {
  const user = mockUsers.find(u => u.username === username && u.password === password)
  
  if (user) {
    return {
      code: 200,
      data: {
        token: 'mock-token-' + Date.now(),
        username: user.username,
        role: user.role
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }
}
```

---

## 9. 性能优化

### 9.1 代码分割

```typescript
// 路由懒加载
const routes = [
  {
    path: '/users',
    component: () => import('../views/UserManageView.vue')
  }
]
```

**优势**：
- ✅ 按需加载，减少首屏体积
- ✅ 提升初始加载速度
- ✅ 改善用户体验

### 9.2 组件缓存

```vue
<keep-alive>
  <component :is="Component" />
</keep-alive>
```

**效果**：
- ✅ 避免重复创建组件实例
- ✅ 保持页面状态
- ✅ 减少 DOM 操作

### 9.3 防抖与节流

```typescript
// 防抖：搜索输入
import { debounce } from 'lodash-es'

const searchHandler = debounce((keyword: string) => {
  // 执行搜索
}, 300)

// 节流：滚动事件
import { throttle } from 'lodash-es'

const scrollHandler = throttle(() => {
  // 处理滚动
}, 100)
```

### 9.4 图片优化

```vue
<!-- 懒加载 -->
<img v-lazy="imageUrl" alt="图片" />

<!-- WebP 格式 -->
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="图片" />
</picture>
```

---

## 10. 开发规范

### 10.1 代码风格

#### 10.1.1 命名规范

```typescript
// 变量：小驼峰
const userName = 'admin'
const isLoading = false

// 常量：大写下划线
const MAX_RETRY_COUNT = 3
const API_BASE_URL = '/api'

// 函数：小驼峰，动词开头
function getUserInfo() {}
function handleSubmit() {}

// 组件：大驼峰
const UserProfile = defineComponent({})

// 接口/类型：大驼峰，I/T 前缀
interface IUser {
  id: number
  name: string
}

type TResponse<T = unknown> = {
  code: number
  data: T
}
```

#### 10.1.2 注释规范

```typescript
/**
 * 获取用户列表
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 用户列表数据
 */
async function getUserList(page: number, pageSize: number): Promise<IUser[]> {
  // 内部逻辑注释
  const response = await apiClient.get('/users', { params: { page, pageSize } })
  return response.data
}
```

### 10.2 TypeScript 类型安全

#### 10.2.1 避免使用 any

```typescript
// ❌ 错误
const data: any = fetchData()

// ✅ 正确
const data: IUser[] = fetchData()

// ✅ 泛型默认值使用 unknown
interface ApiResponse<T = unknown> {
  code: number
  data: T
}
```

#### 10.2.2 严格空值检查

```typescript
// ❌ 可能为 undefined
const value = obj.prop

// ✅ 可选链
const value = obj?.prop

// ✅ 非空断言（确定不为空时）
const value = obj!.prop

// ✅ 默认值
const value = obj?.prop ?? 'default'
```

### 10.3 组件开发规范

#### 10.3.1 组合式 API

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 状态
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})
</script>
```

#### 10.3.2 Props 定义

```typescript
interface Props {
  title: string
  count?: number
  items: Array<{ id: number; name: string }>
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
```

#### 10.3.3 Emits 定义

```typescript
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()

// 触发事件
emit('update', 'new value')
emit('delete', 123)
```

### 10.4 测试规范

#### 10.4.1 单元测试

```typescript
// tests/unit/user.test.ts
import { describe, it, expect } from 'vitest'
import { useUserStore } from '@/stores/user'

describe('UserStore', () => {
  it('应该能设置 Token', () => {
    const store = useUserStore()
    store.setToken('test-token')
    expect(store.token).toBe('test-token')
  })

  it('应该能判断登录状态', () => {
    const store = useUserStore()
    store.setToken('test-token')
    expect(store.isLoggedIn).toBe(true)
  })
})
```

#### 10.4.2 E2E 测试

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('用户应该能成功登录', async ({ page }) => {
  await page.goto('/login')
  
  // 填写表单
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', '123456')
  
  // 点击登录
  await page.click('button[type="submit"]')
  
  // 验证跳转
  await expect(page).toHaveURL('/')
})
```

---

## 11. 部署指南

### 11.1 环境要求

- **Node.js**: ^20.19.0 或 >=22.12.0
- **npm**: 最新稳定版
- **浏览器**: Chrome/Edge/Firefox 最新版

### 11.2 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:5173
```

### 11.3 生产构建

```bash
# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

**构建产物**：
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

### 11.4 Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/hello/dist;
    index index.html;

    # SPA 路由 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 11.5 Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建镜像
docker build -t hello-app .

# 运行容器
docker run -d -p 80:80 hello-app
```

### 11.6 CI/CD 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:unit
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist/*"
          target: "/var/www/hello"
```

---

## 附录

### A. 常见问题 (FAQ)

#### Q1: 如何添加新的页面？

1. 在 `src/views/` 创建新组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `AdminLayout.vue` 的菜单数组中添加菜单项

#### Q2: 如何修改主题颜色？

进入"系统设置"页面，在"主题设置"区域选择预设主题或自定义颜色。

#### Q3: Token 过期如何处理？

Axios 响应拦截器会自动检测 401 状态码，清除 Token 并跳转到登录页。

#### Q4: 如何禁用滑块验证码？

修改 `LoginView.vue` 中的条件判断，移除 `loginFailCount >= 3` 的检查。

#### Q5: 如何添加新的预设主题？

在 `src/stores/theme.ts` 的 `presets` 对象中添加新配置。

### B. 参考资料

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/zh/docs/)
- [Pinia 指南](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)

### C. 更新日志

#### v2.0.0 (2024-01-01)
- ✨ 新增 6 种预设主题（共8种）
- ✨ 主题导入/导出功能
- ✨ 主题预览图生成
- ✨ 用户级别的主题偏好
- ✨ 自动切换主题功能
- 🎨 优化主题选择器 UI
- 📱 改进移动端响应式布局

#### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- ✨ 基础登录功能
- ✨ 滑块验证码
- ✨ 统一布局架构
- ✨ 页面缓存
- ✨ 路由守卫

---

**文档版本**: 2.0.0  
**最后更新**: 2024-01-01  
**维护团队**: 开发团队
