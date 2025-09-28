describe('Base test', () => {
  it('passes', () => {
    cy.visit('/');

    cy.get('[data-testid="signup-header"]')
      .should('exist')
      .should('contain', 'Signup');
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="username-input"]').should('exist');
    cy.get('[data-testid="preferred_username-input"]').should('exist');
    cy.get('[data-testid="name-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="submit-signup-button"]')
      .should('exist')
      .should('contain', 'Sign Up');
    cy.get('[data-testid="submit-login-button"]')
      .should('exist')
      .should('contain', 'Login');

    cy.screenshot('signup-form-filled');
  });
});
