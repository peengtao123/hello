import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }, // 不需要登录即可访问
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }, // 需要登录才能访问
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }, // 需要登录才能访问
    },
  ],
})

// 全局前置守卫
router.beforeEach((to) => {
  const userStore = useUserStore()
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (userStore.isLoggedIn) {
      // 已登录，允许访问
      return true
    } else {
      // 未登录，重定向到登录页
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  } else {
    // 如果已登录且访问登录页，重定向到首页
    if (to.name === 'login' && userStore.isLoggedIn) {
      return { name: 'home' }
    } else {
      return true
    }
  }
})

export default router
