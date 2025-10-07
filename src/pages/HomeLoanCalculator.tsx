import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Home, Calculator, TrendingDown, Clock, Eye, EyeOff } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const HomeLoanCalculator = () => {
  // Basic loan inputs
  const [propertyValue, setPropertyValue] = useState(6000000);
  const [downPayment, setDownPayment] = useState(1200000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [tenureMonths, setTenureMonths] = useState(0);
  const [processingFee, setProcessingFee] = useState(0);

  // Advanced features
  const [isExistingLoan, setIsExistingLoan] = useState(false);
  const [outstandingAmount, setOutstandingAmount] = useState(4800000);
  const [monthsCompleted, setMonthsCompleted] = useState(0);
  const [remainingTenureYears, setRemainingTenureYears] = useState(15);
  const [remainingTenureMonths, setRemainingTenureMonths] = useState(0);

  // Prepayment options
  const [prepaymentEnabled, setPrepaymentEnabled] = useState(false);
  const [prepaymentAmount, setPrepaymentAmount] = useState(100000);
  const [prepaymentOption, setPrepaymentOption] = useState<'reduce_emi' | 'reduce_tenure'>('reduce_tenure');
  const [prepaymentChargeType, setPrepaymentChargeType] = useState<'fixed' | 'percentage'>('percentage');
  const [prepaymentChargeValue, setPrepaymentChargeValue] = useState(0);

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  // Calculate total tenure in months
  const totalTenureMonths = useMemo(() => {
    return tenureYears * 12 + tenureMonths;
  }, [tenureYears, tenureMonths]);

  // Calculate remaining loan balance after specified months completed
  const calculateRemainingBalance = (baseResult: {principal: number; tenure: number; emi: number}, monthsCompleted: number): number => {
    if (monthsCompleted <= 0) {
      return baseResult.principal;
    }

    if (monthsCompleted >= baseResult.tenure) {
      return 0;
    }

    const monthlyRate = interestRate / (12 * 100);
    let balance = baseResult.principal;

    // If 0% interest rate, use simple division
    if (monthlyRate === 0) {
      const monthlyPrincipalPayment = baseResult.principal / baseResult.tenure;
      return Math.max(0, baseResult.principal - (monthlyPrincipalPayment * monthsCompleted));
    }

    // Calculate remaining balance using amortization formula
    for (let month = 1; month <= monthsCompleted; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = baseResult.emi - interestPayment;
      balance -= principalPayment;

      if (balance <= 0) {
        return 0;
      }
    }

    return Math.max(0, balance);
  };

  const calculateHomeLoan = () => {
    const principal = isExistingLoan ? outstandingAmount : (propertyValue - downPayment);
    const monthlyRate = interestRate / (12 * 100);
    const months = isExistingLoan
      ? (remainingTenureYears * 12 + remainingTenureMonths)
      : totalTenureMonths;

    let emi;
    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
                 (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    const processingFees = (principal * processingFee) / 100;

    // Tax benefit calculation (approximate - 80C + 24b)
    const maxTaxBenefit = Math.min(totalInterest, 200000);

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      processingFees: Math.round(processingFees),
      principal: Math.round(principal),
      downPayment: isExistingLoan ? 0 : downPayment,
      propertyValue: isExistingLoan ? 0 : propertyValue,
      taxBenefit: Math.round(maxTaxBenefit),
      tenure: months
    };
  };

  const calculatePrepayment = () => {
    if (!prepaymentEnabled) {
      return calculateHomeLoan();
    }

    const baseResult = calculateHomeLoan();
    const monthlyRate = interestRate / (12 * 100);

    // Handle zero prepayment amount
    if (prepaymentAmount <= 0) {
      return {
        ...baseResult,
        interestSaved: 0,
        prepaymentAmount: 0,
        prepaymentCharges: 0
      };
    }

    // Calculate prepayment charges
    const prepaymentCharges = prepaymentChargeType === 'fixed'
      ? prepaymentChargeValue
      : (prepaymentAmount * prepaymentChargeValue) / 100;

    // Net prepayment amount after charges
    const netPrepaymentAmount = prepaymentAmount - prepaymentCharges;

    if (prepaymentOption === 'reduce_emi') {
      // Reduce EMI, keep tenure same
      const newPrincipal = baseResult.principal - netPrepaymentAmount;
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
        prepaymentAmount,
        prepaymentCharges: Math.round(prepaymentCharges),
        netPrepaymentAmount: Math.round(netPrepaymentAmount)
      };
    } else {
      // Reduce tenure, keep EMI same
      const targetEmi = baseResult.emi;
      const remainingPrincipal = baseResult.principal - netPrepaymentAmount;
      let monthsNeeded = 0;

      if (monthlyRate === 0) {
        monthsNeeded = Math.ceil(remainingPrincipal / targetEmi);
      } else {
        // Use EMI formula rearranged to solve for months with improved accuracy
        const factor = targetEmi / (targetEmi - remainingPrincipal * monthlyRate);
        if (factor <= 1) {
          monthsNeeded = 0; // Already paid off
        } else {
          monthsNeeded = Math.ceil(Math.log(factor) / Math.log(1 + monthlyRate));
        }
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
        prepaymentAmount,
        prepaymentCharges: Math.round(prepaymentCharges),
        netPrepaymentAmount: Math.round(netPrepaymentAmount)
      };
    }
  };

  type BaseResult = {
    emi: number;
    totalInterest: number;
    totalPayment: number;
    processingFees: number;
    principal: number;
    downPayment: number;
    propertyValue: number;
    taxBenefit: number;
    tenure: number;
  };

  type PrepaymentResult = BaseResult & {
    interestSaved: number;
    prepaymentAmount: number;
    prepaymentCharges?: number;
    netPrepaymentAmount?: number;
    tenureReduced?: number;
    tenureYears?: number;
    tenureMonths?: number;
  };

  const result = useMemo((): BaseResult | PrepaymentResult => {
    return prepaymentEnabled ? calculatePrepayment() : calculateHomeLoan();
  }, [propertyValue, interestRate, tenureYears, tenureMonths, downPayment, processingFee, isExistingLoan,
      outstandingAmount, monthsCompleted, remainingTenureYears, remainingTenureMonths, prepaymentEnabled,
      prepaymentAmount, prepaymentOption, prepaymentChargeType, prepaymentChargeValue]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setPropertyValue(6000000);
    setInterestRate(8.5);
    setTenureYears(20);
    setTenureMonths(0);
    setDownPayment(1200000);
    setProcessingFee(0);
    setIsExistingLoan(false);
    setOutstandingAmount(4800000);
    setMonthsCompleted(0);
    setRemainingTenureYears(15);
    setRemainingTenureMonths(0);
    setPrepaymentEnabled(false);
    setPrepaymentAmount(100000);
    setPrepaymentOption('reduce_tenure');
    setPrepaymentChargeType('percentage');
    setPrepaymentChargeValue(0);
    setIsCalculated(false);
  };

  // Generate full amortization schedule
  const generateAmortizationSchedule = () => {
    const schedule = [];
    let balance = result.principal;
    const monthlyRate = interestRate / (12 * 100);

    // Calculate remaining balance based on months completed for both new and existing loans
    if (monthsCompleted > 0) {
      balance = calculateRemainingBalance(result, monthsCompleted);
    }

    const emiToUse = result.emi;
    const tenureToUse = result.tenure;

    for (let month = 1; month <= tenureToUse; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emiToUse - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        emi: emiToUse,
        principalPayment: Math.round(principalPayment),
        interestPayment: Math.round(interestPayment),
        balance: Math.round(Math.max(0, balance))
      });
    }

    return schedule;
  };

  const amortizationSchedule = generateAmortizationSchedule();

  // Calculate and display the actual remaining balance for user reference
  const actualRemainingBalance = useMemo(() => {
    if (!prepaymentEnabled || monthsCompleted <= 0) {
      return result.principal;
    }
    const baseResult = calculateHomeLoan();
    return calculateRemainingBalance(baseResult, monthsCompleted);
  }, [result.principal, monthsCompleted, prepaymentEnabled, interestRate, totalTenureMonths]);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Home Loan Calculator</h2>
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

        {/* Loan Type Selection */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="existing-loan" className="text-sm font-medium">
              Existing Loan
            </Label>
            <Switch
              id="existing-loan"
              checked={isExistingLoan}
              onCheckedChange={setIsExistingLoan}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enable if you have an existing home loan and want to calculate prepayments
          </p>
        </div>

        {/* Basic Loan Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isExistingLoan ? (
            <>
              <CalculatorInput
                label="Outstanding loan amount"
                value={outstandingAmount}
                onChange={setOutstandingAmount}
                min={100000}
                max={100000000}
                step={100000}
                prefix="₹"
              />
              <CalculatorInput
                label="Interest Rate (p.a)"
                value={interestRate}
                onChange={setInterestRate}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
                placeholder="8.5"
              />
              <CalculatorInput
                label="Remaining tenure (years)"
                value={remainingTenureYears}
                onChange={setRemainingTenureYears}
                min={1}
                max={30}
                step={1}
                suffix="Years"
              />
              <CalculatorInput
                label="Remaining tenure (months)"
                value={remainingTenureMonths}
                onChange={setRemainingTenureMonths}
                min={0}
                max={11}
                step={1}
                suffix="Months"
              />
            </>
          ) : (
            <>
              <CalculatorInput
                label="Property value"
                value={propertyValue}
                onChange={setPropertyValue}
                min={500000}
                max={100000000}
                step={100000}
                prefix="₹"
                placeholder="6000000"
              />
              <CalculatorInput
                label="Down payment"
                value={downPayment}
                onChange={setDownPayment}
                min={0}
                max={propertyValue * 0.5}
                step={100000}
                prefix="₹"
              />
              <CalculatorInput
                label="Interest rate (p.a)"
                value={interestRate}
                onChange={setInterestRate}
                min={6}
                max={15}
                step={0.1}
                suffix="%"
              />
              <CalculatorInput
                label="Loan tenure (years)"
                value={tenureYears}
                onChange={setTenureYears}
                min={5}
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
            </>
          )}
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Loan amount: <span className="font-semibold text-foreground">{formatCurrency(result.principal)}</span>
            {!isExistingLoan && (
              <span className="ml-4">
                Property value: <span className="font-semibold text-foreground">{formatCurrency(result.propertyValue)}</span>
              </span>
            )}
            {isExistingLoan && (
              <span className="ml-4">
                Remaining tenure: <span className="font-semibold text-foreground">
                  {isExistingLoan ? remainingTenureYears : tenureYears}y {isExistingLoan ? remainingTenureMonths : tenureMonths}m
                </span>
              </span>
            )}
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
                label="Months completed"
                value={monthsCompleted}
                onChange={setMonthsCompleted}
                min={0}
                max={totalTenureMonths}
                step={1}
                suffix="EMIs paid"
                placeholder="0"
              />

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Calculated Remaining Balance:</p>
                <p className="text-sm font-semibold text-blue-800">
                  {monthsCompleted > 0 ? formatCurrency(actualRemainingBalance) : formatCurrency(result.principal)}
                </p>
                <p className="text-xs text-blue-600">
                  {monthsCompleted > 0 ? `After ${monthsCompleted} EMI payments` : 'Original loan amount'}
                </p>
              </div>

              <CalculatorInput
                label="Prepayment amount"
                value={prepaymentAmount}
                onChange={setPrepaymentAmount}
                min={0}
                max={calculateRemainingBalance(result, monthsCompleted)}
                step={10000}
                prefix="₹"
                placeholder="100000"
              />

              <div className="grid grid-cols-2 gap-3">
                <CalculatorInput
                  label="Prepayment charges"
                  value={prepaymentChargeValue}
                  onChange={setPrepaymentChargeValue}
                  min={0}
                  max={prepaymentChargeType === 'percentage' ? 10 : prepaymentAmount}
                  step={prepaymentChargeType === 'percentage' ? 0.1 : 1000}
                  prefix={prepaymentChargeType === 'fixed' ? '₹' : ''}
                  suffix={prepaymentChargeType === 'percentage' ? '%' : ''}
                  placeholder={prepaymentChargeType === 'fixed' ? '5000' : '2'}
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Charge Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrepaymentChargeType('fixed')}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                        prepaymentChargeType === 'fixed'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:bg-accent'
                      }`}
                    >
                      Fixed (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrepaymentChargeType('percentage')}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                        prepaymentChargeType === 'percentage'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border hover:bg-accent'
                      }`}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>
              </div>

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
              <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Complete Amortization Schedule ({result.tenure} months)</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto mt-4">
                  <div className="min-w-[600px]">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[60px]">Month</TableHead>
                            <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[80px]">EMI</TableHead>
                            <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[80px]">Principal</TableHead>
                            <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[80px]">Interest</TableHead>
                            <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[80px]">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(showAllRows ? amortizationSchedule : amortizationSchedule.slice(0, 24)).map((row) => (
                            <TableRow key={row.month} className="hover:bg-muted/30">
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 font-medium">{row.month}</TableCell>
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2">{formatCurrency(row.emi)}</TableCell>
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-green-600">+{formatCurrency(row.principalPayment)}</TableCell>
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-orange-600">+{formatCurrency(row.interestPayment)}</TableCell>
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 font-semibold">{formatCurrency(row.balance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {!showAllRows && amortizationSchedule.length > 24 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllRows(true)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Show All {result.tenure} Months
                        </Button>
                      </div>
                    )}
                    {showAllRows && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllRows(false)}
                          className="gap-2"
                        >
                          <EyeOff className="w-4 h-4" />
                          Show First 24 Months
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
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
            <span className="text-sm text-muted-foreground">Loan amount</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.principal)}</span>
          </div>
          {!isExistingLoan && (
            <>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Down payment</span>
                <span className="font-semibold text-foreground">{formatCurrency(result.downPayment)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Property value</span>
                <span className="font-semibold text-foreground">{formatCurrency(result.propertyValue)}</span>
              </div>
            </>
          )}
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
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Tax benefit (approx)</span>
            <span className="font-semibold text-green-600">{formatCurrency(result.taxBenefit)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total amount</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(processingFee > 0 ? result.totalPayment + result.processingFees : result.totalPayment)}
            </span>
          </div>
        </div>

        {/* Prepayment Results */}
        {prepaymentEnabled && 'interestSaved' in result && (
          <div className={`p-4 rounded-lg border ${result.prepaymentAmount > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <h4 className={`font-semibold mb-3 ${result.prepaymentAmount > 0 ? 'text-green-800' : 'text-blue-800'}`}>
              {result.prepaymentAmount > 0 ? '🎉 Prepayment Benefits' : '💡 Prepayment Analysis'}
            </h4>
            <div className="space-y-2">
              {result.prepaymentAmount > 0 && result.prepaymentCharges > 0 && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-yellow-700">Prepayment charges</span>
                    <span className="font-semibold text-yellow-800">{formatCurrency(result.prepaymentCharges)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-700">Net prepayment amount</span>
                    <span className="font-semibold text-yellow-800">{formatCurrency(result.netPrepaymentAmount)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className={`text-sm ${result.prepaymentAmount > 0 ? 'text-green-700' : 'text-blue-700'}`}>Interest saved</span>
                <span className={`font-semibold ${result.prepaymentAmount > 0 ? 'text-green-800' : 'text-blue-800'}`}>
                  {formatCurrency(result.interestSaved)}
                </span>
              </div>

              {result.prepaymentAmount > 0 ? (
                prepaymentOption === 'reduce_emi' ? (
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
                )
              ) : (
                <div className="text-sm text-blue-700 italic">
                  Enter prepayment amount above ₹0 to see benefits
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Recommendation */}
        {prepaymentEnabled && 'interestSaved' in result && result.prepaymentAmount > 0 && (
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
        calculationType="homeloan"
        inputs={{
          propertyValue,
          downPayment,
          interestRate,
          tenureYears,
          tenureMonths,
          processingFee,
          isExistingLoan: isExistingLoan ? 1 : 0,
          outstandingAmount,
          monthsCompleted,
          remainingTenureYears,
          remainingTenureMonths,
          prepaymentAmount,
          prepaymentOption,
          prepaymentChargeType,
          prepaymentChargeValue
        }}
        results={{
          emi: result.emi,
          totalInterest: result.totalInterest,
          totalPayment: result.totalPayment,
          processingFees: result.processingFees,
          principal: result.principal,
          downPayment: result.downPayment,
          propertyValue: result.propertyValue,
          taxBenefit: result.taxBenefit,
          ...(prepaymentEnabled && 'interestSaved' in result && {
            interestSaved: result.interestSaved,
            prepaymentAmount: result.prepaymentAmount,
            tenureReduced: result.tenureReduced || 0
          })
        }}
      />
    </div>
  );
};

export default HomeLoanCalculator;
