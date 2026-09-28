import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  Calculator,
  Calendar,
  Share2,
  Wallet,
  Receipt,
  Sparkles,
  Info,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import ResultChart from "@/components/ui/ResultChart";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import { InvestmentScheduleDialog, ScheduleRow } from "@/components/InvestmentScheduleDialog";
import { useCurrency } from "@/hooks/useCurrency";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { triggerHaptic } from "@/lib/haptics";
import { recordPositiveEngagement } from "@/lib/reviewManager";

type InvestmentType = "sip" | "lumpsum";
type FundCategory = "equity" | "debt";

const MutualFund = () => {
  const { formatAmount, symbol } = useCurrency();

  // Mode: SIP or Lumpsum
  const [investmentType, setInvestmentType] = useState<InvestmentType>("sip");
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12); // Gross return rate %
  const [years, setYears] = useState(10);
  const [months, setMonths] = useState(0);

  // Direct vs Regular Plan Expense Ratio (TER)
  const [compareDirectRegular, setCompareDirectRegular] = useState(true);
  const [directTER, setDirectTER] = useState(0.5); // Direct plan expense ratio %
  const [regularTER, setRegularTER] = useState(1.5); // Regular plan expense ratio %

  // Latest 2026 Budget Capital Gains Tax Rules
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [fundCategory, setFundCategory] = useState<FundCategory>("equity");
  const [incomeTaxSlab, setIncomeTaxSlab] = useState(30); // For debt funds

  // Step-Up SIP (SIP mode only)
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);

  // Inflation Adjustment
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const totalYears = years + months / 12;

  // Calculation Engine: Calculates corpus for a given net annual rate
  const computePortfolio = (annualRate: number) => {
    const totalMonths = Math.max(1, Math.round(totalYears * 12));
    const monthlyRate = annualRate / 12 / 100;

    let invested = 0;
    let balance = 0;

    if (investmentType === "lumpsum") {
      invested = lumpsumAmount;
      balance = lumpsumAmount * Math.pow(1 + annualRate / 100, totalYears);
    } else {
      let curMonthly = monthlyInvestment;
      for (let m = 1; m <= totalMonths; m++) {
        if (stepUpEnabled && m > 1 && (m - 1) % 12 === 0) {
          curMonthly *= 1 + stepUpPercentage / 100;
        }
        invested += curMonthly;
        balance = (balance + curMonthly) * (1 + monthlyRate);
      }
    }

    const returns = Math.max(0, balance - invested);
    return {
      invested: Math.round(invested),
      returns: Math.round(returns),
      total: Math.round(balance),
    };
  };

  // Main Calculation Result
  const result = useMemo(() => {
    // 1. Gross Return Result (Pre-TER)
    const gross = computePortfolio(expectedReturn);

    // 2. Direct Plan Result (Gross - Direct TER)
    const netDirectRate = Math.max(0.1, expectedReturn - directTER);
    const direct = computePortfolio(netDirectRate);

    // 3. Regular Plan Result (Gross - Regular TER)
    const netRegularRate = Math.max(0.1, expectedReturn - regularTER);
    const regular = computePortfolio(netRegularRate);

    // Broker commission loss (Direct Advantage)
    const commissionDifference = Math.max(0, direct.total - regular.total);

    // Primary result uses Direct plan if comparison active, else gross
    const activeTotal = compareDirectRegular ? direct.total : gross.total;
    const activeInvested = gross.invested;
    const activeReturns = Math.max(0, activeTotal - activeInvested);

    // 4. Latest 2026 Budget Capital Gains Tax Calculation
    // - Equity Fund (held > 1 yr): 12.5% LTCG on gains exceeding ₹1,25,000 exemption
    // - Equity Fund (held <= 1 yr): 20% STCG on all gains
    // - Debt Fund: Taxed at investor's marginal slab rate (e.g. 30%)
    let taxAmount = 0;
    let taxRateApplied = 0;
    let taxTypeLabel = "";
    let exemptGains = 0;
    let taxableGains = 0;

    if (taxEnabled) {
      if (fundCategory === "equity") {
        if (totalYears > 1) {
          taxTypeLabel = "12.5% LTCG (Budget 2024/2026)";
          taxRateApplied = 12.5;
          exemptGains = Math.min(activeReturns, 125000); // ₹1.25L statutory exemption
          taxableGains = Math.max(0, activeReturns - 125000);
          taxAmount = Math.round(taxableGains * 0.125);
        } else {
          taxTypeLabel = "20% STCG (Short-Term)";
          taxRateApplied = 20;
          taxableGains = activeReturns;
          taxAmount = Math.round(taxableGains * 0.20);
        }
      } else {
        // Debt fund taxed at marginal income slab rate
        taxTypeLabel = `${incomeTaxSlab}% Slab Tax (Sec 50AA)`;
        taxRateApplied = incomeTaxSlab;
        taxableGains = activeReturns;
        taxAmount = Math.round(taxableGains * (incomeTaxSlab / 100));
      }
    }

    const postTaxTotal = Math.round(activeTotal - taxAmount);

    // Inflation purchasing power
    const inflationAdjustedTotal = inflationEnabled && totalYears > 0
      ? Math.round(activeTotal / Math.pow(1 + inflationRate / 100, totalYears))
      : activeTotal;

    return {
      invested: activeInvested,
      returns: activeReturns,
      total: activeTotal,
      grossTotal: gross.total,
      directTotal: direct.total,
      regularTotal: regular.total,
      commissionDifference,
      taxAmount,
      taxRateApplied,
      taxTypeLabel,
      exemptGains,
      taxableGains,
      postTaxTotal,
      inflationAdjustedTotal,
      netDirectRate,
      netRegularRate,
    };
  }, [
    investmentType,
    monthlyInvestment,
    lumpsumAmount,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
    compareDirectRegular,
    directTER,
    regularTER,
    taxEnabled,
    fundCategory,
    incomeTaxSlab,
    inflationEnabled,
    inflationRate,
  ]);

  // Annual Growth Schedule Table (Direct vs Regular Comparison)
  const mfSchedule = useMemo((): ScheduleRow[] => {
    const list: ScheduleRow[] = [];
    const totalMonths = Math.max(1, Math.round(totalYears * 12));
    const netDirectRate = Math.max(0.1, expectedReturn - (compareDirectRegular ? directTER : 0)) / 12 / 100;
    const netRegularRate = Math.max(0.1, expectedReturn - (compareDirectRegular ? regularTER : 0)) / 12 / 100;

    let curInv = 0;
    let directBal = 0;
    let regularBal = 0;
    let curMonthly = monthlyInvestment;

    for (let m = 1; m <= totalMonths; m++) {
      if (investmentType === "lumpsum") {
        curInv = lumpsumAmount;
        const netDirectAnnual = Math.max(0.1, expectedReturn - (compareDirectRegular ? directTER : 0));
        const netRegularAnnual = Math.max(0.1, expectedReturn - (compareDirectRegular ? regularTER : 0));
        directBal = lumpsumAmount * Math.pow(1 + netDirectAnnual / 100, m / 12);
        regularBal = lumpsumAmount * Math.pow(1 + netRegularAnnual / 100, m / 12);
      } else {
        if (stepUpEnabled && m > 1 && (m - 1) % 12 === 0) {
          curMonthly *= 1 + stepUpPercentage / 100;
        }
        curInv += curMonthly;
        directBal = (directBal + curMonthly) * (1 + netDirectRate);
        regularBal = (regularBal + curMonthly) * (1 + netRegularRate);
      }

      if (m % 12 === 0 || m === totalMonths) {
        const yearNum = Math.ceil(m / 12);
        list.push({
          period: `Year ${yearNum}${m % 12 !== 0 ? ` (${m % 12}m)` : ""}`,
          invested: Math.round(curInv),
          interest: Math.round(Math.max(0, directBal - curInv)),
          total: Math.round(directBal),
        });
      }
    }

    return list;
  }, [
    investmentType,
    monthlyInvestment,
    lumpsumAmount,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
    compareDirectRegular,
    directTER,
    regularTER,
  ]);

  const handleReset = () => {
    triggerHaptic();
    setInvestmentType("sip");
    setMonthlyInvestment(10000);
    setLumpsumAmount(100000);
    setExpectedReturn(12);
    setYears(10);
    setMonths(0);
    setCompareDirectRegular(true);
    setDirectTER(0.5);
    setRegularTER(1.5);
    setTaxEnabled(true);
    setFundCategory("equity");
    setIncomeTaxSlab(30);
    setStepUpEnabled(false);
    setStepUpPercentage(10);
    setInflationEnabled(false);
    setInflationRate(6);
  };

  const handleCalculate = () => {
    triggerHaptic();
    recordPositiveEngagement("mf_calculated");
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto pb-20">
      <Card className="p-6 space-y-6 shadow-lg bg-card">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Mutual Fund Calculator
              </h2>
              <p className="text-xs text-muted-foreground">
                Direct vs Regular Plan & 2026 Capital Gains Tax
              </p>
            </div>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    triggerHaptic();
                    setInfoDialogOpen(true);
                  }}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Mutual Fund Investment & 2026 Tax Rules</DialogTitle>
                </DialogHeader>
                <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">
                      Direct vs Regular Plans (SEBI Rule)
                    </h3>
                    <p>
                      Every mutual fund scheme offers two options:
                      <strong> Direct Plan</strong> (investing directly through AMC/app without intermediary) and
                      <strong> Regular Plan</strong> (investing through a distributor or bank broker).
                    </p>
                    <p className="mt-1">
                      Regular plans charge an extra <strong>1.0% to 1.5% commission annually</strong> from your portfolio value.
                      Over 15 to 20 years, this extra fee costs investors <strong>₹15 Lakhs to ₹30 Lakhs+</strong> in lost returns!
                    </p>
                  </div>

                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-foreground text-sm mb-1">
                      Latest 2026 Capital Gains Tax Rates (Budget 2024–2026)
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>Equity LTCG (&gt;1 Year):</strong> Taxed at <strong>12.5%</strong>. First <strong>₹1,25,000 profit is 100% Tax-Free</strong> each financial year!
                      </li>
                      <li>
                        <strong>Equity STCG (&le;1 Year):</strong> Taxed at flat <strong>20%</strong> without exemption.
                      </li>
                      <li>
                        <strong>Debt Mutual Funds:</strong> Taxed at your personal income tax slab rate (Sec 50AA).
                      </li>
                    </ul>
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

        {/* Investment Mode Toggle: SIP vs Lumpsum */}
        <div className="grid grid-cols-2 p-1 bg-secondary/50 rounded-xl border border-border">
          <button
            type="button"
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              investmentType === "sip"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              triggerHaptic();
              setInvestmentType("sip");
            }}
          >
            SIP (Monthly Investment)
          </button>
          <button
            type="button"
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              investmentType === "lumpsum"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              triggerHaptic();
              setInvestmentType("lumpsum");
            }}
          >
            Lumpsum (One-Time)
          </button>
        </div>

        {/* Amount Input */}
        {investmentType === "sip" ? (
          <CalculatorInput
            label="Monthly Investment Amount"
            value={monthlyInvestment}
            onChange={setMonthlyInvestment}
            min={500}
            max={5000000}
            step={500}
            prefix={symbol}
          />
        ) : (
          <CalculatorInput
            label="One-Time Lumpsum Investment"
            value={lumpsumAmount}
            onChange={setLumpsumAmount}
            min={1000}
            max={50000000}
            step={5000}
            prefix={symbol}
          />
        )}

        {/* Expected Gross Return */}
        <CalculatorInput
          label="Expected Gross Annual Return (CAGR)"
          value={expectedReturn}
          onChange={setExpectedReturn}
          min={1}
          max={40}
          step={0.5}
          suffix="%"
        />

        {/* Investment Tenure */}
        <div className="bg-card p-4 rounded-lg border">
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Investment Tenure
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <CalculatorInput
              label="Years"
              value={years}
              onChange={setYears}
              min={0}
              max={40}
              step={1}
            />
            <CalculatorInput
              label="Months"
              value={months}
              onChange={setMonths}
              min={0}
              max={11}
              step={1}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Total Investment Horizon:{" "}
            <span className="font-semibold text-foreground">
              {totalYears.toFixed(1)} Years ({Math.round(totalYears * 12)} Months)
            </span>
          </div>
        </div>

        {/* Direct vs Regular Plan Expense Ratio (TER) Comparison */}
        <div className="bg-card p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="direct-regular" className="text-sm font-semibold cursor-pointer">
                Compare Direct vs Regular Plan (TER)
              </Label>
              <p className="text-xs text-muted-foreground">
                See distributor commission lost in Regular plans
              </p>
            </div>
            <Switch
              id="direct-regular"
              checked={compareDirectRegular}
              onCheckedChange={setCompareDirectRegular}
            />
          </div>

          {compareDirectRegular && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
              <CalculatorInput
                label="Direct Plan Expense Ratio (TER)"
                value={directTER}
                onChange={setDirectTER}
                min={0.1}
                max={2.5}
                step={0.1}
                suffix="%"
              />
              <CalculatorInput
                label="Regular Plan Expense Ratio (TER)"
                value={regularTER}
                onChange={setRegularTER}
                min={0.5}
                max={3.0}
                step={0.1}
                suffix="%"
              />
            </div>
          )}
        </div>

        {/* Latest 2026 Capital Gains Tax Feature */}
        <div className="bg-card p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tax-calc" className="text-sm font-semibold cursor-pointer">
                Calculate Post-Tax In-Hand Returns
              </Label>
              <p className="text-xs text-muted-foreground">
                Latest Finance Act / Budget 2024–2026 statutory rates
              </p>
            </div>
            <Switch
              id="tax-calc"
              checked={taxEnabled}
              onCheckedChange={setTaxEnabled}
            />
          </div>

          {taxEnabled && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fund Asset Type</Label>
                <Select
                  value={fundCategory}
                  onValueChange={(val: FundCategory) => setFundCategory(val)}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select fund type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equity">
                      Equity Mutual Fund (&gt;65% Equity) - 12.5% LTCG / ₹1.25L Exemption
                    </SelectItem>
                    <SelectItem value="debt">
                      Debt Mutual Fund (&lt;65% Equity) - Slab Tax (Sec 50AA)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fundCategory === "debt" && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Your Income Tax Slab Rate</Label>
                  <Select
                    value={String(incomeTaxSlab)}
                    onValueChange={(val) => setIncomeTaxSlab(Number(val))}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select tax slab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10% Slab Rate</SelectItem>
                      <SelectItem value="20">20% Slab Rate</SelectItem>
                      <SelectItem value="30">30% Slab Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step-Up SIP (SIP Mode Only) */}
        {investmentType === "sip" && (
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="step-up" className="text-sm font-medium cursor-pointer">
                Annual Step-Up SIP
              </Label>
              <Switch
                id="step-up"
                checked={stepUpEnabled}
                onCheckedChange={setStepUpEnabled}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Increase monthly investment annually as your income grows
            </p>
            {stepUpEnabled && (
              <CalculatorInput
                label="Annual Step-Up Percentage"
                value={stepUpPercentage}
                onChange={setStepUpPercentage}
                min={1}
                max={50}
                step={1}
                suffix="%"
              />
            )}
          </div>
        )}

        {/* Inflation Adjustment */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="inflation" className="text-sm font-medium cursor-pointer">
              Adjust for Inflation (Purchasing Power)
            </Label>
            <Switch
              id="inflation"
              checked={inflationEnabled}
              onCheckedChange={setInflationEnabled}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Shows what your future maturity corpus can actually buy in today's money
          </p>
          {inflationEnabled && (
            <CalculatorInput
              label="Expected Annual Inflation Rate"
              value={inflationRate}
              onChange={setInflationRate}
              min={1}
              max={20}
              step={0.5}
              suffix="%"
            />
          )}
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
          onClick={handleCalculate}
        >
          <Calculator className="w-5 h-5" />
          Calculate Mutual Fund Returns
        </Button>
      </Card>

      {/* Analysis & Results Card */}
      <Card className="p-6 space-y-5 shadow-lg bg-card">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Mutual Fund Wealth Projection
        </h3>

        {/* Visual Chart */}
        <ResultChart
          principal={result.invested}
          returns={result.returns}
          principalLabel="Capital Invested"
          returnsLabel={compareDirectRegular ? "Direct Plan Returns" : "Gross Returns"}
        />

        {/* Direct Plan Advantage Callout */}
        {compareDirectRegular && result.commissionDifference > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <span>🎯</span> Direct Plan Advantage
              </span>
              <span className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
                +{formatAmount(result.commissionDifference)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
              By investing in the <strong>Direct Plan ({result.netDirectRate.toFixed(1)}% net)</strong> instead of the Regular Plan ({result.netRegularRate.toFixed(1)}% net), you save <strong>{formatAmount(result.commissionDifference)}</strong> in distributor commissions!
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Direct Plan Value</span>
                <span className="font-bold text-foreground text-sm">{formatAmount(result.directTotal)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Regular Plan Value</span>
                <span className="font-bold text-muted-foreground text-sm">{formatAmount(result.regularTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Core Value Summary Grid */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-secondary/40 p-3.5 rounded-lg border">
            <span className="text-xs text-muted-foreground block mb-1">Total Invested</span>
            <span className="text-base font-bold text-foreground">{formatAmount(result.invested)}</span>
          </div>
          <div className="bg-primary/5 p-3.5 rounded-lg border border-primary/20">
            <span className="text-xs text-muted-foreground block mb-1">Estimated Returns</span>
            <span className="text-base font-bold text-primary">{formatAmount(result.returns)}</span>
          </div>
        </div>

        {/* Total Pre-Tax Value */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md text-primary-foreground space-y-1">
          <span className="text-xs opacity-90 block">
            {compareDirectRegular ? "Projected Direct Plan Corpus" : "Total Projected Corpus"}
          </span>
          <span className="text-3xl font-extrabold block">{formatAmount(result.total)}</span>
        </div>

        {/* Latest 2026 Capital Gains Tax Breakdown Card */}
        {taxEnabled && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                Capital Gains Tax ({result.taxTypeLabel})
              </span>
              <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                -{formatAmount(result.taxAmount)}
              </span>
            </div>

            {fundCategory === "equity" && totalYears > 1 && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                First <strong>₹1,25,000 profit is 100% Tax-Free</strong> under Budget 2024–2026. Only profits above ₹1.25L are taxed at 12.5%.
              </p>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-amber-200/80 dark:border-amber-800/80">
              <span className="text-xs font-semibold text-foreground">Net In-Hand Returns (Post-Tax)</span>
              <span className="text-base font-bold text-green-600 dark:text-green-400">
                {formatAmount(result.postTaxTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Inflation Purchasing Power Display */}
        {inflationEnabled && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3.5 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-blue-800 dark:text-blue-300">
                Purchasing Power Today ({inflationRate}% Inflation)
              </span>
              <span className="text-base font-bold text-blue-900 dark:text-blue-200">
                {formatAmount(result.inflationAdjustedTotal)}
              </span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              In {totalYears.toFixed(1)} years, {formatAmount(result.total)} will buy what {formatAmount(result.inflationAdjustedTotal)} buys today.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="secondary"
            className="w-full gap-2 h-11 text-sm font-semibold border border-primary/20"
            onClick={() => setScheduleModalOpen(true)}
          >
            <Calendar className="w-4 h-4 text-primary" />
            View Annual Growth Schedule Table
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              Export & Share Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Schedule Dialog */}
      <InvestmentScheduleDialog
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title="Mutual Fund Growth & Direct Plan Schedule"
        schedule={mfSchedule}
      />

      {/* Save Dialog - Preserving Backwards Compatibility */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="mutualfund"
        inputs={{
          investmentType: investmentType === "sip" ? 1 : 2,
          amount: investmentType === "sip" ? monthlyInvestment : lumpsumAmount,
          expectedReturn,
          years,
          months,
          directTER,
          regularTER,
          inflationEnabled: inflationEnabled ? 1 : 0,
        }}
        results={{
          invested: result.invested,
          returns: result.returns,
          total: result.total,
          directTotal: result.directTotal,
          regularTotal: result.regularTotal,
          commissionDifference: result.commissionDifference,
          postTaxTotal: result.postTaxTotal,
        }}
      />

      {/* Share Report Modal */}
      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Mutual Fund Investment & Tax Analysis Statement"
        inputs={[
          { label: "Investment Mode", value: investmentType === "sip" ? "Monthly SIP" : "One-Time Lumpsum" },
          { label: "Investment Amount", value: formatAmount(investmentType === "sip" ? monthlyInvestment : lumpsumAmount) },
          { label: "Expected Gross CAGR", value: `${expectedReturn}% p.a.` },
          { label: "Investment Horizon", value: `${years} Years ${months > 0 ? `${months} Months` : ""}` },
          ...(compareDirectRegular ? [
            { label: "Direct Plan TER", value: `${directTER}%` },
            { label: "Regular Plan TER", value: `${regularTER}%` },
          ] : []),
        ]}
        results={[
          { label: "Total Capital Invested", value: formatAmount(result.invested) },
          { label: "Estimated Direct Plan Corpus", value: formatAmount(result.directTotal), isHighlight: true },
          ...(compareDirectRegular ? [
            { label: "Regular Plan Corpus", value: formatAmount(result.regularTotal) },
            { label: "Commission Saved by Going Direct", value: `+${formatAmount(result.commissionDifference)}`, isHighlight: true },
          ] : []),
          ...(taxEnabled ? [
            { label: `Capital Gains Tax (${result.taxTypeLabel})`, value: `-${formatAmount(result.taxAmount)}` },
            { label: "Net In-Hand Post-Tax Corpus", value: formatAmount(result.postTaxTotal), isHighlight: true },
          ] : []),
        ]}
        scheduleTitle="Mutual Fund Growth Schedule"
        scheduleHeaders={{ period: "Period", invested: "Invested Capital", interest: "Returns", balance: "Portfolio Value" }}
        schedule={mfSchedule}
      />
    </div>
  );
};

export default MutualFund;
