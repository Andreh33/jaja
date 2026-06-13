'use client';

export default function AuroraBackground({ intensity = 'normal' }: { intensity?: 'normal' | 'strong' | 'subtle' }) {
  const blobOpacity = intensity === 'strong' ? 0.55 : intensity === 'subtle' ? 0.25 : 0.4;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div
        className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full"
        style={{
          background: '#8B5CF6',
          opacity: blobOpacity,
          filter: 'blur(140px)',
          animation: 'blob-1 16s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -right-40 bottom-[10%] h-[640px] w-[640px] rounded-full"
        style={{
          background: '#F97316',
          opacity: blobOpacity * 0.85,
          filter: 'blur(160px)',
          animation: 'blob-2 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute left-[40%] top-[40%] h-[420px] w-[420px] rounded-full"
        style={{
          background: '#FBBF24',
          opacity: blobOpacity * 0.5,
          filter: 'blur(140px)',
          animation: 'blob-3 22s ease-in-out infinite',
        }}
      />
    </div>
  );
}
