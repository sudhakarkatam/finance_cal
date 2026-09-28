import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Repeat, Info, Calendar, Share2, ShieldCheck, TrendingUp } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import InvestmentScheduleDialog, { ScheduleRow } from '@/components/InvestmentScheduleDialog';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const RDCalculator = () => {
  const { formatAmount, symbol } = useCurrency();
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenureMonths, setTenureMonths] = useState(60); // 5 Years default
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Official Indian Banks' Association (IBA) Quarterly Compounding Formula
  // M = Sum of [ P * (1 + R/400)^(remainingMonths / 3) ]
  const calculateRD = () => {
    const P = monthlyDeposit;
    const R = interestRate;
    const N = tenureMonths;
    const quarterlyRate = R / 400; // R / (4 * 100)

    let maturityAmount = 0;
    for (let m = 1; m <= N; m++) {
      const remainingMonths = N - m + 1;
      maturityAmount += P * Math.pow(1 + quarterlyRate, remainingMonths / 3);
    }

    const invested = P * N;
    const interest = Math.max(0, maturityAmount - invested);

    // Section 194A: TDS applies if annual interest exceeds ₹40,000 per financial year
    const tenureYears = N / 12;
    const annualInterest = tenureYears > 0 ? interest / tenureYears : 0;
    const tds = annualInterest > 40000 ? Math.round(interest * 0.1) : 0;
    const netReturn = Math.round(interest - tds);

    return {
      invested: Math.round(invested),
      interest: Math.round(interest),
      maturityAmount: Math.round(maturityAmount),
      tds,
      netReturn,
      annualInterest: Math.round(annualInterest),
    };
  };

  const result = calculateRD();

  // Growth Schedule aligned with quarterly compounding
  const rdSchedule = useMemo(() => {
    const list: ScheduleRow[] = [];
    const P = monthlyDeposit;
    const quarterlyRate = interestRate / 400;
    const N = tenureMonths;

    let step = 12;
    if (N <= 12) step = 3;
    else if (N <= 24) step = 6;
    else step = 12;

    for (let m = step; m <= N; m += step) {
      let currentAmount = 0;
      for (let k = 1; k <= m; k++) {
        const remM = m - k + 1;
        currentAmount += P * Math.pow(1 + quarterlyRate, remM / 3);
      }
      const currentInv = P * m;
      const periodLabel = m % 12 === 0 ? `Year ${m / 12}` : `Month ${m}`;

      list.push({
        period: periodLabel,
        invested: Math.round(currentInv),
        interest: Math.round(Math.max(0, currentAmount - currentInv)),
        total: Math.round(currentAmount),
      });
    }

    if (N % step !== 0) {
      let finalAmount = 0;
      for (let k = 1; k <= N; k++) {
        const remM = N - k + 1;
        finalAmount += P * Math.pow(1 + quarterlyRate, remM / 3);
      }
      list.push({
        period: `Month ${N} (Maturity)`,
        invested: Math.round(P * N),
        interest: Math.round(Math.max(0, finalAmount - P * N)),
        total: Math.round(finalAmount),
      });
    }

    return list;
  }, [monthlyDeposit, interestRate, tenureMonths]);

  const handleReset = () => {
    setMonthlyDeposit(5000);
    setInterestRate(6.5);
    setTenureMonths(60);
  };

  const tenureYearsDisplay = (tenureMonths / 12).toFixed(tenureMonths % 12 === 0 ? 0 : 1);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Repeat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">RD Calculator</h2>
              <p className="text-xs text-muted-foreground">Recurring Deposit with quarterly compounding</p>
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
                  <DialogTitle>About Recurring Deposit (RD) & Banking Rules</DialogTitle>
                  <DialogDescription className="sr-only">
                    Official Indian Banks Association compounding formula, DICGC insurance, and TDS rules for Recurring Deposits.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">What is a Recurring Deposit (RD)?</h3>
                    <p className="text-muted-foreground">
                      A Recurring Deposit is a disciplined savings scheme offered by Indian banks and the Post Office. You deposit a fixed amount every month for a pre-decided tenure (from 6 months to 10 years) and earn a fixed, guaranteed interest rate.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">Official Banking Compounding Method</h3>
                    <p className="text-muted-foreground">
                      Under Indian Banks' Association (IBA) guidelines, <strong>RD interest is compounded quarterly</strong>, even though installments are deposited monthly. This calculator uses the statutory IBA formula:
                    </p>
                    <p className="text-xs font-mono bg-muted p-2 rounded mt-1.5">
                      M = P × [ (1 + i)^n - 1 ] / [ 1 - (1 + i)^(-1/3) ]
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Where <em>i = Rate / 400</em> (quarterly rate) and <em>n</em> = number of quarters. This matches SBI and Post Office passbooks to the single rupee.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      🛡️ DICGC Insurance & Safety
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      Your RD deposits in all commercial and cooperative banks are insured up to <strong>₹5,00,000</strong> (Principal + Interest) per bank by the Deposit Insurance and Credit Guarantee Corporation (DICGC), an RBI subsidiary.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      📋 Section 194A TDS Rule
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      TDS at 10% is deducted only if the total RD interest in a single financial year exceeds <strong>₹40,000</strong>. You can submit Form 15G if your total annual income is below the taxable threshold.
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

        {/* Bank Compounding Standard Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3.5 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-300">Indian Banking Standard</p>
          <p className="text-base font-bold text-blue-900 dark:text-blue-100">Quarterly Compounding (IBA Method)</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Installments deposited monthly & compounded quarterly
          </p>
        </div>

        {/* Monthly Deposit Input */}
        <div className="space-y-2">
          <CalculatorInput
            label="Monthly Deposit"
            value={monthlyDeposit}
            onChange={setMonthlyDeposit}
            min={100}
            max={1000000}
            step={500}
            prefix={symbol}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[1000, 2000, 5000, 10000, 25000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMonthlyDeposit(val)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  monthlyDeposit === val
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                ₹{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        {/* Interest Rate */}
        <CalculatorInput
          label="Interest Rate (p.a)"
          value={interestRate}
          onChange={setInterestRate}
          min={1}
          max={15}
          step={0.1}
          suffix="%"
          placeholder="6.5"
        />

        {/* Tenure with Months & Quick Presets */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Tenure: {tenureYearsDisplay} Years ({tenureMonths} Months)</span>
          </div>
          <CalculatorInput
            label="Tenure (in Months)"
            value={tenureMonths}
            onChange={(val) => setTenureMonths(Math.max(6, Math.min(120, Math.round(val))))}
            min={6}
            max={120}
            step={3}
            suffix="Months"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: '6 Months', months: 6 },
              { label: '1 Year', months: 12 },
              { label: '2 Years', months: 24 },
              { label: '3 Years', months: 36 },
              { label: '5 Years', months: 60 },
            ].map((p) => (
              <button
                key={p.months}
                type="button"
                onClick={() => setTenureMonths(p.months)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  tenureMonths === p.months
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Card */}
      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Maturity Projection</h3>

        {/* Visual Donut Chart */}
        <ResultChart
          principal={result.invested}
          returns={result.interest}
          principalLabel="Total Deposited"
          returnsLabel="Interest Earned"
        />

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Total Invested</span>
            <span className="font-semibold text-foreground">{formatAmount(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Interest Earned</span>
            <span className="font-semibold text-primary">{formatAmount(result.interest)}</span>
          </div>
          {result.tds > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">TDS (10% under Sec 194A)</span>
              <span className="font-semibold text-destructive">-{formatAmount(result.tds)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total Maturity Value</span>
            <span className="text-xl font-bold text-primary">{formatAmount(result.maturityAmount)}</span>
          </div>
        </div>

        {result.tds > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-200">
            TDS applies because average annual interest ({formatAmount(result.annualInterest)}/yr) exceeds ₹40,000. Submit Form 15G if total income is below the taxable threshold.
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full gap-2 h-11 text-sm font-semibold border border-primary/20"
            onClick={() => setScheduleModalOpen(true)}
          >
            <Calendar className="w-4 h-4 text-primary" />
            View Growth Schedule Table
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

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="rd"
        inputs={{
          monthlyDeposit,
          interestRate,
          tenure: Number(tenureYearsDisplay),
          tenureMonths,
        }}
        results={result}
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Recurring Deposit (RD) Report"
        inputs={[
          { label: "Monthly Deposit", value: formatAmount(monthlyDeposit) },
          { label: "Interest Rate (p.a)", value: `${interestRate}%` },
          { label: "RD Tenure", value: `${tenureYearsDisplay} Years (${tenureMonths} Months)` },
          { label: "Compounding", value: "Quarterly (IBA Indian Bank Standard)" },
          { label: "Tax Deduction", value: result.tds > 0 ? "TDS Deducted (10%)" : "No TDS (Below ₹40k/yr)" },
        ]}
        results={[
          { label: "Total Deposited", value: formatAmount(result.invested) },
          { label: "Interest Earned", value: formatAmount(result.interest) },
          ...(result.tds > 0 ? [{ label: "TDS (10% Sec 194A)", value: `-${formatAmount(result.tds)}` }] : []),
          { label: "Total Maturity Value", value: formatAmount(result.maturityAmount), isHighlight: true },
        ]}
        scheduleTitle="Recurring Deposit Growth Schedule"
        scheduleHeaders={{ period: "Period", invested: "Total Deposited", interest: "Interest Accrued", balance: "Maturity Balance" }}
        schedule={rdSchedule}
      />

      <InvestmentScheduleDialog
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title="Recurring Deposit Growth Schedule"
        schedule={rdSchedule}
      />
    </div>
  );
};

export default RDCalculator;
