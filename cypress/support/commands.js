import 'cypress-axe';

Cypress.Commands.add('login', (username = 'grupo3', password = 'calidad123') => {
  cy.session([username, password], () => {
    cy.visit('/');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('#login-form').submit();
    cy.get('#board-view').should('be.visible');
  });
  cy.visit('/');
  cy.get('#board-view').should('be.visible');
});

Cypress.Commands.add('clearBoardData', () => {
  cy.window().then(win => {
    win.localStorage.removeItem('grupo3-tasks');
    win.sessionStorage.removeItem('grupo3-authenticated');
  });
});
