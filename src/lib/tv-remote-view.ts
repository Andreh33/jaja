/** The handset controls the expanded Studio, never the page behind its modal. */
export function scrollRemoteView(direction: -1 | 1, expanded: boolean) {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  if (!expanded) {
    window.scrollBy({ top: window.innerHeight * .72 * direction, behavior });
    return;
  }
  const studio = document.querySelector<HTMLElement>('[data-live-preview][data-expanded="true"]');
  const target = studio?.querySelector<HTMLElement>('[data-studio-scroll-menu], [data-studio-scroll]:not([inert])');
  if (target) target.scrollBy({ top: target.clientHeight * .72 * direction, behavior });
  else window.dispatchEvent(new Event('latech:project-scroll-unavailable'));
}
