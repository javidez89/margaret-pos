# Registro de cambios

Este proyecto usa versiones MAJOR.MINOR.PATCH. Las versiones 0.x todavía son de desarrollo y validación.

## 0.4.1 - 2026-10-23

- Auditoría matemática reproducible de 400 días, dos turnos diarios, ventas de dos cajeros, compras, gastos, nómina y devoluciones completas/parciales. Comparación con un libro independiente de centavos enteros.
- Validación de precios, cantidades, fechas, importes finitos, límites, saldo disponible e identificadores de operación; se rechaza la venta con precio negativo.
- Movimientos monetarios a dos decimales, costo histórico por renglón y valoración de inventario conservada al vender y reintegrar mercancía. El último reintegro absorbe el residuo de centavos.
- Compras, gastos, nómina, solicitudes de devolución y reembolsos usan el control de escritura compartido y revierten si falla el guardado. Nómina incorpora un solo gasto.
- La numeración de turnos conserva los identificadores de movimientos históricos aunque no exista cierre archivado, evitando mezclar saldos de turnos distintos.
- Los vouchers anteriores conservan su contenido y Hash; los nuevos vinculan también los importes y costos exactos. Importes fraccionarios visibles en pantalla y formularios.
- Regresiones de errores, duplicados y recuperación; recorrido de compra, venta, gasto y devolución parcial en Chromium/Chrome de CI. Datos sintéticos aislados de Supabase y del navegador personal.

## 0.4.0 - 2026-10-23

- Decisión de arquitectura: GitHub Pages para la interfaz y Supabase para backend, con pruebas funcionales locales y CI efímero. Sin NestJS ni otro alojamiento.
- Se retira el publicador de develop. La siguiente publicación aprobada incluirá solo producción, sin la antigua ruta pública `/pruebas/`.
- Promoción vinculada al commit/árbol/versiones y los tres controles CI reales de develop; revalidación de evidencia tras aprobación, sin depender de un sitio de QA público.
- Se conserva la aprobación manual, claves de almacenamiento del demo estable y bloqueo de operación real hasta implementar y validar Supabase y recuperación.
- Regresiones para origen/estado de QA, controles ausentes o fallidos, contenido distinto y rutas de consulta no permitidas.

## 0.3.1 - 2026-10-23

- Extracción explícita del JavaScript de la plantilla para su validación, sin regex de filtrado HTML.
- URL pública y rutas de consulta GitHub limitadas; rechazo de redirecciones y regresión para rutas no permitidas.
- Revisión documentada de los avisos iniciales de CodeQL y de las transferencias previstas del publicador.

## 0.3.0 - 2026-10-23

- Ambiente de pruebas en develop y vista estable con promoción manual desde main.
- Almacenamiento, respaldos y bloqueo de escritura separados; la vista estable conserva sus datos existentes.
- Promoción ligada al contenido exacto, versión y ejecución de QA aprobada; preservación íntegra del otro ambiente.
- CI de negocio, seguridad y Chromium, informes de evidencia y comprobación posterior al despliegue.
- Protecciones obligatorias de ramas, aprobación del ambiente production y reglas de etiquetas sin sobrescritura.
- Escaneo de secretos, dependencias y CodeQL; actualizaciones propuestas por Dependabot.
- Instrucciones del repositorio y guía de responsabilidades de desarrollo, UX, QA, seguridad, DevOps y versión.

## 0.2.0 - 2026-10-22

- Configuración explícita de ambientes local y production, con datos de prueba solo en local.
- Indicador de ambiente y versión en el ingreso y menú del demo.
- Rama develop para integración y main para versiones estables.
- Pruebas de aislamiento de ambientes, coherencia de versión y rechazo del demo en producción.
- Flujo manual de GitHub para generar paquetes con checksum y un borrador de versión preliminar.
- Guía de desarrollo, promoción, publicación y reversión de código.
- Ambientes local/production creados en GitHub; protección obligatoria de ramas no disponible en el plan privado actual.

## 0.1.0 - 2026-10-22

- Primera versión privada del demo de Margaret, arquitectura y guías.
- Compilación reproducible y validación automática de exportaciones, respaldos, turnos y devoluciones.
