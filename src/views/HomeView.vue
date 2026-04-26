<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 当前激活的菜单项
const activeMenu = ref('dashboard')

// 菜单列表
const menus = ref([
  { id: 'dashboard', name: '仪表盘', icon: '📊', description: '查看系统概览和关键指标' },
  { id: 'users', name: '用户管理', icon: '👥', description: '管理系统用户信息' },
  { id: 'products', name: '商品管理', icon: '📦', description: '管理商品信息' },
  { id: 'orders', name: '订单管理', icon: '📝', description: '查看和管理订单' },
  { id: 'settings', name: '系统设置', icon: '⚙️', description: '配置系统参数' },
])

// 计算当前激活的菜单信息
const currentMenu = computed(() => {
  return menus.value.find(menu => menu.id === activeMenu.value) || menus.value[0]
})

// 模拟统计数据
const stats = ref({
  totalUsers: 1234,
  totalProducts: 567,
  totalOrders: 890,
  revenue: 123456,
})

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

/**
 * 切换菜单
 */
function switchMenu(menuId: string) {
  if (activeMenu.value !== menuId) {
    activeMenu.value = menuId
  }
}

/**
 * 格式化金额
 */
function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`
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
            @click="switchMenu(menu.id)"
          >
            <span class="menu-icon">{{ menu.icon }}</span>
            <div class="menu-info">
              <span class="menu-name">{{ menu.name }}</span>
              <span class="menu-desc">{{ menu.description }}</span>
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
          <span class="breadcrumb-item active">{{ currentMenu!.name }}</span>
        </div>
        <div class="user-info">
          <span class="welcome-text">欢迎，{{ userStore.userInfo?.username || '用户' }}</span>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="content-area">
        <transition name="fade" mode="out-in">
          <!-- 仪表盘 -->
          <div v-if="activeMenu === 'dashboard'" key="dashboard" class="page-content">
            <div class="page-header">
              <h1>{{ currentMenu!.name }}</h1>
              <p class="page-description">{{ currentMenu!.description }}</p>
            </div>
            
            <!-- 统计卡片 -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalUsers }}</div>
                  <div class="stat-label">总用户数</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalProducts }}</div>
                  <div class="stat-label">商品总数</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalOrders }}</div>
                  <div class="stat-label">订单总数</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatMoney(stats.revenue) }}</div>
                  <div class="stat-label">总收入</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 其他页面 -->
          <div v-else :key="activeMenu" class="page-content">
            <div class="page-header">
              <h1>{{ currentMenu!.name }}</h1>
              <p class="page-description">{{ currentMenu!.description }}</p>
            </div>
            <div class="empty-state">
              <div class="empty-icon">{{ currentMenu!.icon }}</div>
              <p class="empty-text">{{ currentMenu!.name }}功能模块开发中...</p>
            </div>
          </div>
        </transition>
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
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
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
  background: white;
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
  color: #333;
  font-weight: 500;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.page-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 180px);
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.stat-icon {
  font-size: 40px;
  background: rgba(255, 255, 255, 0.2);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  margin: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .menu-desc {
    display: none;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-area {
    padding: 20px;
  }
  
  .page-content {
    padding: 20px;
  }
}
</style>
