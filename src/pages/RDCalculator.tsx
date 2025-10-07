import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Repeat } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';

const RDCalculator = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenure, setTenure] = useState(12); // in months
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const calculateRD = () => {
    const P = monthlyDeposit;
    const n = tenure;
    const r = interestRate / 100 / 4; // Quarterly compounding

    // RD Formula: M = P * [(1 + r)^n - 1] / [1 - (1 + r)^(-1/3)]
    const maturityAmount = P * n + P * ((n * (n + 1)) / 2) * r;
    
    const invested = P * n;
    const interest = maturityAmount - invested;

    return {
      invested,
      interest: Math.round(interest),
      maturityAmount: Math.round(maturityAmount)
    };
  };

  const result = calculateRD();

  const handleReset = () => {
    setMonthlyDeposit(5000);
    setInterestRate(6.5);
    setTenure(12);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Repeat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">RD Calculator</h2>
              <p className="text-xs text-muted-foreground">Recurring Deposit calculator</p>
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
          label="Monthly deposit"
          value={monthlyDeposit}
          onChange={setMonthlyDeposit}
          min={100}
          max={100000}
          step={100}
          prefix="₹"
        />

        <CalculatorInput
          label="Interest Rate (p.a)"
          value={interestRate}
          onChange={setInterestRate}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
          placeholder="6.5"
        />

        <CalculatorInput
          label="Tenure"
          value={tenure}
          onChange={setTenure}
          min={6}
          max={120}
          step={3}
          suffix="Months"
        />
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">Maturity Amount</p>
          <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(result.maturityAmount)}</p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Total invested</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Interest earned</span>
            <span className="font-semibold text-primary">{formatCurrency(result.interest)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Maturity value</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.maturityAmount)}</span>
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
        calculationType="rd"
        inputs={{ monthlyDeposit, interestRate, tenure }}
        results={result}
      />
    </div>
  );
};

export default RDCalculator;
