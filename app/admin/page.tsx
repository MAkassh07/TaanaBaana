'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, Check, X, ShieldAlert, Users, Building2, Receipt, Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import type { Upload, Evaluation, Invoice, FundingRequest, Cooperative, Weaver } from '@/lib/types';

interface AdminData {
  uploads: Upload[];
  evaluations: Evaluation[];
  invoices: Invoice[];
  fundingRequests: FundingRequest[];
  cooperatives: Cooperative[];
  weavers: Weaver[];
  users: { _id: string; name: string; email: string; role: string }[];
  creditHistory: { _id: string; weaverId: string; score: number }[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'uploads' | 'invoices' | 'funding' | 'cooperatives' | 'weavers'>('uploads');

  const load = () => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateUploadStatus = async (id: string, status: string) => {
    const res = await fetch('/api/uploads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    if (res.ok) {
      toast({ title: `Upload ${status}` });
      load();
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    const res = await fetch('/api/invoices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    if (res.ok) {
      toast({ title: `Invoice ${status}` });
      load();
    }
  };

  const reseed = async () => {
    await fetch('/api/seed', { method: 'POST' });
    toast({ title: 'Database reseeded' });
    load();
  };

  if (loading || !data) {
    return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>;
  }

  const tabs = [
    { key: 'uploads', label: 'Uploads', icon: Receipt },
    { key: 'invoices', label: 'Invoices', icon: Wallet },
    { key: 'funding', label: 'Funding', icon: Wallet },
    { key: 'cooperatives', label: 'Cooperatives', icon: Building2 },
    { key: 'weavers', label: 'Weavers', icon: Users },
  ] as const;

  const evalMap = new Map(data.evaluations.map(e => [e.uploadId, e]));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Audit uploads, approve invoices, manage cooperatives.</p>
        </div>
        <Button variant="outline" onClick={reseed}>Reseed Database</Button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mt-8 overflow-x-auto scrollbar-thin border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === 'uploads' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Uploads ({data.uploads.length})</CardTitle>
              <CardDescription>Review AI flags and approve or reject uploads.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 font-medium">Order</th>
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">Buyer</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Score</th>
                      <th className="pb-2 font-medium">Fraud</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.uploads.map((u) => {
                      const ev = evalMap.get(u._id);
                      return (
                        <tr key={u._id} className="border-b border-slate-50 dark:border-slate-800/50">
                          <td className="py-3 font-mono text-xs">{u.orderId}</td>
                          <td className="py-3">{u.productType}</td>
                          <td className="py-3">{u.buyerName}</td>
                          <td className="py-3">₹{u.invoiceAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3 font-bold">{ev?.finalCreditScore || '—'}</td>
                          <td className="py-3">
                            {ev && (
                              <Badge variant="outline" className={
                                ev.fraudRisk === 'Low' ? 'text-emerald-600' : ev.fraudRisk === 'Medium' ? 'text-amber-600' : 'text-red-600'
                              }>{ev.fraudRisk}</Badge>
                            )}
                          </td>
                          <td className="py-3"><Badge variant="outline">{u.status}</Badge></td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => updateUploadStatus(u._id, 'Evaluated')}>
                                <Check className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => updateUploadStatus(u._id, 'Rejected')}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'invoices' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoices ({data.invoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 font-medium">Buyer</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Credibility</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.map((inv) => (
                      <tr key={inv._id} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3">{inv.buyerName}</td>
                        <td className="py-3">₹{inv.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3">{inv.credibilityScore}</td>
                        <td className="py-3"><Badge variant="outline">{inv.status}</Badge></td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => updateInvoiceStatus(inv._id, 'Approved')}><Check className="h-4 w-4 text-emerald-600" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => updateInvoiceStatus(inv._id, 'Rejected')}><X className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'funding' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Funding Requests ({data.fundingRequests.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 font-medium">Requested</th>
                      <th className="pb-2 font-medium">Eligible Max</th>
                      <th className="pb-2 font-medium">Rate</th>
                      <th className="pb-2 font-medium">Term</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fundingRequests.map((r) => (
                      <tr key={r._id} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3">₹{r.requestedAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3">₹{r.eligibleMaxAmount.toLocaleString('en-IN')}</td>
                        <td className="py-3">{r.interestRate}%</td>
                        <td className="py-3">{r.repaymentTermMonths} mo</td>
                        <td className="py-3"><Badge variant="outline">{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'cooperatives' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Cooperatives ({data.cooperatives.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.cooperatives.map((c) => (
                  <div key={c._id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <Building2 className="h-5 w-5 text-sky-500" />
                      <Badge variant="outline" className={c.verificationStatus === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}>
                        {c.verificationStatus}
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                    <div className="mt-2 text-sm text-slate-500">{c.location} · {c.weaverCount} weavers</div>
                    <div className="mt-2 text-sm">Trust rating: <span className="font-medium">{c.trustRating}/100</span></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'weavers' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Weavers ({data.weavers.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Location</th>
                      <th className="pb-2 font-medium">Experience</th>
                      <th className="pb-2 font-medium">Specialties</th>
                      <th className="pb-2 font-medium">Uploads</th>
                      <th className="pb-2 font-medium">Credit Score</th>
                      <th className="pb-2 font-medium">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weavers.map((w) => (
                      <tr key={w._id} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-3 font-medium">{w.name}</td>
                        <td className="py-3">{w.location}</td>
                        <td className="py-3">{w.experienceYears} yrs</td>
                        <td className="py-3 text-xs">{w.fabricSpecialties.join(', ')}</td>
                        <td className="py-3">{w.totalUploads}</td>
                        <td className="py-3 font-bold">{w.overallCreditScore}</td>
                        <td className="py-3"><Badge variant="outline">{w.creditTier}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
