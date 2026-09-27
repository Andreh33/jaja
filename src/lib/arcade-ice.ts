import { createHmac } from 'node:crypto';

/** Optional coturn-compatible relay. The shared secret never leaves the server. */
export function arcadeIceServers(session: string, now = Date.now(), env: Record<string,string|undefined> = process.env): RTCIceServer[] {
  const servers: RTCIceServer[] = [{ urls: 'stun:stun.cloudflare.com:3478' }];
  const urls = (env.ARCADE_TURN_URLS ?? '').split(',').map(url => url.trim()).filter(url => /^turns?:[a-z0-9.-]+(?::\d+)?(?:\?transport=(?:udp|tcp))?$/i.test(url));
  if (urls.length && env.ARCADE_TURN_SECRET) {
    const username = `${Math.floor(now / 1000) + 3600}:${session}`;
    servers.push({ urls, username, credential: createHmac('sha1', env.ARCADE_TURN_SECRET).update(username).digest('base64') });
  }
  return servers;
}
