import { NextResponse } from 'next/server';
import { resetDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const db = resetDB();
  return NextResponse.json({
    seeded: true,
    counts: {
      weavers: db.weavers.length,
      uploads: db.uploads.length,
      evaluations: db.evaluations.length,
      invoices: db.invoices.length,
      fundingRequests: db.fundingRequests.length,
      insurancePlans: db.insurancePlans.length,
      cooperatives: db.cooperatives.length,
    },
  });
}
