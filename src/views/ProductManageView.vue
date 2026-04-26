<template>
  <div class="page-content">
    <div class="page-header">
      <h1>商品管理</h1>
      <p class="page-description">管理系统商品信息，包括新增、编辑、删除等操作</p>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn btn-primary" @click="showCreateModal">
        <span class="icon">+</span> 新增商品
      </button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-bar">
      <input
        v-model="searchParams.name"
        type="text"
        placeholder="搜索商品名称"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <select v-model="searchParams.category" class="category-select" @change="handleSearch">
        <option :value="undefined">全部分类</option>
        <option value="电子产品">电子产品</option>
        <option value="服装">服装</option>
        <option value="食品">食品</option>
        <option value="家居">家居</option>
      </select>
      <button class="btn btn-secondary" @click="handleSearch">搜索</button>
      <button class="btn btn-outline" @click="resetSearch">重置</button>
    </div>

    <!-- 商品列表表格 -->
    <div class="table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>商品图片</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>库存</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="8">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </td>
          </tr>
          <tr v-else-if="productList.length === 0">
            <td colspan="8" class="empty-state">暂无数据</td>
          </tr>
          <tr v-for="product in productList" :key="product.id">
            <td>{{ product.id }}</td>
            <td>
              <img :src="product.image" :alt="product.name" class="product-image" />
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>¥{{ product.price.toFixed(2) }}</td>
            <td>{{ product.stock }}</td>
            <td>
              <span :class="['status-badge', product.status === 1 ? 'status-active' : 'status-inactive']">
                {{ product.status === 1 ? '上架' : '下架' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-sm btn-edit" @click="showEditModal(product)">编辑</button>
                <button class="btn btn-sm btn-delete" @click="handleDelete(product)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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

    <!-- 创建/编辑商品模态框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑商品' : '新增商品' }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">商品名称 <span class="required">*</span></label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="请输入商品名称"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="category">分类 <span class="required">*</span></label>
              <select id="category" v-model="formData.category" required>
                <option value="">请选择分类</option>
                <option value="电子产品">电子产品</option>
                <option value="服装">服装</option>
                <option value="食品">食品</option>
                <option value="家居">家居</option>
              </select>
            </div>

            <div class="form-group">
              <label for="price">价格 <span class="required">*</span></label>
              <input
                id="price"
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                placeholder="请输入价格"
                required
              />
            </div>

            <div class="form-group">
              <label for="stock">库存 <span class="required">*</span></label>
              <input
                id="stock"
                v-model.number="formData.stock"
                type="number"
                min="0"
                placeholder="请输入库存数量"
                required
              />
            </div>

            <div class="form-group">
              <label for="status">状态</label>
              <select id="status" v-model="formData.status">
                <option :value="1">上架</option>
                <option :value="0">下架</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-cancel" @click="closeModal">取消</button>
              <button type="submit" class="btn btn-submit" :disabled="submitting">
                {{ submitting ? '提交中...' : (isEditing ? '保存' : '创建') }}
              </button>
            </div>
          </form>
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

// 商品接口定义
interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: number
  image: string
}

interface CreateProductParams {
  name: string
  category: string
  price: number
  stock: number
  status: number
}

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const currentProduct = ref<Product | null>(null)
const productList = ref<Product[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchParams = ref<{
  name?: string
  category?: string
}>({
  name: '',
  category: undefined,
})

const formData = ref<CreateProductParams & { id?: number }>({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: 1,
})

const message = ref({
  show: false,
  text: '',
  type: 'success' as 'success' | 'error',
})

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 显示消息提示
function showMessage(text: string, type: 'success' | 'error' = 'success') {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

// 模拟获取商品列表
async function fetchProductList() {
  loading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockData: Product[] = [
      { id: 1, name: 'iPhone 15 Pro', category: '电子产品', price: 7999, stock: 100, status: 1, image: 'https://via.placeholder.com/40' },
      { id: 2, name: 'MacBook Pro', category: '电子产品', price: 14999, stock: 50, status: 1, image: 'https://via.placeholder.com/40' },
      { id: 3, name: 'Nike运动鞋', category: '服装', price: 899, stock: 200, status: 1, image: 'https://via.placeholder.com/40' },
      { id: 4, name: '有机大米', category: '食品', price: 68, stock: 500, status: 1, image: 'https://via.placeholder.com/40' },
      { id: 5, name: '沙发套装', category: '家居', price: 3999, stock: 30, status: 0, image: 'https://via.placeholder.com/40' },
    ]
    
    productList.value = mockData
    total.value = mockData.length
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取商品列表失败'
    showMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchProductList()
}

// 重置搜索
function resetSearch() {
  searchParams.value = {
    name: '',
    category: undefined,
  }
  currentPage.value = 1
  fetchProductList()
}

// 分页切换
function handlePageChange(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchProductList()
  }
}

// 显示创建模态框
function showCreateModal() {
  isEditing.value = false
  currentProduct.value = null
  formData.value = {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    status: 1,
  }
  showModal.value = true
}

// 显示编辑模态框
function showEditModal(product: Product) {
  isEditing.value = true
  currentProduct.value = product
  formData.value = {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    status: product.status,
  }
  showModal.value = true
}

// 关闭模态框
function closeModal() {
  showModal.value = false
  currentProduct.value = null
}

// 提交表单
async function handleSubmit() {
  if (!formData.value.name) {
    showMessage('请输入商品名称', 'error')
    return
  }

  if (!formData.value.category) {
    showMessage('请选择分类', 'error')
    return
  }

  submitting.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (isEditing.value && currentProduct.value) {
      showMessage('商品更新成功')
    } else {
      showMessage('商品创建成功')
    }
    
    closeModal()
    fetchProductList()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '操作失败'
    showMessage(errorMessage, 'error')
  } finally {
    submitting.value = false
  }
}

// 删除商品
async function handleDelete(product: Product) {
  if (!confirm(`确定要删除商品 "${product.name}" 吗？`)) {
    return
  }

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    showMessage('商品删除成功')
    fetchProductList()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '删除失败'
    showMessage(errorMessage, 'error')
  }
}

// 初始化
onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.page-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 180px);
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

/* 操作按钮栏 */
.action-bar {
  margin-bottom: 20px;
}

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

.category-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table thead {
  background: #f9fafb;
}

.product-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 2px solid #e5e7eb;
}

.product-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
}

.product-table tbody tr:hover {
  background: #f9fafb;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
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

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
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
  padding: 4px 12px;
  font-size: 12px;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
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

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

/* 加载状态 */
.loading-row td {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
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
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
  
  .page-content {
    padding: 20px;
  }
}
</style>
