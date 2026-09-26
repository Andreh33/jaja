import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import IntroCinematic from '@/components/effects/IntroCinematic';
import TechMarquee from '@/components/home/TechMarquee';
import ServicesGrid from '@/components/home/ServicesGrid';
import PricingBand from '@/components/home/PricingBand';
import ProcessSection from '@/components/home/ProcessSection';
import SelectedProjects from '@/components/home/SelectedProjects';
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
    'Diseño web con carácter, tiendas online y asistentes de IA para empresas que quieren destacar. Proyectos a medida, trato directo y sin permanencia.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQS)} />
      <IntroCinematic />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="relative">
        <Hero />
        <TechMarquee />
        <SelectedProjects />
        <WordPressCompareSection />
        <ServicesGrid />
        <PricingBand />
        <ProcessSection />
        <PlaygroundSection />
        <FAQSection />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
