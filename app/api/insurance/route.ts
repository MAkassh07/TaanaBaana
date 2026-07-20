import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDB();
  return NextResponse.json({ insurancePlans: db.insurancePlans });
}
