'use client';

import { Download } from 'lucide-react';

export default function PDFViewer({ src, title }: { src: string; title: string }) {
  return (
    <div className="rounded-3xl glass overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <h2 className="font-mono text-xs uppercase tracking-wider text-white/60">{title}</h2>
        <a
          href={src}
          download
          className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-white/80 hover:text-white"
        >
          <Download size={12} /> Descargar PDF
        </a>
      </div>
      <object data={src} type="application/pdf" className="h-[80vh] w-full bg-white/5">
        <embed src={src} type="application/pdf" className="h-full w-full" />
        <p className="p-8 text-sm text-white/60">
          Tu navegador no soporta visualización de PDF embebida.{' '}
          <a className="link-underline text-white" href={src} download>Descarga el PDF aquí</a>.
        </p>
      </object>
    </div>
  );
}
