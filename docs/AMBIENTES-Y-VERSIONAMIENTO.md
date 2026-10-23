# Ambientes y versionamiento de Margaret

> Guía histórica de la configuración inicial. El flujo vigente de pruebas y versión estable, protecciones y aprobación está en [Gobierno de desarrollo](GOBIERNO-DESARROLLO.md).

Configuración de `javidez89/margaret-pos`. Preparada el 22 de octubre de 2026; repositorio público y demo en GitHub Pages desde el 23 de octubre. Consulta [el sitio de revisión](GITHUB-PAGES.md).

## Los dos ambientes

| Aspecto | Local | Producción |
| --- | --- | --- |
| Objetivo | Desarrollo y pruebas con datos ficticios | Reservado para la futura aplicación operativa |
| Rama de referencia | `develop` | `main` y versiones etiquetadas |
| Configuración | `environments/local.json` | `environments/production.json` |
| Ejecución del demo | Permitida en loopback | Rechazada por el servidor y compilador del demo |
| Datos de prueba | Habilitados | Deshabilitados |
| Almacenamiento | Navegador local de pruebas | Sin base operativa configurada todavía |
| Alojamiento y dominio | No se requieren | Pendientes; no se ha publicado un sitio |
| Ambiente en GitHub | `local`, limitado a `develop` | `production`, limitado a `main` |

El trabajo permanece en GitHub y en la copia local, con un demo estático público de revisión en GitHub Pages. Crear un ambiente en GitHub separa configuración y acceso a secretos de los trabajos, pero no crea un servidor o base de datos. El sistema actual sigue siendo un demo. La producción operativa requiere implementar el servidor central descrito en la arquitectura. El ambiente `github-pages` publica únicamente la vista de prueba desde main; no habilita el ambiente production.

## Iniciar local

Requiere Node.js 24. Sin dependencias externas de npm.

```sh
npm ci --ignore-scripts
```

Copia `environments/local.env.example` a `.env.local` si necesitas personalizar puerto. Ese archivo no se versiona.

```sh
npm run build
npm run dev
```

Abre `http://127.0.0.1:4173`. El ingreso y el menú identifican **LOCAL · PRUEBAS** y la versión. No uses información real del negocio. La sincronización del demo continúa limitada al mismo origen/navegador; no se convierte en una base central por abrir otra pestaña.

Cambiar APP_ENV o NODE_ENV a production no convierte el HTML en un sistema operativo. El servidor de demostración se niega a arrancar con esa configuración. El estado real se consulta con:

```sh
npm run check:production
```

Mientras no esté listo, este comando informa los pendientes y termina con código 2. `--report` es solo un informe y se usa en CI; no habilita producción.

## Flujo de desarrollo y promoción

```text
feature/* o fix/* -> PR a develop -> pruebas
develop -> PR de versión a main -> pruebas
main -> etiqueta vMAJOR.MINOR.PATCH -> borrador de versión preliminar
```

1. Parte de `develop` actualizado y crea una rama breve `feature/...` o `fix/...`.
2. Cambia la plantilla fuente, compila y ejecuta `npm test`.
3. Abre una solicitud de cambio a `develop`, indicando resultado, evidencia y reversión.
4. Antes de promover, actualiza versión y CHANGELOG en la rama de desarrollo. `npm version patch --no-git-tag-version` o `minor` mantiene package.json y package-lock.json alineados. Compila de nuevo para actualizar la versión visible.
5. Abre una solicitud de versión `develop` hacia `main`. Revisa las pruebas y el contenido; no mezcles datos o archivos de un navegador real.
6. Desde `main`, ejecuta manualmente el flujo **Preparar versión**, indicando la etiqueta exacta, por ejemplo `v0.2.0`.

La primera configuración se introduce mediante una rama técnica y solicitud de cambio; después de integrarla, main y develop se alinean para comenzar este recorrido.

## Publicación de versiones en GitHub

El flujo manual exige main, comprueba versión, ejecuta las pruebas, verifica el HTML generado y empaqueta el commit confirmado. Crea una etiqueta anotada y un borrador de **pre-release**, sin publicar ni desplegar un sitio.

Archivos del borrador:

- `margaret-vX.Y.Z-demo.zip`: fuente y documentación del commit para validación.
- `release-metadata.json`: versión, etiqueta, commit y estado de preparación.
- `SHA256SUMS`: integridad de los dos archivos anteriores.

El paquete contiene el demo y sus escenarios ficticios; no es un paquete para operar ventas reales. El flujo no sobrescribe etiquetas existentes y no ejecuta pagos ni emisiones DIAN. Una versión distinta requiere un número distinto.

Para preparar el mismo paquete desde main en local, después de confirmar todos los cambios:

```sh
npm test
npm run prepare:release -- v0.2.0
```

Esto crea archivos en `.artifacts/releases/`, sin subirlos. En GitHub, el trabajo de publicación solo tiene acceso al ambiente production desde main. Las pruebas de pull requests usan APP_ENV=local y no acceden a los secretos de producción.

## Buenas prácticas de cambios y secretos

- Mensajes de commit como `feat:`, `fix:`, `docs:`, `test:` y `chore:` con un propósito concreto.
- Nunca reescribir etiquetas de versiones distribuidas ni hacer force-push a main/develop.
- Evitar commits directos a main; usar solicitudes de cambio con pruebas y conversaciones resueltas.
- Mantener ejemplos de configuración sin secretos. Los `.env` reales, respaldos, claves y certificados quedan excluidos por Git.
- En el futuro, guardar secretos de producción solo en su ambiente de GitHub o gestor de secretos. No copiar credenciales de producción a local ni a los paquetes descargables.
- Guardar los respaldos del negocio fuera de Git. El versionamiento del código no reemplaza el respaldo de una base de datos.

## Qué está aplicado y qué no

Los ambientes local/production y sus restricciones de rama existen en GitHub. También existe develop, y los flujos de validación y preparación de versiones se versionan con el código.

**Las protecciones obligatorias de main y develop no están habilitadas.** En la configuración inicial, GitHub rechazó su aplicación al repositorio privado con HTTP 403. La evidencia histórica está en [github-environments-status.json](github-environments-status.json). El propietario autorizó cambiarlo a público el 23 de octubre; ese cambio de visibilidad no activa automáticamente las protecciones de ramas.

Hasta disponer de esa capacidad, las reglas de PR y no force-push son una política de trabajo, no una barrera técnica. Un usuario con permiso de escritura todavía podría saltárselas. Cuando el plan lo permita, aplicar: PR obligatorio, estado `validate` aprobado y actualizado, conversaciones resueltas, bloqueo de force-push y borrado, y revisión independiente cuando exista otro mantenedor. CODEOWNERS indica el responsable; por sí solo no obliga a una aprobación.

El flujo manual no equivale a una aprobación independiente de otro usuario. No se han configurado revisores obligatorios de despliegue ni una supuesta protección que el plan no ofrezca.

## Reversión

Si una versión de código falla, crear una rama de corrección o revertir el cambio mediante un nuevo commit y nueva versión. No mover una etiqueta existente. Probar la corrección, pasar por develop/main y preparar otra versión. Conservar el artefacto anterior verificado para comparación.

Este procedimiento no restaura dinero, documentos fiscales ni una futura base de datos. El despliegue operativo deberá añadir migraciones compatibles, copia verificada previa, conciliación y un procedimiento de recuperación ensayado.

## Próximo paso cuando exista infraestructura

Elegir alojamiento y dominio, implementar backend/autenticación/base compartida, validar privacidad y recuperación e integrar facturación cuando corresponda. Solo entonces se añadirá el trabajo de despliegue real, sus credenciales, aprobación adecuada, comprobación de salud y reversión. Hoy `deploymentEnabled` y `operationalReady` permanecen en false.

Referencias: [GitHub: ambientes y disponibilidad por plan](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments), [protecciones de ramas](https://docs.github.com/en/rest/branches/branch-protection), [Semantic Versioning](https://semver.org/).
