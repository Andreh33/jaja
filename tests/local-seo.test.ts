import assert from "node:assert/strict";
import test from "node:test";
import { getLanding } from "../src/content/local";
import { metadata as terminos } from "../src/app/terminos/page";
import { metadata as privacidad } from "../src/app/privacidad/page";

const expected = {
  badajoz: "Diseño web en Badajoz desde 600 € | Latech",
  bilbao: "Diseño web en Bilbao desde 600 € | Latech",
} as const;

for (const [city, title] of Object.entries(expected)) {
  test(`diseño web en ${city} responde a intención comercial verificable`, () => {
    const landing = getLanding("diseno-web", city);
    assert.ok(landing);
    assert.equal(landing.title, title);
    assert.ok(landing.description.includes("600 €"));
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

test("Badajoz acredita la cercanía extremeña real", () => {
  const landing = getLanding("diseno-web", "badajoz");
  assert.ok(landing);
  assert.match(`${landing.description} ${landing.intro} ${landing.bodyMarkdown}`, /Extremadura/i);
});

test("las páginas legales emiten canonical autorreferente", () => {
  assert.equal(terminos.alternates?.canonical, "/terminos");
  assert.equal(privacidad.alternates?.canonical, "/privacidad");
});
