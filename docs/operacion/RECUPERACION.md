# Respaldos y recuperación operativa

Diseño y procedimiento propuestos · 23 de octubre de 2026. Complementa la [revisión del backend](../REVISION-ARQUITECTURA-BACKEND.md). No hay un servicio de copias de servidor ni una recuperación PostgreSQL ejecutada todavía.

Decisión vigente: [GitHub Pages + Supabase](../ARQUITECTURA-VIGENTE.md), con pruebas locales. Aplicar este procedimiento a servicios gestionados/tareas de Supabase, sin presuponer un trabajador NestJS ni un servidor contratado aparte. La copia externa independiente todavía requiere acordar un medio fuera de la cuenta del proveedor.

Si se elige Supabase, adaptar los pasos al servicio gestionado conforme a la [evaluación de proveedor](../DECISION-GITHUB-SUPABASE.md#respaldos-y-costo-condiciones-reales). No presuponer acceso a sus archivos físicos/WAL ni que restaurar DB recupere objetos o configuración de Auth. Comprobar explícitamente identidades, roles, archivos y configuración; un dump limitado al esquema de negocio no equivale a recuperar la plataforma.

## Qué copia puede descargar cada persona

| Copia | Contenido y acceso | Uso |
| --- | --- | --- |
| JSON del demo actual | Estado completo del navegador, incluidas credenciales de demostración. | Pruebas y traslado de escenarios, según la [guía existente](../Margaret-guia-respaldos.md). No equivale a un backup del servidor futuro. |
| Exportación gerencial futura | Datos permitidos por rol/alcance y manifiesto; cifrada si incluye información privada. Excluye hashes de contraseña, tokens, sesiones, certificados y secretos. Descarga temporal auditada. | Consulta, contabilidad operativa o importación controlada de datos. No restaura identidades ni reemplaza toda la plataforma. |
| Respaldo operativo futuro | Base completa, objetos/documentos y versiones, esquema, configuración recuperable y referencias de claves. Incluye hashes de contraseñas bajo acceso restringido; revocar sesiones al recuperar. | Recuperar el servicio. Acceso exclusivo del responsable de operación; no es un botón de descarga para cualquier gerente. |

Subir un archivo gerencial o JSON no concede permisos a las cuentas contenidas en él. La recuperación se autoriza con identidad vigente del operador y control reforzado, fuera del flujo público de ingreso. Un archivo de origen desconocido se trata como entrada no confiable, con límites de tamaño, validación y cuarentena.

## Política inicial propuesta

- Copia diaria del servidor, aunque no haya navegadores abiertos; base física periódica y archivado continuo de WAL para recuperación a un momento determinado.
- Objetivos por validar con proveedor, tamaño y presupuesto: **RPO de 5 minutos** y **RTO de 2 horas**. Una copia diaria aislada podría perder hasta aproximadamente un día; no satisface por sí sola el RPO propuesto.
- Retención inicial a evaluar: 7 días recuperables mediante WAL, 30 copias diarias y 12 mensuales. Alinear retención de documentos, claves, versiones de objetos y datos personales; no se fija aquí un plazo legal.
- Almacenamiento cifrado fuera del equipo y de la cuenta de operación principal; versionado y protección contra borrado para la ventana acordada. Copias y claves con permisos y recuperación separados.
- Supervisión de última copia correcta, continuidad del archivo WAL, antigüedad recuperable y último simulacro. El trabajo no puede notificarse como correcto solo porque arrancó o subió un archivo.

[PostgreSQL documenta la combinación de copias base y WAL para PITR](https://www.postgresql.org/docs/18/continuous-archiving.html). El proveedor deberá demostrar que la configuración elegida cumple los objetivos; escribirlos en un documento no los implementa.

## Manifiesto y verificación de copia completa

Cada ejecución conserva `backup_id`, origen/ambiente, comienzo/fin, versión de aplicación y esquema, versión de PostgreSQL, punto recuperable/LSN, tamaños, hashes, inventario de objetos/versiones, cifrado y referencias de claves, resultado y responsable de validación. Proteger la autenticidad del manifiesto; un checksum editable junto al archivo detecta corrupción, pero no acredita quién lo generó.

Capturar conteos y sumas de control desde una instantánea coherente, no desde consultas separadas mientras las ventas cambian. Asociar los documentos privados a sus versiones; impedir que un documento referenciado desaparezca antes de copiarlo. Si se usa recuperación puntual, validar también el punto seleccionado, que puede ser posterior a la copia base.

Tres comprobaciones diferentes:

1. **Transferencia:** comparar bytes, tamaños y hashes después de descargar la copia desde su almacenamiento externo. No bastan los del archivo antes de subirlo.
2. **Formato e integridad física:** para copias de `pg_basebackup`, usar el manifiesto y `pg_verifybackup` compatible; comprobar el WAL y que exista continuidad hasta el objetivo. No usar esa herramienta para afirmar validez de JSON o de un `pg_dump`. [Alcance de pg_verifybackup](https://www.postgresql.org/docs/18/app-pgverifybackup.html).
3. **Recuperación funcional:** iniciar una base restaurada y reconstruir el negocio. Una copia lógica `pg_dump` requiere probar `pg_restore` en una base aislada; no proporciona PITR por sí sola. [Copias lógicas PostgreSQL](https://www.postgresql.org/docs/18/backup-dump.html).

Los backups no ejecutan automáticamente SQL/archivos cargados por un usuario de la web. La herramienta operativa solo consume respaldos de procedencia validada, mediante credenciales y destinos restringidos.

## Procedimiento de recuperación

| Paso | Acción y evidencia de salida |
| --- | --- |
| 1. Contener | Abrir incidente, designar responsable y poner escrituras en mantenimiento. Detener trabajadores, pagos y emisión externos. Conservar estado actual y logs si son recuperables. |
| 2. Elegir | Identificar backup y punto de recuperación; verificar ambiente, esquema, claves, continuidad WAL y manifiesto. Estimar operaciones que quedan fuera y comparar con RPO acordado. |
| 3. Aislar | Crear destino nuevo con nombre/identificador explícito y red sin acceso a proveedores de producción. La herramienta rechaza restaurar sobre el origen o una conexión fuera de su lista permitida. Evitar que los trabajos recuperados se ejecuten al arrancar. |
| 4. Restaurar | Recuperar base y objetos/versiones; conservar registros de herramientas, descifrado y verificación. No sustituir aún la base activa. Usar versiones compatibles de PostgreSQL y esquema. |
| 5. Comprobar | Ejecutar matriz de integridad siguiente y pruebas de aplicación sin correos, pagos ni emisiones reales. Registrar resultados, diferencias y tiempo consumido. |
| 6. Conciliar | Comparar movimientos bancarios/pagos y documentos fiscales externos posteriores al punto restaurado. Marcar operaciones ya ejecutadas y proteger numeraciones. No repetir cobros o emisiones por recuperar un outbox antiguo. |
| 7. Autorizar cambio | Revisar diferencias, RPO/RTO y evidencia. Operador y responsable del negocio autorizan la reapertura; revocar sesiones/tokens de activación recuperados y rotar credenciales comprometidas si corresponde. |
| 8. Reabrir | Cambiar conexión de forma controlada, validar ingreso, permisos y turno. Habilitar ventas y después trabajadores conciliados. Observar saldos y errores; conservar copia previa y acta del incidente. |

Si no se puede conciliar un cobro, una emisión o su numeración, mantener ese proceso detenido y escalar al responsable. Restaurar datos no revierte lo sucedido en el banco o en un sistema fiscal externo. La reversión de una versión de código tampoco restaura una base de datos ni deshace ventas.

## Matriz mínima de aceptación de la restauración

| Área | Comprobación |
| --- | --- |
| Alcance y relaciones | Conteos por tabla/local y claves foráneas; documentos sin líneas, pagos sin venta, reembolsos sin origen y referencias cruzadas inválidas deben ser cero. Comparar con el manifiesto para su instantánea y explicar diferencias del punto PITR. |
| Inventario | Recalcular unidades desde apertura, compras, ventas, ajustes y reintegros; comparar cada producto/local con el saldo materializado. Sin saldos negativos ni factores de presentación perdidos. |
| Caja | Reconstruir base, entradas, ventas efectivas, gastos y reembolsos por turno; transferencias separadas. Cierres históricos conservados. |
| Ventas y pagos | Totales/líneas/impuestos/pagos y costo histórico; una sola venta y efecto por clave de idempotencia. Comparación decimal, sin tolerancia arbitraria para ocultar diferencias. |
| Devoluciones y nómina | No exceder unidades/importe vendido; reserva, reembolso y reintegro coherentes. Nómina enlazada a un gasto único. |
| Documentos y claves | Objetos referenciados presentes, tamaños/hashes/versiones correctos; verificar autenticadores de vouchers con las claves históricas autorizadas. Numeración sin duplicados. |
| Identidad y acceso | Perfiles, roles y alcance conservados; sesiones revocadas. Acceso privilegiado y recuperación administrativa disponibles sin restaurar claves públicas por defecto. |
| Externos y trabajos | Referencias de pagos/emisión conciliadas; outbox pausado, estados conocidos y duplicados bloqueados. Pruebas de restauración nunca llaman proveedores reales. |

Guardar evidencia con origen, destino aislado, punto objetivo, resultados y diferencias, tiempo hasta validar/reabrir y aprobación. Medir RPO desde el último estado confirmado recuperado y RTO hasta recuperar el servicio utilizable según el incidente; incluir descarga, claves y comprobaciones, no solo el tiempo de restauración SQL.

## Ensayos y responsables

Propuesta: verificar copias diariamente, simulacro de recuperación mensual y antes de cambios relevantes de esquema/almacenamiento. Responsable de operación ejecuta; responsable del negocio acepta saldos y pérdida eventual. Mientras una sola persona cubra ambos roles, dejarlo registrado y no declarar revisión independiente.

Antes del piloto deben pasar estos casos en ambiente aislado: copia completa correcta; descarga truncada; checksum/manifiesto alterado; objeto faltante; clave no disponible; WAL incompleto; permiso insuficiente; destino de producción rechazado; trabajador sin salida a servicios reales; y recuperación desde la versión de esquema anterior. Ante fallo no cambiar la conexión activa.

La primera implementación incluye una restauración real de PostgreSQL de pruebas. El ensayo con almacenamiento externo y medición del objetivo completo depende del alojamiento todavía no elegido. Las 29 verificaciones JSON del demo son evidencia complementaria y no se contabilizan como ese simulacro.
