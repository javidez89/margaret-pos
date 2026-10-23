# Desarrollo, QA, seguridad y DevOps

Flujo vigente desde el 23 de octubre de 2026. Repositorio: https://github.com/javidez89/margaret-pos

## Ambientes y alcance real

| Ambiente | Rama | URL | Publicación |
| --- | --- | --- | --- |
| Pruebas | develop | https://javidez89.github.io/margaret-pos/pruebas/ | Automática después de las verificaciones |
| Versión estable del demo | main | https://javidez89.github.io/margaret-pos/ | Manual, con aprobación del ambiente production |

El equipo desarrolla en ramas breves y prueba en develop. No se desarrolla ni ensaya sobre la versión estable. Las dos vistas siguen siendo un demo: no existe aún backend, autenticación central, base compartida, cobro electrónico ni emisión fiscal. La producción operativa permanece bloqueada en `environments/production.json`.

Los sitios tienen almacenamiento, respaldos locales y bloqueo de escritura con nombres diferentes. La versión estable conserva las claves que ya usaba para no reiniciar escenarios existentes. Como ambos sitios comparten el origen GitHub Pages, la separación es funcional; un backend operativo necesitará bases, credenciales y dominios separados. No cargar información real en estas vistas públicas.

## Recorrido de un cambio

```text
requisito y aceptación -> rama de trabajo -> PR a develop
-> validación + seguridad + Chromium -> publicación de pruebas
-> revisión funcional -> versión y CHANGELOG -> PR develop a main
-> controles obligatorios -> inicio manual de Promover versión estable
-> aprobación del responsable -> verificación de QA del mismo código
-> publicación -> comprobación HTTPS e integridad
```

La promoción compara el árbol de código completo, la versión y la ejecución de QA de develop. Acepta un commit de integración distinto solo si su contenido es exactamente el mismo que se validó. Rechaza una rama modificada mientras esperaba publicación. El publicador usa el candidato compilado de su ejecución y no lo reconstruye después de aprobarlo.

Las dos publicaciones comparten una exclusión mutua para evitar sobrescribir simultáneamente el sitio. Al actualizar pruebas se descarga y verifica el HTML estable actual y se conserva byte por byte. Al publicar estable se conserva la vista de pruebas. Si la descarga o su SHA-256 falla, el publicador se detiene en lugar de eliminar una de las vistas.

Después de promover a main, sincronizar main hacia develop mediante PR antes de iniciar una nueva versión si quedaron ramas divergentes. Las protecciones también se aplican a administradores; la sincronización no utiliza force-push ni una excepción permanente.

## Desarrollo local

Node.js 24, dependencias de desarrollo fijadas en package-lock.json:

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run check:security
npm run dev
```

El demo autónomo no tiene dependencias de ejecución externas. Playwright es una dependencia de desarrollo. Para QA de navegador:

```sh
npx playwright install chromium
npm run test:e2e
```

El navegador de pruebas usa perfiles efímeros y datos ficticios. No opera sobre el navegador personal ni sus archivos de respaldo. Los resultados se guardan en `.artifacts/`, excluido de Git.

En GitHub se utiliza el canal Chrome incluido en la imagen Ubuntu 24.04 mediante Playwright; su versión efectiva queda en los registros. Así no depende de reinstalar paquetes del sistema en cada ejecución. La ejecución local usa el Chromium correspondiente a la versión fijada de Playwright.

## Controles y evidencia de QA

| Control | Qué verifica | Resultado en GitHub |
| --- | --- | --- |
| validate | Compilación, versión, respaldo íntegro, turnos, venta, devolución y promoción | Control obligatorio e informe de negocio |
| security | Patrones de secretos, archivos privados, acciones fijadas y vulnerabilidades altas de dependencias | Control obligatorio |
| qa-browser | Acceso correcto e incorrecto, menú de vendedor e independencia de inventario en Chromium | Control obligatorio, informe HTML y trazas si falla |
| CodeQL | Análisis estático de scripts y JavaScript extraído del demo | Hallazgos en Security; análisis complementario, no aprobación automática |
| Publicación de pruebas | Repite negocio, seguridad y Chromium; publica y verifica HTTPS/SHA-256 | Ejecución que debe finalizar correctamente antes de promover |

No se permite publicar solo porque el HTML compiló. La regresión de negocio incluye exportación completa y protección de fórmulas CSV; restauración sin pérdida; turnos no aprobados que bloquean ventas; concurrencia; reembolso único; dinero devuelto por medio de pago y permisos simulados.

Antes de aprobar estable, el responsable verifica también el flujo UX esperado y las pruebas manuales aplicables. Impresora, lector, recuperación física, varias máquinas y cumplimiento fiscal no se certifican mediante Chromium o pruebas simuladas. Registrar el caso, resultado y evidencia en el PR.

## Seguridad y controles del repositorio

- Main y develop exigen PR, controles validate/security/qa-browser actualizados y conversaciones resueltas. Se bloquean force-push y borrado, incluidos administradores.
- Actualmente existe un solo responsable. No se exige una aprobación de PR que el autor no puede darse a sí mismo; la aprobación de publicación estable queda explícita en el ambiente production. Esto no equivale a dos personas independientes. Al incorporar un segundo mantenedor, exigir revisión independiente y activar la prohibición de autoaprobación del despliegue.
- Testing acepta develop; production acepta main y exige revisión del propietario. El trabajo que publica la vista estable solo se inicia manualmente.
- Acciones oficiales fijadas por SHA, permisos por trabajo y sin credenciales Git persistidas en checkout. Las entradas del flujo pasan por variables y validación; no se interpolan en código de shell.
- Secret scanning, protección de envío de secretos y alertas de dependencias complementan el escáner básico del proyecto. Ninguna de estas herramientas garantiza ausencia absoluta de secretos o vulnerabilidades.
- Dependabot propone actualizaciones a develop; no integra ni despliega automáticamente.
- Las reglas de etiquetas impiden actualizar o eliminar v*. Las versiones anteriores se conservan. Los secretos operativos y certificados no pertenecen al repositorio ni a paquetes descargables.

El estado leído de GitHub está en `docs/github-governance-status.json`. El registro `github-environments-status.json` documenta la limitación histórica del repositorio cuando era privado; no describe el estado actual.

## Versión y aprobación estable

Usar MAJOR.MINOR.PATCH y mensajes `feat:`, `fix:`, `test:`, `docs:` o `chore:`. Antes de promover cambios de código o automatización, aumentar versión, actualizar CHANGELOG y volver a compilar. La misma etiqueta no se sobrescribe.

1. Esperar que Publicar pruebas termine correctamente y revisar la URL de pruebas.
2. Abrir PR de develop a main. El control de promoción exige el commit publicado de develop y una versión incrementada cuando corresponde.
3. Integrar únicamente con los controles aprobados.
4. En Actions, iniciar **Promover versión estable** desde main con la etiqueta exacta, por ejemplo v0.3.0.
5. El responsable revisa el candidato y aprueba el ambiente production en GitHub. El publicador comprueba otra vez la correspondencia con QA antes de modificar el sitio.
6. Revisar la comprobación posterior a la publicación y los metadatos deployment.json.

**Preparar versión** es un flujo distinto: crea etiqueta anotada, ZIP, metadatos, SHA256SUMS y borrador preliminar para descarga. Ese borrador no convierte el demo en producción operativa. No se han publicado automáticamente todas las versiones de desarrollo.

## Reversión e incidentes

Conservar los artefactos de publicación y su versión. Si una publicación falla, no cambiar el otro ambiente: revisar el informe y corregir mediante PR. Para revertir el comportamiento estable, revertir el cambio con un nuevo commit y nueva versión, repetir QA y obtener aprobación. No borrar historia ni mover etiquetas.

Un respaldo de operaciones del navegador es diferente de un artefacto del programa. La reversión del código no recupera ventas o dinero. Para producción real deberán implementarse restauración de base de datos ensayada, migraciones compatibles, monitoreo, registro central, gestión de incidentes y objetivos de recuperación acordados.

Referencias: [protecciones de ramas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), [seguridad en Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions), [QA con Playwright](https://playwright.dev/docs/ci-intro).
