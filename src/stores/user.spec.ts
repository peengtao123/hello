import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './user'
import * as authApi from '@/api/auth'

// Mock API 模块
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getUserInfo: vi.fn(),
}))

describe('用户 Store', () => {
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    // 设置 Pinia 实例
    setActivePinia(createPinia())
    userStore = useUserStore()
    
    // 清除 localStorage
    localStorage.clear()
    
    // 重置所有 mock
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该初始化空 token', () => {
      expect(userStore.token).toBe('')
    })

    it('应该初始化 null 用户信息', () => {
      expect(userStore.userInfo).toBeNull()
    })

    it('应该判断为未登录状态', () => {
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('登录功能', () => {
    it('应该成功登录并保存 token', async () => {
      // Mock 登录 API 响应
      const mockResponse = {
        code: 200,
        message: 'success',
        data: {
          token: 'test-token-123',
          userInfo: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
          },
        },
      }
      
      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      // 执行登录
      await userStore.login({
        username: 'admin',
        password: '123456',
      })

      // 验证状态更新
      expect(userStore.token).toBe('test-token-123')
      expect(userStore.userInfo).toEqual(mockResponse.data.userInfo)
      expect(userStore.isLoggedIn).toBe(true)
      
      // 验证 localStorage
      expect(localStorage.getItem('token')).toBe('test-token-123')
      
      // 验证 API 被正确调用
      expect(authApi.login).toHaveBeenCalledWith({
        username: 'admin',
        password: '123456',
      })
    })

    it('应该在登录失败时抛出错误', async () => {
      // Mock 登录失败
      const error = new Error('用户名或密码错误')
      vi.mocked(authApi.login).mockRejectedValue(error)

      // 验证抛出错误
      await expect(
        userStore.login({
          username: 'admin',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('用户名或密码错误')

      // 验证状态未改变
      expect(userStore.token).toBe('')
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('登出功能', () => {
    it('应该成功登出并清除数据', async () => {
      // 先设置登录状态
      userStore.token = 'test-token'
      userStore.userInfo = { id: 1, username: 'admin' }
      localStorage.setItem('token', 'test-token')

      // Mock 登出 API
      vi.mocked(authApi.logout).mockResolvedValue({ code: 200 })

      // 执行登出
      await userStore.logout()

      // 验证状态已清除
      expect(userStore.token).toBe('')
      expect(userStore.userInfo).toBeNull()
      expect(userStore.isLoggedIn).toBe(false)
      
      // 验证 localStorage 已清除
      expect(localStorage.getItem('token')).toBeNull()
      
      // 验证 API 被调用
      expect(authApi.logout).toHaveBeenCalled()
    })
  })

  describe('获取用户信息', () => {
    it('应该成功获取用户信息', async () => {
      const mockUserInfo = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
      }

      vi.mocked(authApi.getUserInfo).mockResolvedValue({
        code: 200,
        data: mockUserInfo,
      })

      await userStore.fetchUserInfo()

      expect(userStore.userInfo).toEqual(mockUserInfo)
      expect(authApi.getUserInfo).toHaveBeenCalled()
    })
  })
})
