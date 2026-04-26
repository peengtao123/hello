<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { LoginParams } from '@/api/auth'
import SliderCaptcha from '@/components/SliderCaptcha.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive<LoginParams & { rememberMe: boolean }>({
  username: '',
  password: '',
  rememberMe: false,
})

// 加载状态
const loading = ref(false)

// 错误消息
const errorMessage = ref('')

// 密码可见性
const showPassword = ref(false)

// 滑块验证状态
const captchaVerified = ref(false)
const showCaptcha = ref(false)

// 表单验证错误
const validationErrors = reactive({
  username: '',
  password: '',
})

/**
 * 验证用户名
 */
function validateUsername(): boolean {
  if (!loginForm.username) {
    validationErrors.username = '请输入用户名'
    return false
  }
  if (loginForm.username.length < 3) {
    validationErrors.username = '用户名至少3个字符'
    return false
  }
  validationErrors.username = ''
  return true
}

/**
 * 验证密码
 */
function validatePassword(): boolean {
  if (!loginForm.password) {
    validationErrors.password = '请输入密码'
    return false
  }
  if (loginForm.password.length < 6) {
    validationErrors.password = '密码至少6个字符'
    return false
  }
  validationErrors.password = ''
  return true
}

/**
 * 显示滑块验证码
 */
function showCaptchaModal() {
  // 先验证表单
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  
  if (!isUsernameValid || !isPasswordValid) {
    return
  }
  
  // 显示滑块验证
  showCaptcha.value = true
  captchaVerified.value = false
}

/**
 * 滑块验证成功回调
 */
function handleCaptchaSuccess() {
  captchaVerified.value = true
  
  // 延迟后自动提交登录
  setTimeout(() => {
    submitLogin()
  }, 500)
}

/**
 * 滑块验证失败回调
 */
function handleCaptchaFail() {
  captchaVerified.value = false
}

/**
 * 刷新验证码
 */
function handleCaptchaRefresh() {
  captchaVerified.value = false
}

/**
 * 提交登录
 */
async function submitLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    await userStore.login(loginForm)
    
    // 如果勾选了"记住我"，保存用户名到 localStorage
    if (loginForm.rememberMe) {
      localStorage.setItem('rememberedUsername', loginForm.username)
    } else {
      localStorage.removeItem('rememberedUsername')
    }
    
    // 登录成功，跳转到首页或重定向页面
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '登录失败，请检查用户名和密码'
    errorMessage.value = message
    
    // 登录失败，重置验证码
    captchaVerified.value = false
    showCaptcha.value = false
  } finally {
    loading.value = false
  }
}

/**
 * 处理登录（先显示验证码）
 */
function handleLogin() {
  showCaptchaModal()
}

/**
 * 初始化：如果有记住的用户名，自动填充
 */
function initLoginForm() {
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.rememberMe = true
  }
}

// 组件挂载时初始化
initLoginForm()

/**
 * 切换密码可见性
 */
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">用户登录</h1>
        <p class="login-subtitle">欢迎回来，请登录您的账号</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 错误提示 -->
        <transition name="slide-down">
          <div v-if="errorMessage" class="error-message">
            <span class="error-icon">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>
        </transition>

        <!-- 用户名输入框 -->
        <div class="form-group">
          <label for="username" class="form-label">
            <span class="label-icon">👤</span>
            用户名
          </label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            :disabled="loading"
            @blur="validateUsername"
            :class="{ 'error': validationErrors.username }"
          />
          <transition name="fade">
            <span v-if="validationErrors.username" class="field-error">
              {{ validationErrors.username }}
            </span>
          </transition>
        </div>

        <!-- 密码输入框 -->
        <div class="form-group">
          <label for="password" class="form-label">
            <span class="label-icon">🔒</span>
            密码
          </label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :disabled="loading"
              @blur="validatePassword"
              :class="{ 'error': validationErrors.password }"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility"
              :disabled="loading"
              tabindex="-1"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <transition name="fade">
            <span v-if="validationErrors.password" class="field-error">
              {{ validationErrors.password }}
            </span>
          </transition>
        </div>

        <!-- 记住我和忘记密码 -->
        <div class="form-options">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              v-model="loginForm.rememberMe"
              :disabled="loading"
            />
            <span class="checkbox-label">记住我</span>
          </label>
          <a href="#" class="forgot-link" @click.prevent>忘记密码？</a>
        </div>

        <!-- 滑块验证码 -->
        <transition name="slide-up">
          <div v-if="showCaptcha" class="captcha-section">
            <SliderCaptcha 
              @success="handleCaptchaSuccess"
              @fail="handleCaptchaFail"
              @refresh="handleCaptchaRefresh"
              :disabled="loading"
            />
          </div>
        </transition>

        <!-- 登录按钮 -->
        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span>{{ loading ? '登录中...' : '登 录' }}</span>
        </button>
      </form>

      <div class="login-footer">
        <p class="test-account">💡 测试账号: admin / 123456</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 440px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
}

.login-subtitle {
  color: #999;
  margin: 0;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #555;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-icon {
  font-size: 16px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #ff4d4f;
  background-color: #fff1f0;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.password-toggle:hover:not(:disabled) {
  opacity: 1;
}

.password-toggle:disabled {
  cursor: not-allowed;
}

.field-error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-error::before {
  content: '•';
}

.error-message {
  background: linear-gradient(135deg, #fff1f0 0%, #ffebee 100%);
  color: #cf1322;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 4px solid #ff4d4f;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-icon {
  font-size: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-label {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.forgot-link {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.captcha-section {
  margin-top: 8px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px solid #e8e8e8;
}

.login-button {
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  letter-spacing: 1px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.test-account {
  color: #999;
  font-size: 13px;
  margin: 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    padding: 32px 24px;
  }
  
  .login-title {
    font-size: 28px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
