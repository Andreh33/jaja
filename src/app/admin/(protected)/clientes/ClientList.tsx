'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

/**
 * Listado de clientes con búsqueda.
 *
 * Dos modos:
 *  - 'client': el server pasa TODA la lista. Filtramos en memoria con
 *    useMemo (instantáneo, sin refetch). Para colecciones < 50.
 *  - 'server': el server ya devuelve la lista filtrada según `?q=`.
 *    El input actualiza la URL con debounce 300ms y el server refetch.
 *    Para colecciones grandes.
 */

export type ClientRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAtMs: number | null;
  filesCount: number;
  services: ('web' | 'tienda' | 'ia')[];
};

type Props =
  | { mode: 'client'; rows: ClientRow[]; total: number; initialQuery?: string }
  | { mode: 'server'; rows: ClientRow[]; total: number; initialQuery: string };

function normalize(s: string): string {
  // toLowerCase + descompone tildes (NFD) + elimina los combining marks U+0300..U+036F.
  // Resultado: "Juán" -> "juan", "JUAN" -> "juan".
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function ClientList(props: Props) {
  const { mode, rows, total } = props;
  const [query, setQuery] = useState(props.initialQuery ?? '');
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // En modo server, propaga el cambio de query al URL con debounce.
  useEffect(() => {
    if (mode !== 'server') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?');
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, router, searchParams]);

  const filtered = useMemo(() => {
    if (mode === 'server') return rows;
    const q = normalize(query.trim());
    if (!q) return rows;
    return rows.filter((r) => {
      const name = normalize(r.name ?? '');
      const email = normalize(r.email);
      return name.includes(q) || email.includes(q);
    });
  }, [rows, query, mode]);

  const fmtDate = (ms: number | null) =>
    ms ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(ms)) : '—';

  return (
    <>
      <div className="mt-6 flex flex-col gap-2 md:max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o email…"
            className="w-full rounded-xl border bg-transparent pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none focus-visible:ring-2"
            style={{ borderColor: 'var(--border-subtle)' }}
            aria-label="Buscar clientes"
          />
        </div>
        <p className="text-[11px] text-white/40">
          Mostrando {filtered.length} de {total} {total === 1 ? 'cliente' : 'clientes'}
          {query.trim() && ` para "${query.trim()}"`}
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b text-left text-[10px] uppercase tracking-wider text-white/40"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <th className="px-5 py-3.5">Cliente</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Teléfono</th>
              <th className="px-5 py-3.5 text-center">Archivos</th>
              <th className="px-5 py-3.5">Servicios</th>
              <th className="px-5 py-3.5">Registrado</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {filtered.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-white/5">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: 'var(--grad-signature)' }}
                    >
                      {(c.name?.[0] || c.email[0]).toUpperCase()}
                    </div>
                    <span className="text-white">{c.name || '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-white/65">{c.email}</td>
                <td className="px-5 py-4 text-white/65">{c.phone || '—'}</td>
                <td className="px-5 py-4 text-center text-white/85">{c.filesCount}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {c.services.includes('web') && (
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-web)' }}>web</span>
                    )}
                    {c.services.includes('tienda') && (
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-shop)' }}>tienda</span>
                    )}
                    {c.services.includes('ia') && (
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-ia)' }}>ia</span>
                    )}
                    {c.services.length === 0 && <span className="text-xs text-white/30">—</span>}
                  </div>
                </td>
                <td className="px-5 py-4 text-white/55">{fmtDate(c.createdAtMs)}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/admin/clientes/${c.id}`} className="text-xs text-white/65 hover:text-white link-underline">
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && total > 0 && (
          <div className="py-12 text-center text-sm text-white/45">
            Sin resultados para &quot;{query.trim()}&quot;.
          </div>
        )}
        {total === 0 && (
          <div className="py-12 text-center text-sm text-white/45">Aún no hay clientes registrados.</div>
        )}
      </div>
    </>
  );
}
