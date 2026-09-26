import { accents, directionLabels, normalizeStudio, type StudioSettings } from './studio-model';

export async function downloadStudioPoster(value: StudioSettings): Promise<void> {
  const s = normalizeStudio(value);
  const canvas = document.createElement('canvas');
  canvas.width = 1600; canvas.height = 2000;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no permite crear la imagen.');
  const dark = s.direction !== 'editorial';
  ctx.fillStyle = dark ? '#071525' : '#f4f7fa'; ctx.fillRect(0, 0, 1600, 2000);
  ctx.strokeStyle = dark ? '#c4e7ff18' : '#07306414'; ctx.lineWidth = 1;
  for (let x = 0; x <= 1600; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 2000); ctx.stroke(); }
  for (let y = 0; y <= 2000; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke(); }
  ctx.fillStyle = dark ? '#cbe8ff' : '#16364f'; ctx.font = '500 23px sans-serif';
  ctx.fillText('LATECH STUDIO / UNA IDEA FUERA DEL MOLDE', 110, 140);
  ctx.save(); ctx.translate(800, 1000); ctx.rotate(s.direction === 'bold' ? -.45 : -.25);
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = i % 2 ? (dark ? '#b9e2ff' : '#16364f') : accents[s.accent];
    ctx.lineWidth = 48; ctx.beginPath(); ctx.ellipse(i * 40 - 80, i * 38 - 76, 420 - i * 22, 240 - i * 12, i * .15, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  const name = (s.name || 'TU PRÓXIMA IDEA').toUpperCase();
  let fontSize = 142; ctx.font = `800 ${fontSize}px sans-serif`;
  while (ctx.measureText(name).width > 1380 && fontSize > 36) { fontSize -= 2; ctx.font = `800 ${fontSize}px sans-serif`; }
  ctx.fillStyle = dark ? '#fff' : '#10233b'; ctx.fillText(name, 110, 420);
  ctx.font = '700 72px sans-serif'; ctx.fillText('HECHO PARA', 110, 1560); ctx.fillText('DEJAR HUELLA.', 110, 1650);
  ctx.font = '400 25px sans-serif'; ctx.fillStyle = dark ? '#b9d4e8' : '#44657d';
  ctx.fillText(`${s.sector.toUpperCase()} / ${directionLabels[s.direction].toUpperCase()}`, 110, 1820);
  ctx.fillText('Concepto interactivo · serviciosonlineweb.com', 110, 1880);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('No se pudo exportar el póster.')), 'image/png'));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'latech-studio-mi-idea.png';
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
