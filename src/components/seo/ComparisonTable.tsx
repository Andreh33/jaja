/**
 * Tabla de datos citable (3 columnas) para las páginas que ya rankean. Formato
 * que gana snippet de tabla y que la IA extrae como dato. Server component sin
 * JS. El wrapper permite scroll horizontal en móvil sin romper el layout.
 */
export default function ComparisonTable({
  headers,
  rows,
  caption,
}: {
  headers: [string, string, string];
  rows: [string, string, string][];
  caption?: string;
}) {
  return (
    <div
      className="overflow-x-auto rounded-2xl"
      style={{ border: '1px solid var(--border-subtle)', WebkitOverflowScrolling: 'touch' }}
    >
      <table className="w-full border-collapse text-sm" style={{ minWidth: '30rem' }}>
        {caption && (
          <caption className="px-4 pt-4 text-left text-xs uppercase tracking-[0.2em] text-white/40">
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-left font-display font-bold text-white"
                style={{ background: 'var(--bg-elevated)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-4 py-3 align-top"
                  style={{
                    borderTop: ri === 0 ? 'none' : '1px solid var(--border-subtle)',
                    color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: ci === 0 ? 600 : 400,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
