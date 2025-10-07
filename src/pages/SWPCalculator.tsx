import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Calculator, Eye, EyeOff } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { calculateSWP, formatCurrency } from '@/lib/calculations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const SWPCalculator = () => {
  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [withdrawalPerMonth, setWithdrawalPerMonth] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState<number | undefined>(10);
  const [inflationRate, setInflationRate] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  const result = calculateSWP(investmentAmount, withdrawalPerMonth, expectedReturn, years, inflationRate);

  const handleReset = () => {
    setInvestmentAmount(1000000);
    setWithdrawalPerMonth(10000);
    setExpectedReturn(12);
    setYears(10);
    setInflationRate(0);
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
          label="Time period (optional)"
          value={years || 0}
          onChange={(value) => setYears(value > 0 ? value : undefined)}
          min={0}
          max={40}
          step={1}
          suffix="Years"
          placeholder="Leave blank for until depletion"
        />

        <CalculatorInput
          label="Inflation rate (optional)"
          value={inflationRate}
          onChange={setInflationRate}
          min={0}
          max={20}
          step={0.1}
          suffix="% p.a."
          placeholder="0"
        />
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">SWP Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Initial Investment</span>
              <span className="font-semibold text-foreground">{formatCurrency(result.invested)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Total Withdrawn</span>
              <span className="font-semibold text-foreground">{formatCurrency(result.totalWithdrawn)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Total Interest Earned</span>
              <span className="font-semibold text-foreground">{formatCurrency(result.totalInterest)}</span>
            </div>
            <div className={`flex justify-between items-center py-3 border-t-2 ${result.finalBalance < 0 ? 'border-destructive/20 bg-destructive/5' : 'border-primary/20 bg-primary/5'} -mx-4 px-4 rounded`}>
              <span className="text-base font-semibold text-foreground">Final Balance (Nominal)</span>
              <span className={`text-xl font-bold ${result.finalBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                {formatCurrency(result.finalBalance)}
              </span>
            </div>
          </div>

          <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
            {inflationRate > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Inflation-Adjusted Final Value</span>
                <span className="font-semibold text-foreground">{formatCurrency(result.inflationAdjustedFinalValue)}</span>
              </div>
            )}
            {result.depletionMonth && (
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Depletion Period</span>
                <span className="font-semibold text-foreground">{result.depletionMonth} months</span>
              </div>
            )}
            {years && (
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Sustainable Monthly Withdrawal</span>
                <span className="font-semibold text-foreground">{formatCurrency(result.sustainableWithdrawal)}</span>
              </div>
            )}
          </div>
        </div>

        {result.finalBalance < 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: Your investment will be exhausted before the end of the period. Consider reducing monthly withdrawals.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1 gap-2"
            size="lg"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="w-4 h-4" />
            Save to History
          </Button>

          <Dialog open={showFullTable} onOpenChange={setShowFullTable}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calculator className="w-4 h-4" />
                View Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Complete SWP Schedule ({result.fullAmortizationData.length} months)</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto mt-4">
                <div className="min-w-[700px]">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[60px]">Month</TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[100px]">Starting Balance</TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[100px]">Interest Earned</TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[80px]">Withdrawal</TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[100px]">Ending Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(showAllRows ? result.fullAmortizationData : result.fullAmortizationData.slice(0, 24)).map((row) => (
                          <TableRow key={row.month} className="hover:bg-muted/30">
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 font-medium">{row.month}</TableCell>
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2">{formatCurrency(row.startingBalance)}</TableCell>
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-green-600">+{formatCurrency(row.interestEarned)}</TableCell>
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-red-600">-{formatCurrency(row.withdrawal)}</TableCell>
                            <TableCell className={`text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 font-semibold ${row.endingBalance < 0 ? 'text-destructive' : ''}`}>
                              {formatCurrency(row.endingBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="swp"
        inputs={{ investmentAmount, withdrawalPerMonth, expectedReturn, years, inflationRate }}
        results={{
          invested: result.invested,
          totalWithdrawn: result.totalWithdrawn,
          totalInterest: result.totalInterest,
          finalBalance: result.finalBalance,
          inflationAdjustedFinalValue: result.inflationAdjustedFinalValue,
          sustainableWithdrawal: result.sustainableWithdrawal,
          depletionMonth: result.depletionMonth || 0
        }}
      />
    </div>
  );
};

export default SWPCalculator;
