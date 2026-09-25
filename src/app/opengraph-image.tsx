import { ImageResponse } from 'next/og';

export const alt = 'Latech · Diseño web, tiendas online y agentes IA para toda España';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
          padding: '80px',
          backgroundColor: '#030914',
          backgroundImage:
            'radial-gradient(circle at 20% 25%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(circle at 85% 80%, rgba(197,234,255,0.25), transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 110,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-4px',
          }}
        >
          Latech
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 8,
            width: 480,
            height: 10,
            borderRadius: 5,
            backgroundImage: 'linear-gradient(90deg, #3b82f6 0%, #93c5fd 25%, #67c4ff 65%, #c5eaff 100%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            marginTop: 40,
            fontSize: 42,
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          Diseño web · Tiendas online · Agentes IA
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 18,
            fontSize: 30,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Para toda España · Entrega en 24-48h · Sin permanencia
        </div>
      </div>
    ),
    { ...size }
  );
}
