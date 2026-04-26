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
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    email: 'user@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  },
  {
    id: 3,
    username: 'test',
    password: 'test123',
    email: 'test@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  },
]

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
