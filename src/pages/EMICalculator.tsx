import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Receipt, Calculator, TrendingDown, Clock, Eye, EyeOff, Info, Share2 } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import { ScheduleRow } from '@/components/InvestmentScheduleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrency } from '@/hooks/useCurrency';

const EMICalculator = () => {
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  // Basic loan inputs
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [tenureYears, setTenureYears] = useState(5);
  const [tenureMonths, setTenureMonths] = useState(0);
  const [processingFee, setProcessingFee] = useState(0);

  // Prepayment options
  const [prepaymentEnabled, setPrepaymentEnabled] = useState(false);
  const [monthsCompleted, setMonthsCompleted] = useState(0); // EMIs already paid
  const [remainingLoanAmount, setRemainingLoanAmount] = useState(0); // Optional field
  const [prepaymentAmount, setPrepaymentAmount] = useState(100000);
  const [prepaymentOption, setPrepaymentOption] = useState<'reduce_emi' | 'reduce_tenure'>('reduce_tenure');
  const [prepaymentChargeType, setPrepaymentChargeType] = useState<'fixed' | 'percentage'>('percentage');
  const [prepaymentChargeValue, setPrepaymentChargeValue] = useState(0); // Fixed amount or percentage

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
    if (!prepaymentEnabled) {
      return calculateEMI();
    }

    const baseResult = calculateEMI();
    const monthlyRate = interestRate / (12 * 100);

    // Calculate the actual remaining balance based on override or months completed
    const currentPrincipal = (remainingLoanAmount && remainingLoanAmount > 0)
      ? remainingLoanAmount
      : calculateRemainingBalance(baseResult, monthsCompleted);

    // Handle zero prepayment amount
    if (!prepaymentAmount || prepaymentAmount <= 0) {
      return {
        ...baseResult,
        principal: currentPrincipal,
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
      const newPrincipal = currentPrincipal - netPrepaymentAmount;
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
      const remainingPrincipal = currentPrincipal - netPrepaymentAmount;
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
    return prepaymentEnabled ? calculatePrepayment() : calculateEMI();
  }, [loanAmount, interestRate, totalTenureMonths, processingFee, prepaymentEnabled,
    monthsCompleted, remainingLoanAmount, prepaymentAmount, prepaymentOption,
    prepaymentChargeType, prepaymentChargeValue]);

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
    setMonthsCompleted(0);
    setRemainingLoanAmount(0);
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

    // For prepayment scenarios, use the correct starting balance (override balance or calculated)
    if (prepaymentEnabled && 'principal' in result) {
      balance = (remainingLoanAmount && remainingLoanAmount > 0)
        ? remainingLoanAmount
        : (monthsCompleted > 0 ? calculateRemainingBalance(result, monthsCompleted) : result.principal);
    }

    const emiToUse = result.emi;
    const tenureToUse = result.tenure;

    for (let month = 1; month <= tenureToUse; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(emiToUse - interestPayment, balance); // Don't overpay
      balance -= principalPayment;

      schedule.push({
        month,
        emi: emiToUse,
        principalPayment: Math.round(principalPayment),
        interestPayment: Math.round(interestPayment),
        balance: Math.round(Math.max(0, balance))
      });

      // Stop schedule if loan is fully paid off
      if (balance <= 0) break;
    }

    return schedule;
  };

  const amortizationSchedule = generateAmortizationSchedule();

  // Calculate and display the actual remaining balance for user reference
  const actualRemainingBalance = useMemo(() => {
    if (remainingLoanAmount && remainingLoanAmount > 0) {
      return remainingLoanAmount;
    }
    if (!prepaymentEnabled || monthsCompleted <= 0) {
      return loanAmount;
    }
    const baseResult = calculateEMI();
    return calculateRemainingBalance(baseResult, monthsCompleted);
  }, [loanAmount, monthsCompleted, prepaymentEnabled, interestRate, totalTenureMonths, remainingLoanAmount]);

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
                  <DialogTitle>About EMI & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is EMI?</h3>
                    <p className="text-muted-foreground">
                      Equated Monthly Installment (EMI) is a fixed amount paid by a borrower to a lender on a specific date each month. EMI includes both principal repayment and interest payment, calculated using a standard formula that ensures the loan is paid off over the specified tenure.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">EMI Formula</h3>
                    <p className="text-muted-foreground mb-2 font-mono text-xs bg-muted p-2 rounded">
                      EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
                    </p>
                    <p className="text-muted-foreground">
                      Where: P = Principal loan amount, R = Monthly interest rate, N = Loan tenure in months
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Prepayment Options</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Reduce EMI:</strong> Keep tenure same, reduce monthly payment</li>
                      <li><strong>Reduce Tenure:</strong> Keep EMI same, pay off loan faster (saves interest)</li>
                      <li>Prepayment charges may apply (usually 2-4% of prepaid amount)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>EMI calculation assumes fixed interest rate throughout loan tenure</li>
                      <li>Floating rate loans may have variable EMIs</li>
                      <li>Early prepayments can significantly reduce total interest paid</li>
                      <li>Processing fees are usually 0.5-2% of loan amount</li>
                      <li>Loan interest is eligible for tax deduction under Section 24(b) for home loans</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Personal Loan EMI</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Loan = ₹10,00,000, Interest = 12% p.a., Tenure = 5 years<br />
                          <strong>EMI Calculation:</strong> ₹22,244/month<br />
                          <strong>Total Payment:</strong> ₹22,244 × 60 = ₹13,34,640<br />
                          <strong>Interest Paid:</strong> ₹3,34,640<br />
                          <strong>Breakdown:</strong> First EMI: ₹12,244 principal + ₹10,000 interest<br />
                          <strong>Over Time:</strong> Principal increases, interest decreases each month
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Prepayment Reduce Tenure</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹20L loan, 8% rate, 20 years, prepay ₹2L after 2 years<br />
                          <strong>Before Prepayment:</strong> EMI ₹16,728, remaining 18 years<br />
                          <strong>After Prepayment:</strong> EMI ₹16,728, tenure reduces to 14.5 years<br />
                          <strong>Interest Saved:</strong> ₹5,50,000 (from 18 years to 14.5 years)<br />
                          <strong>Benefit:</strong> Become debt-free 3.5 years earlier + huge interest savings<br />
                          <strong>Strategy:</strong> Better option if you can afford same EMI
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Prepayment Reduce EMI</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹15L loan, 9% rate, 15 years, prepay ₹3L after 3 years<br />
                          <strong>Before Prepayment:</strong> EMI ₹15,211, remaining 12 years<br />
                          <strong>After Prepayment:</strong> EMI ₹11,847, tenure stays 12 years<br />
                          <strong>EMI Reduction:</strong> ₹3,364/month (22% lower EMI)<br />
                          <strong>Interest Saved:</strong> ₹2,04,000 (from lower principal)<br />
                          <strong>Benefit:</strong> Lower monthly burden while keeping same tenure
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Interest Savings Calculation</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹25L home loan, 8.5% rate, 20 years<br />
                          <strong>Total Interest:</strong> ₹24,50,000 (without prepayment)<br />
                          <strong>Prepay ₹5L at year 5:</strong> Interest reduces to ₹18,20,000<br />
                          <strong>Savings:</strong> ₹6,30,000 interest saved<br />
                          <strong>ROI on Prepayment:</strong> ₹5L saves ₹6.3L → 126% effective return<br />
                          <strong>Insight:</strong> Prepayment gives better return than most investments<br />
                          <strong>Tip:</strong> Prepay high-interest loans before investing elsewhere
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Loan Optimization</p>
                        <p className="text-sm">
                          <strong>Vikram's Strategy:</strong> ₹30L loan at 9%, 20 years, prepaid ₹6L over 5 years<br />
                          <strong>Original Plan:</strong> ₹2,69,982 EMI for 20 years, ₹34,79,568 total interest<br />
                          <strong>With Prepayments:</strong> Reduced tenure to 12 years, ₹18,20,000 total interest<br />
                          <strong>Interest Saved:</strong> ₹16,59,568 (48% reduction)<br />
                          <strong>Time Saved:</strong> 8 years earlier (finished loan at year 12)<br />
                          <strong>Success:</strong> Used bonus and savings for prepayments - became debt-free much faster
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Prepay early in loan tenure when interest component is highest - maximum savings</li>
                      <li>Reduce tenure option saves more interest than reduce EMI option</li>
                      <li>Calculate prepayment ROI - often better than investing surplus money</li>
                      <li>Keep 6 months EMI as emergency fund before aggressive prepayments</li>
                      <li>Check prepayment charges (usually 0-2%) - factor into savings calculation</li>
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

        {/* Basic Loan Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Loan amount"
            value={loanAmount}
            onChange={setLoanAmount}
            min={100}
            max={1000000000}
            step={100}
            prefix={symbol}
            placeholder="1000000"
          />

          <CalculatorInput
            label="Interest Rate (p.a)"
            value={interestRate}
            onChange={setInterestRate}
            min={0}
            max={30}
            step={0.1}
            suffix="%"
            placeholder="6.5"
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
                  {monthsCompleted > 0 ? formatCurrency(actualRemainingBalance) : formatCurrency(loanAmount)}
                </p>
                <p className="text-xs text-blue-600">
                  {monthsCompleted > 0 ? `After ${monthsCompleted} EMI payments` : 'Original loan amount'}
                </p>
              </div>

              <CalculatorInput
                label="Override Remaining Amount (optional)"
                value={remainingLoanAmount}
                onChange={setRemainingLoanAmount}
                min={0}
                max={loanAmount}
                step={10000}
                prefix={symbol}
                placeholder="Leave empty to use calculated balance"
              />

              <CalculatorInput
                label="Prepayment amount (optional)"
                value={prepaymentAmount}
                onChange={setPrepaymentAmount}
                min={0}
                max={calculateRemainingBalance(result, monthsCompleted)}
                step={100}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            className="w-full gap-2 h-12 text-base font-semibold"
            size="lg"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="w-5 h-5" />
            Save Calculation
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/10"
            size="lg"
            onClick={() => setShareModalOpen(true)}
          >
            <Share2 className="w-5 h-5" />
            Export & Share Report
          </Button>
        </div>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="emi"
        inputs={{
          loanAmount,
          interestRate,
          tenureYears,
          tenureMonths,
          processingFee,
          monthsCompleted,
          remainingLoanAmount,
          prepaymentAmount,
          prepaymentOption,
          prepaymentChargeType,
          prepaymentChargeValue
        }}
        results={{
          emi: result.emi,
          totalInterest: result.totalInterest,
          totalPayment: result.totalPayment,
          principal: result.principal,
          ...(prepaymentEnabled && 'interestSaved' in result && {
            interestSaved: result.interestSaved,
            prepaymentAmount: result.prepaymentAmount,
            prepaymentCharges: result.prepaymentCharges || 0,
            netPrepaymentAmount: result.netPrepaymentAmount || 0,
            tenureReduced: result.tenureReduced || 0
          })
        }}
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Loan EMI & Amortization Report"
        inputs={[
          { label: "Loan Amount", value: formatCurrency(loanAmount) },
          { label: "Interest Rate (p.a)", value: `${interestRate}%` },
          { label: "Loan Tenure", value: `${tenureYears}y ${tenureMonths}m` },
          ...(processingFee > 0 ? [{ label: "Processing Fee", value: formatCurrency(result.processingFees) }] : []),
        ]}
        results={[
          { label: "Principal Loan Amount", value: formatCurrency(result.principal) },
          { label: "Total Interest Payable", value: formatCurrency(result.totalInterest) },
          { label: "Monthly EMI", value: formatCurrency(result.emi), isHighlight: true },
          { label: "Total Payment", value: formatCurrency(result.totalPayment) },
        ]}
        analysis={[
          ...(prepaymentEnabled && 'interestSaved' in result && result.prepaymentAmount > 0 ? [{
            title: "🎉 Loan Prepayment Benefit Analysis",
            items: [
              { label: "Prepayment Amount", value: formatCurrency(result.prepaymentAmount) },
              { label: "Interest Amount Saved", value: formatCurrency(result.interestSaved), isHighlight: true },
              ...(result.tenureReduced ? [{ label: "Tenure Reduced", value: `${result.tenureReduced} Months` }] : []),
            ]
          }] : [])
        ]}
        isLoanSchedule={true}
        scheduleTitle="EMI Amortization Schedule"
        scheduleHeaders={{ period: "Month", invested: "Principal Paid", interest: "Interest Paid", balance: "Outstanding Balance" }}
        schedule={generateAmortizationSchedule().map((item) => ({
          period: `Month ${item.month}`,
          invested: Math.round(item.principalPayment),
          interest: Math.round(item.interestPayment),
          total: Math.round(item.balance),
        }))}
      />
    </div>
  );
};

export default EMICalculator;
