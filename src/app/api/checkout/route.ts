import { NextResponse } from 'next/server';

/** Online payment initiation has been retired. Discuss the project on WhatsApp. */
export async function POST() {
  return NextResponse.json({ error: 'online_payments_removed', message: 'Hablemos de tu proyecto por WhatsApp.', contact: '/contacto#proyecto' }, { status: 410 });
}
