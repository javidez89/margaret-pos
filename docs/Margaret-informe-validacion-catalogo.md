# Margaret - Validación con catálogo y operación simulada

Fecha de preparación: 22 de octubre de 2026.

**Todos los usuarios añadidos, existencias, compras, ventas, gastos y cierres de este escenario son ficticios.** El precio de catálogo se utiliza como costo de referencia de prueba, no como costo de una compra real.

## Carga

- Fuente: Catalogo16_de-_octubre_2026.pdf, 46 páginas; 1.349 referencias únicas de las tablas de las páginas 8 a 46.
- Se unificaron 45 filas repetidas con igual nombre y precio.
- Las páginas promocionales 2 a 7 se revisaron visualmente y no se duplicaron como referencias nuevas. La promoción Onix de la página 2 y el precio de Ron Boyacá de la página 5 difieren de sus tablas; se conservaron los precios de tabla y las discrepancias quedaron en el archivo de extracción.
- Se conservaron las presentaciones originales. Las referencias con cajas, bolsas, pacas o contenido ambiguo se marcan para revisión; no se convierten automáticamente en unidades sueltas.
- Se utilizan códigos internos CAT26, no códigos EAN originales.
- La aplicación carga este escenario una sola vez al recargar. No repite ventas, gastos, compras ni usuarios en recargas posteriores.
- Los datos existentes se conservan y los identificadores se reasignan para evitar colisiones. Si había un turno abierto, sigue siendo el actual.

## Cajeros ficticios

| Nombre completo | Usuario | Cédula / contraseña temporal | Correo | Celular | Dirección |
|---|---|---|---|---|---|
| Ana Prueba Uno | APRUEBA | 000000001 | ana.prueba@example.test | 0000000001 | Dirección ficticia de prueba 1 |
| Bruno Ensayo Dos | BENSAYO | 000000002 | bruno.ensayo@example.test | 0000000002 | Dirección ficticia de prueba 2 |

El primer ingreso obliga a cambiar la contraseña temporal. Si ya existe el usuario, se agrega un sufijo; si ya existe la cédula ficticia, se ajusta para evitar suplantar una cuenta previa. Los accesos efectivos se consultan en Validación de pruebas.

## Alcance del escenario

Periodo simulado: 2026-09-25 al 2026-10-22 (28 días, dos turnos diarios). Semilla aleatoria: 20261022.

| Dato | Resultado |
|---|---:|
| Productos | 1349 |
| Cajeros | 2 |
| Turnos y cierres | 56 |
| Ventas | 452 |
| Gastos | 48 |
| Compras y reposiciones | 1427 |
| Ventas simuladas | $74.964.400 |
| Costo de mercancía vendida | $59.958.240 |
| Ganancia bruta | $15.006.160 |
| Gastos simulados | $772.000 |
| Ganancia después de gastos | $14.234.160 |
| Inversión simulada en inventario | $992.444.650 |

Se incluyeron 29 diferencias de caja intencionales con motivo y aprobación independiente. No representan errores de conciliación. Al finalizar: 270 referencias amarillas y 76 rojas.

## Controles de validación

| Control | Resultado | Detalle |
|---|---|---|
| Totales de referencias | Correcto | Esperado 1349 · Actual 1349 |
| Totales de ventas | Correcto | Esperado 452 · Actual 452 |
| Totales de compras | Correcto | Esperado 1427 · Actual 1427 |
| Totales de gastos | Correcto | Esperado 48 · Actual 48 |
| Totales de turnos | Correcto | Esperado 56 · Actual 56 |
| Totales de ventas en COP | Correcto | Esperado 74964400 · Actual 74964400 |
| Totales de costo vendido | Correcto | Esperado 59958240 · Actual 59958240 |
| Totales de gastos en COP | Correcto | Esperado 772000 · Actual 772000 |
| Totales de inversión | Correcto | Esperado 992444650 · Actual 992444650 |
| Códigos internos únicos | Correcto | 1399 códigos; no son EAN originales |
| Referencias sin colisiones | Correcto | Las referencias existentes conservan sus identificadores |
| Entradas − ventas = existencias | Correcto | 0 referencias con diferencia |
| Arqueos y aprobación independiente | Correcto | 0 cierres inconsistentes |
| Voucher en cada venta | Correcto | 452 comprobantes |
| Ventas con existencias y fecha | Correcto | 452 ventas auditadas |
| Dos cajeros por turno | Correcto | APRUEBA · BENSAYO |
| Cuentas completas y primer ingreso | Correcto | Identidad y contacto ficticios; contraseña temporal igual a la cédula |

También se verificaron de forma independiente: suma de renglones de cada venta, reproducción cronológica de todas las entradas y salidas sin stock negativo, unicidad de vouchers, dos turnos por día, tres medios de pago, filtros diarios/mensuales/quincenales/por usuario, importación repetida sin duplicados y conservación de un turno y producto previos.

## Resumen por mes

| Mes | Ventas | Costo vendido | Gastos | Ganancia después de gastos |
|---|---:|---:|---:|---:|
| 2026-09 | $15.473.700 | $12.377.220 | $135.000 | $2.961.480 |
| 2026-10 | $59.490.700 | $47.581.020 | $637.000 | $11.272.680 |

## Resumen por fecha

| Fecha | Ventas registradas | Total vendido | Gastos | Ganancia después de gastos |
|---|---:|---:|---:|---:|
| 2026-09-25 | 17 | $3.484.600 | $31.000 | $665.420 |
| 2026-09-26 | 17 | $3.386.700 | $24.000 | $652.600 |
| 2026-09-27 | 16 | $2.575.400 | $10.000 | $502.650 |
| 2026-09-28 | 17 | $2.001.800 | $26.000 | $376.210 |
| 2026-09-29 | 14 | $1.535.200 | $44.000 | $264.510 |
| 2026-09-30 | 18 | $2.490.000 | $0 | $500.090 |
| 2026-10-01 | 19 | $3.407.600 | $20.000 | $665.340 |
| 2026-10-02 | 16 | $2.889.100 | $30.000 | $537.230 |
| 2026-10-03 | 18 | $2.544.600 | $33.000 | $478.800 |
| 2026-10-04 | 20 | $3.116.200 | $37.000 | $589.310 |
| 2026-10-05 | 19 | $2.807.200 | $24.000 | $540.610 |
| 2026-10-06 | 15 | $2.669.200 | $25.000 | $502.190 |
| 2026-10-07 | 17 | $2.368.300 | $24.000 | $452.470 |
| 2026-10-08 | 19 | $3.188.300 | $40.000 | $600.510 |
| 2026-10-09 | 20 | $4.599.900 | $30.000 | $888.260 |
| 2026-10-10 | 17 | $2.845.100 | $30.000 | $541.810 |
| 2026-10-11 | 15 | $2.373.900 | $20.000 | $456.750 |
| 2026-10-12 | 14 | $3.172.900 | $36.000 | $601.350 |
| 2026-10-13 | 16 | $2.750.400 | $23.000 | $529.770 |
| 2026-10-14 | 16 | $1.929.400 | $33.000 | $355.440 |
| 2026-10-15 | 13 | $2.270.800 | $30.000 | $421.450 |
| 2026-10-16 | 14 | $2.105.900 | $25.000 | $398.240 |
| 2026-10-17 | 13 | $3.147.800 | $34.000 | $593.510 |
| 2026-10-18 | 12 | $1.945.300 | $19.000 | $366.950 |
| 2026-10-19 | 13 | $3.701.100 | $44.000 | $698.150 |
| 2026-10-20 | 17 | $1.830.100 | $37.000 | $331.110 |
| 2026-10-21 | 15 | $2.015.300 | $18.000 | $383.810 |
| 2026-10-22 | 15 | $1.812.300 | $25.000 | $339.620 |

## Uso

1. Recargar Margaret-demo-administracion.html para aplicar la carga única.
2. Ingresar como administrador o gerente y abrir Validación de pruebas.
3. Revisar Inventario, Ventas por turno, Reportes y Gastos.
4. Cerrar sesión e ingresar con cada cajero ficticio; cambiar su contraseña al primer ingreso.
5. Para continuar ventas, programar y abrir un nuevo turno si el actual quedó cerrado.

Los controles se ejecutaron sobre el modelo de datos y la lógica del demo en un entorno aislado, sin intervenir el almacenamiento de la pestaña abierta. La carga efectiva en esa pestaña requiere recargarla. No se realizaron pagos reales ni pruebas con equipos físicos.
