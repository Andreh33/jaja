export default function AuroraBackground({ intensity = 'normal' }: { intensity?: 'normal' | 'strong' | 'subtle' }) {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ opacity: intensity === 'subtle' ? .45 : intensity === 'strong' ? 1 : .7, background: 'radial-gradient(ellipse at 10% 10%, rgba(82,217,245,.08), transparent 55%), radial-gradient(ellipse at 90% 65%, rgba(82,217,245,.05), transparent 50%)' }} />;
}
