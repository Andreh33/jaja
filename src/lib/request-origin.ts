// JSON mutations authenticated by cookies need an origin boundary as well as
// role checks. Never reflect an arbitrary Origin into an allowlist.
export function isSameOriginMutation(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
