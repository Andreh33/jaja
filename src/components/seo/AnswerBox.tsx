import type { ReactNode } from 'react';

/**
 * Bloque de "respuesta directa" (answer-first, 40-60 palabras) bajo el H2
 * principal de las páginas que ya rankean. Es el formato que gana el featured
 * snippet y que los motores de IA extraen para citar. Server component sin JS.
 */
export default function AnswerBox({
  question,
  children,
}: {
  question?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--purple-400)',
      }}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {question ?? 'En resumen'}
      </p>
      <p className="text-base leading-relaxed text-white/80">{children}</p>
    </div>
  );
}
