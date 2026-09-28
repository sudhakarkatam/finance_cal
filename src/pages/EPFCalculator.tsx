import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Save,
  RotateCcw,
  Briefcase,
  Info,
  Calendar,
  Share2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Coins,
} from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import InvestmentScheduleDialog, { ScheduleRow } from '@/components/InvestmentScheduleDialog';
import { calculateEPF } from '@/lib/calculations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const EPFCalculator = () => {
  const symbol = "₹";
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // State
  const [basicSalary, setBasicSalary] = useState(50000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [employeeContribution, setEmployeeContribution] = useState(12);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [salaryGrowth, setSalaryGrowth] = useState(5);
  const [interestRate, setInterestRate] = useState(8.25);
  const [capWageCeiling, setCapWageCeiling] = useState(false);
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(false);

  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Annual Employee Deposit for Budget 2021 Section 10(12) cap (₹2.5 Lakhs/year)
  const effectiveSalaryForDeposit = capWageCeiling ? Math.min(15000, basicSalary) : basicSalary;
  const annualEmployeeDeposit = (employeeContribution / 100) * effectiveSalaryForDeposit * 12;
  const isOverTaxThreshold = annualEmployeeDeposit > 250000;

  // Schedule calculation
  const epfSchedule = useMemo(() => {
    const list: ScheduleRow[] = [];
    const years = Math.max(1, retirementAge - currentAge);
    let balance = currentBalance;
    let totalEmpCont = 0;
    let totalEmprCont = 0;
    let currentSalary = basicSalary;
    const monthlyRate = interestRate / (12 * 100);

    for (let year = 1; year <= years; year++) {
      const pensionableSalary = Math.min(15000, currentSalary);
      const effectiveSalary = capWageCeiling ? pensionableSalary : currentSalary;

      // Employee share (12% or custom VPF)
      const empCont = (employeeContribution / 100) * effectiveSalary;

      // Employer statutory share:
      // Total employer liability is 12% of basic.
      // EPS share is 8.33% capped at ₹15,000 wage ceiling (max ₹1,250/month).
      // The entire remainder of the 12% goes directly to the employee's EPF account!
      const totalEmpr12Pct = (12 / 100) * effectiveSalary;
      const monthlyEPS = Math.min(
        1250,
        Math.round((pensionableSalary * 8.333333333333334) / 100)
      );
      const emprCont = Math.max(0, totalEmpr12Pct - monthlyEPS);
      const monthlyTotal = empCont + emprCont;

      for (let month = 1; month <= 12; month++) {
        totalEmpCont += empCont;
        totalEmprCont += emprCont;
        balance += monthlyTotal;
        const interest = balance * monthlyRate;
        balance += interest;
      }

      const totalCont = totalEmpCont + totalEmprCont;
      let milestoneTag = '';
      if (year === 5) milestoneTag = ' (5Y Tax-Free Lock-in Met)';
      else if (currentAge + year === 58) milestoneTag = ' (EPS Pension Age 58)';
      else if (currentAge + year === retirementAge) milestoneTag = ' (Retirement)';

      list.push({
        period: `Age ${currentAge + year}${milestoneTag}`,
        invested: Math.round(totalCont),
        interest: Math.round(Math.max(0, balance - totalCont - currentBalance)),
        total: Math.round(balance),
      });

      currentSalary *= (1 + salaryGrowth / 100);
    }
    return list;
  }, [
    basicSalary,
    currentBalance,
    employeeContribution,
    currentAge,
    retirementAge,
    salaryGrowth,
    interestRate,
    capWageCeiling,
  ]);

  // Main Result
  const result = useMemo(() => {
    return calculateEPF(
      basicSalary,
      currentBalance,
      employeeContribution,
      currentAge,
      retirementAge,
      salaryGrowth,
      interestRate,
      capWageCeiling
    );
  }, [
    basicSalary,
    currentBalance,
    employeeContribution,
    currentAge,
    retirementAge,
    salaryGrowth,
    interestRate,
    capWageCeiling,
  ]);

  // Inflation-adjusted corpus (purchasing power in today's money assuming 6% inflation)
  const inflationAdjustedMaturity = useMemo(() => {
    if (result.yearsToRetirement <= 0) return result.maturityValue;
    return Math.round(result.maturityValue / Math.pow(1 + 0.06, result.yearsToRetirement));
  }, [result.maturityValue, result.yearsToRetirement]);

  const handleReset = () => {
    setBasicSalary(50000);
    setCurrentBalance(0);
    setEmployeeContribution(12);
    setCurrentAge(30);
    setRetirementAge(60);
    setSalaryGrowth(5);
    setInterestRate(8.25);
    setCapWageCeiling(false);
    setShowInflationAdjusted(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">EPF Calculator</h2>
              <p className="text-xs text-muted-foreground">Employees' Provident Fund & Pension</p>
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
                  <DialogTitle>About EPF & Calculation Rules</DialogTitle>
                  <DialogDescription className="sr-only">
                    Regulatory rules, contribution formulas, lock-in period, and tax guidelines for Employees' Provident Fund.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3.5 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">What is EPF?</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Employees' Provident Fund (EPF) is a government-backed retirement scheme for salaried employees in India. Both you and your employer contribute 12% of your basic pay each month under your UAN.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Interest Rate</h3>
                    <p className="text-xs text-muted-foreground">
                      <strong>8.25% p.a.</strong> (Notified by EPFO). Compounded monthly and credited on March 31st each financial year.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Monthly Contribution (12% + 12%)</h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      <li><strong>Your Share (12%):</strong> 100% deposited into your EPF account.</li>
                      <li><strong>Employer Share (12%):</strong> 8.33% goes to EPS pension (max ₹1,250/mo), and the remaining balance goes into your EPF account.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1.5 text-xs">
                      🔒 Key Withdrawal Rules
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
                      <li><strong>Tax-Free After 5 Years:</strong> Withdrawals are 100% tax-free after 5 years of continuous service (transferred across jobs under the same UAN).</li>
                      <li><strong>Partial Withdrawals:</strong> Allowed after 12 months of service for medical needs, home purchase/construction, or marriage/education.</li>
                      <li><strong>Unemployment:</strong> 75% can be withdrawn after 1 month of unemployment, and the remaining 25% after 12 continuous months.</li>
                      <li><strong>Retirement (Age 58):</strong> Full EPF balance can be withdrawn lump-sum. EPS pension begins if you completed 10+ years of service.</li>
                      <li><strong>25% Minimum Balance:</strong> A 25% balance must remain in the account during partial withdrawals so your funds keep compounding.</li>
                    </ul>
                  </div>

                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                      ⚖️ <strong>Disclaimer:</strong> Projections are estimates based on 8.25% interest and your chosen salary growth. Actual returns depend on future EPFO rate notifications and employer policies.
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

        {/* Rate & 5Y Lock-in Info Card */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3.5 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-600 dark:text-blue-300">EPFO Notified Rate</p>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded border border-blue-500/30">
              FY 2025-26
            </span>
          </div>
          <p className="text-base font-bold text-blue-900 dark:text-blue-100">
            {interestRate}% p.a. (Compounded Annually)
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Tax-free withdrawals after 5 years of continuous service under Sec 80C.</span>
          </p>
        </div>

        {/* Corporate CTC vs Statutory Wage Ceiling Toggle */}
        <div className="space-y-1.5 bg-muted/40 p-3 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Employer Contribution Model</Label>
            <span className="text-[11px] text-muted-foreground">
              {capWageCeiling ? 'Capped at ₹15,000' : 'Actual Basic Salary'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCapWageCeiling(false)}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-all text-center ${
                !capWageCeiling
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Actual Basic (Tech/Corporate CTC)
            </button>
            <button
              type="button"
              onClick={() => setCapWageCeiling(true)}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-all text-center ${
                capWageCeiling
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Statutory Cap (₹15,000 Ceiling)
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 leading-normal">
            {!capWageCeiling
              ? 'Standard for private & tech companies: Employer pays 12% of full basic (EPS capped at ₹1,250, remainder to EPF).'
              : 'Minimum statutory model: Employer & employee contributions are capped at 12% of ₹15,000 (₹1,800/mo each).'}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <CalculatorInput
              label="Basic Monthly Salary (including DA)"
              value={basicSalary}
              onChange={setBasicSalary}
              min={0}
              max={10000000}
              step={100}
              prefix={symbol}
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              {[25000, 50000, 75000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBasicSalary(val)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    basicSalary === val
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  ₹{(val / 1000).toLocaleString('en-IN')}k
                </button>
              ))}
            </div>
          </div>

          <CalculatorInput
            label="Current EPF Balance"
            value={currentBalance}
            onChange={setCurrentBalance}
            min={0}
            max={100000000}
            step={1000}
            prefix={symbol}
          />

          <div className="space-y-1">
            <CalculatorInput
              label="Employee Contribution %"
              value={employeeContribution}
              onChange={setEmployeeContribution}
              min={0}
              max={100}
              step={0.5}
              suffix="%"
            />
            {employeeContribution > 12 && (
              <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>12% Mandatory EPF + {(employeeContribution - 12).toFixed(1)}% Voluntary (VPF)</span>
              </div>
            )}
          </div>

          <CalculatorInput
            label="Current Age"
            value={currentAge}
            onChange={setCurrentAge}
            min={18}
            max={80}
            step={1}
            suffix="years"
          />

          <CalculatorInput
            label="Expected Retirement Age"
            value={retirementAge}
            onChange={setRetirementAge}
            min={40}
            max={65}
            step={1}
            suffix="years"
          />

          <CalculatorInput
            label="Expected Annual Salary Growth %"
            value={salaryGrowth}
            onChange={setSalaryGrowth}
            min={0}
            max={50}
            step={0.1}
            suffix="%"
          />

          <CalculatorInput
            label="Current EPF Interest Rate (p.a)"
            value={interestRate}
            onChange={setInterestRate}
            min={1}
            max={20}
            step={0.05}
            suffix="%"
          />
        </div>

        {/* Budget 2021 Tax Rule Alert (> ₹2.5L / year) */}
        {isOverTaxThreshold && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="leading-relaxed">
              <span className="font-semibold">Budget 2021 Section 10(12) Rule: </span>
              Your annual employee EPF deposit ({formatCurrency(annualEmployeeDeposit)}) exceeds ₹2,50,000. Interest earned on contributions above ₹2.5L/year is taxable at your income tax slab rate.
            </div>
          </div>
        )}

        {currentAge >= retirementAge && (
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-700 dark:text-red-300">
              <strong>Error:</strong> Current Age cannot be greater than or equal to retirement age.
            </p>
          </div>
        )}
      </Card>

      {/* Results Card */}
      <Card className="p-6 space-y-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">EPF Retirement Corpus</h3>
          <div className="text-xs text-muted-foreground font-medium">
            Horizon: <span className="font-bold text-foreground">{result.yearsToRetirement} Years</span>
          </div>
        </div>

        {/* Donut Chart */}
        <ResultChart
          principal={result.totalContributions}
          returns={result.totalInterest}
          principalLabel="Contributions"
          returnsLabel="Interest Accrued"
        />

        {/* Contribution Breakdown Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-secondary/40 p-3.5 rounded-lg border border-border space-y-1">
            <span className="text-muted-foreground block">Employee Contribution</span>
            <span className="text-[11px] text-muted-foreground block">({employeeContribution}% of salary)</span>
            <span className="text-sm font-bold text-foreground block pt-0.5">
              {formatCurrency(result.totalEmployeeContribution)}
            </span>
          </div>

          <div className="bg-secondary/40 p-3.5 rounded-lg border border-border space-y-1">
            <span className="text-muted-foreground block">Employer EPF Contribution</span>
            <span className="text-[11px] text-muted-foreground block">(12% minus EPS cap)</span>
            <span className="text-sm font-bold text-foreground block pt-0.5">
              {formatCurrency(result.totalEmployerContribution)}
            </span>
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-sm text-muted-foreground">Total Combined Deposits</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.totalContributions)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Interest Earned</span>
            <span className="font-semibold text-primary">{formatCurrency(result.totalInterest)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <div>
              <span className="text-base font-semibold text-foreground block">Final Maturity Corpus</span>
              <span className="text-xs text-muted-foreground">Lump sum available at retirement</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(showInflationAdjusted ? inflationAdjustedMaturity : result.maturityValue)}
            </span>
          </div>
        </div>

        {/* Inflation Adjustment Switch */}
        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border text-xs">
          <div className="space-y-0.5 pr-2">
            <Label htmlFor="epf-inflation" className="font-medium cursor-pointer text-xs">
              Show today's purchasing power (Inflation adjusted)
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Calculates equivalent purchasing power assuming 6% annual inflation over {result.yearsToRetirement} years.
            </p>
          </div>
          <Switch
            id="epf-inflation"
            checked={showInflationAdjusted}
            onCheckedChange={setShowInflationAdjusted}
          />
        </div>

        {/* EPS Lifetime Pension Card */}
        {result.estimatedPensionMonthly > 0 && (
          <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
            <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                  Estimated EPS Lifetime Pension
                </span>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(result.estimatedPensionMonthly)} / mo
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Payable monthly after age 58 under Employee Pension Scheme (EPS-95) rules for completed service.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <Button
            variant="secondary"
            className="w-full gap-2 h-11 text-sm font-semibold border border-primary/20"
            onClick={() => setScheduleModalOpen(true)}
          >
            <Calendar className="w-4 h-4 text-primary" />
            View Annual EPF Growth Schedule & Milestones
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

      {/* Save Calculation Dialog */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="epf"
        inputs={{
          basicSalary,
          currentBalance,
          employeeContribution,
          currentAge,
          retirementAge,
          salaryGrowth,
          interestRate,
          capWageCeiling,
        }}
        results={{
          totalEmployeeContribution: result.totalEmployeeContribution,
          totalEmployerContribution: result.totalEmployerContribution,
          totalContributions: result.totalContributions,
          totalInterest: result.totalInterest,
          maturityValue: result.maturityValue,
          yearsToRetirement: result.yearsToRetirement,
        }}
      />

      {/* Share & PDF Report Modal */}
      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Employees' Provident Fund (EPF) Report"
        inputs={[
          { label: "Basic Monthly Salary", value: formatCurrency(basicSalary) },
          { label: "Current EPF Balance", value: formatCurrency(currentBalance) },
          { label: "Employee Contribution", value: `${employeeContribution}%` },
          { label: "Employer EPF Share", value: capWageCeiling ? "Statutory ₹1,800/mo Cap" : "12% of Basic minus EPS" },
          { label: "Annual Salary Hike", value: `${salaryGrowth}%` },
          { label: "EPF Interest Rate (p.a)", value: `${interestRate}%` },
          { label: "Retirement Horizon", value: `${currentAge} to ${retirementAge} Years (${result.yearsToRetirement} Yrs)` },
          { label: "Tax Exemption", value: "Tax-Free after 5 Years (Sec 80C)" },
        ]}
        results={[
          { label: "Employee Share Deposited", value: formatCurrency(result.totalEmployeeContribution) },
          { label: "Employer Share Deposited", value: formatCurrency(result.totalEmployerContribution) },
          { label: "Total Combined Deposits", value: formatCurrency(result.totalContributions) },
          { label: "Total Interest Earned", value: formatCurrency(result.totalInterest) },
          { label: "Final EPF Maturity Corpus", value: formatCurrency(result.maturityValue), isHighlight: true },
        ]}
        scheduleTitle={`EPF ${result.yearsToRetirement}-Year Accumulation Schedule`}
        scheduleHeaders={{ period: "Age / Milestone", invested: "Total Deposited", interest: "Interest Accrued", balance: "EPF Balance" }}
        schedule={epfSchedule}
      />

      {/* Growth Schedule Modal */}
      <InvestmentScheduleDialog
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title={`EPF ${result.yearsToRetirement}-Year Growth Schedule`}
        schedule={epfSchedule}
      />
    </div>
  );
};

export default EPFCalculator;
