describe('Tablero de tareas del Grupo 3', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
    cy.clearBoardData();
    cy.visit('/');
  });

  it('permite el acceso con credenciales correctas', () => {
    cy.get('#username').type('grupo3');
    cy.get('#password').type('calidad123');
    cy.get('#login-form').submit();
    cy.get('#board-view').should('be.visible');
  });

  it('rechaza combinaciones de usuario y contraseña definidas en fixture', () => {
    cy.fixture('login-cases.json').then(cases => {
      cases.filter(item => !item.valid).forEach(item => {
        cy.get('#username').clear().type(item.username);
        if (item.password) cy.get('#password').clear().type(item.password);
        else cy.get('#password').clear();
        cy.get('#login-form').submit();
        cy.get('#login-error').should('be.visible');
        cy.get('#board-view').should('not.be.visible');
      });
    });
  });

  it('crea tareas pendientes usando varios datos del fixture', () => {
    cy.login();
    cy.fixture('tasks.json').then(tasks => {
      tasks.forEach(task => {
        cy.get('#task-title').clear().type(task.title);
        cy.get('#task-form').submit();
        cy.get('#task-list').should('contain.text', task.title);
        cy.get('#task-list .status-badge').first().should('have.text', task.expectedStatus);
      });
      cy.get('#count-pending').should('have.text', String(tasks.length));
    });
  });

  it('cambia el estado y actualiza los contadores', () => {
    cy.login();
    cy.get('#task-title').type('Validar contadores');
    cy.get('#task-form').submit();
    cy.get('.status-select').select('progress');
    cy.get('#count-pending').should('have.text', '0');
    cy.get('#count-progress').should('have.text', '1');
    cy.get('#count-done').should('have.text', '0');
    cy.get('.status-select').select('done');
    cy.get('#count-progress').should('have.text', '0');
    cy.get('#count-done').should('have.text', '1');
  });

  it('filtra las tareas por el estado elegido', () => {
    cy.login();
    cy.get('#task-title').type('Tarea pendiente'); cy.get('#task-form').submit();
    cy.get('.status-select').select('progress');
    cy.get('#task-title').type('Tarea en marcha'); cy.get('#task-form').submit();
    cy.get('[data-filter="progress"]').click();
    cy.get('#task-list .task-row').should('have.length', 1).and('contain.text', 'Tarea en marcha');
    cy.get('#count-progress').should('have.text', '1'); cy.get('#count-pending').should('have.text', '0');
  });

  it('rechaza crear una tarea sin título', () => {
    cy.login(); cy.get('#task-form').submit();
    cy.get('#task-error').should('be.visible'); cy.get('#task-list .task-row').should('have.length', 0);
  });

  it('guarda tareas en localStorage al recargar', () => {
    cy.login(); cy.get('#task-title').type('Persistencia local'); cy.get('#task-form').submit();
    cy.reload(); cy.get('#task-list').should('contain.text', 'Persistencia local');
  });

  it('ejecuta una revisión automática básica de accesibilidad', () => {
    cy.login(); cy.injectAxe(); cy.checkA11y();
  });
});
