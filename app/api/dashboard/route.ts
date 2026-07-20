import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import type { DashboardStats, CreditTrendPoint, ProductionPoint, FabricDistribution } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDB();
  const today = new Date().toISOString().slice(0, 10);

  const todayUploads = db.uploads.filter(u => u.createdAt.slice(0, 10) === today).length;
  const totalFunding = db.fundingRequests
    .filter(f => f.status === 'Disbursed')
    .reduce((sum, f) => sum + f.requestedAmount, 0);
  const pendingInvoices = db.invoices.filter(i => i.status === 'Pending').length;
  const averageCreditScore = Math.round(
    db.weavers.reduce((s, w) => s + w.overallCreditScore, 0) / Math.max(1, db.weavers.length)
  );
  const activeInsurance = db.insurancePlans.filter(p => p.status === 'Active').length;
  const flaggedUploads = db.evaluations.filter(e => e.fraudRisk === 'High' || e.fraudRisk === 'Medium').length;

  const stats: DashboardStats = {
    todayUploads,
    totalUploads: db.uploads.length,
    totalFunding,
    pendingInvoices,
    totalWeavers: db.weavers.length,
    averageCreditScore,
    activeInsurance,
    flaggedUploads,
  };

  // Credit score trend (last 8 evaluations chronological)
  const sortedEval = [...db.evaluations].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const trend: CreditTrendPoint[] = sortedEval.slice(-8).map((e, i) => ({
    label: `Eval ${i + 1}`,
    score: e.finalCreditScore,
  }));

  // Production output by month (last 6 months)
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString('default', { month: 'short' }));
  }
  const production: ProductionPoint[] = months.map((m, idx) => {
    const target = new Date();
    target.setMonth(target.getMonth() - (5 - idx));
    const monthKey = target.toISOString().slice(0, 7);
    const units = db.uploads
      .filter(u => u.createdAt.slice(0, 7) === monthKey)
      .reduce((s, u) => s + u.quantity, 0);
    return { label: m, units };
  });

  // Fabric distribution
  const fabricMap: Record<string, number> = {};
  db.uploads.forEach(u => {
    fabricMap[u.fabricType] = (fabricMap[u.fabricType] || 0) + 1;
  });
  const fabricDist: FabricDistribution[] = Object.entries(fabricMap).map(([fabric, count]) => ({ fabric, count }));

  // Recent uploads (last 5)
  const recentUploads = [...db.uploads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return NextResponse.json({
    stats, trend, production, fabricDist, recentUploads,
    evaluations: db.evaluations.slice(-10).reverse(),
  });
}
