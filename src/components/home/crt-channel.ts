import { studioPages, type StudioPage, type StudioSettings } from './studio-model';
import { featuredProjects } from './featured-projects';

export const crtTones = ['blue', 'cyan', 'amber', 'green'] as const;
export type CrtTone = (typeof crtTones)[number];
export type CrtChannel = { key: string; number: string; label: string; tone: CrtTone };
const pageTones: Record<StudioPage, CrtTone> = { home: 'blue', projects: 'cyan', activate: 'blue', create: 'blue', play: 'green', services: 'cyan', studio: 'amber', contact: 'amber' };

export function crtChannel(page: StudioPage, browsing = false, project = 0, accent: StudioSettings['accent'] = 'blue'): CrtChannel {
  if (browsing) {
    const index = Math.max(0, Math.min(featuredProjects.length - 1, project));
    return { key: `project-${index}`, number: `AV ${index + 1}`, label: featuredProjects[index].name, tone: index === 1 ? 'cyan' : 'amber' };
  }
  const index = studioPages.findIndex(item => item.id === page);
  const tone = page === 'create' ? (accent === 'orange' ? 'amber' : accent === 'ink' ? 'cyan' : 'blue') : pageTones[page];
  return { key: page, number: `CH ${String(index + 1).padStart(2, '0')}`, label: studioPages[index].label, tone };
}
