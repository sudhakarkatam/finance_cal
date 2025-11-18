// German Income Tax Calculation Functions
// Based on German tax law § 32a EStG (Einkommensteuergesetz)

import {
  type GermanTaxClass,
  type GermanState,
  TAX_CLASSES,
  BASIC_ALLOWANCE,
  SOLIDARITY_SURCHARGE,
  CHURCH_TAX_RATES,
  SOCIAL_SECURITY,
  DEDUCTIONS,
  TAX_CLASS_MULTIPLIERS,
} from './germanTaxConstants';

export interface GermanTaxInputs {
  grossIncome: number; // Annual gross income in €
  taxClass: GermanTaxClass;
  state: GermanState;
  isChurchMember: boolean;
  age: number;
  children: number;
  // Deductions
  workRelatedExpenses: number; // Werbungskosten
  specialExpenses: number; // Sonderausgaben (insurance, donations)
  extraordinaryBurdens: number; // Außergewöhnliche Belastungen (medical)
  // Social Security
  healthInsuranceType: 'public' | 'private' | 'exempt';
  healthInsuranceCost?: number; // Monthly cost if private
  // Additional
  isSecondJob?: boolean; // For Class VI
}

export interface GermanTaxResult {
  grossIncome: number;
  deductions: {
    workRelatedExpenses: number;
    specialExpenses: number;
    extraordinaryBurdens: number;
    childAllowances: number;
    singleParentAllowance: number;
    basicAllowance: number;
    totalDeductions: number;
  };
  taxableIncome: number;
  incomeTax: number;
  solidaritySurcharge: number;
  churchTax: number;
  totalTaxes: number;
  socialSecurity: {
    healthInsurance: number;
    pensionInsurance: number;
    unemploymentInsurance: number;
    longTermCareInsurance: number;
    total: number;
  };
  netIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  monthly: {
    grossIncome: number;
    totalTaxes: number;
    socialSecurity: number;
    netIncome: number;
  };
}

/**
 * Calculate German income tax using progressive formula (§ 32a EStG) for 2025
 * This uses the piecewise linear function as per German tax law
 * Based on official 2025 tax brackets and formulas
 */
function calculateIncomeTaxFromBrackets(taxableIncome: number, isMarried: boolean): number {
  if (taxableIncome <= 0) return 0;

  // For married couples, divide income by 2, calculate tax, then multiply by 2
  // This is the "Ehegattensplitting" (income splitting) method
  const income = isMarried ? taxableIncome / 2 : taxableIncome;
  const multiplier = isMarried ? 2 : 1;

  let tax = 0;

  if (income <= 12096) {
    // Tax-free zone: Up to €12,096
    tax = 0;
  } else if (income <= 17430) {
    // Zone 1: €12,097 to €17,430 (progressive from 14% to 24%)
    // Formula: T = (922.98 * Y + 1,400) * Y
    // where Y = (X - 12,096) / 10,000
    const Y = (income - 12096) / 10000;
    tax = (922.98 * Y + 1400) * Y;
  } else if (income <= 68429) {
    // Zone 2: €17,431 to €68,429 (progressive from 24% to 42%)
    // Formula: T = (181.19 * Z + 2,397) * Z + 1,025.38
    // where Z = (X - 17,430) / 10,000
    const Z = (income - 17430) / 10000;
    tax = (181.19 * Z + 2397) * Z + 1025.38;
  } else if (income <= 277825) {
    // Zone 3: €68,430 to €277,825 (42% flat)
    // Formula: T = 0.42 * X - 10,602.13
    tax = 0.42 * income - 10602.13;
  } else {
    // Zone 4: Above €277,826 (45% flat)
    // Formula: T = 0.45 * X - 18,936.88
    tax = 0.45 * income - 18936.88;
  }

  // Round to 2 decimal places and apply multiplier
  return Math.round(tax * multiplier * 100) / 100;
}

/**
 * Calculate income tax considering tax class
 */
function calculateIncomeTaxByClass(
  taxableIncome: number,
  taxClass: GermanTaxClass
): number {
  const isMarried = taxClass === 'III' || taxClass === 'IV' || taxClass === 'V';
  
  if (taxClass === 'VI') {
    // Class VI has no tax-free allowance
    return calculateIncomeTaxFromBrackets(taxableIncome + BASIC_ALLOWANCE.single, false);
  }

  // For Class V (lower-earning spouse), calculate differently
  // Class V pays more upfront but gets refunded in tax return
  if (taxClass === 'V') {
    // No basic allowance for Class V (already used by Class III spouse)
    return calculateIncomeTaxFromBrackets(taxableIncome, false);
  }

  return calculateIncomeTaxFromBrackets(taxableIncome, isMarried);
}

/**
 * Calculate solidarity surcharge
 */
function calculateSolidaritySurcharge(
  incomeTax: number,
  isMarried: boolean
): number {
  const threshold = isMarried
    ? SOLIDARITY_SURCHARGE.threshold.married
    : SOLIDARITY_SURCHARGE.threshold.single;

  if (incomeTax <= threshold) {
    return 0;
  }

  return Math.round(incomeTax * SOLIDARITY_SURCHARGE.rate * 100) / 100;
}

/**
 * Calculate church tax
 */
function calculateChurchTax(
  incomeTax: number,
  state: GermanState,
  isChurchMember: boolean
): number {
  if (!isChurchMember || incomeTax <= 0) {
    return 0;
  }

  const rate = CHURCH_TAX_RATES[state];
  return Math.round(incomeTax * rate * 100) / 100;
}

/**
 * Calculate social security contributions
 */
function calculateSocialSecurity(
  grossIncome: number,
  age: number,
  children: number,
  healthInsuranceType: 'public' | 'private' | 'exempt',
  healthInsuranceCost?: number
): {
  healthInsurance: number;
  pensionInsurance: number;
  unemploymentInsurance: number;
  longTermCareInsurance: number;
  total: number;
} {
  // Pension Insurance (Rentenversicherung)
  const pensionCeiling = SOCIAL_SECURITY.pension.incomeCeiling;
  const pensionBase = Math.min(grossIncome, pensionCeiling);
  const pensionInsurance = Math.round((pensionBase * SOCIAL_SECURITY.pension.employeeRate) * 100) / 100;

  // Unemployment Insurance (Arbeitslosenversicherung)
  const unemploymentCeiling = SOCIAL_SECURITY.unemployment.incomeCeiling;
  const unemploymentBase = Math.min(grossIncome, unemploymentCeiling);
  const unemploymentInsurance = Math.round((unemploymentBase * SOCIAL_SECURITY.unemployment.employeeRate) * 100) / 100;

  // Health Insurance (Krankenversicherung)
  let healthInsurance = 0;
  if (healthInsuranceType === 'public') {
    const healthCeiling = SOCIAL_SECURITY.health.incomeCeiling;
    const healthBase = Math.min(grossIncome, healthCeiling);
    healthInsurance = Math.round((healthBase * SOCIAL_SECURITY.health.employeeRate) * 100) / 100;
    
    // Apply min/max limits
    const monthlyMin = SOCIAL_SECURITY.health.minimum;
    const monthlyMax = SOCIAL_SECURITY.health.maximum;
    const annualMin = monthlyMin * 12;
    const annualMax = monthlyMax * 12;
    healthInsurance = Math.max(annualMin, Math.min(healthInsurance, annualMax));
  } else if (healthInsuranceType === 'private' && healthInsuranceCost) {
    // Private insurance: employee pays full amount
    healthInsurance = healthInsuranceCost * 12;
  }
  // If exempt, healthInsurance remains 0

  // Long-term Care Insurance (Pflegeversicherung)
  const longTermCareCeiling = SOCIAL_SECURITY.longTermCare.incomeCeiling;
  const longTermCareBase = Math.min(grossIncome, longTermCareCeiling);
  
  // Higher rate if age >= 23 and no children
  const longTermCareRate =
    age >= 23 && children === 0
      ? SOCIAL_SECURITY.longTermCare.employeeMaxAgeRate
      : SOCIAL_SECURITY.longTermCare.employeeStandardRate;
  
  const longTermCareInsurance = Math.round((longTermCareBase * longTermCareRate) * 100) / 100;

  const total = Math.round(
    (healthInsurance + pensionInsurance + unemploymentInsurance + longTermCareInsurance) * 100
  ) / 100;

  return {
    healthInsurance: Math.round(healthInsurance * 100) / 100,
    pensionInsurance: Math.round(pensionInsurance * 100) / 100,
    unemploymentInsurance: Math.round(unemploymentInsurance * 100) / 100,
    longTermCareInsurance: Math.round(longTermCareInsurance * 100) / 100,
    total,
  };
}

/**
 * Main calculation function for German income tax
 */
export function calculateGermanIncomeTax(inputs: GermanTaxInputs): GermanTaxResult {
  const {
    grossIncome,
    taxClass,
    state,
    isChurchMember,
    age,
    children,
    workRelatedExpenses,
    specialExpenses,
    extraordinaryBurdens,
    healthInsuranceType,
    healthInsuranceCost,
  } = inputs;

  // 1. Calculate deductions and allowances
  const workRelated = Math.max(
    workRelatedExpenses || 0,
    DEDUCTIONS.workRelatedExpenses.standard
  );
  const childAllowances = children * DEDUCTIONS.childAllowance.perChild;
  
  // Single parent allowance for Class II
  let singleParentAllowance = 0;
  if (taxClass === 'II') {
    singleParentAllowance = DEDUCTIONS.singleParentAllowance.classII;
    if (children > 0) {
      singleParentAllowance += children * DEDUCTIONS.singleParentAllowance.perChild;
    }
  }

  // Basic allowance based on tax class
  const isMarried = taxClass === 'III' || taxClass === 'IV' || taxClass === 'V';
  let basicAllowance = 0;
  
  if (taxClass === 'VI') {
    // Class VI has no basic allowance
    basicAllowance = 0;
  } else if (taxClass === 'III') {
    // Class III gets doubled basic allowance (married)
    basicAllowance = BASIC_ALLOWANCE.married;
  } else if (taxClass === 'V') {
    // Class V gets no basic allowance (used by Class III spouse)
    basicAllowance = 0;
  } else if (isMarried) {
    basicAllowance = BASIC_ALLOWANCE.married;
  } else {
    basicAllowance = BASIC_ALLOWANCE.single;
  }

  const totalDeductions =
    workRelated +
    specialExpenses +
    extraordinaryBurdens +
    childAllowances +
    singleParentAllowance +
    basicAllowance;

  // 2. Calculate taxable income
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // 3. Calculate income tax
  const incomeTax = calculateIncomeTaxByClass(taxableIncome, taxClass);

  // 4. Calculate solidarity surcharge
  const solidaritySurcharge = calculateSolidaritySurcharge(incomeTax, isMarried);

  // 5. Calculate church tax
  const churchTax = calculateChurchTax(incomeTax, state, isChurchMember);

  // 6. Calculate total taxes
  const totalTaxes = Math.round((incomeTax + solidaritySurcharge + churchTax) * 100) / 100;

  // 7. Calculate social security contributions
  const socialSecurity = calculateSocialSecurity(
    grossIncome,
    age,
    children,
    healthInsuranceType,
    healthInsuranceCost
  );

  // 8. Calculate net income
  const netIncome = Math.round((grossIncome - totalTaxes - socialSecurity.total) * 100) / 100;

  // 9. Calculate effective and marginal tax rates
  const effectiveTaxRate = grossIncome > 0 ? (totalTaxes / grossIncome) * 100 : 0;
  
  // Marginal rate: highest bracket rate based on taxable income (2025 brackets)
  let marginalTaxRate = 0;
  if (taxableIncome <= 12096) {
    marginalTaxRate = 0;
  } else if (taxableIncome <= 17430) {
    marginalTaxRate = 24; // Progressive from 14% to 24%
  } else if (taxableIncome <= 68429) {
    marginalTaxRate = 42; // Progressive from 24% to 42%
  } else if (taxableIncome <= 277825) {
    marginalTaxRate = 42;
  } else {
    marginalTaxRate = 45;
  }

  // 10. Monthly breakdown
  const monthly = {
    grossIncome: Math.round((grossIncome / 12) * 100) / 100,
    totalTaxes: Math.round((totalTaxes / 12) * 100) / 100,
    socialSecurity: Math.round((socialSecurity.total / 12) * 100) / 100,
    netIncome: Math.round((netIncome / 12) * 100) / 100,
  };

  return {
    grossIncome,
    deductions: {
      workRelatedExpenses: workRelated,
      specialExpenses,
      extraordinaryBurdens,
      childAllowances,
      singleParentAllowance,
      basicAllowance,
      totalDeductions,
    },
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    incomeTax: Math.round(incomeTax * 100) / 100,
    solidaritySurcharge: Math.round(solidaritySurcharge * 100) / 100,
    churchTax: Math.round(churchTax * 100) / 100,
    totalTaxes,
    socialSecurity,
    netIncome,
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
    marginalTaxRate,
    monthly,
  };
}

/**
 * Format currency for German locale (€)
 */
export function formatGermanCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

