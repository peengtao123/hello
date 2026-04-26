<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  width?: number
  height?: number
  sliderSize?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 310,
  height: 155,
  sliderSize: 40,
  disabled: false,
})

const emit = defineEmits<{
  success: []
  fail: []
  refresh: []
}>()

// 滑块位置
const sliderPosition = ref(0)
// 缺口位置（随机生成）
const gapPosition = ref(0)
// 是否验证成功
const isSuccess = ref(false)
// 是否验证失败
const isFail = ref(false)
// 是否正在拖动
const isDragging = ref(false)
// 拖动起始位置
const startX = ref(0)

// 计算最大滑动距离（确保滑块可以到达容器右边缘）
const maxSliderDistance = computed(() => props.width - props.sliderSize)

// 背景图片列表（使用渐变色模拟）
const backgrounds = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

const currentBackground = ref(backgrounds[0])

/**
 * 生成随机缺口位置
 */
function generateGapPosition() {
  // 缺口位置在滑块的可滑动范围内，留出一定边距
  const minPos = Math.floor(props.width * 0.25)
  const maxPos = Math.floor(props.width * 0.75)
  gapPosition.value = Math.floor(Math.random() * (maxPos - minPos)) + minPos
}

/**
 * 刷新验证码
 */
function refresh() {
  sliderPosition.value = 0
  isSuccess.value = false
  isFail.value = false
  // 随机选择背景
  currentBackground.value = backgrounds[Math.floor(Math.random() * backgrounds.length)]
  generateGapPosition()
  emit('refresh')
}

/**
 * 开始拖动
 */
function handleMouseDown(event: MouseEvent) {
  if (props.disabled || isSuccess.value) return
  
  isDragging.value = true
  startX.value = event.clientX
  event.preventDefault()
  
  // 添加全局事件监听
  document.addEventListener('mousemove', handleGlobalMouseMove)
  document.addEventListener('mouseup', handleGlobalMouseUp)
}

/**
 * 全局拖动中
 */
function handleGlobalMouseMove(event: MouseEvent) {
  if (!isDragging.value || props.disabled || isSuccess.value) return
  
  const deltaX = event.clientX - startX.value
  const newPosition = Math.max(0, Math.min(deltaX, maxSliderDistance.value))
  sliderPosition.value = newPosition
}

/**
 * 全局结束拖动
 */
function handleGlobalMouseUp() {
  if (!isDragging.value || props.disabled) return
  
  isDragging.value = false
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
  
  // 验证：允许一定的误差范围（±5像素）
  const tolerance = 5
  const distance = Math.abs(sliderPosition.value - gapPosition.value)
  
  if (distance <= tolerance) {
    // 验证成功
    isSuccess.value = true
    isFail.value = false
    emit('success')
  } else {
    // 验证失败
    isFail.value = true
    isSuccess.value = false
    
    // 延迟后重置
    setTimeout(() => {
      sliderPosition.value = 0
      isFail.value = false
      emit('fail')
    }, 800)
  }
}

/**
 * 触摸事件处理
 */
function handleTouchStart(event: TouchEvent) {
  if (props.disabled || isSuccess.value) return
  
  isDragging.value = true
  startX.value = event.touches[0]?.clientX ?? 0
  event.preventDefault()
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value || props.disabled || isSuccess.value) return
  
  const deltaX = (event.touches[0]?.clientX ?? 0) - startX.value
  const newPosition = Math.max(0, Math.min(deltaX, maxSliderDistance.value))
  sliderPosition.value = newPosition
  event.preventDefault()
}

function handleTouchEnd() {
  handleGlobalMouseUp()
}

// 组件挂载时生成缺口位置
onMounted(() => {
  generateGapPosition()
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)
})

// 暴露刷新方法给父组件
defineExpose({
  refresh,
})
</script>

<template>
  <div class="slider-captcha" :class="{ 'is-disabled': disabled }">
    <!-- 验证区域 -->
    <div 
      class="captcha-container"
      :style="{ width: `${width}px`, height: `${height}px` }"
    >
      <!-- 背景图 -->
      <div 
        class="captcha-background"
        :style="{ background: currentBackground }"
      >
        <!-- 缺口目标 -->
        <div 
          class="gap-target"
          :style="{ 
            left: `${gapPosition}px`,
            width: `${sliderSize}px`,
            height: `${sliderSize}px`
          }"
        >
          <div class="gap-inner"></div>
        </div>
        
        <!-- 滑块碎片（可拖动部分） -->
        <div 
          class="slider-piece"
          :class="{ 
            'is-dragging': isDragging,
            'is-success': isSuccess,
            'is-fail': isFail
          }"
          :style="{ 
            left: `${sliderPosition}px`,
            width: `${sliderSize}px`,
            height: `${sliderSize}px`
          }"
        >
          <div class="piece-inner">
            <span v-if="!isSuccess" class="piece-icon">→</span>
            <span v-else class="piece-icon success">✓</span>
          </div>
        </div>
        
        <!-- 提示文字 -->
        <div v-if="!isSuccess && !isFail" class="captcha-tip">
          请拖动滑块完成拼图
        </div>
        <div v-else-if="isSuccess" class="captcha-tip success">
          ✓ 验证成功
        </div>
        <div v-else-if="isFail" class="captcha-tip fail">
          ✗ 验证失败，请重试
        </div>
      </div>
      
      <!-- 刷新按钮 -->
      <button 
        class="refresh-btn"
        @click="refresh"
        :disabled="disabled"
        title="刷新验证码"
      >
        ↻
      </button>
    </div>
    
    <!-- 滑块轨道 -->
    <div 
      class="slider-track"
      :class="{ 
        'dragging': isDragging,
        'success': isSuccess,
        'fail': isFail
      }"
      :style="{ width: `${width}px` }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 进度条 -->
      <div 
        class="slider-progress"
        :style="{ width: `${sliderPosition}px` }"
      ></div>
      
      <!-- 滑块控制器 -->
      <div 
        class="slider-button"
        :class="{ 
          'is-dragging': isDragging,
          'is-success': isSuccess,
          'is-fail': isFail
        }"
        :style="{ 
          left: `${sliderPosition}px`,
          width: `${sliderSize}px`,
          height: `${sliderSize}px`
        }"
      >
        <span v-if="!isSuccess" class="slider-icon">→</span>
        <span v-else class="slider-icon success">✓</span>
      </div>
      
      <!-- 提示文字 -->
      <div class="slider-text">
        <span v-if="!isSuccess && !isFail">向右拖动滑块填充拼图</span>
        <span v-else-if="isSuccess" class="success-text">验证通过</span>
        <span v-else class="fail-text">验证失败</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slider-captcha {
  display: flex;
  flex-direction: column;
  gap: 12px;
  user-select: none;
}

.slider-captcha.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.captcha-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #f0f0f0;
}

.captcha-background {
  width: 100%;
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
}

.gap-target {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  border: 2px dashed rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  box-shadow: 
    inset 0 0 15px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(255, 255, 255, 0.2);
  z-index: 3;
}

.gap-inner {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  backdrop-filter: blur(2px);
}

.slider-piece {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.9) 100%);
  border: 2px solid #667eea;
  border-radius: 4px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(102, 126, 234, 0.2);
  cursor: grab;
  z-index: 10;
  transition: all 0.2s ease;
  overflow: hidden;
  backdrop-filter: blur(2px);
}

.slider-piece::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0.5;
}

.slider-piece:hover {
  border-color: #764ba2;
  box-shadow: 
    0 6px 16px rgba(102, 126, 234, 0.5),
    inset 0 0 20px rgba(102, 126, 234, 0.3);
  transform: translateY(-50%) scale(1.05);
}

.slider-piece.is-dragging {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 
    0 8px 20px rgba(102, 126, 234, 0.6),
    inset 0 0 20px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.slider-piece.is-success {
  border-color: #52c41a;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.95) 0%, rgba(115, 209, 61, 0.9) 100%);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
}

.slider-piece.is-fail {
  border-color: #ff4d4f;
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.95) 0%, rgba(255, 120, 117, 0.9) 100%);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateY(-50%) translateX(0); }
  25% { transform: translateY(-50%) translateX(-5px); }
  75% { transform: translateY(-50%) translateX(5px); }
}

.piece-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.piece-icon {
  font-size: 18px;
  color: #667eea;
  font-weight: bold;
}

.piece-icon.success {
  color: white;
  font-size: 20px;
}

.captcha-tip {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 14px;
  border-radius: 16px;
  backdrop-filter: blur(4px);
  z-index: 5;
}

.captcha-tip.success {
  background: rgba(82, 196, 26, 0.8);
}

.captcha-tip.fail {
  background: rgba(255, 77, 79, 0.8);
}

.refresh-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.refresh-btn:hover:not(:disabled) {
  background: white;
  transform: rotate(180deg);
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.slider-track {
  position: relative;
  height: 40px;
  background: #f5f5f5;
  border-radius: 20px;
  border: 2px solid #d9d9d9;
  cursor: pointer;
  overflow: visible;
  transition: all 0.3s ease;
}

.slider-track:hover {
  border-color: #667eea;
  background: #fafafa;
}

.slider-track.dragging {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.slider-track.success {
  border-color: #52c41a;
  background: #f6ffed;
}

.slider-track.fail {
  border-color: #ff4d4f;
  background: #fff1f0;
}

.slider-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  transition: width 0.1s ease;
  opacity: 0.3;
}

.slider-track.success .slider-progress {
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  opacity: 0.5;
}

.slider-track.fail .slider-progress {
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
  opacity: 0.5;
}

.slider-button {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.slider-button:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.slider-button.is-dragging {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.slider-button.is-success {
  border-color: #52c41a;
  background: #f6ffed;
}

.slider-button.is-fail {
  border-color: #ff4d4f;
  background: #fff1f0;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.slider-icon {
  font-size: 18px;
  color: #999;
  transition: all 0.3s ease;
}

.slider-icon.success {
  color: #52c41a;
  font-weight: bold;
}

.slider-text {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  font-size: 12px;
  color: #999;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1;
}

.success-text {
  color: #52c41a;
  font-weight: 600;
}

.fail-text {
  color: #ff4d4f;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .captcha-tip {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .slider-text {
    font-size: 12px;
  }
}
</style>
