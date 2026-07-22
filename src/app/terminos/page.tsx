import type { Metadata } from 'next';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PDFViewer from '@/components/shared/PDFViewer';
import { SignatureMarquee } from '@/components/effects/Marquee';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones del servicio de Latech.',
  alternates: { canonical: '/terminos' },
};

export default function TerminosPage() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <main className="relative z-10 pt-44 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Legal</p>
          <h1 className="mb-10 font-display text-5xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
            Términos y condiciones
          </h1>
          <PDFViewer src="/documentos/terminos.pdf" title="Términos y condiciones" />
        </div>
      </main>
      <Footer />
    </>
  );
}
