---
tipo: caso_propio
estado: borrador_local_no_publicado
slug_propuesto: caso-latech-lab-juegos-herramientas-propias
titulo: Caso propio: organizar Latech Lab para jugar, aprender y volver
descripcion: Cómo conectamos juegos, un trazo compartible y tres misterios ficticios con contenido y briefing. Decisiones verificables de una reforma propia.
categoria: Diseño Web
---

Nota editorial: caso interno de Latech, sin resultados de clientes. Evidencia: `/lab`, catálogo `experiments.ts`, `trace-game`, `lab-mysteries`, `game-session`, pruebas de estos módulos y `docs/implementation/games-qa.md`. El estado de QA y publicación se comprueba antes de publicar este caso; no trasladar sin revisar cifras de un checkpoint previo. No prometer backlinks, viralidad o rendimiento que no se haya medido.

<!-- CUERPO -->
# Caso propio: organizar Latech Lab para jugar, aprender y volver

Latech ya tenía juegos y elementos interactivos dentro de su web. La reforma plantea cómo darles un recorrido propio: una entrada reconocible, páginas que expliquen qué se puede hacer y una salida útil hacia contenido o preparación de un proyecto.

El resultado es [Latech Lab](/lab), una parte del sitio para jugar, crear y explorar. Este caso documenta decisiones sobre nuestra propia web. No atribuye las experiencias a clientes ni presenta un crecimiento de visitas todavía sin medir.

## Una entrada para experiencias distintas

Escape, Runner, el lienzo, el capó y Rayos X tienen funciones diferentes. El catálogo del Lab explica sus controles y qué sucede con los datos de cada experiencia. No queríamos que una persona tuviera que deducir si una acción descarga, guarda localmente o publica algo.

La navegación permite volver al Lab y continuar hacia otra experiencia. Los textos y enlaces forman parte de las páginas, no quedan escondidos dentro de un canvas.

## Una forma que puede convertirse en juego

En [Tu trazo, un mundo](/lab/trazo), el usuario dibuja un perfil o elige una forma preparada. El generador transforma esa entrada en alturas y plataformas mediante reglas acotadas. El enlace compartido incluye dieciséis alturas y una versión para reconstruir el mismo nivel.

Esta decisión evita necesitar una galería pública o una subida del dibujo para compartir el recorrido. También obliga a reconocer una limitación: la geometría es una interpretación que suaviza desniveles, no una copia exacta de cada trazo.

Las pruebas del generador incluyen formas extremas y verifican recorridos con la física real. Eso permite comprobar que las reglas producen saltos alcanzables en esos casos, sin afirmar que cualquier jugador vaya a completar el nivel a la primera.

## Aprender mediante una corrección observable

Los [tres misterios de negocio](/lab/misterios) se centran en obstáculos concretos: una promoción que tapa la confirmación, un envío que aparece tarde y una búsqueda que distingue «cafe» de «Café».

Cada episodio propone probar, corregir y comprobar. Los negocios son ficticios, las compras y reservas son simuladas y la explicación se puede leer sin terminar el ejercicio. El aprendizaje tiene una salida independiente de la destreza.

El progreso guarda únicamente los identificadores de episodios completados cuando el navegador permite almacenamiento. En la revisión detectamos que escribir ese dato no bastaba: también debía mostrarse al volver. Añadimos la recuperación visible en el listado y en cada caso, manteniendo la posibilidad de repetirlo.

## La pausa y la salida son parte del juego

Una experiencia dentro de una web comparte espacio con navegación, formularios y otros controles. El trabajo sobre las sesiones de juego separa la ejecución de las causas de pausa: cambiar de pestaña, salir de la zona, perder el foco o abrir otra experiencia.

Los menús, el teclado y las salidas necesitan comprobarse junto con la física. También se revisa el movimiento reducido y que una publicación opcional en un ranking sea una decisión explícita. Una puntuación local no es por sí misma una publicación en internet.

## Conectar participación con una tarea útil

El Lab enlaza a guías y a la preparación de un proyecto. El [briefing](/briefing) permite convertir una necesidad observada en requisitos, materiales pendientes y criterios de entrega. No obliga a contactar para terminar un juego.

La hipótesis es que una experiencia útil y reconocible puede ayudar a recordar la marca y comprender el trabajo a medida. Para validarla necesitaremos observar participación, retorno y contactos reales, diferenciando cada paso. Descargar una tarjeta, completar un misterio o abrir WhatsApp no equivale a conseguir un cliente.

El valor comprobable de esta entrega está en las rutas, reglas y controles que se pueden revisar. Su impacto comercial será una pregunta de seguimiento con datos, no una cifra añadida al caso para hacerlo más atractivo.

<!-- FIN_CUERPO -->
