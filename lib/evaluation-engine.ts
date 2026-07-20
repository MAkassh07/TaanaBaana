import type {
  Upload, Weaver, Evaluation, EvaluationMetrics,
  FraudRisk, CreditTier, FundingEligibility, Cooperative,
} from './types';

function id(prefix: string, n: number): string {
  return `${prefix}_${String(n).padStart(4, '0')}`;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function tier(score: number): CreditTier {
  if (score > 800) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Average';
  return 'Risky';
}

// Market benchmark unit price ranges (₹ per unit) by fabric
const MARKET_BENCHMARKS: Record<string, { min: number; max: number; complexity: number }> = {
  Cotton: { min: 800, max: 2500, complexity: 5 },
  Silk: { min: 2000, max: 5000, complexity: 15 },
  Linen: { min: 1000, max: 3000, complexity: 8 },
  Khadi: { min: 700, max: 2200, complexity: 10 },
  Jamdani: { min: 3500, max: 8000, complexity: 20 },
  Ikkat: { min: 2500, max: 6000, complexity: 18 },
  Banarasi: { min: 3000, max: 7000, complexity: 17 },
  Kanchipuram: { min: 4000, max: 9000, complexity: 19 },
};

// Benchmark production rates (units per day) by fabric
const BENCHMARK_RATES: Record<string, number> = {
  Cotton: 2,
  Silk: 0.5,
  Linen: 1.5,
  Khadi: 1.2,
  Jamdani: 0.3,
  Ikkat: 0.4,
  Banarasi: 0.35,
  Kanchipuram: 0.3,
};

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

// Deterministic pseudo-hash for image duplicate detection (no randomness)
function imageHash(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h * 31 + url.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

export function evaluateUpload(
  upload: Upload,
  weaver: Weaver,
  previousUploads: Upload[],
  cooperatives: Cooperative[],
  allWeavers: Weaver[],
): { evaluation: Evaluation; eligibility: FundingEligibility } {

  // ----- Quality Score -----
  const benchmark = MARKET_BENCHMARKS[upload.fabricType] || MARKET_BENCHMARKS.Cotton;
  const hasImage = upload.imageUrls.length > 0;
  const imageCount = upload.imageUrls.length;
  // photo clarity: more images -> higher clarity (deterministic)
  const photoClarity = clamp(60 + imageCount * 12 + (hasImage ? 10 : -40));
  // visible defects: fewer images and lower consistency -> more defects
  const visibleDefects = clamp(100 - photoClarity - 15);
  // completion: based on quantity produced vs ordered (assume ordered = quantity for now)
  const completion = clamp(100);
  // consistency: weaver's history consistency
  const consistency = clamp(70 + Math.min(30, weaver.totalUploads * 5));
  // fabric finish: technique complexity bonus
  const fabricFinish = clamp(65 + benchmark.complexity + (weaver.experienceYears > 10 ? 15 : 5));
  const complexityBonus = benchmark.complexity;

  const qualityScore = Math.round(clamp(
    0.25 * photoClarity +
    0.15 * (100 - visibleDefects) +
    0.20 * completion +
    0.20 * consistency +
    0.20 * fabricFinish
  ));

  // ----- Delivery Reliability Score -----
  const lateDays = Math.max(0, daysBetween(upload.expectedDeliveryDate, upload.actualDeliveryDate));
  const daysEarly = Math.max(0, daysBetween(upload.actualDeliveryDate, upload.expectedDeliveryDate));
  let deliveryScore = clamp(100 - lateDays * 15);
  if (daysEarly > 0) deliveryScore = clamp(deliveryScore + Math.min(5, daysEarly * 1));
  deliveryScore = Math.round(deliveryScore);

  // ----- Productivity Score -----
  const productionDays = Math.max(1, daysBetween(upload.startDate, upload.endDate));
  const unitsPerDay = upload.quantity / productionDays;
  const benchmarkRate = BENCHMARK_RATES[upload.fabricType] || 1;
  const efficiencyRatio = unitsPerDay / benchmarkRate;
  let productivityScore = clamp(50 + efficiencyRatio * 40);
  if (efficiencyRatio > 1.2) productivityScore = clamp(productivityScore + 10);
  productivityScore = Math.round(productivityScore);

  // ----- Cooperative Trust Score -----
  const coop = cooperatives.find(c => c.name === upload.cooperativeName);
  let coopTrust = 50;
  if (coop) {
    coopTrust += coop.trustRating * 0.3;
    if (coop.verificationStatus === 'Verified') coopTrust += 15;
    else if (coop.verificationStatus === 'Pending') coopTrust += 5;
  }
  if (weaver.verificationStatus === 'Verified') coopTrust += 15;
  else if (weaver.verificationStatus === 'Pending') coopTrust += 5;
  // history of completed works
  const completedWorks = previousUploads.filter(u => u.weaverId === weaver._id).length;
  coopTrust += Math.min(20, completedWorks * 4);
  const cooperativeTrustScore = Math.round(clamp(coopTrust));

  // ----- Invoice Credibility -----
  const unitPrice = upload.invoiceAmount / Math.max(1, upload.quantity);
  const marketMin = benchmark.min;
  const marketMax = benchmark.max;
  let invoiceCredibility = 80;
  if (unitPrice < marketMin * 0.5 || unitPrice > marketMax * 2) {
    invoiceCredibility -= 40;
  } else if (unitPrice < marketMin * 0.8 || unitPrice > marketMax * 1.5) {
    invoiceCredibility -= 20;
  } else if (unitPrice >= marketMin && unitPrice <= marketMax) {
    invoiceCredibility += 15;
  }
  // duplicate order id check
  const dupOrderId = previousUploads.some(u => u.orderId === upload.orderId);
  if (dupOrderId) invoiceCredibility -= 30;
  // buyer history
  const buyerHistory = previousUploads.filter(u => u.buyerName === upload.buyerName).length;
  if (buyerHistory > 0) invoiceCredibility += Math.min(10, buyerHistory * 2);
  const invoiceCredibilityScore = Math.round(clamp(invoiceCredibility));

  // ----- Fraud Risk Detection -----
  const fraudFlags: string[] = [];
  let fraudPenalty = 0;

  // duplicate image upload
  const uploadHashes = upload.imageUrls.map(imageHash);
  const prevHashes = new Set(previousUploads.flatMap(u => u.imageUrls.map(imageHash)));
  const dupImages = uploadHashes.some(h => prevHashes.has(h));
  if (dupImages) {
    fraudFlags.push('Duplicate image detected in previous uploads');
    fraudPenalty += 0.15;
  }

  // invoice mismatch (amount vs unit price extreme)
  if (unitPrice > marketMax * 3 || unitPrice < marketMin * 0.2) {
    fraudFlags.push('Invoice amount extreme variance from market benchmark');
    fraudPenalty += 0.12;
  }

  // unusual amount (very high)
  if (upload.invoiceAmount > 200000) {
    fraudFlags.push('Unusual invoice amount exceeds ₹2,00,000');
    fraudPenalty += 0.08;
  }

  // negative delivery timeline (actual before start)
  if (daysBetween(upload.startDate, upload.actualDeliveryDate) < 0) {
    fraudFlags.push('Delivery date before production start date');
    fraudPenalty += 0.10;
  }

  // missing data check
  const requiredFields = ['orderId', 'buyerName', 'productType', 'fabricType', 'quantity', 'invoiceAmount'];
  const missingFields = requiredFields.filter(f => !upload[f as keyof Upload]).length;
  if (missingFields > 0) {
    fraudFlags.push(`${missingFields} critical field(s) missing`);
    fraudPenalty += missingFields * 0.05;
  }

  // duplicate order id
  if (dupOrderId) {
    fraudFlags.push('Duplicate Order ID detected');
    fraudPenalty += 0.10;
  }

  let fraudRisk: FraudRisk = 'Low';
  if (fraudPenalty >= 0.25) fraudRisk = 'High';
  else if (fraudPenalty >= 0.10) fraudRisk = 'Medium';

  const metrics: EvaluationMetrics = {
    photoClarity: Math.round(photoClarity),
    visibleDefects: Math.round(visibleDefects),
    completion: Math.round(completion),
    consistency: Math.round(consistency),
    fabricFinish: Math.round(fabricFinish),
    complexityBonus,
    daysLate: lateDays,
    daysEarly,
    unitsPerDay: Number(unitsPerDay.toFixed(2)),
    benchmarkRate,
    unitPrice: Math.round(unitPrice),
    marketMin,
    marketMax,
    duplicateFlags: dupImages ? 1 : 0,
    missingFields,
  };

  // ----- Final Credit Score (300-900) -----
  const weighted =
    0.30 * qualityScore +
    0.25 * deliveryScore +
    0.15 * productivityScore +
    0.15 * cooperativeTrustScore +
    0.10 * invoiceCredibilityScore;

  const finalCreditScore = Math.round(300 + 600 * Math.max(0, weighted / 100 - fraudPenalty));
  const clampedScore = Math.max(300, Math.min(900, finalCreditScore));
  const creditTier = tier(clampedScore);

  const evaluation: Evaluation = {
    _id: id('eval', Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000)),
    uploadId: upload._id,
    weaverId: weaver._id,
    qualityScore,
    deliveryScore,
    productivityScore,
    cooperativeTrustScore,
    invoiceCredibilityScore,
    fraudRisk,
    fraudFlags,
    finalCreditScore: clampedScore,
    creditTier,
    metrics,
    createdAt: new Date().toISOString(),
  };

  // ----- Funding Eligibility -----
  let eligiblePercentage = 0;
  let interestRate = 0;
  let manualReview = false;
  if (clampedScore > 800) { eligiblePercentage = 80; interestRate = 8; }
  else if (clampedScore >= 700) { eligiblePercentage = 70; interestRate = 10; }
  else if (clampedScore >= 600) { eligiblePercentage = 60; interestRate = 12; }
  else { eligiblePercentage = 0; interestRate = 0; manualReview = true; }

  const eligibleMaxAmount = Math.round(upload.invoiceAmount * (eligiblePercentage / 100));

  const eligibility: FundingEligibility = {
    weaverId: weaver._id,
    finalCreditScore: clampedScore,
    creditTier,
    eligiblePercentage,
    interestRate,
    eligibleMaxAmount,
    manualReview,
  };

  return { evaluation, eligibility };
}

export function computeEligibility(score: number, invoiceAmount: number): FundingEligibility {
  let eligiblePercentage = 0, interestRate = 0, manualReview = false;
  if (score > 800) { eligiblePercentage = 80; interestRate = 8; }
  else if (score >= 700) { eligiblePercentage = 70; interestRate = 10; }
  else if (score >= 600) { eligiblePercentage = 60; interestRate = 12; }
  else { manualReview = true; }
  return {
    weaverId: '', finalCreditScore: score, creditTier: tier(score),
    eligiblePercentage, interestRate,
    eligibleMaxAmount: Math.round(invoiceAmount * (eligiblePercentage / 100)),
    manualReview,
  };
}
