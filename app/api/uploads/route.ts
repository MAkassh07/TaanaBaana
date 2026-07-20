import { NextResponse } from 'next/server';
import { getDB, addUpload } from '@/lib/db';
import type { Upload } from '@/lib/types';
import { parseVoiceTranscript } from '@/lib/voice-parser';

export const dynamic = 'force-dynamic';

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;
}

export async function GET() {
  const db = getDB();
  return NextResponse.json({ uploads: db.uploads });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDB();

    const weaverId = body.weaverId || db.weavers[0]?._id;
    const weaver = db.weavers.find(w => w._id === weaverId);
    if (!weaver) {
      return NextResponse.json({ error: 'Weaver not found' }, { status: 404 });
    }

    // Voice AI auto-fill: if transcript provided, parse and merge into missing fields
    let merged = { ...body };
    let voiceTranscript = body.voiceTranscript as string | undefined;
    if (body.simulateVoice && !voiceTranscript) {
      voiceTranscript = `Completed ${body.quantity || 8} ${body.fabricType || 'silk'} ${body.productType || 'saree'} for ${body.buyerName || 'ABC Traders'} at ${body.invoiceAmount || 28000} in ${body.location || 'Varanasi'}.`;
    }
    if (voiceTranscript) {
      const parsed = parseVoiceTranscript(voiceTranscript);
      merged = {
        ...merged,
        quantity: merged.quantity || parsed.quantity,
        fabricType: merged.fabricType || parsed.fabricType,
        productType: merged.productType || parsed.productType,
        buyerName: merged.buyerName || parsed.buyerName,
        invoiceAmount: merged.invoiceAmount || parsed.invoiceAmount,
        location: merged.location || parsed.location,
      };
      merged.voiceTranscript = voiceTranscript;
      merged.parsedVoice = parsed;
    }

    const upload: Upload = {
      _id: genId('up'),
      weaverId,
      orderId: merged.orderId || `ORD-${Date.now()}`,
      buyerName: merged.buyerName || 'Unknown Buyer',
      productType: merged.productType || 'Cotton Saree',
      fabricType: merged.fabricType || 'Cotton',
      weavingTechnique: merged.weavingTechnique || 'Handloom',
      quantity: Number(merged.quantity) || 1,
      startDate: merged.startDate || new Date(Date.now() - 30 * 86400000).toISOString(),
      endDate: merged.endDate || new Date(Date.now() - 5 * 86400000).toISOString(),
      expectedDeliveryDate: merged.expectedDeliveryDate || new Date(Date.now() - 2 * 86400000).toISOString(),
      actualDeliveryDate: merged.actualDeliveryDate || new Date().toISOString(),
      invoiceAmount: Number(merged.invoiceAmount) || 0,
      cooperativeName: merged.cooperativeName || 'Varanasi Weavers Coop',
      location: merged.location || weaver.location,
      imageUrls: Array.isArray(merged.imageUrls) && merged.imageUrls.length > 0
        ? merged.imageUrls
        : ['/sample-products/cotton-saree.svg'],
      voiceTranscript: merged.voiceTranscript,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const { upload: saved, evaluation } = addUpload(upload);

    return NextResponse.json({
      upload: saved,
      evaluation,
      parsedVoice: merged.parsedVoice,
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
