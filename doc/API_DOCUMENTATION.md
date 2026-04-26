# API 接口文档

## 📋 目录

- [认证接口](#认证接口)
- [用户接口](#用户接口)
- [通用规范](#通用规范)
- [错误码说明](#错误码说明)

---

## 认证接口

### 1. 用户登录

**接口地址**: `POST /api/login`

**请求参数**:
```json
{
  "username": "string",    // 用户名，必填
  "password": "string"     // 密码，必填
}
```

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin",
    "role": "admin",
    "expiresIn": 86400
  }
}
```

失败 (401):
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

**使用示例**:
```typescript
import { login } from '@/api/auth'

try {
  const result = await login('admin', '123456')
  localStorage.setItem('token', result.data.token)
} catch (error) {
  console.error('登录失败:', error)
}
```

---

### 2. 获取用户信息

**接口地址**: `GET /api/user/info`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "phone": "13800138000",
    "role": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

失败 (401):
```json
{
  "code": 401,
  "message": "Token 无效或已过期",
  "data": null
}
```

---

### 3. 退出登录

**接口地址**: `POST /api/logout`

**请求头**:
```
Authorization: Bearer {token}
```

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

---

### 4. 刷新 Token

**接口地址**: `POST /api/auth/refresh`

**请求参数**:
```json
{
  "refreshToken": "string"  // 刷新令牌
}
```

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "Token 刷新成功",
  "data": {
    "token": "new_access_token...",
    "refreshToken": "new_refresh_token...",
    "expiresIn": 86400
  }
}
```

---

## 用户接口

### 1. 获取用户列表

**接口地址**: `GET /api/users`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词 |
| role | string | 否 | 角色筛选 |

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2. 创建用户

**接口地址**: `POST /api/users`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "username": "string",      // 用户名，必填
  "password": "string",      // 密码，必填
  "email": "string",         // 邮箱，必填
  "phone": "string",         // 手机号，可选
  "role": "admin|user"       // 角色，必填
}
```

**响应示例**:

成功 (201):
```json
{
  "code": 201,
  "message": "用户创建成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

失败 (400):
```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

---

### 3. 更新用户

**接口地址**: `PUT /api/users/{id}`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:
- `id`: 用户ID

**请求参数**:
```json
{
  "email": "string",         // 邮箱，可选
  "phone": "string",         // 手机号，可选
  "role": "admin|user",      // 角色，可选
  "status": 0|1              // 状态，可选
}
```

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "用户更新成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "updated@example.com",
    "role": "admin",
    "status": 1
  }
}
```

---

### 4. 删除用户

**接口地址**: `DELETE /api/users/{id}`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `id`: 用户ID

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null
}
```

失败 (404):
```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null
}
```

---

### 5. 重置密码

**接口地址**: `POST /api/users/{id}/reset-password`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:
- `id`: 用户ID

**请求参数**:
```json
{
  "newPassword": "string"    // 新密码，必填
}
```

**响应示例**:

成功 (200):
```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

---

## 商品接口

### 1. 获取商品列表

**接口地址**: `GET /api/products`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 分类筛选 |
| minPrice | number | 否 | 最低价格 |
| maxPrice | number | 否 | 最高价格 |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "iPhone 15",
        "price": 7999,
        "stock": 100,
        "category": "电子产品",
        "image": "https://example.com/iphone15.jpg",
        "status": 1
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2. 创建商品

**接口地址**: `POST /api/products`

**请求参数**:
```json
{
  "name": "string",          // 商品名称，必填
  "description": "string",   // 描述，可选
  "price": "number",         // 价格，必填
  "stock": "number",         // 库存，必填
  "category": "string",      // 分类，必填
  "images": ["string"]       // 图片数组，可选
}
```

---

### 3. 更新商品

**接口地址**: `PUT /api/products/{id}`

**请求参数**: 同创建商品（所有字段可选）

---

### 4. 删除商品

**接口地址**: `DELETE /api/products/{id}`

---

## 订单接口

### 1. 获取订单列表

**接口地址**: `GET /api/orders`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| status | string | 否 | 订单状态 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "ORD20240101001",
        "userId": 1,
        "username": "admin",
        "totalAmount": 7999,
        "status": "pending",
        "items": [
          {
            "productId": 1,
            "productName": "iPhone 15",
            "quantity": 1,
            "price": 7999
          }
        ],
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2. 创建订单

**接口地址**: `POST /api/orders`

**请求参数**:
```json
{
  "items": [
    {
      "productId": 1,        // 商品ID
      "quantity": 2          // 数量
    }
  ],
  "shippingAddress": {
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技南路1号"
  },
  "remark": "string"         // 备注，可选
}
```

---

### 3. 更新订单状态

**接口地址**: `PATCH /api/orders/{id}/status`

**请求参数**:
```json
{
  "status": "pending|paid|shipped|completed|cancelled"
}
```

---

## 通用规范

### 请求格式

所有 POST/PUT/PATCH 请求使用 JSON 格式：

```
Content-Type: application/json
```

### 响应格式

统一响应结构：

```json
{
  "code": 200,              // 状态码
  "message": "success",     // 消息
  "data": {}                // 数据
}
```

### 分页格式

```json
{
  "list": [],               // 数据列表
  "total": 100,             // 总记录数
  "page": 1,                // 当前页码
  "pageSize": 10            // 每页数量
}
```

### 认证方式

使用 Bearer Token 认证：

```
Authorization: Bearer {token}
```

---

## 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|---------|
| 200 | 成功 | - |
| 201 | 创建成功 | - |
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未授权 | 检查 Token 是否有效 |
| 403 | 禁止访问 | 检查权限 |
| 404 | 资源不存在 | 检查资源ID |
| 409 | 冲突 | 资源已存在 |
| 422 | 验证失败 | 检查数据格式 |
| 500 | 服务器错误 | 联系管理员 |

---

## Mock 数据说明

开发环境下使用 Mock 数据，测试账号：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| user | 123456 | 普通用户 |
| test | test123 | 测试账号 |

---

## 前端调用示例

### Axios 封装

```typescript
// api/client.ts
import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
client.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
```

### API 函数定义

```typescript
// api/auth.ts
import client from './client'

export function login(username: string, password: string) {
  return client.post('/login', { username, password })
}

export function getUserInfo() {
  return client.get('/user/info')
}

export function logout() {
  return client.post('/logout')
}
```

### 组件中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { login } from '@/api/auth'

const loading = ref(false)

async function handleLogin() {
  try {
    loading.value = true
    const result = await login('admin', '123456')
    
    localStorage.setItem('token', result.data.token)
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 后端实现建议

### Node.js + Express 示例

```javascript
const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()

app.use(express.json())

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  
  // 验证用户
  if (username === 'admin' && password === '123456') {
    const token = jwt.sign(
      { username, role: 'admin' },
      'SECRET_KEY',
      { expiresIn: '24h' }
    )
    
    res.json({
      code: 200,
      message: '登录成功',
      data: { token, username, role: 'admin' }
    })
  } else {
    res.status(401).json({
      code: 401,
      message: '用户名或密码错误',
      data: null
    })
  }
})

// 中间件：验证 Token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供 Token',
      data: null
    })
  }
  
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY')
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: 'Token 无效或已过期',
      data: null
    })
  }
}

// 受保护的接口
app.get('/api/user/info', authMiddleware, (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: 1,
      username: req.user.username,
      role: req.user.role
    }
  })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

---

**文档版本**: 1.0.0  
**最后更新**: 2024-01-01
