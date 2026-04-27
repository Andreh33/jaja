import type { Metadata } from 'next';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PDFViewer from '@/components/shared/PDFViewer';
import { SignatureMarquee } from '@/components/effects/Marquee';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad y tratamiento de datos en Latech.',
};

export default function PrivacidadPage() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <main className="relative z-10 pt-44 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Legal</p>
          <h1 className="mb-10 font-display text-5xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
            Política de privacidad
          </h1>
          <PDFViewer src="/documentos/Privacidad.pdf" title="Política de privacidad" />
        </div>
      </main>
      <Footer />
    </>
  );
}
