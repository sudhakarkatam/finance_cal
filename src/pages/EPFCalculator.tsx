import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Briefcase, Info } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { calculateEPF } from '@/lib/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCurrency } from '@/hooks/useCurrency';

const EPFCalculator = () => {
  const symbol = "₹";
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const [basicSalary, setBasicSalary] = useState(50000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [employeeContribution, setEmployeeContribution] = useState(12);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [salaryGrowth, setSalaryGrowth] = useState(5);
  const [interestRate, setInterestRate] = useState(8.25);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const result = useMemo(() => {
    return calculateEPF(
      basicSalary,
      currentBalance,
      employeeContribution,
      currentAge,
      retirementAge,
      salaryGrowth,
      interestRate
    );
  }, [basicSalary, currentBalance, employeeContribution, currentAge, retirementAge, salaryGrowth, interestRate]);

  const handleReset = () => {
    setBasicSalary(50000);
    setCurrentBalance(0);
    setEmployeeContribution(12);
    setCurrentAge(30);
    setRetirementAge(60);
    setSalaryGrowth(5);
    setInterestRate(8.25);
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">EPF Calculator</h2>
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
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>About EPF & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is EPF?</h3>
                    <p className="text-muted-foreground">
                      The Employee Provident Fund (EPF) is a government-backed savings scheme for salaried employees in India, designed to help fund their retirement. Both the employee and employer contribute to this fund monthly. The EPFO (Employees' Provident Fund Organisation) revises the EPF interest rate annually.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Current EPF Interest Rate</h3>
                    <p className="text-muted-foreground">
                      <strong>8.25% p.a. (FY 2024-25)</strong>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      The EPFO Central Board of Trustees fixes the EPF interest rates every financial year after consulting the Ministry of Finance.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Contribution Breakdown</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Employee contribution:</strong> 12% of monthly basic salary + dearness allowance (default)</li>
                      <li><strong>Employer contribution:</strong> 12% total
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>3.67% goes to EPF account (shown in calculator)</li>
                          <li>8.33% goes to EPS (Employee Pension Scheme), capped at ₹1,250 if salary &gt; ₹15,000</li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Interest Calculation</h3>
                    <p className="text-muted-foreground">
                      Interest is calculated monthly on the closing balance (after adding contributions) but credited to the account annually at year-end. The monthly interest rate is derived from the annual rate divided by 12.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Interest compounding happens at year-end when all accrued monthly interest is added to the balance.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The EPF calculator gives you an instant estimation of your retirement corpus, factoring in your present balance, monthly salary, future increments, and interest rates—helping you make informed decisions about your retirement savings.
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs italic">
                      Note: Employer's EPS contribution (8.33%) is separate and not included in EPF corpus calculation, as it provides separate pension benefits.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Basic EPF Accumulation</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Age 30, Salary ₹50,000, Current balance ₹0, Retirement age 60<br />
                          <strong>Employee Contribution:</strong> 12% of ₹50,000 = ₹6,000/month<br />
                          <strong>Employer EPF:</strong> 3.67% of ₹50,000 = ₹1,835/month<br />
                          <strong>Total Monthly:</strong> ₹7,835<br />
                          <strong>Annual Contribution:</strong> ₹94,020 × 30 years = ₹28,20,600<br />
                          <strong>Result:</strong> Maturity corpus ≈ ₹1.5-2 crores (with 8.25% interest and salary growth)<br />
                          <strong>Benefit:</strong> Tax-free retirement corpus from mandatory savings
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: With Existing Balance</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Age 35, Salary ₹60,000, Current balance ₹5,00,000, Retire at 60<br />
                          <strong>Monthly Contribution:</strong> ₹7,202 (employee) + ₹2,202 (employer EPF) = ₹9,404<br />
                          <strong>Years to Retirement:</strong> 25 years<br />
                          <strong>New Contributions:</strong> ₹28,21,200 over 25 years<br />
                          <strong>Result:</strong> Total corpus ≈ ₹2.2-2.8 crores (including ₹5L starting balance)<br />
                          <strong>Advantage:</strong> Existing balance compounds significantly over 25 years
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Salary Growth Impact</p>
                        <p className="text-sm">
                          <strong>Situation A:</strong> ₹40,000 salary, 5% annual growth, 30 years → Corpus ≈ ₹1.2 crores<br />
                          <strong>Situation B:</strong> ₹40,000 salary, 10% annual growth, 30 years → Corpus ≈ ₹2.1 crores<br />
                          <strong>Difference:</strong> ₹90 lakhs more with higher salary growth<br />
                          <strong>Reason:</strong> Higher salary = higher contributions = exponential growth<br />
                          <strong>Lesson:</strong> Salary increments significantly boost EPF corpus over long term
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Employer Contribution Breakdown</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Basic salary = ₹60,000<br />
                          <strong>Employee Contribution:</strong> 12% = ₹7,200 (goes to EPF)<br />
                          <strong>Employer Total:</strong> 12% = ₹7,200<br />
                          <strong>Employer EPF:</strong> 3.67% = ₹2,202 (included in corpus)<br />
                          <strong>Employer EPS:</strong> 8.33% = ₹5,000 (capped at ₹1,250 if salary &gt; ₹15,000)<br />
                          <strong>EPF Corpus Impact:</strong> Only ₹2,202/month from employer to EPF<br />
                          <strong>Total EPF:</strong> ₹7,200 + ₹2,202 = ₹9,402/month grows to retirement
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Scenario</p>
                        <p className="text-sm">
                          <strong>Meera's Journey:</strong> Started at age 25, salary ₹30,000, grew to ₹1,50,000 by age 60<br />
                          <strong>Contributions:</strong> Started with ₹3,602/month, ended with ₹18,502/month<br />
                          <strong>Total Invested:</strong> ₹62,46,580 over 35 years<br />
                          <strong>Final Corpus:</strong> ₹2,00,22,922 at retirement (₹2 crores+)<br />
                          <strong>Interest Earned:</strong> ₹1,37,76,342 (more than double the contributions)<br />
                          <strong>Success:</strong> EPF provided secure retirement fund through disciplined savings
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Check EPF balance annually through EPFO portal - ensure employer contributions are credited</li>
                      <li>Don't withdraw EPF before retirement unless absolutely necessary - it loses compounding power</li>
                      <li>Transfer EPF when changing jobs - maintain continuity for better returns</li>
                      <li>Salary increments directly increase EPF contributions and final corpus</li>
                      <li>EPF is fully tax-free at withdrawal after 5 years of continuous service</li>
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

        <Alert className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs ml-2">
            This calculator is designed for Indian financial rules (Rupees ₹).
          </AlertDescription>
        </Alert>

        <p className="text-sm text-muted-foreground">
          Calculate your Employee Provident Fund corpus at retirement - estimate total contributions, interest earned, and projected maturity value
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Basic Monthly Salary (including DA)"
            value={basicSalary}
            onChange={setBasicSalary}
            min={0}
            max={10000000}
            step={100}
            prefix={symbol}
          />

          <CalculatorInput
            label="Current EPF Balance"
            value={currentBalance}
            onChange={setCurrentBalance}
            min={0}
            max={100000000}
            step={1000}
            prefix={symbol}
          />

          <CalculatorInput
            label="Employee EPF Contribution %"
            value={employeeContribution}
            onChange={setEmployeeContribution}
            min={0}
            max={100}
            step={0.1}
            suffix="%"
          />

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
            min={55}
            max={60}
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
            step={0.01}
            suffix="%"
          />
        </div>

        {(currentAge >= retirementAge) && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">
              <strong>Error:</strong> Current Age cannot be greater than or equal to retirement age.
            </p>
          </div>
        )}

        {(retirementAge > 60) && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">
              <strong>Error:</strong> The maximum retirement age is 60 years.
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> Current EPF interest rate: 8.25% p.a. (FY 2024-25). Employer's EPF contribution is 3.67% of basic salary (8.33% goes to EPS, not included in EPF corpus).
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">EPF Retirement Analysis</h3>

        {/* Investment Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">📋 Investment Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <p className="text-blue-600 mb-1">Years to Retirement</p>
              <p className="font-bold text-blue-800">{result.yearsToRetirement} years</p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 mb-1">Interest Rate</p>
              <p className="font-bold text-blue-800">{interestRate}%</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-xs text-muted-foreground mb-1">Total Employee Contribution</p>
              <p className="text-xs text-muted-foreground mb-1">(12% of salary)</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(result.totalEmployeeContribution)}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-xs text-muted-foreground mb-1">Total Employer EPF Contribution</p>
              <p className="text-xs text-muted-foreground mb-1">(3.67% of salary)</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(result.totalEmployerContribution)}</p>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Total Contributions</p>
            <p className="text-xs text-muted-foreground mb-1">(Employee + Employer EPF)</p>
            <p className="text-base font-bold text-primary">{formatCurrency(result.totalContributions)}</p>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Total Interest Earned</p>
            <p className="text-base font-bold text-primary">{formatCurrency(result.totalInterest)}</p>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-green-100 mb-1">Maturity Value (Corpus at Retirement)</p>
              <p className="text-2xl font-bold text-green-50">{formatCurrency(result.maturityValue)}</p>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">📌 Important Note</h4>
          <div className="space-y-2 text-xs text-amber-700">
            <p>
              <strong>Employer EPS Contribution:</strong> Employer's EPS contribution (8.33% of basic salary, capped at ₹1,250 if salary &gt; ₹15,000) is separate and provides pension benefits. It is not included in the EPF corpus calculation shown above.
            </p>
            <p>
              <strong>EPF Lock-in Period:</strong> The Employees' Provident Fund (EPF) has a lock-in period of five years for tax-free withdrawals, but the full amount can be withdrawn at retirement or after 15 years of service. While you can't withdraw the entire amount before five years for it to be tax-free, partial withdrawals are permitted for specific purposes like unemployment, home purchases, or medical emergencies.
            </p>
          </div>
        </div>

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-4 h-4" />
          Save Calculation
        </Button>
      </Card>

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
          interestRate
        }}
        results={{
          totalEmployeeContribution: result.totalEmployeeContribution,
          totalEmployerContribution: result.totalEmployerContribution,
          totalContributions: result.totalContributions,
          totalInterest: result.totalInterest,
          maturityValue: result.maturityValue,
          yearsToRetirement: result.yearsToRetirement
        }}
      />
    </div>
  );
};

export default EPFCalculator;

