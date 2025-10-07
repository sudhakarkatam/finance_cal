import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Coins } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';

const LumpsumCalculator = () => {
  const [investment, setInvestment] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const calculateLumpsum = () => {
    const rate = expectedReturn / 100;
    const futureValue = investment * Math.pow(1 + rate, years);
    const returns = futureValue - investment;

    return {
      invested: investment,
      returns: Math.round(returns),
      total: Math.round(futureValue)
    };
  };

  const result = calculateLumpsum();

  const handleReset = () => {
    setInvestment(100000);
    setExpectedReturn(12);
    setYears(10);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Lumpsum Calculator</h2>
              <p className="text-xs text-muted-foreground">One-time investment returns</p>
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

        <CalculatorInput
          label="Investment amount"
          value={investment}
          onChange={setInvestment}
          min={1000}
          max={10000000}
          step={1000}
          prefix="₹"
        />

        <CalculatorInput
          label="Expected return (p.a)"
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
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>
        
        <ResultChart
          principal={result.invested}
          returns={result.returns}
          principalLabel="Invested"
          returnsLabel="Returns"
        />

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Invested amount</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Expected returns</span>
            <span className="font-semibold text-primary">{formatCurrency(result.returns)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total value</span>
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
        calculationType="lumpsum"
        inputs={{ investment, expectedReturn, years }}
        results={result}
      />
    </div>
  );
};

export default LumpsumCalculator;
