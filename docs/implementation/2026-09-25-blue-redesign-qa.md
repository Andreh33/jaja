# Latech Blue — integración y verificación

## Alcance

Rediseño público oscuro azul noche, azul eléctrico, hielo y blanco. Home editorial con objeto orbital, portfolio de proyectos reales, parallax y escena de scroll sobre desarrollo a medida frente a WordPress. Navegación accesible, laboratorio con pestañas, CTA y precio de creación web de 800 €.

Integrado sobre `acd8fce`, conservando la calculadora de cinco pasos por WhatsApp, briefing, laboratorio completo, motores modulares, editorial y correcciones de sesión. Sin migraciones, seed de datos, cobros, correos reales ni cambios de catálogo remoto de Stripe.

## Decisiones

- Next.js 16.3.6, React 19.3.0, Motion 13.4.4 y Node 24.
- ESLint 9.39.5 y TypeScript 5.9.3: versiones compatibles con los plugins actuales. ESLint 10 provocaba un fallo de API en el plugin React; no se fuerza una actualización incompatible.
- Precio base de 800 € en el catálogo de presupuestos, marketing y API de Checkout heredada. Se conserva la política «IVA no incluido» del presupuesto actual.
- Checkout heredado usa Price inline para las dos variantes de creación web, sin cambiar precios históricos ni suscripciones existentes. Webhooks admiten el nuevo identificador de catálogo y mantienen fallback por Price ID.
- Se conserva la contención de recuperación del remoto: forgot devuelve 503 y reset 410. La recuperación automática no se anuncia como disponible; no se ha configurado ni probado un proveedor de correo.
- 21st.dev: CLI sin sesión; se consultó el catálogo público como referencia, sin instalar componentes ni copiar código. Se respetó el stack existente.
- Motion conserva scroll nativo y una alternativa reduced-motion. Se utilizan proyectos e imágenes existentes, sin métricas inventadas.

## Verificación del árbol integrado

- `npm test`: suite final de 166 pruebas, 166 aprobadas, 0 fallos.
- `npm run lint`: aprobado, sin errores ni avisos.
- `npm audit --omit=dev`: 0 vulnerabilidades conocidas.
- `git diff --check` y diff staged: sin errores.
- Revisión independiente: corregidos precios antiguos en las landings web/tienda y sus FAQ, recuperada carga del runner solo cerca del viewport y preservada la partida al cambiar de pestaña o abrir otra experiencia. Test local SEO ampliado: 6/6 pasan.
- `npm run build`: dos compilaciones aprobadas con TypeScript y 192 páginas. Después se ajustaron únicamente los tokens ámbar heredados de la calculadora a azul hielo y sus estados hover/active; CSS comprobado visualmente y pendiente de la compilación del despliegue.
- Navegador sobre el build integrado: home de 1440 px y móvil 390/320 px sin desbordamiento horizontal; menú abre/cierra con teclado; reduced-motion elimina el transform de la escena WordPress.
- Runner: carga diferida, salto, pausa, reanudación y puntuación conservada tras cambiar de pestaña (15 m antes y después). Lienzo: trazo, deshacer, rehacer, descarga PNG y conservación entre pestañas. Escape: jugar, pausar, Escape para cerrar y foco devuelto al disparador; endpoints de ranking interceptados sin escribir en producción.
- Calculadora: cinco pasos hasta revisión, 800 € iniciales + 60 €/mes = 860 € el primer mes, IVA no incluido; URL WhatsApp comprobada sin enviar. Sin overflow a 320 px.
- Laboratorio: Trazo genera un nivel desde Olas y permite jugar/pausar/reanudar; índice de los tres misterios renderiza correctamente. Los modelos de juego tienen cobertura unitaria en la suite final.
- Diez rutas principales responden 200, incluidas home, calculadora, proyectos, equipo, laboratorio, briefing y landings locales.
- Sin excepciones de JavaScript en los recorridos probados. El 404 de `/_vercel/insights/script.js` corresponde al servidor local fuera de Vercel; no se contabiliza como un fallo de la aplicación. Se observaron avisos de preloads de CSS, sin fallo funcional.
- Evidencia visual local: `output/playwright/blue-integrated-*.png` (no se publica en el repositorio).

## Límites

La revisión no sustituye una prueba de cobro real ni verifica cuentas privadas de clientes. No se envían formularios comerciales ni se escriben rankings durante QA. El árbol original con cambios de finales de línea ajenos se conserva separado del worktree de integración.

Los posts históricos y el paquete editorial aprobado en `docs/editorial/` conservan precios anteriores y quedan pendientes de una revisión/publicación separada. Las fuentes históricas de `scripts/posts-data/` son una baseline protegida por hash para publicar con seguridad: se conservan intactas, sin desactivar su guarda. Un cambio de precio en los artículos debe hacerse mediante un paquete nuevo revisado (primer año 1.520 €, tres años 2.960 € para web + 60 €/mes), no reescribiendo esa baseline. No se ha modificado la base de datos ni se ejecuta un seed o una publicación editorial en este deploy.
