export type ProjectType = 'web' | 'tienda';
export type ProjectInquiry = { type: ProjectType; name: string; business: string; message: string };
export function projectInquiryMessage(inquiry: ProjectInquiry) {
  return [
    'Hola, LATECH. Quiero hablar de mi proyecto.',
    `Necesito: ${inquiry.type === 'tienda' ? 'Tienda online' : 'Página web'}`,
    `Nombre: ${inquiry.name.trim()}`,
    ...(inquiry.business.trim() ? [`Negocio: ${inquiry.business.trim()}`] : []),
    `Mi idea: ${inquiry.message.trim()}`,
  ].join('\n\n');
}
