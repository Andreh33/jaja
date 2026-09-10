# Correcciones focales de accesibilidad y enlaces

Fuente: `output/performance/home-mobile.report.json`, build local medido por root el 10 de septiembre de 2026. Se revisaron **los 29 nodos** de `color-contrast`, el fallo de `heading-order` y el enlace de `link-text`. No se abrió navegador ni se ejecutó otro Lighthouse desde este agente.

| Before | After | Why |
| --- | --- | --- |
| Tecnologías con texto blanco al 30%; tres nodos fallan por el mismo componente | Blanco al 60% en `TechMarquee` | Conserva tono y composición, haciendo legibles todas las tecnologías |
| Cabecera y pie de la comparativa con blanco al 40%; dos nodos | Blanco al 60% en `WordPressCompareSection` | Mejora textos pequeños sin alterar animación ni argumentos |
| Etiquetas de Servicios, Precios, Proceso, Zona de juego, Testimonios y FAQ al 40%; seis nodos | Blanco al 60% | Conserva su jerarquía secundaria con contraste suficiente |
| Etiqueta de respuesta y caption de precios al 40%; dos nodos | Blanco al 60% en `AnswerBox` y `ComparisonTable` | La explicación y los impuestos deben poder leerse |
| Dos etiquetas de demo y explicación del juego al 35%; tres nodos | Blanco al 60% en `PlaygroundSection` | Mejora la orientación sin tocar carga o motores |
| Etiqueta local, diez enlaces geográficos/cobertura y dos líneas finales al 40–45%; trece nodos | Blanco al 60% en los contenedores correspondientes del Footer | Evita depender de hover para leer enlaces y notas |
| Footer empieza sus grupos con H4 | Los cuatro grupos usan H2 con las mismas clases visuales | Elimina el salto de jerarquía manteniendo la composición |
| Enlace `/tienda` rotulado «Empezar» | «Ver servicios», nombre accesible «Ver servicios y precios» | Describe el destino con un texto breve |

La revisión se limita a los elementos demostrados por el informe y a los grupos que comparten exactamente su regla. No modifica los colores de marca, engines, lógica de los juegos, estilos globales o configuración de Next.js.

Se calculó la luminancia relativa sRGB para blanco al 60% compuesto sobre cada fondo que Lighthouse registró. Los 29 resultados superan 4,5:1; el mínimo calculado es **7,27:1**. Detalle completo en `output/performance/home-contrast-correction-calculation.json`. Este cálculo no sustituye el nuevo Lighthouse sobre el build que compile los cambios.

Validación: lint focal de los doce componentes afectados y `git diff --check`. El coordinador repite la auditoría y revisión visual tras integrar las mejoras de rendimiento que realiza en paralelo.
