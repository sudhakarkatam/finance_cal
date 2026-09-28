import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Home, Calculator, TrendingDown, Clock, Eye, EyeOff, Info, Share2 } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import { useCurrency } from '@/hooks/useCurrency';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const HomeLoanCalculator = () => {
  const { formatAmount, symbol } = useCurrency();
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Calculate total tenure in months
  const totalTenureMonths = useMemo(() => {
    return tenureYears * 12 + tenureMonths;
  }, [tenureYears, tenureMonths]);

  // Calculate remaining loan balance after specified months completed
  const calculateRemainingBalance = (baseResult: { principal: number; tenure: number; emi: number }, monthsCompleted: number): number => {
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

    // Handle zero or empty prepayment amount
    if (!prepaymentAmount || prepaymentAmount <= 0) {
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
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setInfoDialogOpen(true)}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>About Home Loan & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Home Loan?</h3>
                    <p className="text-muted-foreground">
                      Home loan is a secured loan provided by banks and financial institutions to purchase, construct, or renovate a residential property. The property serves as collateral for the loan, typically requiring 10-20% down payment.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Down Payment:</strong> Usually 10-20% of property value</li>
                      <li><strong>Loan Tenure:</strong> Up to 30 years (typically 15-20 years)</li>
                      <li><strong>Interest Rates:</strong> Fixed or floating rates (currently 7-9% p.a.)</li>
                      <li><strong>Tax Benefits:</strong> Interest and principal eligible for deductions</li>
                      <li><strong>Prepayment:</strong> Allows partial/full prepayment with or without charges</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Tax Benefits</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Section 24(b):</strong> Up to ₹2 lakh interest deduction per year</li>
                      <li><strong>Section 80C:</strong> Principal repayment up to ₹1.5 lakh deduction</li>
                      <li><strong>Section 80EE:</strong> Additional ₹50,000 deduction for first-time homebuyers</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Prepayment Options</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Reduce EMI:</strong> Keep tenure same, lower monthly payment</li>
                      <li><strong>Reduce Tenure:</strong> Keep EMI same, pay off faster (saves interest)</li>
                      <li>Prepayment charges usually 0-2% of prepaid amount</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The Home Loan calculator helps you estimate EMI, total interest, tax benefits, and prepayment impact. Calculate for new or existing loans, with prepayment options to optimize your home loan strategy.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: First-Time Homebuyer</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Property = ₹60L, Down payment 20% = ₹12L, Loan = ₹48L, 8.5% rate, 20 years<br />
                          <strong>EMI:</strong> ₹41,682/month<br />
                          <strong>Total Payment:</strong> ₹1,00,03,680 over 20 years<br />
                          <strong>Total Interest:</strong> ₹52,03,680<br />
                          <strong>Section 80EE Benefit:</strong> Additional ₹50,000 deduction (first-time buyer)<br />
                          <strong>Tax Savings:</strong> ₹1,50,000/year (₹80C) + ₹1,70,000/year (24b) + ₹50,000 one-time (80EE) = ₹3,70,000 first year
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Tax Benefits Calculation</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹40L loan, 8% rate, 15 years, 30% tax bracket<br />
                          <strong>Annual Interest:</strong> ₹3,15,000 (first year)<br />
                          <strong>Section 24(b):</strong> ₹2L deduction (max) → Save ₹60,000 tax<br />
                          <strong>Principal (80C):</strong> ₹2,50,000/year → Save ₹75,000 tax<br />
                          <strong>Total Tax Saved:</strong> ₹1,35,000/year = ₹20,25,000 over 15 years<br />
                          <strong>Effective Loan Cost:</strong> Interest minus tax savings = much lower real cost
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Prepayment Strategy</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹50L loan, 8% rate, 20 years, prepay ₹5L at year 5<br />
                          <strong>Before Prepayment:</strong> ₹41,822 EMI, ₹50,37,280 total interest<br />
                          <strong>After Prepayment:</strong> Tenure reduces to 14 years, ₹28,50,000 total interest<br />
                          <strong>Interest Saved:</strong> ₹21,87,280 (43% reduction)<br />
                          <strong>Time Saved:</strong> 6 years (loan ends at year 14)<br />
                          <strong>ROI:</strong> ₹5L prepayment saves ₹21.87L → 437% effective return
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Down Payment Impact</p>
                        <p className="text-sm">
                          <strong>Property:</strong> ₹80L, comparing down payments<br />
                          <strong>10% Down:</strong> ₹8L down, ₹72L loan, ₹67,491 EMI, ₹90,17,784 interest<br />
                          <strong>20% Down:</strong> ₹16L down, ₹64L loan, ₹59,992 EMI, ₹79,98,080 interest<br />
                          <strong>Difference:</strong> ₹8L more down payment saves ₹10,19,704 interest<br />
                          <strong>EMI Reduction:</strong> ₹7,499/month lower<br />
                          <strong>Strategy:</strong> Higher down payment reduces EMI burden and total interest significantly
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Home Purchase</p>
                        <p className="text-sm">
                          <strong>Rahul's Journey:</strong> Bought ₹75L home, 20% down (₹15L), ₹60L loan at 8.5%, 20 years<br />
                          <strong>EMI:</strong> ₹52,102/month<br />
                          <strong>Strategy:</strong> Prepaid ₹3L at year 3, ₹4L at year 6 using bonuses<br />
                          <strong>Result:</strong> Loan completed in 15 years instead of 20<br />
                          <strong>Interest Saved:</strong> ₹12,50,000<br />
                          <strong>Tax Benefits:</strong> ₹18,00,000 saved over 15 years<br />
                          <strong>Success:</strong> Owned home 5 years early, used savings for kids' education
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Higher down payment reduces EMI and total interest - save aggressively before buying</li>
                      <li>Maximize Section 80C (₹1.5L) and Section 24(b) (₹2L interest) for maximum tax savings</li>
                      <li>Prepay early in loan when interest is high - saves maximum money</li>
                      <li>Use prepayment to reduce tenure rather than EMI - saves more interest overall</li>
                      <li>Factor in processing fees (0.5-1.5%) and other charges when comparing loans</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

        <Alert className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs ml-2">
            This calculator is designed for Indian financial rules (Rupees ₹).
          </AlertDescription>
        </Alert>

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
                prefix={symbol}
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
                prefix={symbol}
                placeholder="6000000"
              />
              <CalculatorInput
                label="Down payment"
                value={downPayment}
                onChange={setDownPayment}
                min={0}
                max={propertyValue * 0.5}
                step={100000}
                prefix={symbol}
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
            Loan amount: <span className="font-semibold text-foreground">{formatAmount(result.principal)}</span>
            {!isExistingLoan && (
              <span className="ml-4">
                Property value: <span className="font-semibold text-foreground">{formatAmount(result.propertyValue)}</span>
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
                  {monthsCompleted > 0 ? formatAmount(actualRemainingBalance) : formatAmount(result.principal)}
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
                prefix={symbol}
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
                  prefix={prepaymentChargeType === 'fixed' ? symbol : ''}
                  suffix={prepaymentChargeType === 'percentage' ? '%' : ''}
                  placeholder={prepaymentChargeType === 'fixed' ? '5000' : '2'}
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Charge Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrepaymentChargeType('fixed')}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${prepaymentChargeType === 'fixed'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-accent'
                        }`}
                    >
                      Fixed (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrepaymentChargeType('percentage')}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${prepaymentChargeType === 'percentage'
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
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${prepaymentOption === 'reduce_emi' ? 'border-primary bg-primary/5' : 'border-border'
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
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${prepaymentOption === 'reduce_tenure' ? 'border-primary bg-primary/5' : 'border-border'
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
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2">{formatAmount(row.emi)}</TableCell>
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-green-600">+{formatAmount(row.principalPayment)}</TableCell>
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-orange-600">+{formatAmount(row.interestPayment)}</TableCell>
                              <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 font-semibold">{formatAmount(row.balance)}</TableCell>
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
          <p className="text-3xl font-bold text-primary-foreground">{formatAmount(result.emi)}</p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Loan amount</span>
            <span className="font-semibold text-foreground">{formatAmount(result.principal)}</span>
          </div>
          {!isExistingLoan && (
            <>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Down payment</span>
                <span className="font-semibold text-foreground">{formatAmount(result.downPayment)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Property value</span>
                <span className="font-semibold text-foreground">{formatAmount(result.propertyValue)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total interest</span>
            <span className="font-semibold text-foreground">{formatAmount(result.totalInterest)}</span>
          </div>
          {processingFee > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Processing fees</span>
              <span className="font-semibold text-foreground">{formatAmount(result.processingFees)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Tax benefit (approx)</span>
            <span className="font-semibold text-green-600">{formatAmount(result.taxBenefit)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total amount</span>
            <span className="text-xl font-bold text-primary">
              {formatAmount(processingFee > 0 ? result.totalPayment + result.processingFees : result.totalPayment)}
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
                    <span className="font-semibold text-yellow-800">{formatAmount(result.prepaymentCharges)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-700">Net prepayment amount</span>
                    <span className="font-semibold text-yellow-800">{formatAmount(result.netPrepaymentAmount)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className={`text-sm ${result.prepaymentAmount > 0 ? 'text-green-700' : 'text-blue-700'}`}>Interest saved</span>
                <span className={`font-semibold ${result.prepaymentAmount > 0 ? 'text-green-800' : 'text-blue-800'}`}>
                  {formatAmount(result.interestSaved)}
                </span>
              </div>

              {result.prepaymentAmount > 0 ? (
                prepaymentOption === 'reduce_emi' ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">New EMI</span>
                    <span className="font-semibold text-green-800">{formatAmount(result.emi)}</span>
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
                ? `Reducing tenure saves you ${formatAmount(result.interestSaved)} in interest and helps you become debt-free faster!`
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
          <Button
            variant="outline"
            className="flex-1 gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/10"
            size="lg"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="w-4 h-4" />
            Export & Share Report PDF
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

      <ShareReportModal
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title="Home Loan EMI & Prepayment Breakdown Statement"
        inputs={[
          { label: "Property Value", value: formatAmount(propertyValue) },
          { label: "Down Payment Amount", value: formatAmount(downPayment) },
          { label: "Net Loan Principal", value: formatAmount(result.principal) },
          { label: "Interest Rate", value: `${interestRate}%` },
          { label: "Loan Tenure", value: `${tenureYears} Years (${totalTenureMonths} Months)` },
          { label: "Processing Fee Rate", value: `${processingFee}%` },
        ]}
        results={[
          { label: "Monthly Home Loan EMI", value: formatAmount(result.emi), isHighlight: true },
          { label: "Total Payable Interest", value: formatAmount(result.totalInterest) },
          { label: "Total Outflow Amount (Principal + Interest)", value: formatAmount(result.totalPayment) },
          { label: "Annual Tax Benefit Eligibility (Sec 24 + 80C)", value: formatAmount(result.taxBenefit || 0) },
        ]}
        isLoanSchedule={true}
        scheduleTitle="Home Loan Amortization Schedule"
        scheduleHeaders={{ period: "Month", invested: "Principal Paid", interest: "Interest Paid", balance: "Outstanding Balance" }}
        schedule={amortizationSchedule?.map((row: any) => ({
          period: `Month ${row.month}`,
          invested: row.principalPayment,
          interest: row.interestPayment,
          total: row.balance,
        }))}
      />
    </div>
  );
};

export default HomeLoanCalculator;
