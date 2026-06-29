import { allLandings } from '../src/content/local';

const items = allLandings();
const intros = new Map<string, string>();
let fail = false;

for (const l of items) {
  const key = l.intro.trim().toLowerCase().slice(0, 120);
  if (intros.has(key)) {
    console.error(`❌ Intro duplicada: ${l.service}/${l.citySlug} ≈ ${intros.get(key)}`);
    fail = true;
  }
  intros.set(key, `${l.service}/${l.citySlug}`);
  if (l.intro.includes('PLACEHOLDER') || l.bodyMarkdown.includes('Placeholder piloto')) {
    console.error(`❌ Placeholder sin reemplazar: ${l.service}/${l.citySlug}`);
    fail = true;
  }
  const words = l.bodyMarkdown.split(/\s+/).length;
  if (words < 350) {
    console.warn(`⚠️  Cuerpo corto (${words} palabras): ${l.service}/${l.citySlug}`);
  }
  if (l.title.length > 65) {
    console.warn(`⚠️  Title largo (${l.title.length}): ${l.service}/${l.citySlug}`);
  }
  if (l.description.length > 160) {
    console.warn(`⚠️  Description larga (${l.description.length}): ${l.service}/${l.citySlug}`);
  }
}

console.log(`\n${items.length} landings revisadas.`);
process.exit(fail ? 1 : 0);
