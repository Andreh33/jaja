export const studioPages = [
  { id: 'home', label: 'Inicio' }, { id: 'projects', label: 'Proyectos' },
  { id: 'activate', label: 'Activa Latech' }, { id: 'create', label: 'Tu marca' }, { id: 'play', label: 'Sin gravedad' },
  { id: 'services', label: 'Servicios' }, { id: 'studio', label: 'El estudio' },
  { id: 'contact', label: 'Hablemos' },
] as const;
export type StudioPage = (typeof studioPages)[number]['id'];
export const directions = ['editorial', 'electric', 'bold'] as const;
export const sectors = ['Servicios', 'Restauración', 'Deporte', 'Comercio'] as const;
export const accents = { blue: '#0868d9', orange: '#b84708', ink: '#14283e' } as const;
export type StudioSettings = {
  name: string;
  sector: (typeof sectors)[number];
  direction: (typeof directions)[number];
  accent: keyof typeof accents;
};
export const defaultStudio: StudioSettings = { name: '', sector: 'Servicios', direction: 'editorial', accent: 'blue' };
export const directionLabels = { editorial: 'Editorial', electric: 'Eléctrico', bold: 'Fuera del molde' };
export const sectorCopy = {
  Servicios: ['Tu diferencia.', 'Bien contada.', 'Cerca de tus clientes. Lejos de lo de siempre.'],
  Restauración: ['Abre el apetito.', 'Deja huella.', 'Una experiencia que empieza antes del primer bocado.'],
  Deporte: ['Nacidos para', 'movernos.', 'Actitud, energía y un siguiente reto por delante.'],
  Comercio: ['No pases', 'de largo.', 'Objetos con historia. Una marca con algo que decir.'],
} as const;

export function normalizeStudio(value: Partial<StudioSettings>): StudioSettings {
  return {
    name: typeof value.name === 'string' ? value.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 36) : '',
    sector: sectors.includes(value.sector as StudioSettings['sector']) ? value.sector! : defaultStudio.sector,
    direction: directions.includes(value.direction as StudioSettings['direction']) ? value.direction! : defaultStudio.direction,
    accent: value.accent && Object.hasOwn(accents, value.accent) ? value.accent : defaultStudio.accent,
  };
}

// A URL fragment stays in the browser; no customer idea is posted to a service.
export function studioHash(settings: StudioSettings): string {
  const s = normalizeStudio(settings);
  return `#studio=${encodeURIComponent(JSON.stringify([1, s.name, s.sector, s.direction, s.accent]))}`;
}

export function parseStudioHash(hash: string): StudioSettings | null {
  if (!hash.startsWith('#studio=') || hash.length > 900) return null;
  try {
    const value: unknown = JSON.parse(decodeURIComponent(hash.slice(8)));
    if (!Array.isArray(value) || value.length !== 5 || value[0] !== 1) return null;
    return normalizeStudio({ name: value[1], sector: value[2], direction: value[3], accent: value[4] });
  } catch { return null; }
}

export function studioBrief(settings: StudioSettings): string {
  const s = normalizeStudio(settings);
  return `Hola, he probado Latech Studio y quiero hablar de una web para ${s.name || 'mi negocio'}. Sector: ${s.sector}. Dirección: ${directionLabels[s.direction]}. Me gustaría desarrollar esta idea con vosotros.`;
}
