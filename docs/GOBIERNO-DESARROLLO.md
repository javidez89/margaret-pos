# Desarrollo, QA, seguridad y publicación

Flujo vigente desde la decisión del 23 de octubre de 2026. [Arquitectura vigente](ARQUITECTURA-VIGENTE.md): GitHub Pages + Supabase, pruebas locales y CI efímero, sin sitio público de QA.

## Ambientes

| Ambiente | Rama | URL y datos |
| --- | --- | --- |
| Desarrollo y prueba funcional | Rama de trabajo / develop | http://127.0.0.1:4173; datos sintéticos; Supabase local cuando se implemente. |
| CI | PR y push a develop/main | Ejecución efímera sin URL pública; informes de negocio y navegador. |
| Producción objetivo | main | https://javidez89.github.io/margaret-pos/; todavía sirve el demo. Backend Supabase pendiente. |

La ruta pública `/pruebas/` pertenece al flujo anterior. El workflow que la publicaba se retira; dejará de incluirse en el siguiente despliegue de producción aprobado. No borrar claves del almacenamiento del navegador ni datos existentes del demo estable. Las fixtures de navegador bajo `/pruebas/` son únicamente locales al runner de QA.

## Recorrido de un cambio

```text
requisito -> rama desde develop -> desarrollo y QA local
-> PR a develop -> validate + security + qa-browser
-> integración y CI del commit de develop -> revisión funcional
-> SemVer y CHANGELOG -> PR develop a main -> controles aprobados
-> inicio manual de publicación -> aprobación production
-> revalidación de evidencia CI y candidato -> Pages -> comprobación HTTPS/SHA-256
```

No se desarrolla sobre producción. Mantener PR obligatorios, ramas actualizadas, conversaciones resueltas, bloqueo de force-push/borrado y reglas de etiquetas. El responsable actual es una sola persona; no presentar sus controles como revisión independiente. No aprobar un despliegue en su nombre ni retirar protecciones para completar una entrega.

## Preparación y QA local

Node 24 y dependencias fijadas en el lockfile:

```sh
npm ci --ignore-scripts
npm test
npm run check:security
npm run dev
```

La web se abre en http://127.0.0.1:4173. El servidor solo acepta loopback. La futura base/Auth/Storage de pruebas será local y no usará el proyecto ni los secretos de producción; tener la web en localhost no aísla una base remota por sí solo.

La suite Playwright usa un perfil efímero. En CI utiliza Chrome incluido en Ubuntu; el desarrollador puede ejecutar `npm run test:e2e` con el Chromium correspondiente instalado. Las pruebas no operan el navegador personal. No presentar resultados de CI como prueba de impresora física, emisión fiscal o recuperación del servicio real.

## Evidencia de promoción

Los tres controles obligatorios permanecen: `validate`, `security`, `qa-browser`. CodeQL es complementario. Dependabot propone cambios a develop sin desplegar automáticamente.

`check-pr-policy.mjs` exige PR desde develop del mismo repositorio y QA correcto de ese commit en un push a develop. La ejecución debe pertenecer a `validate.yml`; verificar además los tres jobs, no solo la conclusión global. Un workflow ajeno, fork, job omitido/fallido o contenido distinto no acredita QA.

El candidato incluye versión, commit, árbol Git completo, SHA-256 y referencia de QA. Main puede tener un commit de integración distinto si el árbol completo es idéntico al validado. Antes de publicar, se comprueba que main no cambió y se consultan de nuevo ejecución, commit/árbol y jobs. La preparación y la publicación ya no descargan un sitio público de pruebas.

El publicador usa el candidato de su propia ejecución. El directorio de salida debe estar vacío para evitar incluir vistas antiguas. La publicación contiene solo producción; el manifiesto declara pruebas locales. Conservar informes, comprobar el HTML remoto y no distribuir secretos, datos del negocio ni backups en artefactos públicos.

## Versión y publicación

Cambios de código/configuración/automatización requieren SemVer y CHANGELOG; regenerar `demo/index.html` desde su plantilla. No mover ni borrar etiquetas existentes.

1. Validar manualmente en local y revisar controles de PR.
2. Integrar en develop y esperar CI de ese commit.
3. Promover develop a main mediante PR con los controles obligatorios.
4. Iniciar **Promover versión estable** desde main, indicando la etiqueta exacta.
5. El responsable revisa el candidato y aprueba `production` en GitHub; el agente no lo aprueba por él.
6. Comprobar publicación, metadata e integridad.

**Preparar versión** genera un paquete y un borrador para descarga; no sustituye aprobación de Pages ni habilita el backend Supabase. Los entornos GitHub `production` y `github-pages` conservan sus protecciones; el antiguo `testing` puede quedar como registro sin workflow de publicación activo.

## Seguridad y reversión

Acciones fijadas por SHA, permisos mínimos, checkout sin credenciales persistidas y tokens limitados a consultas de este repositorio. La web solo recibirá configuración pública Supabase; las credenciales privilegiadas serán de funciones/despliegue. Escáneres y controles automáticos complementan revisión; no garantizan ausencia de fallos.

Revertir mediante commits y PR con nueva versión y QA; no usar force-push. Revertir frontend no restaura dinero ni base de datos. Los cambios futuros de Supabase necesitarán migraciones ensayadas, compatibilidad y recuperación, según [la guía operativa](operacion/RECUPERACION.md).

La [arquitectura vigente](ARQUITECTURA-VIGENTE.md) conserva el estado real, la decisión de Pages y su riesgo de condiciones de uso. `operationalReady` sigue deshabilitado mientras falten backend, identidad, datos compartidos y restauración.
