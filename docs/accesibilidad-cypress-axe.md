# Pruebas de accesibilidad con cypress-axe

Responsable del tema: Rodney Raúl Porras Godínez. Este documento explica qué revisa la suite de accesibilidad del tablero, cómo se ejecuta, qué resultados dio y qué no puede garantizar.

## Qué es la accesibilidad web

Según la Iniciativa de Accesibilidad Web del W3C (WAI), la accesibilidad web significa que los sitios, herramientas y tecnologías se diseñan y desarrollan para que las personas con discapacidad puedan usarlos: percibirlos, entenderlos, navegar, interactuar y contribuir. La referencia técnica es WCAG 2.2, la recomendación del W3C, que organiza sus criterios en cuatro principios: perceptible, operable, comprensible y robusto. Los criterios tienen tres niveles de conformidad: A, AA y AAA. El nivel AA es el que normalmente se toma como meta.

Para este tablero significa, por ejemplo:
- cada campo tiene una etiqueta que un lector de pantalla puede anunciar;
- los botones tienen un nombre;
- los errores se anuncian;
- el texto tiene suficiente contraste con su fondo.

## Qué son axe-core y cypress-axe

- **axe-core** (Deque Systems) es un motor de código abierto. Revisa el DOM ya renderizado contra un conjunto de reglas basadas en WCAG y en buenas prácticas. Cada violación trae la regla, su impacto (`minor`, `moderate`, `serious` o `critical`) y los elementos afectados.
- **cypress-axe** conecta axe-core con Cypress mediante dos comandos:
  - `cy.injectAxe()` carga axe-core dentro de la página que Cypress tiene abierta. Hay que llamarlo después de cada `cy.visit()` o recarga, porque la página nueva ya no lo tiene.
  - `cy.checkA11y(contexto, opciones, callback)` ejecuta la revisión y hace fallar la prueba si hay violaciones:
    - `contexto` limita la revisión a una parte de la página, por ejemplo `'#board-view'`;
    - `opciones` permite elegir reglas (`runOnly`);
    - `callback` recibe la lista de violaciones antes del fallo.

## Cómo está integrado en el proyecto

| Pieza | Dónde | Autoría |
|---|---|---|
| Dependencia `cypress-axe` y `import 'cypress-axe'` | `package.json` y `cypress/support/commands.js` | Configuración inicial del equipo |
| Prueba básica: tablero vacío después del login | `cypress/e2e/tablero.cy.js` | Configuración inicial del equipo |
| Corrección de contraste y del nombre accesible del logo detectados por axe | commit `744c80c` | Brando Lemus |
| Suite ampliada de accesibilidad | `cypress/e2e/accesibilidad.cy.js` | Rodney Porras Godínez |
| Tareas `log` y `table` para imprimir las violaciones | `cypress.config.js` | Rodney Porras Godínez |
| Scripts `cy:a11y` y `test:a11y` | `package.json` | Rodney Porras Godínez |

### Casos de `accesibilidad.cy.js`

| Caso | Qué revisa además de axe |
|---|---|
| Pantalla de inicio de sesión | El estado previo al login, que la prueba básica no revisaba |
| Error de credenciales | El mensaje visible tiene `role="alert"` |
| Etiquetas y botones de los formularios | Cada `input`/`select` de login y de tareas tiene `<label for>`. Usa las reglas `label`, `button-name`, `select-name`, `form-field-multiple-labels` y `label-title-only` |
| Tablero con tareas Pendiente, En progreso y Hecha (escritorio 1280×720 y móvil 375×667) | Los colores de las tres insignias, los selectores de estado y los botones Editar/Eliminar, que solo existen cuando hay tareas. Los dos tamaños se generan con `forEach` |
| Diálogo de edición abierto | El foco pasa al campo Título al abrirse |
| Error de título vacío | El mensaje tiene `role="alert"` y el foco vuelve al campo |

Cuando hay violaciones, la función `registrarViolaciones` imprime en la terminal y en el log de GitHub Actions una tabla con regla, impacto, descripción y elementos. Sin ella, cypress-axe solo informa la cantidad: en la ejecución 40300842903 de GitHub Actions el log decía «2 accessibility violations were detected» sin indicar cuáles.

La suite usa `defaultCommandTimeout: 10000`. `cy.injectAxe()` lee `axe.min.js` con `cy.readFile`, y en un equipo con poca memoria la primera lectura superó los 4 s por defecto: la prueba básica falló una vez por esa causa y pasó al repetirla.

## Cómo ejecutar

```bash
npm install
npm run test:a11y      # levanta la app y corre solo accesibilidad.cy.js
npm test               # suite completa: tablero.cy.js + accesibilidad.cy.js
npm run cy:open        # modo interactivo: elegir accesibilidad.cy.js
```

En modo interactivo, el registro de comandos muestra cada violación. Al hacer clic sobre ella, la consola del navegador muestra los elementos afectados.

## Resultados

Ejecución local del 30-oct-2026 sobre la rama `feature/rodney-accesibilidad-documentacion`: Cypress 14.5.4, Electron 130 headless, axe-core 4.14.0 y cypress-axe 1.7.0.

| Suite | Resultado |
|---|---|
| `accesibilidad.cy.js` | 7 de 7 aprobadas, 0 violaciones |
| `tablero.cy.js` (existente) | 8 de 8 aprobadas |

Para comprobar que las pruebas detectan problemas reales, se ejecutó la misma suite contra la versión inicial de `main` (`8c54363`), antes de la corrección de contraste. Resultado: 4 aprobadas y 3 fallidas, todas por las mismas 2 violaciones de impacto `serious`:

| Regla | Elementos | Criterio WCAG |
|---|---|---|
| `color-contrast` | `.eyebrow` del encabezado, filtros Pendientes, En progreso y Hechas, y texto del estado vacío | 1.4.3 Contraste (mínimo), AA |
| `label-content-name-mismatch` | Enlace del logo `.brand`: su `aria-label` no contenía el texto visible «taskflow» | 2.5.3 Etiqueta en el nombre, A |

La versión actual ya incluye la corrección de Brando (`744c80c`) y no presenta esas violaciones.

## Límites de una revisión automática

- **Cobertura parcial.** Deque analizó más de 13 000 páginas y cerca de 300 000 problemas. Sus pruebas automáticas identificaron en promedio el 57,38 %; el resto requiere revisión humana. La guía de Cypress lo resume así: ningún escaneo automático puede demostrar que una interfaz es totalmente accesible.
- **Solo revisa lo que está en pantalla.** axe evalúa el DOM en el momento de la llamada. Un menú cerrado, un diálogo sin abrir o un estado que la prueba no provoca no se revisa. Por eso la suite abre el diálogo, provoca los errores y crea tareas en los tres estados.
- **Resultados por revisar.** Cuando axe no puede decidir, por ejemplo el contraste sobre un degradado, marca el elemento como `incomplete`. `cy.checkA11y()` solo falla por violaciones, no por esos casos.
- **No juzga el sentido.** axe confirma que un botón tiene nombre, pero no que el nombre sea claro, ni que el orden de lectura o de tabulación sea lógico.
- **El teclado y el lector de pantalla se prueban a mano.** Hay que recorrer el tablero solo con el teclado (Tab, Shift+Tab, Enter, Escape) y escucharlo con un lector de pantalla como NVDA o Narrador.

Esta suite es una red de seguridad que se ejecuta en cada `push` y `pull_request`. No sustituye una auditoría de accesibilidad.

## Fuentes consultadas

- W3C Web Accessibility Initiative. *Introduction to Web Accessibility*. https://www.w3.org/WAI/fundamentals/accessibility-intro/
- W3C. (2024). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation, 12 de diciembre de 2024. https://www.w3.org/TR/WCAG22/
- Deque Systems. *axe-core* (repositorio y descripción de reglas). https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
- Component Driven. *cypress-axe*. https://github.com/component-driven/cypress-axe
- Cypress. *Accessibility Testing*. https://docs.cypress.io/app/guides/accessibility-testing
- Deque Systems. *The Automated Accessibility Coverage Report*. https://www.deque.com/automated-accessibility-testing-coverage/
