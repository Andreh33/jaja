import { featuredProjects } from './featured-projects';

// Verified on 2026-09-26. Respect the project's SAMEORIGIN policy rather than
// proxying its pages or displaying a browser error inside the portfolio.
const restrictedOrigins = new Set(['https://zonasport.vercel.app']);
export const studioProjectSlugs = ['monkey', 'zona-sport', 'french-tacos'] as const;

export function studioBrowserProject(index: number) {
  const safeIndex = Number.isInteger(index) && index >= 0 && index < featuredProjects.length ? index : 0;
  const project = featuredProjects[safeIndex];
  const url = new URL(project.url);
  return { project, hostname: url.hostname, origin: url.origin, embeddable: !restrictedOrigins.has(url.origin), frameUrl: `/studio-browser/${studioProjectSlugs[safeIndex]}` };
}
