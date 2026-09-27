import type { Metadata } from 'next';
import TvRemoteController from '@/components/home/TvRemoteController';
export const metadata: Metadata = { title: { absolute: 'Mando · Latech TV' }, description: 'Toma el control de Latech TV desde tu móvil.', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function RemotePage() { return <TvRemoteController />; }
