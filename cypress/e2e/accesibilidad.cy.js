// Revisión automática de accesibilidad con cypress-axe (axe-core).
// La prueba básica de tablero.cy.js revisa el tablero vacío; aquí se cubren los demás estados de la interfaz.

// Imprime en la terminal (y en el log de GitHub Actions) qué reglas fallaron y en qué elementos,
// porque por defecto cypress-axe solo informa la cantidad de violaciones.
const registrarViolaciones = violations => {
  cy.task('log', `axe detectó ${violations.length} ${violations.length === 1 ? 'violación' : 'violaciones'} de accesibilidad`);
  cy.task('table', violations.map(({ id, impact, description, nodes }) => ({
    regla: id,
    impacto: impact,
    descripcion: description,
    elementos: nodes.map(node => node.target.join(' ')).join(', ')
  })));
};

const revisarAccesibilidad = (contexto = null, opciones = null) => {
  cy.injectAxe();
  cy.checkA11y(contexto, opciones, registrarViolaciones);
};

const reglasDeFormulario = { runOnly: { type: 'rule', values: ['label', 'button-name', 'select-name', 'form-field-multiple-labels', 'label-title-only'] } };

const crearTareasEnTresEstados = () => {
  cy.fixture('tasks.json').then(tasks => {
    tasks.forEach(task => {
      cy.get('#task-title').clear().type(task.title);
      cy.get('#task-form').submit();
    });
  });
  cy.get('#task-list .status-select').eq(0).select('done');
  cy.get('#task-list .status-select').eq(1).select('progress');
  cy.get('#task-list .status-pending').should('have.length', 1);
  cy.get('#task-list .status-progress').should('have.length', 1);
  cy.get('#task-list .status-done').should('have.length', 1);
};

// cy.injectAxe() lee axe.min.js con cy.readFile; en equipos lentos la primera lectura puede pasar de 4 s.
describe('Accesibilidad del tablero con cypress-axe', { defaultCommandTimeout: 10000 }, () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
    cy.clearBoardData();
    cy.visit('/');
  });

  it('la pantalla de inicio de sesión no tiene violaciones', () => {
    cy.get('#login-view').should('be.visible');
    revisarAccesibilidad();
  });

  it('el error de credenciales se anuncia como alerta y no agrega violaciones', () => {
    cy.get('#username').type('incorrecto');
    cy.get('#password').type('incorrecta');
    cy.get('#login-form').submit();
    cy.get('#login-error').should('be.visible').and('have.attr', 'role', 'alert');
    revisarAccesibilidad();
  });

  it('cada campo y botón de los formularios tiene nombre accesible', () => {
    cy.get('#login-form').find('input').each($campo => cy.get(`label[for="${$campo.attr('id')}"]`).should('exist'));
    revisarAccesibilidad('#login-form', reglasDeFormulario);
    cy.login();
    cy.get('#task-form').find('input, select').each($campo => cy.get(`label[for="${$campo.attr('id')}"]`).should('exist'));
    revisarAccesibilidad('#task-form', reglasDeFormulario);
  });

  [
    { nombre: 'escritorio', ancho: 1280, alto: 720 },
    { nombre: 'móvil', ancho: 375, alto: 667 }
  ].forEach(pantalla => {
    it(`el tablero con tareas en los tres estados no tiene violaciones (${pantalla.nombre})`, () => {
      cy.viewport(pantalla.ancho, pantalla.alto);
      cy.login();
      crearTareasEnTresEstados();
      revisarAccesibilidad('#board-view');
    });
  });

  it('el diálogo de edición recibe el foco y no tiene violaciones', () => {
    cy.login();
    cy.get('#task-title').type('Revisar el diálogo de edición');
    cy.get('#task-form').submit();
    cy.get('#task-list [data-action="edit"]').click();
    cy.get('#edit-task-dialog').should('be.visible');
    cy.focused().should('have.id', 'edit-task-title');
    revisarAccesibilidad('#edit-task-dialog');
  });

  it('el error de título vacío se anuncia, devuelve el foco al campo y no agrega violaciones', () => {
    cy.login();
    cy.get('#task-form').submit();
    cy.get('#task-error').should('be.visible').and('have.attr', 'role', 'alert');
    cy.focused().should('have.id', 'task-title');
    revisarAccesibilidad();
  });
});
