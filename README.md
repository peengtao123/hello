# hello

此模板可帮助您开始使用 Vite 开发 Vue 3 应用。

## 功能特性

- ✅ **用户认证系统**：完整的登录/登出功能，支持记住我、密码可见性切换
- ✅ **滑块验证码**：智能安全验证，失败3次后自动启用
- ✅ **用户管理**：完整的CRUD操作，支持搜索、筛选、分页
- ✅ **路由守卫**：基于角色的访问控制，自动重定向
- ✅ **状态管理**：使用 Pinia 进行全局状态管理
- ✅ **TypeScript**：完整的类型支持，确保代码质量
- ✅ **响应式设计**：适配各种屏幕尺寸

## 快速开始

### 1. 安装依赖

```sh
npm install
```

### 2. 启动开发服务器

```sh
npm run dev
```

访问 http://localhost:5173/

### 3. 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| user | 123456 | 普通用户 |
| test | test123 | 测试用户 |

## 主要功能

### 登录功能
- 表单验证（用户名≥3字符，密码≥6字符）
- 记住我功能（localStorage保存用户名）
- 密码可见性切换
- 智能跳转（登录后重定向到目标页面）
- Token自动管理和失效处理

### 滑块验证码
- 前3次登录失败无需验证
- 3次及以上失败强制启用滑块验证
- 随机缺口位置和渐变背景
- 支持鼠标和触摸操作
- 成功/失败视觉反馈

### 用户管理
访问路径：首页 → 左侧菜单 → 用户管理（或 /users）

**功能列表：**
- 📋 用户列表展示（表格形式）
- 🔍 搜索和筛选（用户名、状态）
- ➕ 新增用户（完整表单验证）
- ✏️ 编辑用户（修改邮箱、角色、状态）
- 🗑️ 删除用户（二次确认，保护当前账号）
- 🔑 重置密码（生成8位随机密码）
- 📄 分页导航（每页10条记录）

## 项目结构

```
src/
├── api/              # API接口层
│   ├── auth.ts      # 认证相关接口
│   ├── mock.ts      # Mock数据
│   └── user.ts      # 用户管理接口
├── components/       # 公共组件
│   ├── SliderCaptcha.vue    # 滑块验证码
│   └── ...
├── views/           # 页面组件
│   ├── LoginView.vue        # 登录页
│   ├── HomeView.vue         # 首页（带侧边栏）
│   ├── AboutView.vue        # 关于页
│   └── UserManageView.vue   # 用户管理页
├── stores/          # 状态管理
│   ├── user.ts      # 用户状态
│   └── counter.ts   # 计数器示例
├── router/          # 路由配置
│   └── index.ts
└── assets/          # 静态资源
```

## 技术栈

- **前端框架**：Vue 3.5+ (Composition API)
- **构建工具**：Vite 8.0+
- **状态管理**：Pinia 3.0+
- **路由管理**：Vue Router 5.0+
- **HTTP客户端**：Axios 1.15+
- **语言**：TypeScript 6.0+
- **测试**：Vitest（单元测试）、Playwright（E2E测试）
- **代码规范**：ESLint + Prettier + Oxlint

## 常用命令

```sh
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 单元测试
npm run test:unit

# E2E测试
npm run test:e2e

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 推荐的 IDE 设置

[VS Code](https://code.visualstudio.com/) + [Vue (官方)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（并禁用 Vetur）。

## 推荐的浏览器设置

- 基于 Chromium 的浏览器（Chrome、Edge、Brave 等）：
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [在 Chrome DevTools 中启用自定义对象格式化器](http://bit.ly/object-formatters)
- Firefox：
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [在 Firefox DevTools 中启用自定义对象格式化器](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## TS 中 `.vue` 导入的类型支持

TypeScript 默认无法处理 `.vue` 导入的类型信息，因此我们使用 `vue-tsc` 替代 `tsc` CLI 进行类型检查。在编辑器中，我们需要 [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 让 TypeScript 语言服务识别 `.vue` 类型。

## 自定义配置

参见 [Vite 配置参考](https://vite.dev/config/)。

## 项目设置

```sh
npm install
```

### 编译和热重载以进行开发

```sh
npm run dev
```

### 类型检查、编译和生产环境压缩

```sh
npm run build
```

### 使用 [Vitest](https://vitest.dev/) 运行单元测试

```sh
npm run test:unit
```

### 使用 [Playwright](https://playwright.dev) 运行端到端测试

```sh
# 首次运行时安装浏览器
npx playwright install

# 在 CI 上测试时，必须先构建项目
npm run build

# 运行端到端测试
npm run test:e2e
# 仅在 Chromium 上运行测试
npm run test:e2e -- --project=chromium
# 运行特定文件的测试
npm run test:e2e -- tests/example.spec.ts
# 以调试模式运行测试
npm run test:e2e -- --debug
```

### 使用 [ESLint](https://eslint.org/) 进行代码检查

```sh
npm run lint
```
