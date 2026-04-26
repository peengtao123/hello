<template>
  <div class="three-demo-container">
    <div class="controls">
      <h2>Three.js 3D 演示</h2>
      <div class="control-buttons">
        <button @click="changeGeometry('cube')">立方体</button>
        <button @click="changeGeometry('sphere')">球体</button>
        <button @click="changeGeometry('torus')">圆环</button>
        <button @click="changeGeometry('cone')">圆锥</button>
        <button @click="toggleWireframe">{{ wireframe ? '实体' : '线框' }}</button>
        <button @click="changeColor">更换颜色</button>
      </div>
      <div class="info">
        <p>💡 提示：使用鼠标左键旋转，右键平移，滚轮缩放</p>
      </div>
    </div>
    <div class="canvas-wrapper">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let mesh: THREE.Mesh
let controls: OrbitControls
let animationId: number
const wireframe = ref(false)

const colors = [0x00ff88, 0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa78bfa, 0xf472b6]
let colorIndex = 0

onMounted(() => {
  init()
  animate()
})

onBeforeUnmount(() => {
  cleanup()
})

function init() {
  if (!canvasRef.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)
  scene.fog = new THREE.Fog(0x1a1a2e, 5, 20)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    (window.innerWidth - 300) / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(3, 3, 5)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth - 300, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // 创建立方体（默认）
  createMesh('cube')

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 2
  controls.maxDistance = 20

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  const pointLight1 = new THREE.PointLight(0xff00ff, 0.8, 50)
  pointLight1.position.set(-5, 5, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x00ffff, 0.8, 50)
  pointLight2.position.set(5, -5, 5)
  scene.add(pointLight2)

  // 添加地面
  const planeGeometry = new THREE.PlaneGeometry(20, 20)
  const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -2
  plane.receiveShadow = true
  scene.add(plane)

  // 添加网格辅助线
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
  gridHelper.position.y = -2
  scene.add(gridHelper)

  // 添加坐标轴
  const axesHelper = new THREE.AxesHelper(3)
  scene.add(axesHelper)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

function createMesh(type: string) {
  // 移除旧模型
  if (mesh) {
    scene.remove(mesh)
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
  }

  let geometry: THREE.BufferGeometry

  switch (type) {
    case 'cube':
      geometry = new THREE.BoxGeometry(2, 2, 2)
      break
    case 'sphere':
      geometry = new THREE.SphereGeometry(1.5, 32, 32)
      break
    case 'torus':
      geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100)
      break
    case 'cone':
      geometry = new THREE.ConeGeometry(1.2, 2.5, 32)
      break
    default:
      geometry = new THREE.BoxGeometry(2, 2, 2)
  }

  const material = new THREE.MeshPhongMaterial({
    color: colors[colorIndex],
    shininess: 100,
    wireframe: wireframe.value
  })

  mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position.y = 0
  scene.add(mesh)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  // 旋转模型
  if (mesh) {
    mesh.rotation.x += 0.005
    mesh.rotation.y += 0.01
  }

  controls.update()
  renderer.render(scene, camera)
}

function changeGeometry(type: string) {
  createMesh(type)
}

function toggleWireframe() {
  wireframe.value = !wireframe.value
  if (mesh && mesh.material) {
    ;(mesh.material as THREE.MeshPhongMaterial).wireframe = wireframe.value
  }
}

function changeColor() {
  colorIndex = (colorIndex + 1) % colors.length
  if (mesh && mesh.material) {
    const material = mesh.material as THREE.MeshPhongMaterial
    const newColor = colors[colorIndex]
    if (newColor !== undefined) {
      material.color.setHex(newColor)
    }
  }
}

function handleResize() {
  camera.aspect = (window.innerWidth - 300) / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth - 300, window.innerHeight)
}

function cleanup() {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  
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
.three-demo-container {
  display: flex;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.controls {
  width: 300px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.controls h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 24px;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.control-buttons button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.control-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.control-buttons button:active {
  transform: translateY(0);
}

.info {
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.info p {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
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
</style>
