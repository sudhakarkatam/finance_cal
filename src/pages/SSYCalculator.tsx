import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Calculator, PiggyBank, TrendingUp } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { calculateSSY, formatCurrency } from '@/lib/calculations';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SSYCalculator = () => {
  const [annualInvestment, setAnnualInvestment] = useState(150000);
  const [girlAge, setGirlAge] = useState(5);
  const [investmentStartYear, setInvestmentStartYear] = useState(new Date().getFullYear());
  const [interestRate, setInterestRate] = useState(8.2);
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const result = useMemo(() => {
    return calculateSSY(annualInvestment, girlAge, investmentStartYear, interestRate, inflationEnabled ? inflationRate : 0);
  }, [annualInvestment, girlAge, investmentStartYear, interestRate, inflationEnabled, inflationRate]);

  const handleReset = () => {
    setAnnualInvestment(150000);
    setGirlAge(5);
    setInvestmentStartYear(new Date().getFullYear());
    setInterestRate(8.2);
    setInflationEnabled(false);
    setInflationRate(6);
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">SSY Calculator</h2>
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

        <p className="text-sm text-muted-foreground">
          Calculate maturity amount for Sukanya Samriddhi Yojana - Government scheme for girl child education and marriage
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Annual Investment"
            value={annualInvestment}
            onChange={setAnnualInvestment}
            min={250}
            max={150000}
            step={250}
            prefix="₹"
          />

          <CalculatorInput
            label="Age of Girl Child"
            value={girlAge}
            onChange={setGirlAge}
            min={0}
            max={10}
            step={1}
            suffix="years"
          />

          <CalculatorInput
            label="Investment Starting Year"
            value={investmentStartYear}
            onChange={setInvestmentStartYear}
            min={2020}
            max={2030}
            step={1}
          />

          <CalculatorInput
            label="Interest Rate (p.a)"
            value={interestRate}
            onChange={setInterestRate}
            min={1}
            max={15}
            step={0.1}
            suffix="%"
          />
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
            Account for inflation to see real purchasing power at maturity
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
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">SSY Investment Analysis</h3>

        {/* Investment Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">📋 Investment Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <p className="text-blue-600 mb-1">Investment Period</p>
              <p className="font-bold text-blue-800">{result.investmentYears} years</p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 mb-1">Maturity Period</p>
              <p className="font-bold text-blue-800">{result.totalMaturityYears} years</p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 mb-1">Maturity Year</p>
              <p className="font-bold text-blue-800">{result.maturityYear}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 mb-1">Interest Rate</p>
              <p className="font-bold text-blue-800">{result.interestRate}%</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(result.totalInvested)}</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
              <p className="text-base font-bold text-primary">{formatCurrency(result.totalInterest)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-green-100 mb-1">
                {inflationEnabled ? 'Inflation-Adjusted Maturity Value' : 'Maturity Value'}
              </p>
              <p className="text-2xl font-bold text-green-50">{formatCurrency(inflationEnabled ? result.inflationAdjustedValue : result.maturityValue)}</p>
            </div>

            {inflationEnabled && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-center shadow-md">
                <p className="text-xs text-blue-100 mb-1">Nominal Maturity Value (without inflation)</p>
                <p className="text-xl font-bold text-blue-50">{formatCurrency(result.maturityValue)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Investment Schedule Info */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">📅 Investment Schedule</h4>
          <div className="space-y-2 text-sm text-amber-700">
            <div className="flex justify-between">
              <span>Annual Investment:</span>
              <span className="font-semibold">{formatCurrency(annualInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span>Investment Period:</span>
              <span className="font-semibold">{investmentStartYear} - {investmentStartYear + 15}</span>
            </div>
            <div className="flex justify-between">
              <span>Interest Accumulation:</span>
              <span className="font-semibold">{investmentStartYear + 15} - {result.maturityYear}</span>
            </div>
            <div className="flex justify-between">
              <span>Maturity Date:</span>
              <span className="font-semibold">{result.maturityYear} (Girl's age: {girlAge + 21})</span>
            </div>
          </div>
        </div>

        {/* Inflation Impact */}
        {inflationEnabled && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">💰 Inflation Impact Analysis</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-purple-600 mb-1">Nominal Value</p>
                <p className="text-lg font-bold text-purple-800">{formatCurrency(result.maturityValue)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-purple-600 mb-1">Real Value (Inflation-Adjusted)</p>
                <p className="text-lg font-bold text-purple-800">{formatCurrency(result.inflationAdjustedValue)}</p>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2 text-center">
              Inflation erodes purchasing power by {Math.round(((result.maturityValue - result.inflationAdjustedValue) / result.maturityValue) * 100)}% over {result.totalMaturityYears} years
            </p>
          </div>
        )}

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
        calculationType="ssy"
        inputs={{
          annualInvestment,
          girlAge,
          investmentStartYear,
          interestRate,
          inflationEnabled: inflationEnabled ? 1 : 0,
          inflationRate: inflationEnabled ? inflationRate : 0
        }}
        results={{
          totalInvested: result.totalInvested,
          totalInterest: result.totalInterest,
          maturityValue: result.maturityValue,
          inflationAdjustedValue: result.inflationAdjustedValue,
          maturityYear: result.maturityYear
        }}
      />
    </div>
  );
};

export default SSYCalculator;