import request from './request'

// 登录请求参数类型
export interface LoginParams {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    userInfo: {
      id: number
      username: string
      email?: string
      avatar?: string
    }
  }
}

// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  email?: string
  avatar?: string
}

/**
 * 用户登录
 * @param params 登录参数
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  return request({
    url: '/auth/login',
    method: 'post',
    data: params,
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<{ code: number; data: UserInfo }> {
  return request({
    url: '/auth/userinfo',
    method: 'get',
  })
}

/**
 * 用户登出
 */
export function logout(): Promise<{ code: number }> {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}
