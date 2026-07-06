import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Plantilla compartida para las imágenes Open Graph dinámicas (PNG 1200x630).
 * La usan los `opengraph-image.tsx` de posts y landings locales para que
 * cada URL comparta una tarjeta propia (los SVG de /og no los aceptan
 * WhatsApp, LinkedIn ni X).
 */
export function brandedOgImage(opts: { title: string; subtitle?: string; badge?: string }) {
  const { title, subtitle, badge } = opts;
  const titleSize = title.length > 70 ? 52 : title.length > 40 ? 64 : 80;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '72px 80px',
          backgroundColor: '#07050E',
          backgroundImage:
            'radial-gradient(circle at 20% 25%, rgba(139,92,246,0.35), transparent 55%), radial-gradient(circle at 85% 80%, rgba(251,191,36,0.25), transparent 50%)',
        }}
      >
        {badge ? (
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 600,
              color: '#C4B5FD',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              marginBottom: 28,
            }}
          >
            {badge}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            fontSize: titleSize,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-2px',
            lineHeight: 1.08,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 30,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: 980,
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 'auto',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-1px' }}>
            Latech
          </div>
          <div
            style={{
              display: 'flex',
              width: 220,
              height: 8,
              borderRadius: 4,
              backgroundImage:
                'linear-gradient(90deg, #8B5CF6 0%, #C084FC 25%, #F97316 65%, #FBBF24 100%)',
            }}
          />
          <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>
            serviciosonlineweb.com
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
