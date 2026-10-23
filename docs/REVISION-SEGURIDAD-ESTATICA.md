# Revisión inicial de CodeQL

Fecha: 23 de octubre de 2026. Análisis de develop: https://github.com/javidez89/margaret-pos/actions/runs/39990686177

La ejecución completada no equivale a ausencia de hallazgos. Se revisaron los siete avisos iniciales antes de la promoción a main.

| Hallazgo | Evaluación y tratamiento |
| --- | --- |
| js/bad-tag-filter, alerta 1 | La expresión extraía JavaScript de una plantilla controlada; no sanitizaba entradas de usuario. Se sustituyó por extracción mediante delimitadores literales y se conservó la validación sintáctica. |
| js/http-to-file-access, alertas 4, 5, 6 y 7 | Transferencia intencional del HTML y metadatos públicos ya publicados al paquete de GitHub Pages. El destino está fijado dentro de .build; el otro ambiente se verifica por SHA-256 y se conserva. No se ejecuta el HTML descargado en el proceso Node. Se documenta como comportamiento esperado, no se desactiva la consulta global. |
| js/file-access-to-http, alertas 2 y 3 | Lectura de configuración pública y metadatos de publicación para formar consultas GET del mismo sitio o de ramas/ejecuciones del propio repositorio. No se envían respaldos, contenido de .env ni archivos operativos. Se limita el sitio a su URL HTTPS exacta, se rechazan redirecciones y se restringen las rutas API permitidas. El token se envía únicamente a api.github.com. |

Los avisos de transferencia esperada se clasifican individualmente después de esta revisión. Una descarga web futura distinta, cambio de dominio, nuevo destino de archivos o nuevo envío de contenido debe revisarse de nuevo; no existe una exclusión general de los scripts ni de esas reglas. SHA-256 comprueba integridad del paquete, no sustituye autenticación de usuarios ni la confianza en el origen HTTPS.

La suite incluye rechazo de rutas API ajenas, datos de paquete alterados y promociones sin la ejecución correcta de QA. Estos controles complementan las reglas de secretos, npm audit, la revisión del PR y las protecciones de GitHub; no constituyen certificación de seguridad de una plataforma operativa.
