<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

/**
 * 处理登出
 */
async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <main>
    <!-- 用户信息栏 -->
    <div v-if="userStore.isLoggedIn" class="user-bar">
      <div class="user-info">
        <span class="welcome-text">欢迎，{{ userStore.userInfo?.username || '用户' }}</span>
      </div>
      <button @click="handleLogout" class="logout-button">退出登录</button>
    </div>
    
    <TheWelcome />
  </main>
</template>

<style scoped>
.user-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-text {
  font-size: 16px;
  font-weight: 500;
}

.logout-button {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.logout-button:hover {
  background: white;
  color: #667eea;
}
</style>
