import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo, type LoginParams, type UserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性：判断是否已登录
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 用户登录
   */
  async function login(params: LoginParams) {
    try {
      const response = await loginApi(params)
      
      // 保存 token
      token.value = response.data.token
      localStorage.setItem('token', response.data.token)
      
      // 保存用户信息（从登录响应中）
      userInfo.value = response.data.userInfo
      
      // 尝试获取完整的用户信息（可选，如果登录响应已经包含完整信息可以省略）
      try {
        await fetchUserInfo()
      } catch (error) {
        console.warn('获取完整用户信息失败，使用登录返回的信息:', error)
      }
      
      return response
    } catch (error) {
      console.error('登录失败:', error)
      // 登录失败时清除可能存在的旧数据
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      throw error
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    if (!token.value) {
      throw new Error('未登录')
    }
    
    try {
      const response = await getUserInfo()
      if (response.data) {
        userInfo.value = response.data
      }
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除本地数据
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
    }
  }

  /**
   * 初始化用户状态（应用启动时调用）
   */
  function initUserState() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // 如果有 token，尝试获取用户信息
      fetchUserInfo().catch(() => {
        // 如果获取失败，清除 token
        token.value = ''
        localStorage.removeItem('token')
      })
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    fetchUserInfo,
    logout,
    initUserState,
  }
})
