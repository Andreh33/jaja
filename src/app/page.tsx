import type { Metadata } from 'next';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Breathe from '@/components/effects/Breathe';
import IntroCinematic from '@/components/effects/IntroCinematic';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import TechMarquee from '@/components/home/TechMarquee';
import ServicesGrid from '@/components/home/ServicesGrid';
import ProcessSection from '@/components/home/ProcessSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import FAQSection from '@/components/home/FAQSection';
import CTABanner from '@/components/home/CTABanner';
import WordPressCompareSection from '@/components/home/WordPressCompareSection';
import PlaygroundSection from '@/components/home/playground/PlaygroundSection';
import JsonLd from '@/components/seo/JsonLd';
import { FAQS } from '@/components/home/faq-data';
import { faqJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: 'Latech · Diseño web, tiendas online y agentes IA en España' },
  description:
    'Diseño web profesional, tiendas online y agentes de IA con n8n para empresas de toda España. Entrega en 24-48h, reuniones por videollamada, sin permanencia.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQS)} />
      <IntroCinematic />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="strong" />
      <MouseGlow strong />
      <main className="relative">
        <Hero />
        <TechMarquee />
        <Breathe><WordPressCompareSection /></Breathe>
        <Breathe><ServicesGrid /></Breathe>
        <Breathe><ProcessSection /></Breathe>
        <PlaygroundSection />
        <Breathe><StatsSection /></Breathe>
        <Breathe><TestimonialsCarousel /></Breathe>
        <Breathe><FAQSection /></Breathe>
        <Breathe><CTABanner /></Breathe>
      </main>
      <Footer />
    </>
  );
}
