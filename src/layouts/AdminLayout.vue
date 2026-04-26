<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 定义菜单项类型
interface MenuItem {
  id: string
  name: string
  icon: string
  path?: string
  description?: string
  children?: MenuItem[]
}

// 菜单列表 - 支持两级菜单结构
const menus: MenuItem[] = [
  { 
    id: 'dashboard', 
    name: '仪表盘', 
    icon: '📊', 
    path: '/', 
    description: '查看系统概览和关键指标' 
  },
  { 
    id: 'user-center',
    name: '用户中心',
    icon: '👥',
    children: [
      { id: 'users', name: '用户管理', icon: '👤', path: '/users', description: '管理系统用户信息' },
      { id: 'roles', name: '角色管理', icon: '🔐', path: '/roles', description: '管理用户角色权限' },
    ]
  },
  { 
    id: 'business',
    name: '业务管理',
    icon: '💼',
    children: [
      { id: 'products', name: '商品管理', icon: '📦', path: '/products', description: '管理商品信息' },
      { id: 'orders', name: '订单管理', icon: '📝', path: '/orders', description: '查看和管理订单' },
      { id: 'articles', name: '文章管理', icon: '📰', path: '/articles', description: '展示第三方API文章数据' },
    ]
  },
  { 
    id: 'tech-learning',
    name: '技术学习',
    icon: '🎓',
    children: [
      { id: 'three-showcase', name: '3D 可视化', icon: '🎨', path: '/three-showcase', description: 'Three.js 3D 功能展示' },
      { id: 'panorama', name: '全景看房', icon: '🏠', path: '/panorama', description: '360° VR全景看房演示' },
      { id: 'tensorflow', name: '深度学习', icon: '🧠', path: '/tensorflow', description: 'TensorFlow.js 演示与应用' },
    ]
  },
  { 
    id: 'settings', 
    name: '系统设置', 
    icon: '⚙️', 
    path: '/settings', 
    description: '配置系统参数' 
  },
]

// 展开的菜单项集合
const expandedMenus = ref<Set<string>>(new Set())

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  const currentPath = route.path
  
  // 先查找一级菜单
  for (const menu of menus) {
    if (menu.path === currentPath) {
      return menu.id
    }
    // 再查找二级菜单
    if (menu.children) {
      const child = menu.children.find(c => c.path === currentPath)
      if (child) {
        return child.id
      }
    }
  }
  
  return 'dashboard'
})

// 计算当前面包屑
const breadcrumb = computed(() => {
  const currentPath = route.path
  
  for (const menu of menus) {
    if (menu.path === currentPath) {
      return menu.name
    }
    if (menu.children) {
      const child = menu.children.find(c => c.path === currentPath)
      if (child) {
        return `${menu.name} / ${child.name}`
      }
    }
  }
  
  return '页面'
})

/**
 * 切换菜单展开/收起状态
 */
function toggleExpand(menuId: string) {
  if (expandedMenus.value.has(menuId)) {
    expandedMenus.value.delete(menuId)
  } else {
    expandedMenus.value.add(menuId)
  }
}

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
            class="menu-item-wrapper"
          >
            <!-- 一级菜单 -->
            <div
              class="menu-item"
              :class="{ 
                active: activeMenu === menu.id,
                'has-children': menu.children,
                expanded: menu.children && expandedMenus.has(menu.id)
              }"
              @click="menu.children ? toggleExpand(menu.id) : switchMenu(menu.path!)"
            >
              <span class="menu-icon">{{ menu.icon }}</span>
              <div class="menu-info">
                <span class="menu-name">{{ menu.name }}</span>
                <span v-if="menu.description && !menu.children" class="menu-desc">{{ menu.description }}</span>
              </div>
              <span v-if="menu.children" class="expand-icon">
                {{ expandedMenus.has(menu.id) ? '▼' : '▶' }}
              </span>
            </div>
            
            <!-- 二级菜单 -->
            <ul v-if="menu.children && expandedMenus.has(menu.id)" class="submenu-list">
              <li
                v-for="child in menu.children"
                :key="child.id"
                class="submenu-item"
                :class="{ active: activeMenu === child.id }"
                @click="switchMenu(child.path!)"
              >
                <span class="submenu-icon">{{ child.icon }}</span>
                <div class="submenu-info">
                  <span class="submenu-name">{{ child.name }}</span>
                  <span v-if="child.description" class="submenu-desc">{{ child.description }}</span>
                </div>
              </li>
            </ul>
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

.menu-item-wrapper {
  margin: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  position: relative;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left-color: white;
}

.menu-item.has-children {
  cursor: pointer;
}

.menu-item.expanded {
  background: rgba(255, 255, 255, 0.15);
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

.expand-icon {
  font-size: 10px;
  opacity: 0.7;
  transition: transform 0.3s ease;
}

/* 二级菜单样式 */
.submenu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px 10px 54px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.submenu-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left-color: white;
}

.submenu-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.submenu-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.submenu-name {
  font-size: 14px;
  font-weight: 400;
}

.submenu-desc {
  font-size: 11px;
  opacity: 0.6;
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
  
  .menu-desc,
  .submenu-desc {
    display: none;
  }
  
  .content-area {
    padding: 20px;
  }
}
</style>
