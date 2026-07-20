'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic, Upload as UploadIcon, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { parseVoiceTranscript } from '@/lib/voice-parser';

const FABRICS = ['Cotton', 'Silk', 'Linen', 'Khadi', 'Jamdani', 'Ikkat', 'Banarasi', 'Kanchipuram'];
const PRODUCTS = ['Silk Saree', 'Cotton Saree', 'Handloom Dupatta', 'Scarf', 'Shawl', 'Kurta Fabric', 'Lungi', 'Dhoti', 'Bedsheet', 'Table Runner'];
const TECHNIQUES = ['Handloom', 'Jacquard', 'Pit Loom', 'Frame Loom', 'Fly Shuttle'];
const COOPS = ['Varanasi Weavers Coop', 'Kanchipuram Silk Society', 'Khadi Gramodyog', 'Chanderi Handloom Cluster', 'Pochampally Ikkat Society'];

const PRODUCT_SVG: Record<string, string> = {
  'Silk Saree': '/sample-products/silk-saree.svg',
  'Cotton Saree': '/sample-products/cotton-saree.svg',
  'Handloom Dupatta': '/sample-products/handloom-dupatta.svg',
  'Scarf': '/sample-products/scarf.svg',
  'Shawl': '/sample-products/shawl.svg',
  'Kurta Fabric': '/sample-products/kurta-fabric.svg',
  'Lungi': '/sample-products/lungi.svg',
  'Dhoti': '/sample-products/dhoti.svg',
  'Bedsheet': '/sample-products/bedsheet.svg',
  'Table Runner': '/sample-products/table-runner.svg',
};

const SAMPLE_TRANSCRIPTS = [
  'Completed 12 silk sarees for ABC Traders at ₹28000 in Varanasi',
  'Made 8 cotton dupattas for Heritage Textiles at ₹15000 in Bhagalpur',
  'Produced 5 banarasi sarees for Sundari Silks at ₹62000 in Varanasi',
  'Finished 20 khadi kurtas for Khadi Bhandar at ₹40000 in Jaipur',
];

export default function UploadPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [simulatingVoice, setSimulatingVoice] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('Silk Saree');
  const [form, setForm] = useState({
    weaverId: '',
    orderId: '',
    buyerName: '',
    productType: 'Silk Saree',
    fabricType: 'Silk',
    weavingTechnique: 'Handloom',
    quantity: '1',
    startDate: '',
    endDate: '',
    expectedDeliveryDate: '',
    actualDeliveryDate: '',
    invoiceAmount: '',
    cooperativeName: 'Varanasi Weavers Coop',
    location: 'Varanasi',
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleVoiceSimulate = () => {
    setSimulatingVoice(true);
    const sample = SAMPLE_TRANSCRIPTS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTS.length)];
    setTimeout(() => {
      setTranscript(sample);
      const parsed = parseVoiceTranscript(sample);
      setForm((f) => ({
        ...f,
        quantity: parsed.quantity?.toString() || f.quantity,
        fabricType: parsed.fabricType || f.fabricType,
        productType: parsed.productType || f.productType,
        buyerName: parsed.buyerName || f.buyerName,
        invoiceAmount: parsed.invoiceAmount?.toString() || f.invoiceAmount,
        location: parsed.location || f.location,
      }));
      if (parsed.productType) setSelectedProduct(parsed.productType);
      toast({
        title: 'Voice parsed successfully',
        description: `Auto-filled: ${parsed.matchedFields.join(', ')}`,
      });
      setSimulatingVoice(false);
    }, 1200);
  };

  const handleTranscriptChange = (val: string) => {
    setTranscript(val);
    const parsed = parseVoiceTranscript(val);
    if (parsed.matchedFields.length > 0) {
      setForm((f) => ({
        ...f,
        quantity: parsed.quantity?.toString() || f.quantity,
        fabricType: parsed.fabricType || f.fabricType,
        productType: parsed.productType || f.productType,
        buyerName: parsed.buyerName || f.buyerName,
        invoiceAmount: parsed.invoiceAmount?.toString() || f.invoiceAmount,
        location: parsed.location || f.location,
      }));
      if (parsed.productType) setSelectedProduct(parsed.productType);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId || !form.buyerName || !form.invoiceAmount) {
      toast({ title: 'Missing required fields', description: 'Order ID, Buyer Name, and Invoice Amount are required.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity) || 1,
          invoiceAmount: Number(form.invoiceAmount) || 0,
          imageUrls: [PRODUCT_SVG[selectedProduct] || PRODUCT_SVG['Silk Saree']],
          voiceTranscript: transcript || undefined,
          simulateVoice: !transcript,
        }),
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      toast({ title: 'Evaluation complete', description: `Credit score: ${data.evaluation.finalCreditScore} (${data.evaluation.creditTier})` });
      router.push(`/upload/result?id=${data.upload._id}&eval=${data.evaluation._id}`);
    } catch (err) {
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Completed Work</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Submit your production details. Our AI engine evaluates quality, delivery, productivity, and fraud signals instantly.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Production Details</CardTitle>
              <CardDescription>Fill the form or use Voice AI to auto-fill fields.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Voice AI */}
              <div className="mb-6 p-4 rounded-xl border border-sky-200 bg-sky-50/50 dark:bg-sky-500/5 dark:border-sky-500/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Voice AI Simulation</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Parse a voice transcript to auto-fill the form</div>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleVoiceSimulate} disabled={simulatingVoice}>
                    {simulatingVoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {simulatingVoice ? 'Listening...' : 'Simulate Voice'}
                  </Button>
                </div>
                <Textarea
                  className="mt-3 bg-white dark:bg-slate-900"
                  placeholder="e.g. Completed 12 silk sarees for ABC Traders at ₹28000 in Varanasi"
                  value={transcript}
                  onChange={(e) => handleTranscriptChange(e.target.value)}
                  rows={2}
                />
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Order ID *</Label>
                  <Input value={form.orderId} onChange={(e) => set('orderId', e.target.value)} placeholder="ORD-2024-1234" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Buyer Name *</Label>
                  <Input value={form.buyerName} onChange={(e) => set('buyerName', e.target.value)} placeholder="ABC Traders" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Product Type</Label>
                  <Select value={selectedProduct} onValueChange={(v) => { setSelectedProduct(v); set('productType', v); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Fabric Type</Label>
                  <Select value={form.fabricType} onValueChange={(v) => set('fabricType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FABRICS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Weaving Technique</Label>
                  <Select value={form.weavingTechnique} onValueChange={(v) => set('weavingTechnique', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TECHNIQUES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Quantity Produced</Label>
                  <Input type="number" min="1" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Production Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Production End Date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Expected Delivery Date</Label>
                  <Input type="date" value={form.expectedDeliveryDate} onChange={(e) => set('expectedDeliveryDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Actual Delivery Date</Label>
                  <Input type="date" value={form.actualDeliveryDate} onChange={(e) => set('actualDeliveryDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Invoice Amount (₹) *</Label>
                  <Input type="number" min="0" value={form.invoiceAmount} onChange={(e) => set('invoiceAmount', e.target.value)} placeholder="28000" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Cooperative Name</Label>
                  <Select value={form.cooperativeName} onValueChange={(v) => set('cooperativeName', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COOPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Varanasi" />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" />}
                    {submitting ? 'Evaluating...' : 'Upload & Evaluate'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Product Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PRODUCT_SVG[selectedProduct] || PRODUCT_SVG['Silk Saree']} alt={selectedProduct} className="w-full h-full object-cover" />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="font-medium">{selectedProduct}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Fabric</span><span className="font-medium">{form.fabricType}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="font-medium">{form.quantity}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-medium">₹{form.invoiceAmount || '0'}</span></div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex gap-2">
                <ImageIcon className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Sample placeholder image is used. In production, uploaded photos are analyzed by the AI vision module.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
