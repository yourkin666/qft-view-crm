describe('带看记录管理测试', () => {
  beforeEach(() => {
    // 登录
    cy.visit('/login')
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    
    // 导航到带看记录页面
    cy.contains('带看记录').click()
    cy.url().should('include', '/records')
  })

  it('应该显示带看记录列表页面', () => {
    cy.contains('带看记录管理')
    cy.get('[data-testid="create-record-btn"]').should('contain', '新增记录')
    cy.get('[data-testid="export-btn"]').should('contain', '导出')
    cy.get('[data-testid="refresh-btn"]').should('contain', '刷新')
  })

  it('应该能够创建新的带看记录', () => {
    cy.get('[data-testid="create-record-btn"]').click()
    
    // 填写表单
    cy.get('input[name="tenantName"]').type('张三')
    cy.get('input[name="primaryPhone"]').type('13800138000')
    cy.get('input[name="primaryWechat"]').type('zhangsan123')
    cy.get('input[name="roomAddress"]').type('上海市浦东新区张江高科技园区')
    cy.get('input[name="propertyName"]').type('两室一厅')
    
    // 选择业务类型
    cy.get('[name="businessType"]').click()
    cy.contains('租赁').click()
    
    // 选择状态
    cy.get('[name="viewingStatus"]').click()
    cy.contains('已确认').click()
    
    // 填写备注
    cy.get('textarea[name="remarks"]').type('客户对房源很满意，预约明天下午看房')
    
    // 提交表单
    cy.get('.ant-modal-footer button').contains('确定').click()
    
    // 验证成功创建
    cy.contains('创建成功')
    cy.contains('张三')
    cy.contains('13800138000')
  })

  it('应该能够搜索和筛选记录', () => {
    // 搜索功能
    cy.get('input[placeholder*="搜索"]').type('张三')
    cy.get('.ant-input-search-button').click()
    
    // 验证搜索结果
    cy.get('.ant-table-tbody').should('contain', '张三')
    
    // 清空搜索
    cy.get('.ant-input-clear-icon').click()
    
    // 状态筛选
    cy.get('[data-testid="status-filter"]').click()
    cy.contains('已确认').click()
    
    // 验证筛选结果
    cy.get('.ant-tag').should('contain', '已确认')
  })

  it('应该能够编辑记录', () => {
    // 点击第一条记录的编辑按钮
    cy.get('[data-testid="edit-record-btn"]').first().click()
    
    // 修改客户姓名
    cy.get('input[name="tenantName"]').clear().type('李四')
    cy.get('input[name="primaryPhone"]').clear().type('13900139000')
    
    // 修改状态
    cy.get('[name="viewingStatus"]').click()
    cy.contains('已完成').click()
    
    // 提交修改
    cy.get('.ant-modal-footer button').contains('确定').click()
    
    // 验证修改成功
    cy.contains('更新成功')
    cy.contains('李四')
    cy.contains('13900139000')
  })

  it('应该能够批量操作记录', () => {
    // 选择多条记录
    cy.get('.ant-checkbox-input').eq(1).check() // 选择第一条记录
    cy.get('.ant-checkbox-input').eq(2).check() // 选择第二条记录
    
    // 点击批量操作
    cy.get('[data-testid="batch-operation-btn"]').click()
    
    // 选择状态
    cy.get('[name="status"]').click()
    cy.contains('已取消').click()
    
    // 填写备注
    cy.get('textarea[name="remarks"]').type('批量取消测试')
    
    // 确认批量操作
    cy.get('.ant-modal-footer button').contains('确定').click()
    
    // 验证批量操作成功
    cy.contains('批量更新成功')
  })

  it('应该能够删除记录', () => {
    // 点击删除按钮
    cy.get('[data-testid="delete-record-btn"]').first().click()
    
    // 确认删除
    cy.get('.ant-popconfirm-buttons button').contains('确定').click()
    
    // 验证删除成功
    cy.contains('删除成功')
  })

  it('应该能够导出数据', () => {
    cy.get('[data-testid="export-btn"]').click()
    
    // 选择导出格式
    cy.get('[name="format"]').click()
    cy.contains('Excel').click()
    
    // 确认导出
    cy.get('.ant-modal-footer button').contains('导出').click()
    
    // 验证导出成功
    cy.contains('导出成功')
  })
})

describe('移动端带看记录测试', () => {
  beforeEach(() => {
    // 设置移动端视窗
    cy.viewport(375, 812)
    
    // 登录
    cy.visit('/login')
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    
    // 导航到带看记录页面
    cy.contains('带看记录').click()
    cy.url().should('include', '/records')
  })

  it('应该显示移动端界面', () => {
    // 验证移动端顶部操作栏
    cy.get('[data-testid="mobile-action-bar"]').should('be.visible')
    cy.contains('筛选')
    cy.contains('导出')
    cy.contains('新增')
    
    // 验证卡片视图
    cy.get('[data-testid="mobile-record-card"]').should('be.visible')
  })

  it('应该能够打开筛选抽屉', () => {
    cy.contains('筛选').click()
    cy.get('.ant-drawer-content').should('be.visible')
    cy.contains('筛选条件')
    
    // 关闭抽屉
    cy.get('.ant-drawer-close').click()
    cy.get('.ant-drawer-content').should('not.be.visible')
  })

  it('应该能够在移动端创建记录', () => {
    cy.contains('新增').click()
    
    // 验证移动端表单布局
    cy.get('.ant-modal').should('have.css', 'max-width')
    
    // 填写表单
    cy.get('input[name="tenantName"]').type('移动端测试用户')
    cy.get('input[name="primaryPhone"]').type('13700137000')
    cy.get('input[name="roomAddress"]').type('移动端测试地址')
    
    // 提交
    cy.get('.ant-modal-footer button').contains('确定').click()
    
    // 验证创建成功
    cy.contains('创建成功')
  })
}) 