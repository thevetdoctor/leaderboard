describe('Form validation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show an error message for missing email', () => {
    cy.get('[data-testid="email-input"]').type(' ');
    cy.get('[data-testid="email-input"]').blur();
    cy.get('[data-testid="email-error"]')
      .should('exist')
      .and('have.text', 'Email is required');

    cy.screenshot('signup-error-email-required');
  });
  it('should show error messages for all invalid email', () => {
    cy.get('[data-testid="email-input"]').type('not-an-email');
    cy.get('[data-testid="email-input"]').blur();
    cy.get('[data-testid="email-error"]')
      .should('exist')
      .and('have.text', 'Enter a valid email');

    cy.screenshot('signup-error-email-invalid');
  });

  it('should show an error message for missing username', () => {
    cy.get('[data-testid="username-input"]').type(' ');
    cy.get('[data-testid="username-input"]').blur();
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('have.text', 'Username is required');

    cy.screenshot('signup-error-username-required');
  });

  it('should show an error message for missing preferred username', () => {
    cy.get('[data-testid="preferred-username-input"]').type(' ');
    cy.get('[data-testid="preferred-username-input"]').blur();
    cy.get('[data-testid="preferred-username-error"]')
      .should('exist')
      .and('have.text', 'Preferred username is required');

    cy.screenshot('signup-error-preferred-username-required');
  });

  it('should show an error message for missing name', () => {
    cy.get('[data-testid="name-input"]').type(' ');
    cy.get('[data-testid="name-input"]').blur();
    cy.get('[data-testid="name-error"]')
      .should('exist')
      .and('have.text', 'Name is required');

    cy.screenshot('signup-error-name-required');
  });

  it('should show an error message for missing password', () => {
    cy.get('[data-testid="password-input"]').type(' ');
    cy.get('[data-testid="password-input"]').blur();
    cy.get('[data-testid="password-error"]')
      .should('exist')
      .and('have.text', 'Password is required');

    cy.screenshot('signup-error-password-required');
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

    cy.screenshot('signup-error-password-invalid');
  });

  it('should show an error message for invalid signup fields', () => {
    cy.get('[data-testid="submit-signup-button"]').click();

     cy.get('[data-testid="email-error"]')
      .should('exist')
      .and('have.text', 'Email is required');
       cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('have.text', 'Username is required');
        cy.get('[data-testid="preferred-username-error"]')
      .should('exist')
      .and('have.text', 'Preferred username is required');
       cy.get('[data-testid="name-error"]')
      .should('exist')
      .and('have.text', 'Name is required');
          cy.get('[data-testid="password-error"]')
      .should('exist')
      .and(
        'have.text',
        'Password is required',
      );

    cy.screenshot('signup-error-submit-invalid');
  });

  it('fills out and validates all inputs', () => {
    // Email
    cy.get('[data-testid="email-input"]')
      .type('test@example.com')
      .should('have.value', 'test@example.com');

    cy.get('[data-testid="email-error"]').should('not.exist');

    // Username
    cy.get('[data-testid="username-input"]')
      .type('tester123')
      .should('have.value', 'tester123');

    cy.get('[data-testid="username-error"]').should('not.exist');

    // Preferred Username
    cy.get('[data-testid="preferred-username-input"]')
      .type('tester')
      .should('have.value', 'tester');

    cy.get('[data-testid="preferred-username-error"]').should('not.exist');

    // Name
    cy.get('[data-testid="name-input"]')
      .type('Test User')
      .should('have.value', 'Test User');

    cy.get('[data-testid="name-error"]').should('not.exist');

    // Password
    cy.get('[data-testid="password-input"]')
      .type('StrongPassword!123')
      .should('have.value', 'StrongPassword!123');

    cy.get('[data-testid="password-error"]').should('not.exist');

    cy.screenshot('signup-form-filled');

    // cy.get('[data-testid="submit-signup-button"]').click();

    cy.get('[data-testid="signup-error"]').should('not.exist');

    cy.screenshot('signup-after-submit');

  });
});
