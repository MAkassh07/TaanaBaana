export interface ParsedVoice {
  quantity?: number;
  fabricType?: string;
  productType?: string;
  buyerName?: string;
  invoiceAmount?: number;
  location?: string;
  matchedFields: string[];
}

const FABRICS = ['cotton', 'silk', 'linen', 'khadi', 'jamdani', 'ikkat', 'ikats', 'banarasi', 'kanchipuram'];
const FABRIC_MAP: Record<string, string> = {
  'ikats': 'Ikkat',
};
const PRODUCTS = ['saree', 'dupatta', 'scarf', 'shawl', 'kurta', 'lungi', 'dhoti', 'bedsheet', 'table runner'];
const PRODUCT_MAP: Record<string, string> = {
  'saree': 'Silk Saree',
  'dupatta': 'Handloom Dupatta',
  'scarf': 'Scarf',
  'shawl': 'Shawl',
  'kurta': 'Kurta Fabric',
  'lungi': 'Lungi',
  'dhoti': 'Dhoti',
  'bedsheet': 'Bedsheet',
  'table runner': 'Table Runner',
};
const LOCATIONS = ['varanasi', 'kanchipuram', 'chanderi', 'pochampally', 'bhagalpur', 'surat', 'jaipur', 'sualkuchi'];

export function parseVoiceTranscript(transcript: string): ParsedVoice {
  const text = transcript.toLowerCase();
  const result: ParsedVoice = { matchedFields: [] };

  // quantity: "12 sarees", "completed 12"
  const qtyMatch = text.match(/(\d+)\s*(sarees?|dupattas?|scarves|scarfs?|shawls?|kurtas?|lungis?|dhotis?|bedsheets?|runners?|units?|pieces?|silk|cotton|linen|khadi|jamdani|ikkat|banarasi|kanchipuram)?/);
  if (qtyMatch) {
    const q = parseInt(qtyMatch[1], 10);
    if (!isNaN(q) && q > 0 && q < 10000) {
      result.quantity = q;
      result.matchedFields.push('quantity');
    }
  }

  // fabric type
  for (const f of FABRICS) {
    if (text.includes(f)) {
      result.fabricType = FABRIC_MAP[f] || f.charAt(0).toUpperCase() + f.slice(1);
      result.matchedFields.push('fabricType');
      break;
    }
  }

  // product type
  for (const p of PRODUCTS) {
    if (text.includes(p)) {
      result.productType = PRODUCT_MAP[p] || p;
      result.matchedFields.push('productType');
      break;
    }
  }

  // invoice amount: "₹28000", "rs 28000", "28000 rupees", "for 28000"
  const amountMatch = text.match(/(?:₹|rs\.?|rupees?|for)\s*(\d{3,7})/i) || text.match(/(\d{4,7})\s*(?:rupees|rs\.?|₹)?/);
  if (amountMatch) {
    const amt = parseInt(amountMatch[1], 10);
    if (amt >= 500 && amt <= 1000000) {
      result.invoiceAmount = amt;
      result.matchedFields.push('invoiceAmount');
    }
  }

  // buyer name: "for ABC Traders", "to ABC Traders"
  const buyerMatch = transcript.match(/(?:for|to|from|buyer[:\s]+)\s*([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})/);
  if (buyerMatch) {
    result.buyerName = buyerMatch[1].trim();
    result.matchedFields.push('buyerName');
  }

  // location
  for (const loc of LOCATIONS) {
    if (text.includes(loc)) {
      result.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      result.matchedFields.push('location');
      break;
    }
  }

  return result;
}
