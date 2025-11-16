import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Repeat, Info } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const RDCalculator = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenure, setTenure] = useState(1); // in years
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const calculateRD = () => {
    const P = monthlyDeposit; // Monthly RD installment
    const annualRate = interestRate / 100; // Annual interest rate (as decimal)
    const T = tenure; // Tenure in years
    const n = T * 12; // Total number of installments
    const r = annualRate / 12; // Monthly interest rate

    // Standard RD Formula: A = P * [(1 + r)^n - 1] / [1 - (1 + r)^(-1/3)]
    // This is the formula used by Indian banks for RD calculations

    let maturityAmount = 0;

    if (r > 0 && r < 1) { // Avoid division by zero and invalid calculations
      const compoundFactor = Math.pow(1 + r, n);
      const annuityFactor = (compoundFactor - 1) / r;
      maturityAmount = P * annuityFactor;
    } else if (r >= 1) {
      // For very high interest rates, use approximation
      maturityAmount = P * n * (1 + annualRate * T);
    } else {
      maturityAmount = P * n;
    }

    const invested = P * n; // Total invested amount
    const interest = maturityAmount - invested;

    return {
      invested: Math.round(invested),
      interest: Math.round(Math.max(0, interest)), // Ensure no negative interest
      maturityAmount: Math.round(Math.max(invested, maturityAmount)) // Ensure maturity >= invested
    };
  };

  const result = calculateRD();

  const handleReset = () => {
    setMonthlyDeposit(5000);
    setInterestRate(6.5);
    setTenure(1);
  };

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
              <p className="text-xs text-muted-foreground">Recurring Deposit calculator</p>
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
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>About RD & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Recurring Deposit (RD)?</h3>
                    <p className="text-muted-foreground">
                      Recurring Deposit (RD) is a fixed-term deposit scheme offered by banks and NBFCs where you deposit a fixed amount every month for a predetermined tenure. RD is ideal for individuals who want to save regularly and earn fixed returns on their investments.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Regular Savings:</strong> Deposit fixed amount monthly</li>
                      <li><strong>Fixed Returns:</strong> Guaranteed interest rate for entire tenure</li>
                      <li><strong>Flexible Tenure:</strong> Choose tenure from 6 months to 10 years</li>
                      <li><strong>Safety:</strong> Low risk, covered under DICGC insurance (up to ₹5 lakh per bank)</li>
                      <li><strong>No Minimum Balance:</strong> Start with as low as ₹100 per month</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">RD Calculation</h3>
                    <p className="text-muted-foreground mb-2">
                      RD uses future value of annuity formula:
                    </p>
                    <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded mb-2">
                      Maturity Amount = P × [((1 + r)^n - 1) / r]
                    </p>
                    <p className="text-muted-foreground">
                      Where: P = Monthly deposit, r = Monthly interest rate, n = Number of months
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>RD interest rates are generally lower than FD rates for same tenure</li>
                      <li>Interest is compounded quarterly in most banks</li>
                      <li>Premature withdrawal allowed with penalty (usually 0.5-1% reduction in interest)</li>
                      <li>RD interest is fully taxable as per your income tax slab</li>
                      <li>TDS applicable if interest exceeds ₹40,000 per year</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The RD calculator helps you estimate the maturity amount of your recurring deposit. Enter monthly deposit, interest rate, and tenure to see projected returns and total interest earned.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Monthly RD Investment</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invest ₹10,000/month for 5 years at 6.5% interest<br />
                          <strong>Total Invested:</strong> ₹10,000 × 60 months = ₹6,00,000<br />
                          <strong>Maturity Amount:</strong> ₹7,04,518<br />
                          <strong>Interest Earned:</strong> ₹1,04,518 (17.4% return on investment)<br />
                          <strong>Monthly Benefit:</strong> Earns ₹1,741 interest per month on average<br />
                          <strong>Use Case:</strong> Perfect for building savings goal systematically<br />
                          <strong>Benefit:</strong> Disciplined monthly savings with guaranteed returns
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Short-Term vs Long-Term</p>
                        <p className="text-sm">
                          <strong>Short-Term (1 Year):</strong> ₹5,000/month, 6% → ₹61,650 (₹1,650 interest)<br />
                          <strong>Long-Term (5 Years):</strong> ₹5,000/month, 6.5% → ₹3,52,259 (₹52,259 interest)<br />
                          <strong>Comparison:</strong> Long-term gives 31.6x more interest than short-term<br />
                          <strong>Reason:</strong> More compounding periods and higher total investment<br />
                          <strong>Strategy:</strong> Choose longer tenure if you can lock funds<br />
                          <strong>Tip:</strong> Even small monthly amounts grow significantly over 5+ years
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Building Savings Goal</p>
                        <p className="text-sm">
                          <strong>Goal:</strong> Need ₹5,00,000 in 3 years for car down payment<br />
                          <strong>Required Monthly:</strong> ₹12,000/month at 6.5% for 3 years → ₹4,74,327<br />
                          <strong>To Reach Goal:</strong> Need ₹13,000/month → ₹5,13,855<br />
                          <strong>Alternative:</strong> ₹10,000/month for 4 years → ₹5,32,148<br />
                          <strong>Strategy:</strong> Adjust monthly amount or tenure to reach target<br />
                          <strong>Planning:</strong> RD helps achieve specific goals through disciplined saving
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: RD vs FD Comparison</p>
                        <p className="text-sm">
                          <strong>RD:</strong> ₹20,000/month for 1 year (₹2,40,000 total) at 6.5% → ₹2,49,180<br />
                          <strong>FD:</strong> ₹2,40,000 lump sum for 1 year at 7% → ₹2,56,800<br />
                          <strong>Difference:</strong> FD gives ₹7,620 more (₹2,40,000 earns more than gradual deposits)<br />
                          <strong>Trade-off:</strong> RD allows monthly payments; FD needs full amount upfront<br />
                          <strong>When RD Better:</strong> If you earn monthly and want systematic saving<br />
                          <strong>When FD Better:</strong> If you have lump sum available immediately
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Start with minimum ₹100/month - RD is perfect for building savings habit</li>
                      <li>Set RD auto-debit on salary credit date to ensure no missed payments</li>
                      <li>Choose longer tenure (5-10 years) if you can - better interest rates</li>
                      <li>RD interest rates are usually 0.5-1% lower than FD for same tenure</li>
                      <li>Premature withdrawal allowed with penalty (0.5-1% interest reduction)</li>
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

        <CalculatorInput
          label="Monthly deposit"
          value={monthlyDeposit}
          onChange={setMonthlyDeposit}
          min={100}
          max={100000}
          step={100}
          prefix="₹"
        />

        <CalculatorInput
          label="Interest Rate (p.a)"
          value={interestRate}
          onChange={setInterestRate}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
          placeholder="6.5"
        />

        <CalculatorInput
          label="Tenure"
          value={tenure}
          onChange={setTenure}
          min={1}
          max={30}
          step={1}
          suffix="Years"
        />
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">Maturity Amount</p>
          <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(result.maturityAmount)}</p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Total invested</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Interest earned</span>
            <span className="font-semibold text-primary">{formatCurrency(result.interest)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Maturity value</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.maturityAmount)}</span>
          </div>
        </div>

        <Button 
          className="w-full gap-2" 
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-4 h-4" />
          Save to History
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="rd"
        inputs={{ monthlyDeposit, interestRate, tenure }}
        results={result}
      />
    </div>
  );
};

export default RDCalculator;
