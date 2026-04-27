import SeguridadForm from './SeguridadForm';

export const dynamic = 'force-dynamic';

export default function SeguridadPage() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Seguridad
      </h1>
      <p className="mt-2 text-sm text-white/55">Cambia tu contraseña y gestiona el acceso a tu cuenta.</p>
      <div className="mt-8 max-w-2xl">
        <SeguridadForm />
      </div>
    </div>
  );
}
