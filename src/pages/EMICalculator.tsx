import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Receipt, Calculator, TrendingDown, Clock } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EMICalculator = () => {
  // Basic loan inputs
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [tenureMonths, setTenureMonths] = useState(0);
  const [processingFee, setProcessingFee] = useState(0);

  // Prepayment options
  const [prepaymentEnabled, setPrepaymentEnabled] = useState(false);
  const [prepaymentAmount, setPrepaymentAmount] = useState(100000);
  const [prepaymentOption, setPrepaymentOption] = useState<'reduce_emi' | 'reduce_tenure'>('reduce_tenure');

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  // Calculate total tenure in months
  const totalTenureMonths = useMemo(() => {
    return tenureYears * 12 + tenureMonths;
  }, [tenureYears, tenureMonths]);

  const calculateEMI = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / (12 * 100);
    const months = totalTenureMonths;

    // Handle edge case where rate is 0
    let emi;
    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
                  (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    const processingFees = (loanAmount * processingFee) / 100;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      processingFees: Math.round(processingFees),
      principal,
      tenure: months
    };
  };

  const calculatePrepayment = () => {
    if (!prepaymentEnabled || prepaymentAmount <= 0) {
      return calculateEMI();
    }

    const baseResult = calculateEMI();
    const monthlyRate = interestRate / (12 * 100);

    if (prepaymentOption === 'reduce_emi') {
      // Reduce EMI, keep tenure same
      const newPrincipal = baseResult.principal - prepaymentAmount;
      const newEmi = newPrincipal * monthlyRate * Math.pow(1 + monthlyRate, baseResult.tenure) /
                     (Math.pow(1 + monthlyRate, baseResult.tenure) - 1);

      const newTotalPayment = newEmi * baseResult.tenure;
      const newTotalInterest = newTotalPayment - newPrincipal;
      const interestSaved = baseResult.totalInterest - newTotalInterest;

      return {
        ...baseResult,
        emi: Math.round(newEmi),
        totalInterest: Math.round(newTotalInterest),
        totalPayment: Math.round(newTotalPayment),
        principal: Math.round(newPrincipal),
        interestSaved: Math.round(interestSaved),
        prepaymentAmount
      };
    } else {
      // Reduce tenure, keep EMI same
      const targetEmi = baseResult.emi;
      const remainingPrincipal = baseResult.principal - prepaymentAmount;
      let monthsNeeded = 0;

      if (monthlyRate === 0) {
        monthsNeeded = Math.ceil(remainingPrincipal / targetEmi);
      } else {
        // Use EMI formula rearranged to solve for months
        monthsNeeded = Math.ceil(
          Math.log(targetEmi / (targetEmi - remainingPrincipal * monthlyRate)) /
          Math.log(1 + monthlyRate)
        );
      }

      const newTenureYears = Math.floor(monthsNeeded / 12);
      const newTenureMonths = monthsNeeded % 12;
      const newTotalPayment = targetEmi * monthsNeeded;
      const newTotalInterest = newTotalPayment - remainingPrincipal;
      const interestSaved = baseResult.totalInterest - newTotalInterest;
      const tenureReduced = baseResult.tenure - monthsNeeded;

      return {
        ...baseResult,
        totalInterest: Math.round(newTotalInterest),
        totalPayment: Math.round(newTotalPayment),
        principal: Math.round(remainingPrincipal),
        tenure: monthsNeeded,
        tenureYears: newTenureYears,
        tenureMonths: newTenureMonths,
        interestSaved: Math.round(interestSaved),
        tenureReduced: Math.round(tenureReduced),
        prepaymentAmount
      };
    }
  };

  type BaseResult = {
    emi: number;
    totalInterest: number;
    totalPayment: number;
    processingFees: number;
    principal: number;
    tenure: number;
  };

  type PrepaymentResult = BaseResult & {
    interestSaved: number;
    prepaymentAmount: number;
    tenureReduced?: number;
    tenureYears?: number;
    tenureMonths?: number;
  };

  const result = useMemo((): BaseResult | PrepaymentResult => {
    return prepaymentEnabled ? calculatePrepayment() : calculateEMI();
  }, [loanAmount, interestRate, totalTenureMonths, processingFee, prepaymentEnabled,
      prepaymentAmount, prepaymentOption]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setLoanAmount(1000000);
    setInterestRate(6.5);
    setTenureYears(5);
    setTenureMonths(0);
    setProcessingFee(0);
    setPrepaymentEnabled(false);
    setPrepaymentAmount(100000);
    setPrepaymentOption('reduce_tenure');
    setIsCalculated(false);
  };

  // Generate amortization schedule (first 12 months for preview)
  const generateAmortizationSchedule = () => {
    const schedule = [];
    let balance = result.principal;
    const monthlyRate = interestRate / (12 * 100);

    for (let month = 1; month <= Math.min(12, result.tenure); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = result.emi - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        emi: result.emi,
        principalPayment: Math.round(principalPayment),
        interestPayment: Math.round(interestPayment),
        balance: Math.round(Math.max(0, balance))
      });
    }

    return schedule;
  };

  const amortizationSchedule = generateAmortizationSchedule();

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">EMI Calculator</h2>
              <p className="text-xs text-muted-foreground">Advanced calculator with prepayment options</p>
            </div>
          </div>
          <div className="flex gap-2">
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
        </div>

        {/* Basic Loan Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Loan amount"
            value={loanAmount}
            onChange={setLoanAmount}
            min={10000}
            max={50000000}
            step={100000}
            prefix="₹"
            placeholder="1000000"
          />

          <CalculatorInput
            label="Interest rate (p.a)"
            value={interestRate}
            onChange={setInterestRate}
            min={1}
            max={30}
            step={0.1}
            suffix="%"
          />

          <CalculatorInput
            label="Loan tenure (years)"
            value={tenureYears}
            onChange={setTenureYears}
            min={1}
            max={30}
            step={1}
            suffix="Years"
          />

          <CalculatorInput
            label="Loan tenure (months)"
            value={tenureMonths}
            onChange={setTenureMonths}
            min={0}
            max={11}
            step={1}
            suffix="Months"
          />
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Total tenure: <span className="font-semibold text-foreground">{totalTenureMonths} months</span>
          </p>
        </div>

        <CalculatorInput
          label="Processing fee (optional)"
          value={processingFee}
          onChange={setProcessingFee}
          min={0}
          max={5}
          step={0.1}
          suffix="%"
        />

        {/* Prepayment Section */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="prepayment" className="text-sm font-medium">
              Prepayment / Part-payment
            </Label>
            <Switch
              id="prepayment"
              checked={prepaymentEnabled}
              onCheckedChange={setPrepaymentEnabled}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Make a lump sum payment to reduce EMI or tenure
          </p>

          {prepaymentEnabled && (
            <div className="space-y-4">
              <CalculatorInput
                label="Prepayment amount"
                value={prepaymentAmount}
                onChange={setPrepaymentAmount}
                min={10000}
                max={result.principal}
                step={10000}
                prefix="₹"
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Choose prepayment option:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      prepaymentOption === 'reduce_emi' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPrepaymentOption('reduce_emi')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Reduce EMI</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep same tenure, lower monthly payment
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      prepaymentOption === 'reduce_tenure' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPrepaymentOption('reduce_tenure')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Reduce Tenure</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep same EMI, pay off loan faster
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 gap-2"
            size="lg"
            onClick={handleCalculate}
          >
            <Calculator className="w-4 h-4" />
            Calculate
          </Button>

          {isCalculated && (
            <Dialog open={showAmortization} onOpenChange={setShowAmortization}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calculator className="w-4 h-4" />
                  View Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Amortization Schedule (First 12 months)</DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>EMI</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amortizationSchedule.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell>{formatCurrency(row.emi)}</TableCell>
                        <TableCell>{formatCurrency(row.principalPayment)}</TableCell>
                        <TableCell>{formatCurrency(row.interestPayment)}</TableCell>
                        <TableCell>{formatCurrency(row.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Loan Analysis</h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">Monthly EMI</p>
          <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(result.emi)}</p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Principal amount</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.principal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total interest</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.totalInterest)}</span>
          </div>
          {processingFee > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Processing fees</span>
              <span className="font-semibold text-foreground">{formatCurrency(result.processingFees)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total amount</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(processingFee > 0 ? result.totalPayment + result.processingFees : result.totalPayment)}
            </span>
          </div>
        </div>

        {/* Prepayment Results */}
        {prepaymentEnabled && 'interestSaved' in result && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🎉 Prepayment Benefits</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Interest saved</span>
                <span className="font-semibold text-green-800">{formatCurrency(result.interestSaved)}</span>
              </div>
              {prepaymentOption === 'reduce_emi' ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">New EMI</span>
                  <span className="font-semibold text-green-800">{formatCurrency(result.emi)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Tenure reduced by</span>
                    <span className="font-semibold text-green-800">
                      {result.tenureReduced ? `${Math.ceil(result.tenureReduced / 12)} years ${result.tenureReduced % 12} months` : '0 months'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">New tenure</span>
                    <span className="font-semibold text-green-800">
                      {result.tenureYears ? `${result.tenureYears}y ${result.tenureMonths}m` : `${Math.ceil(result.tenure / 12)}y ${result.tenure % 12}m`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Financial Recommendation */}
        {prepaymentEnabled && 'interestSaved' in result && (
          <Alert>
            <AlertDescription className="text-green-800">
              💡 <strong>Recommendation:</strong> {prepaymentOption === 'reduce_tenure'
                ? `Reducing tenure saves you ${formatCurrency(result.interestSaved)} in interest and helps you become debt-free faster!`
                : `Reducing EMI lowers your monthly burden while keeping the same loan duration.`}
            </AlertDescription>
          </Alert>
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
        </div>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="emi"
        inputs={{ loanAmount, interestRate, tenureYears, processingFee }}
        results={result}
      />
    </div>
  );
};

export default EMICalculator;
