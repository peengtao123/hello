<template>
  <div class="user-manage-container">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-back" @click="goBack">← 返回</button>
        <h1>用户管理</h1>
      </div>
      <button class="btn btn-primary" @click="showCreateModal">
        <span class="icon">+</span> 新增用户
      </button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-bar">
      <input
        v-model="searchParams.username"
        type="text"
        placeholder="搜索用户名"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <select v-model="searchParams.status" class="status-select" @change="handleSearch">
        <option :value="undefined">全部状态</option>
        <option :value="1">启用</option>
        <option :value="0">禁用</option>
      </select>
      <button class="btn btn-secondary" @click="handleSearch">搜索</button>
      <button class="btn btn-outline" @click="resetSearch">重置</button>
    </div>

    <!-- 用户列表表格 -->
    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>头像</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
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
          <tr v-else-if="userList.length === 0">
            <td colspan="8" class="empty-state">暂无数据</td>
          </tr>
          <tr v-for="user in userList" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <img :src="user.avatar" :alt="user.username" class="avatar" />
            </td>
            <td>{{ user.username }}</td>
            <td>{{ user.email || '-' }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="['status-badge', user.status === 1 ? 'status-active' : 'status-inactive']">
                {{ user.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ user.createTime }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-sm btn-edit" @click="showEditModal(user)">编辑</button>
                <button class="btn btn-sm btn-reset" @click="handleResetPassword(user)">重置密码</button>
                <button class="btn btn-sm btn-delete" @click="handleDelete(user)">删除</button>
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

    <!-- 创建/编辑用户模态框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑用户' : '新增用户' }}</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="username">用户名 <span class="required">*</span></label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                :disabled="isEditing"
                placeholder="请输入用户名"
                required
              />
            </div>
            
            <div class="form-group" v-if="!isEditing">
              <label for="password">密码 <span class="required">*</span></label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">邮箱</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="请输入邮箱"
              />
            </div>

            <div class="form-group">
              <label for="role">角色</label>
              <select id="role" v-model="formData.role">
                <option value="普通用户">普通用户</option>
                <option value="管理员">管理员</option>
                <option value="测试用户">测试用户</option>
              </select>
            </div>

            <div class="form-group">
              <label for="status">状态</label>
              <select id="status" v-model="formData.status">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
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
import { useRouter } from 'vue-router'
import { getUserList, createUser, updateUser, deleteUser, resetPassword } from '@/api/user'
import type { User, CreateUserParams, UpdateUserParams } from '@/api/user'

const router = useRouter()

// 状态管理
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const currentUser = ref<User | null>(null)
const userList = ref<User[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchParams = ref<{
  username?: string
  status?: number
}>({
  username: '',
  status: undefined,
})

const formData = ref<CreateUserParams & { id?: number }>({
  username: '',
  password: '',
  email: '',
  role: '普通用户',
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

// 获取用户列表
async function fetchUserList() {
  loading.value = true
  try {
    const response = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchParams.value.username,
      status: searchParams.value.status,
    })
    
    if (response.data) {
      userList.value = response.data.list
      total.value = response.data.total
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取用户列表失败'
    showMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchUserList()
}

// 重置搜索
function resetSearch() {
  searchParams.value = {
    username: '',
    status: undefined,
  }
  currentPage.value = 1
  fetchUserList()
}

// 分页切换
function handlePageChange(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUserList()
  }
}

// 显示创建模态框
function showCreateModal() {
  isEditing.value = false
  currentUser.value = null
  formData.value = {
    username: '',
    password: '',
    email: '',
    role: '普通用户',
    status: 1,
  }
  showModal.value = true
}

// 显示编辑模态框
function showEditModal(user: User) {
  isEditing.value = true
  currentUser.value = user
  formData.value = {
    id: user.id,
    username: user.username,
    password: '', // 编辑时不需要密码
    email: user.email || '',
    role: user.role,
    status: user.status,
  }
  showModal.value = true
}

// 关闭模态框
function closeModal() {
  showModal.value = false
  currentUser.value = null
}

// 提交表单
async function handleSubmit() {
  if (!formData.value.username) {
    showMessage('请输入用户名', 'error')
    return
  }

  if (!isEditing.value && !formData.value.password) {
    showMessage('请输入密码', 'error')
    return
  }

  submitting.value = true
  try {
    if (isEditing.value && currentUser.value) {
      // 更新用户
      const updateData: UpdateUserParams = {
        email: formData.value.email,
        role: formData.value.role,
        status: formData.value.status,
      }
      await updateUser(currentUser.value.id, updateData)
      showMessage('用户更新成功')
    } else {
      // 创建用户
      const createData: CreateUserParams = {
        username: formData.value.username,
        password: formData.value.password,
        email: formData.value.email,
        role: formData.value.role,
        status: formData.value.status,
      }
      await createUser(createData)
      showMessage('用户创建成功')
    }
    
    closeModal()
    fetchUserList()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '操作失败'
    showMessage(errorMessage, 'error')
  } finally {
    submitting.value = false
  }
}

// 删除用户
async function handleDelete(user: User) {
  if (!confirm(`确定要删除用户 "${user.username}" 吗？`)) {
    return
  }

  try {
    await deleteUser(user.id)
    showMessage('用户删除成功')
    fetchUserList()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '删除失败'
    showMessage(errorMessage, 'error')
  }
}

// 重置密码
async function handleResetPassword(user: User) {
  if (!confirm(`确定要重置用户 "${user.username}" 的密码吗？`)) {
    return
  }

  try {
    const response = await resetPassword(user.id)
    if (response.data) {
      showMessage(`密码已重置为: ${response.data.password}`)
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '重置密码失败'
    showMessage(errorMessage, 'error')
  }
}

// 返回首页
function goBack() {
  router.push('/')
}

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-manage-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 16px;
}

.btn-back:hover {
  background: #e5e7eb;
}

.page-header h1 {
  font-size: 24px;
  color: #1f2937;
  margin: 0;
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

.status-select {
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

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table thead {
  background: #f9fafb;
}

.user-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 2px solid #e5e7eb;
}

.user-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
}

.user-table tbody tr:hover {
  background: #f9fafb;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
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

.btn-reset {
  background: #fef3c7;
  color: #92400e;
}

.btn-reset:hover {
  background: #fde68a;
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

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
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
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.icon {
  font-weight: bold;
  margin-right: 4px;
}
</style>
