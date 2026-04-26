<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// 系统设置数据
const systemConfig = ref({
  siteName: '管理后台系统',
  siteLogo: '',
  copyright: '© 2024 管理后台系统. All rights reserved.',
  maxUploadSize: 10, // MB
  sessionTimeout: 30, // 分钟
  enableLog: true,
})

// 表单提交状态
const isSaving = ref(false)

/**
 * 保存系统配置
 */
async function saveSystemConfig() {
  try {
    isSaving.value = true
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存到 localStorage（实际项目中应该调用 API）
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig.value))
    
    alert('系统配置保存成功！')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

/**
 * 重置为默认配置
 */
function resetToDefault() {
  if (confirm('确定要重置为默认配置吗？')) {
    systemConfig.value = {
      siteName: '管理后台系统',
      siteLogo: '',
      copyright: '© 2024 管理后台系统. All rights reserved.',
      maxUploadSize: 10,
      sessionTimeout: 30,
      enableLog: true,
    }
  }
}

/**
 * 清除缓存
 */
function clearCache() {
  if (confirm('确定要清除所有缓存吗？')) {
    localStorage.clear()
    sessionStorage.clear()
    alert('缓存已清除')
  }
}

/**
 * 应用预设主题
 */
function applyThemePreset(presetName: string) {
  themeStore.applyPreset(presetName)
}

/**
 * 保存主题配置
 */
function saveThemeConfig() {
  themeStore.applyTheme()
  alert('主题配置已保存！')
}

/**
 * 导出主题配置
 */
function handleExportTheme() {
  const json = themeStore.exportTheme()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `theme-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  alert('主题配置已导出！')
}

/**
 * 导入主题配置
 */
function handleImportTheme(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    const success = themeStore.importTheme(content)
    
    if (success) {
      alert('主题配置导入成功！')
    } else {
      alert('导入失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
  
  // 清空 input，允许重复导入同一文件
  target.value = ''
}

/**
 * 生成并下载主题预览图
 */
async function handleGeneratePreview() {
  try {
    const base64 = await themeStore.generateThemePreview()
    if (base64) {
      const a = document.createElement('a')
      a.href = base64
      a.download = `theme-preview-${Date.now()}.png`
      a.click()
      alert('主题预览图已生成！')
    }
  } catch (error) {
    console.error('生成预览失败:', error)
    alert('生成预览图失败')
  }
}

/**
 * 切换自动切换主题
 */
function toggleAutoSwitch() {
  themeStore.toggleAutoSwitch(!themeStore.autoSwitchEnabled)
}

/**
 * 保存自动切换时间表
 */
function saveAutoSwitchSchedule() {
  themeStore.setAutoSwitchSchedule(
    themeStore.autoSwitchSchedule.lightStart,
    themeStore.autoSwitchSchedule.darkStart
  )
  alert('自动切换时间已保存！')
}

// 组件挂载时加载主题
onMounted(() => {
  themeStore.loadTheme()
})
</script>

<template>
  <div class="system-settings">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-description">配置系统参数和全局选项</p>
    </div>

    <div class="settings-container">
      <!-- 基本设置 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">⚙️</span>
          基本设置
        </h2>
        
        <div class="form-group">
          <label class="form-label">系统名称</label>
          <input 
            v-model="systemConfig.siteName" 
            type="text" 
            class="form-input"
            placeholder="请输入系统名称"
          />
        </div>

        <div class="form-group">
          <label class="form-label">版权信息</label>
          <input 
            v-model="systemConfig.copyright" 
            type="text" 
            class="form-input"
            placeholder="请输入版权信息"
          />
        </div>

        <div class="form-group">
          <label class="form-label">会话超时时间（分钟）</label>
          <input 
            v-model.number="systemConfig.sessionTimeout" 
            type="number" 
            class="form-input"
            min="5"
            max="120"
          />
          <small class="form-hint">用户无操作超过此时间后将自动退出登录</small>
        </div>
      </section>

      <!-- 上传设置 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">📤</span>
          上传设置
        </h2>
        
        <div class="form-group">
          <label class="form-label">最大上传文件大小（MB）</label>
          <input 
            v-model.number="systemConfig.maxUploadSize" 
            type="number" 
            class="form-input"
            min="1"
            max="100"
          />
          <small class="form-hint">限制用户上传文件的最大大小</small>
        </div>
      </section>

      <!-- 日志设置 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">📋</span>
          日志设置
        </h2>
        
        <div class="form-group">
          <label class="form-label form-checkbox-label">
            <input 
              v-model="systemConfig.enableLog" 
              type="checkbox" 
              class="form-checkbox"
            />
            <span>启用系统日志</span>
          </label>
          <small class="form-hint">记录系统运行日志，便于问题排查</small>
        </div>
      </section>

      <!-- 主题设置 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">🎨</span>
          主题设置
        </h2>
        
        <!-- 预设主题 -->
        <div class="form-group">
          <label class="form-label">预设主题</label>
          <div class="theme-presets-grid">
            <button 
              v-for="(preset, key) in themeStore.presets"
              :key="key"
              @click="applyThemePreset(key)"
              :class="['preset-card', { active: themeStore.primaryColor === preset.primaryColor && themeStore.secondaryColor === preset.secondaryColor }]"
              :title="preset.description"
            >
              <div 
                class="preset-color-preview"
                :style="{
                  background: `linear-gradient(135deg, ${preset.primaryColor} 0%, ${preset.secondaryColor} 100%)`
                }"
              ></div>
              <div class="preset-info">
                <span class="preset-name">{{ preset.name }}</span>
                <span class="preset-mode">{{ preset.mode === 'light' ? '☀️' : '🌙' }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 自定义颜色 -->
        <div class="form-group">
          <label class="form-label">主色调</label>
          <div class="color-picker-group">
            <input 
              v-model="themeStore.primaryColor" 
              type="color" 
              class="color-input"
            />
            <input 
              v-model="themeStore.primaryColor" 
              type="text" 
              class="form-input color-text"
              placeholder="#667eea"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">次要颜色</label>
          <div class="color-picker-group">
            <input 
              v-model="themeStore.secondaryColor" 
              type="color" 
              class="color-input"
            />
            <input 
              v-model="themeStore.secondaryColor" 
              type="text" 
              class="form-input color-text"
              placeholder="#764ba2"
            />
          </div>
        </div>

        <div class="form-actions theme-actions">
          <button @click="saveThemeConfig" class="btn btn-primary">
            应用主题
          </button>
        </div>

        <!-- 主题导入导出 -->
        <div class="form-group">
          <label class="form-label">主题管理</label>
          <div class="theme-management-buttons">
            <button @click="handleExportTheme" class="btn btn-secondary">
              <span class="btn-icon">📤</span>
              导出主题
            </button>
            
            <label class="btn btn-secondary import-btn">
              <span class="btn-icon">📥</span>
              导入主题
              <input 
                type="file" 
                accept=".json" 
                @change="handleImportTheme"
                style="display: none"
              />
            </label>
            
            <button @click="handleGeneratePreview" class="btn btn-secondary">
              <span class="btn-icon">📸</span>
              生成预览图
            </button>
          </div>
        </div>

        <!-- 自动切换主题 -->
        <div class="form-group">
          <label class="form-label form-checkbox-label">
            <input 
              v-model="themeStore.autoSwitchEnabled" 
              @change="toggleAutoSwitch"
              type="checkbox" 
              class="form-checkbox"
            />
            <span>启用自动切换主题</span>
          </label>
          <small class="form-hint">根据设定时间自动切换亮色/暗色主题</small>
        </div>

        <div v-if="themeStore.autoSwitchEnabled" class="auto-switch-schedule">
          <div class="time-inputs">
            <div class="time-input-group">
              <label class="time-label">☀️ 亮色主题开始时间</label>
              <input 
                v-model="themeStore.autoSwitchSchedule.lightStart"
                type="time" 
                class="form-input time-picker"
              />
            </div>
            
            <div class="time-input-group">
              <label class="time-label">🌙 暗色主题开始时间</label>
              <input 
                v-model="themeStore.autoSwitchSchedule.darkStart"
                type="time" 
                class="form-input time-picker"
              />
            </div>
          </div>
          
          <button @click="saveAutoSwitchSchedule" class="btn btn-primary save-schedule-btn">
            保存时间表
          </button>
        </div>
      </section>

      <!-- 系统维护 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">🔧</span>
          系统维护
        </h2>
        
        <div class="maintenance-actions">
          <button @click="clearCache" class="btn btn-warning">
            <span class="btn-icon">🗑️</span>
            清除缓存
          </button>
          <button @click="resetToDefault" class="btn btn-secondary">
            <span class="btn-icon">🔄</span>
            重置为默认配置
          </button>
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button @click="saveSystemConfig" :disabled="isSaving" class="btn btn-primary">
          <span v-if="isSaving" class="loading-spinner"></span>
          {{ isSaving ? '保存中...' : '保存配置' }}
        </button>
        <button @click="$router.back()" class="btn btn-default">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-settings {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.settings-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.settings-section {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.form-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 主题设置样式 */
.theme-presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.preset-card {
  padding: 12px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-card:hover {
  border-color: var(--primary-color, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preset-card.active {
  border-color: var(--primary-color, #667eea);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.preset-color-preview {
  width: 100%;
  height: 50px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preset-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preset-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.preset-mode {
  font-size: 16px;
}

.theme-management-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.import-btn {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.auto-switch-schedule {
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.time-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.time-picker {
  font-family: 'Courier New', monospace;
}

.save-schedule-btn {
  width: 100%;
}

.maintenance-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-picker-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 2px;
}

.color-input:hover {
  border-color: var(--primary-color, #667eea);
}

.color-text {
  flex: 1;
  font-family: 'Courier New', monospace;
}

.theme-actions {
  padding: 16px 0 0 0;
  background: transparent;
  justify-content: flex-start;
}

.theme-management-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-actions {
  padding: 20px 30px;
  background: #fafafa;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-warning {
  background: #ff4d4f;
  color: white;
}

.btn-warning:hover {
  background: #ff7875;
}

.btn-default {
  background: white;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-default:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-icon {
  font-size: 16px;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-settings {
    padding: 0 15px;
  }
  
  .settings-section {
    padding: 20px;
  }
  
  .form-actions {
    padding: 15px 20px;
  }
  
  .maintenance-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
