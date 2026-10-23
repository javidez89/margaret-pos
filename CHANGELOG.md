# Registro de cambios

Este proyecto usa versiones MAJOR.MINOR.PATCH. Las versiones 0.x todavía son de desarrollo y validación.

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
