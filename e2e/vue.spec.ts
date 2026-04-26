import { test, expect } from '@playwright/test'

// 查看如何开始：
// https://playwright.dev/docs/intro

test.describe('Vue应用端到端测试', () => {
  // 测试1: 访问首页
  test('访问应用根URL并显示首页', async ({ page }) => {
    await page.goto('/')
    
    // 验证页面标题
    await expect(page.locator('h1')).toHaveText('You did it!')
    
    // 验证导航链接存在
    await expect(page.locator('nav a[href="/"]')).toBeVisible()
    await expect(page.locator('nav a[href="/about"]')).toBeVisible()
  })

  // 测试2: 导航到关于页面
  test('导航到关于页面', async ({ page }) => {
    await page.goto('/')
    
    // 点击 About 链接
    await page.locator('nav a[href="/about"]').click()
    
    // 验证 URL 已更改
    await expect(page).toHaveURL(/.*\/about/)
    
    // 验证关于页面内容
    await expect(page.locator('h1')).toHaveText('This is an about page')
  })

  // 测试3: 从关于页面返回首页
  test('从关于页面导航回首页', async ({ page }) => {
    await page.goto('/about')
    
    // 点击 Home 链接
    await page.locator('nav a[href="/"]').click()
    
    // 验证 URL 已更改回首页
    await expect(page).toHaveURL(/.*\/$/)
    
    // 验证首页内容
    await expect(page.locator('h1')).toHaveText('You did it!')
  })

  // 测试4: 验证欢迎卡片内容
  test('在首页显示欢迎项目', async ({ page }) => {
    await page.goto('/')
    
    // 验证文档部分
    await expect(page.getByText('Documentation')).toBeVisible()
    await expect(page.getByRole('link', { name: 'official documentation' })).toBeVisible()
    
    // 验证工具部分
    await expect(page.getByText('Tooling')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Vite' })).toBeVisible()
    
    // 验证生态系统部分
    await expect(page.getByText('Ecosystem')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pinia' })).toBeVisible()
    
    // 验证社区部分
    await expect(page.getByText('Community')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Vue Land' })).toBeVisible()
    
    // 验证支持部分
    await expect(page.getByText('Support Vue')).toBeVisible()
    await expect(page.getByRole('link', { name: 'becoming a sponsor' })).toBeVisible()
  })

  // 测试5: 验证外部链接
  test('外部链接具有正确的属性', async ({ page }) => {
    await page.goto('/')
    
    // 获取所有外部链接
    const externalLinks = page.locator('a[target="_blank"]')
    const count = await externalLinks.count()
    
    // 验证至少有一个外部链接
    expect(count).toBeGreaterThan(0)
    
    // 验证第一个外部链接的属性
    const firstLink = externalLinks.first()
    await expect(firstLink).toHaveAttribute('target', '_blank')
    await expect(firstLink).toHaveAttribute('rel', 'noopener')
  })

  // 测试6: 验证响应式布局
  test('在不同视口尺寸下页面具有响应式', async ({ page }) => {
    await page.goto('/')
    
    // 测试桌面端视图
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('header')).toBeVisible()
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('header')).toBeVisible()
    
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('header')).toBeVisible()
  })

  // 测试7: 验证页面加载性能
  test('页面在可接受的时间内加载', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    // 验证页面加载时间在合理范围内（5秒内）
    expect(loadTime).toBeLessThan(5000)
    
    // 验证关键内容已加载
    await expect(page.locator('h1')).toBeVisible()
  })

  // 测试8: 验证路由激活状态
  test('活动路由链接具有正确的样式', async ({ page }) => {
    await page.goto('/')
    
    // 验证 Home 链接处于激活状态
    const homeLink = page.locator('nav a[href="/"]')
    await expect(homeLink).toHaveClass(/router-link-exact-active/)
    
    // 导航到 About 页面
    await page.locator('nav a[href="/about"]').click()
    
    // 验证 About 链接处于激活状态
    const aboutLink = page.locator('nav a[href="/about"]')
    await expect(aboutLink).toHaveClass(/router-link-exact-active/)
  })

  // 测试9: 验证浏览器历史记录
  test('浏览器前进和后退导航正常工作', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('You did it!')
    
    // 导航到 About 页面
    await page.locator('nav a[href="/about"]').click()
    await expect(page.locator('h1')).toHaveText('This is an about page')
    
    // 使用浏览器后退
    await page.goBack()
    await expect(page).toHaveURL(/.*\/$/)
    await expect(page.locator('h1')).toHaveText('You did it!')
    
    // 使用浏览器前进
    await page.goForward()
    await expect(page).toHaveURL(/.*\/about/)
    await expect(page.locator('h1')).toHaveText('This is an about page')
  })

  // 测试10: 验证页面元数据
  test('页面具有正确的元数据', async ({ page }) => {
    await page.goto('/')
    
    // 验证页面标题
    await expect(page).toHaveTitle(/Vite App/)
    
    // 验证 charset
    await expect(page.locator('meta[charset]')).toHaveAttribute('charset', 'UTF-8')
  })
})
