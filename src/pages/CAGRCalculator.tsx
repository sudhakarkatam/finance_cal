import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, TrendingUp } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';

const CAGRCalculator = () => {
  const [beginningValue, setBeginningValue] = useState(10000);
  const [endingValue, setEndingValue] = useState(15000);
  const [years, setYears] = useState(3);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const calculateCAGR = () => {
    const startValue = beginningValue;
    const endValue = endingValue;
    const timePeriod = years;

    // CAGR Formula: (Ending Value / Beginning Value)^(1 / Number of Years) - 1
    let cagr = 0;

    if (startValue > 0 && endValue > 0 && timePeriod > 0) {
      cagr = (Math.pow(endValue / startValue, 1 / timePeriod) - 1) * 100;
    }

    const totalGrowth = endValue - startValue;
    const absoluteReturn = ((endValue - startValue) / startValue) * 100;

    return {
      cagr: cagr,
      totalGrowth: Math.round(totalGrowth),
      absoluteReturn: Math.round(absoluteReturn * 100) / 100,
      beginningValue: startValue,
      endingValue: endValue,
      years: timePeriod
    };
  };

  const result = calculateCAGR();

  const handleReset = () => {
    setBeginningValue(10000);
    setEndingValue(15000);
    setYears(3);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">CAGR Calculator</h2>
              <p className="text-xs text-muted-foreground">Compound Annual Growth Rate</p>
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
              label="Beginning Value"
              value={beginningValue}
              onChange={setBeginningValue}
              min={1}
              max={10000000}
              step={100}
              prefix="₹"
              placeholder="10000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Initial investment or starting amount
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Ending Value"
              value={endingValue}
              onChange={setEndingValue}
              min={1}
              max={100000000}
              step={100}
              prefix="₹"
              placeholder="15000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Final value or current amount
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={50}
              step={0.5}
              suffix="Years"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Investment period in years
            </p>
          </div>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
        >
          <TrendingUp className="w-5 h-5" />
          Calculate CAGR
        </Button>
      </Card>

      <Card className="p-6 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">CAGR Analysis</h3>

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-xl">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Compound Annual Growth Rate (CAGR)</p>
            <p className="text-3xl font-bold text-primary">{result.cagr > 0 ? `${result.cagr.toFixed(2)}%` : 'Invalid Input'}</p>
            <p className="text-xs text-muted-foreground mt-1">Annual growth rate</p>
          </div>
        </div>

        <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Beginning Value</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.beginningValue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Ending Value</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.endingValue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Time Period</span>
            <span className="font-semibold text-foreground">{result.years} years</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Growth</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.totalGrowth)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Absolute Return</span>
            <span className="font-semibold text-foreground">{result.absoluteReturn}%</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>CAGR Formula:</strong> (Ending Value / Beginning Value)<sup>1/Time Period</sup> - 1
            <br /><br />
            CAGR represents the annual growth rate that would take you from the beginning value to the ending value over the specified time period, assuming compound growth.
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
        inputs={{ beginningValue, endingValue, years }}
        results={{
          cagr: Math.round(result.cagr * 100) / 100,
          totalGrowth: result.totalGrowth,
          absoluteReturn: result.absoluteReturn,
          beginningValue: result.beginningValue,
          endingValue: result.endingValue,
          years: result.years
        }}
      />
    </div>
  );
};

export default CAGRCalculator;