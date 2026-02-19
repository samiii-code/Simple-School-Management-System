describe('Smoke: login', () => {
  it('logs in as admin and reaches admin area', () => {
    cy.visit('/login');

    cy.get('input[formcontrolname="email"]').type('admin@school.com');
    cy.get('input[formcontrolname="password"]').type('Admin123!');
    cy.contains('button', 'Login').click();

    cy.location('pathname', { timeout: 10000 }).should('contain', '/admin');
    cy.contains('Users', { timeout: 10000 }).should('exist');
  });
});

