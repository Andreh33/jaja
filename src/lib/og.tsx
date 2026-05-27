import { ImageResponse } from 'next/og';

/** Tamaño estándar de Open Graph / Twitter. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

// Carga de la fuente de marca (Syne 800) para la imagen. Si falla (build sin
// red, CDN caído…), se usa la fuente por defecto: la OG sigue generándose.
let synePromise: Promise<ArrayBuffer | null> | null = null;
function loadSyne(): Promise<ArrayBuffer | null> {
  if (!synePromise) {
    synePromise = fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/syne@5/files/syne-latin-800-normal.woff',
    )
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
  }
  return synePromise;
}

/**
 * Imagen OG de marca de Latech: fondo `#07050E` con glow morado + naranja,
 * marca arriba, kicker + título grande, y barra del gradiente firma.
 */
export async function renderBrandOG({ kicker, title }: { kicker?: string; title: string }) {
  const syne = await loadSyne();
  const fontFamily = syne ? 'Syne' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          backgroundColor: '#07050E',
          backgroundImage:
            'linear-gradient(135deg, rgba(139,92,246,0.28), rgba(7,5,14,0) 42%), linear-gradient(315deg, rgba(249,115,22,0.20), rgba(7,5,14,0) 42%)',
          color: '#F8F7FB',
          fontFamily,
        }}
      >
        {/* Marca */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: 'linear-gradient(135deg,#8B5CF6,#F97316,#FBBF24)',
              color: '#07050E',
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            L
          </div>
          <div style={{ display: 'flex', marginLeft: 18, fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Latech
          </div>
        </div>

        {/* Título */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {kicker ? (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#B5B0C5',
                textTransform: 'uppercase',
                letterSpacing: 5,
                marginBottom: 22,
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 40 }}>
            <div
              style={{
                width: 130,
                height: 6,
                borderRadius: 3,
                backgroundImage: 'linear-gradient(90deg,#8B5CF6,#F97316,#FBBF24)',
              }}
            />
            <div style={{ display: 'flex', marginLeft: 20, fontSize: 24, color: '#6B6580' }}>
              serviciosonlineweb.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: syne ? [{ name: 'Syne', data: syne, weight: 800 as const, style: 'normal' as const }] : undefined,
    },
  );
}
