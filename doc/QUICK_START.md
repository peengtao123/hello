# 快速开始指南

## 🚀 5分钟上手

### 1. 环境准备

确保已安装：
- Node.js ^20.19.0 或 >=22.12.0
- npm（随 Node.js 安装）

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 登录系统

**测试账号**：
- 管理员：`admin` / `123456`
- 普通用户：`user` / `123456`
- 测试账号：`test` / `test123`

---

## 📚 核心功能速览

### 1️⃣ 登录与验证

- ✅ 表单验证：用户名≥3字符，密码≥6字符
- ✅ 滑块验证码：3次失败后强制验证
- ✅ Token 管理：自动保存和恢复
- ✅ 路由守卫：未登录自动跳转

### 2️⃣ 主题定制

进入 **系统设置** → **主题设置**：

- 🎨 8种预设主题一键切换
- 🌈 自定义主色调和次要色
- 📤 导出/导入主题配置
- 📸 生成主题预览图
- ⏰ 自动切换亮色/暗色主题

### 3️⃣ 页面导航

左侧菜单包含：
- 📊 仪表盘
- 👥 用户管理
- 📦 商品管理
- 📝 订单管理
- ⚙️ 系统设置

### 4️⃣ 页面缓存

- ✅ 已访问的页面会被缓存
- ✅ 切换菜单不丢失数据
- ✅ 滚动位置保持

---

## 🛠️ 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 生产构建
npm run preview          # 预览构建结果

# 测试
npm run test:unit        # 单元测试
npm run test:e2e         # E2E测试

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm run type-check       # 类型检查
```

---

## 📁 项目结构

```
src/
├── api/                 # API 接口
├── assets/              # 静态资源
├── components/          # 公共组件
├── layouts/             # 布局组件
├── router/              # 路由配置
├── stores/              # 状态管理
├── views/               # 页面视图
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

---

## 💡 快速入门示例

### 添加新页面

#### 1. 创建页面组件

```vue
<!-- src/views/NewPageView.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello, New Page!')
</script>

<template>
  <div class="new-page">
    <h1>{{ message }}</h1>
  </div>
</template>

<style scoped>
.new-page {
  padding: 20px;
}
</style>
```

#### 2. 添加路由

```typescript
// src/router/index.ts
{
  path: 'new-page',
  name: 'newPage',
  component: () => import('../views/NewPageView.vue'),
  meta: { title: '新页面' }
}
```

#### 3. 添加菜单项

```typescript
// src/layouts/AdminLayout.vue
const menus = [
  // ... 现有菜单
  { id: 'new', name: '新页面', icon: '✨', path: '/new-page' }
]
```

完成！访问 `/new-page` 即可查看新页面。

---

## 🔧 常见问题

### Q: 如何修改端口号？

编辑 `vite.config.ts`：

```typescript
export default defineConfig({
  server: {
    port: 3000  // 修改为你想要的端口
  }
})
```

### Q: 如何清除缓存？

浏览器控制台执行：

```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Q: 如何重置主题？

删除 localStorage 中的主题配置：

```javascript
localStorage.removeItem('themeConfig')
location.reload()
```

### Q: 构建后空白页？

检查 `vite.config.ts` 中的 `base` 配置：

```typescript
export default defineConfig({
  base: './'  // 使用相对路径
})
```

---

## 📖 更多资源

- 📘 [完整技术文档](./TECHNICAL_DOCUMENTATION.md)
- 🎨 [主题使用指南](./THEME_GUIDE.md)
- 🐛 [问题反馈](https://github.com/your-repo/issues)

---

**祝您使用愉快！** 🎉
