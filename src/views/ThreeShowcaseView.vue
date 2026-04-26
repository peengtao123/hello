<template>
  <div class="three-showcase">
    <div class="page-header">
      <h1>Three.js 3D 功能展示</h1>
      <p>探索 WebGL 的强大 3D 渲染能力</p>
    </div>

    <div class="demo-grid">
      <!-- 基础几何体演示 -->
      <div class="demo-card" @click="goToDemo('basic')">
        <div class="card-icon">🎲</div>
        <h3>基础几何体</h3>
        <p>立方体、球体、圆环等多种几何形状</p>
        <div class="card-features">
          <span>✓ 交互式控制</span>
          <span>✓ 动态材质</span>
          <span>✓ 光影效果</span>
        </div>
      </div>

      <!-- 粒子系统演示 -->
      <div class="demo-card" @click="goToDemo('particles')">
        <div class="card-icon">✨</div>
        <h3>粒子系统</h3>
        <p>数千个粒子的动态视觉效果</p>
        <div class="card-features">
          <span>✓ 实时渲染</span>
          <span>✓ 颜色渐变</span>
          <span>✓ 动画效果</span>
        </div>
      </div>

      <!-- 加载模型演示（预留） -->
      <div class="demo-card coming-soon">
        <div class="card-icon">📦</div>
        <h3>3D 模型加载</h3>
        <p>导入和展示外部 3D 模型文件</p>
        <div class="card-features">
          <span>○ GLTF/GLB</span>
          <span>○ OBJ/MTL</span>
          <span>○ FBX</span>
        </div>
        <div class="badge">即将推出</div>
      </div>

      <!-- 物理引擎演示（预留） -->
      <div class="demo-card coming-soon">
        <div class="card-icon">⚡</div>
        <h3>物理模拟</h3>
        <p>真实的物理碰撞和运动效果</p>
        <div class="card-features">
          <span>○ 重力模拟</span>
          <span>○ 碰撞检测</span>
          <span>○ 刚体动力学</span>
        </div>
        <div class="badge">即将推出</div>
      </div>
    </div>

    <div class="tech-info">
      <h2>技术特性</h2>
      <div class="info-grid">
        <div class="info-item">
          <h4>🚀 高性能渲染</h4>
          <p>基于 WebGL 的硬件加速，流畅渲染复杂 3D 场景</p>
        </div>
        <div class="info-item">
          <h4>🎨 丰富的材质系统</h4>
          <p>支持 Phong、PBR、Standard 等多种材质类型</p>
        </div>
        <div class="info-item">
          <h4>💡 真实光照</h4>
          <p>环境光、方向光、点光源等多种光源类型</p>
        </div>
        <div class="info-item">
          <h4>🎮 交互控制</h4>
          <p>支持鼠标和触摸设备的 3D 场景交互</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToDemo(type: string) {
  if (type === 'basic') {
    router.push('/three-demo')
  } else if (type === 'particles') {
    router.push('/particle-demo')
  }
}
</script>

<style scoped>
.three-showcase {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
  font-weight: 700;
}

.page-header p {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.demo-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.demo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.demo-card.coming-soon {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-card.coming-soon:hover {
  transform: none;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.demo-card h3 {
  margin: 0 0 10px 0;
  font-size: 22px;
  color: #333;
}

.demo-card p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-features span {
  padding: 5px 12px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
}

.badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tech-info {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tech-info h2 {
  margin: 0 0 30px 0;
  font-size: 28px;
  color: #333;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.info-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.info-item h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.info-item p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 28px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
