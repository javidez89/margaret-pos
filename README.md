# Margaret POS

Demo funcional de administración y punto de venta para Margaret. Conserva la identidad corporativa y sirve como especificación para implementar la plataforma central descrita en la documentación.

## Ver el demo

**[URL objetivo de producción](https://javidez89.github.io/margaret-pos/)** — actualmente sirve el demo. **Pruebas: local**, en `http://127.0.0.1:4173`. Consulta la [arquitectura vigente GitHub Pages + Supabase](docs/ARQUITECTURA-VIGENTE.md) y el [flujo de desarrollo y QA](docs/GOBIERNO-DESARROLLO.md).

Abre [demo/index.html](demo/index.html) en tu navegador, o usa Node.js 24:

```sh
npm start
```

La dirección local será `http://127.0.0.1:4173`. El HTML autónomo no necesita dependencias de ejecución. Las herramientas de desarrollo y QA se instalan con `npm ci --ignore-scripts`.

Las cuentas iniciales de demostración son `admin`, `gerente`, `vendedor1` y `vendedor2`; su clave de prueba es `1234`. Son accesos simulados para validación. Las personas nuevas deben cambiar su contraseña temporal al ingresar.

Los datos se guardan en el navegador y origen donde se abre el demo. Esta copia no contiene las operaciones guardadas en otros navegadores o rutas. Para trasladarlas, usa **Respaldos → Descargar** y **Cargar / restaurar**, con una copia verificada.

## Funcionalidades

- Roles de administrador, gerente y vendedor; equipo, permisos y nómina.
- Turnos con mínimo dos vendedores, aprobación explícita, apertura, arqueo y cierre.
- Ventas por categorías, presentaciones de cerveza de 30 unidades, medios de pago y vouchers.
- Inventario, códigos de barras, compras, costos, ganancias y alertas de existencias.
- Devolución total o parcial, aprobación gerencial, reembolso e inventario.
- Gastos, proveedores, reportes globales/diarios/quincenales/mensuales y movimientos.
- Exportaciones CSV; respaldos JSON completos con validación y restauración.
- Configuración de impresora/lector y selección de Factura POS o Factura electrónica.

La emisión DIAN y los pagos electrónicos reales no están integrados. El código Hash del voucher es un identificador interno. La sincronización se limita a pestañas del mismo archivo/origen y navegador; no hay servidor central implementado.

La decisión vigente es GitHub Pages para la interfaz y Supabase para backend, cuentas y datos centrales. El dominio propio es opcional para más adelante. No se añadirá NestJS ni otro alojamiento. Las funciones y la base de Margaret todavía no están implementadas; la [arquitectura vigente](docs/ARQUITECTURA-VIGENTE.md) describe seguridad, límites de Pages y criterios de habilitación.

## Estructura

```text
src/index.template.html      Fuente del demo
assets/brand/               Logo e icono corporativos
demo/index.html             Demo autónomo generado y versionado
scripts/                    Compilación, servidor local y ejecución de pruebas
tests/                      Pruebas aisladas con datos ficticios
docs/                       Guías, arquitectura y evidencia de validación
.github/workflows/          Validación automática de la primera versión
```

## Compilar y validar

El desarrollo entra por ramas de trabajo y PR a `develop`, con QA local y CI automático sin sitio público de pruebas. `main` recibe promociones del contenido exacto validado; Pages requiere inicio manual y aprobación en `production`. La producción operativa sigue bloqueada hasta implementar Supabase y cumplir los criterios pendientes. Consulta [el gobierno del desarrollo](docs/GOBIERNO-DESARROLLO.md) y [las instrucciones del repositorio](AGENTS.md).

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run check:security
```

El comando `npm run dev` lee `.env.local` cuando existe. Las configuraciones de ejemplo están en `environments/`; no contienen secretos. El flujo manual **Preparar versión** genera un borrador de versión preliminar desde main con archivos verificables, sin realizar un despliegue externo.

La compilación usa la plantilla y los dos archivos de marca para generar el HTML autónomo. **Edita la plantilla y vuelve a compilar**, en lugar de modificar únicamente el archivo generado.

Las pruebas verifican exportaciones, restauración completa de respaldos, permisos y aprobación de turnos, ventas concurrentes, devoluciones y promoción del código validado. La suite de negocio usa almacenamiento simulado y la suite `npm run test:e2e` usa Chromium con perfiles efímeros. No operan sobre el navegador personal ni sustituyen hardware físico o habilitación fiscal. Los informes de cada PR quedan en Actions y los resultados locales en `.artifacts/`, excluido de Git.

## Documentación

- [Arquitectura vigente: GitHub Pages + Supabase y pruebas locales](docs/ARQUITECTURA-VIGENTE.md) — decisión actual del usuario; prevalece sobre las propuestas anteriores.
- [Revisión para iniciar el backend: hallazgos, decisiones y plan](docs/REVISION-ARQUITECTURA-BACKEND.md) — actualización del 23 de octubre de 2026.
- [Evaluación de alternativas, ventajas, riesgos y costos](docs/DECISION-GITHUB-SUPABASE.md) — antecedente; la opción NestJS fue descartada para este alcance.
- [Modelo transaccional, base de datos y contratos iniciales](docs/diseno/MODELO-TRANSACCIONAL.md).
- [Respaldos y recuperación operativa del futuro backend](docs/operacion/RECUPERACION.md).
- [Arquitectura, seguridad y flujo end to end](docs/Margaret-arquitectura-seguridad-end-to-end.md).
- [Documento de arquitectura en PDF](docs/pdf/Margaret-arquitectura-seguridad-end-to-end.pdf) — instantánea del 22 de octubre; consultar la revisión posterior para las decisiones vigentes.
- [Guía de turnos](docs/Margaret-guia-turnos.md).
- [Descarga y recuperación de respaldos](docs/Margaret-guia-respaldos.md).
- [Alcance de facturación y respaldos](docs/Margaret-facturacion-y-respaldos.md).
- [Procedencia y validación del catálogo](docs/Margaret-informe-validacion-catalogo.md).

El catálogo de prueba contiene referencias de un catálogo entregado por el negocio; ventas, cantidades y usuarios del escenario son ficticios. Las fuentes del catálogo no implican una licencia de redistribución pública.

## Seguridad y datos

No subir respaldos del negocio, datos personales reales, certificados DIAN, tokens, claves privadas ni archivos `.env`. Los ejemplos y contraseñas iniciales forman parte del demo y no deben desplegarse como controles de producción. Consulta [SECURITY.md](SECURITY.md).

La arquitectura de servidor, base de datos central, autenticación y emisión fiscal descrita en `docs/` es una propuesta de implementación futura. El repositorio es público para revisión desde el 23 de octubre de 2026. La visibilidad pública no concede una licencia adicional sobre el código, la marca o el catálogo.
