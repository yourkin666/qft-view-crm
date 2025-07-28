/// <reference types="cypress" />

// Custom commands for the CRM application

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with username and password
       * @example cy.login('admin', 'admin123')
       */
      login(username: string, password: string): Chainable<void>
      
      /**
       * Custom command to create a viewing record
       * @example cy.createViewingRecord({customerName: '张三', ...})
       */
      createViewingRecord(record: any): Chainable<void>
      
      /**
       * Custom command to wait for API response
       * @example cy.waitForApi('/api/viewing-records')
       */
      waitForApi(endpoint: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('createViewingRecord', (record: any) => {
  cy.intercept('POST', '/api/viewing-records').as('createRecord')
  
  cy.get('[data-testid="create-record-btn"]').click()
  
  if (record.customerName) {
    cy.get('input[name="tenantName"]').type(record.customerName)
  }
  if (record.customerPhone) {
    cy.get('input[name="primaryPhone"]').type(record.customerPhone)
  }
  if (record.customerWechat) {
    cy.get('input[name="primaryWechat"]').type(record.customerWechat)
  }
  if (record.propertyAddress) {
    cy.get('input[name="roomAddress"]').type(record.propertyAddress)
  }
  if (record.propertyType) {
    cy.get('input[name="propertyName"]').type(record.propertyType)
  }
  if (record.businessType) {
    cy.get('[name="businessType"]').click()
    cy.contains(record.businessType).click()
  }
  if (record.viewingStatus) {
    cy.get('[name="viewingStatus"]').click()
    cy.contains(record.viewingStatus).click()
  }
  if (record.remarks) {
    cy.get('textarea[name="remarks"]').type(record.remarks)
  }
  
  cy.get('.ant-modal-footer button').contains('确定').click()
  cy.wait('@createRecord')
})

Cypress.Commands.add('waitForApi', (endpoint: string) => {
  cy.intercept('GET', `*${endpoint}*`).as('apiCall')
  cy.wait('@apiCall')
})

// Add data-testid attributes to components for better testing
Cypress.Commands.overwrite('contains', (originalFn, subject, filter, text, options = {}) => {
  if (typeof text === 'object') {
    options = text
    text = filter
    filter = undefined
  }
  
  options.matchCase = false
  return originalFn(subject, filter, text, options)
}) 