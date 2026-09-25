export default function AuroraBackground({ intensity = 'normal' }: { intensity?: 'normal' | 'strong' | 'subtle' }) {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ opacity: intensity === 'subtle' ? .45 : intensity === 'strong' ? 1 : .7, background: 'radial-gradient(ellipse at 10% 10%, rgba(24,64,118,.35), transparent 55%), radial-gradient(ellipse at 90% 65%, rgba(18,55,100,.2), transparent 50%)' }} />;
}
