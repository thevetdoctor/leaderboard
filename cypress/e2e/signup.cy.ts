describe('Form validation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should show an error message for invalid or missing input', () => {
    cy.get('[data-testid="email-input"]').type(' ');
    cy.get('[data-testid="email-input"]').blur();
    cy.get('[data-testid="email-error"]')
      .should('exist')
      .and('have.text', 'Email is required');

    cy.screenshot('signup-error-email-required');

    cy.get('[data-testid="email-input"]').type('not-an-email');
    cy.get('[data-testid="email-input"]').blur();
    cy.get('[data-testid="email-error"]')
      .should('exist')
      .and('have.text', 'Enter a valid email');

    cy.screenshot('signup-error-email-invalid');

    cy.get('[data-testid="username-input"]').type(' ');
    cy.get('[data-testid="username-input"]').blur();
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('have.text', 'Username is required');

    cy.screenshot('signup-error-username-required');

    // cy.get('[data-testid="submit-signup-button"]').click();
  });

  it('should not show an error if email is valid', () => {
    cy.get('[data-testid="email-input"]')
      .type('test@example.com')
      .should('have.value', 'test@example.com');

    cy.get('[data-testid="email-error"]').should('not.exist');
  });

  it('fills out and validates all inputs', () => {
    // Email
    cy.get('[data-testid="email-input"]')
      .type('test@example.com')
      .should('have.value', 'test@example.com');

    // Username
    cy.get('[data-testid="username-input"]')
      .type('tester123')
      .should('have.value', 'tester123');

    // Preferred Username
    cy.get('[data-testid="preferred-username-input"]')
      .type('tester')
      .should('have.value', 'tester');

    // Name
    cy.get('[data-testid="name-input"]')
      .type('Test User')
      .should('have.value', 'Test User');

    // Password
    cy.get('[data-testid="password-input"]')
      .type('StrongPassword!123')
      .should('have.value', 'StrongPassword!123');

    cy.screenshot('signup-form-filled');

    // cy.get('[data-testid="submit-signup-button"]').click();

    cy.screenshot('signup-after-submit');

    cy.get('[data-testid="signup-error"]').should('not.exist');
  });
});
