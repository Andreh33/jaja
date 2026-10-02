import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Globe2, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/effects/Reveal';
import ProjectInquiryForm from '@/components/shared/ProjectInquiryForm';

export const metadata: Metadata = {
  title: 'Páginas web y tiendas online a medida',
  description: 'Elige una página web o una tienda online. Cuéntanos tu idea y prepara tu consulta para hablar directamente con LATECH por WhatsApp.',
  alternates: { canonical: '/tienda' },
};
export default function TiendaPage() {
  return <><Navbar /><main id="main-content" tabIndex={-1} className="public-interior relative">
    <section className="site-container pt-36 pb-16 md:pt-44"><Reveal><p className="eyebrow">LO QUE PODEMOS CREAR JUNTOS</p><h1 className="mt-6 font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">Tu negocio.<br /><span className="text-[var(--ice)]">Su próximo paso.</span></h1><p className="mt-7 max-w-xl text-base leading-8 text-[var(--text-secondary)]">Una presencia que te represente y que sea fácil de usar. Elige lo que necesitas y cuéntanos por dónde empezamos.</p></Reveal></section>
    <section className="site-container grid gap-6 pb-20 md:grid-cols-2" aria-label="Nuestros servicios">
      {[{href:'/tienda/web',title:'Página web',Icon:Globe2,description:'Presenta tu negocio, explica tus servicios y convierte visitas en conversaciones. Diseño a medida, adaptación móvil y una base sólida para buscadores.'},{href:'/tienda/online',title:'Tienda online',Icon:ShoppingBag,description:'Tus productos en una tienda propia. Catálogo, pedidos y un recorrido de compra sencillo, adaptado a las necesidades de tu negocio.'}].map(({href,title,Icon,description})=><Link key={href} href={href} className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-8"><Icon className="text-[var(--ice)]" size={30}/><h2 className="mt-6 font-display text-3xl font-semibold">{title}</h2><p className="mt-4 leading-7 text-[var(--text-secondary)]">{description}</p><span className="mt-6 inline-flex items-center gap-3 text-sm text-[var(--ice)]">Conocer el servicio <ArrowUpRight size={17}/></span></Link>)}
    </section>
    <section id="proyecto" className="site-container pb-24"><div className="project-statement"><div><p className="eyebrow">DE TU IDEA A UNA CONVERSACIÓN</p><h2>Cuéntanos qué<br /><span>quieres crear.</span></h2><p>Prepararemos una propuesta con el alcance y los tiempos de tu proyecto. Empieza aquí y seguimos por WhatsApp.</p></div><ProjectInquiryForm /></div></section>
  </main><Footer /></>;
}
