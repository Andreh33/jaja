# Suelo visible en Salto Zero · 27/09/2026

Objetivo: corregir el recorte inferior del plataformas en el portátil. Un agente; conservar efectos, lógica y cambios ajenos. Base: 9af2767.

Reproducción en producción, 1600×780: canvas 1490×838.125 dentro de un marco de 1490×634.8125. Se ocultaban 203.3125 px inferiores, incluido el suelo. Captura: output/playwright/arcade-fit-before.png.

| Antes | Después | Motivo |
| --- | --- | --- |
| Canvas dimensionado por anchura y proporción, sin altura explícita | Caja absoluta al 100% de ambos ejes y object-fit: contain | Mantener toda la imagen 16:9 dentro del espacio disponible |
| Altura mínima de 400/360 px | Altura mínima cero | Permitir ventanas bajas y móvil horizontal sin recortar |
| Bandas azul claro | Fondo azul noche | Integrar las bandas necesarias con el marco CRT |

Archivo funcional: src/components/arcade/Arcade.module.css. Sin nuevas dependencias ni cambios de servidor, física, mandos o datos.

Verificado en navegador real contra el servidor local con el CSS final: 1600×780, 1600×900, 1366×650, 1280×600, 1920×1080, 320×568 y 844×390. En todos, canvas dentro del marco, object-fit contain y cero overflow vertical interno. Capturas del portátil y móvil en output/playwright/arcade-fit-*.png. CSS parse y git diff --check correctos; tests/arcade.test.ts: 19/19.

Revisión del diff completo sin defectos adicionales alcanzables. 21st CLI sin sesión; referencia pública https://21st.dev/community/components/OrcDev/8bit-difficulty-select/default consultada, sin copiar ni instalar componentes. Las guías de diseño y QA se aplicaron al encuadre y a la comprobación responsive.

Publicación: seguir el estado Vercel del commit que contiene este documento y comprobar el alias público antes de entregar. Cerrar únicamente el servidor QA 3103 y el navegador arcade-fit; no tocar el servidor 3001 ni el Chrome del usuario.
