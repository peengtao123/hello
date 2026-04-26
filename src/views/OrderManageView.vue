<template>
  <div class="page-content">
    <div class="page-header">
      <h1>订单管理</h1>
      <p class="page-description">查看和管理订单信息，包括订单状态跟踪</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-bar">
      <input
        v-model="searchParams.orderNo"
        type="text"
        placeholder="搜索订单号"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <select v-model="searchParams.status" class="status-select" @change="handleSearch">
        <option :value="undefined">全部状态</option>
        <option value="pending">待支付</option>
        <option value="paid">已支付</option>
        <option value="shipped">已发货</option>
        <option value="completed">已完成</option>
        <option value="cancelled">已取消</option>
      </select>
      <button class="btn btn-secondary" @click="handleSearch">搜索</button>
      <button class="btn btn-outline" @click="resetSearch">重置</button>
    </div>

    <!-- 订单列表表格 -->
    <div class="table-container">
      <table class="order-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>用户</th>
            <th>商品数量</th>
            <th>订单金额</th>
            <th>下单时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="7">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </td>
          </tr>
          <tr v-else-if="orderList.length === 0">
            <td colspan="7" class="empty-state">暂无数据</td>
          </tr>
          <tr v-for="order in orderList" :key="order.id">
            <td>{{ order.orderNo }}</td>
            <td>{{ order.username }}</td>
            <td>{{ order.itemCount }}</td>
            <td>¥{{ order.amount.toFixed(2) }}</td>
            <td>{{ order.createTime }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(order.status)]">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-sm btn-view" @click="viewOrderDetail(order)">查看详情</button>
                <button 
                  v-if="order.status === 'pending'" 
                  class="btn btn-sm btn-cancel"
                  @click="cancelOrder(order)"
                >
                  取消订单
                </button>
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

    <!-- 订单详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal modal-large">
        <div class="modal-header">
          <h2>订单详情</h2>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="currentOrder">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">订单号：</span>
                <span class="value">{{ currentOrder.orderNo }}</span>
              </div>
              <div class="detail-item">
                <span class="label">用户：</span>
                <span class="value">{{ currentOrder.username }}</span>
              </div>
              <div class="detail-item">
                <span class="label">下单时间：</span>
                <span class="value">{{ currentOrder.createTime }}</span>
              </div>
              <div class="detail-item">
                <span class="label">订单状态：</span>
                <span class="value">
                  <span :class="['status-badge', getStatusClass(currentOrder.status)]">
                    {{ getStatusText(currentOrder.status) }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>商品信息</h3>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th>单价</th>
                  <th>数量</th>
                  <th>小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentOrder.items" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>¥{{ item.price.toFixed(2) }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>¥{{ (item.price * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="detail-section">
            <h3>金额汇总</h3>
            <div class="amount-summary">
              <div class="summary-item">
                <span>商品总额：</span>
                <span>¥{{ currentOrder.amount.toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span>运费：</span>
                <span>¥0.00</span>
              </div>
              <div class="summary-item total">
                <span>实付金额：</span>
                <span class="total-amount">¥{{ currentOrder.amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
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

// 订单接口定义
interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Order {
  id: number
  orderNo: string
  username: string
  itemCount: number
  amount: number
  createTime: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  items: OrderItem[]
}

// 状态管理
const loading = ref(false)
const showDetailModal = ref(false)
const currentOrder = ref<Order | null>(null)
const orderList = ref<Order[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchParams = ref<{
  orderNo?: string
  status?: string
}>({
  orderNo: '',
  status: undefined,
})

const message = ref({
  show: false,
  text: '',
  type: 'success' as 'success' | 'error',
})

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取状态文本
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 获取状态样式类
function getStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    pending: 'status-pending',
    paid: 'status-paid',
    shipped: 'status-shipped',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }
  return classMap[status] || ''
}

// 显示消息提示
function showMessage(text: string, type: 'success' | 'error' = 'success') {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

// 模拟获取订单列表
async function fetchOrderList() {
  loading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockData: Order[] = [
      {
        id: 1,
        orderNo: 'ORD202604260001',
        username: '张三',
        itemCount: 2,
        amount: 8898,
        createTime: '2026-04-26 10:30:00',
        status: 'pending',
        items: [
          { id: 1, name: 'iPhone 15 Pro', price: 7999, quantity: 1 },
          { id: 2, name: '手机壳', price: 899, quantity: 1 },
        ]
      },
      {
        id: 2,
        orderNo: 'ORD202604260002',
        username: '李四',
        itemCount: 1,
        amount: 14999,
        createTime: '2026-04-25 15:20:00',
        status: 'paid',
        items: [
          { id: 3, name: 'MacBook Pro', price: 14999, quantity: 1 },
        ]
      },
      {
        id: 3,
        orderNo: 'ORD202604260003',
        username: '王五',
        itemCount: 3,
        amount: 2697,
        createTime: '2026-04-24 09:15:00',
        status: 'shipped',
        items: [
          { id: 4, name: 'Nike运动鞋', price: 899, quantity: 3 },
        ]
      },
      {
        id: 4,
        orderNo: 'ORD202604260004',
        username: '赵六',
        itemCount: 5,
        amount: 340,
        createTime: '2026-04-23 14:45:00',
        status: 'completed',
        items: [
          { id: 5, name: '有机大米', price: 68, quantity: 5 },
        ]
      },
      {
        id: 5,
        orderNo: 'ORD202604260005',
        username: '孙七',
        itemCount: 1,
        amount: 3999,
        createTime: '2026-04-22 11:00:00',
        status: 'cancelled',
        items: [
          { id: 6, name: '沙发套装', price: 3999, quantity: 1 },
        ]
      },
    ]
    
    orderList.value = mockData
    total.value = mockData.length
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取订单列表失败'
    showMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchOrderList()
}

// 重置搜索
function resetSearch() {
  searchParams.value = {
    orderNo: '',
    status: undefined,
  }
  currentPage.value = 1
  fetchOrderList()
}

// 分页切换
function handlePageChange(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchOrderList()
  }
}

// 查看订单详情
function viewOrderDetail(order: Order) {
  currentOrder.value = order
  showDetailModal.value = true
}

// 关闭详情模态框
function closeDetailModal() {
  showDetailModal.value = false
  currentOrder.value = null
}

// 取消订单
async function cancelOrder(order: Order) {
  if (!confirm(`确定要取消订单 "${order.orderNo}" 吗？`)) {
    return
  }

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    showMessage('订单已取消')
    fetchOrderList()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '取消订单失败'
    showMessage(errorMessage, 'error')
  }
}

// 初始化
onMounted(() => {
  fetchOrderList()
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

.order-table {
  width: 100%;
  border-collapse: collapse;
}

.order-table thead {
  background: #f9fafb;
}

.order-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 2px solid #e5e7eb;
}

.order-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
}

.order-table tbody tr:hover {
  background: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-paid {
  background: #dbeafe;
  color: #1e40af;
}

.status-shipped {
  background: #e0e7ff;
  color: #3730a3;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
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

.btn-view {
  background: #dbeafe;
  color: #1e40af;
}

.btn-view:hover {
  background: #bfdbfe;
}

.btn-cancel {
  background: #fee2e2;
  color: #991b1b;
}

.btn-cancel:hover {
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

.modal-large {
  max-width: 800px;
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

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-size: 14px;
  color: #6b7280;
  margin-right: 8px;
}

.detail-item .value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th,
.detail-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.detail-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.amount-summary {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #6b7280;
}

.summary-item.total {
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 600;
  color: #1f2937;
}

.total-amount {
  font-size: 18px;
  color: #ef4444;
  font-weight: 700;
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
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
