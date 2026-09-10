import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// No verified delivery provider is configured. Never issue a reset credential
// to the requester or pretend an email was sent. Account existence is not queried.
export async function POST() {
  return NextResponse.json(
    {
      code: 'RECOVERY_ASSISTED',
      error: 'La recuperación automática por email no está disponible. Contacta con Latech para verificar tu identidad y recuperar el acceso.',
      supportPath: '/recuperar',
    },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
