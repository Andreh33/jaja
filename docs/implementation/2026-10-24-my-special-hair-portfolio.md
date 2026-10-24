# MySpecialHair en el portfolio

- Petición del propietario: añadir MySpecialHair a los proyectos de Latech.
- Destino verificado: https://myspecialhair.com/ (HTTP 200, 24/10/2026).
- Ficha añadida a la fuente compartida `src/lib/projects.ts`, manteniendo las doce existentes.
- Imagen: captura real de la portada pública del 24/10, sin aviso de instalación,
  optimizada a WebP de 1600 píxeles de ancho (35 KB). Sin imágenes generadas.
- La descripción recoge catálogo, cuenta, citas, medidas, estudio 3D y asesoramiento
  visibles en la web. La ubicación identifica expresamente el centro colaborador.
- `X-Frame-Options: SAMEORIGIN`: se conserva en el portfolio, pero se excluye de
  los canales TV que embeben páginas. No se cambia la protección del sitio.
- Verificación previa: cuatro pruebas existentes del catálogo, ESLint dirigido,
  TypeScript y `git diff --check` aprobados. Confirmar despliegue y ficha publicada
  antes de comunicar que está disponible en producción.
