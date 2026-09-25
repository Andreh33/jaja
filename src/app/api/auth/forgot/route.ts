import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const unavailableResponse = {
  error: 'La recuperación automática está temporalmente desactivada. Contacta con soporte.',
};

/**
 * Contención de seguridad: no emitimos ni exponemos tokens hasta disponer
 * de un canal de correo transaccional verificado. La respuesta es constante
 * para todos los cuerpos y correos, por lo que tampoco revela si una cuenta existe.
 */
export async function POST() {
  return NextResponse.json(unavailableResponse, {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
