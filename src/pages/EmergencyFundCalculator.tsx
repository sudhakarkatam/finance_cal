import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Shield, Calculator, Info } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const EmergencyFundCalculator = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [emergencyMonths, setEmergencyMonths] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [targetAmount, setTargetAmount] = useState(0); // 0 means use recommended
  const [savingsPeriod, setSavingsPeriod] = useState(12); // Months to reach target
  const [expectedReturn, setExpectedReturn] = useState(4); // Savings account interest
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const result = useMemo(() => {
    const expenses = monthlyExpenses;
    const months = emergencyMonths;
    const current = currentSavings;
    const target = targetAmount || (expenses * months); // Use recommended if target is 0
    const period = savingsPeriod;
    const returnRate = expectedReturn / 100;

    // Calculate recommended emergency fund amount
    const recommendedAmount = expenses * months;

    // Current safety in months
    const currentSafetyMonths = current > 0 ? Math.floor(current / expenses) : 0;

    // Amount needed to reach target
    const amountNeeded = Math.max(0, target - current);

    // Monthly savings required with interest consideration
    let monthlySavingsRequired = 0;
    if (amountNeeded > 0 && period > 0) {
      if (returnRate > 0) {
        // Future value of monthly savings with compound interest
        const monthlyRate = returnRate / 12;
        const futureValueFactor = (Math.pow(1 + monthlyRate, period) - 1) / monthlyRate;
        monthlySavingsRequired = amountNeeded / futureValueFactor;
      } else {
        // Simple division if no interest
        monthlySavingsRequired = amountNeeded / period;
      }
    }

    // Shortfall from recommended amount
    const shortfall = Math.max(0, recommendedAmount - current);

    return {
      monthlyExpenses: expenses,
      emergencyMonths: months,
      recommendedAmount: Math.round(recommendedAmount),
      currentSavings: current,
      targetAmount: target,
      amountNeeded: Math.round(amountNeeded),
      monthlySavingsRequired: Math.round(monthlySavingsRequired),
      shortfall: Math.round(shortfall),
      currentSafetyMonths: currentSafetyMonths,
      savingsPeriod: period
    };
  }, [monthlyExpenses, emergencyMonths, currentSavings, targetAmount, savingsPeriod, expectedReturn]);

  const handleReset = () => {
    setMonthlyExpenses(50000);
    setEmergencyMonths(6);
    setCurrentSavings(100000);
    setTargetAmount(0);
    setSavingsPeriod(12);
    setExpectedReturn(4);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Emergency Fund Calculator</h2>
              <p className="text-xs text-muted-foreground">Plan your financial safety net</p>
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
                  <DialogTitle>About Emergency Fund & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Emergency Fund?</h3>
                    <p className="text-muted-foreground">
                      Emergency fund is a financial safety net designed to cover unexpected expenses or financial emergencies such as job loss, medical emergencies, major repairs, or other unforeseen circumstances. It provides financial security and peace of mind.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">How Much Should You Save?</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Minimum:</strong> 3-6 months of expenses for basic coverage</li>
                      <li><strong>Recommended:</strong> 6-12 months of expenses for better security</li>
                      <li><strong>Conservative:</strong> 12-24 months for maximum protection</li>
                      <li>Adjust based on job stability, dependents, and financial obligations</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Where to Keep Emergency Fund?</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Savings Account:</strong> Easy access, liquidity, low returns</li>
                      <li><strong>Fixed Deposits:</strong> Higher returns, partial liquidity</li>
                      <li><strong>Liquid Funds:</strong> Better returns, good liquidity</li>
                      <li>Avoid investing in volatile assets (stocks, equity funds)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The Emergency Fund calculator helps you determine how much you need to save for your emergency fund, how much you need to save monthly to reach your target, and tracks your progress toward building financial security.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Basic Emergency Fund</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Monthly expenses = ₹50,000, Target = 6 months<br />
                          <strong>Calculation:</strong> ₹50,000 × 6 = ₹3,00,000<br />
                          <strong>Result:</strong> You need ₹3,00,000 to cover 6 months of expenses<br />
                          <strong>Monthly Savings:</strong> If saving over 12 months, you need to save ₹25,000/month
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: With Current Savings</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Monthly expenses = ₹50,000, Target = 6 months (₹3,00,000), Current savings = ₹1,00,000<br />
                          <strong>Calculation:</strong> ₹3,00,000 - ₹1,00,000 = ₹2,00,000 needed<br />
                          <strong>Result:</strong> You need ₹2,00,000 more to reach your emergency fund goal<br />
                          <strong>Current Safety:</strong> Your current savings cover only 2 months of expenses
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Conservative Approach</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Monthly expenses = ₹80,000, Target = 12 months<br />
                          <strong>Calculation:</strong> ₹80,000 × 12 = ₹9,60,000<br />
                          <strong>Result:</strong> For maximum security, save ₹9,60,000 to cover a full year<br />
                          <strong>Why 12 months?</strong> Provides extended protection for job loss or major emergencies
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Gradual Building</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Monthly expenses = ₹60,000, Need ₹3,60,000 (6 months), Saving period = 18 months<br />
                          <strong>Calculation:</strong> ₹3,60,000 ÷ 18 = ₹20,000/month<br />
                          <strong>Result:</strong> Save ₹20,000 per month for 18 months to build your emergency fund<br />
                          <strong>Tip:</strong> Start with smaller amounts and increase gradually as your income grows
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Scenario</p>
                        <p className="text-sm">
                          <strong>Ravi's Story:</strong> Ravi had ₹1,50,000 in savings when he lost his job. His monthly expenses were ₹40,000.<br />
                          <strong>Problem:</strong> His savings covered only 3.75 months (₹1,50,000 ÷ ₹40,000)<br />
                          <strong>Lesson:</strong> He should have saved ₹2,40,000 (6 months) = ₹40,000 × 6<br />
                          <strong>Action:</strong> After finding a new job, Ravi now saves ₹15,000/month to build his emergency fund to ₹2,40,000
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">💡 Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Start small: Even ₹5,000/month can build a ₹3,00,000 fund in 5 years</li>
                      <li>Automate savings: Set up auto-debit to emergency fund account</li>
                      <li>Separate account: Keep emergency fund separate from regular savings</li>
                      <li>Review annually: Recalculate if your expenses or income changes</li>
                      <li>Don't touch it: Only use for true emergencies, not for wants or luxuries</li>
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

        <div className="space-y-6">
          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Monthly Expenses"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              min={1000}
              max={1000000}
              step={1000}
              prefix="₹"
              placeholder="50000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your average monthly living expenses
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Emergency Fund Duration"
              value={emergencyMonths}
              onChange={setEmergencyMonths}
              min={3}
              max={24}
              step={1}
              suffix="Months"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How many months of expenses to cover (3-24 months recommended)
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Current Emergency Savings"
              value={currentSavings}
              onChange={setCurrentSavings}
              min={0}
              max={10000000}
              step={1000}
              prefix="₹"
              placeholder="100000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Amount already saved for emergencies
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Target Emergency Fund (Optional)"
              value={targetAmount}
              onChange={setTargetAmount}
              min={0}
              max={monthlyExpenses * 24}
              step={1000}
              prefix="₹"
              placeholder="0 (uses recommended amount)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave 0 to use recommended amount, or set custom target
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Savings Period"
              value={savingsPeriod}
              onChange={setSavingsPeriod}
              min={1}
              max={60}
              step={1}
              suffix="Months"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Time period to reach your target (affects monthly savings required)
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Expected Return on Savings"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={0}
              max={15}
              step={0.1}
              suffix="%"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Interest rate on your emergency fund savings
            </p>
          </div>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
        >
          <Calculator className="w-5 h-5" />
          Calculate Emergency Fund
        </Button>
      </Card>

      <Card className="p-6 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Emergency Fund Analysis</h3>

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-xl">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Recommended Emergency Fund</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(result.recommendedAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">For {result.emergencyMonths} months of expenses</p>
          </div>
        </div>

        <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Monthly Expenses</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.monthlyExpenses)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Current Emergency Savings</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.currentSavings)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Current Safety Period</span>
            <span className="font-semibold text-foreground">{result.currentSafetyMonths} months</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Target Emergency Fund</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.targetAmount)}</span>
          </div>
          {result.shortfall > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Additional Amount Needed</span>
              <span className="font-semibold text-orange-600">{formatCurrency(result.shortfall)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Savings Period</span>
            <span className="font-semibold text-foreground">{result.savingsPeriod} months</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Monthly Savings Required</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.monthlySavingsRequired)}</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Emergency Fund Guidelines:</strong>
            <br /><br />
            • <strong>3-6 months</strong> of expenses for single income households
            <br />
            • <strong>6-12 months</strong> of expenses for variable income or unstable jobs
            <br />
            • Consider your job stability, family size, and financial obligations when choosing duration
          </p>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-5 h-5" />
          Save Calculation
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="fd"
        inputs={{ monthlyExpenses, emergencyMonths, currentSavings, targetAmount }}
        results={{
          recommendedAmount: result.recommendedAmount,
          shortfall: result.shortfall,
          monthlySavingsRequired: result.monthlySavingsRequired,
          monthlyExpenses: result.monthlyExpenses,
          currentSavings: result.currentSavings,
          targetAmount: result.targetAmount
        }}
      />
    </div>
  );
};

export default EmergencyFundCalculator;