# Margaret: exportaciones, respaldos y facturación

Revisión: 22 de octubre de 2026, Colombia.

## Cambios disponibles en el demo

- **Inventario → Exportar inventario:** CSV compatible con Excel, con todas las referencias que coinciden con la búsqueda. Conserva códigos con ceros iniciales. Compra, ganancia y valoración solo se incluyen para quienes pueden administrar inventario.
- **Reportes → Exportar reporte:** CSV con resumen, desglose por periodo y resultados por usuario, respetando los filtros actuales. Incluye ventas brutas, reembolsos, ventas netas, costo vendido, ganancia bruta, inversión, gastos y ganancia después de gastos. Las ganancias con costos históricos incompletos quedan vacías y marcadas como incompletas.
- **Movimientos → Exportar movimientos:** CSV con los resultados filtrados, incluyendo fechas, usuario, concepto, detalle, valor y medio/origen. Actividad del equipo se exporta al elegir ese filtro; no se cuenta como otra transacción financiera.
- **Respaldos:** administrador y gerente pueden descargar el conjunto completo de datos en JSON, cargar un archivo y restaurarlo tras revisar su resumen. Incluyen usuarios, permisos, inventario, ventas, devoluciones, turnos, gastos, nómina, comprobantes y registro de códigos Hash. Desde el inicio de sesión también puede recuperarse un respaldo con las credenciales de un administrador o gerente de esa copia.
- **Configuración → Tipo de facturación:** administrador y gerente pueden seleccionar **Factura electrónica** o **Factura POS** y guardar la elección. La configuración completa conserva los datos de preparación. En Nueva venta aparece el tipo elegido con su estado de integración pendiente.

Los archivos CSV sirven para consulta; el JSON completo conserva los datos de la plataforma. El JSON incluye una suma SHA-256 para comprobar integridad, que no certifica por sí sola el origen del archivo. También debe conservarse el HTML de la aplicación.

## Qué significa cada modalidad

| Modalidad | Uso en Margaret |
|---|---|
| Comprobante interno de pruebas | Es el funcionamiento actual. No constituye un documento fiscal. |
| Documento equivalente electrónico POS | Requiere integración fiscal; imprimir un tiquete no completa ese proceso. |
| Factura electrónica de venta | Requiere habilitación y emisión mediante una solución electrónica. |

La normativa compilada establece la sustitución de documentos equivalentes por su versión electrónica o por factura electrónica. El POS electrónico puede expedirse sin límite por valor; para servir como soporte tributario debe cumplir los requisitos e identificar al comprador. La información exigible al comprador comprende nombre o razón social, tipo y número de identificación y correo; este último puede omitirse cuando el comprador elige la representación impresa. Las devoluciones fiscales requieren documentos asociados: nota crédito para factura y nota de ajuste para documento equivalente, según corresponda. Fuentes: [Resolución DIAN 227 de 2025](https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0227_2025.htm), artículos 1.5.1.3.2.1, 1.5.1.3.2.2, 1.5.1.3.2.4, 1.5.1.5.6.1 y 1.5.1.12.3.

La ruta oficial contempla escoger servicio gratuito DIAN, proveedor tecnológico o desarrollo propio; realizar registro y habilitación, disponer del certificado de firma aplicable y gestionar numeración. Para proveedor o desarrollo propio se realiza el conjunto de pruebas de habilitación. Fuentes: [Ser facturador electrónico](https://www.dian.gov.co/impuestos/factura-electronica/como-hacerlo/Paginas/ser-facturador-electronico.aspx), [requerimientos de habilitación](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/requerimientos-para-ser-facturador-electronico/).

## Propuesta para la plataforma definitiva

Preparar POS electrónico con posibilidad de emitir factura, o factura electrónica para todas las ventas. La decisión debe contrastarse con el RUT, las responsabilidades fiscales y la operación del negocio; no puede determinarse únicamente por disponer de impresora POS. La configuración del demo registra una intención y no acredita habilitación.

La implementación real debe agregar identificación del comprador, tratamiento de impuestos por referencia, rangos independientes por documento, generación XML, firma, transmisión, respuesta DIAN, CUFE/CUDE, QR, entrega y seguimiento de rechazos o contingencias. Las devoluciones deben vincularse tanto con la operación comercial como con el documento fiscal correspondiente.

El código Hash de diez caracteres de Margaret seguirá identificando sus comprobantes internos. No debe presentarse como CUFE/CUDE ni como una validación emitida por la DIAN. El demo no transmite información a esa entidad ni contiene credenciales o certificados de emisión.

## Alcance del respaldo diario

El respaldo automático queda activado inicialmente y puede desactivarse en Respaldos. Guarda una copia por fecha de Colombia y la actualiza después de los cambios; conserva las últimas siete fechas con actividad. También comprueba el cambio de fecha mientras la plataforma permanece abierta.

Las copias se guardan separadas de los datos principales del demo en el almacenamiento local del navegador. Pueden fallar por restricciones o falta de espacio; el sistema informa el error y ofrece descarga JSON. No se ejecutan con la pestaña cerrada o el computador apagado. Borrar los datos del navegador puede eliminar tanto los datos como esas copias: la descarga externa es necesaria para conservarlos fuera del equipo/navegador.

La versión definitiva necesitará un servicio que programe respaldos aun sin usuarios conectados y almacenamiento externo. El demo ofrece generación, descarga, verificación y restauración desde archivo. Restaurar reemplaza todos los datos actuales y exige confirmación dentro de la plataforma. Antes de hacerlo puede descargarse una copia del estado actual. La carga verifica la integridad del JSON, sus secciones y comprobantes; después de guardar vuelve a leer los datos para comprobar que coinciden con el respaldo completo. Si falla la escritura o la lectura posterior, intenta revertir al estado anterior e informa el resultado.

## Verificación realizada

Se verificaron sintaxis, exportación de todas las referencias y del inventario filtrado, ocultamiento de costos según permisos, consistencia de los totales y periodos exportados, contenido completo y suma de integridad del JSON, y mensaje alternativo si el navegador no permite guardar respaldos. También se repitieron las pruebas de devoluciones, reintegro, reembolso, doble pago y validez del Hash original.

Se añadieron 29 verificaciones de descarga y restauración con datos ficticios: 1.349 productos, 452 ventas, 1.427 compras, 7 usuarios y 454 comprobantes. El archivo de prueba se escribió y leyó como JSON UTF-8; la restauración coincidió byte por byte, conservó credenciales y siguió intacta al reiniciar la aplicación en la prueba. También se verificaron rechazo de archivos cortados, secciones omitidas, comprobantes alterados, doble restauración, falta de espacio y lectura posterior incompleta. Resultado: [Margaret-validacion-respaldos.json](Margaret-validacion-respaldos.json).

La prueba se ejecutó sobre una copia aislada de datos ficticios, sin modificar los datos del navegador del usuario. La descarga real y la persistencia diaria deben comprobarse en el navegador donde se abrirá el demo. Para verificar el archivo descargado, vuelve a seleccionarlo en «Cargar / restaurar respaldo» y revisa el resumen sin confirmar la restauración.
