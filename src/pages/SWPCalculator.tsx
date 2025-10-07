import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { calculateSWP, formatCurrency } from '@/lib/calculations';

const SWPCalculator = () => {
  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [withdrawalPerMonth, setWithdrawalPerMonth] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const result = calculateSWP(investmentAmount, withdrawalPerMonth, expectedReturn, years);

  const handleReset = () => {
    setInvestmentAmount(500000);
    setWithdrawalPerMonth(5000);
    setExpectedReturn(12);
    setYears(10);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">SWP Calculator</h2>
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
          Systematic Withdrawal Plan - Calculate how long your investment will last with regular withdrawals
        </p>
        
        <CalculatorInput
          label="Total investment"
          value={investmentAmount}
          onChange={setInvestmentAmount}
          min={100000}
          max={10000000}
          step={10000}
          prefix="₹"
        />

        <CalculatorInput
          label="Withdrawal per month"
          value={withdrawalPerMonth}
          onChange={setWithdrawalPerMonth}
          min={1000}
          max={100000}
          step={1000}
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
          suffix="Yr"
        />
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>
        
        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Initial investment</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total withdrawn</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.totalWithdrawn)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Final balance</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.finalBalance)}</span>
          </div>
        </div>

        {result.finalBalance <= 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: Your investment will be exhausted before the end of the period. Consider reducing monthly withdrawals.
            </p>
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
        calculationType="swp"
        inputs={{ investmentAmount, withdrawalPerMonth, expectedReturn, years }}
        results={result}
      />
    </div>
  );
};

export default SWPCalculator;
