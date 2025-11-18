// Income Tax Constants for FY 2025-26 (AY 2026-27)
// Based on official Income Tax Department rules

export type AgeCategory = 'below60' | '60to79' | '80plus';
export type TaxRegime = 'new' | 'old';
export type FinancialYear = '2025-26' | '2024-25' | '2023-24';

// Tax Slabs for New Regime (Section 115BAC) - FY 2025-26
export const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Infinity, rate: 30 },
];

// Tax Slabs for Old Regime - FY 2025-26
export const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

// Senior Citizen Exemption Limits (Old Regime only)
export const SENIOR_CITIZEN_EXEMPTION = {
  below60: 250000,
  '60to79': 300000,
  '80plus': 500000,
};

// Standard Deduction
export const STANDARD_DEDUCTION = {
  new: 75000, // New Regime FY 2025-26
  old: 50000, // Old Regime
};

// Section 87A Rebate Limits
export const REBATE_87A = {
  new: {
    maxTaxableIncome: 1200000, // Up to ₹12L taxable income
    rebateAmount: 60000, // ₹60,000 or tax amount, whichever is less (FY 2025-26)
  },
  old: {
    maxTaxableIncome: 700000, // Up to ₹7L taxable income
    rebateAmount: 25000, // ₹25,000 or tax amount, whichever is less
  },
};

// Deduction Limits
export const DEDUCTION_LIMITS = {
  section80C: 150000, // Max ₹1,50,000
  section80CCD1B: 50000, // NPS additional (max ₹50,000)
  section80D: {
    self: 25000, // Self & family (₹25,000, ₹50,000 for senior citizens)
    parents: 25000, // Parents (₹25,000, ₹50,000 for senior parents)
  },
  section80EE: 50000, // First home loan interest (max ₹50,000)
  section80EEA: 150000, // Affordable home loan interest (max ₹1,50,000)
  section80E: Infinity, // Education loan interest (no limit, subject to conditions)
  section80G: Infinity, // Donations (varies by organization type)
  section80TTA: 10000, // Savings interest exemption (₹10,000)
  section80TTB: 50000, // Senior citizen savings interest (₹50,000)
  section80U: {
    disability: 75000, // 40-80% disability
    severeDisability: 125000, // 80%+ disability
  },
  section24b: 200000, // Home loan interest for self-occupied (max ₹2,00,000 in Old Regime)
};

// Capital Gains Exemptions
export const CAPITAL_GAINS_EXEMPTION = {
  equityLTCG: 100000, // Equity LTCG exemption (₹1,00,000, increased to ₹1,25,000 from FY 2025-26)
  equityLTCG_FY2025: 125000, // ₹1,25,000 from FY 2025-26
};

// Surcharge Rates
export const SURCHARGE_RATES = [
  { min: 0, max: 5000000, rate: 0 },
  { min: 5000000, max: 10000000, rate: 10 },
  { min: 10000000, max: 20000000, rate: 15 },
  { min: 20000000, max: 50000000, rate: 25 },
  { min: 50000000, max: 100000000, rate: 25 },
  { min: 100000000, max: Infinity, rate: 37 },
];

// Cess Rate
export const CESS_RATE = 4; // Health & Education Cess: 4%

// Crypto/Digital Assets Tax Rate
export const CRYPTO_TAX_RATE = 30; // 30% flat rate + 4% cess = 31.2% total

// Capital Gains Tax Rates
export const CAPITAL_GAINS_RATES = {
  equitySTCG: 15, // Equity STCG: 15%
  equityLTCG: 10, // Equity LTCG: 10% on gains above exemption
  propertySTCG: 0, // Property STCG: As per income tax slab
  propertyLTCG: {
    oldRule: 20, // With indexation (property bought before July 2024)
    newRule: 12.5, // Without indexation (property bought after July 2024)
  },
  debtSTCG: 0, // Debt STCG: As per income tax slab
  debtLTCG: {
    withIndexation: 20,
    withoutIndexation: 12.5,
  },
};

