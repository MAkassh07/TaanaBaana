import type {
  User, Weaver, Upload, Evaluation, Invoice, FundingRequest,
  InsurancePlan, Cooperative, CreditHistory, EvaluationMetrics,
  CreditTier, FraudRisk, VerificationStatus, UploadStatus,
} from './types';
import { evaluateUpload } from './evaluation-engine';

function id(prefix: string, n: number): string {
  return `${prefix}_${String(n).padStart(4, '0')}`;
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

const FABRICS = ['Cotton', 'Silk', 'Linen', 'Khadi', 'Jamdani', 'Ikkat', 'Banarasi', 'Kanchipuram'];
const PRODUCTS = ['Silk Saree', 'Cotton Saree', 'Handloom Dupatta', 'Scarf', 'Shawl', 'Kurta Fabric', 'Lungi', 'Dhoti', 'Bedsheet', 'Table Runner'];
const TECHNIQUES = ['Handloom', 'Jacquard', 'Pit Loom', 'Frame Loom', 'Fly Shuttle'];
const BUYERS = ['ABC Traders', 'Heritage Textiles', 'Loom & Co', 'Sundari Silks', 'Banaras Handloom', 'Kanchi Weaves', 'Khadi Bhandar', 'Royal Fabrics'];
const COOPS = ['Varanasi Weavers Coop', 'Kanchipuram Silk Society', 'Khadi Gramodyog', 'Chanderi Handloom Cluster', 'Pochampally Ikkat Society'];
const LOCATIONS = ['Varanasi', 'Kanchipuram', 'Chanderi', 'Pochampally', 'Bhagalpur', 'Surat', 'Jaipur', 'Sualkuchi'];
const SVG_MAP: Record<string, string> = {
  'Silk Saree': 'silk-saree.svg',
  'Cotton Saree': 'cotton-saree.svg',
  'Handloom Dupatta': 'handloom-dupatta.svg',
  'Scarf': 'scarf.svg',
  'Shawl': 'shawl.svg',
  'Kurta Fabric': 'kurta-fabric.svg',
  'Lungi': 'lungi.svg',
  'Dhoti': 'dhoti.svg',
  'Bedsheet': 'bedsheet.svg',
  'Table Runner': 'table-runner.svg',
};

export interface DB {
  users: User[];
  weavers: Weaver[];
  uploads: Upload[];
  evaluations: Evaluation[];
  invoices: Invoice[];
  fundingRequests: FundingRequest[];
  insurancePlans: InsurancePlan[];
  cooperatives: Cooperative[];
  creditHistory: CreditHistory[];
}

let db: DB | null = null;

function tier(score: number): CreditTier {
  if (score > 800) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Average';
  return 'Risky';
}

function generateSeed(): DB {
  const users: User[] = [];
  const weavers: Weaver[] = [];
  const cooperatives: Cooperative[] = [];
  const uploads: Upload[] = [];
  const evaluations: Evaluation[] = [];
  const invoices: Invoice[] = [];
  const fundingRequests: FundingRequest[] = [];
  const insurancePlans: InsurancePlan[] = [];
  const creditHistory: CreditHistory[] = [];

  // 5 cooperatives
  COOPS.forEach((name, i) => {
    cooperatives.push({
      _id: id('coop', i + 1),
      name,
      location: pick(LOCATIONS, i),
      weaverCount: 8 + (i % 5) * 3,
      trustRating: 70 + (i % 3) * 10,
      verificationStatus: i < 3 ? 'Verified' : 'Pending',
      createdAt: dateOffset(-200 - i * 5),
    });
  });

  // 50 weavers
  const firstNames = ['Ramesh', 'Suresh', 'Anil', 'Kamal', 'Vijay', 'Rajesh', 'Mohan', 'Sita', 'Gita', 'Lakshmi', 'Deepak', 'Arjun', 'Kiran', 'Meena', 'Pooja', 'Naveen', 'Ravi', 'Sanjay', 'Vikram', 'Aditya'];
  const lastNames = ['Sharma', 'Verma', 'Yadav', 'Reddy', 'Nair', 'Das', 'Gupta', 'Singh', 'Patel', 'Iyer'];
  for (let i = 0; i < 50; i++) {
    const uid = id('user', i + 1);
    const wid = id('weaver', i + 1);
    const name = `${pick(firstNames, i)} ${pick(lastNames, i * 3)}`;
    const coop = pick(cooperatives, i);
    const fabricCount = 1 + (i % 3);
    const specs = Array.from({ length: fabricCount }, (_, k) => pick(FABRICS, i + k * 3));
    const scoreBase = 560 + ((i * 37) % 340);
    users.push({
      _id: uid, name, email: `weaver${i + 1}@taanabaana.in`, role: 'weaver',
      createdAt: dateOffset(-180 - i * 2),
    });
    weavers.push({
      _id: wid, userId: uid, name, location: pick(LOCATIONS, i * 2),
      cooperativeId: coop._id, experienceYears: 2 + (i % 25),
      fabricSpecialties: Array.from(new Set(specs)),
      overallCreditScore: scoreBase, creditTier: tier(scoreBase),
      verificationStatus: i % 4 === 0 ? 'Unverified' : i % 3 === 0 ? 'Pending' : 'Verified',
      totalUploads: 0, totalFunded: 0, createdAt: dateOffset(-180 - i * 2),
    });
  }

  // 30 uploads with evaluations
  const invoiceAmounts = [8000, 15000, 28000, 40000, 62000];
  for (let i = 0; i < 30; i++) {
    const weaver = pick(weavers, i);
    const product = pick(PRODUCTS, i * 2);
    const fabric = pick(FABRICS, i);
    const qty = 1 + (i % 12);
    const amount = pick(invoiceAmounts, i) + (i % 5) * 500;
    const startDays = -60 - (i % 30) * 3;
    const prodDays = 5 + (i % 20);
    const expectedDelivery = startDays + prodDays + 3;
    const deliveryVariation = (i % 7) - 3; // -3..3 days
    const actualDelivery = expectedDelivery + deliveryVariation;

    const uploadId = id('up', i + 1);
    const svg = SVG_MAP[product] || 'cotton-saree.svg';
    const imageUrls = [`/sample-products/${svg}`];
    if (i % 3 === 0) imageUrls.push('/sample-products/shawl.svg');

    const upload: Upload = {
      _id: uploadId,
      weaverId: weaver._id,
      orderId: `ORD-${2024}-${String(1000 + i)}`,
      buyerName: pick(BUYERS, i),
      productType: product,
      fabricType: fabric,
      weavingTechnique: pick(TECHNIQUES, i),
      quantity: qty,
      startDate: dateOffset(startDays),
      endDate: dateOffset(startDays + prodDays),
      expectedDeliveryDate: dateOffset(expectedDelivery),
      actualDeliveryDate: dateOffset(actualDelivery),
      invoiceAmount: amount,
      cooperativeName: cooperatives.find(c => c._id === weaver.cooperativeId)?.name || COOPS[0],
      location: weaver.location,
      imageUrls,
      voiceTranscript: i % 2 === 0 ? `Completed ${qty} ${fabric.toLowerCase()} ${product.toLowerCase()} for ${pick(BUYERS, i)}.` : undefined,
      status: 'Pending',
      createdAt: dateOffset(actualDelivery - 1),
    };
    uploads.push(upload);

    const evalResult = evaluateUpload(upload, weaver, uploads.slice(0, i), cooperatives, weavers);
    evaluations.push(evalResult.evaluation);
    weaver.overallCreditScore = Math.round((weaver.overallCreditScore + evalResult.evaluation.finalCreditScore) / 2);
    weaver.creditTier = tier(weaver.overallCreditScore);
    weaver.totalUploads += 1;

    creditHistory.push({
      _id: id('ch', i + 1),
      weaverId: weaver._id,
      score: evalResult.evaluation.finalCreditScore,
      evaluationId: evalResult.evaluation._id,
      changeDelta: evalResult.evaluation.finalCreditScore - weaver.overallCreditScore,
      timestamp: upload.createdAt,
    });

    // 15 invoices
    if (i < 15) {
      invoices.push({
        _id: id('inv', i + 1),
        uploadId, weaverId: weaver._id,
        buyerName: upload.buyerName,
        amount,
        dueDate: dateOffset(actualDelivery + 30),
        status: i % 4 === 0 ? 'Pending' : i % 4 === 1 ? 'Approved' : i % 4 === 2 ? 'Financed' : 'Rejected',
        credibilityScore: evalResult.evaluation.invoiceCredibilityScore,
        createdAt: upload.createdAt,
      });
    }

    // 15 funding requests
    if (i < 15) {
      const elig = evalResult.eligibility;
      fundingRequests.push({
        _id: id('fund', i + 1),
        weaverId: weaver._id,
        uploadId,
        requestedAmount: Math.round(elig.eligibleMaxAmount * 0.85),
        eligibleMaxAmount: elig.eligibleMaxAmount,
        interestRate: elig.interestRate,
        status: i % 5 === 0 ? 'Eligible' : i % 5 === 1 ? 'Requested' : i % 5 === 2 ? 'Disbursed' : i % 5 === 3 ? 'Repaid' : 'Manual Review',
        repaymentTermMonths: 3 + (i % 9),
        createdAt: upload.createdAt,
      });
      if (i % 5 === 2) weaver.totalFunded += Math.round(elig.eligibleMaxAmount * 0.85);
    }
  }

  // 5 insurance plans
  const plans = [
    { name: 'Artisan Loom & Health Protection', coverage: 100000, premium: 199, reason: 'Covers loom damage and weaver health emergencies' },
    { name: 'Silk Weaver Comprehensive', coverage: 250000, premium: 399, reason: 'Tailored for silk weavers with income protection' },
    { name: 'Handloom Family Shield', coverage: 150000, premium: 249, reason: 'Family coverage including spouse and children' },
    { name: 'Crop & Yarn Insurance', coverage: 80000, premium: 149, reason: 'Protects against raw material price volatility' },
    { name: 'Premier Weaver Elite', coverage: 500000, premium: 799, reason: 'Top-tier coverage for master weavers with high turnover' },
  ];
  plans.forEach((p, i) => {
    insurancePlans.push({
      _id: id('ins', i + 1),
      weaverId: i < 3 ? pick(weavers, i * 7)._id : undefined,
      planName: p.name, coverageAmount: p.coverage, monthlyPremium: p.premium,
      status: i < 3 ? 'Active' : 'Available', recommendedReason: p.reason,
      createdAt: dateOffset(-30 - i * 3),
    });
  });

  return { users, weavers, uploads, evaluations, invoices, fundingRequests, insurancePlans, cooperatives, creditHistory };
}

export function getDB(): DB {
  if (!db) {
    db = generateSeed();
  }
  return db;
}

export function resetDB(): DB {
  db = generateSeed();
  return db;
}

export function addUpload(upload: Upload): { upload: Upload; evaluation: Evaluation } {
  const d = getDB();
  d.uploads.push(upload);
  const weaver = d.weavers.find(w => w._id === upload.weaverId);
  if (!weaver) throw new Error('Weaver not found');
  const result = evaluateUpload(upload, weaver, d.uploads.slice(0, -1), d.cooperatives, d.weavers);
  d.evaluations.push(result.evaluation);
  weaver.overallCreditScore = Math.round((weaver.overallCreditScore + result.evaluation.finalCreditScore) / 2);
  weaver.creditTier = tier(weaver.overallCreditScore);
  weaver.totalUploads += 1;
  d.creditHistory.push({
    _id: id('ch', d.creditHistory.length + 1),
    weaverId: weaver._id,
    score: result.evaluation.finalCreditScore,
    evaluationId: result.evaluation._id,
    changeDelta: result.evaluation.finalCreditScore - weaver.overallCreditScore,
    timestamp: new Date().toISOString(),
  });
  return { upload, evaluation: result.evaluation };
}
