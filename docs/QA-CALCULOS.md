# Auditoría de cálculos — 0.4.1

Escenario sintético local, con semilla `20261023`, del 1 de enero de 2024 al 3 de febrero de 2025: 400 días, incluido el 29 de febrero, cambios de año, 14 meses y dos turnos por día. No modifica los registros del navegador personal ni escribe en Supabase. No representa ventas reales ni certifica contabilidad fiscal.

Ejecutar `npm test`. Para repetir solo la auditoría: `npm run build` y `node tests/financial-audit.cjs`. La evidencia completa se genera en `.artifacts/test-results/financial-audit.json`; GitHub Actions la conserva como artefacto `business-results`. La suite de formularios se ejecuta con `npm run test:e2e` en CI.

## Qué se compara

El motor real de la aplicación se ejecuta en una VM con reloj y almacenamiento aislados. Los formularios invocan las mismas funciones de compra, venta, gasto y nómina. Un libro independiente usa `BigInt`, cocientes y residuos; calcula resultados a partir de las entradas generadas, sin usar las funciones matemáticas de la aplicación ni copiar sus resultados como valores esperados.

- Compra: unidades = cantidad de presentaciones × factor; inversión = cantidad × costo por presentación. Paca y canasta consumen/ingresan 30 unidades; unidad consume/ingresa 1.
- Inventario: existencias = entradas − unidades vendidas + unidades efectivamente reintegradas. Valor = compras − costo vendido + costo reintegrado.
- Costo: promedio ponderado del valor disponible dividido entre sus unidades. El costo de las unidades vendidas se captura en la venta; las compras posteriores no alteran ese histórico.
- Venta: total = suma de importes por presentación. Cambio = recibido − total, únicamente para efectivo.
- Caja: base + ventas en efectivo − gastos de esa caja − reembolsos en efectivo pagados por ese turno. Transferencia y tarjeta no aumentan el efectivo físico; una devolución de una venta antigua afecta la caja que reembolsa.
- Nómina: neto = base + adiciones − deducciones. Se registra una sola vez como gasto fuera de caja; el registro de nómina no se vuelve a sumar como otro egreso.
- Reporte: ventas netas = ventas brutas − reembolsos; costo neto = costo vendido − costo de mercancía reintegrada; ganancia bruta = ventas netas − costo neto; resultado operativo = ganancia bruta − gastos. Las compras son inversión, no otro descuento del resultado.

Se compara cada turno, cada producto y los reportes globales, diarios, quincenales y mensuales para todos los usuarios y cada uno de los cuatro actores. Las quincenas son 1–15 y 16–fin de mes. Las ventas se fechan en Colombia; las devoluciones se reconocen al reembolsar, conservando el vendedor original para el reporte por usuario. Compras y gastos se atribuyen a quien los registra. El resultado por cajero no reparte los gastos generales.

## Devoluciones y redondeo

La solicitud y su aprobación reservan cantidades, sin cambiar caja ni inventario. Solo el reembolso confirmado mueve los saldos. Se cubren devolución de todos los renglones restantes, devolución parcial por unidades, devoluciones de periodos anteriores, efectivo, transferencia y mercancía dañada que no vuelve al inventario.

Los movimientos nuevos conservan centavos enteros durante el cálculo y se guardan en COP con dos decimales. La ficha puede mostrar un costo unitario promedio con mayor precisión. Una salida distribuye proporcionalmente el valor de inventario, redondeando al centavo más cercano, con empate hacia arriba. Al agotar existencias se consume todo su valor residual.

Una devolución usa el importe y costo de la línea original. Las cantidades pendientes, aprobadas o reembolsadas consumen disponibilidad; el rechazo la libera. El último reintegro permitido de una línea recibe el residuo del precio y del costo. Así, 30 devoluciones unitarias de una paca no crean ni pierden centavos. Si no hay reintegro físico, no se recupera costo ni stock. Si falta el costo histórico, la ganancia permanece pendiente.

Los documentos históricos firmados se conservan. Su formato de validación sigue siendo compatible. Los nuevos incluyen `calculationVersion: 2`, `lineTotal` y `costTotal` en el vínculo Hash. El valor de inventario previo se toma de existencias × costo al primer movimiento nuevo y se redondea al centavo; no se reescribe el historial para inventar precisión que no estaba registrada.

## Fallos y controles

Se reprodujo una venta de precio −5 que la versión anterior aceptaba y descontaba del stock. La nueva versión la rechaza sin registrar movimientos. También se verifican cero, negativos, `NaN`, infinito, fracciones de unidades, más de dos decimales, fechas inexistentes, existencias compartidas entre unidad y paca, cobros insuficientes, gastos sin efectivo, periodos de nómina superpuestos, permisos y repeticiones.

Las escrituras de negocio verifican almacenamiento actualizado y usan el mismo bloqueo entre pestañas cuando Web Locks está disponible. Un fallo de guardado restaura la memoria y no conserva el movimiento ni un Hash huérfano. Las pruebas anteriores cubren dos vendedores simultáneos, cambios de aprobación durante el cobro y duplicación de reembolso.

Límites del demo: cantidades por operación hasta 1.000.000 de presentaciones; importes individuales de ficha/compra/gasto/nómina hasta 1.000.000.000 COP; total de compra o venta hasta 1.000.000.000.000 COP; stock por referencia hasta 1.000.000.000 de unidades; base y conteo de caja hasta 100.000.000 COP. El valor de inventario y los acumulados se limitan a 10.000.000.000.000 COP para conservar centavos al guardar y leer números. Estos topes no sustituyen las restricciones del futuro backend.

## Alcance pendiente

La aprobación de esta suite corresponde al demo. Todavía se deben portar estas invariantes a transacciones PostgreSQL/RPC, validar restricciones y RLS, y repetir concurrencia entre dispositivos y recuperación sobre Supabase. La reescritura del JSON completo por movimiento crece con el historial; esta simulación no es una prueba de carga del futuro servidor.

No hay cálculo de impuestos, descuentos, intereses, liquidación legal de nómina ni emisión DIAN en este motor. No se consideran validados por probar sumas de ventas. Se mantienen el bloqueo de operación real y la publicación estable sujeta a aprobación.
