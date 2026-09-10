import { QUOTE_CATALOG, QUOTE_TAX_LABEL, QUOTE_WHATSAPP_NUMBER, formatEUR, type QuoteItem } from '@/lib/quotes/catalog';

export const STEP_LABELS = ['Proyecto', 'Servicios', 'Contenido', 'Tu contexto', 'Revisión'] as const;
export const TOTAL_STEPS = STEP_LABELS.length;
export type AiAgent = 'none' | 'web' | 'phone';
export type ContactState = { name: string; email: string; phone: string; company: string; notes: string };
export type WizardState = {
  step: number;
  webPagesOver8: boolean;
  tienda: boolean;
  social: boolean;
  aiAgent: AiAgent;
  blogPosts: number;
  logo: boolean;
  contact: ContactState;
};
export const INITIAL_STATE: WizardState = {
  step: 1, webPagesOver8: false, tienda: false, social: false, aiAgent: 'none', blogPosts: 0, logo: false,
  contact: { name: '', email: '', phone: '', company: '', notes: '' },
};
export type WizardAction =
  | { type: 'GOTO'; step: number } | { type: 'NEXT' } | { type: 'PREV' }
  | { type: 'SET_WEB_OVER8' | 'SET_TIENDA' | 'SET_SOCIAL' | 'SET_LOGO'; value: boolean }
  | { type: 'SET_AI'; value: AiAgent } | { type: 'SET_BLOG_POSTS'; value: number }
  | { type: 'SET_CONTACT'; patch: Partial<ContactState> }
  | { type: 'HYDRATE'; state: unknown } | { type: 'RESET' };

function boundedInteger(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
}
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function cleanText(value: unknown, max: number, multiline = false): string {
  if (typeof value !== 'string') return '';
  // Keep text, never carry control characters into storage or the WhatsApp message.
  const cleaned = [...value].filter((char) => char.charCodeAt(0) >= 32 || (multiline && char === '\n')).join('');
  return cleaned.slice(0, max);
}
export function sanitizeState(value: unknown): WizardState {
  const s = record(value); const c = record(s.contact);
  return {
    step: boundedInteger(s.step, 1, TOTAL_STEPS, 1),
    webPagesOver8: s.webPagesOver8 === true, tienda: s.tienda === true,
    social: s.social === true, aiAgent: s.aiAgent === 'web' || s.aiAgent === 'phone' ? s.aiAgent : 'none',
    blogPosts: boundedInteger(s.blogPosts, 0, 100, 0), logo: s.logo === true,
    contact: { name: cleanText(c.name, 100), email: cleanText(c.email, 180), phone: cleanText(c.phone, 32), company: cleanText(c.company, 120), notes: cleanText(c.notes, 600, true) },
  };
}
export function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'GOTO': return { ...state, step: boundedInteger(action.step, 1, TOTAL_STEPS, 1) };
    case 'NEXT': return { ...state, step: Math.min(TOTAL_STEPS, state.step + 1) };
    case 'PREV': return { ...state, step: Math.max(1, state.step - 1) };
    case 'SET_WEB_OVER8': return { ...state, webPagesOver8: action.value };
    case 'SET_TIENDA': return { ...state, tienda: action.value };
    case 'SET_SOCIAL': return { ...state, social: action.value };
    case 'SET_AI': return { ...state, aiAgent: action.value };
    case 'SET_BLOG_POSTS': return { ...state, blogPosts: boundedInteger(action.value, 0, 100, 0) };
    case 'SET_LOGO': return { ...state, logo: action.value };
    case 'SET_CONTACT': return sanitizeState({ ...state, contact: { ...state.contact, ...action.patch } });
    case 'HYDRATE': return sanitizeState(action.state);
    case 'RESET': return sanitizeState(INITIAL_STATE);
  }
}
export function contactErrors(c: ContactState): Partial<Record<keyof ContactState, string>> {
  const errors: Partial<Record<keyof ContactState, string>> = {};
  if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) errors.email = 'Revisa el email o déjalo vacío.';
  if (c.phone.trim() && !/^\+?[\d\s().-]{6,32}$/.test(c.phone.trim())) errors.phone = 'Revisa el teléfono o déjalo vacío.';
  return errors;
}
export function isStepValid(step: number, s: WizardState): boolean {
  if (step < 1 || step > TOTAL_STEPS) return false;
  if (step === 3) return Number.isInteger(s.blogPosts) && s.blogPosts >= 0 && s.blogPosts <= 100;
  if (step >= 4) return Object.keys(contactErrors(s.contact)).length === 0;
  return true;
}
export type CartLine = { catalogId: string; item: QuoteItem; quantity: number; lineTotal: number };
export type Cart = { oneTime: CartLine[]; recurring: CartLine[]; oneTimeTotal: number; recurringTotal: number; firstMonthTotal: number };
function line(item: QuoteItem, quantity = 1): CartLine { return { catalogId: item.id, item, quantity, lineTotal: item.amount * quantity }; }
export function buildCart(input: WizardState): Cart {
  const s = sanitizeState(input);
  const oneTime = [line(QUOTE_CATALOG.creation)];
  const recurring = [line(QUOTE_CATALOG.maintenance)];
  if (s.tienda) recurring.push(line(QUOTE_CATALOG.shop));
  if (s.social) recurring.push(line(QUOTE_CATALOG.social));
  if (s.aiAgent === 'web') recurring.push(line(QUOTE_CATALOG.aiWeb));
  if (s.aiAgent === 'phone') recurring.push(line(QUOTE_CATALOG.aiPhone));
  if (s.blogPosts > 0) recurring.push(line(QUOTE_CATALOG.blogPost, s.blogPosts));
  if (s.logo) oneTime.push(line(QUOTE_CATALOG.logo));
  const oneTimeTotal = oneTime.reduce((sum, l) => sum + l.lineTotal, 0);
  const recurringTotal = recurring.reduce((sum, l) => sum + l.lineTotal, 0);
  return { oneTime, recurring, oneTimeTotal, recurringTotal, firstMonthTotal: oneTimeTotal + recurringTotal };
}
export function buildWhatsAppMessage(input: WizardState): string {
  const s = sanitizeState(input); const cart = buildCart(s);
  const lines = [
    'Hola, Latech. Me gustaría revisar este presupuesto:', '',
    'MI PROYECTO',
    `Páginas: ${s.webPagesOver8 ? 'más de 8 (confirmar alcance)' : 'hasta 8'}.`,
    `Tienda online: ${s.tienda ? 'sí' : 'no'}.`,
    'Hosting y mantenimiento: incluidos en la cuota mensual.',
    `Redes sociales: ${s.social ? 'sí' : 'no'}.`,
    `Agente IA: ${s.aiAgent === 'web' ? 'en la web' : s.aiAgent === 'phone' ? 'por teléfono' : 'ninguno'}.`,
    `Blog: incluido; ${s.blogPosts} artículos gestionados al mes.`,
    `Logo: ${s.logo ? 'sí' : 'no'}.`, '', 'DESGLOSE',
    ...cart.oneTime.map(l => `${l.item.name}: ${formatEUR(l.lineTotal)} (pago único).`),
    ...cart.recurring.map(l => `${l.item.name}${l.quantity > 1 ? ` × ${l.quantity}` : ''}: ${formatEUR(l.lineTotal)}/mes.`),
    '', `Pago inicial de creación y extras: ${formatEUR(cart.oneTimeTotal)}.`,
    `Cuota mensual: ${formatEUR(cart.recurringTotal)}/mes.`,
    `Primer mes estimado, incluida creación: ${formatEUR(cart.firstMonthTotal)}.`,
    `${QUOTE_TAX_LABEL} en todos los importes.`,
    'Presupuesto orientativo: confirmar alcance, extras y calendario antes de contratar.',
  ];
  const details = [['Nombre', s.contact.name], ['Empresa', s.contact.company], ['Email', s.contact.email], ['Teléfono', s.contact.phone]].filter(([, value]) => value.trim());
  if (details.length) lines.push('', 'DATOS OPCIONALES', ...details.map(([label, value]) => `${label}: ${value.trim()}`));
  if (s.contact.notes.trim()) lines.push('', 'SOBRE MI PROYECTO', s.contact.notes.trim());
  return lines.join('\n');
}
export function buildWhatsAppUrl(state: WizardState): string {
  return `https://wa.me/${QUOTE_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(state))}`;
}

/** Only selections survive reload. Contact details are deliberately kept in memory. */
export const STORAGE_KEY = 'latech_quote_v2';
export const LEGACY_STORAGE_KEY = 'calculator_wizard_v1';
export type QuoteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function browserStorage(): QuoteStorage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.sessionStorage; } catch { return undefined; }
}
export function serializeState(state: WizardState): string {
  const clean = sanitizeState(state);
  return JSON.stringify({ version: 2, state: { ...clean, contact: undefined } });
}
export function deserializeState(raw: string): WizardState | null {
  try {
    const envelope = record(JSON.parse(raw));
    if (envelope.version !== 2 || !envelope.state || typeof envelope.state !== 'object' || Array.isArray(envelope.state)) return null;
    return sanitizeState({ ...record(envelope.state), contact: undefined });
  } catch { return null; }
}
export function loadFromStorage(storage = browserStorage()): WizardState | null {
  if (!storage) return null;
  try { storage.removeItem(LEGACY_STORAGE_KEY); const raw = storage.getItem(STORAGE_KEY); return raw ? deserializeState(raw) : null; } catch { return null; }
}
export function saveToStorage(state: WizardState, storage = browserStorage()): void {
  if (!storage) return;
  try { storage.removeItem(LEGACY_STORAGE_KEY); storage.setItem(STORAGE_KEY, serializeState(state)); } catch { /* Calculator still works when storage is unavailable. */ }
}
export function clearStorage(storage = browserStorage()): void {
  if (!storage) return;
  try { storage.removeItem(STORAGE_KEY); storage.removeItem(LEGACY_STORAGE_KEY); } catch { /* Optional persistence. */ }
}
