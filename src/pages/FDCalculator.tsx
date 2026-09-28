import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, PiggyBank, Info, Calendar, Share2, ShieldCheck, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import InvestmentScheduleDialog, { ScheduleRow } from '@/components/InvestmentScheduleDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCurrency } from '@/hooks/useCurrency';

const FDCalculator = () => {
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  const [depositAmount, setDepositAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7);
  const [tenureMonths, setTenureMonths] = useState(12); // Default 1 Year (12 Months)
  const [payoutType, setPayoutType] = useState<'cumulative' | 'payout'>('cumulative');
  const [frequency, setFrequency] = useState('4'); // Quarterly compounding / payout
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const tenureYears = tenureMonths / 12;
  const tenureYearsDisplay = tenureYears.toFixed(tenureMonths % 12 === 0 ? 0 : 1);

  const calculateFD = () => {
    const P = depositAmount;
    const R = interestRate / 100;
    const T = tenureYears;
    const freq = Number(frequency);

    let maturityAmount = 0;
    let interest = 0;
    let periodicPayout = 0;

    if (payoutType === 'cumulative') {
      // Standard Compound Interest: A = P * (1 + R/F)^(F * T)
      maturityAmount = P * Math.pow(1 + R / freq, freq * T);
      interest = Math.max(0, maturityAmount - P);
    } else {
      // Non-Cumulative (Regular Interest Payout)
      // Periodic payout = P * (R / freq)
      periodicPayout = P * (R / freq);
      const totalPeriods = freq * T;
      interest = periodicPayout * totalPeriods;
      maturityAmount = P; // Principal returned at maturity
    }

    // Section 194A TDS: Evaluated per financial year (Threshold: ₹40,000 / year)
    const annualInterest = T > 0 ? interest / T : 0;
    const tds = annualInterest > 40000 ? Math.round(interest * 0.1) : 0;
    const netReturn = Math.round(interest - tds);

    return {
      principal: P,
      interest: Math.round(interest),
      maturityAmount: Math.round(maturityAmount),
      tds,
      netReturn,
      annualInterest: Math.round(annualInterest),
      periodicPayout: Math.round(periodicPayout),
    };
  };

  const result = calculateFD();

  const fdSchedule = useMemo(() => {
    const list: ScheduleRow[] = [];
    const principal = depositAmount;
    const R = interestRate / 100;
    const freq = Number(frequency);
    const N = tenureMonths;

    let step = 12;
    if (N <= 12) step = 3;
    else if (N <= 24) step = 6;
    else step = 12;

    let runningAccumulatedInterest = 0;

    for (let m = step; m <= N; m += step) {
      const curT = m / 12;
      const periodLabel = m % 12 === 0 ? `Year ${m / 12}` : `Month ${m}`;

      if (payoutType === 'cumulative') {
        const mat = principal * Math.pow(1 + R / freq, freq * curT);
        const curInterest = mat - principal;
        list.push({
          period: periodLabel,
          invested: Math.round(principal),
          interest: Math.round(curInterest),
          total: Math.round(mat),
        });
      } else {
        const curPeriods = freq * curT;
        const curInterest = (principal * (R / freq)) * curPeriods;
        runningAccumulatedInterest = curInterest;
        list.push({
          period: periodLabel,
          invested: Math.round(principal),
          interest: Math.round(curInterest),
          total: Math.round(principal), // Principal constant in payout mode
        });
      }
    }

    if (N % step !== 0) {
      const curT = N / 12;
      const periodLabel = `Month ${N} (Maturity)`;
      if (payoutType === 'cumulative') {
        const mat = principal * Math.pow(1 + R / freq, freq * curT);
        list.push({
          period: periodLabel,
          invested: Math.round(principal),
          interest: Math.round(mat - principal),
          total: Math.round(mat),
        });
      } else {
        const curPeriods = freq * curT;
        const curInterest = (principal * (R / freq)) * curPeriods;
        list.push({
          period: periodLabel,
          invested: Math.round(principal),
          interest: Math.round(curInterest),
          total: Math.round(principal),
        });
      }
    }

    return list;
  }, [depositAmount, interestRate, tenureMonths, frequency, payoutType]);

  const handleReset = () => {
    setDepositAmount(100000);
    setInterestRate(7);
    setTenureMonths(12);
    setFrequency('4');
    setPayoutType('cumulative');
  };

  const frequencyOptions = [
    { value: '1', label: 'Yearly' },
    { value: '2', label: 'Half-Yearly' },
    { value: '4', label: 'Quarterly' },
    { value: '12', label: 'Monthly' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">FD Calculator</h2>
              <p className="text-xs text-muted-foreground">Fixed Deposit with cumulative & payout options</p>
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
                  <DialogTitle>About Fixed Deposit (FD) & Banking Guidelines</DialogTitle>
                  <DialogDescription className="sr-only">
                    Fixed Deposit compounding guidelines, cumulative vs payout plans, DICGC insurance, and Section 194A TDS rules.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">What is a Fixed Deposit (FD)?</h3>
                    <p className="text-muted-foreground">
                      A Fixed Deposit is a secured lump-sum investment offered by banks and NBFCs. You lock in a fixed principal for a predetermined tenure and earn a guaranteed interest rate unaffected by market fluctuations.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">Cumulative vs Non-Cumulative (Payout)</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        <strong>Cumulative (Reinvestment):</strong> Interest is compounded quarterly and paid out along with the principal at maturity. Best for wealth accumulation.
                      </li>
                      <li>
                        <strong>Non-Cumulative (Regular Payout):</strong> Interest is paid out directly into your savings account monthly, quarterly, or yearly. Best for retirees seeking periodic cash flow.
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      🛡️ DICGC Insurance Coverage
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      Bank deposits (principal and interest) are insured up to <strong>₹5,00,000</strong> per depositor per bank by the Deposit Insurance and Credit Guarantee Corporation (DICGC), an RBI subsidiary.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      📋 Section 194A TDS Rule (Annualized)
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      TDS at 10% is deducted only if the interest in a <strong>single financial year exceeds ₹40,000</strong>. You can submit Form 15G if your total annual taxable income is below the exemption limit.
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

        {/* Safety & Compounding Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3.5 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-300">Safety & Guarantee</p>
          <p className="text-base font-bold text-blue-900 dark:text-blue-100">Guaranteed Fixed Returns</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fixed interest rate locked for the entire tenure
          </p>
        </div>

        {/* Payout Option Toggle (Cumulative vs Non-Cumulative) */}
        <div className="space-y-1.5 bg-muted/40 p-3 rounded-lg border border-border">
          <Label className="text-sm font-medium text-foreground">Interest Payout Plan</Label>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPayoutType('cumulative')}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-all text-center ${
                payoutType === 'cumulative'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cumulative (At Maturity)
            </button>
            <button
              type="button"
              onClick={() => setPayoutType('payout')}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-all text-center ${
                payoutType === 'payout'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Regular Payout (Monthly/Quarterly)
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1">
            {payoutType === 'cumulative'
              ? 'Interest is reinvested and compounded quarterly. Entire corpus paid at maturity.'
              : 'Interest is paid out periodically directly into your savings account. Principal returned at maturity.'}
          </p>
        </div>

        {/* Deposit Amount */}
        <div className="space-y-2">
          <CalculatorInput
            label="Deposit Amount"
            value={depositAmount}
            onChange={setDepositAmount}
            min={1000}
            max={10000000}
            step={5000}
            prefix={symbol}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[25000, 50000, 100000, 200000, 500000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDepositAmount(val)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  depositAmount === val
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                ₹{val >= 100000 ? `${val / 100000} Lakh` : `${val / 1000}k`}
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
          placeholder="7.0"
        />

        {/* Tenure in Months with Presets */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Tenure: {tenureYearsDisplay} Years ({tenureMonths} Months)</span>
          </div>
          <CalculatorInput
            label="Tenure (in Months)"
            value={tenureMonths}
            onChange={(val) => setTenureMonths(Math.max(1, Math.min(120, Math.round(val))))}
            min={1}
            max={120}
            step={1}
            suffix="Months"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: '6 Months', months: 6 },
              { label: '1 Year', months: 12 },
              { label: '400 Days (~13M)', months: 13 },
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

        {/* Compounding / Payout Frequency */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {payoutType === 'cumulative' ? 'Compounding Frequency' : 'Payout Frequency'}
          </Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Card */}
      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">
          {payoutType === 'cumulative' ? 'Maturity Returns' : 'Income & Payout Summary'}
        </h3>

        {/* Visual Donut Chart */}
        <ResultChart
          principal={result.principal}
          returns={result.interest}
          principalLabel="Principal Deposit"
          returnsLabel="Total Interest"
        />

        {/* Payout highlight if non-cumulative */}
        {payoutType === 'payout' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                {frequencyOptions.find((f) => f.value === frequency)?.label} Payout Amount
              </p>
              <p className="text-xs text-muted-foreground">Credited to savings account</p>
            </div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(result.periodicPayout)}
            </p>
          </div>
        )}

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Principal Deposited</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.principal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Interest Earned</span>
            <span className="font-semibold text-primary">{formatCurrency(result.interest)}</span>
          </div>
          {result.tds > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">TDS (10% Sec 194A)</span>
              <span className="font-semibold text-destructive">-{formatCurrency(result.tds)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">
              {payoutType === 'cumulative' ? 'Total Maturity Value' : 'Principal Returned at Maturity'}
            </span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.maturityAmount)}</span>
          </div>
        </div>

        {result.tds > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-200">
            TDS applies because average annual interest ({formatCurrency(result.annualInterest)}/yr) exceeds ₹40,000. Submit Form 15G if total income is below the taxable threshold.
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
        calculationType="fd"
        inputs={{
          depositAmount,
          interestRate,
          tenure: Number(tenureYearsDisplay),
          tenureMonths,
          frequency: Number(frequency),
          payoutType,
        }}
        results={result}
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Fixed Deposit (FD) Report"
        inputs={[
          { label: "Deposit Amount", value: formatCurrency(depositAmount) },
          { label: "Interest Rate (p.a)", value: `${interestRate}%` },
          { label: "FD Tenure", value: `${tenureYearsDisplay} Years (${tenureMonths} Months)` },
          { label: "Payout Plan", value: payoutType === 'cumulative' ? 'Cumulative (At Maturity)' : 'Regular Payout' },
          {
            label: payoutType === 'cumulative' ? "Compounding" : "Payout Frequency",
            value: frequencyOptions.find((f) => f.value === frequency)?.label || "Quarterly",
          },
        ]}
        results={[
          { label: "Principal Deposit", value: formatCurrency(result.principal) },
          { label: "Total Interest Earned", value: formatCurrency(result.interest) },
          ...(result.tds > 0 ? [{ label: "TDS Deduction", value: `-${formatCurrency(result.tds)}` }] : []),
          { label: "Total Maturity Value", value: formatCurrency(result.maturityAmount), isHighlight: true },
        ]}
        scheduleTitle="Fixed Deposit Growth Schedule"
        scheduleHeaders={{ period: "Period", invested: "Principal Amount", interest: "Interest Accrued", balance: "Balance / Corpus" }}
        schedule={fdSchedule}
      />

      <InvestmentScheduleDialog
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title="Fixed Deposit Growth Schedule"
        schedule={fdSchedule}
      />
    </div>
  );
};

export default FDCalculator;
