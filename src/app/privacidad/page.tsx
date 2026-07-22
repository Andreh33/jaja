import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import AuroraBackground from '@/components/effects/AuroraBackground';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PDFViewer from '@/components/shared/PDFViewer';
import { SignatureMarquee } from '@/components/effects/Marquee';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad y tratamiento de datos en Latech.',
  alternates: { canonical: '/privacidad' },
};

export default function PrivacidadPage() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <main className="relative z-10 pt-28 pb-24 md:pt-44">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Legal</p>
          <h1 className="mb-10 font-display text-3xl md:text-5xl lg:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
            Política de privacidad
          </h1>
          <PDFViewer src="/documentos/Privacidad.pdf" title="Política de privacidad" />

          {/* === Sección específica del portal de empleo === */}
          <section
            id="candidatos"
            className="mt-12 scroll-mt-32 rounded-2xl glass p-6 md:p-10"
            aria-labelledby="candidatos-title"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <h2
              id="candidatos-title"
              className="font-display text-2xl text-white md:text-3xl lg:text-4xl"
              style={{ letterSpacing: '-0.03em', fontWeight: 800 }}
            >
              Tratamiento de datos en procesos de selección
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/80 md:text-base">
              Cuando envías una candidatura a través de nuestro portal de empleo (
              <Link
                href="/empleo"
                className="underline underline-offset-2 transition-colors hover:text-white"
                style={{ color: 'var(--accent-calc)' }}
              >
                /empleo
              </Link>
              ), recogemos y tratamos los siguientes datos personales con la base
              legal de tu consentimiento expreso.
            </p>

            <Block title="Datos que recogemos">
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-white/75 md:text-base">
                <li>Nombre y apellidos</li>
                <li>Correo electrónico</li>
                <li>Teléfono</li>
                <li>Ciudad de residencia</li>
                <li>Mensaje libre que decidas incluir</li>
                <li>Currículum vitae (archivo en formato PDF, Word o imagen)</li>
                <li>Información sobre la oferta a la que aplicas (si procede)</li>
              </ul>
            </Block>

            <Block title="Finalidad">
              <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                Estos datos se tratan exclusivamente para evaluar tu candidatura en
                los procesos de selección activos en Latech. No se utilizarán para
                ningún otro fin, ni se compartirán con terceros ajenos a la empresa.
              </p>
            </Block>

            <Block title="Plazo de conservación">
              <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                Conservamos tus datos durante un máximo de{' '}
                <strong className="text-white">30 días</strong> desde la fecha de
                recepción de tu candidatura, salvo que resultes contratado, en cuyo
                caso pasarán a formar parte de tu expediente laboral conforme a la
                legislación aplicable. Transcurridos esos 30 días, tu candidatura y
                tu currículum se eliminan automáticamente de nuestros sistemas,
                incluido el almacenamiento de archivos.
              </p>
            </Block>

            <Block title="Quién accede a tus datos">
              <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                Únicamente el personal autorizado de Latech responsable de los
                procesos de selección. No realizamos transferencias internacionales
                de tus datos. No utilizamos tus datos para perfilado, decisiones
                automatizadas, ni fines comerciales o publicitarios.
              </p>
            </Block>

            <Block title="Tus derechos">
              <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                Conforme al RGPD y la LOPDGDD, en cualquier momento puedes ejercer
                tus derechos de acceso, rectificación, supresión, oposición,
                limitación del tratamiento y portabilidad escribiéndonos a{' '}
                <a
                  href="mailto:info@serviciosonlineweb.com"
                  className="underline underline-offset-2 transition-colors hover:text-white"
                  style={{ color: 'var(--accent-calc)' }}
                >
                  info@serviciosonlineweb.com
                </a>
                . También tienes derecho a presentar una reclamación ante la Agencia
                Española de Protección de Datos (
                <a
                  href="https://www.aepd.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-white"
                  style={{ color: 'var(--accent-calc)' }}
                >
                  www.aepd.es
                </a>
                ) si consideras que el tratamiento no se ajusta a la normativa.
              </p>
            </Block>

            <Block title="Consentimiento">
              <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                Al marcar la casilla de aceptación en el formulario de candidatura,
                confirmas que has leído este apartado y otorgas tu consentimiento
                expreso al tratamiento descrito.
              </p>
            </Block>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{title}</h3>
      {children}
    </div>
  );
}
