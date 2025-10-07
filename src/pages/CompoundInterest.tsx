import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import DateRangeInput from '@/components/ui/DateRangeInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import { calculateCompoundInterest, formatCurrency } from '@/lib/calculations';
import { differenceInDays } from 'date-fns';

const CompoundInterest = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [manualYears, setManualYears] = useState(5);
  const [manualMonths, setManualMonths] = useState(0);
  const [manualDays, setManualDays] = useState(0);
  const [frequency, setFrequency] = useState('1');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const getTimeInYears = () => {
    if (startDate && endDate) {
      const days = Math.max(0, differenceInDays(endDate, startDate));
      return days / 365;
    }
    return manualYears + (manualMonths / 12) + (manualDays / 365);
  };

  const result = calculateCompoundInterest(principal, rate, getTimeInYears(), Number(frequency));

  const frequencyOptions = [
    { value: '1', label: 'Yearly' },
    { value: '2', label: 'Half-Yearly' },
    { value: '4', label: 'Quarterly' },
    { value: '12', label: 'Monthly' },
  ];

  const handleReset = () => {
    setPrincipal(100000);
    setRate(6);
    setStartDate(undefined);
    setEndDate(undefined);
    setManualYears(5);
    setManualMonths(0);
    setManualDays(0);
    setFrequency('1');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Compound Interest Calculator</h2>
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
          label="Principal amount"
          value={principal}
          onChange={setPrincipal}
          min={1000}
          max={10000000}
          step={1000}
          prefix="₹"
        />

        <CalculatorInput
          label="Rate of Interest (p.a)"
          value={rate}
          onChange={setRate}
          min={0}
          max={30}
          step={0.1}
          suffix="%"
          placeholder="8.0"
        />

        <DateRangeInput
          label="Time period"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          manualYears={manualYears}
          manualMonths={manualMonths}
          manualDays={manualDays}
          onManualYearsChange={setManualYears}
          onManualMonthsChange={setManualMonths}
          onManualDaysChange={setManualDays}
        />

        <div className="space-y-2">
          <Label>Compounding frequency</Label>
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
        
        <ResultChart
          principal={result.principal}
          returns={result.interest}
        />

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Principal amount</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.principal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total interest</span>
            <span className="font-semibold text-primary">{formatCurrency(result.interest)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total amount</span>
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
        calculationType="compound"
        inputs={{ principal, rate, time: getTimeInYears(), frequency: Number(frequency) }}
        results={result}
      />
    </div>
  );
};

export default CompoundInterest;
