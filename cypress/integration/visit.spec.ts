describe('Open In Browser', () => {
  it('Open', () => {
    cy.visit('http://localhost:3000')
    cy.get('#e2e_tst_class_grade_id').focus().click()
    cy.get('#e2e_tst_class_grade_id_2').click()
    cy.get('#e2e_tst_class_class_id').clear().type('11')
    cy.get('#e2e_tst_class_password').clear().type('202011')
    cy.get('#e2e_tst_class_login_btn').focus().click()
    // cy.get('.el-message-box__btns').get('button').click()
    cy.get('.el-message-box__btns').within(() => {
      cy.get('button').click()
    })
  })
})
