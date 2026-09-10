import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Legacy tokens were returned publicly by /forgot, so none can establish
// ownership. Retire them at the authorization boundary without touching live DB.
export async function POST() {
  return NextResponse.json(
    {
      code: 'RECOVERY_LINK_RETIRED',
      error: 'Este enlace de recuperación ya no es válido. Contacta con Latech para verificar tu identidad y recuperar el acceso.',
      supportPath: '/recuperar',
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
