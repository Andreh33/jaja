export const SITE_URL = 'https://serviciosonlineweb.com';

export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Latech',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    'Diseño web, tiendas online y agentes de IA con n8n para empresas de toda España. Entrega en 24-48h, sin permanencia.',
  email: 'info@latech.es',
  telephone: '+34684739091',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Puente 3',
    addressLocality: 'Puebla de la Calzada',
    addressRegion: 'Badajoz',
    postalCode: '06490',
    addressCountry: 'ES',
  },
  areaServed: { '@type': 'Country', name: 'España' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+34684739091',
    contactType: 'customer service',
    availableLanguage: 'Spanish',
  },
};

export const LOCAL_BUSINESS_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#localbusiness`,
  name: 'Latech',
  image: `${SITE_URL}/icon.svg`,
  url: SITE_URL,
  telephone: '+34684739091',
  email: 'info@latech.es',
  priceRange: '€€',
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
