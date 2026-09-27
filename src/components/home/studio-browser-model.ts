import { tvProjects } from '@/lib/tv-channels';
export const studioProjectSlugs = tvProjects.map(project => project.slug);

export function studioBrowserProject(index: number) {
  const safeIndex = Number.isInteger(index) && index >= 0 && index < tvProjects.length ? index : 0;
  const project = tvProjects[safeIndex];
  const url = new URL(project.url);
  return { project, hostname: url.hostname, origin: url.origin, embeddable: true, frameUrl: `/studio-browser/${studioProjectSlugs[safeIndex]}` };
}
