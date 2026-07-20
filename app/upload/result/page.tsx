'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Truck, Gauge, Users, Receipt, AlertTriangle,
  CreditCard, Shield, ArrowRight, Loader2, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/score-gauge';
import { ScoreBar } from '@/components/score-bar';
import type { Evaluation, Upload, FundingEligibility } from '@/lib/types';
import { computeEligibility } from '@/lib/evaluation-engine';

function ResultContent() {
  const params = useSearchParams();
  const uploadId = params.get('id');
  const evalId = params.get('eval');
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);

  useEffect(() => {
    if (!uploadId) return;
    (async () => {
      try {
        const [upRes, evRes] = await Promise.all([
          fetch('/api/uploads'),
          fetch('/api/evaluations'),
        ]);
        const upData = await upRes.json();
        const evData = await evRes.json();
        const foundUpload = upData.uploads.find((u: Upload) => u._id === uploadId);
        const foundEval = evData.evaluations.find((e: Evaluation) => e._id === evalId) ||
          evData.evaluations.find((e: Evaluation) => e.uploadId === uploadId);
        setUpload(foundUpload || null);
        setEvaluation(foundEval || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [uploadId, evalId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!evaluation || !upload) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Evaluation not found.</p>
      </div>
    );
  }

  const eligibility: FundingEligibility = computeEligibility(evaluation.finalCreditScore, upload.invoiceAmount);
  const tierColor = {
    Excellent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
    Good: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10',
    Average: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
    Risky: 'text-red-600 bg-red-50 dark:bg-red-500/10',
  }[evaluation.creditTier];

  const fraudColor = {
    Low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
    Medium: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
    High: 'text-red-600 bg-red-50 dark:bg-red-500/10',
  }[evaluation.fraudRisk];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Evaluation Result</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          AI analysis for Order <span className="font-medium">{upload.orderId}</span> · {upload.productType} · {upload.fabricType}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Weaver Credit Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ScoreGauge score={evaluation.finalCreditScore} />
            <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-semibold ${tierColor}`}>
              {evaluation.creditTier}
            </div>
            <div className="mt-4 text-xs text-slate-500 text-center">
              Score range 300–900 · Updated {new Date(evaluation.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Factor Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Score Factor Breakdown</CardTitle>
            <CardDescription>Deterministic analysis of production, delivery, and trust signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ScoreBar label="Production Quality" value={evaluation.qualityScore} color="#0ea5e9" icon={<ShieldCheck className="h-4 w-4" />} delay={0.1} />
            <ScoreBar label="Delivery Reliability" value={evaluation.deliveryScore} color="#10b981" icon={<Truck className="h-4 w-4" />} delay={0.2} />
            <ScoreBar label="Productivity" value={evaluation.productivityScore} color="#8b5cf6" icon={<Gauge className="h-4 w-4" />} delay={0.3} />
            <ScoreBar label="Cooperative Trust" value={evaluation.cooperativeTrustScore} color="#f59e0b" icon={<Users className="h-4 w-4" />} delay={0.4} />
            <ScoreBar label="Invoice Credibility" value={evaluation.invoiceCredibilityScore} color="#6366f1" icon={<Receipt className="h-4 w-4" />} delay={0.5} />

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <AlertTriangle className="h-4 w-4" />
                  Fraud Risk
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${fraudColor}`}>
                  {evaluation.fraudRisk}
                </div>
              </div>
              {evaluation.fraudFlags.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {evaluation.fraudFlags.map((flag, i) => (
                    <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Eligibility & Insurance */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-sky-500" />
                Funding Eligibility
              </CardTitle>
              <Badge variant="outline">{eligibility.manualReview ? 'Manual Review' : 'Eligible'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {eligibility.manualReview ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your credit score requires manual review by our financing team. A representative will reach out shortly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-500">Eligible %</div>
                  <div className="text-2xl font-bold text-sky-600">{eligibility.eligiblePercentage}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Interest Rate</div>
                  <div className="text-2xl font-bold text-emerald-600">{eligibility.interestRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Max Amount</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{eligibility.eligibleMaxAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}
            <Button className="w-full mt-5 gap-2" disabled={eligibility.manualReview}>
              Apply for Instant Financing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Insurance Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <div className="font-semibold text-emerald-900 dark:text-emerald-100">Artisan Loom & Health Protection</div>
              <div className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                Covers loom damage and weaver health emergencies. Recommended based on your production profile.
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">₹199</span>
                <span className="text-sm text-emerald-600">/month</span>
                <span className="ml-3 text-sm text-emerald-600">· ₹1,00,000 coverage</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2">
              <TrendingUp className="h-4 w-4" />
              View Insurance Plans
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Evaluation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Metric label="Photo Clarity" value={`${evaluation.metrics.photoClarity}/100`} />
            <Metric label="Visible Defects" value={`${evaluation.metrics.visibleDefects}/100`} />
            <Metric label="Fabric Finish" value={`${evaluation.metrics.fabricFinish}/100`} />
            <Metric label="Complexity Bonus" value={`+${evaluation.metrics.complexityBonus}`} />
            <Metric label="Days Late" value={`${evaluation.metrics.daysLate}`} />
            <Metric label="Days Early" value={`${evaluation.metrics.daysEarly}`} />
            <Metric label="Units / Day" value={`${evaluation.metrics.unitsPerDay}`} />
            <Metric label="Benchmark Rate" value={`${evaluation.metrics.benchmarkRate}`} />
            <Metric label="Unit Price" value={`₹${evaluation.metrics.unitPrice}`} />
            <Metric label="Market Range" value={`₹${evaluation.metrics.marketMin}–₹${evaluation.metrics.marketMax}`} />
            <Metric label="Duplicate Flags" value={`${evaluation.metrics.duplicateFlags}`} />
            <Metric label="Missing Fields" value={`${evaluation.metrics.missingFields}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

export default function UploadResultPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-sky-500" /></div>}>
      <ResultContent />
    </Suspense>
  );
}
