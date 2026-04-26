# TensorFlow.js 使用指南

## 简介

本项目已集成 **TensorFlow.js** - Google 开发的 JavaScript 深度学习框架,可以在浏览器和 Node.js 环境中运行机器学习模型。

## 安装

TensorFlow.js 已通过以下命令安装:

```bash
npm install @tensorflow/tfjs
```

## 快速开始

### 1. 访问演示页面

启动开发服务器后,访问以下路由查看 TensorFlow.js 演示:

```
http://localhost:5173/tensorflow
```

### 2. 基本用法

#### 初始化工具类

```typescript
import { initTFBackend, getTFInfo } from '@/utils/tensorflow'

// 初始化后端 (优先使用 WebGL GPU 加速)
await initTFBackend()

// 获取信息
const info = getTFInfo()
console.log('后端:', info.backend)
console.log('版本:', info.version)
```

#### 创建和训练模型

```typescript
import { createSimpleModel, trainSimpleModel } from '@/utils/tensorflow'

// 创建简单模型
const model = createSimpleModel()

// 或者使用预定义的训练函数
const history = await trainSimpleModel(50) // 训练 50 轮
```

#### 进行预测

```typescript
import { predict } from '@/utils/tensorflow'

const result = predict(model, 5)
console.log('预测结果:', result)
```

#### 清理资源

```typescript
import { cleanupTF } from '@/utils/tensorflow'

// 释放所有张量内存
cleanupTF()
```

## 项目结构

```
src/
├── utils/
│   └── tensorflow.ts          # TensorFlow.js 工具类
└── views/
    └── TensorFlowDemoView.vue # 交互式演示页面
```

## 核心功能

### 1. 后端管理

- **WebGL 后端**: 使用 GPU 加速,性能最佳
- **CPU 后端**: 兼容性最好,作为备用方案
- 自动检测和切换后端

### 2. 模型操作

- 创建序列模型
- 定义网络层结构
- 编译模型 (选择优化器和损失函数)
- 训练模型
- 进行预测

### 3. 内存管理

- 监控张量数量
- 手动释放资源
- 防止内存泄漏

## 示例代码

### 线性回归示例

演示中的模型学习 `y = 2x - 1` 这个线性关系:

```typescript
// 训练数据
const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1])
const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1])

// 训练后,输入 5 应该得到接近 9 的结果 (2*5-1=9)
```

### 自定义模型

```typescript
import * as tf from '@tensorflow/tfjs'

const model = tf.sequential({
  layers: [
    tf.layers.dense({
      inputShape: [10],
      units: 64,
      activation: 'relu'
    }),
    tf.layers.dense({
      units: 32,
      activation: 'relu'
    }),
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    })
  ]
})

model.compile({
  optimizer: 'adam',
  loss: 'binaryCrossentropy',
  metrics: ['accuracy']
})
```

## 性能优化建议

1. **使用 WebGL 后端**: 确保浏览器支持 WebGL
2. **及时释放张量**: 使用 `dispose()` 方法
3. **批量处理**: 减少模型调用次数
4. **模型缓存**: 避免重复创建相同模型

## 常见问题

### Q: 为什么训练很慢?
A: 检查是否使用了 WebGL 后端。在控制台查看 `tf.getBackend()` 的返回值。

### Q: 内存泄漏怎么办?
A: 确保在使用完张量后调用 `dispose()`,或使用 `tf.tidy()` 自动管理。

### Q: 可以使用预训练模型吗?
A: 可以!TensorFlow.js 支持加载多种预训练模型,如 MobileNet、Coco-SSD 等。

## 更多资源

- [TensorFlow.js 官方文档](https://www.tensorflow.org/js)
- [TensorFlow.js 示例仓库](https://github.com/tensorflow/tfjs-examples)
- [预训练模型列表](https://github.com/tensorflow/tfjs-models)

## 下一步

1. 尝试修改演示页面的参数,观察训练效果
2. 学习不同的神经网络架构
3. 探索图像识别、自然语言处理等应用
4. 将模型部署到生产环境
