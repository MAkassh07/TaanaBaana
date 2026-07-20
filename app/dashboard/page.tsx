'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Upload as UploadIcon, Wallet, Receipt, Users, Shield, AlertTriangle, Loader2, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DashboardStats, CreditTrendPoint, ProductionPoint, FabricDistribution, Evaluation, Upload } from '@/lib/types';

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1', '#14b8a6', '#ec4899'];

interface DashboardData {
  stats: DashboardStats;
  trend: CreditTrendPoint[];
  production: ProductionPoint[];
  fabricDist: FabricDistribution[];
  recentUploads: Upload[];
  evaluations: Evaluation[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const { stats, trend, production, fabricDist, recentUploads, evaluations } = data;

  const statCards = [
    { label: "Today's Uploads", value: stats.todayUploads, icon: UploadIcon, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { label: 'Total Funding', value: `₹${(stats.totalFunding / 100000).toFixed(1)}L`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Pending Invoices', value: stats.pendingInvoices, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Total Weavers', value: stats.totalWeavers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Avg Credit Score', value: stats.averageCreditScore, icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { label: 'Active Insurance', value: stats.activeInsurance, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Flagged Uploads', value: stats.flaggedUploads, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: 'Total Uploads', value: stats.totalUploads, icon: UploadIcon, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Credit trends, production output, and platform health.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-hover">
                <CardContent className="pt-5">
                  <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credit Score Trend</CardTitle>
            <CardDescription>Last 8 evaluations across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[300, 900]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Production Output</CardTitle>
            <CardDescription>Units produced over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={production}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="units" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Fabric Distribution</CardTitle>
            <CardDescription>Uploads by fabric type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={fabricDist} dataKey="count" nameKey="fabric" cx="50%" cy="50%" outerRadius={90} label>
                  {fabricDist.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent uploads */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUploads.map((u) => (
                <div key={u._id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.imageUrls[0]} alt={u.productType} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{u.productType} · {u.fabricType}</div>
                    <div className="text-xs text-slate-500 truncate">{u.buyerName} · {u.orderId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">₹{u.invoiceAmount.toLocaleString('en-IN')}</div>
                    <Badge variant="outline" className="text-xs">{u.quantity} units</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation history */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Evaluation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-2 font-medium">Eval ID</th>
                  <th className="pb-2 font-medium">Quality</th>
                  <th className="pb-2 font-medium">Delivery</th>
                  <th className="pb-2 font-medium">Productivity</th>
                  <th className="pb-2 font-medium">Trust</th>
                  <th className="pb-2 font-medium">Invoice</th>
                  <th className="pb-2 font-medium">Fraud</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((e) => (
                  <tr key={e._id} className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="py-2.5 font-mono text-xs text-slate-500">{e._id.slice(0, 12)}</td>
                    <td className="py-2.5">{e.qualityScore}</td>
                    <td className="py-2.5">{e.deliveryScore}</td>
                    <td className="py-2.5">{e.productivityScore}</td>
                    <td className="py-2.5">{e.cooperativeTrustScore}</td>
                    <td className="py-2.5">{e.invoiceCredibilityScore}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className={
                        e.fraudRisk === 'Low' ? 'text-emerald-600' : e.fraudRisk === 'Medium' ? 'text-amber-600' : 'text-red-600'
                      }>{e.fraudRisk}</Badge>
                    </td>
                    <td className="py-2.5 font-bold">{e.finalCreditScore}</td>
                    <td className="py-2.5">
                      <Badge variant="outline">{e.creditTier}</Badge>
                    </td>
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
