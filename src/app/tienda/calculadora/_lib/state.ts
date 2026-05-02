import {
  CATALOG,
  type Cadence,
  type CatalogItem,
  pickAiPhone,
  pickAiWeb,
  pickBlogPost,
  pickHosting,
  pickSocial,
  pickTienda,
  pickWebCreation,
} from '@/config/catalog';

export const TOTAL_STEPS = 9;

export type AiAgent = 'none' | 'web' | 'phone';

export type ContactState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  /** null = aún no comprobado; true = email existente (login); false = nuevo (registro). */
  isExistingEmail: boolean | null;
};

export type WizardState = {
  step: number;
  webPagesOver8: boolean;
  hostingCadence: Cadence;
  tienda: boolean;
  social: boolean;
  aiAgent: AiAgent;
  blogPosts: number;
  logo: boolean;
  contact: ContactState;
};

export const INITIAL_STATE: WizardState = {
  step: 1,
  webPagesOver8: false,
  hostingCadence: 'monthly',
  tienda: false,
  social: false,
  aiAgent: 'none',
  blogPosts: 0,
  logo: false,
  contact: {
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    isExistingEmail: null,
  },
};

export type WizardAction =
  | { type: 'GOTO'; step: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SET_WEB_OVER8'; value: boolean }
  | { type: 'SET_CADENCE'; value: Cadence }
  | { type: 'SET_TIENDA'; value: boolean }
  | { type: 'SET_SOCIAL'; value: boolean }
  | { type: 'SET_AI'; value: AiAgent }
  | { type: 'SET_BLOG_POSTS'; value: number }
  | { type: 'SET_LOGO'; value: boolean }
  | { type: 'SET_CONTACT'; patch: Partial<ContactState> }
  | { type: 'HYDRATE'; state: WizardState }
  | { type: 'RESET' };

export function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'GOTO':
      return { ...state, step: clampStep(action.step) };
    case 'NEXT':
      return { ...state, step: clampStep(state.step + 1) };
    case 'PREV':
      return { ...state, step: clampStep(state.step - 1) };
    case 'SET_WEB_OVER8':
      return { ...state, webPagesOver8: action.value };
    case 'SET_CADENCE':
      return { ...state, hostingCadence: action.value };
    case 'SET_TIENDA':
      return { ...state, tienda: action.value };
    case 'SET_SOCIAL':
      return { ...state, social: action.value };
    case 'SET_AI':
      return { ...state, aiAgent: action.value };
    case 'SET_BLOG_POSTS': {
      const n = Math.max(0, Math.min(100, Math.floor(Number.isFinite(action.value) ? action.value : 0)));
      return { ...state, blogPosts: n };
    }
    case 'SET_LOGO':
      return { ...state, logo: action.value };
    case 'SET_CONTACT':
      return { ...state, contact: { ...state.contact, ...action.patch } };
    case 'HYDRATE':
      return action.state;
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

function clampStep(n: number): number {
  if (n < 1) return 1;
  if (n > TOTAL_STEPS) return TOTAL_STEPS;
  return n;
}

/* ---------- Validación ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s]{6,20}$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function isStepValid(step: number, s: WizardState): boolean {
  switch (step) {
    case 1:
    case 2:
      return true; // forzados con default; siempre válidos
    case 3:
    case 4:
    case 5:
      return true;
    case 6:
      return Number.isInteger(s.blogPosts) && s.blogPosts >= 0 && s.blogPosts <= 100;
    case 7:
      return true; // sí/no, ambos válidos
    case 8: {
      const c = s.contact;
      if (!c.name.trim()) return false;
      if (!EMAIL_RE.test(c.email.trim())) return false;
      if (!PHONE_RE.test(c.phone.trim())) return false;
      if (!c.acceptTerms) return false;
      // Contraseña
      if (!PASSWORD_RE.test(c.password)) return false;
      // Si NO existe (registro) → confirmar contraseña
      if (c.isExistingEmail === false && c.password !== c.confirmPassword) return false;
      return true;
    }
    case 9:
      return true;
    default:
      return false;
  }
}

/* ---------- Carrito derivado ---------- */

export type CartLine = {
  catalogId: string;
  item: CatalogItem;
  quantity: number;
  /** Total en céntimos para esa línea (amount * quantity). */
  lineTotal: number;
};

export type Cart = {
  oneTime: CartLine[];
  recurring: CartLine[];
  oneTimeTotal: number;
  recurringTotal: number;
  /** Total a pagar HOY = oneTime + primer cargo recurrente. */
  todayTotal: number;
  /** Cadencia activa, derivada del paso 2. */
  cadence: Cadence;
};

export function buildCart(s: WizardState): Cart {
  const cadence = s.hostingCadence;
  const oneTime: CartLine[] = [];
  const recurring: CartLine[] = [];

  // Paso 1: web (forzada)
  const webItem = pickWebCreation(s.webPagesOver8);
  oneTime.push(line(webItem, 1));

  // Paso 2: hosting (forzado)
  recurring.push(line(pickHosting(cadence), 1));

  // Paso 3: tienda
  if (s.tienda) recurring.push(line(pickTienda(cadence), 1));

  // Paso 4: redes
  if (s.social) recurring.push(line(pickSocial(cadence), 1));

  // Paso 5: agente IA
  if (s.aiAgent === 'web') recurring.push(line(pickAiWeb(cadence), 1));
  if (s.aiAgent === 'phone') recurring.push(line(pickAiPhone(cadence), 1));

  // Paso 6: blog (0 = gratis, no se añade)
  if (s.blogPosts > 0) recurring.push(line(pickBlogPost(cadence), s.blogPosts));

  // Paso 7: logo
  if (s.logo) oneTime.push(line(CATALOG.logo, 1));

  const oneTimeTotal = oneTime.reduce((a, l) => a + l.lineTotal, 0);
  const recurringTotal = recurring.reduce((a, l) => a + l.lineTotal, 0);

  return {
    oneTime,
    recurring,
    oneTimeTotal,
    recurringTotal,
    todayTotal: oneTimeTotal + recurringTotal,
    cadence,
  };
}

function line(item: CatalogItem, quantity: number): CartLine {
  return {
    catalogId: item.id,
    item,
    quantity,
    lineTotal: item.amount * quantity,
  };
}

/* ---------- Persistencia (sessionStorage) ---------- */

export const STORAGE_KEY = 'calculator_wizard_v1';

export function loadFromStorage(): WizardState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    // Merge defensivo con INITIAL_STATE para tolerar schema drift.
    return {
      ...INITIAL_STATE,
      ...parsed,
      contact: { ...INITIAL_STATE.contact, ...(parsed.contact || {}) },
    };
  } catch {
    return null;
  }
}

export function saveToStorage(state: WizardState): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
