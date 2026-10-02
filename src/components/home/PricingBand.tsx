import ProjectInquiryForm from '@/components/shared/ProjectInquiryForm';
import { Reveal } from '../effects/Reveal';

export default function PricingBand() {
  return <section id="tu-proyecto" className="site-container pb-20" aria-labelledby="project-heading"><Reveal className="project-statement">
    <div><p className="eyebrow">TODO EMPIEZA CON UNA IDEA</p><h2 id="project-heading">Tu próximo proyecto.<br /><span>Hablemos de él.</span></h2><p>Una web para dar a conocer tu negocio o una tienda para vender online. Cuéntanos lo que tienes en mente y seguimos la conversación por WhatsApp.</p><p className="project-contact-note">Trato directo. Una propuesta a tu medida.</p></div>
    <ProjectInquiryForm />
  </Reveal></section>;
}
