// Minimal markdown to HTML converter — supports headings, paragraphs, lists, bold, italic, code, links, blockquotes.
// For more advanced needs, swap with `marked` or `remark`.

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string) {
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic *text*
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // inline code `code`
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

export function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^### /.test(line)) {
      out.push(`<h3>${inline(escape(line.replace(/^### /, '')))}</h3>`);
      i++;
      continue;
    }
    if (/^## /.test(line)) {
      out.push(`<h2>${inline(escape(line.replace(/^## /, '')))}</h2>`);
      i++;
      continue;
    }
    if (/^# /.test(line)) {
      out.push(`<h1>${inline(escape(line.replace(/^# /, '')))}</h1>`);
      i++;
      continue;
    }
    if (/^> /.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^> /.test(lines[i])) {
        buf.push(lines[i].replace(/^> /, ''));
        i++;
      }
      out.push(`<blockquote>${inline(escape(buf.join(' ')))}</blockquote>`);
      continue;
    }
    if (/^[-*] /.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        buf.push(`<li>${inline(escape(lines[i].replace(/^[-*] /, '')))}</li>`);
        i++;
      }
      out.push(`<ul>${buf.join('')}</ul>`);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        buf.push(`<li>${inline(escape(lines[i].replace(/^\d+\. /, '')))}</li>`);
        i++;
      }
      out.push(`<ol>${buf.join('')}</ol>`);
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    // paragraph: gather until blank line
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,3} |> |[-*] |\d+\. )/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(escape(buf.join(' ')))}</p>`);
  }
  return out.join('\n');
}

export function extractHeadings(md: string): { id: string; text: string; level: number }[] {
  const out: { id: string; text: string; level: number }[] = [];
  for (const line of md.split('\n')) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (m) {
      const text = m[2].trim();
      const id = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      out.push({ id, text, level: m[1].length });
    }
  }
  return out;
}
