# Tablero de tareas - Grupo 3

![Cypress CI](https://github.com/gsalexander18/tablero-tareas-grupo-3/actions/workflows/cypress.yml/badge.svg)

Aplicación web para organizar las tareas del proyecto final de Aseguramiento de la Calidad. Está hecha desde cero con HTML, CSS y JavaScript; guarda las tareas en `localStorage`.

## Integrantes y responsabilidades iniciales

| Integrante | Responsabilidad propuesta |
|---|---|
| Anthony Alexander Garcia Santos | Interfaz y funcionalidad principal del tablero (página) |
| Gerson Alfredo Herrera Soto | Suite Cypress: casos de aceptación, pruebas guiadas por datos, comandos personalizados y `cy.session` |
| Brando Arnoldo Lemus Felipe | Repositorio GitHub, ramas, Pull Requests, GitHub Actions y evidencia CI |
| Rodney Raúl Porras Godínez | Informe UMG, investigación y explicación de accesibilidad con `cypress-axe`, apoyo a revisión funcional |

Estas asignaciones equilibran los entregables solicitados. Acuerden los detalles entre ustedes y registren el trabajo real de cada integrante en commits propios.

## Funcionalidad

- Login de demostración con usuario y contraseña fijos.
- Crear tareas con título; el título vacío se rechaza.
- Editar los datos de una tarea o eliminarla con confirmación.
- Asignar un integrante responsable y una fecha límite opcional.
- Estados Pendiente, En progreso y Hecha.
- Cambiar estado y filtrar tareas por estado.
- Contadores que reflejan las tareas visibles para el filtro seleccionado.
- El filtro seleccionado se conserva al recargar.
- Tareas y filtro guardados en `localStorage`; autenticación de sesión en `sessionStorage`.
- Identificadores y clases estables para selectores de Cypress.

Credenciales de demostración: usuario `grupo3`, contraseña `calidad123`. Son credenciales fijas para el requisito académico, no un sistema de autenticación para producción.

## Ejecutar en Visual Studio Code

1. Abre esta carpeta desde VS Code con **Archivo > Abrir carpeta**.
2. Instala Node.js LTS si no está instalado.
3. En Terminal > Nueva terminal ejecuta `npm install` la primera vez.
4. Ejecuta `npm start` y visita <http://localhost:3000>.
5. En otra terminal, ejecuta `npm test` para levantar la app y correr Cypress en modo headless, o `npm run cy:open` para Cypress interactivo.

## Pruebas

La suite de `cypress/e2e/tablero.cy.js` cubre login, tareas pendientes, cambios de estado y contadores, filtros, título vacío, persistencia y accesibilidad. `cypress/fixtures/tasks.json` y `login-cases.json` alimentan pruebas repetidas con `forEach`. El comando personalizado `cy.login()` utiliza `cy.session()` para reutilizar la sesión.

La configuración de Cypress usa `baseUrl` en `http://localhost:3000` y `video: true`. GitHub Actions ejecuta Cypress en cada `push` y `pull_request` y conserva video/capturas como artefacto.

## Dos temas de investigación aplicados

1. **Comandos personalizados y caché de sesión:** `Cypress.Commands.add('login', ...)` centraliza el acceso, y `cy.session()` evita repetir el formulario en cada prueba. Gerson documentará cuándo conviene invalidar esta caché y cómo aislar el estado local.
2. **Pruebas de accesibilidad:** `cypress-axe` ejecuta una revisión automatizada inicial con `cy.injectAxe()` y `cy.checkA11y()`. Además de la prueba básica de `tablero.cy.js`, `cypress/e2e/accesibilidad.cy.js` revisa:
   - el inicio de sesión y su mensaje de error;
   - las etiquetas y botones de los formularios;
   - el tablero con tareas en los tres estados, en escritorio y en móvil;
   - el diálogo de edición y el error de título vacío.

   Si axe encuentra violaciones, la terminal muestra cada regla con los elementos afectados. Se ejecuta sola con `npm run test:a11y`. El alcance y los límites de esta revisión automática están en [docs/accesibilidad-cypress-axe.md](docs/accesibilidad-cypress-axe.md).

## Entrega y exposición

La consigna también solicita al menos dos PR revisados y mezclados, historial de commits de todos, demostrar CI verde y rojo, descargar artefactos, una modificación en vivo y un informe con formato oficial UMG con capturas y fuentes. Este repositorio de inicio no puede mostrar esas actividades hasta que el equipo cree el remoto, trabaje en ramas y genere ejecuciones reales. Usen el formato oficial proporcionado por el docente para el informe.

## Próximos pasos del equipo

- Crear el repositorio remoto y agregar el enlace aquí.
- Repartir ramas y preparar al menos dos Pull Requests con revisión cruzada.
- Ejecutar el workflow desde GitHub y verificar videos/capturas en Artifacts.
- Preparar informe UMG, evidencias, referencias consultadas y guion de exposición.
