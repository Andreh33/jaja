# Recursos de la ampliación arcade

Generados con ImageGen integrado, no con una API/CLI alternativa. Originales PNG conservados en la carpeta de imágenes de esta conversación. Los archivos servidos son conversiones WebP; no se ha simulado una resolución 4K que el original no tenía.

## Especificaciones finales de generación

- `public/arcade/fight-stage.webp`: escenario original para lucha lateral, azotea de ciudad costera al anochecer, iluminación cian y ámbar, hormigón usado y charcos, horizonte detallado, suelo continuo y despejado para dos luchadores, sin personajes ni texto. Original: `exec-24186d20-35b4-4ab8-80b6-40616cf0998b.png`.
- `public/arcade/fight-fighters.webp`: atlas con transparencia real, tres columnas y cuatro filas; dos luchadores originales (Volt en cian y Ember en ámbar), seis poses cada uno: reposo, carrera, salto, puñetazo, patada y bloqueo, todos mirando a la derecha, consistencia de escala y vestuario. Original: `exec-5c67d02f-5d35-4c2f-84fb-741ef7f88273.png`.
- `public/arcade/blocks-textures.webp`: atlas opaco de seis materiales en tres columnas y dos filas: hierba, tierra, piedra, madera, arena y hojas; acabado de videojuego de bloques, detalle legible y sin texto. Original: `exec-32fb7184-e809-40b4-a05f-889a855f3947.png`.
- `public/arcade/blocks-cover.webp`: diorama original de isla de bloques, casa y dos exploradores cian/ámbar construyendo, iluminación cálida y cielo luminoso, composición de carátula sin texto. Original: `exec-c088cbfb-e516-4192-8951-835375acfd2e.png`.
- `public/arcade/instagram-classic.webp`: cámara clásica de Instagram con cuero marrón, cuerpo marfil, lente central, visor y franja arcoíris; ligera pátina de uso, fondo realmente transparente, bordes limpios. Original: `exec-4111cd93-4b4d-41bc-9d55-09e0c921bf1b.png`. Se usa como referencia nostálgica para la invitación a compartir, no como marca propia de Latech.

La petición «logo antiguo» se ha interpretado como el icono clásico de Instagram en esa invitación; el logo de Latech también permanece visible. No hay publicación automática en redes.

## Atlas de Isla libre v2

- Generación integrada ImageGen, imagen nueva (sin imágenes de referencia). Archivo original: `/home/andreh/.codex/generated_images/019f5f64-d8b2-73e2-843e-e571ee54d526/exec-6c5462fd-65ac-4d15-a2df-d2cf9963b1f3.png`.
- Destino: `public/arcade/blocks-atlas-v2.webp`, 1254×1254, 478122 bytes. Conversión de formato mediante Sharp; no se ha ampliado artificialmente ni denominado 4K.
- Prompt final: atlas plano original de materiales voxel, cuadrícula 4×4, dieciséis texturas con detalle pixel-art nítido, luz neutra, sin perspectiva, texto, logos, marcos ni separaciones. Orden: hierba, tierra, piedra, corteza; arena, hojas, ladrillo, tablones; nieve, hielo, carbón, cobre; oro, cristal cian, cuarzo, terracota. Aventura de bloques luminosa, colores naturales vivos, no copiar las texturas de Minecraft.
- Revisado visualmente. Las UV contemplan los límites reales de las filas del atlas y margen interior para evitar sangrado. El mundo, personajes articulados, caras, nubes, sol, vegetación y aves son geometría original de Three.js, no una imagen estática.

## Implementación

Los sprites se recortan y animan en canvas. Las texturas se aplican a geometría voxel generada localmente, con caras internas omitidas y reconstrucción únicamente de los chunks modificados. Las hojas, lluvia, respiración, agua y estrellas son capas ambientales programadas sobre el arte, con variante de movimiento reducido.
