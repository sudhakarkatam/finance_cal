import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Shield, Calculator } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';

const EmergencyFundCalculator = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [emergencyMonths, setEmergencyMonths] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [targetAmount, setTargetAmount] = useState(0); // 0 means use recommended
  const [savingsPeriod, setSavingsPeriod] = useState(12); // Months to reach target
  const [expectedReturn, setExpectedReturn] = useState(4); // Savings account interest
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

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