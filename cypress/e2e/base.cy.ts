describe('Base test', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173');

    cy.get('[data-testid="signup-header"]')
      .should('exist')
      .should('contain', 'Signup');
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="username-input"]').should('exist');
    cy.get('[data-testid="preferred-username-input"]').should('exist');
    cy.get('[data-testid="name-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="submit-signup-button"]')
      .should('exist')
      .should('contain', 'Sign Up');
    cy.get('[data-testid="submit-login-button"]')
      .should('exist')
      .should('contain', 'Login');
    // cy.get('[data-testid="scoreboard-header"]').should('exist').should('contain', 'Scoreboard')
    // cy.get('[data-testid="records-count"]').should('exist')
    // cy.get('[data-testid="scoreboard-header"]').should('exist') .should('contain', 'Username')
    // cy.get('[data-testid="scoreboard-header"]').should('exist') .should('contain', 'Score')
    // cy.get('[data-testid="logout-button"]').should('not.exist')
    // cy.get('[data-testid="submit-score-button"]').should('not.exist')
    // cy.get('[data-testid="signup-header"]').should('contain', 'Signup')
    // cy.get('[data-testid="login-header"]').should('contain', 'Login')
    // cy.get('[data-testid="submit-header"]').should('contain', 'Submit Score')
  });
});
