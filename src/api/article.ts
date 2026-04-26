import axios from 'axios'

// 文章接口定义
export interface Article {
  userId: number
  id: number
  title: string
  body: string
}

// 文章列表响应接口
export interface ArticleListResponse {
  data: Article[]
  total: number
  page: number
  pageSize: number
}

// 获取文章列表参数
export interface GetArticleListParams {
  page?: number
  pageSize?: number
  userId?: number
}

/**
 * 获取文章列表
 * @param params - 查询参数
 */
export async function getArticleList(params?: GetArticleListParams): Promise<ArticleListResponse> {
  const { page = 1, pageSize = 10, userId } = params || {}
  
  // JSONPlaceholder API 基础URL
  const baseURL = 'https://jsonplaceholder.typicode.com'
  
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams()
    if (userId) {
      queryParams.append('userId', userId.toString())
    }
    
    // 获取所有文章(或按用户筛选)
    const response = await axios.get<Article[]>(
      `${baseURL}/posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    )
    
    const allArticles = response.data
    
    // 手动分页处理
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedArticles = allArticles.slice(start, end)
    
    return {
      data: paginatedArticles,
      total: allArticles.length,
      page,
      pageSize,
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    throw new Error('获取文章列表失败')
  }
}

/**
 * 获取单篇文章详情
 * @param id - 文章ID
 */
export async function getArticleById(id: number): Promise<Article> {
  const baseURL = 'https://jsonplaceholder.typicode.com'
  
  try {
    const response = await axios.get<Article>(`${baseURL}/posts/${id}`)
    return response.data
  } catch (error) {
    console.error('获取文章详情失败:', error)
    throw new Error('获取文章详情失败')
  }
}

/**
 * 根据用户ID获取文章列表
 * @param userId - 用户ID
 */
export async function getArticlesByUserId(userId: number): Promise<Article[]> {
  const baseURL = 'https://jsonplaceholder.typicode.com'
  
  try {
    const response = await axios.get<Article[]>(`${baseURL}/posts?userId=${userId}`)
    return response.data
  } catch (error) {
    console.error('获取用户文章失败:', error)
    throw new Error('获取用户文章失败')
  }
}
