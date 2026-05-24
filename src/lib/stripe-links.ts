export const STRIPE_LINKS = {
  web: process.env.STRIPE_LINK_PLAN_WEB || 'https://buy.stripe.com/6oUbIU4tW74ee8R5KJ9ws0w',
  tienda: process.env.STRIPE_LINK_PLAN_TIENDA || 'https://buy.stripe.com/aFafZae4wewG2q9a0Z9ws0x',
  ia: process.env.STRIPE_LINK_PLAN_IA || '',
} as const;

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '34684739091';

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}
