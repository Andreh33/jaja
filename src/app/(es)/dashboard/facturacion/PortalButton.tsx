import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';
export default function PortalButton() {
  return <a href={whatsappLink('Hola, necesito ayuda con la facturación de mi proyecto.')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white"><MessageCircle size={16} />Consultar por WhatsApp</a>;
}
