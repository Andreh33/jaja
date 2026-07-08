export const SITE_URL = 'https://serviciosonlineweb.com';

/** Logo en PNG (Google no acepta bien SVG como logo de Organization). */
export const LOGO_URL = `${SITE_URL}/apple-icon.png`;

/** @id estables del grafo de entidad. Todo nodo JSON-LD del sitio debe
 *  referenciar estos ids en lugar de duplicar la entidad. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FOUNDER_ANDRES_ID = `${SITE_URL}/sobre-nosotros#andres-rubio`;
export const FOUNDER_LUIS_ID = `${SITE_URL}/sobre-nosotros#luis-grondona`;

/** Perfiles sociales REALES y verificados de la marca (sameAs).
 *  Añadir aquí las URLs exactas (Instagram, LinkedIn, etc.) cuando el equipo
 *  las confirme: consolidan la entidad en Google/Bing y en las citas de IA.
 *  NO inventar URLs: un sameAs que no resuelve daña la entidad. */
export const SOCIAL_PROFILES: string[] = [];

/** Referencia mínima a la Organization para author/publisher de Articles:
 *  mismo @id que el nodo completo del @graph del layout, así los parsers
 *  consolidan en una única entidad. */
export const ORG_REF = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Latech',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: LOGO_URL },
};

/** Recorta una descripción a un máximo de caracteres sin partir palabras. */
export function truncateDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Fundadores como entidades Person verificables (E-E-A-T + atribución en IA).
 *  Viven en el @graph global para que cualquier página pueda referenciarlos
 *  por @id sin duplicar datos. */
const FOUNDERS_JSONLD = [
  {
    '@type': 'Person',
    '@id': FOUNDER_ANDRES_ID,
    name: 'Andrés Rubio',
    jobTitle: 'Cofundador de Latech',
    url: `${SITE_URL}/sobre-nosotros`,
    worksFor: { '@id': ORG_ID },
    knowsAbout: ['Diseño web', 'Tiendas online', 'SEO local', 'Agentes de IA', 'Automatización con n8n'],
  },
  {
    '@type': 'Person',
    '@id': FOUNDER_LUIS_ID,
    name: 'Luis Grondona',
    jobTitle: 'Cofundador de Latech',
    url: `${SITE_URL}/sobre-nosotros`,
    worksFor: { '@id': ORG_ID },
    knowsAbout: ['Diseño web', 'Tiendas online', 'SEO local', 'Agentes de IA', 'Automatización con n8n'],
  },
];

/** Nodo único de negocio: Organization + ProfessionalService en una sola
 *  entidad (multi-type válido en JSON-LD). Antes había dos nodos separados
 *  (#organization en el layout y #localbusiness solo en /contacto) que Google
 *  y los LLMs podían leer como dos entidades distintas. */
const ORGANIZATION_NODE = {
  '@type': ['Organization', 'ProfessionalService'],
  '@id': ORG_ID,
  name: 'Latech',
  alternateName: 'LA Technology',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: LOGO_URL },
  image: LOGO_URL,
  description:
    'Diseño web, tiendas online y agentes de IA con n8n para empresas de toda España. Entrega en 24-48h, sin permanencia.',
  email: 'info@latech.es',
  telephone: '+34684739091',
  priceRange: '€€',
  founder: [{ '@id': FOUNDER_ANDRES_ID }, { '@id': FOUNDER_LUIS_ID }],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Puente 3',
    addressLocality: 'Puebla de la Calzada',
    addressRegion: 'Badajoz',
    postalCode: '06490',
    addressCountry: 'ES',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 38.8932, longitude: -6.6262 },
  areaServed: { '@type': 'Country', name: 'España' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+34684739091',
    email: 'info@latech.es',
    contactType: 'customer service',
    areaServed: 'ES',
    availableLanguage: 'Spanish',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de Latech',
    itemListElement: [
      {
        '@type': 'Offer',
        price: '600',
        priceCurrency: 'EUR',
        itemOffered: {
          '@type': 'Service',
          name: 'Diseño web profesional',
          url: `${SITE_URL}/tienda/web`,
          areaServed: { '@type': 'Country', name: 'España' },
        },
      },
      {
        '@type': 'Offer',
        price: '600',
        priceCurrency: 'EUR',
        itemOffered: {
          '@type': 'Service',
          name: 'Tienda online',
          url: `${SITE_URL}/tienda/online`,
          areaServed: { '@type': 'Country', name: 'España' },
        },
      },
      {
        '@type': 'Offer',
        price: '150',
        priceCurrency: 'EUR',
        itemOffered: {
          '@type': 'Service',
          name: 'Agente de IA (recepcionista virtual)',
          url: `${SITE_URL}/tienda/agente-ia`,
          areaServed: { '@type': 'Country', name: 'España' },
        },
      },
    ],
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '14:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '16:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '10:00',
      closes: '14:00',
    },
  ],
  ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
};

const WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_URL,
  name: 'Latech',
  description:
    'Diseño web, tiendas online y agentes de IA para empresas de toda España.',
  publisher: { '@id': ORG_ID },
  inLanguage: 'es-ES',
};

/** Grafo de entidad único del sitio (se emite en el layout raíz):
 *  Organization/ProfessionalService <-> WebSite <-> Person (fundadores),
 *  todos enlazados por @id. Es lo que Google/Bing y los LLMs usan para
 *  resolver la entidad de la marca sin contradicciones. */
export const SITE_GRAPH_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [ORGANIZATION_NODE, WEBSITE_NODE, ...FOUNDERS_JSONLD],
};

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  price: string;
  priceCurrency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'España' },
    offers: {
      '@type': 'Offer',
      price: opts.price,
      priceCurrency: opts.priceCurrency ?? 'EUR',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function localServiceJsonLd(opts: {
  serviceName: string;
  description: string;
  path: string;
  city: string;
  region: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.serviceName,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: {
      '@type': 'City',
      name: opts.city,
      containedInPlace: { '@type': 'AdministrativeArea', name: opts.region },
    },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
