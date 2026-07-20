'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield, ShieldCheck, Heart, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { InsurancePlan } from '@/lib/types';

const planIcons: Record<string, typeof Shield> = {
  'Artisan Loom & Health Protection': ShieldCheck,
  'Silk Weaver Comprehensive': Shield,
  'Handloom Family Shield': Heart,
  'Crop & Yarn Insurance': Wrench,
  'Premier Weaver Elite': Shield,
};

export default function InsurancePage() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insurance')
      .then((r) => r.json())
      .then((d) => setPlans(d.insurancePlans))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>;
  }

  const active = plans.filter(p => p.status === 'Active');
  const available = plans.filter(p => p.status === 'Available');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Artisan Insurance</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Tailored coverage for looms, health, income, and raw materials.</p>
      </motion.div>

      {active.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Plans</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((p) => {
              const Icon = planIcons[p.planName] || Shield;
              return (
                <Card key={p._id} className="card-hover border-emerald-200 dark:border-emerald-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Active</Badge>
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{p.planName}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.recommendedReason}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{p.monthlyPremium}</span>
                      <span className="text-sm text-slate-500">/month</span>
                    </div>
                    <div className="mt-1 text-sm text-emerald-600">Coverage: ₹{p.coverageAmount.toLocaleString('en-IN')}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {available.map((p) => {
            const Icon = planIcons[p.planName] || Shield;
            return (
              <Card key={p._id} className="card-hover">
                <CardContent className="pt-6">
                  <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-sky-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{p.planName}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.recommendedReason}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{p.monthlyPremium}</span>
                    <span className="text-sm text-slate-500">/month</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">Coverage: ₹{p.coverageAmount.toLocaleString('en-IN')}</div>
                  <Button className="w-full mt-4">Enroll Now</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
