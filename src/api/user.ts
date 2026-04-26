import {
  mockGetUserList,
  mockCreateUser,
  mockUpdateUser,
  mockDeleteUser,
  mockResetPassword,
} from './mock'

// 用户信息类型
export interface User {
  id: number
  username: string
  email?: string
  avatar?: string
  role: string
  status: number // 0: 禁用, 1: 启用
  createTime: string
}

// 用户列表响应类型
export interface UserListResponse {
  list: User[]
  total: number
  page: number
  pageSize: number
}

// 用户查询参数类型
export interface UserQueryParams {
  page?: number
  pageSize?: number
  username?: string
  status?: number
}

// 创建用户参数类型
export interface CreateUserParams {
  username: string
  password: string
  email?: string
  role?: string
  status?: number
}

// 更新用户参数类型
export interface UpdateUserParams {
  email?: string
  role?: string
  status?: number
}

// 通用响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表响应
 */
export function getUserList(params: UserQueryParams): Promise<ApiResponse<UserListResponse>> {
  return mockGetUserList(params) as Promise<ApiResponse<UserListResponse>>
}

/**
 * 创建用户
 * @param userData 用户数据
 * @returns 创建结果
 */
export function createUser(userData: CreateUserParams): Promise<ApiResponse<User>> {
  return mockCreateUser(userData) as Promise<ApiResponse<User>>
}

/**
 * 更新用户
 * @param userId 用户ID
 * @param userData 用户数据
 * @returns 更新结果
 */
export function updateUser(
  userId: number,
  userData: UpdateUserParams
): Promise<ApiResponse<User>> {
  return mockUpdateUser(userId, userData) as Promise<ApiResponse<User>>
}

/**
 * 删除用户
 * @param userId 用户ID
 * @returns 删除结果
 */
export function deleteUser(userId: number): Promise<ApiResponse> {
  return mockDeleteUser(userId) as Promise<ApiResponse>
}

/**
 * 重置用户密码
 * @param userId 用户ID
 * @returns 新密码
 */
export function resetPassword(userId: number): Promise<ApiResponse<{ password: string }>> {
  return mockResetPassword(userId) as Promise<ApiResponse<{ password: string }>>
}
