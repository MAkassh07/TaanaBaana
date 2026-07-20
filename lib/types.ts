export type Role = 'weaver' | 'admin' | 'cooperative';
export type CreditTier = 'Excellent' | 'Good' | 'Average' | 'Risky';
export type FraudRisk = 'Low' | 'Medium' | 'High';
export type InvoiceStatus = 'Pending' | 'Approved' | 'Financed' | 'Rejected';
export type FundingStatus = 'Eligible' | 'Requested' | 'Disbursed' | 'Repaid' | 'Manual Review';
export type UploadStatus = 'Pending' | 'Evaluated' | 'Flagged' | 'Rejected';
export type VerificationStatus = 'Unverified' | 'Pending' | 'Verified';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface Weaver {
  _id: string;
  userId: string;
  name: string;
  location: string;
  cooperativeId?: string;
  experienceYears: number;
  fabricSpecialties: string[];
  overallCreditScore: number;
  creditTier: CreditTier;
  verificationStatus: VerificationStatus;
  totalUploads: number;
  totalFunded: number;
  createdAt: string;
}

export interface Upload {
  _id: string;
  weaverId: string;
  orderId: string;
  buyerName: string;
  productType: string;
  fabricType: string;
  weavingTechnique: string;
  quantity: number;
  startDate: string;
  endDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string;
  invoiceAmount: number;
  cooperativeName: string;
  location: string;
  imageUrls: string[];
  voiceTranscript?: string;
  status: UploadStatus;
  createdAt: string;
}

export interface EvaluationMetrics {
  photoClarity: number;
  visibleDefects: number;
  completion: number;
  consistency: number;
  fabricFinish: number;
  complexityBonus: number;
  daysLate: number;
  daysEarly: number;
  unitsPerDay: number;
  benchmarkRate: number;
  unitPrice: number;
  marketMin: number;
  marketMax: number;
  duplicateFlags: number;
  missingFields: number;
}

export interface Evaluation {
  _id: string;
  uploadId: string;
  weaverId: string;
  qualityScore: number;
  deliveryScore: number;
  productivityScore: number;
  cooperativeTrustScore: number;
  invoiceCredibilityScore: number;
  fraudRisk: FraudRisk;
  fraudFlags: string[];
  finalCreditScore: number;
  creditTier: CreditTier;
  metrics: EvaluationMetrics;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  uploadId: string;
  weaverId: string;
  buyerName: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  credibilityScore: number;
  createdAt: string;
}

export interface FundingRequest {
  _id: string;
  weaverId: string;
  uploadId: string;
  requestedAmount: number;
  eligibleMaxAmount: number;
  interestRate: number;
  status: FundingStatus;
  repaymentTermMonths: number;
  createdAt: string;
}

export interface InsurancePlan {
  _id: string;
  weaverId?: string;
  planName: string;
  coverageAmount: number;
  monthlyPremium: number;
  status: 'Available' | 'Active' | 'Lapsed';
  recommendedReason: string;
  createdAt: string;
}

export interface Cooperative {
  _id: string;
  name: string;
  location: string;
  weaverCount: number;
  trustRating: number;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface CreditHistory {
  _id: string;
  weaverId: string;
  score: number;
  evaluationId: string;
  changeDelta: number;
  timestamp: string;
}

export interface FundingEligibility {
  weaverId: string;
  finalCreditScore: number;
  creditTier: CreditTier;
  eligiblePercentage: number;
  interestRate: number;
  eligibleMaxAmount: number;
  manualReview: boolean;
}

export interface DashboardStats {
  todayUploads: number;
  totalUploads: number;
  totalFunding: number;
  pendingInvoices: number;
  totalWeavers: number;
  averageCreditScore: number;
  activeInsurance: number;
  flaggedUploads: number;
}

export interface CreditTrendPoint {
  label: string;
  score: number;
}

export interface ProductionPoint {
  label: string;
  units: number;
}

export interface FabricDistribution {
  fabric: string;
  count: number;
}
