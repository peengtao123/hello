/**
 * TensorFlow.js 工具类
 * 提供深度学习模型的基本操作和配置
 */

import * as tf from '@tensorflow/tfjs'

/**
 * 初始化 TensorFlow.js 后端
 * 优先使用 WebGL 加速,如果不可用则回退到 CPU
 */
export async function initTFBackend(): Promise<void> {
  try {
    // 尝试使用 WebGL 后端 (GPU 加速)
    await tf.setBackend('webgl')
    console.log('TensorFlow.js 后端已初始化为:', tf.getBackend())
    
    // 打印设备信息
    const backend = tf.getBackend()
    console.log(`当前使用的后端: ${backend}`)
    
    if (backend === 'webgl') {
      console.log('✓ 已启用 GPU 加速 (WebGL)')
    } else {
      console.log('⚠ 使用 CPU 后端,性能可能较低')
    }
  } catch (error) {
    console.error('初始化 TensorFlow.js 后端失败:', error)
    // 回退到 CPU 后端
    await tf.setBackend('cpu')
    console.log('已回退到 CPU 后端')
  }
}

/**
 * 获取 TensorFlow.js 版本和设备信息
 */
export function getTFInfo(): {
  version: string
  backend: string
  features: Record<string, boolean | number | string>
} {
  return {
    version: tf.version_core,
    backend: tf.getBackend(),
    features: tf.ENV.features,
  }
}

/**
 * 创建简单的线性回归模型示例
 * @returns 编译好的模型
 */
export function createSimpleModel(): tf.LayersModel {
  // 创建一个简单的序列模型
  const model = tf.sequential({
    layers: [
      // 输入层: 1个特征
      tf.layers.dense({
        inputShape: [1],
        units: 10,
        activation: 'relu',
      }),
      // 隐藏层
      tf.layers.dense({
        units: 10,
        activation: 'relu',
      }),
      // 输出层: 1个输出
      tf.layers.dense({
        units: 1,
      }),
    ],
  })

  // 编译模型
  model.compile({
    optimizer: tf.train.sgd(0.01), // 随机梯度下降优化器
    loss: 'meanSquaredError', // 均方误差损失函数
  })

  return model
}

/**
 * 训练简单模型的示例
 * @param epochs 训练轮数
 * @returns 训练历史
 */
export async function trainSimpleModel(
  epochs: number = 50
): Promise<tf.History> {
  const model = createSimpleModel()

  // 生成示例数据: y = 2x - 1
  const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1])
  const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1])

  console.log('开始训练模型...')

  // 训练模型
  const history = await model.fit(xs, ys, {
    epochs,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if ((epoch + 1) % 10 === 0) {
          console.log(`第 ${epoch + 1}/${epochs} 轮, 损失: ${logs?.loss?.toFixed(4) || 'N/A'}`)
        }
      },
    },
  })

  // 清理张量,释放内存
  xs.dispose()
  ys.dispose()

  console.log('模型训练完成!')
  return history
}

/**
 * 使用训练好的模型进行预测
 * @param model 训练好的模型
 * @param input 输入值
 * @returns 预测结果
 */
export function predict(model: tf.LayersModel, input: number): number {
  const inputTensor = tf.tensor2d([input], [1, 1])
  const prediction = model.predict(inputTensor) as tf.Tensor
  
  const result = prediction.dataSync()[0]
  
  // 清理张量
  inputTensor.dispose()
  prediction.dispose()
  
  return result ?? 0
}

/**
 * 清理 TensorFlow.js 资源
 * 释放所有张量占用的内存
 */
export function cleanupTF(): void {
  tf.disposeVariables()
  console.log('TensorFlow.js 资源已清理')
}

/**
 * 内存使用情况
 */
export function getMemoryInfo(): tf.MemoryInfo {
  return tf.memory()
}
