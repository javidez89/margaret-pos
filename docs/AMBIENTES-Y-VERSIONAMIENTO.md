# Ambientes y versionamiento

La decisión vigente es [GitHub Pages + Supabase](ARQUITECTURA-VIGENTE.md), con pruebas locales. El [gobierno de desarrollo](GOBIERNO-DESARROLLO.md) define controles y aprobación.

- Local: http://127.0.0.1:4173, datos sintéticos y backend Supabase local futuro.
- GitHub Actions: pruebas automáticas efímeras, sin publicar develop.
- Producción objetivo: https://javidez89.github.io/margaret-pos/, backend Supabase futuro. La URL aún sirve el demo.

`environments/local.json` controla el servidor loopback. `environments/sites.json` declara QA local y la única URL publicada. `environments/production.json` identifica Pages/Supabase, deja proyecto y dominio opcional sin inventar y conserva el bloqueo operativo.

No se exige dominio propio ni alojamiento adicional. Cuando el usuario indique dominio, actualizar Pages/DNS/HTTPS y las rutas, CORS y redirecciones de Auth. No mezclar claves, usuarios o datos de la futura base de producción con pruebas locales.

## Rama y versión

Rama de trabajo desde develop → PR a develop → QA/CI → PR develop a main → publicación manual aprobada. Main no recibe trabajo directo. Los tres controles obligatorios son validate, security y qa-browser. La promoción acredita el commit y árbol exactos mediante CI de develop, sin URL pública de QA.

Usar MAJOR.MINOR.PATCH, actualizar CHANGELOG y package-lock junto a package.json al cambiar código/configuración/automatización. No sobrescribir tags. El HTML autónomo se genera desde `src/index.template.html` y los archivos de marca.

```sh
npm ci --ignore-scripts
npm test
npm run check:security
npm run dev
```

`npm run check:production` sigue fallando de forma intencional hasta completar la infraestructura operativa. Su modo `--report` muestra pendientes sin habilitarla.

La retirada de `/pruebas/` del artefacto sucede con la siguiente publicación autorizada; actualizar el código no elimina de inmediato la copia ya servida. La reversión se hace con nuevo commit/PR y aprobación, sin cambiar etiquetas ni restaurar automáticamente operaciones.

Los JSON de estado GitHub conservan evidencias históricas; no asumir que cada uno describe el flujo actual. El README y la arquitectura vigente son el punto de entrada.
