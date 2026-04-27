import PostEditor from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default function NuevoPostPage() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Nuevo post
      </h1>
      <p className="mt-2 text-sm text-white/55">Escribe en markdown. Guarda como borrador o publica directamente.</p>
      <div className="mt-8">
        <PostEditor />
      </div>
    </div>
  );
}
