import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Landmark, Info } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


const PPFCalculator = () => {
  // PPF is an Indian specific scheme, so we enforce INR
  const symbol = "₹";
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const [yearlyInvestment, setYearlyInvestment] = useState(150000);
  const [years, setYears] = useState(15);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // PPF interest rate (fixed by government, using current rate)
  const ppfRate = 7.1;

  const calculatePPF = () => {
    let maturityAmount = 0;
    const rate = ppfRate / 100;

    for (let year = 1; year <= years; year++) {
      maturityAmount = (maturityAmount + yearlyInvestment) * (1 + rate);
    }

    const invested = yearlyInvestment * years;
    const returns = maturityAmount - invested;

    return {
      invested,
      returns: Math.round(returns),
      total: Math.round(maturityAmount),
      interestRate: ppfRate
    };
  };

  const result = calculatePPF();

  const handleReset = () => {
    setYearlyInvestment(150000);
    setYears(15);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Landmark className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">PPF Calculator</h2>
              <p className="text-xs text-muted-foreground">Public Provident Fund returns</p>
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
                  <DialogTitle>About PPF & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is PPF?</h3>
                    <p className="text-muted-foreground">
                      Public Provident Fund (PPF) is a long-term savings scheme offered by the Government of India with tax benefits. PPF helps you build a retirement corpus through disciplined savings and compounding returns. It is one of the most popular tax-saving investment options in India.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Tax Benefits:</strong> Investments eligible under Section 80C (up to ₹1,50,000 per year)</li>
                      <li><strong>Tax-Free Returns:</strong> Interest earned is completely tax-free</li>
                      <li><strong>Tax-Free Maturity:</strong> Maturity proceeds are completely tax-free</li>
                      <li><strong>Lock-in Period:</strong> 15 years minimum (can be extended in blocks of 5 years)</li>
                      <li><strong>Safety:</strong> Backed by the Government of India, virtually risk-free</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Investment Limits</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Minimum Investment:</strong> ₹500 per year</li>
                      <li><strong>Maximum Investment:</strong> ₹1,50,000 per year</li>
                      <li>Can deposit in lump sum or in installments (maximum 12 per year)</li>
                      <li>Can invest anytime during the financial year</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Current Interest Rate</h3>
                    <p className="text-muted-foreground">
                      <strong>7.1% p.a. (Q4 FY 2024-25)</strong>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      PPF interest rate is reviewed and revised quarterly by the Government. Interest is compounded annually and credited at the end of each financial year.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Withdrawal Rules</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Partial Withdrawal:</strong> Allowed from 7th year onwards (up to 50% of balance)</li>
                      <li><strong>Loan Facility:</strong> Available from 3rd to 6th year (up to 25% of balance)</li>
                      <li><strong>Maturity:</strong> After 15 years, full withdrawal or extension in blocks of 5 years</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Only one PPF account can be opened per individual</li>
                      <li>Account can be opened for minors (parents/guardians can operate)</li>
                      <li>Nomination facility available</li>
                      <li>PPF account can be transferred from one bank/post office to another</li>
                      <li>No premature closure allowed except in specific circumstances (death, life-threatening disease)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The PPF calculator helps you estimate the maturity amount of your Public Provident Fund investment. Enter yearly investment and investment period to see projected returns and total interest earned over the investment tenure.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Maximum Investment (15 Years)</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invest ₹1,50,000/year (maximum) for 15 years at 7.1% interest<br />
                          <strong>Total Invested:</strong> ₹22,50,000<br />
                          <strong>Maturity Amount:</strong> ₹40,68,209<br />
                          <strong>Interest Earned:</strong> ₹18,18,209 (80.8% return)<br />
                          <strong>Tax Benefit:</strong> ₹6,75,000 saved (₹22.5L × 30% tax) over 15 years<br />
                          <strong>Net Cost:</strong> ₹15,75,000 after tax savings, got ₹40,68,209<br />
                          <strong>Value:</strong> ₹25,93,209 net benefit (164% return on net investment)
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Tax Benefits Calculation</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹1,00,000/year PPF, 30% tax bracket, 15 years<br />
                          <strong>Investment:</strong> ₹15,00,000 total<br />
                          <strong>Tax Saved:</strong> ₹1,00,000 × 15 years × 30% = ₹4,50,000<br />
                          <strong>Maturity:</strong> ₹27,12,284<br />
                          <strong>Interest:</strong> ₹12,12,284 (tax-free)<br />
                          <strong>Total Benefit:</strong> ₹4,50,000 tax saved + ₹12,12,284 interest = ₹16,62,284<br />
                          <strong>Triple Benefit:</strong> Investment deduction + Tax-free interest + Tax-free maturity
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Partial Withdrawal Scenario</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> After 7 years, account balance = ₹12,00,000, need ₹5,00,000<br />
                          <strong>Eligibility:</strong> Allowed from 7th year onwards<br />
                          <strong>Maximum Withdrawal:</strong> 50% of balance = ₹6,00,000<br />
                          <strong>Can Withdraw:</strong> ₹5,00,000 (within 50% limit)<br />
                          <strong>Remaining:</strong> ₹7,00,000 continues to grow for 8 more years<br />
                          <strong>Maturity:</strong> ₹7,00,000 grows to ₹12,50,000 (approx) at maturity<br />
                          <strong>Benefit:</strong> Funds available for emergency while keeping account active
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Extension After 15 Years</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> PPF matures after 15 years with ₹40,00,000 balance<br />
                          <strong>Option 1:</strong> Withdraw full amount (tax-free)<br />
                          <strong>Option 2:</strong> Extend in blocks of 5 years<br />
                          <strong>Extension Benefit:</strong> ₹40L continues earning 7.1% for 5 more years → ₹56,40,000<br />
                          <strong>Extra Gains:</strong> ₹16,40,000 more with extension<br />
                          <strong>Strategy:</strong> Extend if you don't need money immediately<br />
                          <strong>Flexibility:</strong> Can withdraw any amount during extension period
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Retirement Planning</p>
                        <p className="text-sm">
                          <strong>Kavita's Journey:</strong> Started PPF at age 30, invested ₹1,50,000/year for 15 years<br />
                          <strong>Age 45:</strong> PPF matured with ₹40,68,209, extended for 5 years<br />
                          <strong>Age 50:</strong> Extended PPF = ₹57,38,335<br />
                          <strong>Tax Savings:</strong> ₹6,75,000 saved over 15 years<br />
                          <strong>Total Value:</strong> ₹57,38,335 + ₹6,75,000 tax benefit = ₹64,13,335<br />
                          <strong>Net Investment:</strong> ₹22,50,000 (after tax savings: ₹15,75,000)<br />
                          <strong>Success:</strong> Built secure retirement corpus with disciplined PPF investment
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Invest maximum ₹1,50,000/year to maximize tax benefits and corpus growth</li>
                      <li>Make investment before 5th April to earn interest for entire financial year</li>
                      <li>Can make multiple deposits (max 12/year) - spread throughout the year</li>
                      <li>Extend PPF after 15 years if you don't need funds - continues tax-free growth</li>
                      <li>Partial withdrawal available from 7th year (50% of balance) for emergencies</li>
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

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Current PPF Interest Rate: <span className="font-bold">{ppfRate}% p.a.</span>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Minimum: ₹500/year | Maximum: ₹1,50,000/year
          </p>
        </div>

        <CalculatorInput
          label="Yearly investment"
          value={yearlyInvestment}
          onChange={setYearlyInvestment}
          min={500}
          max={150000}
          step={500}
          prefix={symbol}
        />

        <CalculatorInput
          label="Investment period"
          value={years}
          onChange={setYears}
          min={15}
          max={50}
          step={1}
          suffix="Years"
        />

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            • 15 years minimum lock-in period<br />
            • Extendable in blocks of 5 years<br />
            • Tax-free returns under Section 80C
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>

        <ResultChart
          principal={result.invested}
          returns={result.returns}
          principalLabel="Invested"
          returnsLabel="Interest"
        />

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Total invested</span>
            <span className="font-semibold text-foreground">{formatAmount(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Interest earned</span>
            <span className="font-semibold text-primary">{formatAmount(result.returns)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Maturity value</span>
            <span className="text-xl font-bold text-primary">{formatAmount(result.total)}</span>
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
        calculationType="ppf"
        inputs={{ yearlyInvestment, years, interestRate: ppfRate }}
        results={result}
      />
    </div>
  );
};

export default PPFCalculator;
