import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Gold Purity Standards (BIS Indian Standards)
export const GOLD_PURITY_FACTORS = {
    "24K": 1.0,     // 99.9% Pure Gold (Coins & Bars, BIS 999)
    "22K": 0.916,   // 91.6% Pure Gold (Standard Indian Jewelry, BIS 916)
    "18K": 0.750,   // 75.0% Pure Gold (Diamond & Stone Studded, BIS 750)
    "14K": 0.585,   // 58.5% Pure Gold (Modern Lightweight Jewelry, BIS 585)
} as const;

export const PURITY_DESCRIPTIONS = {
    "24K": "BIS 999 (Pure Gold)",
    "22K": "BIS 916 (Standard Jewelry)",
    "18K": "BIS 750 (Diamond Studded)",
    "14K": "BIS 585 (Lightweight)",
} as const;

export const UNIT_CONVERSION = {
    grams: 1,
    tola: 11.66,
    sovereign: 8,
    ounce: 31.1035,
} as const;

export type WeightUnit = keyof typeof UNIT_CONVERSION;
export type Purity = keyof typeof GOLD_PURITY_FACTORS;

export interface GoldPriceInput {
    ratePer10g24k: number;
    weight: number;
    unit: WeightUnit;
    purity: Purity;
    makingCharges: number;
    makingChargesType: "flat" | "percent";
    wastagePercent?: number;       // Optional wastage / vaada % (typical 0% - 10%)
    gstGold?: number;              // default 3% (Standard GST on gold)
    gstMaking?: number;            // default 5% (Standard GST on making charges)
}

export interface GoldPriceResult {
    weightInGrams: number;
    ratePerGram24k: number;
    ratePerGramPurity: number;
    goldValue: number;
    wastageAmount: number;
    makingChargesAmount: number;
    makingChargesInfo: number;     // Alias for backwards compatibility
    totalMakingAndWastage: number;
    gstGoldAmount: number;
    gstMakingAmount: number;
    totalGstAmount: number;
    hallmarkingFee: number;        // Maintained at 0 for backwards compatibility
    totalAmount: number;
    effectiveRatePerGram: number;  // Actual all-inclusive cost per gram
    markupPercent: number;         // Jeweler markup over raw metal value
}

export const calculateGoldPrice = (input: GoldPriceInput): GoldPriceResult => {
    // 1. Convert weight to grams
    const weightInGrams = (input.weight || 0) * (UNIT_CONVERSION[input.unit] || 1);

    // 2. Calculate Base Gold Rates & Pure Metal Value
    const ratePerGram24k = (input.ratePer10g24k || 0) / 10;
    const purityFactor = GOLD_PURITY_FACTORS[input.purity] || 0.916;
    const ratePerGramPurity = ratePerGram24k * purityFactor;
    const goldValue = ratePerGramPurity * weightInGrams;

    // 3. Wastage (Vaada) Amount
    const wastagePercent = input.wastagePercent || 0;
    const wastageAmount = goldValue * (wastagePercent / 100);

    // 4. Making Charges
    let makingChargesAmount = 0;
    if (input.makingChargesType === "flat") {
        makingChargesAmount = Number(input.makingCharges) || 0;
    } else {
        makingChargesAmount = goldValue * ((Number(input.makingCharges) || 0) / 100);
    }
    const totalMakingAndWastage = makingChargesAmount + wastageAmount;

    // 5. Pre-tax Gross Total
    const grossPreTax = goldValue + totalMakingAndWastage;

    // 6. GST Calculation (Industry Standard: 3% on Gold Metal, 5% on Making Charges)
    const gstGoldRate = input.gstGold !== undefined ? input.gstGold : 3;
    const gstMakingRate = input.gstMaking !== undefined ? input.gstMaking : 5;
    
    const gstGoldAmount = goldValue * (gstGoldRate / 100);
    const gstMakingAmount = totalMakingAndWastage * (gstMakingRate / 100);
    const totalGstAmount = gstGoldAmount + gstMakingAmount;

    // 7. Total Invoice Amount (No hallmarking fee)
    const totalAmount = Math.round(grossPreTax + totalGstAmount);

    // 8. Effective Rate per gram & Jeweler Markup over raw metal
    const effectiveRatePerGram = weightInGrams > 0 ? Math.round(totalAmount / weightInGrams) : 0;
    const markupPercent = goldValue > 0 ? ((totalAmount - goldValue) / goldValue) * 100 : 0;

    return {
        weightInGrams,
        ratePerGram24k: Math.round(ratePerGram24k),
        ratePerGramPurity: Math.round(ratePerGramPurity),
        goldValue: Math.round(goldValue),
        wastageAmount: Math.round(wastageAmount),
        makingChargesAmount: Math.round(makingChargesAmount),
        makingChargesInfo: Math.round(makingChargesAmount), // Alias for backward compatibility
        totalMakingAndWastage: Math.round(totalMakingAndWastage),
        gstGoldAmount: Math.round(gstGoldAmount),
        gstMakingAmount: Math.round(gstMakingAmount),
        totalGstAmount: Math.round(totalGstAmount),
        hallmarkingFee: 0,
        totalAmount,
        effectiveRatePerGram,
        markupPercent: Number(markupPercent.toFixed(1)),
    };
};

export interface GoldLoanInput {
    goldValue: number;
    ltvPercent: number; // typically 75% RBI statutory ceiling
    interestRatePercent: number; // Annual interest rate (e.g. 9.5% - 12%)
    tenureMonths: number;
    repaymentType?: "emi" | "bullet"; // Monthly EMI vs Bullet (interest monthly, principal at end)
}

export interface GoldLoanResult {
    loanAmount: number;
    maxLoan: number; // Alias for backward compatibility
    monthlyPayment: number;
    monthlyEMI: number; // Alias for backward compatibility
    totalInterest: number;
    totalPayable: number;
}

export const calculateGoldLoan = (input: GoldLoanInput): GoldLoanResult => {
    const loanAmount = Math.round(input.goldValue * ((input.ltvPercent || 75) / 100));
    const r = (input.interestRatePercent || 0) / 12 / 100;
    const n = Math.max(1, input.tenureMonths || 12);
    const isBullet = input.repaymentType === "bullet";

    let monthlyPayment = 0;
    let totalPayable = 0;
    let totalInterest = 0;

    if (isBullet) {
        // Bullet repayment: Pay simple interest monthly, principal repaid at maturity
        monthlyPayment = Math.round(loanAmount * r);
        totalInterest = Math.round(monthlyPayment * n);
        totalPayable = loanAmount + totalInterest;
    } else {
        // Reducing balance EMI: [P x R x (1+R)^N]/[(1+R)^N-1]
        if (r === 0) {
            monthlyPayment = Math.round(loanAmount / n);
            totalPayable = loanAmount;
            totalInterest = 0;
        } else {
            const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            monthlyPayment = Math.round(emi);
            totalPayable = Math.round(monthlyPayment * n);
            totalInterest = Math.max(0, totalPayable - loanAmount);
        }
    }

    return {
        loanAmount,
        maxLoan: loanAmount,
        monthlyPayment,
        monthlyEMI: monthlyPayment,
        totalInterest,
        totalPayable,
    };
};

export interface OldGoldResaleInput {
    rate24kPer10g: number;
    weightInGrams: number;
    purity: Purity;
    meltingLossPercent?: number; // 1% - 3%
    cashDiscountPercent?: number; // 0% for exchange, 2% - 5% for cash
}

export interface OldGoldResaleResult {
    purityRatePerGram: number;
    grossMetalValue: number;
    meltingLossAmount: number;
    exchangeValue: number;       // 100% full value towards new jewelry
    cashDeductionAmount: number;
    cashPayoutValue: number;     // Cash in hand
    exchangeBenefit: number;     // Extra savings by exchanging vs cash
}

export const calculateOldGoldResale = (input: OldGoldResaleInput): OldGoldResaleResult => {
    const ratePerGram24k = (input.rate24kPer10g || 0) / 10;
    const purityFactor = GOLD_PURITY_FACTORS[input.purity] || 0.916;
    const purityRatePerGram = Math.round(ratePerGram24k * purityFactor);
    const grossMetalValue = Math.round(purityRatePerGram * (input.weightInGrams || 0));

    const meltingLossPercent = input.meltingLossPercent || 2;
    const meltingLossAmount = Math.round(grossMetalValue * (meltingLossPercent / 100));
    const netPurifiedValue = grossMetalValue - meltingLossAmount;

    // Exchange value: Jewelers typically credit full purified value toward new jewelry
    const exchangeValue = Math.round(netPurifiedValue);

    // Cash payout: Jewelers take additional 1-3% handling discount for cash
    const cashDiscountPercent = input.cashDiscountPercent || 1;
    const cashDeductionAmount = Math.round(exchangeValue * (cashDiscountPercent / 100));
    const cashPayoutValue = Math.round(exchangeValue - cashDeductionAmount);
    const exchangeBenefit = Math.max(0, exchangeValue - cashPayoutValue);

    return {
        purityRatePerGram,
        grossMetalValue,
        meltingLossAmount,
        exchangeValue,
        cashDeductionAmount,
        cashPayoutValue,
        exchangeBenefit,
    };
};
