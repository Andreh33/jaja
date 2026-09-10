# Paquete editorial de Latech · 90 días

Preparado localmente el 10 de septiembre de 2026. **14 textos completos: ocho revisiones, cuatro artículos nuevos y dos casos de producto propios.** Ninguno se ha publicado ni importado en producción; la copia local de QA incorpora los textos mediante una opción explícita. Los dos casos pertenecen a Latech: no sustituyen mediante ficción a casos de Zona Sport, Panelex o Toldos Noa.

## Qué contiene

- `actualizaciones/`: reemplazos sustantivos para ocho URLs existentes, con explicación interna del cambio.
- `nuevos/`: cuatro tutoriales diferenciados sobre Trazo, Misterios, Briefing y aceptación de una entrega.
- `casos/`: calculadora y Lab, sustentados en el código y pruebas de esta actualización. Distinguen evidencias técnicas de impacto comercial aún no medido.
- `mapa-urls.csv`: 76 URLs auditadas y conservadas, ocho con revisión preparada; seis nuevas direcciones propuestas y todavía no publicadas.
- `calendario-90-dias.md`: orden de revisión/publicación propuesta y seguimiento, sin automatizaciones creadas.
- `distribucion.md`: dos copys, un guion de vídeo y una ficha visual por pieza. Son textos preparados, no vídeos ni publicaciones ya realizadas.
- `fuentes-y-evidencia.md`: fuentes oficiales consultadas y archivos que sostienen afirmaciones sobre Latech.

## Cómo revisar e importar una pieza

1. Revisar el bloque editorial inicial: señala qué se corrige y las condiciones particulares antes de publicación.
2. Introducir título, resumen, categoría y slug en los campos del editor. En una actualización, conservar la URL existente; no crear otro post con el mismo contenido.
3. Usar únicamente el texto entre `<!-- CUERPO -->` y `<!-- FIN_CUERPO -->`. El título H1 se puede omitir del cuerpo porque ya lo muestra la plantilla. El frontmatter y las notas internas no se publican.
4. Revisar enlaces, tabla, índice, citas y lectura móvil en la vista previa privada. Las rutas nuevas de herramientas requieren que su entrega ya esté disponible.
5. Conservar la fecha de publicación conocida. No colocar «actualizado hoy» ni emitir `dateModified` mientras no exista un registro editorial que respalde esa fecha.
6. Confirmar las condiciones de oferta en la versión pública antes de publicar las piezas de precios. El contrato revisado es 600 € creación, 60 €/mes web, 80 €/mes tienda, IVA no incluido; IA web 150 €/mes y teléfono 200 €/mes como opciones según alcance.

## Qué está preparado y qué sigue pendiente

Los catorce cuerpos, su mapa y los textos de distribución están preparados. Quedan revisión editorial final, comprobación de la versión pública, importación autorizada, publicación y medición. No se han enviado correos, mensajes a colaboradores ni publicaciones sociales.

La auditoría tiene evidencia de 76 artículos, pero no sustituye una revisión factual de todos ellos. Las otras 68 entradas permanecen sin reescritura en este paquete. Los módulos de decisión insertados en seis guías tampoco cuentan como seis actualizaciones sustantivas adicionales.

No hay línea base privada de Search Console, consultas, leads ni ventas validada por este trabajo. No se han inventado volúmenes, objetivos porcentuales ni resultados. La selección de prioridades es provisional según los defectos observados y la utilidad de las piezas; debe afinarse con datos cuando estén disponibles.

Los casos de clientes externos siguen siendo una oportunidad aparte: requieren materiales, autorización y evidencia. Este paquete cumple la ampliación posterior de preparar **dos casos propios verificables**, sin atribuirles métricas comerciales.

## Revisión dentro de la copia de QA

El helper `scripts/lib/editorial-preview.ts` prepara una transformación optativa de los 76 artículos históricos: conserva las ocho URLs actualizadas y añade las seis nuevas propuestas, para un total de 82. No consulta ni escribe una base de datos. Los inicializadores de QA integran esa transformación únicamente con su opción explícita de vista editorial; su comportamiento normal conserva el conjunto histórico.

El lector admite solo las claves editoriales previstas, categorías conocidas, slugs válidos y exactamente ocho actualizaciones, cuatro piezas nuevas y dos casos. Extrae únicamente el cuerpo entre los marcadores, elimina el H1 que ya representa la plantilla y deja fuera las notas internas y metadatos. Rechaza colisiones y paquetes incompletos antes de devolver artículos. Las fechas e identificadores de la copia de QA los gestiona su inicializador; no proceden de estas notas ni representan fechas de publicación reales.

Preparar esa vista de prueba no publica los textos en producción ni autoriza distribuirlos. Seis pruebas focales verifican el contrato y que la colección histórica no se modifica en memoria.
