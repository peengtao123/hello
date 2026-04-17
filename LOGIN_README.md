# 登录功能使用说明

## 📁 项目结构

```
src/
├── api/                    # API 服务层
│   ├── request.ts         # axios 实例配置和拦截器
│   └── auth.ts            # 认证相关 API 接口
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

### 3. 测试账号

目前使用的是模拟数据，你可以使用任意用户名和密码进行登录测试。

## 🔧 配置说明

### API 地址配置

在 `.env.development` 或 `.env.production` 中修改：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 后端 API 接口要求

需要后端提供以下接口：

#### 1. 登录接口
- **URL**: `POST /auth/login`
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userInfo": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "avatar": "https://..."
      }
    }
  }
  ```

#### 2. 获取用户信息接口
- **URL**: `GET /auth/userinfo`
- **Headers**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 200,
    "data": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "avatar": "https://..."
    }
  }
  ```

#### 3. 登出接口
- **URL**: `POST /auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "code": 200
  }
  ```

## 🎯 功能特性

### ✅ 已实现功能

1. **用户登录**
   - 表单验证
   - Token 存储到 localStorage
   - 自动跳转到首页

2. **路由守卫**
   - 未登录用户访问受保护页面时自动跳转到登录页
   - 已登录用户访问登录页时自动跳转到首页
   - 支持登录后返回原访问页面

3. **Token 管理**
   - 自动在请求头添加 Authorization
   - Token 过期自动跳转登录页
   - 401 错误自动处理

4. **用户信息显示**
   - 首页显示当前登录用户
   - 退出登录功能

5. **错误处理**
   - 统一的错误提示
   - 网络错误处理
   - 超时处理

### 📝 单元测试

运行测试：

```bash
npm run test:unit
```

测试覆盖：
- 登录成功/失败场景
- 登出功能
- 获取用户信息
- 状态管理逻辑

## 🔐 安全建议

1. **生产环境**务必使用 HTTPS
2. Token 建议使用 JWT 格式并设置合理的过期时间
3. 密码传输前应进行加密（如 bcrypt）
4. 考虑添加 CSRF 保护
5. 实现刷新 Token 机制

## 🛠️ 扩展建议

1. **添加注册功能**
   - 创建 `RegisterView.vue`
   - 在 `auth.ts` 中添加注册 API

2. **添加忘记密码功能**
   - 创建密码重置流程

3. **添加第三方登录**
   - GitHub、Google、微信等

4. **添加权限控制**
   - 基于角色的访问控制（RBAC）
   - 菜单权限动态加载

5. **优化用户体验**
   - 添加记住我功能
   - 添加验证码
   - 添加登录动画效果

## 📚 相关文档

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Axios 官方文档](https://axios-http.com/)
- [Vitest 测试框架](https://vitest.dev/)
