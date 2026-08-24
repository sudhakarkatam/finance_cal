
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Gold Constants
export const GOLD_PURITY_FACTORS = {
    "24K": 1,
    "22K": 0.916,
    "18K": 0.750,
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
    gstGold: number;   // default 3
    gstMaking: number; // default 5
}

export interface GoldPriceResult {
    goldValue: number;
    makingChargesInfo: number;
    gstGoldAmount: number;
    gstMakingAmount: number;
    totalAmount: number;
    effectiveRatePerGram: number; // useful for user context
}

export const calculateGoldPrice = (input: GoldPriceInput): GoldPriceResult => {
    // 1. Convert weight to grams
    const weightInGrams = input.weight * UNIT_CONVERSION[input.unit];

    // 2. Calculate Base Gold Value (Rate is for 10g 24K)
    // Formula: (Rate / 10) * Weight * PurityFactor
    // NOTE: Usually rate is given for 24K. If user selects 22K, we multiply by 0.916.
    const ratePerGram24k = input.ratePer10g24k / 10;
    const goldValue = ratePerGram24k * weightInGrams * GOLD_PURITY_FACTORS[input.purity];

    // 3. Calculate Making Charges
    let makingChargesInfo = 0;
    if (input.makingChargesType === "flat") {
        makingChargesInfo = input.makingCharges;
        // If flat charge is per gram, logic might differ, but usually 'flat' means 'total flat on piece'.
        // Let's assume input is total flat amount for now, or we can clarify if it's per gram. 
        // Standard calculator UI implies "Total Making Charges" or "Rate %".
        // Let's assume input is TOTAL fixed amount if type is flat. 
    } else {
        makingChargesInfo = goldValue * (input.makingCharges / 100);
    }

    // 4. Calculate GST
    const gstGoldAmount = goldValue * (input.gstGold / 100);
    const gstMakingAmount = makingChargesInfo * (input.gstMaking / 100);

    // 5. Total
    const totalAmount = goldValue + makingChargesInfo + gstGoldAmount + gstMakingAmount;

    return {
        goldValue,
        makingChargesInfo,
        gstGoldAmount,
        gstMakingAmount,
        totalAmount,
        effectiveRatePerGram: totalAmount / weightInGrams
    };
};

export interface GoldLoanInput {
    goldValue: number; // From price calculator or manual
    ltvPercent: number; // 75 usually
    interestRatePercent: number; // Annual
    tenureMonths: number;
}

export interface GoldLoanResult {
    loanAmount: number;
    monthlyEMI: number;
    totalInterest: number;
    totalPayable: number;
}

export const calculateGoldLoan = (input: GoldLoanInput): GoldLoanResult => {
    const loanAmount = input.goldValue * (input.ltvPercent / 100);

    // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    // R = monthly rate
    const r = input.interestRatePercent / 12 / 100;
    const n = input.tenureMonths;

    let monthlyEMI = 0;
    let totalPayable = 0;
    let totalInterest = 0;

    if (r === 0) {
        monthlyEMI = loanAmount / n;
        totalPayable = loanAmount;
        totalInterest = 0;
    } else {
        monthlyEMI = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        totalPayable = monthlyEMI * n;
        totalInterest = totalPayable - loanAmount;
    }

    return {
        loanAmount,
        monthlyEMI,
        totalInterest,
        totalPayable
    };
};
