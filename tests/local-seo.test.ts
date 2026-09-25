import assert from "node:assert/strict";
import test from "node:test";
import { getLanding, landingsFor } from "../src/content/local";
import { QUOTE_CATALOG } from "../src/lib/quotes/catalog";
import { metadata as terminos } from "../src/app/terminos/page";
import { metadata as privacidad } from "../src/app/privacidad/page";

const expected = {
  badajoz: "Diseño web en Badajoz desde 800 € | Latech",
  bilbao: "Diseño web en Bilbao desde 800 € | Latech",
} as const;

for (const [city, title] of Object.entries(expected)) {
  test(`diseño web en ${city} responde a intención comercial verificable`, () => {
    const landing = getLanding("diseno-web", city);
    assert.ok(landing);
    assert.equal(landing.title, title);
    assert.ok(landing.description.includes("800 €"));
    assert.ok(landing.description.length >= 120);
    assert.ok(landing.description.length <= 155);
    assert.equal((landing as { updatedAt?: string }).updatedAt, "2026-07-22");
  });
}

test("Bilbao declara que el servicio se presta en remoto", () => {
  const landing = getLanding("diseno-web", "bilbao");
  assert.ok(landing);
  assert.match(`${landing.description} ${landing.intro} ${landing.bodyMarkdown}`, /en remoto/i);
});

test("las landings web y tienda publican el precio vigente, incluido su FAQ estructurado", () => {
  assert.equal(QUOTE_CATALOG.creation.amount, 80000);
  for (const service of ["diseno-web", "tienda-online"] as const) {
    for (const landing of landingsFor(service)) {
      const content = JSON.stringify(landing);
      assert.doesNotMatch(content, /600\s*€/, `${service}/${landing.citySlug}: precio anterior`);
      assert.match(content, /800\s*€/, `${service}/${landing.citySlug}: falta precio vigente`);
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
