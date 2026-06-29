import type { City } from './types';

export const CITIES: City[] = [
  { slug: 'madrid', name: 'Madrid', provincia: 'Madrid', region: 'Comunidad de Madrid', nearby: ['valladolid', 'zaragoza'] },
  { slug: 'barcelona', name: 'Barcelona', provincia: 'Barcelona', region: 'Cataluña', nearby: ['valencia', 'zaragoza'] },
  { slug: 'valencia', name: 'Valencia', provincia: 'Valencia', region: 'Comunidad Valenciana', nearby: ['alicante', 'barcelona'] },
  { slug: 'sevilla', name: 'Sevilla', provincia: 'Sevilla', region: 'Andalucía', nearby: ['cordoba', 'malaga'] },
  { slug: 'malaga', name: 'Málaga', provincia: 'Málaga', region: 'Andalucía', nearby: ['granada', 'cordoba'] },
  { slug: 'zaragoza', name: 'Zaragoza', provincia: 'Zaragoza', region: 'Aragón', nearby: ['madrid', 'barcelona'] },
  { slug: 'murcia', name: 'Murcia', provincia: 'Murcia', region: 'Región de Murcia', nearby: ['alicante', 'granada'] },
  { slug: 'bilbao', name: 'Bilbao', provincia: 'Vizcaya', region: 'País Vasco', nearby: ['valladolid', 'zaragoza'] },
  { slug: 'alicante', name: 'Alicante', provincia: 'Alicante', region: 'Comunidad Valenciana', nearby: ['valencia', 'murcia'] },
  { slug: 'cordoba', name: 'Córdoba', provincia: 'Córdoba', region: 'Andalucía', nearby: ['sevilla', 'malaga'] },
  { slug: 'valladolid', name: 'Valladolid', provincia: 'Valladolid', region: 'Castilla y León', nearby: ['madrid', 'bilbao'] },
  { slug: 'vigo', name: 'Vigo', provincia: 'Pontevedra', region: 'Galicia', nearby: ['a-coruna'] },
  { slug: 'granada', name: 'Granada', provincia: 'Granada', region: 'Andalucía', nearby: ['malaga', 'cordoba'] },
  { slug: 'a-coruna', name: 'A Coruña', provincia: 'A Coruña', region: 'Galicia', nearby: ['vigo'] },
  { slug: 'badajoz', name: 'Badajoz', provincia: 'Badajoz', region: 'Extremadura', nearby: ['sevilla', 'cordoba'] },
];
