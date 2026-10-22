# Margaret POS

Demo funcional de administración y punto de venta para Margaret. Conserva la identidad corporativa y sirve como especificación para implementar la plataforma central descrita en la documentación.

## Ver el demo

Abre [demo/index.html](demo/index.html) en tu navegador, o usa Node.js 24:

```sh
npm start
```

La dirección local será `http://127.0.0.1:4173`. No hay dependencias externas de npm.

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

El desarrollo y las pruebas pertenecen al ambiente **local** y a la rama `develop`. `main` conserva versiones estables; el ambiente `production` está reservado en GitHub, sin sitio o backend operativo. Consulta [ambientes y versionamiento](docs/AMBIENTES-Y-VERSIONAMIENTO.md).

```sh
npm ci --ignore-scripts
npm run build
npm test
```

El comando `npm run dev` lee `.env.local` cuando existe. Las configuraciones de ejemplo están en `environments/`; no contienen secretos. El flujo manual **Preparar versión** genera un borrador de versión preliminar desde main con archivos verificables, sin realizar un despliegue externo.

La compilación usa la plantilla y los dos archivos de marca para generar el HTML autónomo. **Edita la plantilla y vuelve a compilar**, en lugar de modificar únicamente el archivo generado.

Las pruebas verifican exportaciones, restauración completa de respaldos, permisos y aprobación de turnos, ventas concurrentes y devoluciones. Se ejecutan en sesiones aisladas con almacenamiento simulado, sin abrir ni modificar el navegador del usuario. No sustituyen la prueba física de impresora/lector ni la habilitación fiscal. Sus resultados y respaldos de ensayo se generan en `.artifacts/`, excluido de Git.

## Documentación

- [Arquitectura, seguridad y flujo end to end](docs/Margaret-arquitectura-seguridad-end-to-end.md).
- [Documento de arquitectura en PDF](docs/pdf/Margaret-arquitectura-seguridad-end-to-end.pdf).
- [Guía de turnos](docs/Margaret-guia-turnos.md).
- [Descarga y recuperación de respaldos](docs/Margaret-guia-respaldos.md).
- [Alcance de facturación y respaldos](docs/Margaret-facturacion-y-respaldos.md).
- [Procedencia y validación del catálogo](docs/Margaret-informe-validacion-catalogo.md).

El catálogo de prueba contiene referencias de un catálogo entregado por el negocio; ventas, cantidades y usuarios del escenario son ficticios. Las fuentes del catálogo no implican una licencia de redistribución pública.

## Seguridad y datos

No subir respaldos del negocio, datos personales reales, certificados DIAN, tokens, claves privadas ni archivos `.env`. Los ejemplos y contraseñas iniciales forman parte del demo y no deben desplegarse como controles de producción. Consulta [SECURITY.md](SECURITY.md).

La arquitectura de servidor, base de datos central, autenticación y emisión fiscal descrita en `docs/` es una propuesta de implementación futura. El repositorio permanece privado y no concede una licencia de distribución pública.
