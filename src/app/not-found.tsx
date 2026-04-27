import Link from 'next/link';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import GradientText from '@/components/effects/GradientText';
import MagneticButton from '@/components/effects/MagneticButton';
import { whatsappLink } from '@/lib/stripe-links';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Logo from '@/components/layout/Logo';

export default function NotFound() {
  return (
    <main className="relative min-h-screen">
      <AuroraBackground intensity="strong" />
      <MouseGlow strong />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/"><Logo /></Link>
      </header>
      <div className="relative z-10 flex min-h-[calc(100svh-90px)] flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-white/40">Error 404</p>
        <h1 className="font-display text-[clamp(8rem,28vw,22rem)] leading-none">
          <GradientText as="span">404</GradientText>
        </h1>
        <p className="mt-6 max-w-md text-base text-white/70">
          Esta página se ha perdido en el ciberespacio. O nunca existió.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <MagneticButton href="/">
            <ArrowLeft size={16} /> Volver al inicio
          </MagneticButton>
          <MagneticButton href={whatsappLink('Hola, llegué a una página 404 en latech.es')} target="_blank" rel="noreferrer" variant="secondary">
            <MessageCircle size={16} /> Hablar por WhatsApp
          </MagneticButton>
        </div>
      </div>
    </main>
  );
}
