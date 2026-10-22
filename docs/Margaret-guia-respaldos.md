# Descargar, comprobar y recuperar un respaldo

## Descargar

1. Ingresa como administrador o gerente y abre **Respaldos**.
2. Pulsa **Descargar respaldo completo · JSON**. La plataforma verifica las secciones y los comprobantes antes de solicitar la descarga.
3. Conserva el archivo en una carpeta segura fuera del navegador. Guarda también el HTML de Margaret.

El respaldo contiene inventario, usuarios y contraseñas del demo, permisos, ventas, compras, gastos, turnos, devoluciones, nómina, comprobantes, códigos Hash y configuración. Es un archivo con datos privados.

## Comprobar el archivo descargado

1. Pulsa **Cargar / restaurar respaldo** y selecciona el JSON guardado.
2. Espera el mensaje **Archivo completo y verificado**.
3. Revisa las cantidades de productos, ventas y demás secciones.

Seleccionar el archivo solo lo comprueba. Puedes cerrar esta ventana sin cambiar ningún dato.

## Restaurar después de una falla

1. Carga el respaldo y revisa su resumen.
2. Si todavía tienes datos actuales que quieras conservar, pulsa **Descargar copia actual antes de restaurar** y comprueba que se haya guardado.
3. Marca la confirmación de reemplazo y pulsa **Restaurar respaldo completo**.
4. Espera la verificación final y vuelve a ingresar con una cuenta incluida en el respaldo.

La restauración reemplaza los datos actuales por los de la copia; no suma ni duplica registros. Las operaciones realizadas después de la fecha del respaldo no estarán en esa copia.

Si no puedes ingresar, en la pantalla inicial pulsa **Recuperar plataforma desde un respaldo**. Selecciona el archivo y usa las credenciales de un administrador o gerente que exista en ese respaldo.

Si el archivo está cortado, le falta una sección o tiene comprobantes alterados, la plataforma lo rechaza antes de reemplazar los datos. Si falla el guardado, se intenta recuperar el estado anterior y se muestra un mensaje con el resultado.

## Resultado de la validación

Pasaron **29 verificaciones automáticas** con datos ficticios: 1.349 productos, 452 ventas, 1.427 compras, 7 usuarios, 49 gastos, 56 turnos cerrados, una devolución y un pago de nómina. Se conservaron los 454 comprobantes y sus códigos Hash, las credenciales y las configuraciones. La comparación completa de datos coincidió antes y después de restaurar, y al volver a abrir la aplicación en la prueba.

También se comprobaron archivos incompletos, integridad incorrecta, permisos insuficientes, restauraciones simultáneas y fallos de escritura o lectura. Estas pruebas no modificaron los datos del navegador del usuario. Puedes comprobar tu descarga real con el procedimiento anterior, sin restaurarla.
