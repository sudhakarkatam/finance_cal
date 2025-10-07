import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Landmark } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';

const PPFCalculator = () => {
  const [yearlyInvestment, setYearlyInvestment] = useState(150000);
  const [years, setYears] = useState(15);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

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
          prefix="₹"
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
            • 15 years minimum lock-in period<br/>
            • Extendable in blocks of 5 years<br/>
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
            <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Interest earned</span>
            <span className="font-semibold text-primary">{formatCurrency(result.returns)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Maturity value</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.total)}</span>
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
