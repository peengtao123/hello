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
      
      // 保存用户信息
      userInfo.value = response.data.userInfo
      
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
    try {
      const response = await getUserInfo()
      userInfo.value = response.data
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

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    fetchUserInfo,
    logout,
  }
})
