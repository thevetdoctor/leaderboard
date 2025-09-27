describe('Form validation', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.get('[data-testid="submit-login-button"]').click();

  });

  it('should show an error message for missing username', () => {
    cy.get('[data-testid="username-input"]').type(' ');
    cy.get('[data-testid="username-input"]').blur();
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('have.text', 'Username is required');

    cy.screenshot('login-error-username-required');
  });

  it('should show an error message for missing password', () => {
    cy.get('[data-testid="password-input"]').type(' ');
    cy.get('[data-testid="password-input"]').blur();
    cy.get('[data-testid="password-error"]')
      .should('exist')
      .and('have.text', 'Password is required');

    cy.screenshot('login-error-password-required');
  });

  it('should show an error message for invalid password', () => {
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="password-input"]').blur();
    cy.get('[data-testid="password-error"]')
      .should('exist')
      .and(
        'have.text',
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
      );

    cy.screenshot('login-error-password-invalid');
  });

  it('fills out and validates all inputs', () => {
    // Username
    cy.get('[data-testid="username-input"]')
      .type('tester123')
      .should('have.value', 'tester123');

    cy.get('[data-testid="username-error"]').should('not.exist');

    // Password
    cy.get('[data-testid="password-input"]')
      .type('StrongPassword!123')
      .should('have.value', 'StrongPassword!123');

    cy.get('[data-testid="password-error"]').should('not.exist');

    cy.screenshot('login-form-filled');

    // cy.get('[data-testid="submit-login-button"]').click();

    cy.get('[data-testid="login-error"]').should('not.exist');

    // cy.screenshot('login-after-submit');
  });
});
