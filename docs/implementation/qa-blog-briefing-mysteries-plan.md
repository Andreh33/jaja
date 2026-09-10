# QA de producción local: blog, briefing, Misterios y editor

Preparado el 10 de septiembre de 2026. **Pendiente de ejecución** hasta que root confirme build, servidor y memoria. Usar una sola sesión Playwright propia; no abrir antes. No producción, envíos a WhatsApp, correos ni datos de clientes. Las credenciales locales se leen por código y nunca se imprimen en comandos, capturas o informes.

## Blog público

- HTML por HTTP sin ejecución de JavaScript: comprobar listado y doce artículos, enlaces de categorías/páginas, canonical, robots de búsqueda y contenido de artículo.
- Comparar búsquedas `diseño` y `diseno`, término inexistente y combinación de términos. Cambiar categoría, comprobar query conservada, limpiar búsqueda, retroceder y avanzar.
- Navegar a página 2 desde el listado; comprobar títulos distintos, página actual, regreso y URL. Página fuera de rango: 404.
- A 390 px y escritorio: entrada completa del listado bajo la cabecera, controles alcanzables, tarjetas sin desbordamiento y foco de teclado visible.
- Abrir un artículo real, activar índice H2/H3 y comprobar destino visible bajo cabecera. Tabla ancha y bloque de código deben desplazarse dentro del artículo, sin aumentar el ancho de la página. Si no hay ejemplos públicos adecuados, comprobarlos en la vista previa privada con texto de QA.

## Briefing a 390 px

- Completar proyecto, objetivo de prueba sin datos personales, funciones, integración, materiales, responsable y calendario; revisar que el documento refleja decisiones y pendientes.
- Verificar que no guarda antes de activar la opción. Activar, recargar, comprobar recuperación y campos; desactivar, confirmar eliminación de copia sin perder la edición abierta.
- Probar cambio de proyecto: conserva texto/materiales y retira funciones incompatibles. Una entrada de artículo no modifica respuestas hasta `Incorporar esta decisión`.
- Segunda pestaña en la misma sesión: un cambio guardado ofrece cargar la otra copia, conserva respuestas abiertas y no sobrescribe automáticamente. Cerrar pestaña al terminar.
- Forzar fallo de portapapeles y usar `Copiar texto`: aparece textarea seleccionable y su contenido coincide con el documento. Inspeccionar el href de WhatsApp y su mensaje decodificado; **no abrir enlace ni enviar**.
- Revisar y cancelar reinicio, después confirmar: formulario y copia quedan vacíos. Si el almacenamiento está bloqueado, la edición sigue disponible y el aviso no afirma guardado.
- Generar PDF mediante estilos de impresión, extraer texto y renderizar páginas con Poppler. Inspeccionar PNG: solo documento, encabezados y secciones legibles, sin controles, solapamientos, recortes ni páginas vacías. Artefactos bajo `output/pdf` y temporales `tmp/pdfs`.

## Tres Misterios

- Reserva: reproducir promoción que tapa confirmación, probar opción incorrecta y pista, aplicar corrección, cambiar servicio/hora y confirmar demo. Debe decir explícitamente que no existe cita real.
- Carrito: observar 34 € y aparición tardía de 6 €; aplicar corrección, comprobar 40 € desglosados antes de confirmar pedido simulado.
- Buscador: `cafe` falla antes; corregir y comprobar mayúsculas, tildes y espacios, resultado seleccionable y final.
- En cada caso: repetir restaura el problema, cambiar episodio no reutiliza estado, recargar y volver al listado muestran progreso completado; sin almacenamiento sigue siendo jugable.
- Comprobar enlaces de aprendizaje y artículo relacionado; las explicaciones siguen en HTML sin JavaScript. Capturar un estado inicial, uno corregido y el listado con progreso.

## Editor privado local

- Iniciar sesión ADMIN local sin registrar credenciales. Crear exclusivamente pieza de QA identificable, con título acentuado y cuerpo que incluya H2/H3, tabla ancha, código, imagen local y HTML que se debe mostrar como texto.
- Comprobar slug automático, edición manual antes de guardar y colisión con un slug existente sin pérdida de texto. Vista previa privada mantiene el formulario y usa el mismo parser.
- Guardar borrador, recargar editor, comprobar URL fija y contenido. HTTP público del borrador y su OG deben seguir sin acceso.
- Publicar solo la pieza local de QA, revisar artículo, índice y tabla en móvil; volver a guardar, retirar a borrador y comprobar retirada pública. Limpiar únicamente la pieza de QA al terminar.
- Registrar errores visibles y estado de guardado. HTTP de autenticación y publicación ya pasó bajo coordinación de root; la validación UI complementa esa evidencia.

## Informe esperado

Por recorrido: resultado, URL, versión de servidor, ancho y captura cuando aporte evidencia. Separar fallos reproducibles de limitaciones o casos no ejecutados. No declarar éxito de envío, resultado SEO, producción o compatibilidad que no se haya observado.
