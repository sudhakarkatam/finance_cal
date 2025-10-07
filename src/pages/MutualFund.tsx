import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Calculator, TrendingUp } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import { calculateMutualFund, formatCurrency } from '@/lib/calculations';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const MutualFund = () => {
  // Basic SIP inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);

  // Advanced features
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  const calculateAdvancedSIP = () => {
    const months = years * 12;
    const monthlyRate = expectedReturn / (12 * 100);

    let totalInvested = 0;
    let futureValue = 0;
    let currentMonthlyInvest = monthlyInvestment;

    for (let month = 1; month <= months; month++) {
      // Add current month's investment to total invested
      totalInvested += currentMonthlyInvest;

      // Calculate future value of this month's investment
      const monthsRemaining = months - month;
      const monthFutureValue = currentMonthlyInvest * Math.pow(1 + monthlyRate, monthsRemaining);
      futureValue += monthFutureValue;

      // Apply step-up at the beginning of each year (after 12th month)
      if (stepUpEnabled && month % 12 === 0 && month < months) {
        currentMonthlyInvest *= (1 + stepUpPercentage / 100);
      }
    }

    const totalReturns = futureValue - totalInvested;

    return {
      invested: Math.round(totalInvested),
      returns: Math.round(totalReturns),
      total: Math.round(futureValue)
    };
  };

  const result = useMemo(() => {
    return stepUpEnabled || inflationEnabled ? calculateAdvancedSIP() : calculateMutualFund(monthlyInvestment, expectedReturn, years);
  }, [monthlyInvestment, expectedReturn, years, stepUpEnabled, stepUpPercentage, inflationEnabled]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setMonthlyInvestment(25000);
    setExpectedReturn(12);
    setYears(10);
    setStepUpEnabled(false);
    setStepUpPercentage(10);
    setInflationEnabled(false);
    setInflationRate(6);
    setIsCalculated(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Mutual Fund Calculator</h2>
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
          label="Monthly investment"
          value={monthlyInvestment}
          onChange={setMonthlyInvestment}
          min={0}
          max={100000}
          step={500}
          prefix="₹"
        />

        <CalculatorInput
          label="Expected return rate (p.a)"
          value={expectedReturn}
          onChange={setExpectedReturn}
          min={1}
          max={30}
          step={0.1}
          suffix="%"
        />

        <CalculatorInput
          label="Time period"
          value={years}
          onChange={setYears}
          min={1}
          max={40}
          step={1}
          suffix="Years"
        />

        {/* Step-Up SIP */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="step-up" className="text-sm font-medium">
              Step-Up SIP
            </Label>
            <Switch
              id="step-up"
              checked={stepUpEnabled}
              onCheckedChange={setStepUpEnabled}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Increase your SIP amount automatically every year
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

        {/* Inflation Adjustment */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="inflation" className="text-sm font-medium">
              Inflation Adjustment
            </Label>
            <Switch
              id="inflation"
              checked={inflationEnabled}
              onCheckedChange={setInflationEnabled}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Account for inflation to see real returns (affects calculation)
          </p>
          {inflationEnabled && (
            <CalculatorInput
              label="Expected Inflation Rate (p.a)"
              value={inflationRate}
              onChange={setInflationRate}
              min={1}
              max={15}
              step={0.1}
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
          Calculate Investment
        </Button>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Investment Analysis</h3>

        <ResultChart
          principal={result.invested}
          returns={result.returns}
          principalLabel="Invested amount"
          returnsLabel="Est. returns"
        />

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Invested amount</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Est. returns</span>
            <span className="font-semibold text-primary">{formatCurrency(result.returns)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total value</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.total)}</span>
          </div>
        </div>

        {/* Advanced Features Summary */}
        {(stepUpEnabled || inflationEnabled) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Advanced Features Applied</h4>
            <div className="space-y-2">
              {stepUpEnabled && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Step-Up SIP</span>
                  <span className="font-semibold text-blue-800">{stepUpPercentage}% annual increase</span>
                </div>
              )}
              {inflationEnabled && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Inflation Adjustment</span>
                  <span className="font-semibold text-blue-800">{inflationRate}% per year</span>
                </div>
              )}
            </div>
          </div>
        )}

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
        calculationType="mutualfund"
        inputs={{ monthlyInvestment, expectedReturn, years }}
        results={result}
      />
    </div>
  );
};

export default MutualFund;
