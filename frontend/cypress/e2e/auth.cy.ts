describe('认证功能测试', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('应该显示登录页面', () => {
    cy.contains('房源带看CRM系统')
    cy.get('[data-testid="login-form"]').should('be.visible')
    cy.get('input[name="username"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', '登录')
  })

  it('应该显示必填字段验证', () => {
    cy.get('button[type="submit"]').click()
    cy.contains('请输入用户名')
    cy.contains('请输入密码')
  })

  it('应该能够成功登录管理员账户', () => {
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.contains('工作台')
    cy.contains('管理员')
  })

  it('应该能够成功登录经纪人账户', () => {
    // 先创建一个测试经纪人账户
    cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, {
      username: 'agent_test',
      password: 'test123',
      fullName: '测试经纪人',
      roleId: 2 // 经纪人角色
    })

    cy.get('input[name="username"]').type('agent_test')
    cy.get('input[name="password"]').type('test123')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.contains('工作台')
    cy.contains('经纪人')
  })

  it('应该显示错误的登录凭据消息', () => {
    cy.get('input[name="username"]').type('wronguser')
    cy.get('input[name="password"]').type('wrongpass')
    cy.get('button[type="submit"]').click()
    
    cy.contains('用户名或密码错误')
    cy.url().should('include', '/login')
  })

  it('应该能够退出登录', () => {
    // 先登录
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    
    // 等待跳转到dashboard
    cy.url().should('include', '/dashboard')
    
    // 点击用户头像
    cy.get('[data-testid="user-avatar"]').click()
    
    // 点击退出登录
    cy.contains('退出登录').click()
    
    // 应该回到登录页面
    cy.url().should('include', '/login')
  })
}) 