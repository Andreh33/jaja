export type Service = 'diseno-web' | 'tienda-online' | 'agente-ia';

export const SERVICE_LABEL: Record<Service, string> = {
  'diseno-web': 'Diseño web',
  'tienda-online': 'Tienda online',
  'agente-ia': 'Agente de IA',
};

export interface City {
  slug: string; // 'madrid'
  name: string; // 'Madrid'
  provincia: string; // 'Madrid'
  region: string; // 'Comunidad de Madrid'
  nearby: string[]; // slugs de ciudades cercanas
}

export interface LocalLanding {
  service: Service;
  citySlug: string;
  title: string; // <title> (<=60 chars ideal)
  description: string; // meta description (<=155 chars)
  h1: string;
  intro: string; // párrafo único ligado al tejido económico local
  sectores: { nombre: string; gancho: string }[]; // 3-5
  faq: { q: string; a: string }[]; // 4-6
  bodyMarkdown: string; // cuerpo en markdown (renderMarkdown)
}
