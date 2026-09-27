import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { and, desc, gt, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tvRemoteSessions as sessions, tvArcadeSessions as arcade, type TvDeviceInfo } from '../../../../../drizzle/schema';
import { tvChannels } from '@/lib/tv-channels';
export const dynamic = 'force-dynamic';
const device = (info: TvDeviceInfo | null) => info ? `${info.device} · ${info.browser} · ${info.os}` : 'No disponible';
const place = (info: TvDeviceInfo | null) => [info?.city, info?.country].filter(Boolean).join(', ') || 'No disponible';
const date = (value: number) => new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(value);
const requestTime = () => Date.now();
export default async function RemoteSessionsPage() {
  // Guard here as well as in the layout: no data query before role verification.
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') redirect('/admin/login');
  const now = requestTime();
  const rows = await db.select({ id: sessions.id, createdAt: sessions.createdAt, pairedAt: sessions.pairedAt, expiresAt: sessions.expiresAt, revokedAt: sessions.revokedAt, hostSeenAt: sessions.hostSeenAt,
    controllerSeenAt: sessions.controllerSeenAt, hostInfo: sessions.hostInfo, controllerInfo: sessions.controllerInfo, controllerName: sessions.controllerName, controllerUserId: sessions.controllerUserId, commandCount: sessions.commandCount, channel: sessions.displayedChannel })
    .from(sessions).where(and(isNotNull(sessions.pairedAt), gt(sessions.createdAt, now - 30 * 86_400_000))).orderBy(desc(sessions.pairedAt)).limit(200).catch(() => null);
  const unavailable = rows === null;
  // Project only operational metadata; never load credential hashes or SDP here.
  const arcadeRows = await db.select({ id: arcade.id, createdAt: arcade.createdAt, expiresAt: arcade.expiresAt, mode: arcade.mode, version: arcade.version,
    firstName: sql<string | null>`json_extract(${arcade.seats}, '$[0].name')`, secondName: sql<string | null>`json_extract(${arcade.seats}, '$[1].name')`,
    firstInfo: sql<string | null>`json_extract(${arcade.seats}, '$[0].info')`, secondInfo: sql<string | null>`json_extract(${arcade.seats}, '$[1].info')`,
    firstJoined: sql<number | null>`json_extract(${arcade.seats}, '$[0].joinedAt')`, secondJoined: sql<number | null>`json_extract(${arcade.seats}, '$[1].joinedAt')`,
  }).from(arcade).where(gt(arcade.createdAt, now - 30 * 86400000)).orderBy(desc(arcade.createdAt)).limit(100).catch(() => null);
  const parseInfo = (value: string | null): TvDeviceInfo | null => { try { return value ? JSON.parse(value) : null; } catch { return null; } };
  return <div className="px-6 py-8 md:px-10 md:py-12">
    <Link href="/admin" className="text-sm text-sky-300">← Volver al CRM</Link>
    <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">Mandos QR</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Conexiones de los últimos 30 días. Ubicación aproximada facilitada por el servidor; no identifica por sí sola a una persona. Los visitantes sin cuenta aparecen como anónimos.</p>
    {unavailable ? <p role="status" className="mt-8 rounded-xl border border-amber-300/25 p-5 text-amber-200">El registro de mandos aún no está disponible. Falta activar o conectar su almacenamiento.</p> : !rows.length ? <p className="mt-8 rounded-xl border border-white/15 p-7 text-white/60">Todavía no se ha conectado ningún mando QR.</p> : <div className="mt-8 overflow-x-auto rounded-xl border border-white/15"><table className="w-full min-w-[960px] text-left text-sm"><caption className="sr-only">Últimas 200 sesiones de mando QR conectadas</caption><thead className="bg-white/5 text-xs text-white/55"><tr>{['Sesión / visitante', 'Conexión', 'Móvil / navegador', 'Desde (aprox.)', 'Televisión', 'Uso', 'Estado'].map(label => <th key={label} scope="col" className="px-4 py-4 font-medium">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-white/10 align-top"><td className="px-4 py-4"><strong className="block text-white">{row.controllerName || 'Visitante anónimo'}</strong><span className="mt-1 block font-mono text-xs text-white/40">{row.id.slice(0, 8)}</span>{row.controllerUserId && <span className="mt-1 block text-xs text-sky-300">Cuenta identificada al conectar</span>}</td><td className="px-4 py-4 text-white/70">{date(row.pairedAt!)}<small className="mt-2 block text-white/40">Última señal: {row.controllerSeenAt ? date(row.controllerSeenAt) : '—'}</small></td><td className="px-4 py-4 text-white/70">{device(row.controllerInfo)}</td><td className="px-4 py-4 text-white/70">{place(row.controllerInfo)}</td><td className="px-4 py-4 text-white/60">{device(row.hostInfo)}<small className="mt-2 block">{place(row.hostInfo)}</small></td><td className="px-4 py-4 text-white/70">{row.commandCount} órdenes<small className="mt-2 block">{tvChannels.find(item => item.id === row.channel)?.name ?? 'Studio'}</small></td><td className="px-4 py-4 text-xs text-sky-200">{row.revokedAt ? 'Desconectada' : row.expiresAt <= now ? 'Caducada' : now - Math.min(row.hostSeenAt, row.controllerSeenAt ?? 0) > 18_000 ? 'Sin señal' : 'Conectada'}</td></tr>)}</tbody></table></div>}
    <h2 className="mt-12 text-2xl font-bold text-white">Arcade · dos mandos</h2>
    {!arcadeRows ? <p className="mt-4 text-sm text-amber-200">El almacenamiento del arcade aún no está disponible.</p> : !arcadeRows.some(row => row.firstJoined || row.secondJoined) ? <p className="mt-4 text-sm text-white/50">No hay mandos de juego conectados todavía.</p> : <div className="mt-5 overflow-x-auto rounded-xl border border-white/15"><table className="w-full min-w-[720px] text-left text-sm"><caption className="sr-only">Sesiones QR del arcade en los últimos 30 días</caption><thead className="bg-white/5 text-white/55"><tr>{['Sala / juego', 'Jugador', 'Conexión', 'Dispositivo', 'Desde (aprox.)'].map(label => <th className="px-4 py-4" key={label} scope="col">{label}</th>)}</tr></thead><tbody>{arcadeRows.flatMap(row => [0, 1].flatMap(slot => { const joined = slot === 0 ? row.firstJoined : row.secondJoined; if (!joined) return []; const info = parseInfo(slot === 0 ? row.firstInfo : row.secondInfo); return <tr key={`${row.id}-${slot}`} className="border-t border-white/10 align-top text-white/70"><td className="px-4 py-4">{row.id.slice(0, 8)}<small className="block text-sky-200">{row.mode} · {row.expiresAt > now ? 'Sala vigente' : 'Sala finalizada'}</small></td><td className="px-4 py-4">J{slot + 1} · {(slot === 0 ? row.firstName : row.secondName) || 'Visitante anónimo'}</td><td className="px-4 py-4">{date(joined)}</td><td className="px-4 py-4">{device(info)}</td><td className="px-4 py-4">{place(info)}</td></tr>; }))}</tbody></table></div>}
  </div>;
}
