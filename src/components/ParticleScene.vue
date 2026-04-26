<template>
  <div class="particle-scene-container">
    <canvas ref="canvasRef"></canvas>
    <div class="controls-overlay">
      <h3>粒子系统演示</h3>
      <div class="control-group">
        <label>粒子数量: {{ particleCount }}</label>
        <input 
          type="range" 
          min="1000" 
          max="10000" 
          step="500" 
          v-model.number="particleCount"
          @change="updateParticles"
        />
      </div>
      <div class="control-group">
        <label>粒子大小: {{ particleSize.toFixed(1) }}</label>
        <input 
          type="range" 
          min="0.5" 
          max="3" 
          step="0.1" 
          v-model.number="particleSize"
          @change="updateParticleSize"
        />
      </div>
      <button @click="toggleAnimation">{{ isAnimating ? '暂停' : '播放' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particles: THREE.Points
let animationId: number
const isAnimating = ref(true)
const particleCount = ref(5000)
const particleSize = ref(1.5)

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
  scene.background = new THREE.Color(0x000011)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 50

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 创建粒子系统
  createParticles()

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

function createParticles() {
  // 移除旧粒子
  if (particles) {
    scene.remove(particles)
    particles.geometry.dispose()
    ;(particles.material as THREE.Material).dispose()
  }

  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount.value * 3)
  const colors = new Float32Array(particleCount.value * 3)

  const color1 = new THREE.Color(0x00ffff)
  const color2 = new THREE.Color(0xff00ff)

  for (let i = 0; i < particleCount.value; i++) {
    // 随机位置（球形分布）
    const radius = 20 + Math.random() * 10
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // 渐变色
    const mixedColor = color1.clone().lerp(color2, Math.random())
    colors[i * 3] = mixedColor.r
    colors[i * 3 + 1] = mixedColor.g
    colors[i * 3 + 2] = mixedColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: particleSize.value,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  if (isAnimating.value && particles) {
    particles.rotation.x += 0.001
    particles.rotation.y += 0.002

    // 让粒子轻微脉动
    const time = Date.now() * 0.001
    particles.scale.setScalar(1 + Math.sin(time) * 0.1)
  }

  renderer.render(scene, camera)
}

function updateParticles() {
  createParticles()
}

function updateParticleSize() {
  if (particles && particles.material) {
    ;(particles.material as THREE.PointsMaterial).size = particleSize.value
  }
}

function toggleAnimation() {
  isAnimating.value = !isAnimating.value
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function cleanup() {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  
  if (renderer) {
    renderer.dispose()
  }
  if (scene) {
    scene.clear()
  }
}
</script>

<style scoped>
.particle-scene-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.controls-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  color: white;
  backdrop-filter: blur(10px);
  min-width: 250px;
}

.controls-overlay h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
}

.control-group input[type="range"] {
  width: 100%;
  cursor: pointer;
}

button {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
}
</style>
