import Link from 'next/link';
import {
  Upload, Brain, CreditCard, Shield, BarChart3, Users, ArrowRight, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Upload,
    title: 'Upload Completed Work',
    desc: 'Submit photos, voice notes, and production metadata. Voice AI auto-fills your form.',
  },
  {
    icon: Brain,
    title: 'AI Evaluation Engine',
    desc: 'Deterministic scoring analyzes quality, delivery, productivity, and fraud signals.',
  },
  {
    icon: CreditCard,
    title: 'Weaver Credit Score',
    desc: 'Get a 300–900 credit score with instant funding eligibility and interest rates.',
  },
  {
    icon: Shield,
    title: 'Artisan Insurance',
    desc: 'Tailored insurance plans covering loom damage, health, and income protection.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Track credit trends, production output, funding history, and insurance coverage.',
  },
  {
    icon: Users,
    title: 'Cooperative Trust',
    desc: 'Verified cooperative memberships boost your trust score and funding access.',
  },
];

const steps = [
  { step: '01', title: 'Upload Work', desc: 'Add product photos, voice recording, and production details.' },
  { step: '02', title: 'AI Evaluates', desc: 'Engine analyzes quality, delivery, productivity, and fraud risk.' },
  { step: '03', title: 'Get Credit Score', desc: 'Receive a 300–900 score with tier and funding eligibility.' },
  { step: '04', title: 'Access Funding', desc: 'Apply for instant invoice financing and artisan insurance.' },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Credit Assessment for Handloom Weavers
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Build your <span className="gradient-text">digital production history</span> and unlock credit
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          TaanaBaana Credit turns completed handloom work into a verifiable credit score. Upload your
          production, get evaluated by our AI engine, and access invoice financing and insurance instantly.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/upload">
            <Button size="lg" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Your Work
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="gap-2">
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats band */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        {[
          { label: 'Weavers Onboarded', value: '50+' },
          { label: 'Uploads Evaluated', value: '30+' },
          { label: 'Credit Score Range', value: '300–900' },
          { label: 'Funding Disbursed', value: '₹6L+' },
        ].map((s) => (
          <Card key={s.label} className="card-hover">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Capabilities</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Every feature you need to turn handloom craftsmanship into accessible, affordable credit.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="card-hover">
                <CardContent className="pt-6">
                  <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <Card key={s.step} className="card-hover relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold text-slate-100 dark:text-slate-800 absolute top-4 right-4 select-none">
                  {s.step}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white relative z-10">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 relative z-10">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-20">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-600 to-emerald-600">
          <CardContent className="pt-10 pb-10 px-8 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to build your credit?</h2>
            <p className="mt-3 text-sky-100 max-w-xl mx-auto">
              Upload your completed handloom work and get an AI-evaluated credit score in seconds.
            </p>
            <Link href="/upload" className="inline-block mt-6">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Uploading
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
