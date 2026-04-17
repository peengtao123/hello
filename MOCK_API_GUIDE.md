# 如何使用 Mock API 进行测试

## 📝 说明

由于目前还没有真实的后端服务，你可以使用提供的 Mock API 来测试登录功能。

## 🔧 启用 Mock API

### 方法 1: 修改 request.ts（推荐用于开发）

在 `src/api/request.ts` 中，临时修改 baseURL 为空，然后在前端直接调用 Mock 函数：

```typescript
// src/api/auth.ts - 临时修改为使用 Mock
import { mockLogin, mockGetUserInfo, mockLogout } from './mock'

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
```

### 方法 2: 创建 Vite Mock 插件

创建 `vite.config.mock.ts` 文件来拦截 API 请求。

## 🧪 测试账号

Mock API 提供了以下测试账号：

| 用户名 | 密码 | 邮箱 |
|--------|------|------|
| admin | 123456 | admin@example.com |
| user | 123456 | user@example.com |

## ✅ 测试步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问登录页面**
   - 浏览器打开 `http://localhost:5173`
   - 会自动跳转到 `/login`

3. **输入测试账号**
   - 用户名: `admin`
   - 密码: `123456`

4. **点击登录**
   - 应该成功登录并跳转到首页
   - 首页会显示欢迎信息和用户头像

5. **测试登出**
   - 点击首页右上角的"退出登录"按钮
   - 应该返回到登录页

6. **测试错误情况**
   - 输入错误的密码
   - 应该显示错误提示："用户名或密码错误"

## 🎯 预期行为

### 成功登录
- ✅ 显示加载状态 "登录中..."
- ✅ 保存 Token 到 localStorage
- ✅ 跳转到首页
- ✅ 显示用户信息

### 登录失败
- ✅ 显示错误提示
- ✅ 不清除表单数据
- ✅ 可以重新尝试登录

### 路由守卫
- ✅ 未登录访问首页会跳转到登录页
- ✅ 已登录访问登录页会跳转到首页

## 📸 界面预览

### 登录页
- 渐变背景
- 白色卡片式登录框
- 用户名和密码输入框
- 登录按钮带加载状态
- 错误提示（红色边框）

### 首页
- 顶部用户信息栏
- 显示欢迎语和用户名
- 退出登录按钮

## 🚀 下一步

当你有真实的后端 API 后：

1. 恢复 `src/api/auth.ts` 中的原始实现
2. 在 `.env.development` 中配置真实的 API 地址
3. 确保后端 API 响应格式与前端期望一致
4. 删除或注释掉 Mock 相关代码

## 💡 提示

Mock API 位于 `src/api/mock.ts`，你可以根据需要修改测试账号和数据。
