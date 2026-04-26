/**
 * API Mock 数据示例
 * 
 * 这是一个模拟的后端 API 实现，用于前端开发测试。
 * 实际项目中应该替换为真实的后端服务。
 */

// 模拟用户数据库
const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456', // 实际项目中密码应该加密存储
    email: 'admin@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: '管理员',
    status: 1,
    createTime: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    email: 'user@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    role: '普通用户',
    status: 1,
    createTime: '2024-01-15 14:30:00',
  },
  {
    id: 3,
    username: 'test',
    password: 'test123',
    email: 'test@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    role: '测试用户',
    status: 0,
    createTime: '2024-02-01 09:15:00',
  },
]

// 下一个ID
let nextId = 4

// 模拟 Token 生成（实际项目应使用 JWT）
function generateToken(user: { id: number; username: string }): string {
  return btoa(`${user.id}:${user.username}:${Date.now()}`)
}

// 模拟延迟
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 模拟登录接口
 * POST /auth/login
 */
export async function mockLogin(username: string, password: string) {
  await delay(800) // 模拟网络延迟

  // 参数验证
  if (!username || !password) {
    throw new Error('用户名和密码不能为空')
  }

  const user = users.find((u) => u.username === username && u.password === password)

  if (!user) {
    throw new Error('用户名或密码错误')
  }

  const token = generateToken({ id: user.id, username: user.username })

  return {
    code: 200,
    message: '登录成功',
    data: {
      token,
      userInfo: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    },
  }
}

/**
 * 模拟获取用户信息接口
 * GET /auth/userinfo
 */
export async function mockGetUserInfo(token: string) {
  await delay(300)

  // 简单验证 token（实际项目应验证 JWT）
  if (!token) {
    throw new Error('未授权，请先登录')
  }

  try {
    const decoded = atob(token)
    const [userId] = decoded.split(':')
    const user = users.find((u) => u.id === Number(userId))

    if (!user) {
      throw new Error('用户不存在或Token已过期')
    }

    return {
      code: 200,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('用户不存在')) {
      throw error
    }
    throw new Error('无效的 Token，请重新登录')
  }
}

/**
 * 模拟登出接口
 * POST /auth/logout
 */
export async function mockLogout() {
  await delay(200)
  return {
    code: 200,
    message: '退出成功',
  }
}

/**
 * 模拟获取用户列表接口
 * GET /api/users
 */
export async function mockGetUserList(params: {
  page?: number
  pageSize?: number
  username?: string
  status?: number
}) {
  await delay(400)

  const { page = 1, pageSize = 10, username, status } = params

  // 过滤数据
  let filteredUsers = [...users]

  if (username) {
    filteredUsers = filteredUsers.filter((u) =>
      u.username.toLowerCase().includes(username.toLowerCase())
    )
  }

  if (status !== undefined && status !== null) {
    filteredUsers = filteredUsers.filter((u) => u.status === status)
  }

  // 分页
  const total = filteredUsers.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredUsers.slice(start, end).map(({ password: _password, ...user }) => user) // 移除密码字段

  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total,
      page,
      pageSize,
    },
  }
}

/**
 * 模拟创建用户接口
 * POST /api/users
 */
export async function mockCreateUser(userData: {
  username: string
  password: string
  email?: string
  role?: string
  status?: number
}) {
  await delay(500)

  // 检查用户名是否已存在
  if (users.some((u) => u.username === userData.username)) {
    throw new Error('用户名已存在')
  }

  const newUser = {
    id: nextId++,
    username: userData.username,
    password: userData.password,
    email: userData.email || '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
    role: userData.role || '普通用户',
    status: userData.status !== undefined ? userData.status : 1,
    createTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  }

  users.push(newUser)

  return {
    code: 200,
    message: '创建成功',
    data: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
      status: newUser.status,
      createTime: newUser.createTime,
    },
  }
}

/**
 * 模拟更新用户接口
 * PUT /api/users/:id
 */
export async function mockUpdateUser(
  userId: number,
  userData: {
    email?: string
    role?: string
    status?: number
  }
) {
  await delay(400)

  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error('用户不存在')
  }

  const user = users[userIndex]!

  // 更新字段
  if (userData.email !== undefined) user.email = userData.email
  if (userData.role !== undefined) user.role = userData.role
  if (userData.status !== undefined) user.status = userData.status

  return {
    code: 200,
    message: '更新成功',
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createTime: user.createTime,
    },
  }
}

/**
 * 模拟删除用户接口
 * DELETE /api/users/:id
 */
export async function mockDeleteUser(userId: number) {
  await delay(300)

  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error('用户不存在')
  }

  // 不允许删除当前登录的用户（假设id为1的是当前用户）
  if (userId === 1) {
    throw new Error('不能删除当前登录的账号')
  }

  users.splice(userIndex, 1)

  return {
    code: 200,
    message: '删除成功',
  }
}

/**
 * 模拟重置密码接口
 * POST /api/users/:id/reset-password
 */
export async function mockResetPassword(userId: number) {
  await delay(400)

  const user = users.find((u) => u.id === userId)

  if (!user) {
    throw new Error('用户不存在')
  }

  // 生成随机密码
  const newPassword = Math.random().toString(36).slice(-8)
  user.password = newPassword

  return {
    code: 200,
    message: '密码重置成功',
    data: {
      password: newPassword,
    },
  }
}
