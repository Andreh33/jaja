import { Plus } from 'lucide-react';
import { FAQS } from './faq-data';
import { Reveal } from '../effects/Reveal';

export default function FAQSection() {
  return <section className="section-space"><div className="site-container blue-faq">
    <Reveal><p className="eyebrow">06 / TODO CLARO</p><h2>Las buenas ideas<br />empiezan con<br /><span className="muted-heading">una pregunta.</span></h2></Reveal>
    <div>{FAQS.map(({q,a}) => <details key={q}><summary>{q}<Plus size={17} /></summary><p>{a}</p></details>)}</div>
  </div></section>;
}
