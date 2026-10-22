# Margaret · Flujo UX/UI de administración

Propuesta funcional para revisión. No representa una plataforma ya implementada. Las personas, ventas y valores del prototipo son ejemplos.

## Estructura de acceso

Ingreso con cuenta individual → validación de acceso → inicio según rol → turno asignado → operación → arqueo → aprobación del gerente.

- Administrador: configura negocio, crea gerentes, administra roles, consulta toda la operación y auditoría.
- Gerente: agrega y desactiva vendedores, programa turnos, administra inventario y precios, autoriza descuentos y anulaciones, revisa arqueos y reportes del local. No puede otorgar permisos de administrador.
- Vendedor: consulta su turno y disponibilidad, registra ventas, cobra, consulta sus ventas y presenta su arqueo. No consulta costos, márgenes ni información de otros vendedores.

## Pantallas

1. Acceso: usuario y contraseña, recuperación de acceso y estado de cuenta. Un usuario inactivo no ingresa.
2. Inicio: administrador ve resultados y pendientes globales; gerente ve operación del local; vendedor ve turno, caja y acceso a vender.
3. Equipo: listado, alta de vendedor, activación, desactivación y detalle de permisos. Dos cuentas iniciales provisionales: Vendedor 1 y Vendedor 2. Permitir agregar más sin compartir usuarios. Solo el administrador crea gerentes o cambia roles.
4. Turnos: fecha, hora inicial y final, mínimo dos vendedores, responsable de caja, descansos, estado y entrega. No publicar un turno con menos de dos vendedores, usuarios inactivos u horarios superpuestos. Horarios reales por confirmar.
5. Apertura: verificar asignación y caja disponible, contar base, confirmar responsable y registrar hora. Una sola apertura activa por caja.
6. Punto de venta: buscar o escanear producto, agregar unidades, revisar disponibilidad, cobrar por medio de pago y emitir comprobante. Registrar vendedor, caja y turno en cada venta. Evitar cobros duplicados y ventas sin existencias.
7. Excepciones: vendedor solicita descuento, devolución o anulación con motivo; gerente aprueba o rechaza; conservar responsable, fecha y valores anteriores y posteriores.
8. Arqueo: separar efectivo, transferencias y otros medios; mostrar efectivo esperado según base, cobros, devoluciones, entradas y salidas autorizadas; contar efectivo y explicar diferencias. El vendedor envía; el gerente revisa y aprueba o devuelve para corrección.
9. Entrega: ambos vendedores confirman sus ventas y operaciones; el responsable entrega caja; el turno siguiente acepta el conteo. Los vendedores no aprueban su propio cierre. El gerente que opere caja requiere revisión por otro gerente o administrador.
10. Reportes: ventas por día, turno, vendedor, categoría y medio de pago; inventario bajo, diferencias y pendientes. Visibilidad según rol.

## Reglas de operación

- Base propuesta: una caja compartida por turno con un responsable identificado; cada vendedor conserva su sesión individual. Si hay varias cajas, cada una necesita apertura y arqueo separados.
- Los dos vendedores pueden vender simultáneamente; los registros e inventario deben actualizarse de forma consistente.
- Estados: borrador → programado → caja abierta → en operación → cierre pendiente → cerrado. Si se rechaza el arqueo, vuelve a corrección. Una caja en cierre no acepta ventas.
- Desactivar un usuario conserva su historial y exige reemplazar su asignación en turnos futuros.
- Un cierre aprobado bloquea modificaciones directas. Las correcciones posteriores se registran como ajustes autorizados y auditados.
- Los permisos deben validarse en el servidor y en cada operación, además de ocultar acciones en pantalla.
- El prototipo permite explorar roles mediante un selector; la plataforma real obtiene el rol de la cuenta autenticada.

## Criterios de aceptación

- Crear como mínimo dos vendedores con usuarios únicos y poder agregar otros.
- Asignar dos o más vendedores a cada turno y elegir responsable de caja.
- Bloquear ventas fuera del turno, sin caja abierta o durante el cierre.
- Identificar quién realizó cada venta y quién autorizó una excepción.
- Exigir observación cuando hay diferencia de caja y aprobación independiente para cerrar.
- El vendedor no puede cambiar roles, modificar precios, consultar márgenes ni aprobar su propio arqueo.

## Alcance del prototipo

Incluye navegación por roles, alta local de vendedores, selección de dos o más vendedores, apertura de caja, cobro ilustrativo y revisión de cierre. Sus datos solo viven durante la demostración. La autenticación, persistencia, inventario, comprobantes, aprobaciones y validación de horarios requieren implementación posterior.
