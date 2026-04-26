# 管理后台系统

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue-3.5+-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.0+-purple.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

一个基于 Vue 3 + TypeScript + Vite 的现代化管理后台系统模板

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [技术文档](#-文档) • [在线演示](#-在线演示)

</div>

---

## ✨ 功能特性

### 🔐 安全认证
- ✅ 完整的登录/登出流程
- ✅ Token 自动管理与刷新
- ✅ 智能滑块验证码（防暴力破解）
- ✅ 路由守卫保护
- ✅ 会话超时自动退出

### 🎨 主题系统
- 🌈 **8种预设主题**：亮色、暗色、蓝色、绿色、橙色、粉色、青色、深紫
- 🎯 **自定义颜色**：主色调 + 次要色自由搭配
- 📤 **导入/导出**：JSON 格式配置文件，方便分享
- 📸 **预览图生成**：自动生成主题预览图片
- 👥 **用户级偏好**：不同用户使用独立主题
- ⏰ **自动切换**：根据时间自动切换亮色/暗色主题

### 📱 页面布局
- 🏗️ **统一布局架构**：全局布局组件 + 嵌套路由
- 💾 **页面缓存**：Keep-alive 实现无刷新切换
- 📊 **响应式设计**：完美适配桌面端和移动端
- 🎯 **面包屑导航**：清晰的页面层级展示

### 🚀 开发体验
- ⚡ **极速热更新**：Vite 提供秒级启动和热替换
- 🔍 **类型安全**：完整的 TypeScript 类型定义
- 🧪 **测试覆盖**：单元测试 (Vitest) + E2E 测试 (Playwright)
- 📝 **代码规范**：ESLint + Prettier 保障代码质量

---

## 🚀 快速开始

### 环境要求

- Node.js: `^20.19.0` 或 `>=22.12.0`
- npm: 最新稳定版

### 安装

```bash
# 克隆项目
git clone https://github.com/your-repo/hello.git

# 进入目录
cd hello

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 测试

```bash
# 单元测试
npm run test:unit

# E2E 测试
npm run test:e2e
```

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [快速开始指南](./QUICK_START.md) | 5分钟上手教程 |
| [技术文档](./TECHNICAL_DOCUMENTATION.md) | 完整的技术架构和功能说明 |
| [主题使用指南](./THEME_GUIDE.md) | 主题系统详细使用说明 |
| [API 接口文档](./API_DOCUMENTATION.md) | 后端 API 接口定义 |

---

## 🎯 核心功能演示

### 1. 登录与验证

![登录页面](./screenshots/login.png)

- 表单实时验证
- 滑块验证码（3次失败后强制验证）
- Token 自动保存和恢复

### 2. 主题定制

![主题设置](./screenshots/theme.png)

- 8种预设主题一键切换
- 自定义颜色选择器
- 主题导入/导出
- 自动切换时间表设置

### 3. 管理后台

![仪表盘](./screenshots/dashboard.png)

- 统一的侧边栏菜单
- 顶部导航和面包屑
- 页面缓存保持状态

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | [Vue 3.5+](https://vuejs.org/) |
| **语言** | [TypeScript 6.0+](https://www.typescriptlang.org/) |
| **构建** | [Vite 8.0+](https://vitejs.dev/) |
| **状态管理** | [Pinia 3.0+](https://pinia.vuejs.org/) |
| **路由** | [Vue Router 5.0+](https://router.vuejs.org/) |
| **HTTP** | [Axios 1.15+](https://axios-http.com/) |
| **测试** | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |
| **代码规范** | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) |

---

## 📁 项目结构

```
hello/
├── src/
│   ├── api/                 # API 接口层
│   │   ├── auth.ts         # 认证接口
│   │   └── mock.ts         # Mock 数据
│   ├── assets/              # 静态资源
│   │   ├── main.css        # 全局样式
│   │   └── theme.css       # 主题变量
│   ├── components/          # 公共组件
│   │   └── SliderCaptcha.vue # 滑块验证码
│   ├── layouts/             # 布局组件
│   │   └── AdminLayout.vue # 统一布局
│   ├── router/              # 路由配置
│   │   └── index.ts        # 路由定义
│   ├── stores/              # 状态管理
│   │   ├── user.ts         # 用户状态
│   │   └── theme.ts        # 主题状态
│   ├── views/               # 页面视图
│   │   ├── HomeView.vue    # 首页
│   │   ├── LoginView.vue   # 登录页
│   │   ├── UserManageView.vue # 用户管理
│   │   ├── ProductManageView.vue # 商品管理
│   │   ├── OrderManageView.vue # 订单管理
│   │   └── SystemSettingsView.vue # 系统设置
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── tests/                   # 测试文件
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 生产构建
npm run preview          # 预览构建

# 测试
npm run test:unit        # 单元测试
npm run test:e2e         # E2E 测试

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm run type-check       # 类型检查
```

---

## 🧪 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| user | 123456 | 普通用户 |
| test | test123 | 测试账号 |

---

## 📸 截图展示

### 登录页面
![登录页面](./screenshots/login.png)

### 仪表盘
![仪表盘](./screenshots/dashboard.png)

### 主题设置
![主题设置](./screenshots/theme-settings.png)

### 用户管理
![用户管理](./screenshots/users.png)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情

---

## 👥 作者

- **Your Name** - *Initial work* - [YourProfile](https://github.com/yourprofile)

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)

---

## 📞 联系方式

- 项目主页: [https://github.com/your-repo/hello](https://github.com/your-repo/hello)
- 问题反馈: [Issues](https://github.com/your-repo/hello/issues)
- 邮箱: your-email@example.com

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！**

Made with ❤️ by Your Team

</div>
