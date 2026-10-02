import assert from "node:assert/strict";
import test from "node:test";
import { getLanding, landingsFor } from "../src/content/local";
import { metadata as terminos } from "../src/app/terminos/page";
import { metadata as privacidad } from "../src/app/privacidad/page";

const expected = {
  barcelona: "Diseño web en Barcelona a medida | Latech",
  badajoz: "Diseño web en Badajoz a medida | Latech",
  bilbao: "Diseño web en Bilbao a medida | Latech",
} as const;

for (const [city, title] of Object.entries(expected)) {
  test(`diseño web en ${city} responde a intención comercial verificable`, () => {
    const landing = getLanding("diseno-web", city);
    assert.ok(landing);
    assert.equal(landing.title, title);
    assert.ok(landing.description.includes("WhatsApp"));
    assert.ok(landing.description.length >= 120);
    assert.ok(landing.description.length <= 155);
    assert.equal((landing as { updatedAt?: string }).updatedAt, "2026-10-02");
  });
}

test("Bilbao declara que el servicio se presta en remoto", () => {
  const landing = getLanding("diseno-web", "bilbao");
  assert.ok(landing);
  assert.match(`${landing.description} ${landing.intro} ${landing.bodyMarkdown}`, /en remoto/i);
});

test("las landings web y tienda remiten a una propuesta a medida sin precios de contratación", () => {
  for (const service of ["diseno-web", "tienda-online"] as const) {
    for (const landing of landingsFor(service)) {
      const content = JSON.stringify(landing);
      assert.doesNotMatch(content, /600\s*€/, `${service}/${landing.citySlug}: precio anterior`);
      assert.doesNotMatch(content, /800\s*€|\/tienda\/calculadora/, `${service}/${landing.citySlug}: oferta retirada`);
      assert.match(content, /WhatsApp/, `${service}/${landing.citySlug}: falta contacto`);
    }
  }
});

test("Badajoz acredita la cercanía extremeña real", () => {
  const landing = getLanding("diseno-web", "badajoz");
  assert.ok(landing);
  assert.match(`${landing.description} ${landing.intro} ${landing.bodyMarkdown}`, /Extremadura/i);
});

test("las páginas legales emiten canonical autorreferente", () => {
  assert.equal(terminos.alternates?.canonical, "/terminos");
  assert.equal(privacidad.alternates?.canonical, "/privacidad");
});
