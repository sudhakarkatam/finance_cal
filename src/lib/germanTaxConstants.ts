// German Income Tax Constants for 2025
// Based on official German tax law (EStG - Einkommensteuergesetz)
// Sources: Bundesfinanzministerium, Bundeszentralamt für Steuern

export type GermanTaxClass = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type GermanState =
  | 'Baden-Württemberg'
  | 'Bavaria'
  | 'Berlin'
  | 'Brandenburg'
  | 'Bremen'
  | 'Hamburg'
  | 'Hesse'
  | 'Lower Saxony'
  | 'Mecklenburg-Vorpommern'
  | 'North Rhine-Westphalia'
  | 'Rhineland-Palatinate'
  | 'Saarland'
  | 'Saxony'
  | 'Saxony-Anhalt'
  | 'Schleswig-Holstein'
  | 'Thuringia';

// Tax Classes (Steuerklassen)
export const TAX_CLASSES = {
  I: {
    code: 'I',
    name: 'Class I',
    description: 'Single individuals (not married, divorced, or widowed)',
    maritalStatus: 'single',
    childrenAllowed: false,
  },
  II: {
    code: 'II',
    name: 'Class II',
    description: 'Single parents (eligible for additional allowance)',
    maritalStatus: 'single',
    childrenAllowed: true,
  },
  III: {
    code: 'III',
    name: 'Class III',
    description: 'Married (higher-earning spouse, paired with Class V)',
    maritalStatus: 'married',
    childrenAllowed: true,
    pairedWith: 'V',
  },
  IV: {
    code: 'IV',
    name: 'Class IV',
    description: 'Married (both spouses have similar income)',
    maritalStatus: 'married',
    childrenAllowed: true,
    pairedWith: 'IV',
  },
  V: {
    code: 'V',
    name: 'Class V',
    description: 'Married (lower-earning spouse, paired with Class III)',
    maritalStatus: 'married',
    childrenAllowed: true,
    pairedWith: 'III',
  },
  VI: {
    code: 'VI',
    name: 'Class VI',
    description: 'Multiple jobs or second job (no tax-free allowance)',
    maritalStatus: 'any',
    childrenAllowed: false,
  },
} as const;

// Income Tax Brackets 2025 (§ 32a EStG)
// Basic tax-free allowance (Grundfreibetrag)
export const BASIC_ALLOWANCE = {
  single: 12096, // €12,096 per year for singles (2025)
  married: 24192, // €24,192 per year for married couples (doubled, 2025)
};

// Progressive Tax Brackets 2025 (Taxable Income after deductions)
export const TAX_BRACKETS = [
  { min: 0, max: 12096, rate: 0 }, // Tax-free
  { min: 12097, max: 17430, rate: 0.14 }, // 14% to 24% progressive
  { min: 17431, max: 68429, rate: 0.42 }, // 24% to 42% progressive
  { min: 68430, max: 277825, rate: 0.42 }, // 42% flat
  { min: 277826, max: Infinity, rate: 0.45 }, // 45% top rate
];

// For accurate progressive calculation, use the German tax formula 2025
// Formula uses piecewise linear functions with specific parameters
export const TAX_FORMULA_PARAMS = {
  // Zone 1: 0-12,096: Tax-free
  zone1: { max: 12096, rate: 0 },
  // Zone 2: 12,097-17,430: Progressive 14% to 24%
  // Formula: T = (922.98 * Y + 1,400) * Y where Y = (X - 12,096) / 10,000
  zone2: { min: 12097, max: 17430, base: 0, progressive: true },
  // Zone 3: 17,431-68,429: Progressive 24% to 42%
  // Formula: T = (181.19 * Z + 2,397) * Z + 1,025.38 where Z = (X - 17,430) / 10,000
  zone3: { min: 17431, max: 68429, base: 1025.38, progressive: true },
  // Zone 4: 68,430-277,825: 42% flat
  // Formula: T = 0.42 * X - 10,602.13
  zone4: { min: 68430, max: 277825, rate: 0.42 },
  // Zone 5: Above 277,826: 45% flat
  // Formula: T = 0.45 * X - 18,936.88
  zone5: { min: 277826, max: Infinity, rate: 0.45 },
};

// Solidarity Surcharge (Solidaritätszuschlag)
export const SOLIDARITY_SURCHARGE = {
  rate: 0.055, // 5.5% of income tax
  threshold: {
    single: 19950, // Income tax > €19,950
    married: 39900, // Income tax > €39,900 (doubled)
  },
  // Phased out below threshold - no surcharge for lower incomes
  // Threshold corresponds to ~€73,463 taxable income (single) or ~€146,926 (married)
};

// Church Tax (Kirchensteuer) by State
export const CHURCH_TAX_RATES: Record<GermanState, number> = {
  'Baden-Württemberg': 0.08, // 8%
  'Bavaria': 0.08, // 8%
  'Berlin': 0.09, // 9%
  'Brandenburg': 0.09,
  'Bremen': 0.09,
  'Hamburg': 0.09,
  'Hesse': 0.09,
  'Lower Saxony': 0.09,
  'Mecklenburg-Vorpommern': 0.09,
  'North Rhine-Westphalia': 0.09,
  'Rhineland-Palatinate': 0.09,
  'Saarland': 0.09,
  'Saxony': 0.09,
  'Saxony-Anhalt': 0.09,
  'Schleswig-Holstein': 0.09,
  'Thuringia': 0.09,
};

// Social Security Contributions (Sozialversicherungsbeiträge) 2025
export const SOCIAL_SECURITY = {
  // Pension Insurance (Rentenversicherung)
  pension: {
    totalRate: 0.186, // 18.6% total
    employeeRate: 0.093, // 9.3% employee share
    employerRate: 0.093, // 9.3% employer share
    incomeCeiling: 85200, // €85,200 per year (Beitragsbemessungsgrenze)
  },
  // Health Insurance (Krankenversicherung)
  health: {
    averageRate: 0.146, // Average 14.6% total
    employeeRate: 0.073, // 7.3% employee share (varies by insurer)
    employerRate: 0.073, // 7.3% employer share
    incomeCeiling: 70200, // €70,200 per year
    minimum: 211.65, // Minimum monthly contribution (~€211.65)
    maximum: 1037.7, // Maximum monthly contribution (~€1,037.70)
    // Private insurance: Fixed cost set by insurer
  },
  // Unemployment Insurance (Arbeitslosenversicherung)
  unemployment: {
    totalRate: 0.013, // 1.3% total
    employeeRate: 0.0065, // 0.65% employee share
    employerRate: 0.0065, // 0.65% employer share
    incomeCeiling: 85200, // €85,200 per year (same as pension)
  },
  // Long-term Care Insurance (Pflegeversicherung)
  longTermCare: {
    standardRate: 0.026, // 2.6% standard rate
    maxAgeRate: 0.042, // 4.2% for age 23+ without children
    employeeStandardRate: 0.008, // 0.8% employee share (2.6% - 1.8% employer)
    employeeMaxAgeRate: 0.024, // 2.4% employee share (4.2% - 1.8% employer)
    employerRate: 0.018, // 1.8% employer share (always)
    incomeCeiling: 70200, // €70,200 per year (same as health)
    // Special rate applies if age >= 23 and no children
  },
};

// Deductions & Allowances
export const DEDUCTIONS = {
  // Standard Work-Related Expenses (Werbungskostenpauschale)
  workRelatedExpenses: {
    standard: 1230, // €1,230 default allowance
    unlimited: true, // Can claim more if actual expenses are higher
  },
  // Child Allowance (Kinderfreibetrag)
  childAllowance: {
    perChild: 6024, // €6,024 per child per year (2025)
    // Reduces taxable income
  },
  // Special Expenses (Sonderausgaben)
  specialExpenses: {
    insurance: 0, // Health, life, liability insurance premiums
    donations: 0, // Charitable donations (up to 20% of income)
    churchTax: true, // Church tax is deductible
  },
  // Extraordinary Burdens (Außergewöhnliche Belastungen)
  extraordinaryBurdens: {
    medical: 0, // Medical expenses above reasonable burden
    // Must exceed reasonable burden (zumutbare Belastung) based on income
  },
  // Single Parent Allowance (Entlastungsbetrag für Alleinerziehende)
  singleParentAllowance: {
    classII: 4260, // €4,260 per year for Class II
    perChild: 240, // €240 per child additional
  },
};

// Tax Class Multipliers for Married Couples
export const TAX_CLASS_MULTIPLIERS = {
  I: 1.0, // Single
  II: 1.0, // Single parent (has additional allowance)
  III: 2.0, // Higher-earning spouse (gets doubled basic allowance)
  IV: 1.0, // Both spouses equal (standard calculation)
  V: 0.5, // Lower-earning spouse (gets half allowance, pays more upfront)
  VI: 1.0, // Second job (no allowance)
};

// German States List with Church Tax Info
export const GERMAN_STATES: Array<{ value: GermanState; label: string; churchTaxRate: number }> = [
  { value: 'Baden-Württemberg', label: 'Baden-Württemberg', churchTaxRate: 0.08 },
  { value: 'Bavaria', label: 'Bavaria', churchTaxRate: 0.08 },
  { value: 'Berlin', label: 'Berlin', churchTaxRate: 0.09 },
  { value: 'Brandenburg', label: 'Brandenburg', churchTaxRate: 0.09 },
  { value: 'Bremen', label: 'Bremen', churchTaxRate: 0.09 },
  { value: 'Hamburg', label: 'Hamburg', churchTaxRate: 0.09 },
  { value: 'Hesse', label: 'Hesse', churchTaxRate: 0.09 },
  { value: 'Lower Saxony', label: 'Lower Saxony', churchTaxRate: 0.09 },
  { value: 'Mecklenburg-Vorpommern', label: 'Mecklenburg-Vorpommern', churchTaxRate: 0.09 },
  { value: 'North Rhine-Westphalia', label: 'North Rhine-Westphalia', churchTaxRate: 0.09 },
  { value: 'Rhineland-Palatinate', label: 'Rhineland-Palatinate', churchTaxRate: 0.09 },
  { value: 'Saarland', label: 'Saarland', churchTaxRate: 0.09 },
  { value: 'Saxony', label: 'Saxony', churchTaxRate: 0.09 },
  { value: 'Saxony-Anhalt', label: 'Saxony-Anhalt', churchTaxRate: 0.09 },
  { value: 'Schleswig-Holstein', label: 'Schleswig-Holstein', churchTaxRate: 0.09 },
  { value: 'Thuringia', label: 'Thuringia', churchTaxRate: 0.09 },
];

