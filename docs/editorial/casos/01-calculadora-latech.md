---
tipo: caso_propio
estado: borrador_local_no_publicado
slug_propuesto: caso-latech-calculadora-presupuesto-whatsapp
titulo: Caso propio: de nueve pasos a un presupuesto revisable por WhatsApp
descripcion: Cómo reformamos la calculadora de Latech: cinco etapas, importes separados, datos opcionales y apertura de WhatsApp sin registro ni cobro en el recorrido.
categoria: Diseño Web
---

Nota editorial: caso de nuestro propio producto, sin clientes externos ni atribución de conversiones. Evidencia anterior: `git show HEAD:src/app/tienda/calculadora/_lib/state.ts` confirma nueve pasos, password/acceptTerms; `Steps.tsx` confirma salida al checkout. Evidencia nueva: carpeta calculadora, `src/lib/quotes/catalog.ts`, `tests/quote-calculator.test.ts` (12 pruebas propias pasaron; comprobación anterior a ajustes Analytics del coordinador). Activar el texto público después de QA final y despliegue de la misma versión. No afirmar que ya aumentó contactos.

<!-- CUERPO -->
# Caso propio: de nueve pasos a un presupuesto revisable por WhatsApp

La calculadora de Latech necesitaba responder mejor a una pregunta comercial sencilla: «¿Qué costaría una configuración como la que necesito?». El recorrido anterior tenía nueve pasos e incluía datos para una cuenta y una salida al pago. En esta reforma hemos separado la preparación del presupuesto de una contratación.

Este es un caso de nuestro propio sitio. Describe cambios de producto y las pruebas realizadas sobre ellos; no presenta resultados de tráfico, ventas ni trabajo atribuido a un cliente.

## El problema que decidimos resolver

La intención del nuevo recorrido es preparar una conversación con suficiente contexto. Para eso hacen falta las elecciones del proyecto, un desglose comprensible y una forma de revisarlo. Pedir una contraseña no aporta información para definir ese presupuesto.

También necesitábamos un contrato claro para los importes de la oferta pública. La referencia acordada es 600 € de creación y 60 €/mes de hosting y mantenimiento web, o 80 €/mes con tienda, IVA no incluido. Los extras tienen sus propias partidas y el alcance sigue pendiente de confirmación.

## Qué cambió en la experiencia

La calculadora se organiza en cinco etapas: proyecto, servicios, contenido, contexto y revisión. Puedes modificar elecciones anteriores y ver cómo afectan al presupuesto. Los datos de contexto son opcionales y el recorrido no solicita una contraseña ni termina en un cobro.

El resumen distingue pagos puntuales, mensualidad y creación más primera mensualidad. Así, para una web base sin extras, las cifras son 600 €, 60 €/mes y 660 € respectivamente, antes de IVA. Mostrar las tres evita que el visitante confunda una cuota con el coste inicial.

El número de páginas también sirve para señalar una revisión de alcance. Marcar un proyecto mayor no genera una tarifa ficticia para una necesidad que todavía no hemos definido.

## El mensaje conserva las decisiones

En la última etapa puedes revisar las opciones, copiar el texto o abrir WhatsApp. El mensaje preparado incluye las selecciones, las partidas y el carácter orientativo del presupuesto. La interfaz explica que abrirlo no equivale a enviarlo ni a contratar.

Si el navegador no permite copiar directamente, aparece una alternativa para seleccionar el texto. No queremos que un fallo del portapapeles obligue a repetir el presupuesto o impida conservarlo.

## Qué guardamos para continuar

La calculadora conserva las selecciones en la pestaña. Los datos de contacto no forman parte de esa copia. El formato de guardado tiene una versión y valida los campos permitidos, en lugar de confiar en cualquier contenido almacenado.

La revisión también elimina el formato anterior que incluía campos de cuenta. Es una decisión de continuidad: permitir recuperar elecciones útiles sin arrastrar datos que el nuevo recorrido ya no necesita.

## Cómo comprobamos el cambio

Las pruebas del módulo recorren combinaciones de extras, valores extremos e inválidos, navegación, reinicio y composición del mensaje. También comprueban que los datos de contacto y las contraseñas no se guardan en el nuevo formato, y que un almacenamiento bloqueado no impide calcular.

Estas pruebas verifican reglas y límites del código. La comprobación visual de móvil, teclado y diálogos forma parte de la revisión de entrega y debe documentarse con la versión probada. Ninguna prueba unitaria sustituye esa observación.

## Qué mediremos después

El siguiente análisis deberá distinguir presupuesto revisado, apertura de WhatsApp, solicitud recibida y contacto cualificado. Son pasos diferentes. Sin datos comparables del uso real, no sería correcto atribuir un aumento de ventas a la reforma.

Puedes explorar la [calculadora](/tienda/calculadora) y preparar primero las necesidades de tu proyecto en el [briefing](/briefing). El resultado que perseguimos es una conversación más concreta: qué necesitas, qué está contemplado y qué queda por confirmar.

<!-- FIN_CUERPO -->
