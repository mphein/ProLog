describe('Login Page', () => {
  it('logs in with valid credentials', () => {
    cy.visit('http://localhost:5173'); // Update the URL if needed
    cy.contains('Don’t have an account? Sign up').click();

    // Assert that the URL changes to the registration page
    cy.url().should('include', '/register');
    cy.get('input[type="text"]').type('testuser'); // This will type "testuser" into the text input
    cy.get('input[type="email"]').type('testemail@cy.com'); // This will type "testuser" into the text input
    cy.get('input[type="password"]').type('cypress123'); // This will type "testuser" into the text input
    cy.get('button').contains('Create Account').click();
    cy.url().should('include', '/login'); // Adjust as needed


    cy.get('input[placeholder="Username"]').type('testuser');
    cy.get('input[placeholder="Password"]').type('cypress123');
    cy.get('button').contains('Log In').click();

    cy.url().should('include', '/dashboard'); // Adjust as needed
  });
});
