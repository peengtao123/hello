import { mockLogin, mockGetUserInfo, mockLogout } from './mock'

// 登录请求参数类型
export interface LoginParams {
  username: string
  password: string
}

// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  email?: string
  avatar?: string
}

// 登录响应数据类型
export interface LoginData {
  token: string
  userInfo: UserInfo
}

// 登录响应类型
export interface LoginResponse {
  code: number
  message: string
  data: LoginData
}

// 通用响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}

/**
 * 用户登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  // 使用 Mock API
  return mockLogin(params.username, params.password) as Promise<LoginResponse>
}

/**
 * 获取用户信息
 * @returns 用户信息响应
 */
export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  const token = localStorage.getItem('token') || ''
  return mockGetUserInfo(token) as Promise<ApiResponse<UserInfo>>
}

/**
 * 用户登出
 * @returns 登出响应
 */
export function logout(): Promise<ApiResponse> {
  return mockLogout() as Promise<ApiResponse>
}
