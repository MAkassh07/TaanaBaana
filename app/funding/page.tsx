'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CreditCard, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import type { FundingRequest } from '@/lib/types';

const statusColor: Record<string, string> = {
  'Eligible': 'text-sky-600 bg-sky-50 dark:bg-sky-500/10',
  'Requested': 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
  'Disbursed': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
  'Repaid': 'text-violet-600 bg-violet-50 dark:bg-violet-500/10',
  'Manual Review': 'text-red-600 bg-red-50 dark:bg-red-500/10',
};

const tiers = [
  { tier: 'Excellent', range: '> 800', financing: '80%', rate: '8%', color: 'text-emerald-600' },
  { tier: 'Good', range: '700–800', financing: '70%', rate: '10%', color: 'text-sky-600' },
  { tier: 'Average', range: '600–700', financing: '60%', rate: '12%', color: 'text-amber-600' },
  { tier: 'Risky', range: '< 600', financing: 'Manual', rate: '—', color: 'text-red-600' },
];

export default function FundingPage() {
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/funding')
      .then((r) => r.json())
      .then((d) => setRequests(d.fundingRequests))
      .finally(() => setLoading(false));
  }, []);

  const totalDisbursed = requests.filter(r => r.status === 'Disbursed').reduce((s, r) => s + r.requestedAmount, 0);
  const totalEligible = requests.reduce((s, r) => s + r.eligibleMaxAmount, 0);

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoice Financing</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Instant working capital against your verified invoices.</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <Wallet className="h-8 w-8 text-emerald-500 mb-3" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{(totalDisbursed / 100000).toFixed(1)}L</div>
            <div className="text-xs text-slate-500 mt-0.5">Total Disbursed</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <CreditCard className="h-8 w-8 text-sky-500 mb-3" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{(totalEligible / 100000).toFixed(1)}L</div>
            <div className="text-xs text-slate-500 mt-0.5">Total Eligible</div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-violet-500 mb-3" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{requests.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Funding Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Tier table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Funding Eligibility Tiers</CardTitle>
          <CardDescription>Financing percentage and interest rate by credit score band.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiers.map((t) => (
              <div key={t.tier} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className={`text-sm font-semibold ${t.color}`}>{t.tier}</div>
                <div className="mt-2 text-xs text-slate-500">Score {t.range}</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Financing</span><span className="font-medium">{t.financing}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Interest</span><span className="font-medium">{t.rate}</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Funding Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Requested</th>
                  <th className="pb-2 font-medium">Eligible Max</th>
                  <th className="pb-2 font-medium">Rate</th>
                  <th className="pb-2 font-medium">Term</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="py-3 font-mono text-xs text-slate-500">{r._id.slice(0, 12)}</td>
                    <td className="py-3 font-semibold">₹{r.requestedAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3">₹{r.eligibleMaxAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3">{r.interestRate}%</td>
                    <td className="py-3">{r.repaymentTermMonths} mo</td>
                    <td className="py-3"><Badge variant="outline" className={statusColor[r.status]}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
