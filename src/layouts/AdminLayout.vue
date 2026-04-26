<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 菜单列表 - 使用常量定义，避免响应式开销
const menus = [
  { id: 'dashboard', name: '仪表盘', icon: '📊', path: '/', description: '查看系统概览和关键指标' },
  { id: 'users', name: '用户管理', icon: '👥', path: '/users', description: '管理系统用户信息' },
  { id: 'products', name: '商品管理', icon: '📦', path: '/products', description: '管理商品信息' },
  { id: 'orders', name: '订单管理', icon: '📝', path: '/orders', description: '查看和管理订单' },
  { id: 'settings', name: '系统设置', icon: '⚙️', path: '/settings', description: '配置系统参数' },
]

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  const currentPath = route.path
  const menu = menus.find(m => m.path === currentPath)
  return menu?.id || 'dashboard'
})

// 计算当前面包屑
const breadcrumb = computed(() => {
  const currentPath = route.path
  const menu = menus.find(m => m.path === currentPath)
  return menu?.name || '页面'
})

/**
 * 切换菜单
 */
function switchMenu(path: string) {
  if (route.path !== path) {
    router.push(path)
  }
}

/**
 * 处理登出
 */
async function handleLogout() {
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<template>
  <div class="admin-layout">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="logo">管理后台</h2>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="menu-list">
          <li
            v-for="menu in menus"
            :key="menu.id"
            class="menu-item"
            :class="{ active: activeMenu === menu.id }"
            @click="switchMenu(menu.path)"
          >
            <span class="menu-icon">{{ menu.icon }}</span>
            <div class="menu-info">
              <span class="menu-name">{{ menu.name }}</span>
              <span class="menu-desc">{{ menu.description || '' }}</span>
            </div>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-button">
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <!-- 顶部用户信息栏 -->
      <header class="top-bar">
        <div class="breadcrumb">
          <span class="breadcrumb-item">首页</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">{{ breadcrumb }}</span>
        </div>
        <div class="user-info">
          <span class="welcome-text">欢迎，{{ userStore.userInfo?.username || '用户' }}</span>
        </div>
      </header>

      <!-- 内容区域 - 通过 RouterView 渲染子路由，使用 keep-alive 缓存已访问的页面 -->
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

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 左侧边栏样式 */
.sidebar {
  width: 260px;
  background: var(--sidebar-bg, linear-gradient(180deg, #667eea 0%, #764ba2 100%));
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 28px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  margin: 4px 0;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left-color: white;
}

.menu-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.menu-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.menu-name {
  font-size: 15px;
  font-weight: 500;
}

.menu-desc {
  font-size: 12px;
  opacity: 0.7;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-button {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-button:hover {
  background: white;
  color: #667eea;
  border-color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 右侧主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  background: var(--header-bg, white);
  padding: 16px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #999;
}

.breadcrumb-item.active {
  color: #333;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #ccc;
}

.user-info {
  display: flex;
  align-items: center;
}

.welcome-text {
  font-size: 15px;
  color: var(--text-color, #333);
  font-weight: 500;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: var(--bg-color, #f5f7fa);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .menu-desc {
    display: none;
  }
  
  .content-area {
    padding: 20px;
  }
}
</style>
