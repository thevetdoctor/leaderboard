import ErrorMessage from '../../src/components/Error';

describe('Error.cy.tsx', () => {
  it('renders correctly', () => {
    cy.mount(<ErrorMessage id="password-error" touched={false} message="" />);

    // use .should('not.exist') when not touched
    cy.get('[data-testid="password-error"]').should('not.exist');

    cy.mount(
      <ErrorMessage
        id="password-error"
        touched={true}
        message="Password is required"
      />,
    );

    // Optional: assert that the error message is visible
    cy.get('[data-testid="password-error"]').should(
      'contain.text',
      'Password is required',
    );
  });
});
