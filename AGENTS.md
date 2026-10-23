# Trabajo en Margaret POS

Estas instrucciones se aplican al repositorio completo. El flujo vigente está en `docs/GOBIERNO-DESARROLLO.md`.

## Alcance y arquitectura

Margaret todavía es un demo estático. Las interfaces de roles y claves iniciales no constituyen autenticación de servidor. No presentar GitHub Pages como una plataforma operativa para dinero, datos personales o facturación DIAN. `environments/production.json` conserva el bloqueo de producción operativa hasta implementar backend, autenticación y base de datos.

## Desarrollo y versión

- Crear `feat/...`, `fix/...`, `test/...` o `chore/...` desde develop actualizado. Nunca desarrollar directamente en main.
- Editar `src/index.template.html`; generar `demo/index.html` con `npm run build`.
- Proponer cambios a develop mediante PR. Main recibe promociones de develop después de publicar y validar ese commit en pruebas.
- Aumentar versión SemVer y actualizar CHANGELOG cuando cambie código, configuración o automatización; conservar package-lock.json. No modificar etiquetas existentes.
- Mantener cambios acotados. No incluir respaldos reales, datos personales, certificados, secretos ni credenciales.

## Responsabilidades en cada cambio

- Desarrollo: reglas de negocio coherentes, cambios mínimos y manejo de errores sin pérdida de datos.
- UX: mensajes claros, acciones comprensibles, acceso por teclado y marca consistente.
- QA: verificar criterios de aceptación y permisos, caso correcto, rechazo, doble operación y recuperación ante fallo. Añadir regresión cuando se corrija un error relevante.
- Seguridad: revisar entradas y exportaciones, límites de privilegios, secretos, dependencias y efectos sobre datos. La autorización real debe residir en el backend futuro.
- DevOps: mantener CI obligatorio, acciones fijadas por commit, permisos mínimos, publicación separada por ambiente, trazabilidad e integridad de artefactos y recuperación ensayada.
- Responsable de versión: revisar evidencia de QA, cambios, riesgos y reversión antes de aprobar la publicación estable en GitHub.

No asumir que esas responsabilidades implican personas o revisiones independientes que aún no existen.

## Validación y entrega

- Ejecutar `npm test`, `npm run check:security` y revisar el HTML generado. Ejecutar `npm audit --audit-level=high` al cambiar dependencias.
- La suite de navegador se ejecuta en GitHub Actions y puede ejecutarse por el desarrollador con `npm run test:e2e` después de instalar Chromium para Playwright.
- Revisar los controles validate, security y qa-browser del PR; no desactivar un control para integrar un fallo.
- Reportar con precisión qué se probó y qué sigue pendiente. Los resultados simulados, Chromium y pruebas físicas de hardware tienen alcances distintos.
- La publicación estable requiere inicio manual y aprobación del ambiente production. No aprobar en nombre del responsable ni retirar esa protección para completar un despliegue.
- Conservar las claves de almacenamiento existentes de la vista estable. Pruebas usa claves, respaldos y bloqueo diferentes. Los dos sitios comparten origen: esa separación no es una barrera de seguridad para datos reales.
- No reemplazar archivos del otro ambiente al publicar. Verificar SHA-256 y el sitio después del despliegue.

## Reversión

Revertir mediante nuevos commits y PR; no usar force-push ni mover etiquetas. Si falla la publicación de pruebas, conservar la versión estable y corregir la causa. Una corrección o reversión de la vista estable también debe probarse y aprobarse; no restaura por sí sola las operaciones guardadas en navegadores.
