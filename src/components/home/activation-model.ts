export const activationBusinesses = ['restaurant', 'shop', 'company'] as const;
export type ActivationBusiness = (typeof activationBusinesses)[number];
export type ActivationView = 'home' | 'catalog' | 'detail' | 'bag' | 'booking' | 'services';

export const activationConcepts = {
  restaurant: { label: 'Restaurante', brand: 'BRASA', descriptor: 'COCINA CON CALMA', title: ['Una mesa.', 'Mil motivos.'], copy: 'Producto de temporada. Fuego lento. Y tiempo para disfrutarlo.', action: 'Descubrir la carta', detail: 'El sabor empieza antes del primer bocado.' },
  shop: { label: 'Tienda', brand: 'FORMA', descriptor: 'OBJETOS PARA QUEDARSE', title: ['Menos cosas.', 'Más sentido.'], copy: 'Piezas para vivir despacio. Formas honestas que hacen tuyo un espacio.', action: 'Explorar la colección', detail: 'Cada objeto, con su propio lugar.' },
  company: { label: 'Empresa', brand: 'NORTE', descriptor: 'ARQUITECTURA COTIDIANA', title: ['Tu espacio.', 'Otra vida.'], copy: 'Luz, materia y una manera distinta de habitar lo cotidiano.', action: 'Conocer el estudio', detail: 'Los buenos espacios empiezan por escucharte.' },
} as const;

export const activationProducts = [
  { id: 'arc', name: 'Lámpara Arco', description: 'Una luz cálida. Una silueta que acompaña.', price: 8900, kind: 'lamp' },
  { id: 'vase', name: 'Jarrón Origen', description: 'Cerámica y una pequeña imperfección intencionada.', price: 4200, kind: 'vase' },
  { id: 'bowl', name: 'Cuenco Calma', description: 'Un gesto sencillo para cada día.', price: 2800, kind: 'bowl' },
] as const;
export const bookingDays = ['Viernes', 'Sábado', 'Domingo'] as const;
export const bookingTimes = ['13:30', '14:30', '20:30', '21:30'] as const;
export const companyServices = ['Mi vivienda', 'Mi negocio', 'Un espacio nuevo'] as const;
export const activationPrice = (cents: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);

export type ActivationState = {
  business: ActivationBusiness;
  progress: number;
  exploring: boolean;
  view: ActivationView;
  product: string;
  bag: Record<string, number>;
  day: string;
  time: string;
  guests: number;
  service: string;
  confirmed: boolean;
};
export const initialActivation: ActivationState = { business: 'restaurant', progress: 35, exploring: false, view: 'home', product: 'arc', bag: {}, day: 'Sábado', time: '20:30', guests: 2, service: 'Mi vivienda', confirmed: false };
export type ActivationAction =
  | { type: 'business'; value: ActivationBusiness }
  | { type: 'progress'; value: number }
  | { type: 'explore' } | { type: 'compare' }
  | { type: 'view'; value: ActivationView }
  | { type: 'product'; value: string }
  | { type: 'quantity'; id: string; delta: number }
  | { type: 'booking'; field: 'day' | 'time' | 'guests'; value: string | number }
  | { type: 'service'; value: string }
  | { type: 'confirm' };

export function activationTotal(bag: Record<string, number>) {
  return activationProducts.reduce((sum, item) => sum + item.price * (Number.isInteger(bag[item.id]) ? Math.min(9, Math.max(0, bag[item.id])) : 0), 0);
}

export function activationReducer(state: ActivationState, action: ActivationAction): ActivationState {
  switch (action.type) {
    case 'business': return activationBusinesses.includes(action.value) && action.value !== state.business ? { ...initialActivation, business: action.value, progress: state.progress, bag: {} } : state;
    case 'progress': return Number.isFinite(action.value) ? { ...state, progress: Math.min(100, Math.max(0, Math.round(action.value))), exploring: false, confirmed: false } : state;
    case 'explore': return state.progress === 100 ? { ...state, exploring: true, view: 'home', confirmed: false } : state;
    case 'compare': return { ...state, exploring: false, confirmed: false };
    case 'view': {
      const allowed: ActivationView[] = state.business === 'restaurant' ? ['home', 'catalog', 'booking'] : state.business === 'shop' ? ['home', 'catalog', 'detail', 'bag'] : ['home', 'services'];
      return state.exploring && allowed.includes(action.value) ? { ...state, view: action.value, confirmed: false } : state;
    }
    case 'product': return state.exploring && state.business === 'shop' && activationProducts.some(item => item.id === action.value) ? { ...state, product: action.value, view: 'detail', confirmed: false } : state;
    case 'quantity': {
      if (!state.exploring || state.business !== 'shop' || !Number.isInteger(action.delta) || !activationProducts.some(item => item.id === action.id)) return state;
      const quantity = Math.min(9, Math.max(0, (state.bag[action.id] || 0) + action.delta));
      const bag = { ...state.bag, [action.id]: quantity };
      if (!quantity) delete bag[action.id];
      return { ...state, bag, confirmed: false };
    }
    case 'booking': {
      if (!state.exploring || state.business !== 'restaurant') return state;
      const valid = action.field === 'day' ? bookingDays.some(day => day === action.value) : action.field === 'time' ? bookingTimes.some(time => time === action.value) : typeof action.value === 'number' && Number.isInteger(action.value) && action.value >= 1 && action.value <= 6;
      return valid ? { ...state, [action.field]: action.value, confirmed: false } : state;
    }
    case 'service': return state.exploring && state.business === 'company' && companyServices.some(value => value === action.value) ? { ...state, service: action.value, confirmed: false } : state;
    case 'confirm': return state.exploring && (state.view === 'booking' || state.view === 'services' || (state.view === 'bag' && activationTotal(state.bag) > 0)) ? { ...state, confirmed: true } : state;
  }
}
