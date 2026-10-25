import type { Metadata } from 'next';
import ArcadeController from '@/components/arcade/ArcadeController';
export const metadata: Metadata = { title: { absolute: 'Mando Arcade · Latech' }, description: 'Tu móvil se convierte en un mando de juego.', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function GamepadPage() { return <ArcadeController />; }
