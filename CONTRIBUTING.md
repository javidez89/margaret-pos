# Desarrollo

1. Usa Node.js 24 y trabaja sobre una rama desde `main`.
2. Modifica `src/index.template.html` y conserva los datos ficticios del escenario de pruebas.
3. Ejecuta `npm run build` y `npm test`.
4. Revisa el cambio generado en `demo/index.html` y actualiza la documentación cuando cambie el flujo.
5. Verifica que no haya respaldos, credenciales o datos reales en los archivos preparados para el commit.
6. Envía los cambios mediante una solicitud de revisión. El flujo automático valida la compilación y las pruebas.

Las guías en `docs/` mantienen evidencia histórica de las pruebas del demo. Los resultados de una ejecución nueva se guardan en `.artifacts/test-results/` y no deben reemplazarse sin revisar la documentación.
