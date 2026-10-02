import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectInquiryMessage } from '../src/lib/project-inquiry';
import { whatsappLink } from '../src/lib/stripe-links';
import { SITE_GRAPH_JSONLD, serviceJsonLd } from '../src/lib/seo';
import { POST as checkout } from '../src/app/api/checkout/route';
import { POST as seoCheckout } from '../src/app/api/checkout/seo/route';
import { POST as billingPortal } from '../src/app/api/dashboard/billing/portal/route';

test('WhatsApp includes the chosen project and every supplied detail without changing special characters', () => {
  const text = projectInquiryMessage({ type: 'tienda', name: ' Ana ', business: 'Frutas & Más', message: 'Catálogo de piña + recogida\nEn español.' });
  const url = new URL(whatsappLink(text));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.searchParams.get('text'), text);
  assert.match(text, /Necesito: Tienda online/);
  assert.match(text, /Nombre: Ana/);
  assert.match(text, /Negocio: Frutas & Más/);
  assert.match(text, /piña \+ recogida\nEn español\./);
});
test('web request works without optional business details', () => {
  const text = projectInquiryMessage({ type: 'web', name: 'Luis', business: '  ', message: 'Una web para mostrar mis servicios.' });
  assert.match(text, /Necesito: Página web/);
  assert.doesNotMatch(text, /Negocio:|undefined/);
});
test('retired payment endpoints cannot initialize a payment or billing session', async () => {
  for (const route of [checkout, seoCheckout, billingPortal]) {
    const result = await route();
    assert.equal(result.status, 410);
    const body = await result.json();
    assert.equal(body.error, 'online_payments_removed');
    assert.equal(body.contact, '/contacto#proyecto');
    assert.equal(body.url, undefined);
  }
});
test('public structured data no longer advertises fixed service prices', () => {
  assert.doesNotMatch(JSON.stringify(SITE_GRAPH_JSONLD), /"price":/);
  const service = serviceJsonLd({ name: 'Web', path: '/tienda/web', description: 'A medida' });
  assert.equal('offers' in service, false);
});
