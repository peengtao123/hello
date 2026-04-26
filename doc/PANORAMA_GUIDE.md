# Three.js 全景看房功能集成指南

## 📦 概述

本项目已成功集成 Three.js 全景看房功能，提供沉浸式的 360° VR 看房体验。

## 🚀 快速开始

### 1. 访问全景看房

启动项目后，在管理后台左侧菜单中找到 **技术学习 > 全景看房**，即可进入全景看房演示页面。

### 2. 主要功能

- **360° 全景浏览**: 沉浸式全景图查看体验
- **多场景切换**: 客厅、卧室、厨房等多个房间场景
- **热点标记导航**: 点击红色热点跳转到其他房间
- **自动旋转模式**: 一键开启/关闭自动浏览
- **交互式控制**: 鼠标拖拽旋转、滚轮缩放
- **降级方案**: 图片加载失败时显示渐变色背景

## 🛠️ 技术实现

### 核心技术

1. **球体贴图技术**
   - 使用 `THREE.SphereGeometry` 创建球体作为全景容器
   - 将全景图片作为材质贴图应用到球体内表面
   - 通过反转法线（`geometry.scale(-1, 1, 1)`）使贴图显示在内部

2. **热点交互系统（Raycaster 射线检测）**
   ```typescript
   // 监听画布点击事件
   canvasRef.value.addEventListener('click', handleCanvasClick)
   
   // 计算鼠标位置的标准化设备坐标
   const mouse = new THREE.Vector2(
     ((event.clientX - rect.left) / rect.width) * 2 - 1,
     -((event.clientY - rect.top) / rect.height) * 2 + 1
   )
   
   // 创建射线并检测交叉点
   const raycaster = new THREE.Raycaster()
   raycaster.setFromCamera(mouse, camera)
   const intersects = raycaster.intersectObjects(scene.children, true)
   
   // 查找热点标记并触发场景切换
   for (const intersect of intersects) {
     if (intersect.object.userData?.type === 'hotspot') {
       switchScene(intersect.object.userData.targetSceneId)
     }
   }
   ```

3. **纹理加载优化**
   ```typescript
   const textureLoader = new THREE.TextureLoader()
   textureLoader.crossOrigin = 'anonymous' // 支持跨域加载
   textureLoader.load(imageUrl, resolve, undefined, reject)
   ```

4. **错误处理与降级**
   - 图片加载失败时自动切换到渐变色背景
   - 每个场景有不同的渐变配色
   - 友好的用户提示

### 场景配置

```typescript
interface PanoramaScene {
  id: string              // 场景ID
  name: string            // 场景名称
  description: string     // 场景描述
  imageUrl: string        // 全景图URL
  hotspots?: Array<{      // 热点标记
    position: THREE.Vector3
    targetSceneId: string
    label: string
  }>
}
```

## 🌐 图片资源说明

### 推荐图片源

本项目使用 **Unsplash** 作为图片源，原因：
- ✅ 免费高质量图片
- ✅ 无防盗链限制
- ✅ 支持跨域访问
- ✅ 稳定的 CDN 服务

### 可用的全景图资源

1. **Unsplash** (推荐)
   - URL: `https://images.unsplash.com/photo-{ID}?w=1920&q=80`
   - 优点：稳定、免费、高质量

2. **Pexels**
   - URL: `https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg`
   - 优点：免费、无需 API Key

3. **本地图片**
   - 路径: `/public/panoramas/xxx.jpg`
   - 优点：完全可控、加载速度快

### ⚠️ 避免使用的图片源

- ❌ Pixabay CDN (`cdn.pixabay.com`) - 有防盗链保护，会返回 403 错误
- ❌ 需要 Referer 验证的图片源
- ❌ 不稳定的第三方图床

## 🎮 交互控制说明

### OrbitControls 配置

本项目使用 Three.js 的 `OrbitControls` 实现流畅的相机控制：

```typescript
const controls = new OrbitControls(camera, renderer.domElement)

// 启用所有交互功能
controls.enableZoom = true           // ✅ 滚轮缩放
controls.enableRotate = true         // ✅ 左键旋转
controls.enablePan = true            // ✅ 右键平移

// 平滑动画效果
controls.enableDamping = true
controls.dampingFactor = 0.05

// 距离限制
controls.minDistance = 0.1
controls.maxDistance = 50

// 视角范围（允许查看上下360度）
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI

// 控制灵敏度
controls.rotateSpeed = 0.5
controls.zoomSpeed = 0.8
controls.panSpeed = 0.8
```

### 鼠标操作指南

| 操作 | 功能 | 说明 |
|------|------|------|
| 🖱️ **左键拖拽** | 旋转视角 | 360° 环顾四周 |
| 🖱️ **右键拖拽** | 平移视角 | 移动观察位置 |
| 🖱️ **滚轮滚动** | 缩放视图 | 拉近/拉远视野 |
| 📍 **点击热点** | 场景切换 | 跳转到其他房间 |

### 常见问题

**Q: 滚轮缩放没反应？**  
A: 确保 `enableZoom = true`，并且浏览器没有禁用滚轮事件。

**Q: 右键平移没反应？**  
A: 确保 `enablePan = true`。在全景场景中，平移可以改变观察中心点。

**Q: 控制太灵敏或太迟钝？**  
A: 调整 `rotateSpeed`、`zoomSpeed`、`panSpeed` 参数（0.1-2.0 之间）。

## 💡 最佳实践

### 1. 图片选择建议

- **分辨率**: 建议使用 1920x1080 或更高的等距投影全景图
- **格式**: JPG（压缩比好）或 PNG（质量高）
- **文件大小**: 控制在 2MB 以内以保证加载速度
- **纵横比**: 2:1 的全景图效果最佳

### 2. 性能优化

```typescript
// 设置合适的几何体分段数（平衡性能和画质）
const geometry = new THREE.SphereGeometry(500, 60, 40)

// 启用纹理压缩（如果浏览器支持）
texture.minFilter = THREE.LinearFilter
texture.magFilter = THREE.LinearFilter
```

### 3. 用户体验

- **加载状态**: 显示加载动画和进度提示
- **错误处理**: 提供清晰的错误信息和降级方案
- **操作引导**: 在界面中显示操作说明
- **响应式设计**: 适配不同屏幕尺寸

## 🔧 自定义配置

### 添加新场景

```typescript
const scenes: PanoramaScene[] = [
  // ... 现有场景
  {
    id: 'bathroom',
    name: '卫生间',
    description: '现代化干湿分离设计',
    imageUrl: 'https://images.unsplash.com/photo-xxx?w=1920&q=80',
    hotspots: [
      {
        position: new THREE.Vector3(0, 0, 5),
        targetSceneId: 'living-room',
        label: '← 返回客厅'
      }
    ]
  }
]
```

### 调整热点位置

热点位置使用三维坐标 `(x, y, z)`，范围建议在 ±10 之间：
- `x`: 左右方向（正右负左）
- `y`: 上下方向（正上负下）
- `z`: 前后方向（正前负后）

### 修改渐变配色

在 `createFallbackBackground()` 函数中修改：

```typescript
const gradients: Record<string, [string, string]> = {
  'living-room': ['#ff9a9e', '#fecfef'],  // 粉色系
  'bedroom': ['#a18cd1', '#fbc2eb'],      // 紫色系
  'kitchen': ['#fad0c4', '#ffd1ff']       // 橙色系
}
```

## 🐛 常见问题

### Q1: 图片加载失败（403 Forbidden）

**原因**: 图片源有防盗链保护

**解决方案**:
1. 更换为 Unsplash 或 Pexels 等无防盗链的图片源
2. 使用本地图片资源
3. 配置代理服务器绕过防盗链

### Q2: 图片显示黑色或空白

**原因**: 
- 图片 URL 错误
- 跨域问题未解决
- 图片格式不支持

**解决方案**:
1. 检查图片 URL 是否正确
2. 设置 `textureLoader.crossOrigin = 'anonymous'`
3. 确保图片是 JPG/PNG 格式

### Q3: 全景图变形严重

**原因**: 图片不是标准的等距投影全景图

**解决方案**:
1. 使用专业的全景图拍摄设备
2. 使用全景图拼接软件生成标准全景图
3. 调整相机 FOV 参数

### Q4: 性能卡顿

**解决方案**:
1. 降低球体分段数：`new THREE.SphereGeometry(500, 40, 30)`
2. 压缩图片文件大小
3. 关闭不必要的特效

## 📚 扩展功能

可以添加的功能：
- 🎵 背景音乐或环境音效
- 📐 测量工具（距离、面积）
- 💬 语音导览
- 🌙 日夜模式切换
- 📱 VR 设备支持（WebXR）
- 🏷️ 物品标签和信息展示
- 🎯 更多交互热点

## 🎉 总结

Three.js 全景看房功能为用户提供沉浸式的 VR 看房体验，适用于：
- 🏠 房地产展示
- 🏨 酒店客房预览
- ✈️ 旅游景点虚拟游览
- 🏢 商业空间展示
- 🎓 教育培训场景

---

**祝你使用愉快！** 🚀
