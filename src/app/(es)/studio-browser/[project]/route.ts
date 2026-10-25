import { studioBrowserProject, studioProjectSlugs } from '@/components/home/studio-browser-model';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

export async function GET(_request: Request, { params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const index = studioProjectSlugs.findIndex(value => value === slug);
  if (index === -1) return new Response('Proyecto no disponible', { status: 404 });
  const { project, origin, embeddable } = studioBrowserProject(index);
  if (!embeddable) return new Response('Este proyecto no permite vista integrada', { status: 403 });

  // This is a document shell, not a proxy. The real site keeps its own origin,
  // headers and cookies. Only its exact origin can navigate this child frame.
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(project.name)} · Studio</title><link rel="stylesheet" href="/studio-browser-frame.css"><script src="/studio-browser-frame.js" defer></script></head><body><iframe id="project" src="${escapeHtml(project.url)}" title="Navegar por ${escapeHtml(project.name)}" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="strict-origin-when-cross-origin"></iframe><aside id="boundary" role="status" hidden><strong>Este enlace sale del proyecto.</strong><p>La navegación de Studio se queda en ${escapeHtml(new URL(project.url).hostname)}.</p><button id="return" type="button">Volver al inicio del proyecto</button></aside></body></html>`;
  return new Response(html, { headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': `default-src 'none'; script-src 'self'; style-src 'self'; frame-src ${origin}; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; object-src 'none'`,
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'public, max-age=300',
  } });
}
