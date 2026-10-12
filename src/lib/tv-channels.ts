import { projects } from './projects';

// Headers checked 2026-10-12. Zona Sport disallows cross-origin frames.
// Keep it in the public portfolio, never proxy around its framing policy.
export const excludedTvProjects = ['zonasport'] as const;
// Preserve the relative order of retained channels when the portfolio is reordered.
const order = ['monopatinmonkey', 'panelex', 'toldos-noa'];
export const tvProjects = projects
  .filter(project => !(excludedTvProjects as readonly string[]).includes(project.id))
  .sort((a, b) => (order.includes(a.id) ? order.indexOf(a.id) : 99) - (order.includes(b.id) ? order.indexOf(b.id) : 99))
  .map(project => ({ ...project, slug: project.id === 'monopatinmonkey' ? 'monkey' : project.id,
    category: project.sector, detail: project.sector, caption: project.name,
    color: '#86caff' }));

export const tvChannels = [{ id: 'studio', name: 'Latech Studio', image: '/brand/latech-logo.webp', category: 'Tu imaginación es nuestro límite.' },
  {id:'teletext',name:'Latech Teletexto',image:'/equipo/fundadores/foto.jpeg',category:'Andrés y Luis. La historia detrás de Latech.'},
  ...tvProjects.map(project => ({ id: project.slug, name: project.name, image: project.image, category: project.sector }))];
export const tvChannelIds = tvChannels.map(channel => channel.id);
export const isTvChannel = (value: string) => tvChannelIds.includes(value);
export const channelNumber = (id: string) => String(Math.max(0, tvChannelIds.indexOf(id))).padStart(2, '0');
