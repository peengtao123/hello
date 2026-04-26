# 登录功能说明

## 📁 项目结构

```
src/
├── api/                    # API 服务层
│   ├── request.ts         # axios 实例配置和拦截器
│   ├── auth.ts            # 认证相关 API 接口
│   └── mock.ts            # Mock数据（开发环境）
├── stores/
│   ├── user.ts            # 用户状态管理
│   └── user.spec.ts       # 用户 Store 单元测试
├── views/
│   ├── LoginView.vue      # 登录页面
│   └── HomeView.vue       # 首页（含用户信息和登出）
├── router/
│   └── index.ts           # 路由配置和守卫
├── .env.development       # 开发环境变量
└── .env.production        # 生产环境变量
```

## 🚀 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 访问登录页面

浏览器打开 `http://localhost:5173`，会自动跳转到 `/login` 登录页。

## 🎯 功能特性

### 1. 完善的表单验证
- ✅ 用户名不能为空，且至少3个字符
- ✅ 密码不能为空，且至少6个字符
- ✅ 实时验证和错误提示
- ✅ 字段级别的错误显示

### 2. 记住我功能
- ✅ 勾选"记住我"后，下次访问会自动填充用户名
- ✅ 用户名保存在本地存储中
- ✅ 取消勾选会清除保存的用户名

### 3. 密码可见性切换
- ✅ 点击眼睛图标可以显示/隐藏密码
- ✅ 提升用户体验，方便用户确认输入

### 4. 友好的错误提示
- ✅ 登录失败时显示明确的错误信息
- ✅ 错误提示带有动画效果
- ✅ 字段验证错误实时显示

### 5. 加载状态优化
- ✅ 登录过程中显示加载动画
- ✅ 禁用表单防止重复提交
- ✅ 按钮文字变化提示当前状态

### 6. 智能路由跳转
- ✅ 登录后自动跳转到之前访问的页面
- ✅ 未登录访问受保护页面会自动重定向到登录页
- ✅ 已登录用户访问登录页会跳转到首页

### 7. Token 管理
- ✅ 自动保存和恢复登录状态
- ✅ 应用启动时检查本地Token
- ✅ Token失效时自动清除并跳转登录

## 👥 测试账号

系统提供了以下测试账号：

| 用户名 | 密码 | 说明 |
|--------|------|------|
| admin | 123456 | 管理员账号 |
| user | 123456 | 普通用户 |
| test | test123 | 测试账号 |

## 📖 使用流程

### 首次登录
1. 打开应用，自动跳转到登录页面
2. 输入用户名和密码
3. 可选择勾选"记住我"
4. 点击"登录"按钮
5. 登录成功后跳转到首页

### 再次访问
- 如果勾选了"记住我"，用户名会自动填充
- 如果Token仍然有效，可以直接访问受保护页面
- 如果Token失效，会要求重新登录

### 退出登录
1. 在首页点击左侧边栏底部的"退出登录"按钮
2. 系统会清除本地数据
3. 自动跳转到登录页面

## 🛠️ 技术实现

### 核心文件
- `src/views/LoginView.vue` - 登录页面组件
- `src/stores/user.ts` - 用户状态管理
- `src/api/auth.ts` - 认证API接口
- `src/api/mock.ts` - Mock数据（开发环境）
- `src/router/index.ts` - 路由配置和守卫

### 状态管理
使用 Pinia 管理用户状态：
- `token`: 用户认证令牌
- `userInfo`: 用户信息
- `isLoggedIn`: 登录状态计算属性

### 路由守卫
- 全局前置守卫检查路由是否需要认证
- 未登录用户访问受保护页面会重定向到登录页
- 已登录用户访问登录页会重定向到首页

### 数据持久化
- Token 保存在 localStorage 中
- "记住我"的用户名保存在 localStorage 中
- 应用启动时自动恢复登录状态

## 🔌 API 接口

### 登录接口
```typescript
POST /auth/login
Request: { username: string, password: string }
Response: { 
  code: number, 
  message: string, 
  data: { 
    token: string, 
    userInfo: UserInfo 
  } 
}
```

### 获取用户信息
```typescript
GET /auth/userinfo
Headers: { Authorization: Bearer <token> }
Response: { 
  code: number, 
  message: string, 
  data: UserInfo 
}
```

### 登出接口
```typescript
POST /auth/logout
Headers: { Authorization: Bearer <token> }
Response: { 
  code: number, 
  message: string 
}
```

## 🚀 后续优化建议

1. **密码强度验证** - 添加密码复杂度要求
2. **验证码功能** - 防止暴力破解
3. **第三方登录** - 支持微信、GitHub等
4. **双因素认证** - 提高安全性
5. **登录日志** - 记录登录时间和IP
6. **自动刷新Token** - 避免频繁登录
7. **会话超时提醒** - 提前通知用户

## ⚠️ 注意事项

⚠️ **重要提示**：
- 当前使用的是 Mock API，仅用于开发测试
- 生产环境需要替换为真实的后端API
- 密码在实际项目中应该加密传输和存储
- Token 应该使用 JWT 等安全机制
- 需要实现HTTPS保证传输安全

## 📚 相关文档

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Axios 官方文档](https://axios-http.com/)
- [Vitest 测试框架](https://vitest.dev/)
