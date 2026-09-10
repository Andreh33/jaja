import assert from 'node:assert/strict';
import { it } from 'node:test';
import { measurementPath, contactChannel, commercialDestination, sanitizeMeasurementUrl } from '../src/lib/measurement';
it('keeps private identifiers and arbitrary paths out of contact events', () => {
  assert.equal(measurementPath('/recuperar/private-token'), null);
  assert.equal(measurementPath('/admin/clientes/person@example.com'), null);
  assert.equal(measurementPath('/blog/arbitrary-person@example.com'), '/blog/articulo');
  assert.equal(measurementPath('/lab/trazo'), '/lab/experimento');
  assert.equal(measurementPath('/tienda/calculadora'), '/tienda/calculadora');
});
it('removes shared drawings and search text from SDK URLs while preserving public article attribution', () => {
  assert.equal(sanitizeMeasurementUrl('https://latech.test/lab/trazo?level=private-drawing#token'), 'https://latech.test/lab/trazo');
  assert.equal(sanitizeMeasurementUrl('https://latech.test/blog/mi-guia?q=person@example.com'), 'https://latech.test/blog/mi-guia');
  assert.equal(sanitizeMeasurementUrl('https://latech.test/recuperar/private-token'), null);
  assert.equal(sanitizeMeasurementUrl('https://latech.test/dashboard/perfil'), null);
  assert.equal(sanitizeMeasurementUrl('https://latech.test/blog/person@example.com'), 'https://latech.test/otra-pagina-publica');
});
it('tracks only known internal commercial destinations without query data', () => {
  assert.equal(commercialDestination('/tienda/calculadora?name=private', 'https://latech.test'), '/tienda/calculadora');
  assert.equal(commercialDestination('https://evil.test/tienda', 'https://latech.test'), null);
  assert.equal(commercialDestination('/admin/clientes/private', 'https://latech.test'), null);
});
it('only recognizes the real WhatsApp host, never user text in another URL', () => {
  assert.equal(contactChannel('https://wa.me/34684739091?text=private'), 'whatsapp');
  assert.equal(contactChannel('https://example.com/?url=wa.me/private'), null);
  assert.equal(contactChannel('https://wa.me.evil.example'), null);
  assert.equal(contactChannel('mailto:person@example.com'), 'email');
});
