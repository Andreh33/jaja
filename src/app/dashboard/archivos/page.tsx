import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { archivos } from '../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import FileUploader from '@/components/dashboard/FileUploader';
import FileGallery from '@/components/dashboard/FileGallery';

export const dynamic = 'force-dynamic';

export default async function ArchivosPage() {
  const session = await auth();
  const files = await db.select().from(archivos).where(eq(archivos.userId, session!.user.id)).orderBy(desc(archivos.uploadedAt));

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Mis archivos
      </h1>
      <p className="mt-2 text-sm text-white/55">Sube los logos, fotos, vídeos y documentos de tu negocio. Los usaremos para crear tu web.</p>

      <div className="mt-8 space-y-6">
        <FileUploader />
        <FileGallery files={files} />
      </div>
    </div>
  );
}
