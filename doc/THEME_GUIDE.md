# 主题系统使用指南

## 📋 功能概述

本项目实现了完整的主题系统，支持：
- ✅ **8种预设主题**：亮色、暗色、蓝色、绿色、橙色、粉色、青色、深紫
- ✅ **自定义主题颜色**（主色调、次要颜色）
- ✅ **主题导入/导出**：JSON 格式配置文件
- ✅ **主题预览图生成**：自动生成 PNG 预览图
- ✅ **用户级别的主题偏好**：不同用户使用不同主题
- ✅ **自动切换主题**：根据时间自动切换亮色/暗色主题
- ✅ **主题配置持久化保存**

## 🎨 预设主题（8种）

### 1. 亮色主题 (Light) ☀️
- **主色调**: `#667eea` (紫色)
- **次要颜色**: `#764ba2` (深紫)
- **描述**: 清新明亮的紫色渐变

### 2. 暗色主题 (Dark) 🌙
- **主色调**: `#4a5568` (深灰)
- **次要颜色**: `#2d3748` (更深灰)
- **描述**: 护眼深色模式

### 3. 蓝色主题 (Blue) 💙
- **主色调**: `#1890ff` (天蓝)
- **次要颜色**: `#096dd9` (深蓝)
- **描述**: 专业的商务蓝

### 4. 绿色主题 (Green) 💚
- **主色调**: `#52c41a` (草绿)
- **次要颜色**: `#389e0d` (深绿)
- **描述**: 自然清新的绿色

### 5. 橙色主题 (Orange) 🧡
- **主色调**: `#fa8c16` (橙黄)
- **次要颜色**: `#d46b08` (深橙)
- **描述**: 活力温暖的橙色

### 6. 粉色主题 (Pink) 💗
- **主色调**: `#eb2f96` (粉红)
- **次要颜色**: `#c41d7f` (深粉)
- **描述**: 浪漫温柔的粉色

### 7. 青色主题 (Cyan) 💎
- **主色调**: `#13c2c2` (青绿)
- **次要颜色**: `#08979c` (深青)
- **描述**: 冷静清爽的青色

### 8. 深紫主题 (Purple) 💜
- **主色调**: `#722ed1` (紫色)
- **次要颜色**: `#531dab` (深紫)
- **描述**: 神秘优雅的深紫色（暗色模式）

## 🔧 使用方法

### 在系统设置页面配置

1. 登录管理后台
2. 点击左侧菜单 "系统设置"
3. 找到 "🎨 主题设置" 区域
4. **选择预设主题**：点击任意主题卡片
5. **自定义颜色**：使用颜色选择器调整
6. **主题管理**：
   - 📤 导出主题：下载 JSON 配置文件
   - 📥 导入主题：上传 JSON 文件应用主题
   - 📸 生成预览图：下载主题预览 PNG 图片
7. **自动切换**：
   - 启用"自动切换主题"开关
   - 设置亮色/暗色主题的开始时间
   - 点击"保存时间表"
8. 点击 "应用主题" 按钮

### 通过代码控制

```typescript
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// 应用预设主题
themeStore.applyPreset('blue')      // 蓝色主题
themeStore.applyPreset('green')     // 绿色主题
themeStore.applyPreset('orange')    // 橙色主题

// 自定义颜色
themeStore.setCustomColors('#ff6b6b', '#ee5a6f')

// 切换主题模式
themeStore.toggleThemeMode()

// 导出主题配置
const jsonConfig = themeStore.exportTheme()
console.log(jsonConfig)

// 导入主题配置
const success = themeStore.importTheme(jsonString)

// 生成主题预览图
const base64Image = await themeStore.generateThemePreview()

// 设置用户ID（用户级别的主题偏好）
themeStore.setUserId('user123')

// 启用自动切换主题
themeStore.toggleAutoSwitch(true)

// 设置自动切换时间
themeStore.setAutoSwitchSchedule('06:00', '18:00')
```

## 📤 主题导入/导出

### 导出主题
```typescript
// 导出为 JSON 字符串
const json = themeStore.exportTheme()

// 示例输出：
{
  "name": "My Custom Theme",
  "mode": "light",
  "primaryColor": "#667eea",
  "secondaryColor": "#764ba2",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "version": "1.0"
}
```

### 导入主题
```typescript
// 从 JSON 字符串导入
const jsonString = '{"mode":"dark","primaryColor":"#4a5568",...}'
const success = themeStore.importTheme(jsonString)

if (success) {
  console.log('主题导入成功')
} else {
  console.log('导入失败')
}
```

## 📸 主题预览图生成

```typescript
// 生成 base64 格式的 PNG 图片
const base64 = await themeStore.generateThemePreview()

// 可以在 img 标签中使用
<img :src="base64" alt="主题预览" />

// 或下载为文件
const a = document.createElement('a')
a.href = base64
a.download = 'theme-preview.png'
a.click()
```

## 👥 用户级别的主题偏好

```typescript
// 为不同用户设置独立的主题
themeStore.setUserId('admin')     // 管理员主题
themeStore.setUserId('user001')   // 用户001的主题
themeStore.setUserId('user002')   // 用户002的主题

// 每个用户的主题配置会分别保存在 localStorage 中：
// - themeConfig_admin
// - themeConfig_user001
// - themeConfig_user002
```

## ⏰ 自动切换主题

### 启用自动切换
```typescript
// 启用自动切换
themeStore.toggleAutoSwitch(true)

// 设置时间表（24小时制）
themeStore.setAutoSwitchSchedule(
  '06:00',  // 早上6点切换到亮色主题
  '18:00'   // 晚上6点切换到暗色主题
)
```

### 工作原理
- 每分钟检查一次当前时间
- 根据设定的时间自动切换亮色/暗色主题
- 跨天支持（例如：18:00 - 06:00）
- 页面刷新后继续保持自动切换

### 示例场景
```
场景1：工作日模式
- 06:00 - 18:00：亮色主题（工作时使用明亮主题）
- 18:00 - 06:00：暗色主题（晚上护眼模式）

场景2：夜班模式
- 20:00 - 08:00：亮色主题（夜班工作）
- 08:00 - 20:00：暗色主题（白天休息）
```

## 🎯 CSS 变量

主题系统使用以下 CSS 变量：

```css
:root {
  --primary-color: #667eea;      /* 主色调 */
  --secondary-color: #764ba2;    /* 次要颜色 */
  --bg-color: #f5f7fa;           /* 背景色 */
  --text-color: #333;            /* 文字颜色 */
  --card-bg: #ffffff;            /* 卡片背景 */
  --border-color: #e8e8e8;       /* 边框颜色 */
  --sidebar-bg: linear-gradient(...); /* 侧边栏背景 */
  --header-bg: #ffffff;          /* 顶部导航背景 */
}
```

### 在组件中使用

```vue
<style scoped>
.my-component {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.button {
  background: linear-gradient(135deg, 
    var(--primary-color) 0%, 
    var(--secondary-color) 100%);
}
</style>
```

## 💾 数据存储

### 默认存储
```javascript
localStorage.setItem('themeConfig', JSON.stringify({
  mode: "light",
  primaryColor: "#667eea",
  secondaryColor: "#764ba2",
  autoSwitchEnabled: false,
  autoSwitchSchedule: {
    lightStart: "06:00",
    darkStart: "18:00"
  }
}))
```

### 用户级别存储
```javascript
// 当设置了 userId 后
localStorage.setItem('themeConfig_user123', JSON.stringify({...}))
```

页面刷新后会自动恢复上次的主题设置。

## 🌟 特性说明

### 1. 实时预览
- 切换预设主题时立即生效
- 修改颜色时实时更新 CSS 变量
- 所有变化即时反映到界面

### 2. 全局应用
- 所有页面和组件自动应用主题
- 包括侧边栏、顶部导航、内容区域等
- 无缝集成到整个应用

### 3. 平滑过渡
- 主题切换时有 0.3s 的过渡动画
- 避免突兀的颜色变化
- 提升用户体验

### 4. 响应式支持
- 移动端和桌面端都完美支持
- 自适应不同屏幕尺寸
- 预设主题网格自动调整布局

### 5. 智能自动切换
- 基于系统时间自动切换
- 支持跨天时间段设置
- 后台定时检查，无需手动操作

## 📝 扩展示例

### 添加新的预设主题

在 `src/stores/theme.ts` 中添加：

```typescript
const presets: Record<string, ThemePreset> = {
  // ... 现有主题
  
  // 新增红色主题
  red: {
    mode: 'light' as const,
    primaryColor: '#f5222d',
    secondaryColor: '#cf1322',
    name: '红色主题',
    description: '热情奔放的红色'
  }
}
```

### 在组件中监听主题变化

```typescript
import { watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

watch(() => themeStore.themeMode, (newMode) => {
  console.log('主题已切换为:', newMode)
  // 执行自定义逻辑
})

watch([
  () => themeStore.primaryColor,
  () => themeStore.secondaryColor
], ([primary, secondary]) => {
  console.log('颜色已更新:', primary, secondary)
})
```

### 批量导入多个主题

```typescript
// 从服务器获取主题配置列表
const themes = await fetch('/api/themes').then(r => r.json())

// 逐个导入
themes.forEach(themeJson => {
  themeStore.importTheme(JSON.stringify(themeJson))
})
```

## 🐛 常见问题

### Q: 主题切换后某些组件颜色没变？
A: 确保组件使用了 CSS 变量而不是硬编码颜色值。

### Q: 如何重置为主题默认值？
A: 在系统设置页面点击"重置为默认配置"按钮，或直接清除 localStorage。

### Q: 主题配置保存在哪里？
A: 保存在浏览器的 localStorage 中，键名为 `themeConfig` 或 `themeConfig_{userId}`。

### Q: 自动切换不生效？
A: 检查：
1. 是否启用了自动切换开关
2. 时间格式是否正确（HH:mm）
3. 浏览器是否在后台运行（部分浏览器会限制后台定时器）

### Q: 如何为不同角色设置默认主题？
A: 在用户登录后调用 `setUserId()` 方法：
```typescript
// 用户登录后
themeStore.setUserId(user.id)
themeStore.loadTheme(user.id)
```

## 🚀 最佳实践

1. **始终使用 CSS 变量** - 不要在样式中硬编码颜色值
2. **提供视觉反馈** - 主题切换时显示加载状态或提示
3. **测试所有预设主题** - 确保在每个主题下都可读
4. **考虑无障碍性** - 确保颜色对比度符合 WCAG 标准
5. **保持一致性** - 整个应用使用统一的主题系统
6. **合理使用自动切换** - 根据用户作息习惯设置合理的时间
7. **定期备份主题配置** - 使用导出功能保存喜欢的主题

## 📦 相关文件

- `src/stores/theme.ts` - 主题管理 Store（核心逻辑）
- `src/assets/theme.css` - 全局主题样式（CSS 变量定义）
- `src/views/SystemSettingsView.vue` - 主题设置页面（UI 界面）
- `src/layouts/AdminLayout.vue` - 布局组件（应用主题）
- `src/main.ts` - 主题初始化
- `THEME_GUIDE.md` - 本文档

## 🎉 更新日志

### v2.0.0 (2024-01-01)
- ✨ 新增 6 种预设主题（共8种）
- ✨ 主题导入/导出功能
- ✨ 主题预览图生成
- ✨ 用户级别的主题偏好
- ✨ 自动切换主题功能
- 🎨 优化主题选择器 UI
- 📱 改进移动端响应式布局

### v1.0.0 (2024-01-01)
- ✨ 初始版本
- ✨ 亮色/暗色主题切换
- ✨ 自定义主题颜色
- ✨ 主题配置持久化

---

**最后更新**: 2024-01-01  
**版本**: 2.0.0  
**维护者**: 开发团队