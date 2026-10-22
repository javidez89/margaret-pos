# Seguridad

Este repositorio contiene un prototipo local, no un sistema apto para almacenar información real del negocio en producción.

- Los permisos y accesos del demo se ejecutan en el navegador. Los controles reales deben validarse en un servidor central.
- Las claves `1234` y el uso de cédula como contraseña temporal son requisitos de prueba; para producción se requiere acordar una activación segura y retirar cuentas por defecto.
- No versionar respaldos operativos, documentos personales, secretos, certificados ni credenciales. `.gitignore` excluye respaldos y archivos habituales de secretos, pero cada cambio debe revisarse antes de publicarse.
- Para reportar un problema, comunícalo de forma privada al propietario del repositorio. No adjuntes secretos o datos personales a incidencias.
- La emisión DIAN, pagos reales y controles de infraestructura siguen pendientes. El documento de arquitectura explica los requisitos para la transición.
