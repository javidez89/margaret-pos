# Desarrollo

1. Usa Node.js 24 y crea una rama `feature/...` o `fix/...` desde `develop` actualizado.
2. Modifica `src/index.template.html` y conserva los datos ficticios del escenario de pruebas.
3. Ejecuta `npm run build` y `npm test`.
4. Revisa el cambio generado en `demo/index.html` y actualiza la documentación cuando cambie el flujo.
5. Verifica que no haya respaldos, credenciales o datos reales en los archivos preparados para el commit.
6. Envía una solicitud de revisión a `develop`. El flujo automático valida compilación, versión, separación de ambientes y pruebas.
7. Promueve versiones revisadas de `develop` a `main` mediante otra solicitud de cambio. Actualiza versión y CHANGELOG, vuelve a compilar y prepara un borrador desde el flujo manual de GitHub.

Lee [el gobierno del desarrollo](docs/GOBIERNO-DESARROLLO.md) y [AGENTS.md](AGENTS.md). Main y develop exigen PR y los controles validate, security y qa-browser. Publicar pruebas no modifica la versión estable; esta última requiere aprobación manual. No sobrescribas etiquetas existentes.

Las guías en `docs/` mantienen evidencia histórica de las pruebas del demo. Los resultados de una ejecución nueva se guardan en `.artifacts/test-results/` y no deben reemplazarse sin revisar la documentación.
