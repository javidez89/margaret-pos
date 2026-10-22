# Turnos aprobados y ventas por vendedor

## Flujo para comenzar

1. El administrador o gerente abre **Turno y caja**.
2. Configura fecha, nombre, horario, mínimo dos vendedores activos y responsable de caja.
3. Pulsa **Guardar y aprobar turno**. Guardar la configuración sin aprobar no habilita las ventas.
4. El responsable asignado abre la caja e ingresa su base inicial. Administrador o gerente con permiso de turnos también puede realizar esta apertura.
5. Los vendedores asignados que tengan permiso de ventas pueden comenzar a vender.

Estados: **Programado → Aprobado → Abierto → Cierre pendiente → Cerrado**.

## Qué bloquea las ventas

- Turno sin aprobación o con una configuración distinta a la aprobada.
- Caja sin abrir, en cierre pendiente o cerrada.
- Vendedor que no pertenezca al equipo actual.
- Acceso inactivo, retirado, con cambio de contraseña pendiente o sin permiso de ventas.
- Cambio de turno o de datos mientras se confirma un cobro: la operación debe revisarse antes de volver a intentar.

Cambiar equipo, responsable, fecha, nombre u horario invalida la aprobación anterior. Esto también aplica al editar un turno que ya tenía la caja abierta: conserva sus movimientos, pero bloquea nuevas ventas hasta aprobar de nuevo. Un turno nuevo nunca hereda la aprobación del anterior.

Los turnos antiguos que estaban abiertos sin un registro de aprobación también quedan bloqueados. El administrador o gerente puede revisar su configuración y aprobarla desde la misma pantalla, conservando ventas y base de caja existentes.

## Actualización de cada vendedor

Las pestañas que abren el mismo HTML en el mismo navegador actualizan los datos guardados, el equipo, el responsable y los permisos. También comprueban los datos al recuperar el foco y periódicamente mientras están visibles. Cada cobro vuelve a leer los datos vigentes antes de guardar y comprueba que el turno no haya cambiado durante la generación del comprobante.

La configuración se comparte en el almacenamiento de este demo local. Para vendedores en computadores o dispositivos distintos se requiere una base de datos y sesiones centralizadas.

El horario identifica la configuración aprobada; el demo continúa sin imponer bloqueos por la hora del reloj. La autorización depende de la aprobación, la apertura y la asignación vigente.

## Verificación

Pasaron 29 comprobaciones con sesiones aisladas y almacenamiento compartido de prueba. Incluyen actualización entre vendedores, apertura solo después de aprobar, vendedor retirado o sin asignación, permisos revocados, cierre pendiente, cambio de turno, ventas simultáneas, aprobación modificada durante un cobro y fallo al guardar una aprobación.

Se verificó también que las pantallas muestren la apertura solo al responsable tras la aprobación, y que ambos comprobantes de ventas simultáneas conserven códigos Hash válidos. Las pruebas se ejecutaron sin modificar los datos reales del navegador del usuario.

Resultado: [Margaret-validacion-turnos.json](Margaret-validacion-turnos.json).
