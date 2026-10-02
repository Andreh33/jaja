# Contratación por WhatsApp y continuidad visual pública

Se sustituyen los precios públicos y la calculadora por un formulario compartido con dos opciones: página web o tienda online. Nombre, negocio opcional e idea se incluyen en un enlace de WhatsApp; el visitante revisa y confirma el envío allí. El formulario no crea cuentas, pedidos ni contactos en base de datos. La política de privacidad describe este recorrido.

## Comportamiento

- El mismo formulario aparece en inicio, contacto, servicios, página web y tienda online, con la selección correspondiente en cada servicio.
- La antigua ruta `/tienda/calculadora` devuelve una redirección permanente a `/contacto#proyecto` y deja de figurar en el sitemap.
- Las rutas que iniciaban checkout, checkout SEO y portal de facturación devuelven 410 sin importar Stripe ni acceder a datos. No se cancelan suscripciones ni se modifica el historial de clientes. Se conservan los manejadores históricos de eventos y utilidades sin acceso público de contratación.
- Se retiran importes de contratación de páginas comerciales, páginas locales, metadatos, datos estructurados y dos imágenes sociales estáticas. Los artículos históricos no se reescriben en la base de datos.
- Las páginas interiores públicas usan la misma base azul, bordes, superficies y foco que la portada. La identidad de proyectos mostrados y colores de estados conservan su significado.

## Referencia y criterios

Aplicadas web-design-director, emil-design-eng, agency-web-qa-deploy, review-code-high-signal y playwright. Se consultó el catálogo público de 21st.dev (choicebox de shugar) como referencia de selección; no se incorporó código ni dependencias. Se mantuvo el stack del proyecto y la validación nativa accesible.

## Verificación

ESLint de src, configuración y tests afectados: correcto. TypeScript: correcto. Suite completa en serie: 297 pruebas, cero fallos. git diff --check: correcto. El build local de webpack se detuvo deliberadamente al aumentar la presión de memoria del equipo; la compilación final se comprobará en Vercel. Pendientes la validación visual del preview y la publicación final.
