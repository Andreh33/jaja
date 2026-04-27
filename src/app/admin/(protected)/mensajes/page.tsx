import { db } from '@/lib/db';
import { contactMessages } from '../../../../../drizzle/schema';
import { desc } from 'drizzle-orm';
import MensajesClient from './MensajesClient';

export const dynamic = 'force-dynamic';

export default async function AdminMensajesPage() {
  const all = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Mensajes
      </h1>
      <p className="mt-2 text-sm text-white/55">Mensajes recibidos del formulario de contacto.</p>
      <div className="mt-8">
        <MensajesClient initial={all} />
      </div>
    </div>
  );
}
