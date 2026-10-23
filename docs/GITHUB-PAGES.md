# GitHub Pages: interfaz de producción objetivo

URL elegida por el usuario: **https://javidez89.github.io/margaret-pos/**. El dominio propio se configurará después. Hoy se sirve el demo; el backend real Supabase está pendiente.

La interfaz estática se publicará desde main. Supabase alojará autenticación, base, documentos y funciones de negocio; no se despliega NestJS ni otro servidor en Pages. Consultar la [arquitectura vigente](ARQUITECTURA-VIGENTE.md), incluidos los límites de uso del proveedor.

## Pruebas y publicación

Pruebas funcionales en http://127.0.0.1:4173 y pruebas automáticas en GitHub Actions; no habrá una segunda URL pública. `/pruebas/` es una vista anterior y dejará de incluirse en el siguiente despliegue aprobado. No se modifica ni elimina almacenamiento del navegador.

La publicación es manual con **Promover versión estable**, desde main y con versión exacta. La preparación compila y comprueba negocio, seguridad y navegador; acredita QA del árbol exacto validado en develop. Después requiere aprobación `production`, revalida esa evidencia y publica únicamente el candidato preparado.

El paquete contiene HTML, metadata y manifiesto con SHA-256/commit/versión/evidencia QA. No contiene backups reales, certificados ni secretos Supabase. Las acciones están fijadas por SHA y el trabajo de publicación conserva permisos mínimos y protección del ambiente.

`npm run build:pages` prepara un candidato de producción solo cuando ese contenido ya tenga CI correcto de develop; no es un servidor local de prueba. Para revisión local usar `npm run dev`.

El publicador admite actualmente la URL GitHub indicada. Cambiar a dominio propio requerirá actualizar su URL base, DNS/Pages/HTTPS y configuración Auth/CORS; no crear un CNAME hasta conocer el dominio. Una sustitución de dominio no modifica las condiciones de uso de Pages.

Para revertir: nuevo commit y PR, validación y aprobación manual. Revertir código no recupera operaciones en Supabase ni datos guardados en navegadores.
