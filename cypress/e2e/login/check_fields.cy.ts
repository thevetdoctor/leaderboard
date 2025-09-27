describe('Base test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('passes', () => {
    // cy.setLocalStorage('user_id', '12345');

    cy.visit('/');

    cy.get('[data-testid="submit-login-button"]').click();

    cy.get('[data-testid="login-header"]')
      .should('exist')
      .should('contain', 'Login');
    cy.get('[data-testid="username-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="submit-signup-button"]')
      .should('exist')
      .should('contain', 'Sign Up');
    cy.get('[data-testid="submit-login-button"]')
      .should('exist')
      .should('contain', 'Login');
  });
});
