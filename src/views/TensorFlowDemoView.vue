<template>
  <div class="tensorflow-demo">
    <h2>TensorFlow.js 深度学习演示</h2>

    <!-- 状态信息 -->
    <div class="info-panel">
      <h3>系统信息</h3>
      <div class="info-item">
        <span>后端:</span>
        <strong>{{ tfInfo.backend || '未初始化' }}</strong>
      </div>
      <div class="info-item">
        <span>版本:</span>
        <strong>{{ tfInfo.version || '-' }}</strong>
      </div>
      <div class="info-item">
        <span>内存使用:</span>
        <strong>{{ memoryInfo.numTensors }} 个张量</strong>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>模型训练</h3>
      
      <div class="form-group">
        <label for="epochs">训练轮数 (Epochs):</label>
        <input
          id="epochs"
          v-model.number="epochs"
          type="number"
          min="10"
          max="200"
          step="10"
        />
      </div>

      <div class="button-group">
        <button @click="handleInit" :disabled="isInitializing">
          {{ isInitializing ? '初始化中...' : '初始化 TensorFlow' }}
        </button>
        
        <button @click="handleTrain" :disabled="isTraining || !isInitialized">
          {{ isTraining ? '训练中...' : '开始训练' }}
        </button>
        
        <button @click="handlePredict" :disabled="!isTrained">
          预测
        </button>
        
        <button @click="handleCleanup" class="cleanup-btn">
          清理资源
        </button>
      </div>
    </div>

    <!-- 训练进度 -->
    <div v-if="isTraining" class="training-progress">
      <h3>训练进度</h3>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${(currentEpoch / epochs) * 100}%` }"
        ></div>
      </div>
      <p>第 {{ currentEpoch }} / {{ epochs }} 轮</p>
      <p v-if="currentLoss">当前损失: {{ currentLoss.toFixed(4) }}</p>
    </div>

    <!-- 预测结果 -->
    <div v-if="predictionResult !== null" class="prediction-result">
      <h3>预测结果</h3>
      <div class="result-box">
        <p>输入: <strong>{{ predictInput }}</strong></p>
        <p>预测输出: <strong>{{ predictionResult.toFixed(4) }}</strong></p>
        <p class="expected">期望值: {{ (2 * predictInput - 1).toFixed(4) }} (y = 2x - 1)</p>
      </div>
    </div>

    <!-- 日志输出 -->
    <div v-if="logs.length > 0" class="log-panel">
      <h3>日志</h3>
      <div class="log-content">
        <p v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  initTFBackend,
  getTFInfo,
  trainSimpleModel,
  createSimpleModel,
  predict,
  cleanupTF,
  getMemoryInfo,
} from '@/utils/tensorflow'

// 状态管理
const isInitialized = ref(false)
const isInitializing = ref(false)
const isTraining = ref(false)
const isTrained = ref(false)
const epochs = ref(50)
const currentEpoch = ref(0)
const currentLoss = ref<number | null>(null)
const predictionResult = ref<number | null>(null)
const predictInput = ref(5)
const logs = ref<string[]>([])
const tfInfo = ref<{ version: string; backend: string; features: Record<string, boolean | number | string> }>({
  version: '',
  backend: '',
  features: {},
})
const memoryInfo = ref({ numTensors: 0 })

let trainedModel: any = null

// 添加日志
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
  // 保留最近 50 条日志
  if (logs.value.length > 50) {
    logs.value.shift()
  }
}

// 初始化 TensorFlow
async function handleInit() {
  isInitializing.value = true
  addLog('正在初始化 TensorFlow.js...')
  
  try {
    await initTFBackend()
    tfInfo.value = getTFInfo()
    memoryInfo.value = getMemoryInfo()
    isInitialized.value = true
    addLog('✓ TensorFlow.js 初始化成功')
  } catch (error) {
    addLog(`✗ 初始化失败: ${error}`)
  } finally {
    isInitializing.value = false
  }
}

// 训练模型
async function handleTrain() {
  if (!isInitialized.value) {
    addLog('请先初始化 TensorFlow')
    return
  }

  isTraining.value = true
  currentEpoch.value = 0
  currentLoss.value = null
  addLog(`开始训练模型 (${epochs.value} 轮)...`)

  try {
    // 创建并训练模型
    trainedModel = createSimpleModel()
    
    // 生成训练数据
    import('@tensorflow/tfjs').then(async (tf) => {
      const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1])
      const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1])

      await trainedModel.fit(xs, ys, {
        epochs: epochs.value,
        callbacks: {
          onEpochEnd: (epoch: number, logs?: any) => {
            currentEpoch.value = epoch + 1
            if (logs?.loss) {
              currentLoss.value = logs.loss
            }
            if ((epoch + 1) % 10 === 0) {
              addLog(`第 ${epoch + 1}/${epochs.value} 轮, 损失: ${logs?.loss.toFixed(4)}`)
            }
          },
        },
      })

      xs.dispose()
      ys.dispose()
      
      isTraining.value = false
      isTrained.value = true
      memoryInfo.value = getMemoryInfo()
      addLog('✓ 模型训练完成!')
    })
  } catch (error) {
    isTraining.value = false
    addLog(`✗ 训练失败: ${error}`)
  }
}

// 预测
function handlePredict() {
  if (!trainedModel) {
    addLog('请先训练模型')
    return
  }

  try {
    const result = predict(trainedModel, predictInput.value)
    predictionResult.value = result
    addLog(`预测输入 ${predictInput.value}, 结果: ${result.toFixed(4)}`)
    memoryInfo.value = getMemoryInfo()
  } catch (error) {
    addLog(`✗ 预测失败: ${error}`)
  }
}

// 清理资源
function handleCleanup() {
  cleanupTF()
  trainedModel = null
  isTrained.value = false
  predictionResult.value = null
  memoryInfo.value = getMemoryInfo()
  addLog('✓ 资源已清理')
}

// 组件挂载时自动初始化
onMounted(() => {
  handleInit()
})
</script>

<style scoped>
.tensorflow-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #42b983;
  margin-bottom: 20px;
}

h3 {
  color: #35495e;
  margin-top: 20px;
  margin-bottom: 10px;
}

.info-panel,
.control-panel,
.training-progress,
.prediction-result,
.log-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #42b983;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #369970;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cleanup-btn {
  background: #e74c3c;
}

.cleanup-btn:hover:not(:disabled) {
  background: #c0392b;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983, #369970);
  transition: width 0.3s;
}

.result-box {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #42b983;
}

.expected {
  color: #666;
  font-style: italic;
  margin-top: 10px;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  margin: 5px 0;
  line-height: 1.5;
}
</style>
