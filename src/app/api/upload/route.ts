import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { archivos } from '../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'video/mp4', 'video/quicktime', 'application/pdf', 'application/postscript', 'image/vnd.adobe.photoshop']);
const MAX = 50 * 1024 * 1024;

function categoryFor(mime: string, hint?: string): 'logo' | 'foto' | 'video' | 'documento' | 'otro' {
  if (hint === 'logo' || hint === 'foto' || hint === 'video' || hint === 'documento' || hint === 'otro') return hint;
  if (mime.startsWith('image/')) return 'foto';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'documento';
  return 'otro';
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80);
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const list = await db.select().from(archivos).where(eq(archivos.userId, session.user.id)).orderBy(desc(archivos.uploadedAt));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const userId = session.user.id;

  const fd = await req.formData();
  const files = fd.getAll('file') as File[];
  const categoryHint = (fd.get('category') as string) || undefined;

  if (!files.length) return NextResponse.json({ error: 'Sin archivos' }, { status: 400 });

  const dir = path.join(process.cwd(), 'public', 'uploads', 'clientes', userId);
  await fs.mkdir(dir, { recursive: true });

  const inserted: { id: string; filename: string; url: string }[] = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      continue;
    }
    if (file.size > MAX) continue;

    const buf = Buffer.from(await file.arrayBuffer());
    const ts = Date.now();
    let stored = `${ts}-${safeName(file.name)}`;
    let bytes: Buffer = buf;

    if (file.type.startsWith('image/') && !file.type.includes('svg') && !file.type.includes('gif')) {
      try {
        const out = await sharp(buf).rotate().resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
        bytes = out;
        stored = stored.replace(/\.[^.]+$/, '') + '.jpg';
      } catch {
        // keep original
      }
    }

    await fs.writeFile(path.join(dir, stored), new Uint8Array(bytes));
    const url = `/uploads/clientes/${userId}/${stored}`;
    const cat = categoryFor(file.type, categoryHint);
    const id = crypto.randomUUID();
    await db.insert(archivos).values({
      id,
      userId,
      filename: file.name,
      storedAs: stored,
      mimeType: file.type,
      size: bytes.length,
      category: cat,
      url,
    });
    inserted.push({ id, filename: file.name, url });
  }

  return NextResponse.json({ ok: true, files: inserted });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await req.json();
  const found = await db.select().from(archivos).where(eq(archivos.id, id)).limit(1);
  if (found.length === 0 || found[0].userId !== session.user.id) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }
  const f = found[0];
  try {
    await fs.unlink(path.join(process.cwd(), 'public', 'uploads', 'clientes', f.userId, f.storedAs));
  } catch {}
  await db.delete(archivos).where(eq(archivos.id, id));
  return NextResponse.json({ ok: true });
}
