export type ScreenPoint = { x: number; y: number };

/** Project a viewport-sized plane into the four real corners of the live CRT. */
export function crtProjection(width: number, height: number, points: ScreenPoint[]): string | null {
  if (width <= 0 || height <= 0 || points.length !== 4 || points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;
  const [p0, p1, p2, p3] = points;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;
  const determinant = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(determinant) < .001) return null;
  const g = (sx * dy2 - dx2 * sy) / determinant;
  const h = (dx1 * sy - sx * dy1) / determinant;
  const a = p1.x - p0.x + g * p1.x, b = p3.x - p0.x + h * p3.x;
  const d = p1.y - p0.y + g * p1.y, e = p3.y - p0.y + h * p3.y;
  return `matrix3d(${[a / width, d / width, 0, g / width, b / height, e / height, 0, h / height, 0, 0, 1, 0, p0.x, p0.y, 0, 1].join(',')})`;
}

/** Dense geometric frames avoid browser matrix decomposition taking a twisting path. */
export function crtCameraFrames(width: number, height: number, target: ScreenPoint[]): Keyframe[] | null {
  const end = crtProjection(width, height, target);
  if (!end) return null;
  const start = [{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}];
  const frames: Keyframe[] = Array.from({length:25}, (_, index) => {
    const t = index / 24;
    const corners = start.map((p, i) => ({x:p.x + (target[i].x - p.x) * t,y:p.y + (target[i].y - p.y) * t}));
    return {transform:crtProjection(width, height, corners) ?? end,opacity:1,offset:t * .8};
  });
  frames.push({transform:end,opacity:0,offset:1});
  return frames;
}
