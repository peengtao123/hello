import { mockLogin, mockGetUserInfo, mockLogout } from './mock'

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

export function login(params: LoginParams): Promise<LoginResponse> {
  // 使用 Mock API
  return mockLogin(params.username, params.password) as Promise<LoginResponse>
}

export function getUserInfo(): Promise<{ code: number; data: UserInfo }> {
  const token = localStorage.getItem('token') || ''
  return mockGetUserInfo(token) as Promise<{ code: number; data: UserInfo }>
}

export function logout(): Promise<{ code: number }> {
  return mockLogout() as Promise<{ code: number }>
}
