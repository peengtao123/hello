# Three.js 3D 功能集成指南

## 📦 概述

本项目已成功集成 Three.js，提供了强大的 WebGL 3D 渲染能力。你可以创建交互式的 3D 场景、粒子系统、模型展示等丰富的视觉效果。

## 🚀 快速开始

### 1. 访问 3D 演示

启动项目后，在管理后台左侧菜单中找到 **技术学习 > 3D 可视化**，即可进入 3D 功能展示页面。

### 2. 主要功能

- **基础几何体演示**: 立方体、球体、圆环、圆锥等多种几何形状
- **交互式控制**: 支持鼠标旋转、平移、缩放
- **动态材质切换**: 实体/线框模式、颜色更换
- **粒子系统**: 数千个粒子的动态视觉效果
- **光影效果**: 环境光、方向光、点光源

## 📁 文件结构

```
src/
├── components/
│   ├── ThreeScene.vue          # 基础 3D 场景组件
│   └── ParticleScene.vue       # 粒子系统组件
├── views/
│   ├── ThreeDemoView.vue       # 交互式 3D 演示页面
│   └── ThreeShowcaseView.vue   # 3D 功能展示导航页
└── router/
    └── index.ts                # 路由配置（已添加 3D 相关路由）
```

## 💡 使用示例

### 创建简单的 3D 场景

```vue
<template>
  <div class="my-scene">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  // 创建场景
  const scene = new THREE.Scene()
  
  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 5
  
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  // 创建立方体
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  
  // 动画循环
  function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()
})
</script>
```

### 添加轨道控制器

```typescript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 在初始化场景中
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
```

### 加载外部模型

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
loader.load(
  '/models/model.glb',
  (gltf) => {
    scene.add(gltf.scene)
  },
  (progress) => {
    console.log('加载进度:', progress.loaded / progress.total)
  },
  (error) => {
    console.error('加载失败:', error)
  }
)
```

## 🎨 常用几何体

```typescript
// 立方体
new THREE.BoxGeometry(width, height, depth)

// 球体
new THREE.SphereGeometry(radius, widthSegments, heightSegments)

// 圆环
new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)

// 圆锥
new THREE.ConeGeometry(radius, height, radialSegments)

// 圆柱
new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
```

## 💡 常用材质

```typescript
// 基础材质（不受光照影响）
new THREE.MeshBasicMaterial({ color: 0xffffff })

// Phong 材质（受光照影响，有高光）
new THREE.MeshPhongMaterial({ 
  color: 0xffffff,
  shininess: 100
})

// Standard 材质（PBR 物理渲染）
new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.5,
  roughness: 0.5
})

// 线框模式
new THREE.MeshBasicMaterial({ 
  color: 0xffffff,
  wireframe: true
})
```

## 🔦 光源类型

```typescript
// 环境光（均匀照亮整个场景）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)

// 方向光（类似太阳光）
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 10, 5)

// 点光源（从一点向四周发光）
const pointLight = new THREE.PointLight(0xffffff, 1, 100)
pointLight.position.set(0, 5, 0)

// 聚光灯（锥形光束）
const spotLight = new THREE.SpotLight(0xffffff, 1)
spotLight.position.set(0, 10, 0)
```

## 🎯 最佳实践

### 1. 资源清理

在组件卸载时务必清理 Three.js 资源，避免内存泄漏：

```typescript
onBeforeUnmount(() => {
  // 取消动画
  cancelAnimationFrame(animationId)
  
  // 清理事件监听
  window.removeEventListener('resize', handleResize)
  
  // 释放渲染器
  if (renderer) {
    renderer.dispose()
  }
  
  // 清理场景
  if (scene) {
    scene.clear()
  }
  
  // 清理控制器
  if (controls) {
    controls.dispose()
  }
})
```

### 2. 性能优化

- 使用 `requestAnimationFrame` 进行动画循环
- 合理控制几何体的分段数（segments）
- 使用纹理压缩和合适的纹理尺寸
- 启用阴影贴图时注意分辨率设置
- 对于大量相同对象，使用 `InstancedMesh`

### 3. 响应式设计

```typescript
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', handleResize)
```

## 📚 学习资源

- [Three.js 官方文档](https://threejs.org/docs/)
- [Three.js 示例](https://threejs.org/examples/)
- [Three.js Fundamentals](https://threejsfundamentals.org/)
- [Discover Three.js](https://discoverthreejs.com/)

## 🔧 扩展功能

### 添加物理引擎

```bash
npm install cannon-es
```

### 添加后期处理效果

```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js'
```

### 添加粒子系统库

```bash
npm install three-nebula
```

## 🐛 常见问题

### Q: 场景显示空白？
A: 检查以下几点：
- Canvas 元素是否正确引用
- 相机位置是否合适
- 是否有光源照亮物体
- 浏览器控制台是否有错误

### Q: 性能卡顿？
A: 尝试：
- 降低几何体复杂度
- 减少光源数量
- 禁用不必要的阴影
- 使用性能监控工具分析

### Q: 模型加载失败？
A: 确保：
- 模型文件路径正确
- 服务器支持 CORS
- 文件格式正确（GLB/GLTF 推荐）

## 🎉 总结

Three.js 为 Vue 项目带来了强大的 3D 渲染能力。通过本项目的集成，你可以：

- ✅ 快速创建交互式 3D 场景
- ✅ 实现复杂的视觉效果
- ✅ 展示 3D 模型和数据
- ✅ 打造沉浸式的用户体验

开始探索 3D 世界吧！🚀
