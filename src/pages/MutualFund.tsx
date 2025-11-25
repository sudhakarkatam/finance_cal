import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Calculator, TrendingUp } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import ResultChart from "@/components/ui/ResultChart";
import SaveDialog from "@/components/SaveDialog";
import {
  calculateMutualFund,
  calculateStepUpMutualFund,
  calculateInflationAdjustedSIP,
  calculateStepUpSIPWithComparison,
} from "@/lib/calculations";
import { useCurrency } from "@/hooks/useCurrency";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const MutualFund = () => {
  const { formatAmount, symbol } = useCurrency();
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
      return calculateStepUpMutualFund(
        monthlyInvestment,
        expectedReturn,
        totalYears,
        stepUpPercentage,
      );
    }

    // Fallback to regular mutual fund calculation
    return calculateMutualFund(monthlyInvestment, expectedReturn, totalYears);
  };

  const totalYears = years + months / 12;

  const normalResult = useMemo(() => {
    return stepUpEnabled
      ? calculateAdvancedSIP()
      : calculateMutualFund(monthlyInvestment, expectedReturn, totalYears);
  }, [
    monthlyInvestment,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
  ]);

  const result = useMemo(() => {
    if (!inflationEnabled) return normalResult;

    // Calculate inflation-adjusted result using inflation-adjusted return rate
    const inflationAdjustedResult = calculateInflationAdjustedSIP(
      monthlyInvestment,
      expectedReturn,
      totalYears,
      inflationRate,
      stepUpEnabled ? stepUpPercentage : 0,
    );

    // Return result with both normal and inflation-adjusted values
    return {
      ...inflationAdjustedResult,
      normalTotal: normalResult.total,
      inflationAdjustedTotal: inflationAdjustedResult.total,
      inflationRate: inflationRate,
    };
  }, [
    normalResult,
    inflationEnabled,
    inflationRate,
    monthlyInvestment,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
  ]);

  const comparisonResult = useMemo(() => {
    if (stepUpEnabled && stepUpPercentage > 0) {
      return calculateStepUpSIPWithComparison(
        monthlyInvestment,
        expectedReturn,
        totalYears,
        stepUpPercentage,
      );
    }
    return null;
  }, [
    monthlyInvestment,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
  ]);

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
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Mutual Fund Calculator
            </h2>
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
          max={10000000}
          step={500}
          prefix={symbol}
        />

        <CalculatorInput
          label="Expected return rate (p.a)"
          value={expectedReturn}
          onChange={setExpectedReturn}
          min={0}
          max={100}
          step={0.1}
          suffix="%"
        />

        <div className="bg-card p-4 rounded-lg border">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">
              Investment Period
            </label>
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
            Total period:{" "}
            <span className="font-semibold text-foreground">
              {totalYears.toFixed(1)} years
            </span>
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
              max={50}
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
        <h3 className="text-lg font-semibold text-foreground">
          Investment Analysis
        </h3>

        <ResultChart
          principal={result.invested}
          returns={result.returns}
          principalLabel="Invested amount"
          returnsLabel={
            inflationEnabled ? "Inflation-Adjusted Returns" : "Est. returns"
          }
        />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-xs text-muted-foreground mb-1">
                Total Invested
              </p>
              <p className="text-base font-bold text-foreground">
                {formatAmount(result.invested)}
              </p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Returns</p>
              <p className="text-base font-bold text-primary">
                {formatAmount(result.returns)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-primary-foreground/80 mb-1">
                {inflationEnabled ? "Inflation-Adjusted Value" : "Total Value"}
              </p>
              <p className="text-2xl font-bold text-primary-foreground">
                {formatAmount(result.total)}
              </p>
            </div>

            {inflationEnabled && "normalTotal" in result && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-center shadow-md">
                <p className="text-xs text-green-100 mb-1">
                  Normal Value (without inflation)
                </p>
                <p className="text-xl font-bold text-green-50">
                  {formatAmount(result.normalTotal)}
                </p>
              </div>
            )}
          </div>

          {/* Step-Up vs No Step-Up Comparison */}
          {stepUpEnabled && comparisonResult && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 text-center">
                📈 Step-Up SIP Benefit Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/70 p-3 rounded-lg text-center border border-blue-100">
                  <p className="text-xs text-blue-600 mb-1">Without Step-Up</p>
                  <p className="text-lg font-bold text-blue-800">
                    {formatAmount(comparisonResult.withoutStepUp.total)}
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg text-center border border-blue-100">
                  <p className="text-xs text-green-600 mb-1">With Step-Up</p>
                  <p className="text-lg font-bold text-green-800">
                    {formatAmount(comparisonResult.withStepUp.total)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg text-center border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Benefit</p>
                  <p className="text-lg font-bold text-green-800">
                    +{comparisonResult.percentageDifference}%
                  </p>
                  <p className="text-sm font-semibold text-green-700">
                    {formatAmount(comparisonResult.difference)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Features Summary */}
        {(stepUpEnabled || inflationEnabled) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">
              📊 Advanced Features Applied
            </h4>
            <div className="space-y-2">
              {stepUpEnabled && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Step-Up SIP</span>
                  <span className="font-semibold text-blue-800">
                    {stepUpPercentage}% annual increase
                  </span>
                </div>
              )}
              {inflationEnabled && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">
                    Inflation Adjustment
                  </span>
                  <span className="font-semibold text-blue-800">
                    {inflationRate}% per year
                  </span>
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
        inputs={{
          monthlyInvestment,
          expectedReturn,
          years,
          months,
          stepUpEnabled: stepUpEnabled ? 1 : 0,
          stepUpPercentage,
          inflationEnabled: inflationEnabled ? 1 : 0,
          inflationRate,
        }}
        results={{
          ...result,
          normalTotal: normalResult.total,
          inflationAdjustedTotal: result.total,
          inflationRate: inflationEnabled ? inflationRate : 0,
        }}
      />
    </div>
  );
};

export default MutualFund;
