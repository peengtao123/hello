import { defineStore } from 'pinia'
import { ref, watch, onScopeDispose } from 'vue'

export interface ThemePreset {
  mode: 'light' | 'dark'
  primaryColor: string
  secondaryColor: string
  name: string
  description?: string
}

export const useThemeStore = defineStore('theme', () => {
  // 主题模式：'light' | 'dark'
  const themeMode = ref<'light' | 'dark'>('light')
  
  // 主题颜色
  const primaryColor = ref('#667eea')
  const secondaryColor = ref('#764ba2')
  
  // 用户ID（用于用户级别的主题偏好）
  const userId = ref<string>('')
  
  // 自动切换主题设置
  const autoSwitchEnabled = ref(false)
  const autoSwitchSchedule = ref({
    lightStart: '06:00',  // 亮色主题开始时间
    darkStart: '18:00'   // 暗色主题开始时间
  })
  
  // 预设主题配置（扩展版）
  const presets: Record<string, ThemePreset> = {
    light: {
      mode: 'light',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      name: '亮色主题',
      description: '清新明亮的紫色渐变'
    },
    dark: {
      mode: 'dark',
      primaryColor: '#4a5568',
      secondaryColor: '#2d3748',
      name: '暗色主题',
      description: '护眼深色模式'
    },
    blue: {
      mode: 'light',
      primaryColor: '#1890ff',
      secondaryColor: '#096dd9',
      name: '蓝色主题',
      description: '专业的商务蓝'
    },
    green: {
      mode: 'light',
      primaryColor: '#52c41a',
      secondaryColor: '#389e0d',
      name: '绿色主题',
      description: '自然清新的绿色'
    },
    orange: {
      mode: 'light',
      primaryColor: '#fa8c16',
      secondaryColor: '#d46b08',
      name: '橙色主题',
      description: '活力温暖的橙色'
    },
    pink: {
      mode: 'light',
      primaryColor: '#eb2f96',
      secondaryColor: '#c41d7f',
      name: '粉色主题',
      description: '浪漫温柔的粉色'
    },
    cyan: {
      mode: 'light',
      primaryColor: '#13c2c2',
      secondaryColor: '#08979c',
      name: '青色主题',
      description: '冷静清爽的青色'
    },
    purple: {
      mode: 'dark',
      primaryColor: '#722ed1',
      secondaryColor: '#531dab',
      name: '深紫主题',
      description: '神秘优雅的深紫色'
    }
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    const root = document.documentElement
    
    // 设置主题模式
    if (themeMode.value === 'dark') {
      root.classList.add('dark-theme')
      root.classList.remove('light-theme')
    } else {
      root.classList.add('light-theme')
      root.classList.remove('dark-theme')
    }
    
    // 设置主题颜色变量
    root.style.setProperty('--primary-color', primaryColor.value)
    root.style.setProperty('--secondary-color', secondaryColor.value)
    
    // 保存到 localStorage
    saveTheme()
  }

  /**
   * 保存主题配置到 localStorage
   */
  function saveTheme() {
    const themeConfig = {
      mode: themeMode.value,
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      userId: userId.value,
      autoSwitchEnabled: autoSwitchEnabled.value,
      autoSwitchSchedule: autoSwitchSchedule.value
    }
    
    // 如果有用户ID，保存到用户级别的存储
    const storageKey = userId.value 
      ? `themeConfig_${userId.value}` 
      : 'themeConfig'
    
    localStorage.setItem(storageKey, JSON.stringify(themeConfig))
  }

  /**
   * 从 localStorage 加载主题配置
   */
  function loadTheme(customUserId?: string) {
    if (customUserId) {
      userId.value = customUserId
    }
    
    const storageKey = userId.value 
      ? `themeConfig_${userId.value}` 
      : 'themeConfig'
    
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const config = JSON.parse(saved)
        themeMode.value = config.mode || 'light'
        primaryColor.value = config.primaryColor || '#667eea'
        secondaryColor.value = config.secondaryColor || '#764ba2'
        autoSwitchEnabled.value = config.autoSwitchEnabled || false
        if (config.autoSwitchSchedule) {
          autoSwitchSchedule.value = config.autoSwitchSchedule
        }
      } catch (error) {
        console.error('加载主题配置失败:', error)
      }
    }
    
    applyTheme()
    
    // 如果启用了自动切换，启动定时器
    if (autoSwitchEnabled.value) {
      startAutoSwitch()
    }
  }

  /**
   * 切换主题模式
   */
  function toggleThemeMode() {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
    applyTheme()
  }

  /**
   * 应用预设主题
   */
  function applyPreset(presetName: string) {
    const preset = presets[presetName]
    if (preset) {
      themeMode.value = preset.mode
      primaryColor.value = preset.primaryColor
      secondaryColor.value = preset.secondaryColor
      applyTheme()
    }
  }

  /**
   * 设置自定义颜色
   */
  function setCustomColors(primary: string, secondary: string) {
    primaryColor.value = primary
    secondaryColor.value = secondary
    applyTheme()
  }

  /**
   * 导出主题配置
   */
  function exportTheme(): string {
    const themeConfig = {
      name: 'My Custom Theme',
      mode: themeMode.value,
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    return JSON.stringify(themeConfig, null, 2)
  }

  /**
   * 导入主题配置
   */
  function importTheme(jsonString: string): boolean {
    try {
      const config = JSON.parse(jsonString)
      
      // 验证配置格式
      if (!config.mode || !config.primaryColor || !config.secondaryColor) {
        throw new Error('无效的主题配置文件')
      }
      
      // 应用导入的配置
      themeMode.value = config.mode
      primaryColor.value = config.primaryColor
      secondaryColor.value = config.secondaryColor
      
      applyTheme()
      return true
    } catch (error) {
      console.error('导入主题失败:', error)
      return false
    }
  }

  /**
   * 生成主题预览图片（返回 base64）
   */
  function generateThemePreview(): Promise<string> {
    return new Promise((resolve) => {
      // 创建一个临时的 canvas 来生成预览图
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 300
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve('')
        return
      }
      
      // 绘制背景
      const gradient = ctx.createLinearGradient(0, 0, 400, 300)
      gradient.addColorStop(0, primaryColor.value)
      gradient.addColorStop(1, secondaryColor.value)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 400, 300)
      
      // 绘制主题信息
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('主题预览', 200, 80)
      
      ctx.font = '16px Arial'
      ctx.fillText(`主色调: ${primaryColor.value}`, 200, 130)
      ctx.fillText(`次要色: ${secondaryColor.value}`, 200, 160)
      ctx.fillText(`模式: ${themeMode.value === 'light' ? '亮色' : '暗色'}`, 200, 190)
      
      // 绘制色块示例
      ctx.fillStyle = primaryColor.value
      ctx.fillRect(100, 220, 80, 40)
      ctx.fillStyle = secondaryColor.value
      ctx.fillRect(220, 220, 80, 40)
      
      // 转换为 base64
      resolve(canvas.toDataURL('image/png'))
    })
  }

  /**
   * 设置用户ID
   */
  function setUserId(id: string) {
    userId.value = id
    loadTheme(id)
  }

  /**
   * 启用/禁用自动切换主题
   */
  function toggleAutoSwitch(enabled: boolean) {
    autoSwitchEnabled.value = enabled
    if (enabled) {
      startAutoSwitch()
    }
    saveTheme()
  }

  /**
   * 设置自动切换时间表
   */
  function setAutoSwitchSchedule(lightStart: string, darkStart: string) {
    autoSwitchSchedule.value = { lightStart, darkStart }
    saveTheme()
    
    // 立即检查并应用
    checkAndSwitchTheme()
  }

  /**
   * 启动自动切换定时器
   */
  let autoSwitchTimer: number | null = null
  
  function startAutoSwitch() {
    // 清除旧的定时器
    if (autoSwitchTimer) {
      clearInterval(autoSwitchTimer)
    }
    
    // 每分钟检查一次
    autoSwitchTimer = window.setInterval(() => {
      checkAndSwitchTheme()
    }, 60000)
    
    // 立即检查一次
    checkAndSwitchTheme()
  }

  /**
   * 检查并切换主题
   */
  function checkAndSwitchTheme() {
    if (!autoSwitchEnabled.value) return
    
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    const { lightStart, darkStart } = autoSwitchSchedule.value
    
    // 判断应该使用哪个主题
    let shouldUseLight = false
    
    if (lightStart < darkStart) {
      // 例如：06:00 - 18:00 使用亮色
      shouldUseLight = currentTime >= lightStart && currentTime < darkStart
    } else {
      // 例如：18:00 - 06:00 使用亮色（跨天）
      shouldUseLight = currentTime >= lightStart || currentTime < darkStart
    }
    
    const targetMode = shouldUseLight ? 'light' : 'dark'
    
    // 如果当前模式与目标模式不同，则切换
    if (themeMode.value !== targetMode) {
      // 找到对应的预设主题
      const presetName = targetMode === 'light' ? 'light' : 'dark'
      applyPreset(presetName)
    }
  }

  /**
   * 停止自动切换
   */
  function stopAutoSwitch() {
    if (autoSwitchTimer) {
      clearInterval(autoSwitchTimer)
      autoSwitchTimer = null
    }
  }

  // 监听主题变化，自动应用
  watch([themeMode, primaryColor, secondaryColor], () => {
    applyTheme()
  })

  // 组件卸载时清理定时器
  onScopeDispose(() => {
    stopAutoSwitch()
  })

  return {
    themeMode,
    primaryColor,
    secondaryColor,
    userId,
    autoSwitchEnabled,
    autoSwitchSchedule,
    presets,
    loadTheme,
    toggleThemeMode,
    applyPreset,
    setCustomColors,
    applyTheme,
    exportTheme,
    importTheme,
    generateThemePreview,
    setUserId,
    toggleAutoSwitch,
    setAutoSwitchSchedule,
    stopAutoSwitch
  }
})
