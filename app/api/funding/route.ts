import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import type { FundingRequest, FundingStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDB();
  return NextResponse.json({ fundingRequests: db.fundingRequests });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDB();
    const newReq = {
      _id: `fund_${Date.now().toString(36)}`,
      weaverId: body.weaverId,
      uploadId: body.uploadId,
      requestedAmount: Number(body.requestedAmount),
      eligibleMaxAmount: Number(body.eligibleMaxAmount),
      interestRate: Number(body.interestRate),
      status: 'Requested' as FundingStatus,
      repaymentTermMonths: Number(body.repaymentTermMonths) || 6,
      createdAt: new Date().toISOString(),
    };
    db.fundingRequests.push(newReq as FundingRequest);
    return NextResponse.json({ fundingRequest: newReq }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
