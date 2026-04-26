import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { 
        requiresAuth: false,
        title: '登录'
      },
    },
    {
      path: '/',
      component: AdminLayout, // 使用统一布局组件
      meta: { 
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: { 
            title: '首页'
          },
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
          meta: { 
            title: '关于'
          },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UserManageView.vue'),
          meta: { 
            title: '用户管理'
          },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../views/ProductManageView.vue'),
          meta: { 
            title: '商品管理'
          },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../views/OrderManageView.vue'),
          meta: { 
            title: '订单管理'
          },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/SystemSettingsView.vue'),
          meta: { 
            title: '系统设置'
          },
        },
      ]
    },
  ],
})

// 全局前置守卫
router.beforeEach((to) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = `${to.meta.title || '页面'} - 管理后台`
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (userStore.isLoggedIn) {
      // 已登录，允许访问
      return true
    } else {
      // 未登录，重定向到登录页，并保存目标路径
      return { 
        name: 'login', 
        query: { redirect: to.fullPath } 
      }
    }
  } else {
    // 如果已登录且访问登录页，重定向到首页
    if (to.name === 'login' && userStore.isLoggedIn) {
      return { name: 'home' }
    }
    // 其他情况，允许访问
    return true
  }
})

// 全局后置钩子 - 滚动到顶部
router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router
