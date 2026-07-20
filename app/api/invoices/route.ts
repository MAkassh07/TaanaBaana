import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDB();
  return NextResponse.json({ invoices: db.invoices });
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const db = getDB();
    const inv = db.invoices.find(i => i._id === id);
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    inv.status = status;
    return NextResponse.json({ invoice: inv });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
