# Qué se mide y qué significa

Las experiencias no permiten prometer tráfico ni ventas. La línea base privada de Search Console sigue pendiente de acceso. Conservar URLs y enlazar contenido útil permite medir el resultado después del despliegue.

- `calculator_start`: primera interacción deliberada con la configuración (no una visita).
- `calculator_step`: primera llegada a cada etapa durante ese recorrido.
- `calculator_complete`: el visitante ha abierto el resumen; no implica contratación ni mensaje enviado.
- `contact_click`: intención de abrir teléfono, correo o WhatsApp. No demuestra que haya enviado un mensaje.
- `commercial_navigation`: clic hacia servicio, calculadora, briefing o contacto, con origen agrupado y destino fijo. Permite separar el recorrido desde Lab de otros orígenes.
- `contact_form_submit`: el formulario se ha guardado correctamente.
- `mystery_finish`: se ha aplicado una corrección y comprobado la tarea dentro de una demo ficticia.

No se incluyen nombre, correo, teléfono, alias, textos, dibujos, consulta del briefing ni contenido del mensaje en estos eventos. `PublicAnalytics` también filtra la URL que el SDK adjunta a eventos y visitas: elimina query y fragmento (incluidos búsqueda y nivel compartido), omite áreas privadas y conserva las rutas públicas de artículos para analizar su rendimiento. Las selecciones del presupuesto se guardan solo en sessionStorage; sus datos personales no se persisten. El almacenamiento opcional de las otras experiencias se explica en cada interfaz.

El briefing distingue documento preparado (`briefing_ready`), copia (`briefing_copy`), apertura de impresión (`briefing_print_open`) y apertura voluntaria de WhatsApp (`briefing_whatsapp_open`). Ninguno se convierte automáticamente en lead. La incorporación de una decisión registra únicamente su identificador editorial fijo.

Tras publicar, comparar páginas y consultas en Search Console, especialmente tráfico sin marca a servicios, artículos y Lab. Separar visitas a juegos de visitas comerciales y comprobar el paso a servicio/contacto. Documentar fecha, dispositivo y conexión en pruebas de rendimiento; no presentar valores de desarrollo local como Core Web Vitals de producción.
