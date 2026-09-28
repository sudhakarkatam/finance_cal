import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import CalculatorInput from "@/components/ui/CalculatorInput";
import ResultChart from "@/components/ui/ResultChart";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Coins,
  RotateCcw,
  Info,
  Save,
  Share2,
  ShieldCheck,
  Receipt,
  Landmark,
  ArrowRightLeft,
} from "lucide-react";
import {
  calculateGoldPrice,
  calculateGoldLoan,
  calculateOldGoldResale,
  GOLD_PURITY_FACTORS,
  PURITY_DESCRIPTIONS,
  type WeightUnit,
  type Purity,
} from "../utils/goldCalculator";

type CalculatorMode = "price" | "loan" | "resale";

const GoldCalculator = () => {
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  const [mode, setMode] = useState<CalculatorMode>("price");

  // --- Price Billing State ---
  const [rate24k, setRate24k] = useState<number>(76000); // 24K per 10g
  const [weight, setWeight] = useState<number>(8); // Default 1 Sovereign / Pavan
  const [unit, setUnit] = useState<WeightUnit>("grams");
  const [purity, setPurity] = useState<Purity>("22K"); // 91.6% standard jewelry
  const [makingCharges, setMakingCharges] = useState<number>(12); // Default 12%
  const [makingType, setMakingType] = useState<"flat" | "percent">("percent");
  const [wastagePercent, setWastagePercent] = useState<number>(0); // Optional Vaada %
  const [includeWastage, setIncludeWastage] = useState<boolean>(false);

  // --- Gold Loan State ---
  const [loanGoldWeight, setLoanGoldWeight] = useState<number>(20);
  const [loanGoldPurity, setLoanGoldPurity] = useState<Purity>("22K");
  const [loanLtv, setLoanLtv] = useState<number>(75); // RBI statutory maximum: 75%
  const [loanInterestRate, setLoanInterestRate] = useState<number>(10.5); // 10.5% p.a.
  const [loanTenure, setLoanTenure] = useState<number>(12); // 12 Months
  const [loanRepaymentType, setLoanRepaymentType] = useState<"emi" | "bullet">("emi");

  // --- Old Gold Resale State ---
  const [oldGoldWeight, setOldGoldWeight] = useState<number>(15);
  const [oldGoldPurity, setOldGoldPurity] = useState<Purity>("22K");
  const [meltingLoss, setMeltingLoss] = useState<number>(2); // 2% melting loss
  const [cashDeduction, setCashDeduction] = useState<number>(1); // 1% cash payout handling discount

  // --- Modals State ---
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // --- 1. Jewelry Pricing Calculation ---
  const priceResult = useMemo(() => {
    return calculateGoldPrice({
      ratePer10g24k: Number(rate24k) || 0,
      weight: Number(weight) || 0,
      unit,
      purity,
      makingCharges: Number(makingCharges) || 0,
      makingChargesType: makingType,
      wastagePercent: includeWastage ? Number(wastagePercent) || 0 : 0,
    });
  }, [rate24k, weight, unit, purity, makingCharges, makingType, includeWastage, wastagePercent]);

  // Live per-gram rates for all purities based on current 24K rate
  const liveRatesPerGram = useMemo(() => {
    const r24kPerGram = (Number(rate24k) || 0) / 10;
    return {
      "24K": Math.round(r24kPerGram),
      "22K": Math.round(r24kPerGram * GOLD_PURITY_FACTORS["22K"]),
      "18K": Math.round(r24kPerGram * GOLD_PURITY_FACTORS["18K"]),
      "14K": Math.round(r24kPerGram * GOLD_PURITY_FACTORS["14K"]),
    };
  }, [rate24k]);

  // --- 2. Gold Loan Calculation ---
  const loanResult = useMemo(() => {
    const r24kPerGram = (Number(rate24k) || 0) / 10;
    const purityRate = r24kPerGram * GOLD_PURITY_FACTORS[loanGoldPurity];
    const totalValuation = Math.round(purityRate * loanGoldWeight);

    const loanCalc = calculateGoldLoan({
      goldValue: totalValuation,
      ltvPercent: loanLtv,
      interestRatePercent: loanInterestRate,
      tenureMonths: loanTenure,
      repaymentType: loanRepaymentType,
    });

    return {
      totalValuation,
      purityRate: Math.round(purityRate),
      ...loanCalc,
    };
  }, [rate24k, loanGoldWeight, loanGoldPurity, loanLtv, loanInterestRate, loanTenure, loanRepaymentType]);

  // --- 3. Old Gold Resale Calculation ---
  const resaleResult = useMemo(() => {
    return calculateOldGoldResale({
      rate24kPer10g: Number(rate24k) || 0,
      weightInGrams: Number(oldGoldWeight) || 0,
      purity: oldGoldPurity,
      meltingLossPercent: meltingLoss,
      cashDiscountPercent: cashDeduction,
    });
  }, [rate24k, oldGoldWeight, oldGoldPurity, meltingLoss, cashDeduction]);

  // Reset handler
  const handleReset = () => {
    if (mode === "price") {
      setRate24k(76000);
      setWeight(8);
      setUnit("grams");
      setPurity("22K");
      setMakingCharges(12);
      setMakingType("percent");
      setIncludeWastage(false);
      setWastagePercent(0);
    } else if (mode === "loan") {
      setLoanGoldWeight(20);
      setLoanGoldPurity("22K");
      setLoanLtv(75);
      setLoanInterestRate(10.5);
      setLoanTenure(12);
      setLoanRepaymentType("emi");
    } else {
      setOldGoldWeight(15);
      setOldGoldPurity("22K");
      setMeltingLoss(2);
      setCashDeduction(1);
    }
  };

  // Preset Chips
  const weightPresets = [
    { label: "1g (Coin)", val: 1, u: "grams" as WeightUnit },
    { label: "2g (Earrings)", val: 2, u: "grams" as WeightUnit },
    { label: "4g (Pendant)", val: 4, u: "grams" as WeightUnit },
    { label: "8g (1 Pavan)", val: 8, u: "grams" as WeightUnit },
    { label: "10g (Bar)", val: 10, u: "grams" as WeightUnit },
    { label: "11.66g (1 Tola)", val: 11.66, u: "grams" as WeightUnit },
  ];

  const ratePresets = [72000, 74000, 76000, 78000, 80000];
  const makingPresets = [3, 8, 12, 16, 20];

  const purityList: Purity[] = ["24K", "22K", "18K", "14K"];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Main Container Card */}
      <Card className="p-6 space-y-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Gold Calculator</h2>
              <p className="text-xs text-muted-foreground">Jewelry price billing, gold loan & exchange</p>
            </div>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setInfoDialogOpen(true)}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>About Gold Pricing, BIS Standards & Loans</DialogTitle>
                  <DialogDescription className="sr-only">
                    Explanation of Indian gold pricing formula, BIS hallmark standards, making charges, and RBI gold loan rules.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">How Jewellers Calculate Jewelry Price</h3>
                    <p className="text-muted-foreground mb-2">
                      When purchasing gold jewelry in India, the final bill follows the standardized formula:
                    </p>
                    <p className="text-xs font-mono bg-muted p-2 rounded">
                      Final Price = Gold Value + Making Charges + GST (+ Wastage)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">BIS Hallmarking Standards in India</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li><strong>24K (BIS 999):</strong> 99.9% pure gold, used primarily for investment coins & bars.</li>
                      <li><strong>22K (BIS 916):</strong> 91.6% pure gold, the standard choice for ~80% of Indian jewelry.</li>
                      <li><strong>18K (BIS 750):</strong> 75.0% pure gold, stronger alloy preferred for diamond & gemstone jewelry.</li>
                      <li><strong>14K (BIS 585):</strong> 58.5% pure gold, modern durable alloy for everyday wear.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-1 text-xs">
                      🏦 RBI Gold Loan Guidelines
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      The Reserve Bank of India (RBI) mandates a maximum Loan-To-Value (LTV) ratio of <strong>75%</strong> on pledged gold jewelry to protect borrowers from market price fluctuations.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Mode Selector Tabs (Segmented Switch) */}
        <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("price")}
            className={`py-2 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === "price"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Jewelry Billing
          </button>
          <button
            type="button"
            onClick={() => setMode("loan")}
            className={`py-2 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === "loan"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            Gold Loan
          </button>
          <button
            type="button"
            onClick={() => setMode("resale")}
            className={`py-2 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === "resale"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Old Gold Resale
          </button>
        </div>

        {/* --- TAB 1: JEWELRY PRICE BILLING --- */}
        {mode === "price" && (
          <div className="space-y-6">
            {/* Live Spot Rate Banner */}
            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-medium">Applied Metal Rates ({purity}):</span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(liveRatesPerGram[purity])} / gram
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <span>24K: {formatCurrency(liveRatesPerGram["24K"])}/g</span>
                <span>22K: {formatCurrency(liveRatesPerGram["22K"])}/g</span>
                <span>18K: {formatCurrency(liveRatesPerGram["18K"])}/g</span>
                <span>14K: {formatCurrency(liveRatesPerGram["14K"])}/g</span>
              </div>
            </div>

            {/* 24K Gold Rate Input */}
            <div className="space-y-2">
              <CalculatorInput
                label="Gold Rate (24K per 10 grams)"
                value={rate24k}
                onChange={setRate24k}
                min={40000}
                max={150000}
                step={500}
                prefix={symbol}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ratePresets.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRate24k(r)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      rate24k === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    ₹{(r / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Purity Karat Selector (Segmented Pills) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Gold Purity / Karat</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {purityList.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPurity(k)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      purity === k
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 border-border text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <div className="font-bold text-sm">{k}</div>
                    <div className={`text-[10px] ${purity === k ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {PURITY_DESCRIPTIONS[k]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Jewelry Weight with Unit & Denomination Chips */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-foreground">Jewelry Weight</Label>
                <div className="w-36">
                  <Select value={unit} onValueChange={(val: WeightUnit) => setUnit(val)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grams">Grams (g)</SelectItem>
                      <SelectItem value="sovereign">Sovereign / Pavan (8g)</SelectItem>
                      <SelectItem value="tola">Tola (11.66g)</SelectItem>
                      <SelectItem value="ounce">Ounce (31.1g)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CalculatorInput
                label="Weight"
                value={weight}
                onChange={setWeight}
                min={0.1}
                max={500}
                step={0.5}
                suffix={unit === "grams" ? "g" : unit}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {weightPresets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setWeight(p.val);
                      setUnit(p.u);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      weight === p.val && unit === p.u
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Making Charges */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-foreground">Making Charges (Craftsmanship)</Label>
                <div className="flex rounded-md border border-border p-0.5 bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setMakingType("percent")}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      makingType === "percent" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMakingType("flat")}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      makingType === "flat" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Flat (₹)
                  </button>
                </div>
              </div>
              <CalculatorInput
                label={makingType === "percent" ? "Making Charges (%)" : "Flat Making Charges"}
                value={makingCharges}
                onChange={setMakingCharges}
                min={0}
                max={makingType === "percent" ? 35 : 100000}
                step={makingType === "percent" ? 0.5 : 500}
                prefix={makingType === "flat" ? symbol : undefined}
                suffix={makingType === "percent" ? "%" : undefined}
              />
              {makingType === "percent" && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {makingPresets.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMakingCharges(m)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        makingCharges === m
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {m}% {m === 3 ? "(Coins)" : m === 8 ? "(Simple)" : m === 12 ? "(Standard)" : "(Designer)"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Jeweler Add-ons (Wastage & BIS Hallmarking) */}
            <div className="space-y-3 pt-2 border-t border-border">
              {/* Wastage (Vaada) Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Add Wastage / Vaada (%)</Label>
                  <p className="text-xs text-muted-foreground">Traditional jeweler metal wastage charge</p>
                </div>
                <Switch checked={includeWastage} onCheckedChange={setIncludeWastage} />
              </div>

              {includeWastage && (
                <CalculatorInput
                  label="Wastage (Vaada %)"
                  value={wastagePercent}
                  onChange={setWastagePercent}
                  min={0}
                  max={20}
                  step={0.5}
                  suffix="%"
                />
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: GOLD LOAN ESTIMATOR --- */}
        {mode === "loan" && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-lg">
              <p className="text-xs text-muted-foreground font-medium">RBI Statutory Ceiling</p>
              <p className="text-base font-bold text-foreground">Maximum Loan-To-Value (LTV): 75%</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Banks & NBFCs grant loans up to 75% of your pledged gold's market value.
              </p>
            </div>

            {/* Purity & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gold Purity</Label>
                <Select value={loanGoldPurity} onValueChange={(val: Purity) => setLoanGoldPurity(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24K">24K (99.9% Pure)</SelectItem>
                    <SelectItem value="22K">22K (91.6% Standard)</SelectItem>
                    <SelectItem value="18K">18K (75.0% Studded)</SelectItem>
                    <SelectItem value="14K">14K (58.5% Lightweight)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <CalculatorInput
                  label="Pledged Weight"
                  value={loanGoldWeight}
                  onChange={setLoanGoldWeight}
                  min={1}
                  max={500}
                  step={1}
                  suffix="Grams"
                />
              </div>
            </div>

            {/* LTV Slider */}
            <CalculatorInput
              label="Loan to Value (LTV %)"
              value={loanLtv}
              onChange={setLoanLtv}
              min={50}
              max={75}
              step={1}
              suffix="%"
            />

            {/* Interest Rate & Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalculatorInput
                label="Interest Rate (p.a)"
                value={loanInterestRate}
                onChange={setLoanInterestRate}
                min={7}
                max={24}
                step={0.25}
                suffix="%"
              />

              <CalculatorInput
                label="Loan Tenure"
                value={loanTenure}
                onChange={setLoanTenure}
                min={3}
                max={36}
                step={1}
                suffix="Months"
              />
            </div>

            {/* Repayment Type Toggle */}
            <div className="space-y-1.5 bg-muted/40 p-3 rounded-lg border border-border">
              <Label className="text-sm font-medium">Repayment Scheme</Label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLoanRepaymentType("emi")}
                  className={`py-2 px-3 text-xs font-medium rounded-md transition-all text-center ${
                    loanRepaymentType === "emi"
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly EMI (Reducing)
                </button>
                <button
                  type="button"
                  onClick={() => setLoanRepaymentType("bullet")}
                  className={`py-2 px-3 text-xs font-medium rounded-md transition-all text-center ${
                    loanRepaymentType === "bullet"
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bullet / Monthly Interest
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                {loanRepaymentType === "emi"
                  ? "Pay both principal and interest every month as a standard bank EMI."
                  : "Pay interest monthly and repay the full principal as a lump sum at loan maturity."}
              </p>
            </div>
          </div>
        )}

        {/* --- TAB 3: OLD GOLD RESALE & EXCHANGE --- */}
        {mode === "resale" && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-lg">
              <p className="text-xs text-muted-foreground font-medium">Exchange vs Cash Payout</p>
              <p className="text-base font-bold text-foreground">Maximize Value by Exchanging</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Indian jewellers typically give 100% full metal value when exchanging for new jewelry, but take discounts when paying cash.
              </p>
            </div>

            {/* Old Gold Weight & Purity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Old Gold Purity</Label>
                <Select value={oldGoldPurity} onValueChange={(val: Purity) => setOldGoldPurity(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24K">24K (99.9% Pure)</SelectItem>
                    <SelectItem value="22K">22K (91.6% Standard)</SelectItem>
                    <SelectItem value="18K">18K (75.0% Studded)</SelectItem>
                    <SelectItem value="14K">14K (58.5% Lightweight)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <CalculatorInput
                  label="Old Gold Weight"
                  value={oldGoldWeight}
                  onChange={setOldGoldWeight}
                  min={1}
                  max={500}
                  step={1}
                  suffix="Grams"
                />
              </div>
            </div>

            {/* Melting Loss & Cash Deduction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalculatorInput
                label="Melting Loss (%)"
                value={meltingLoss}
                onChange={setMeltingLoss}
                min={0}
                max={5}
                step={0.5}
                suffix="%"
              />

              <CalculatorInput
                label="Cash Discount (%)"
                value={cashDeduction}
                onChange={setCashDeduction}
                min={0}
                max={5}
                step={0.5}
                suffix="%"
              />
            </div>
          </div>
        )}
      </Card>

      {/* --- RESULTS SECTION --- */}
      <Card className="p-6 space-y-4 shadow-lg">
        {mode === "price" && (
          <>
            <h3 className="text-lg font-semibold text-foreground">Jewelry Billing Breakdown</h3>

            {/* Visual Donut Chart */}
            <ResultChart
              principal={priceResult.goldValue}
              returns={priceResult.totalMakingAndWastage + priceResult.totalGstAmount}
              principalLabel="Pure Gold Value"
              returnsLabel="Making, Wastage & Taxes"
            />

            {/* Effective Price & Markup Indicator */}
            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-lg flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground font-medium">Effective Rate per Gram</span>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(priceResult.effectiveRatePerGram)} / g
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-xs text-muted-foreground font-medium">Jeweler Markup</span>
                <p className="text-sm font-bold text-primary">
                  +{priceResult.markupPercent}% over metal
                </p>
              </div>
            </div>

            {/* Itemized Invoice Table */}
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg text-sm">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">
                  Pure Gold ({priceResult.weightInGrams}g @ {purity})
                </span>
                <span className="font-semibold text-foreground">{formatCurrency(priceResult.goldValue)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">
                  Making Charges ({makingType === "percent" ? `${makingCharges}%` : "Flat"})
                </span>
                <span className="font-semibold text-foreground">{formatCurrency(priceResult.makingChargesAmount)}</span>
              </div>

              {includeWastage && priceResult.wastageAmount > 0 && (
                <div className="flex justify-between items-center py-2 border-t border-border">
                  <span className="text-muted-foreground">Wastage / Vaada ({wastagePercent}%)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(priceResult.wastageAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">GST (3% Gold + 5% Making)</span>
                <span className="font-semibold text-foreground">{formatCurrency(priceResult.totalGstAmount)}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
                <span className="text-base font-semibold text-foreground">Total Invoice Price</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(priceResult.totalAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                className="w-full gap-2 h-12 text-base font-semibold"
                size="lg"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save className="w-5 h-5" />
                Save Calculation
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/10"
                size="lg"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="w-5 h-5" />
                Export & Share Invoice
              </Button>
            </div>
          </>
        )}

        {mode === "loan" && (
          <>
            <h3 className="text-lg font-semibold text-foreground">Gold Loan Summary</h3>

            {/* Visual Donut Chart */}
            <ResultChart
              principal={loanResult.loanAmount}
              returns={loanResult.totalInterest}
              principalLabel="Principal Loan"
              returnsLabel="Total Interest"
            />

            <div className="space-y-2 bg-muted/30 p-4 rounded-lg text-sm">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Gold Market Valuation</span>
                <span className="font-semibold text-foreground">{formatCurrency(loanResult.totalValuation)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">Eligible Loan Amount ({loanLtv}% LTV)</span>
                <span className="font-semibold text-primary">{formatCurrency(loanResult.loanAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">
                  {loanRepaymentType === "emi" ? "Estimated Monthly EMI" : "Monthly Interest"}
                </span>
                <span className="font-semibold text-foreground">{formatCurrency(loanResult.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">Total Interest Payable</span>
                <span className="font-semibold text-destructive">{formatCurrency(loanResult.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
                <span className="text-base font-semibold text-foreground">Total Repayment Amount</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(loanResult.totalPayable)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                className="w-full gap-2 h-12 text-base font-semibold"
                size="lg"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save className="w-5 h-5" />
                Save Valuation
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/10"
                size="lg"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="w-5 h-5" />
                Export & Share Loan PDF
              </Button>
            </div>
          </>
        )}

        {mode === "resale" && (
          <>
            <h3 className="text-lg font-semibold text-foreground">Old Gold Resale & Exchange Summary</h3>

            {/* Exchange vs Cash Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-1">
                <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                  Exchange Value (New Jewelry)
                </span>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(resaleResult.exchangeValue)}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  100% full metal value credited towards new jewelry
                </p>
              </div>

              <div className="bg-muted/40 border border-border p-4 rounded-lg space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Cash Payout Value
                </span>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(resaleResult.cashPayoutValue)}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Deduction: -{formatCurrency(resaleResult.cashDeductionAmount)} ({cashDeduction}%)
                </p>
              </div>
            </div>

            {resaleResult.exchangeBenefit > 0 && (
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-xs text-foreground flex items-center justify-between">
                <span>Exchange Benefit over Cash:</span>
                <span className="font-bold text-primary">
                  +{formatCurrency(resaleResult.exchangeBenefit)} Extra Value
                </span>
              </div>
            )}

            <div className="space-y-2 bg-muted/30 p-4 rounded-lg text-sm">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Raw Purity Rate</span>
                <span className="font-semibold text-foreground">{formatCurrency(resaleResult.purityRatePerGram)}/g</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">Gross Metal Value</span>
                <span className="font-semibold text-foreground">{formatCurrency(resaleResult.grossMetalValue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">Melting Loss Deduction ({meltingLoss}%)</span>
                <span className="font-semibold text-destructive">-{formatCurrency(resaleResult.meltingLossAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
                <span className="text-base font-semibold text-foreground">Net Exchange Credit</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(resaleResult.exchangeValue)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                className="w-full gap-2 h-12 text-base font-semibold"
                size="lg"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save className="w-5 h-5" />
                Save Calculation
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/10"
                size="lg"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="w-5 h-5" />
                Export & Share Resale PDF
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Save Dialog */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="gold"
        inputs={
          mode === "price"
            ? {
                mode: "Jewelry Billing",
                rate24k,
                purity,
                weight,
                unit,
                makingCharges,
                makingType,
              }
            : mode === "loan"
            ? {
                mode: "Gold Loan",
                weight: loanGoldWeight,
                purity: loanGoldPurity,
                ltv: loanLtv,
                interestRate: loanInterestRate,
                tenure: loanTenure,
              }
            : {
                mode: "Old Gold Resale",
                weight: oldGoldWeight,
                purity: oldGoldPurity,
                meltingLoss,
              }
        }
        results={
          mode === "price"
            ? {
                goldValue: priceResult.goldValue,
                makingCharges: priceResult.makingChargesAmount,
                gst: priceResult.totalGstAmount,
                totalAmount: priceResult.totalAmount,
              }
            : mode === "loan"
            ? {
                goldValuation: loanResult.totalValuation,
                loanAmount: loanResult.loanAmount,
                monthlyPayment: loanResult.monthlyPayment,
                totalRepayment: loanResult.totalPayable,
              }
            : {
                grossMetalValue: resaleResult.grossMetalValue,
                exchangeValue: resaleResult.exchangeValue,
                cashPayoutValue: resaleResult.cashPayoutValue,
              }
        }
      />

      {/* Share Report Modal */}
      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title={
          mode === "price"
            ? "Gold Jewelry Purchase Invoice Statement"
            : mode === "loan"
            ? "Gold Loan Valuation Statement"
            : "Old Gold Resale & Exchange Valuation"
        }
        inputs={
          mode === "price"
            ? [
                { label: "24K Benchmark Rate", value: `${formatCurrency(rate24k)} / 10g` },
                { label: "Jewelry Purity", value: `${purity} (${PURITY_DESCRIPTIONS[purity]})` },
                { label: "Weight", value: `${weight} ${unit} (${priceResult.weightInGrams}g)` },
                {
                  label: "Making Charges",
                  value: makingType === "percent" ? `${makingCharges}%` : formatCurrency(makingCharges),
                },
                ...(includeWastage ? [{ label: "Wastage (Vaada)", value: `${wastagePercent}%` }] : []),
              ]
            : mode === "loan"
            ? [
                { label: "Pledged Weight", value: `${loanGoldWeight} Grams` },
                { label: "Gold Purity", value: `${loanGoldPurity} (${PURITY_DESCRIPTIONS[loanGoldPurity]})` },
                { label: "Applied LTV %", value: `${loanLtv}% (RBI Max: 75%)` },
                { label: "Interest Rate (p.a.)", value: `${loanInterestRate}%` },
                { label: "Tenure", value: `${loanTenure} Months` },
                { label: "Repayment Scheme", value: loanRepaymentType === "emi" ? "Monthly EMI" : "Bullet" },
              ]
            : [
                { label: "Old Gold Weight", value: `${oldGoldWeight} Grams` },
                { label: "Old Gold Purity", value: `${oldGoldPurity} (${PURITY_DESCRIPTIONS[oldGoldPurity]})` },
                { label: "Melting Loss Deduction", value: `${meltingLoss}%` },
                { label: "Cash Discount", value: `${cashDeduction}%` },
              ]
        }
        results={
          mode === "price"
            ? [
                { label: "Pure Metal Value", value: formatCurrency(priceResult.goldValue) },
                { label: "Making & Wastage Charges", value: formatCurrency(priceResult.totalMakingAndWastage) },
                { label: "GST (3% Gold + 5% Making)", value: formatCurrency(priceResult.totalGstAmount) },
                { label: "Effective Cost / Gram", value: `${formatCurrency(priceResult.effectiveRatePerGram)}/g` },
                { label: "Total Invoice Amount", value: formatCurrency(priceResult.totalAmount), isHighlight: true },
              ]
            : mode === "loan"
            ? [
                { label: "Gold Market Valuation", value: formatCurrency(loanResult.totalValuation) },
                { label: "Eligible Loan Amount", value: formatCurrency(loanResult.loanAmount), isHighlight: true },
                {
                  label: loanRepaymentType === "emi" ? "Monthly EMI" : "Monthly Interest",
                  value: formatCurrency(loanResult.monthlyPayment),
                },
                { label: "Total Interest Payable", value: formatCurrency(loanResult.totalInterest) },
                { label: "Total Repayment Amount", value: formatCurrency(loanResult.totalPayable) },
              ]
            : [
                { label: "Gross Metal Value", value: formatCurrency(resaleResult.grossMetalValue) },
                { label: "Melting Loss", value: `-${formatCurrency(resaleResult.meltingLossAmount)}` },
                { label: "Exchange Value (New Jewelry)", value: formatCurrency(resaleResult.exchangeValue), isHighlight: true },
                { label: "Cash Payout Value", value: formatCurrency(resaleResult.cashPayoutValue) },
                { label: "Exchange Extra Benefit", value: `+${formatCurrency(resaleResult.exchangeBenefit)}` },
              ]
        }
      />
    </div>
  );
};

export default GoldCalculator;
