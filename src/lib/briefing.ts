import { QUOTE_WHATSAPP_NUMBER } from './quotes/catalog';

export const BRIEFING_VERSION = 1;
export const BRIEFING_KEY = 'latech_briefing_v1';
export const PROJECT_TYPES = [
  { value: 'web', label: 'Web de negocio', description: 'Presentar servicios y facilitar el contacto.' },
  { value: 'shop', label: 'Tienda online', description: 'Definir catálogo, compra y gestión de pedidos.' },
  { value: 'automation', label: 'Agente IA y automatización', description: 'Delimitar una tarea, sus datos y el relevo humano.' },
] as const;
export type ProjectType = typeof PROJECT_TYPES[number]['value'];
export const FEATURES = [
  { value: 'contact', label: 'Solicitudes de contacto', types: ['web', 'shop'] },
  { value: 'reservations', label: 'Reservas o citas', types: ['web', 'shop'] },
  { value: 'languages', label: 'Varios idiomas', types: ['web', 'shop', 'automation'] },
  { value: 'oldUrls', label: 'Conservar enlaces de una web anterior', types: ['web', 'shop'] },
  { value: 'catalog', label: 'Catálogo con productos y variantes', types: ['shop'] },
  { value: 'shipping', label: 'Envíos o recogida', types: ['shop'] },
  { value: 'answers', label: 'Responder preguntas frecuentes', types: ['automation'] },
  { value: 'handoff', label: 'Derivar casos a una persona', types: ['automation'] },
] as const;
export type Feature = typeof FEATURES[number]['value'];
export const INTEGRATIONS = [
  { value: 'calendar', label: 'Calendario o agenda' },
  { value: 'crm', label: 'CRM o gestión de clientes' },
  { value: 'payments', label: 'Pasarela de pago' },
  { value: 'inventory', label: 'Inventario o ERP' },
  { value: 'email', label: 'Correo del negocio' },
] as const;
export type Integration = typeof INTEGRATIONS[number]['value'];
export const MATERIALS = [
  { value: 'texts', label: 'Textos y descripción de servicios' },
  { value: 'photos', label: 'Logo e imágenes con permiso de uso' },
  { value: 'catalog', label: 'Catálogo, precios y variantes' },
  { value: 'knowledge', label: 'Respuestas y documentación aprobadas' },
] as const;
export type Material = typeof MATERIALS[number]['value'];
export type MaterialStatus = '' | 'ready' | 'pending' | 'help';
export type BriefingState = {
  project: ProjectType | '';
  objective: string;
  audience: string;
  features: Feature[];
  integrations: Integration[];
  materials: Record<Material, MaterialStatus>;
  owner: '' | 'team' | 'provider' | 'undecided';
  launch: '' | 'flexible' | 'urgent';
  notes: string;
};
export const EMPTY_BRIEFING: BriefingState = {
  project: '', objective: '', audience: '', features: [], integrations: [],
  materials: { texts: '', photos: '', catalog: '', knowledge: '' },
  owner: '', launch: '', notes: '',
};
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').slice(0, max) : '';
const pick = <T extends string>(value: unknown, allowed: readonly T[]): T | '' => typeof value === 'string' && allowed.includes(value as T) ? value as T : '';
const list = <T extends string>(value: unknown, allowed: readonly T[]): T[] => Array.isArray(value) ? [...new Set(value.filter(v => typeof v === 'string' && allowed.includes(v as T)))] as T[] : [];
export function sanitizeBriefing(value: unknown): BriefingState {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const sourceMaterials = source.materials && typeof source.materials === 'object' ? source.materials as Record<string, unknown> : {};
  return {
    project: pick(source.project, PROJECT_TYPES.map(p => p.value)),
    objective: clean(source.objective, 240), audience: clean(source.audience, 180), notes: clean(source.notes, 600),
    features: list(source.features, FEATURES.map(f => f.value)), integrations: list(source.integrations, INTEGRATIONS.map(i => i.value)),
    materials: Object.fromEntries(MATERIALS.map(m => [m.value, pick(sourceMaterials[m.value], ['ready', 'pending', 'help'] as const)])) as BriefingState['materials'],
    owner: pick(source.owner, ['team', 'provider', 'undecided'] as const), launch: pick(source.launch, ['flexible', 'urgent'] as const),
  };
}
export function relevantMaterials(project: BriefingState['project']): Material[] {
  if (project === 'automation') return ['knowledge'];
  return project === 'shop' ? ['texts', 'photos', 'catalog'] : ['texts', 'photos'];
}
export function relevantFeatures(state: BriefingState): Feature[] {
  return state.features.filter(value => FEATURES.find(f => f.value === value)?.types.some(type => type === state.project));
}
export function chooseProject(state: BriefingState, project: ProjectType): BriefingState {
  const next = { ...state, project };
  return { ...next, features: relevantFeatures(next) };
}
export type BriefingReport = {
  project: string;
  sections: { title: string; items: string[] }[];
  warnings: string[];
  complete: boolean;
  answered: number;
  total: number;
};
const acceptance: Record<Feature, string> = {
  contact: 'Enviar una solicitud de prueba, confirmar su recepción y comprobar los errores del formulario.',
  reservations: 'Probar disponibilidad, confirmación, cancelación y prevención de reservas duplicadas.',
  languages: 'Revisar navegación, textos y mensajes de error en cada idioma acordado.',
  oldUrls: 'Revisar el inventario de URLs y comprobar las redirecciones acordadas antes de publicar.',
  catalog: 'Probar variantes, precios y actualización del catálogo con la persona responsable.',
  shipping: 'Comprobar costes y zonas de envío o recogida antes del paso de pago.',
  answers: 'Evaluar respuestas con casos acordados, incluidos aquellos que el agente debe reconocer que desconoce.',
  handoff: 'Probar la derivación humana y qué ocurre fuera del horario de atención.',
};
export function buildBriefing(value: unknown): BriefingReport {
  const state = sanitizeBriefing(value);
  const selected = relevantFeatures(state);
  const materials = relevantMaterials(state.project);
  const pending = materials.filter(m => state.materials[m] !== 'ready');
  const ownerLabel = { team: 'El equipo del negocio', provider: 'El proveedor, pendiente de acordar condiciones', undecided: 'Por decidir', '': 'Por decidir' }[state.owner];
  const warnings: string[] = [];
  if (state.launch === 'urgent' && pending.length) warnings.push('Has marcado urgencia y todavía hay materiales sin preparar. Acordad una primera entrega viable o completadlos antes de fijar una fecha.');
  if (state.project === 'shop' && (!state.owner || state.owner === 'undecided')) warnings.push('Falta decidir quién mantendrá productos, precios y disponibilidad después de publicar.');
  if (state.project === 'automation' && !selected.includes('handoff')) warnings.push('Define qué ocurre cuando el agente no puede resolver un caso y quién lo recibe.');
  const answered = [Boolean(state.project), Boolean(state.objective.trim()), Boolean(state.audience.trim()), selected.length > 0, ...materials.map(m => Boolean(state.materials[m])), Boolean(state.owner), Boolean(state.launch)].filter(Boolean).length;
  const total = 6 + materials.length;
  return {
    project: PROJECT_TYPES.find(p => p.value === state.project)?.label || 'Tipo de proyecto por decidir', warnings,
    answered, total, complete: Boolean(state.project && answered === total),
    sections: [
      { title: 'Objetivo y público', items: [state.objective.trim() || 'Objetivo pendiente de definir.', state.audience.trim() ? `Público: ${state.audience.trim()}` : 'Público pendiente de definir.'] },
      { title: 'Alcance que queremos estudiar', items: selected.length ? selected.map(v => FEATURES.find(f => f.value === v)!.label) : ['Funciones pendientes de seleccionar.'] },
      { title: 'Materiales y responsables', items: [...materials.map(m => `${MATERIALS.find(item => item.value === m)!.label}: ${{ ready: 'disponible', pending: 'pendiente de preparar', help: 'necesito ayuda para prepararlo', '': 'sin revisar' }[state.materials[m]]}.`), `Responsable de mantener el contenido o las respuestas: ${ownerLabel}.`] },
      { title: 'Integraciones que hay que confirmar', items: state.integrations.length ? state.integrations.map(i => `${INTEGRATIONS.find(item => item.value === i)!.label}: identificar la herramienta y confirmar acceso, compatibilidad y costes.`) : ['No se han indicado integraciones. Confirmar si el proyecto depende de otra herramienta.'] },
      { title: 'Preguntas para el proveedor', items: ['¿Qué funciones y materiales incluye exactamente la propuesta?', '¿Quién será propietario del dominio, los datos y las cuentas necesarias?', '¿Cómo se gestionan mantenimiento, incidencias, costes de terceros y una futura salida?', state.launch === 'urgent' ? '¿Qué alcance puede entregarse primero teniendo en cuenta los materiales pendientes?' : '¿Qué calendario podemos acordar una vez revisado el alcance y los materiales?'] },
      { title: 'Cómo comprobar la entrega', items: ['Revisar los recorridos principales en móvil y con teclado.', ...selected.map(v => acceptance[v]), state.project === 'automation' ? 'Acordar límites, tratamiento de datos y supervisión antes de activar una integración real.' : 'Comprobar enlaces, formularios y titularidad de los accesos antes de publicar.'] },
      ...(state.notes.trim() ? [{ title: 'Contexto adicional', items: [state.notes.trim()] }] : []),
    ],
  };
}
export function briefingText(state: unknown): string {
  const report = buildBriefing(state);
  return ['MI BRIEFING · LATECH', report.project, 'Documento de trabajo. Alcance y presupuesto pendientes de confirmar.', ...report.sections.map(section => `${section.title}\n${section.items.map(item => `• ${item}`).join('\n')}`), ...(report.warnings.length ? [`Puntos a resolver\n${report.warnings.map(item => `• ${item}`).join('\n')}`] : []), 'Creado con https://serviciosonlineweb.com/briefing'].join('\n\n');
}
export const briefingWhatsApp = (state: unknown) => `https://wa.me/${QUOTE_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero revisar este proyecto con Latech.\n\n${briefingText(state)}`)}`;
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function readBriefing(storage: StorageLike): BriefingState | null {
  try { const raw = storage.getItem(BRIEFING_KEY); if (!raw || raw.length > 12000) return null; const parsed = JSON.parse(raw); return parsed?.version === BRIEFING_VERSION ? sanitizeBriefing(parsed.state) : null; } catch { return null; }
}
export function saveBriefing(storage: StorageLike, state: unknown): boolean {
  try { storage.setItem(BRIEFING_KEY, JSON.stringify({ version: BRIEFING_VERSION, state: sanitizeBriefing(state) })); return true; } catch { return false; }
}
export function clearBriefing(storage: StorageLike): boolean {
  try { storage.removeItem(BRIEFING_KEY); return true; } catch { return false; }
}

export const ARTICLE_DECISIONS = {
  'wordpress-vs-web-a-medida': { id: 'urls', title: '¿Vienes de otra web?', text: 'Anota que hay enlaces antiguos que revisar antes de cambiar de plataforma.', project: 'web', feature: 'oldUrls' },
  'checklist-antes-de-encargar-web': { id: 'materials', title: 'Convierte la lista en tu proyecto', text: 'Marca que necesitas revisar textos e imágenes antes de encargar la web.', project: 'web' },
  'pagina-web-restaurantes': { id: 'reservations', title: '¿Tu web necesita gestionar reservas?', text: 'Añade las reservas como requisito para discutir disponibilidad, confirmaciones y cancelaciones.', project: 'web', feature: 'reservations' },
  'tienda-online-moda-ropa': { id: 'catalog', title: '¿Quién actualizará tu catálogo?', text: 'Lleva esta decisión a tu briefing y asigna un responsable antes de publicar.', project: 'shop', feature: 'catalog' },
  'integrar-agente-ia-crm': { id: 'crm', title: '¿El agente debe trabajar con tu CRM?', text: 'Añade esta integración como requisito pendiente de comprobar.', project: 'automation', integration: 'crm' },
  'vender-en-el-extranjero-desde-espana': { id: 'languages', title: '¿Venderás en varios idiomas?', text: 'Incluye los idiomas en el alcance y revisa qué textos habrá que preparar.', project: 'shop', feature: 'languages' },
} as const;
export type ArticleDecision = typeof ARTICLE_DECISIONS[keyof typeof ARTICLE_DECISIONS];
export function getArticleDecision(id: unknown): ArticleDecision | undefined { return Object.values(ARTICLE_DECISIONS).find(d => d.id === id); }
export function applyArticleDecision(state: BriefingState, decision: ArticleDecision): BriefingState {
  const next = chooseProject(state, decision.project);
  return sanitizeBriefing({ ...next,
    features: 'feature' in decision ? [...new Set([...next.features, decision.feature])] : next.features,
    integrations: 'integration' in decision ? [...new Set([...next.integrations, decision.integration])] : next.integrations,
    materials: decision.id === 'materials' ? { ...next.materials, texts: next.materials.texts || 'pending', photos: next.materials.photos || 'pending' } : next.materials,
  });
}
