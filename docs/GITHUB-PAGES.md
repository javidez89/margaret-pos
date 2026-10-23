# Demo público para revisión

URL: **https://javidez89.github.io/margaret-pos/**

GitHub Pages publica el demo estático desde `main`. No requiere descargar el repositorio ni abrir un archivo local. Las cuentas de demostración y su alcance están en el README. La página identifica **DEMO · PRUEBAS** y conserva la identidad corporativa.

Los datos ficticios y los cambios se almacenan en cada navegador. Abrir el enlace en otro dispositivo no comparte las ventas ni los usuarios creados; tampoco traslada las operaciones del archivo local. Usa los respaldos de prueba para trasladar escenarios cuando lo necesites. Este sitio sirve para revisar el funcionamiento y no habilita la producción operativa descrita en la arquitectura.

## Publicación y verificación

El flujo `Publicar demo en GitHub Pages` se ejecuta al integrar cambios en `main`, o manualmente desde esa rama. Antes de publicar, ejecuta las pruebas y comprueba que el HTML generado coincide con la fuente. El trabajo de publicación depende de esas verificaciones.

Solo se distribuyen `index.html` y `deployment.json`. El segundo identifica versión, commit y SHA-256 del HTML publicado. El ambiente `github-pages` admite la rama `main`; los permisos para publicar se limitan al trabajo de despliegue. Las acciones oficiales se fijan por commit. Los archivos `.env`, respaldos operativos y certificados no forman parte del paquete web.

La preparación local se puede revisar con:

```sh
npm run build:pages
```

El resultado se genera en `.build/pages/`, excluido de Git. Para revertir el sitio, revierte el cambio mediante una solicitud de cambio a `main` siguiendo el flujo de desarrollo. GitHub volverá a validar y publicar el commit resultante; no se reescriben etiquetas de versiones.
