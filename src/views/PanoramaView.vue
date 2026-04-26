<template>
  <div class="panorama-container">
    <!-- 控制面板 -->
    <div class="controls-panel">
      <h2>🏠 全景看房演示</h2>
      
      <div class="scene-selector">
        <h3>选择场景</h3>
        <div class="scene-buttons">
          <button 
            v-for="scene in scenes" 
            :key="scene.id"
            :class="{ active: currentSceneId === scene.id }"
            @click="switchScene(scene.id)"
          >
            {{ scene.name }}
          </button>
        </div>
      </div>

      <div class="info-panel">
        <h3>当前场景</h3>
        <p><strong>{{ currentScene?.name }}</strong></p>
        <p>{{ currentScene?.description }}</p>
      </div>

      <div class="instructions">
        <h3>操作说明</h3>
        <ul>
          <li>🖱️ 左键拖拽：旋转视角</li>
          <li>🖱️ 右键拖拽：平移视角</li>
          <li>🖱️ 滚轮：缩放视图</li>
          <li>📍 点击热点：跳转场景</li>
        </ul>
      </div>

      <div class="action-buttons">
        <button @click="toggleAutoRotate" class="btn-secondary">
          {{ autoRotate ? '⏸️ 停止自动旋转' : '▶️ 开始自动旋转' }}
        </button>
        <button @click="resetView" class="btn-secondary">
          🔄 重置视角
        </button>
      </div>
    </div>

    <!-- 3D 全景画布 -->
    <div class="canvas-wrapper">
      <canvas ref="canvasRef"></canvas>
      
      <!-- 加载提示 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>正在加载全景图...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let sphere: THREE.Mesh
let controls: OrbitControls
let animationId: number
const loading = ref(false)
const autoRotate = ref(false)

// 场景数据（使用在线全景图示例）
interface PanoramaScene {
  id: string
  name: string
  description: string
  imageUrl: string
  hotspots?: Array<{
    position: THREE.Vector3
    targetSceneId: string
    label: string
  }>
}

const scenes: PanoramaScene[] = [
  {
    id: 'living-room',
    name: '客厅',
    description: '宽敞明亮的现代客厅，落地窗设计，采光极佳',
    // 使用 Unsplash 的免费图片（无防盗链）
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80',
    hotspots: [
      {
        position: new THREE.Vector3(5, 0, 0),
        targetSceneId: 'bedroom',
        label: '前往卧室 →'
      },
      {
        position: new THREE.Vector3(-5, 0, 0),
        targetSceneId: 'kitchen',
        label: '前往厨房 →'
      }
    ]
  },
  {
    id: 'bedroom',
    name: '卧室',
    description: '温馨舒适的卧室，配备现代化家具',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1920&q=80',
    hotspots: [
      {
        position: new THREE.Vector3(0, 0, -5),
        targetSceneId: 'living-room',
        label: '← 返回客厅'
      }
    ]
  },
  {
    id: 'kitchen',
    name: '厨房',
    description: '开放式现代化厨房，设备齐全',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80',
    hotspots: [
      {
        position: new THREE.Vector3(0, 0, 5),
        targetSceneId: 'living-room',
        label: '← 返回客厅'
      }
    ]
  }
]

const currentSceneId = ref('living-room')
const currentScene = computed(() => 
  scenes.find(s => s.id === currentSceneId.value)
)

onMounted(() => {
  init()
  loadPanorama(currentScene.value!.imageUrl)
  animate()
})

onBeforeUnmount(() => {
  cleanup()
})

function init() {
  if (!canvasRef.value) return

  // 创建场景
  scene = new THREE.Scene()

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    (window.innerWidth - 300) / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 0.1) // 相机在球体中心附近

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth - 300, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  
  // 启用所有交互功能
  controls.enableZoom = true           // 启用滚轮缩放
  controls.enableRotate = true         // 启用左键旋转
  controls.enablePan = true            // 启用右键平移
  
  // 设置合适的距离限制
  controls.minDistance = 0.1
  controls.maxDistance = 50
  controls.minPolarAngle = 0           // 允许查看正上方
  controls.maxPolarAngle = Math.PI     // 允许查看正下方
  
  // 平滑控制
  controls.rotateSpeed = 0.5
  controls.zoomSpeed = 0.8
  controls.panSpeed = 0.8
  
  console.log('OrbitControls 已初始化', {
    enableZoom: controls.enableZoom,
    enableRotate: controls.enableRotate,
    enablePan: controls.enablePan
  })

  // 添加 pointerdown 事件监听器（用于热点交互）
  // 注意：使用 pointerdown 而不是 click，避免与 OrbitControls 冲突
  canvasRef.value.addEventListener('pointerdown', handleCanvasClick)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

async function loadPanorama(imageUrl: string) {
  loading.value = true

  try {
    // 移除旧的球体
    if (sphere) {
      scene.remove(sphere)
      sphere.geometry.dispose()
      ;(sphere.material as THREE.Material).dispose()
    }

    // 加载纹理（设置跨域支持）
    const textureLoader = new THREE.TextureLoader()
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.crossOrigin = 'anonymous'
      textureLoader.load(
        imageUrl,
        resolve,
        undefined,
        (error) => {
          console.error('图片加载失败:', error)
          reject(error)
        }
      )
    })

    // 创建球体几何体
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    
    // 反转法线，使贴图显示在球体内侧
    geometry.scale(-1, 1, 1)

    // 创建材质
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide
    })

    // 创建球体网格
    sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // 添加热点标记
    addHotspots()

    loading.value = false
  } catch (error) {
    console.error('加载全景图失败:', error)
    loading.value = false
    
    // 降级方案：使用渐变色背景
    createFallbackBackground()
  }
}

// 降级方案：创建渐变色背景
function createFallbackBackground() {
  const geometry = new THREE.SphereGeometry(500, 60, 40)
  geometry.scale(-1, 1, 1)
  
  // 创建渐变画布作为纹理
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // 根据场景ID创建不同的渐变
    const gradients: Record<string, [string, string]> = {
      'living-room': ['#ff9a9e', '#fecfef'],
      'bedroom': ['#a18cd1', '#fbc2eb'],
      'kitchen': ['#fad0c4', '#ffd1ff']
    }
    
    const colors = gradients[currentSceneId.value] || ['#667eea', '#764ba2']
    
    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 添加文字提示
    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('全景图加载中...', canvas.width / 2, canvas.height / 2 - 30)
    ctx.font = '24px Arial'
    ctx.fillText('请检查网络连接', canvas.width / 2, canvas.height / 2 + 30)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide
  })
  
  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)
  
  // 添加热点标记
  addHotspots()
  
  // 显示警告提示
  alert(`⚠️ 全景图加载失败\n\n可能原因：\n1. 网络连接问题\n2. 图片资源不可用\n\n已切换至演示模式（渐变色背景）`)
}

function addHotspots() {
  const currentSceneData = currentScene.value
  if (!currentSceneData || !currentSceneData.hotspots) return

  currentSceneData.hotspots.forEach(hotspot => {
    // 创建热点标记（适中的红色小球）
    const hotspotGeometry = new THREE.SphereGeometry(1.5, 32, 32)
    const hotspotMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3333,  // 更亮的红色
      transparent: true,
      opacity: 0.9      // 更高的不透明度
    })
    const hotspotMesh = new THREE.Mesh(hotspotGeometry, hotspotMaterial)
    hotspotMesh.position.copy(hotspot.position)
    hotspotMesh.userData = {
      type: 'hotspot',
      targetSceneId: hotspot.targetSceneId,
      label: hotspot.label
    }
    
    // 添加外发光效果（稍大的半透明球体）
    const glowGeometry = new THREE.SphereGeometry(2.2, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6666,
      transparent: true,
      opacity: 0.25
    })
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    hotspotMesh.add(glowMesh) // 作为子对象添加到主热点
    
    scene.add(hotspotMesh)

    // 添加脉冲动画效果
    animateHotspot(hotspotMesh)
  })
}

function animateHotspot(mesh: THREE.Mesh) {
  let scale = 1
  let growing = true

  function pulse() {
    if (growing) {
      scale += 0.02
      if (scale >= 1.3) growing = false
    } else {
      scale -= 0.02
      if (scale <= 1) growing = true
    }
    mesh.scale.set(scale, scale, scale)
    requestAnimationFrame(pulse)
  }
  pulse()
}

function switchScene(sceneId: string) {
  const targetScene = scenes.find(s => s.id === sceneId)
  if (targetScene && targetScene.id !== currentSceneId.value) {
    currentSceneId.value = sceneId
    loadPanorama(targetScene.imageUrl)
  }
}

// 处理画布点击事件（射线检测）
function handleCanvasClick(event: PointerEvent) {
  if (!canvasRef.value || !camera || !scene) return

  // 计算鼠标位置的标准化设备坐标 (-1 到 +1)
  const rect = canvasRef.value.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )

  // 创建射线
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  // 检测与场景中所有对象的交叉点
  const intersects = raycaster.intersectObjects(scene.children, true)

  // 查找第一个热点标记
  for (const intersect of intersects) {
    const object = intersect.object
    if (object.userData && object.userData.type === 'hotspot') {
      // 找到热点，切换到目标场景
      const targetSceneId = object.userData.targetSceneId
      console.log('点击热点，跳转到:', targetSceneId)
      switchScene(targetSceneId)
      break
    }
  }
}

function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
  if (controls) {
    controls.autoRotate = autoRotate.value
    controls.autoRotateSpeed = 2.0
  }
}

function resetView() {
  if (camera && controls) {
    camera.position.set(0, 0, 0.1)
    controls.reset()
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function handleResize() {
  camera.aspect = (window.innerWidth - 300) / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth - 300, window.innerHeight)
}

function cleanup() {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  
  // 移除点击事件监听器
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('pointerdown', handleCanvasClick)
  }
  
  // 清理 Three.js 资源
  if (renderer) {
    renderer.dispose()
  }
  if (scene) {
    scene.clear()
  }
  if (controls) {
    controls.dispose()
  }
}
</script>

<style scoped>
.panorama-container {
  display: flex;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.controls-panel {
  width: 300px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.controls-panel h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
}

.scene-selector {
  margin-bottom: 20px;
}

.scene-selector h3 {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 16px;
}

.scene-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scene-buttons button {
  padding: 12px 20px;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scene-buttons button:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.scene-buttons button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.info-panel {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.info-panel h3 {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 16px;
}

.info-panel p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.instructions {
  margin-bottom: 20px;
  padding: 15px;
  background: #fff3cd;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.instructions h3 {
  margin: 0 0 10px 0;
  color: #856404;
  font-size: 16px;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
  color: #856404;
  font-size: 13px;
  line-height: 1.8;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-secondary {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  font-size: 16px;
  margin: 0;
}
</style>
