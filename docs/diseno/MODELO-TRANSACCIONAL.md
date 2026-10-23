# Modelo transaccional y contratos iniciales

Diseño propuesto · 23 de octubre de 2026 · Complemento de la [revisión del backend](../REVISION-ARQUITECTURA-BACKEND.md). No es una migración ejecutada ni una API disponible.

La [evaluación de Supabase](../DECISION-GITHUB-SUPABASE.md) añade una opción de identidad gestionada: en ese caso, `users`/perfiles referencian el identificador de Auth y sus contraseñas/tokens de activación son responsabilidad del proveedor. Adaptar las entidades de acceso y la sesión de aplicación al modelo elegido; no duplicar hashes ni tratar nombres de tablas de este diseño como una migración ya aprobada.

## Convenciones y alcance

- Una organización y un local iniciales; `organization_id` y `store_id` explícitos en recursos de negocio. Identificadores internos UUID, separados del usuario legible y del número de recibo.
- Alcance resuelto desde la sesión y membresía; un `storeId` enviado por la interfaz no otorga autorización. Claves foráneas compuestas cuando haga falta garantizar que turno, venta y movimiento pertenezcan al mismo local.
- Cantidad base entera para este catálogo: una botella/lata es una unidad; cada presentación define un factor entero positivo, normalmente 1 o 30. No mezclar costo por paca con costo por unidad.
- Importes `NUMERIC(18,2)` y costos unitarios `NUMERIC(20,6)`; operar con aritmética decimal y representar decimales como cadenas en JSON. Redondeo e impuestos explícitos y versionados, sin convertir totales a `Number` para decidir cobros.
- Instantes `timestamptz`, hora de servidor y fechas operativas en `America/Bogota`. Fecha de gasto/compra diferenciada del momento de registro. Períodos quincenales: días 1–15 y 16–fin de mes.
- Maestros retirados conservan referencias históricas. Documentos confirmados no se editan ni eliminan para corregir saldos; se emiten ajustes y movimientos compensatorios.

## Entidades y restricciones principales

| Grupo | Entidades | Restricciones e índices iniciales |
| --- | --- | --- |
| Alcance | organizations, stores, user_store_memberships | Pertenencia única usuario/local. Local deshabilitado impide operaciones. |
| Personas | users, user_profiles | Username normalizado único por organización; documento como texto, único por organización/tipo/número. Estado `pending_activation`, `active`, `disabled`. Datos obligatorios: nombre completo, cédula, correo, celular y dirección. |
| Acceso | roles, permissions, role_permissions, user_permission_overrides, sessions, activation_tokens | No conceder lo que el actor no puede delegar. Hash único del token de alta y sesión; vencimiento, uso/revocación y revisión de acceso. No devolver hashes a la web. |
| Caja y turnos | cash_registers, shifts, shift_members, shift_approvals, shift_closures | Una caja con como máximo un turno abierto/cerrándose mediante índice único parcial. Miembro único por turno. Aprobación vinculada a revisión. Cierre único por turno. |
| Catálogo | products, product_presentations, product_barcodes | SKU/código normalizado único por organización; código como texto conserva ceros. Una presentación pertenece a un producto; factor > 0, precios >= 0. |
| Inventario | stock_balances, stock_movements | Saldo único local/producto, unidades >= 0 y revisión. Movimiento con origen/tipo/clave única que evita aplicar la misma línea dos veces. Índice local/producto/fecha/id. |
| Compras | suppliers, purchases, purchase_lines | Fecha/proveedor/actor; cantidades y costos válidos, presentación y factor históricos. Una confirmación crea un único juego de movimientos. |
| Ventas | sales, sale_lines, sale_payments | Número único por local/serie; líneas con unidades, precio, descuento, impuestos y costo histórico. Pagos positivos; suma verificada contra total en la transacción. |
| Devoluciones | returns, return_lines, refund_payments | Línea referencia la línea vendida y su alcance; cantidades > 0. Reserva serializada contra devolución pendiente/aprobada; un reembolso final por devolución en el alcance inicial. |
| Gastos y nómina | expense_concepts, expenses, payroll_payments | Nómina con referencia única al gasto asociado. Importe > 0 y origen del dinero definido. Egresos de caja identifican turno/caja que pagó. |
| Documentos | receipts, fiscal_documents, fiscal_attempts | Alias Hash único y longitud <= 10; número único por serie/local. Recibo conserva instantánea del emisor. Fiscal tiene estados y referencias externos propios. |
| Control | idempotency_requests, outbox_events, audit_events, backup_runs | Clave de idempotencia única por organización/actor/operación; hash de petición, resultado y recurso. Identidad única de evento y de origen. Auditoría con actor/fecha/motivo/correlación. |

Los `CHECK` protegen condiciones de una fila. Las sumas entre líneas, pagos, stock y devoluciones requieren transacción; no se simulan con un `CHECK` que consulte otras filas. Indexar claves foráneas usadas en uniones y filtros; PostgreSQL no crea automáticamente todos esos índices. No añadir índices a cada columna: comprobar planes con consultas representativas. [Restricciones de PostgreSQL](https://www.postgresql.org/docs/18/ddl-constraints.html).

Separar el rol SQL de migraciones del de API, trabajador y recuperación. La API no es propietaria del esquema ni superusuario; no elimina auditoría ni transacciones confirmadas. El rol que puede recuperar una copia no se entrega al gerente mediante la aplicación.

## Alta y permisos

El formulario solicita nombre completo y mantiene campos de nombres/primer apellido suficientemente precisos para generar el usuario. Mostrar la propuesta inmediatamente; permitir corregir el apellido interpretado antes de guardar. No inferir siempre el primer apellido a partir de la última palabra: hay nombres y apellidos compuestos.

El servidor genera y reserva el usuario en la misma transacción de creación: María Pérez → `MPEREZ`; conflicto → sufijo, por ejemplo `MPEREZ2`, con restricción única y reintento acotado. No cambiarlo automáticamente al editar el nombre de una cuenta existente. La cuenta queda pendiente; activar exige token válido y contraseña nueva. La activación consume el token una sola vez en una transacción, también ante dos solicitudes simultáneas.

Administrador y gerente gestionan vendedores según permisos delegables. Retirar equivale a deshabilitar, revocar sesiones e impedir asignaciones nuevas; no borrar personas vinculadas a ventas/nómina. Proteger la existencia de al menos un administrador activo con serialización del cambio, no contando usuarios sin bloqueo. Mantener la matriz de permisos como política versionada y auditada; una sesión no conserva privilegios indefinidamente porque se emitió antes de una revocación.

## Costos e inventario

Crear la ficha no crea compra ni saldo positivo. Escanear selecciona una presentación registrada. Una compra confirmada almacena unidades base y costo total; aumenta el saldo y recalcula el costo promedio ponderado con precisión decimal. Dos compras simultáneas del mismo producto bloquean el mismo saldo.

Ejemplo sin impuestos ni descuentos: saldo 30 unidades a costo 2.000,00; entra una paca de 30 a 66.000,00. Nuevo saldo 60, inversión adicional 66.000,00 y costo promedio 2.100,00. Vender una unidad a 3.000,00 registra ingreso 3.000,00, costo histórico 2.100,00 y utilidad bruta 900,00. Una venta en canasta/paca consume 30 unidades; su precio puede diferir de 30 ventas unitarias.

La ficha muestra costo vigente, precio de venta y ganancia estimada. Reportes usan precio y costo capturados en cada venta. Definir tratamiento de impuestos recuperables/no recuperables antes de validar utilidad contable; el ejemplo anterior es operativo y no fija una política tributaria.

Alertas por unidades base: rojo si `< 5`, amarillo si `>= 5 y < 10`; desde 10 no hay alerta. Producto retirado se conserva para devoluciones históricas: la decisión de reintegrarlo debe ser explícita y auditable, sin impedir por defecto un reembolso autorizado.

## Confirmación de venta: una transacción

Todas las escrituras sensibles siguen un orden de bloqueos documentado. Propuesta: control de acceso → caja/turno → documento de origen si existe → saldos de inventario ordenados por producto → contadores. Revocar acceso/permiso y cambiar un turno deben usar los mismos controles de serialización; evitar validaciones separadas que puedan quedar obsoletas antes del commit.

1. Autenticar, validar CSRF, esquema, límites y `Idempotency-Key`. Obtener el actor de la sesión.
2. Iniciar transacción y reservar la clave única con huella canónica de la solicitud. Una repetición autorizada con la misma huella devuelve el resultado persistido; con otra huella, conflicto. La clave no es una credencial para consultar ventas ajenas.
3. Revalidar sesión, acceso, local y permiso; bloquear el turno. Exigir revisión esperada, aprobación de esa revisión, estado abierto y asignación. El mínimo de dos vendedores activos se valida al configurar/aprobar/abrir; desactivar un miembro invalida la aprobación afectada.
4. Bloquear saldos y configuración de precios aplicable en orden estable. Calcular importes, factor, descuentos autorizados, impuestos y costos. Si cambió la cotización aceptada por el cajero, rechazar con importes actualizados para confirmar de nuevo; no cobrar silenciosamente un precio distinto.
5. Verificar stock y pagos; insertar venta, líneas, pagos, movimiento de caja efectivo, stock, recibo, auditoría y outbox. Obtener número mediante secuencia o contador protegido, nunca `COUNT(*) + 1`. La numeración fiscal se define en su módulo; no prometer consecutivos internos sin huecos.
6. Persistir el resultado de idempotencia en la misma transacción y confirmar. Cualquier error revierte todos los movimientos; liberar la conexión en `finally`.
7. Responder con la venta confirmada y su voucher. Imprimir o generar PDF puede reintentarse sin repetir el cobro. Avisar a otras interfaces para refrescar datos.

Mantener las transacciones cortas: sin correo, impresión, llamadas fiscales o espera de usuario dentro de ellas. La venta y el cierre que compiten se ordenan por el bloqueo del turno: si gana cierre, la venta se rechaza; si gana venta, el cierre incluye ese importe. Ante deadlock o serialización fallida, rollback y reintento acotado con la misma clave. [Bloqueo de filas y orden de adquisición](https://www.postgresql.org/docs/18/explicit-locking.html).

Si el servidor falla después del commit y antes de responder, consultar la operación por clave. Un resultado no visible mientras sigue en curso no habilita a cobrar de nuevo. Si es necesario reenviar, repetir exactamente el mismo payload y la misma clave; no crear otra clave para resolver la incertidumbre. Propuesta de retención: conservar la referencia/huella de idempotencia mientras exista el documento financiero, aunque caduque la copia detallada de la respuesta.

## Devoluciones, egresos y reportes

- **Solicitud total o parcial:** bloquear venta/líneas y reservar solo unidades todavía disponibles, descontando solicitudes pendientes y aprobadas. El total se calcula desde valores originales prorrateados con regla de redondeo que conserva el máximo reembolsable. No aumenta stock ni sale dinero.
- **Aprobación:** administrador/gerente aprueba cantidades, importe y destino de mercancía exactos. Cambiarlos exige nueva revisión. Rechazar libera reserva y registra motivo. No tratar «aprobar» como si ya se hubiera entregado dinero.
- **Reembolso:** efectivo o transferencia, actor y referencia. Efectivo requiere caja abierta/autorizada y queda en el turno que realmente lo paga, aunque la venta sea anterior. En una transacción: consumir reserva, registrar pago, egreso, eventual reintegro con costo original, voucher y auditoría. Estado final solo una vez. Definir política de costo para reintegros de stock cero y desvíos por redondeo.
- **Transferencias manuales:** guardar referencia y estado de conciliación. Registrar una transferencia no prueba por sí mismo que el banco la liquidó. Si se integra un proveedor, su referencia/idempotencia y conciliación externa tienen flujo propio.
- **Gasto/nómina:** origen caja/fuera de caja, concepto, fecha, importe y autor. Nómina enlaza un gasto único y genera comprobante. Nunca sumar ambos como dos egresos en un reporte.
- **Reportes:** ventas brutas, devoluciones pagadas, ventas netas, costo histórico, utilidad bruta, gastos y resultado operativo por fecha/período/local/vendedor/turno. Presentar inversión en compras separada del gasto y del costo vendido para evitar restarla dos veces.

El efectivo esperado se reconstruye desde base de caja + ventas efectivas + entradas autorizadas − egresos efectivos − reembolsos efectivos. Transferencias no alteran efectivo. Los ajustes de caja requieren motivo y permiso. Un turno cerrado no recibe movimientos nuevos; una devolución posterior se paga en un turno vigente o desde una fuente externa autorizada.

## Comprobantes y tareas diferidas

Mostrar «Código Hash» de máximo 10 caracteres. Propuesta: alias alfanumérico derivado de un HMAC completo de la instantánea canónica, con fecha/hora, actor, número, versión y nonce aleatorio. La base impone alias único; una colisión genera otro nonce. La clave permanece en gestor de secretos, identificada mediante `key_id`; conservar claves de verificación históricas conforme a retención.

El alias sirve para localizar el registro. Para verificar autenticidad, el servidor comprueba el autenticador completo y la instantánea guardada; la búsqueda tiene límites de frecuencia y respuesta sin datos personales innecesarios. No usar diez caracteres como única prueba criptográfica ni confundirlos con identificadores fiscales. Descargar PDF no modifica la identidad del recibo.

El outbox guarda el evento en la transacción. El trabajador reclama lotes con bloqueo y vencimiento de lease; procesa fuera de la transacción larga, registra intentos y reintenta con límite. El consumidor deduplica por evento/documento. Antes de repetir una llamada externa de estado incierto, consulta al proveedor; no se garantiza ejecución externa exactamente una vez.

## Contratos HTTP de la primera operación completa

Propuesta para convertir a OpenAPI en el primer PR de implementación. UUID como identificadores; entradas con campos desconocidos rechazados; lista paginada con límite máximo. `sellerId`, costos y totales calculados no se aceptan como decisiones del cliente.

| Endpoint | Entrada / resultado principal | Autorización y control |
| --- | --- | --- |
| `POST /api/v1/auth/activate` | Token + contraseña nueva; consume token, activa cuenta, exige ingreso. | Token vigente; rate limit; no sesión operativa previa. |
| `POST /api/v1/auth/login` | Usuario + contraseña; cookie y perfil mínimo. | Mensaje genérico, límites, MFA privilegiado según política. |
| `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` | Estado actual / revocación de sesión. | Sesión vigente; logout protegido contra CSRF. |
| `POST /api/v1/users`, `PATCH /api/v1/users/{id}` | Datos completos / edición con revisión esperada. | Equipo y delegación; activación no devuelve hash ni contraseña. |
| `POST /api/v1/users/{id}/disable` | Motivo y revisión; conserva historial. | Actor autorizado; último administrador protegido; revocar sesiones. |
| `GET /api/v1/products` | Categoría, consulta/código y paginación. | Inventario o venta; costos solo con permiso específico. |
| `POST /api/v1/products`, `POST /api/v1/purchases` | Ficha con cero stock / compra confirmada. | Inventario/compra; idempotencia en operaciones de creación. |
| `POST /api/v1/shifts/{id}/approve`, `/open`, `/close` | Revisión, base o arqueo; estado actualizado. | Permiso, asignación y estado; revisión y transacción. |
| `POST /api/v1/sale-quotes` | Carrito con presentación/cantidad; cotización, precios e importes del servidor con vencimiento. | Venta y alcance; no reserva stock ni confirma un cobro. |
| `POST /api/v1/sales` | Turno/revisión, cotización aceptada, presentación/cantidad y pagos. | Venta, turno aprobado/abierto e `Idempotency-Key`. |
| `GET /api/v1/sale-operations/{key}` | En curso / venta confirmada / sin resultado confirmado. | Mismo actor/alcance o permiso de supervisión; no autoriza duplicar cobro. |
| `GET /api/v1/sales/{id}/receipt` | Instantánea e identificación del voucher. | Venta propia o permiso global. |

Ejemplo ilustrativo, sin impuestos: la cotización aceptada se compara, nunca se toma como total definitivo calculado por el cliente.

```json
{
  "shiftId": "00000000-0000-4000-8000-000000000001",
  "expectedShiftRevision": 3,
  "quoteId": "00000000-0000-4000-8000-000000000002",
  "lines": [{ "presentationId": "00000000-0000-4000-8000-000000000003", "quantity": 1 }],
  "payments": [{ "method": "cash", "amount": "3000.00", "received": "5000.00" }]
}
```

La cotización se obtiene del servidor, vence y queda ligada al carrito, precios, actor y local; no reserva stock ni promete que el turno seguirá abierto. `amount` es lo aplicado al total, `received` lo entregado; el servidor calcula el cambio. Respuesta: identificador, número, fecha de servidor, vendedor, importes, pagos, cambio y voucher confirmados.

Errores estables: `401 SESSION_REQUIRED`, `403 PERMISSION_DENIED`, `409 SHIFT_NOT_APPROVED`, `SHIFT_REVISION_CHANGED`, `SHIFT_CLOSED`, `STOCK_INSUFFICIENT`, `PRICE_CHANGED` o `IDEMPOTENCY_CONFLICT`; `422 VALIDATION_FAILED`. Incluir mensaje comprensible, campos afectados y `correlationId`, sin trazas ni secretos. Una misma clave con payload modificado no se acepta como nueva venta.
