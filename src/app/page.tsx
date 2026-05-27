import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import TechMarquee from '@/components/home/TechMarquee';
import ScrollManifesto from '@/components/home/ScrollManifesto';
import ServicesGrid from '@/components/home/ServicesGrid';
import ProcessSection from '@/components/home/ProcessSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import FAQSection from '@/components/home/FAQSection';
import CTABanner from '@/components/home/CTABanner';

export default function Home() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="strong" />
      <MouseGlow strong />
      <main className="relative">
        <Hero />
        <TechMarquee />
        <ScrollManifesto />
        <ServicesGrid />
        <ProcessSection />
        <StatsSection />
        <TestimonialsCarousel />
        <FAQSection />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
