import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, PiggyBank } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';

const FDCalculator = () => {
  const [depositAmount, setDepositAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7);
  const [tenure, setTenure] = useState(12); // in months
  const [frequency, setFrequency] = useState('4'); // Quarterly
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const calculateFD = () => {
    const principal = depositAmount;
    const rate = interestRate / 100;
    const time = tenure / 12; // Convert months to years
    const n = Number(frequency); // Compounding frequency

    // Compound interest formula: A = P(1 + r/n)^(nt)
    const maturityAmount = principal * Math.pow(1 + rate / n, n * time);
    const interest = maturityAmount - principal;

    // TDS calculation (if interest > 40,000 for individuals)
    const tds = interest > 40000 ? interest * 0.1 : 0;

    return {
      principal,
      interest: Math.round(interest),
      maturityAmount: Math.round(maturityAmount),
      tds: Math.round(tds),
      netReturn: Math.round(interest - tds)
    };
  };

  const result = calculateFD();

  const handleReset = () => {
    setDepositAmount(100000);
    setInterestRate(7);
    setTenure(12);
    setFrequency('4');
  };

  const frequencyOptions = [
    { value: '1', label: 'Yearly' },
    { value: '2', label: 'Half-Yearly' },
    { value: '4', label: 'Quarterly' },
    { value: '12', label: 'Monthly' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">FD Calculator</h2>
              <p className="text-xs text-muted-foreground">Fixed Deposit returns calculator</p>
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
          label="Deposit amount"
          value={depositAmount}
          onChange={setDepositAmount}
          min={1000}
          max={10000000}
          step={1000}
          prefix="₹"
        />

        <CalculatorInput
          label="Interest rate (p.a)"
          value={interestRate}
          onChange={setInterestRate}
          min={3}
          max={12}
          step={0.1}
          suffix="%"
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

        <div className="space-y-2">
          <Label>Interest compounding</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">Maturity Amount</p>
          <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(result.maturityAmount)}</p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Principal amount</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.principal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total interest</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.interest)}</span>
          </div>
          {result.tds > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">TDS (10%)</span>
              <span className="font-semibold text-destructive">-{formatCurrency(result.tds)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Net returns</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.netReturn)}</span>
          </div>
        </div>

        {result.tds > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              TDS is deducted if interest exceeds ₹40,000 per year
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
        calculationType="fd"
        inputs={{ depositAmount, interestRate, tenure, frequency: Number(frequency) }}
        results={result}
      />
    </div>
  );
};

export default FDCalculator;
