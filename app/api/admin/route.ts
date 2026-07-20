import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import type { UploadStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDB();
  return NextResponse.json({
    uploads: db.uploads,
    evaluations: db.evaluations,
    invoices: db.invoices,
    fundingRequests: db.fundingRequests,
    cooperatives: db.cooperatives,
    weavers: db.weavers,
    users: db.users,
    creditHistory: db.creditHistory,
  });
}

export async function PATCH(req: Request) {
  try {
    const { uploadId, status } = await req.json();
    const db = getDB();
    const upload = db.uploads.find(u => u._id === uploadId);
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    upload.status = status as UploadStatus;
    return NextResponse.json({ upload });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
