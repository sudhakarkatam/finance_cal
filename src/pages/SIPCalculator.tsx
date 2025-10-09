import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, TrendingUp, Calculator, TrendingUp as TrendingUpIcon } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import { calculateSIP, calculateStepUpSIP, calculateInflationAdjustedSIP, formatCurrency } from '@/lib/calculations';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SIPCalculator = () => {
  // Basic SIP inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [months, setMonths] = useState(0);

  // Advanced features
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  const calculateAdvancedSIP = () => {
    if (stepUpEnabled && stepUpPercentage > 0) {
      return calculateStepUpSIP(monthlyInvestment, expectedReturn, totalYears, stepUpPercentage);
    }

    // Fallback to regular SIP calculation
    return calculateSIP(monthlyInvestment, expectedReturn, totalYears);
  };

  const totalYears = years + (months / 12);

  const normalResult = useMemo(() => {
    return stepUpEnabled ? calculateAdvancedSIP() : calculateSIP(monthlyInvestment, expectedReturn, totalYears);
  }, [monthlyInvestment, expectedReturn, totalYears, stepUpEnabled, stepUpPercentage]);

  const stepUpResult = useMemo(() => {
    return calculateStepUpSIP(monthlyInvestment, expectedReturn, totalYears, stepUpPercentage);
  }, [monthlyInvestment, expectedReturn, totalYears, stepUpPercentage]);

  const result = useMemo(() => {
    if (!inflationEnabled) return normalResult;

    // Calculate inflation-adjusted result using inflation-adjusted return rate
    const inflationAdjustedResult = calculateInflationAdjustedSIP(
      monthlyInvestment,
      expectedReturn,
      totalYears,
      inflationRate,
      stepUpEnabled ? stepUpPercentage : 0
    );

    // Return result with both normal and inflation-adjusted values
    return {
      ...inflationAdjustedResult,
      normalTotal: normalResult.total,
      inflationAdjustedTotal: inflationAdjustedResult.total,
      inflationRate: inflationRate
    };
  }, [normalResult, inflationEnabled, inflationRate, monthlyInvestment, expectedReturn, totalYears, stepUpEnabled, stepUpPercentage]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setMonthlyInvestment(100000);
    setExpectedReturn(12);
    setYears(10);
    setMonths(0);
    setStepUpEnabled(false);
    setStepUpPercentage(10);
    setInflationEnabled(false);
    setInflationRate(6);
    setIsCalculated(false);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
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
              label="Monthly Investment"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={0}
              max={100000}
              step={500}
              prefix="₹"
              placeholder="100000"
            />
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Expected Return (p.a)"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={1}
              max={30}
              step={0.1}
              suffix="%"
            />
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">Investment Period</label>
            </div>
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
              Total period: <span className="font-semibold text-foreground">{totalYears.toFixed(1)} years</span>
            </div>
          </div>

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
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
          onClick={handleCalculate}
        >
          <Calculator className="w-5 h-5" />
          Calculate SIP
        </Button>
      </Card>

      <Card className="p-6 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Investment Analysis</h3>

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-xl">
          <ResultChart
            principal={result.invested}
            returns={result.returns}
            principalLabel="Invested"
            returnsLabel={inflationEnabled ? "Inflation-Adjusted Returns" : "Returns"}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(result.invested)}</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Returns</p>
              <p className="text-base font-bold text-primary">{formatCurrency(result.returns)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-primary-foreground/80 mb-1">
                {inflationEnabled ? 'Inflation-Adjusted Maturity Value' : 'Maturity Value'}
              </p>
              <p className="text-2xl font-bold text-primary-foreground">{formatCurrency(result.total)}</p>
            </div>

            {inflationEnabled && 'normalTotal' in result && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-center shadow-md">
                <p className="text-xs text-green-100 mb-1">Normal Maturity Value (without inflation)</p>
                <p className="text-xl font-bold text-green-50">{formatCurrency(result.normalTotal)}</p>
              </div>
            )}
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
        calculationType="sip"
        inputs={{ monthlyInvestment, expectedReturn, years, months, stepUpEnabled: stepUpEnabled ? 1 : 0, stepUpPercentage, inflationEnabled: inflationEnabled ? 1 : 0, inflationRate }}
        results={{
          ...result,
          normalTotal: normalResult.total,
          inflationAdjustedTotal: result.total,
          inflationRate: inflationEnabled ? inflationRate : 0
        }}
      />
    </div>
  );
};

export default SIPCalculator;
