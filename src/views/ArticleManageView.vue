<template>
  <div class="page-content">
    <div class="page-header">
      <h1>文章管理</h1>
      <p class="page-description">展示来自第三方 API 的文章数据</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-bar">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索文章标题..."
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <select v-model="selectedUserId" class="user-select" @change="handleFilterChange">
        <option :value="undefined">全部用户</option>
        <option v-for="userId in userIds" :key="userId" :value="userId">
          用户 {{ userId }}
        </option>
      </select>
      <button class="btn btn-secondary" @click="handleSearch">搜索</button>
      <button class="btn btn-outline" @click="resetSearch">重置</button>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="articleList.length === 0" class="empty-state">
        <p>暂无文章数据</p>
      </div>

      <!-- 文章卡片列表 -->
      <div v-else class="articles-grid">
        <div 
          v-for="article in articleList" 
          :key="article.id" 
          class="article-card"
          @click="showArticleDetail(article)"
        >
          <div class="article-header">
            <span class="article-id">#{{ article.id }}</span>
            <span class="article-user">用户 {{ article.userId }}</span>
          </div>
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-body">{{ truncateText(article.body, 150) }}</p>
          <div class="article-footer">
            <button class="btn btn-sm btn-read-more">阅读更多 →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <button 
        class="btn btn-page" 
        :disabled="currentPage === 1" 
        @click="handlePageChange(currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条</span>
      <button 
        class="btn btn-page" 
        :disabled="currentPage === totalPages" 
        @click="handlePageChange(currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <!-- 文章详情模态框 -->
    <div v-if="showModal && selectedArticle" class="modal-overlay" @click.self="closeModal">
      <div class="modal modal-large">
        <div class="modal-header">
          <h2>{{ selectedArticle.title }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="article-meta">
            <span class="meta-item">文章 ID: {{ selectedArticle.id }}</span>
            <span class="meta-item">作者: 用户 {{ selectedArticle.userId }}</span>
          </div>
          <div class="article-full-content">
            {{ selectedArticle.body }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-close" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message.show" :class="['message-toast', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getArticleList, type Article } from '@/api/article'

// 状态管理
const loading = ref(false)
const showModal = ref(false)
const selectedArticle = ref<Article | null>(null)
const articleList = ref<Article[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const selectedUserId = ref<number | undefined>(undefined)

const message = ref({
  show: false,
  text: '',
  type: 'success' as 'success' | 'error',
})

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取所有可用的用户ID（用于筛选）
const userIds = computed(() => {
  const ids = new Set<number>()
  articleList.value.forEach(article => ids.add(article.userId))
  return Array.from(ids).sort((a, b) => a - b)
})

// 显示消息提示
function showMessage(text: string, type: 'success' | 'error' = 'success') {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

// 截断文本
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取文章列表
async function fetchArticleList() {
  loading.value = true
  try {
    const response = await getArticleList({
      page: currentPage.value,
      pageSize: pageSize.value,
      userId: selectedUserId.value,
    })
    
    articleList.value = response.data
    total.value = response.total
    
    // 如果有搜索关键词，进行前端过滤
    if (searchKeyword.value) {
      articleList.value = articleList.value.filter(article =>
        article.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取文章列表失败'
    showMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchArticleList()
}

// 筛选变化
function handleFilterChange() {
  currentPage.value = 1
  fetchArticleList()
}

// 重置搜索
function resetSearch() {
  searchKeyword.value = ''
  selectedUserId.value = undefined
  currentPage.value = 1
  fetchArticleList()
}

// 分页切换
function handlePageChange(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchArticleList()
  }
}

// 显示文章详情
function showArticleDetail(article: Article) {
  selectedArticle.value = article
  showModal.value = true
}

// 关闭模态框
function closeModal() {
  showModal.value = false
  selectedArticle.value = null
}

// 初始化
onMounted(() => {
  fetchArticleList()
})
</script>

<style scoped>
.page-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.user-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

/* 文章列表 */
.article-list {
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 16px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.article-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #3b82f6;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.article-id {
  font-weight: 600;
  color: #3b82f6;
}

.article-user {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.article-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.4;
}

.article-body {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  flex: 1;
}

.article-footer {
  display: flex;
  justify-content: flex-end;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-outline {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-read-more {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-read-more:hover {
  background: #3b82f6;
  color: white;
}

.btn-page {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
}

.btn-page:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-close {
  background: #6b7280;
  color: white;
}

.btn-close:hover {
  background: #4b5563;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
  flex: 1;
  padding-right: 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.article-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.meta-item {
  font-size: 14px;
  color: #6b7280;
}

.article-full-content {
  font-size: 15px;
  color: #374151;
  line-height: 1.8;
  white-space: pre-wrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

/* 消息提示 */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
  z-index: 2000;
}

.message-toast.success {
  background: #10b981;
}

.message-toast.error {
  background: #ef4444;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .page-content {
    padding: 20px;
  }
}
</style>
