import type { City, Service, LocalLanding } from './types';
import { CITIES } from './cities';
import { landings as disenoWeb } from './diseno-web';
import { landings as tiendaOnline } from './tienda-online';
import { landings as agenteIa } from './agente-ia';

export * from './types';
export { CITIES };

const BY_SERVICE: Record<Service, LocalLanding[]> = {
  'diseno-web': disenoWeb,
  'tienda-online': tiendaOnline,
  'agente-ia': agenteIa,
};

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getLanding(service: Service, citySlug: string): LocalLanding | undefined {
  return BY_SERVICE[service].find((l) => l.citySlug === citySlug);
}

export function landingsFor(service: Service): LocalLanding[] {
  return BY_SERVICE[service];
}

export function allLandings(): LocalLanding[] {
  return [...disenoWeb, ...tiendaOnline, ...agenteIa];
}
