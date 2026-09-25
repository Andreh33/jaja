import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const unavailableResponse = {
  error: 'La recuperación automática está temporalmente desactivada. Contacta con soporte.',
};

/**
 * Contención de seguridad: rechazar de forma constante todos los intentos
 * hace que cualquier token heredado quede inoperante sin tocar la base de datos.
 */
export async function POST() {
  return NextResponse.json(unavailableResponse, {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
