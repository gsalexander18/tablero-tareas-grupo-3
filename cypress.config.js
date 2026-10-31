const { defineConfig } = require('cypress');
module.exports = defineConfig({
  video: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Tareas usadas por cypress/e2e/accesibilidad.cy.js para mostrar las violaciones de axe en la terminal.
      on('task', {
        log(message) { console.log(message); return null; },
        table(rows) { console.table(rows); return null; }
      });
      return config;
    }
  }
});
