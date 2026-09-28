import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RotateCcw,
  Scale,
  Share2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import { useCurrency } from '@/hooks/useCurrency';

type FeeType = 'percentage' | 'flat';

const LoanComparison = () => {
  const { formatAmount, symbol } = useCurrency();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // 3rd Loan Toggle
  const [showLoan3, setShowLoan3] = useState(false);

  // Loan 1
  const [title1, setTitle1] = useState('Loan 1');
  const [amount1, setAmount1] = useState(3500000);
  const [rate1, setRate1] = useState(8.5);
  const [tenureYears1, setTenureYears1] = useState(20);
  const [tenureMonths1, setTenureMonths1] = useState(0);
  const [hasFee1, setHasFee1] = useState(false);
  const [feeType1, setFeeType1] = useState<FeeType>('percentage');
  const [feeValue1, setFeeValue1] = useState(0);
  const [feeIncludeGst1, setFeeIncludeGst1] = useState(false);

  // Loan 2
  const [title2, setTitle2] = useState('Loan 2');
  const [amount2, setAmount2] = useState(4000000);
  const [rate2, setRate2] = useState(9.2);
  const [tenureYears2, setTenureYears2] = useState(20);
  const [tenureMonths2, setTenureMonths2] = useState(0);
  const [hasFee2, setHasFee2] = useState(false);
  const [feeType2, setFeeType2] = useState<FeeType>('percentage');
  const [feeValue2, setFeeValue2] = useState(0);
  const [feeIncludeGst2, setFeeIncludeGst2] = useState(false);

  // Loan 3 (Optional)
  const [title3, setTitle3] = useState('Loan 3');
  const [amount3, setAmount3] = useState(3800000);
  const [rate3, setRate3] = useState(8.9);
  const [tenureYears3, setTenureYears3] = useState(20);
  const [tenureMonths3, setTenureMonths3] = useState(0);
  const [hasFee3, setHasFee3] = useState(false);
  const [feeType3, setFeeType3] = useState<FeeType>('percentage');
  const [feeValue3, setFeeValue3] = useState(0);
  const [feeIncludeGst3, setFeeIncludeGst3] = useState(false);

  const calculateLoan = (
    principal: number,
    rate: number,
    years: number,
    months: number,
    hasFee: boolean,
    feeType: FeeType,
    feeValue: number,
    feeIncludeGst: boolean,
    title: string,
    id: string
  ) => {
    const totalMonths = Math.max(1, (years || 0) * 12 + (months || 0));
    const monthlyRate = rate / (12 * 100);
    let emi = 0;
    if (monthlyRate === 0) {
      emi = principal / totalMonths;
    } else {
      emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    const totalPayment = emi * totalMonths;
    const totalInterest = Math.max(0, totalPayment - principal);

    const baseFee = hasFee
      ? feeType === 'percentage'
        ? (principal * (feeValue || 0)) / 100
        : feeValue || 0
      : 0;
    const gstAmount = hasFee && feeIncludeGst ? baseFee * 0.18 : 0;
    const totalFee = Math.round(baseFee + gstAmount);
    const totalOutflow = Math.round(totalPayment + totalFee);

    return {
      id,
      title: title.trim() || `Loan ${id}`,
      principal,
      rate,
      years: years || 0,
      months: months || 0,
      totalMonths,
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      baseFee: Math.round(baseFee),
      gstAmount: Math.round(gstAmount),
      totalFee,
      totalOutflow,
    };
  };

  const loan1 = useMemo(
    () =>
      calculateLoan(
        amount1,
        rate1,
        tenureYears1,
        tenureMonths1,
        hasFee1,
        feeType1,
        feeValue1,
        feeIncludeGst1,
        title1,
        '1'
      ),
    [
      amount1,
      rate1,
      tenureYears1,
      tenureMonths1,
      hasFee1,
      feeType1,
      feeValue1,
      feeIncludeGst1,
      title1,
    ]
  );

  const loan2 = useMemo(
    () =>
      calculateLoan(
        amount2,
        rate2,
        tenureYears2,
        tenureMonths2,
        hasFee2,
        feeType2,
        feeValue2,
        feeIncludeGst2,
        title2,
        '2'
      ),
    [
      amount2,
      rate2,
      tenureYears2,
      tenureMonths2,
      hasFee2,
      feeType2,
      feeValue2,
      feeIncludeGst2,
      title2,
    ]
  );

  const loan3 = useMemo(
    () =>
      calculateLoan(
        amount3,
        rate3,
        tenureYears3,
        tenureMonths3,
        hasFee3,
        feeType3,
        feeValue3,
        feeIncludeGst3,
        title3,
        '3'
      ),
    [
      amount3,
      rate3,
      tenureYears3,
      tenureMonths3,
      hasFee3,
      feeType3,
      feeValue3,
      feeIncludeGst3,
      title3,
    ]
  );

  const activeLoans = useMemo(() => {
    return showLoan3 ? [loan1, loan2, loan3] : [loan1, loan2];
  }, [showLoan3, loan1, loan2, loan3]);

  // Comparative Winner Insights
  const bestEmiLoan = useMemo(() => {
    return [...activeLoans].sort((a, b) => a.emi - b.emi)[0];
  }, [activeLoans]);

  const bestInterestLoan = useMemo(() => {
    return [...activeLoans].sort((a, b) => a.totalInterest - b.totalInterest)[0];
  }, [activeLoans]);

  const bestOutflowLoan = useMemo(() => {
    return [...activeLoans].sort((a, b) => a.totalOutflow - b.totalOutflow)[0];
  }, [activeLoans]);

  const worstOutflowLoan = useMemo(() => {
    return [...activeLoans].sort((a, b) => b.totalOutflow - a.totalOutflow)[0];
  }, [activeLoans]);

  const maxSavings = worstOutflowLoan.totalOutflow - bestOutflowLoan.totalOutflow;
  const hasAnyFees = activeLoans.some((l) => l.totalFee > 0);

  const handleReset = () => {
    setTitle1('Loan 1');
    setAmount1(3500000);
    setRate1(8.5);
    setTenureYears1(20);
    setTenureMonths1(0);
    setHasFee1(false);
    setFeeType1('percentage');
    setFeeValue1(0);
    setFeeIncludeGst1(false);

    setTitle2('Loan 2');
    setAmount2(4000000);
    setRate2(9.2);
    setTenureYears2(20);
    setTenureMonths2(0);
    setHasFee2(false);
    setFeeType2('percentage');
    setFeeValue2(0);
    setFeeIncludeGst2(false);

    setShowLoan3(false);
    setTitle3('Loan 3');
    setAmount3(3800000);
    setRate3(8.9);
    setTenureYears3(20);
    setTenureMonths3(0);
    setHasFee3(false);
    setFeeType3('percentage');
    setFeeValue3(0);
    setFeeIncludeGst3(false);
  };

  // Trade-off Insights formulated exclusively for the PDF Report
  const pdfTradeOffInsights = useMemo(() => {
    const items: { label: string; value: string; isHighlight?: boolean }[] = [];

    // Optimal recommendation
    items.push({
      label: 'Optimal Choice Recommendation',
      value: `✓ ${bestOutflowLoan.title} is the most cost-effective option overall.`,
      isHighlight: true,
    });

    // Cashflow vs Interest trade-off
    if (bestEmiLoan.id !== bestInterestLoan.id) {
      const emiDiff = Math.abs(loan1.emi - loan2.emi);
      const intDiff = Math.abs(loan1.totalInterest - loan2.totalInterest);
      items.push({
        label: 'Cashflow vs Total Wealth Trade-off',
        value: `${bestEmiLoan.title} has ${formatAmount(emiDiff)}/mo lower monthly EMI (easier on monthly cashflow), but ${bestInterestLoan.title} saves ${formatAmount(intDiff)} in total interest payments over the full loan tenure.`,
      });
    } else {
      items.push({
        label: 'Clear Financial Advantage',
        value: `${bestOutflowLoan.title} dominates across both monthly EMI (${formatAmount(bestEmiLoan.emi)}) and total interest payable (${formatAmount(bestInterestLoan.totalInterest)}).`,
      });
    }

    // Upfront Fees & Net Outflow impact
    if (hasAnyFees) {
      items.push({
        label: 'Upfront Fees & Total Outflow',
        value: `Factoring in processing fees and applicable taxes, ${bestOutflowLoan.title} delivers the lowest net outflow of ${formatAmount(bestOutflowLoan.totalOutflow)}, saving ${formatAmount(maxSavings)} over the highest cost option.`,
      });
    }

    // Tenure analysis
    const uniqueTenures = new Set(activeLoans.map((l) => l.totalMonths));
    if (uniqueTenures.size > 1) {
      const shortest = [...activeLoans].sort((a, b) => a.totalMonths - b.totalMonths)[0];
      const longest = [...activeLoans].sort((a, b) => b.totalMonths - a.totalMonths)[0];
      const diffYrs = ((longest.totalMonths - shortest.totalMonths) / 12).toFixed(1);
      items.push({
        label: 'Tenure Horizon Impact',
        value: `${shortest.title} closes ${diffYrs} years earlier than ${longest.title}, drastically reducing compounded interest accrual over time.`,
      });
    }

    return items;
  }, [
    activeLoans,
    bestEmiLoan,
    bestInterestLoan,
    bestOutflowLoan,
    hasAnyFees,
    maxSavings,
    loan1,
    loan2,
    formatAmount,
  ]);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Compare Loans</h2>
              <p className="text-xs text-muted-foreground">
                Compare {showLoan3 ? '3 loans' : '2 loans'} side-by-side with interest, tenure & fees
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Input Cards Grid */}
        <div
          className={`grid grid-cols-1 ${
            showLoan3 ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'
          } gap-6`}
        >
          {/* LOAN 1 */}
          <div className="space-y-4 p-4 rounded-xl bg-card border border-border/70 shadow-xs">
            <div className="pb-2 border-b">
              <Label className="text-[11px] text-muted-foreground uppercase font-semibold">
                Loan 1 Name
              </Label>
              <Input
                value={title1}
                onChange={(e) => setTitle1(e.target.value)}
                placeholder="Loan 1 (e.g. SBI)"
                className="mt-1 font-bold text-primary text-base h-9 bg-muted/20 border-dashed focus:border-solid hover:bg-muted/40 transition-colors"
              />
            </div>

            <CalculatorInput
              label="Loan Amount"
              value={amount1}
              onChange={setAmount1}
              min={0}
              max={50000000}
              step={100000}
              prefix={symbol}
              placeholder="3500000"
            />

            <CalculatorInput
              label="Interest Rate (p.a)"
              value={rate1}
              onChange={setRate1}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              placeholder="8.5"
            />

            {/* Tenure in Years & Months */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-foreground">Tenure</Label>
                <span className="text-xs text-muted-foreground font-semibold">
                  {tenureYears1}Y {tenureMonths1 > 0 ? `${tenureMonths1}M` : ''} ({loan1.totalMonths} Mos)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Years</Label>
                  <Input
                    type="number"
                    min={0}
                    max={40}
                    value={tenureYears1 === 0 ? '' : tenureYears1}
                    onChange={(e) =>
                      setTenureYears1(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="h-10 text-sm font-semibold"
                    placeholder="Years"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Months</Label>
                  <Input
                    type="number"
                    min={0}
                    max={11}
                    value={tenureMonths1 === 0 ? '' : tenureMonths1}
                    onChange={(e) =>
                      setTenureMonths1(
                        Math.max(0, Math.min(11, parseInt(e.target.value) || 0))
                      )
                    }
                    className="h-10 text-sm font-semibold"
                    placeholder="Months"
                  />
                </div>
              </div>
            </div>

            {/* Toggle Processing Fee */}
            <div className="p-3 bg-muted/20 rounded-lg border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="toggle-fee-1"
                    className="text-xs font-semibold text-foreground cursor-pointer"
                  >
                    Processing Fee (Optional)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Add upfront bank charges & GST
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasFee1 && loan1.totalFee > 0 && (
                    <span className="text-xs font-bold text-primary">
                      {formatAmount(loan1.totalFee)}
                    </span>
                  )}
                  <Switch
                    id="toggle-fee-1"
                    checked={hasFee1}
                    onCheckedChange={setHasFee1}
                  />
                </div>
              </div>

              {hasFee1 && (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Select
                        value={feeType1}
                        onValueChange={(val: FeeType) => setFeeType1(val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">% of Loan</SelectItem>
                          <SelectItem value="flat">Flat ({symbol})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min={0}
                        step={feeType1 === 'percentage' ? 0.1 : 1000}
                        value={feeValue1 === 0 ? '' : feeValue1}
                        onChange={(e) =>
                          setFeeValue1(Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        placeholder={
                          feeType1 === 'percentage' ? 'e.g. 0.5' : 'e.g. 10000'
                        }
                        className="h-9 text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="gst-1"
                        checked={feeIncludeGst1}
                        onCheckedChange={setFeeIncludeGst1}
                      />
                      <Label
                        htmlFor="gst-1"
                        className="text-[11px] text-muted-foreground cursor-pointer"
                      >
                        Add 18% GST {loan1.gstAmount > 0 ? `(+${formatAmount(loan1.gstAmount)})` : ''}
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LOAN 2 */}
          <div className="space-y-4 p-4 rounded-xl bg-card border border-border/70 shadow-xs">
            <div className="pb-2 border-b">
              <Label className="text-[11px] text-muted-foreground uppercase font-semibold">
                Loan 2 Name
              </Label>
              <Input
                value={title2}
                onChange={(e) => setTitle2(e.target.value)}
                placeholder="Loan 2 (e.g. HDFC)"
                className="mt-1 font-bold text-primary text-base h-9 bg-muted/20 border-dashed focus:border-solid hover:bg-muted/40 transition-colors"
              />
            </div>

            <CalculatorInput
              label="Loan Amount"
              value={amount2}
              onChange={setAmount2}
              min={0}
              max={50000000}
              step={100000}
              prefix={symbol}
              placeholder="4000000"
            />

            <CalculatorInput
              label="Interest Rate (p.a)"
              value={rate2}
              onChange={setRate2}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              placeholder="9.2"
            />

            {/* Tenure in Years & Months */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-foreground">Tenure</Label>
                <span className="text-xs text-muted-foreground font-semibold">
                  {tenureYears2}Y {tenureMonths2 > 0 ? `${tenureMonths2}M` : ''} ({loan2.totalMonths} Mos)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Years</Label>
                  <Input
                    type="number"
                    min={0}
                    max={40}
                    value={tenureYears2 === 0 ? '' : tenureYears2}
                    onChange={(e) =>
                      setTenureYears2(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="h-10 text-sm font-semibold"
                    placeholder="Years"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Months</Label>
                  <Input
                    type="number"
                    min={0}
                    max={11}
                    value={tenureMonths2 === 0 ? '' : tenureMonths2}
                    onChange={(e) =>
                      setTenureMonths2(
                        Math.max(0, Math.min(11, parseInt(e.target.value) || 0))
                      )
                    }
                    className="h-10 text-sm font-semibold"
                    placeholder="Months"
                  />
                </div>
              </div>
            </div>

            {/* Toggle Processing Fee */}
            <div className="p-3 bg-muted/20 rounded-lg border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="toggle-fee-2"
                    className="text-xs font-semibold text-foreground cursor-pointer"
                  >
                    Processing Fee (Optional)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Add upfront bank charges & GST
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasFee2 && loan2.totalFee > 0 && (
                    <span className="text-xs font-bold text-primary">
                      {formatAmount(loan2.totalFee)}
                    </span>
                  )}
                  <Switch
                    id="toggle-fee-2"
                    checked={hasFee2}
                    onCheckedChange={setHasFee2}
                  />
                </div>
              </div>

              {hasFee2 && (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Select
                        value={feeType2}
                        onValueChange={(val: FeeType) => setFeeType2(val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">% of Loan</SelectItem>
                          <SelectItem value="flat">Flat ({symbol})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min={0}
                        step={feeType2 === 'percentage' ? 0.1 : 1000}
                        value={feeValue2 === 0 ? '' : feeValue2}
                        onChange={(e) =>
                          setFeeValue2(Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        placeholder={
                          feeType2 === 'percentage' ? 'e.g. 0.5' : 'e.g. 10000'
                        }
                        className="h-9 text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="gst-2"
                        checked={feeIncludeGst2}
                        onCheckedChange={setFeeIncludeGst2}
                      />
                      <Label
                        htmlFor="gst-2"
                        className="text-[11px] text-muted-foreground cursor-pointer"
                      >
                        Add 18% GST {loan2.gstAmount > 0 ? `(+${formatAmount(loan2.gstAmount)})` : ''}
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LOAN 3 (Optional) */}
          {showLoan3 && (
            <div className="space-y-4 p-4 rounded-xl bg-card border border-primary/40 shadow-xs relative">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex-1 mr-2">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Loan 3 Name
                  </Label>
                  <Input
                    value={title3}
                    onChange={(e) => setTitle3(e.target.value)}
                    placeholder="Loan 3 (e.g. ICICI)"
                    className="mt-1 font-bold text-primary text-base h-9 bg-muted/20 border-dashed focus:border-solid hover:bg-muted/40 transition-colors"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoan3(false)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 h-auto"
                  title="Remove 3rd Loan"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <CalculatorInput
                label="Loan Amount"
                value={amount3}
                onChange={setAmount3}
                min={0}
                max={50000000}
                step={100000}
                prefix={symbol}
                placeholder="3800000"
              />

              <CalculatorInput
                label="Interest Rate (p.a)"
                value={rate3}
                onChange={setRate3}
                min={0}
                max={30}
                step={0.1}
                suffix="%"
                placeholder="8.9"
              />

              {/* Tenure in Years & Months */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-foreground">Tenure</Label>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {tenureYears3}Y {tenureMonths3 > 0 ? `${tenureMonths3}M` : ''} ({loan3.totalMonths} Mos)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Years</Label>
                    <Input
                      type="number"
                      min={0}
                      max={40}
                      value={tenureYears3 === 0 ? '' : tenureYears3}
                      onChange={(e) =>
                        setTenureYears3(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="h-10 text-sm font-semibold"
                      placeholder="Years"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Months</Label>
                    <Input
                      type="number"
                      min={0}
                      max={11}
                      value={tenureMonths3 === 0 ? '' : tenureMonths3}
                      onChange={(e) =>
                        setTenureMonths3(
                          Math.max(0, Math.min(11, parseInt(e.target.value) || 0))
                        )
                      }
                      className="h-10 text-sm font-semibold"
                      placeholder="Months"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Processing Fee */}
              <div className="p-3 bg-muted/20 rounded-lg border border-border/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="toggle-fee-3"
                      className="text-xs font-semibold text-foreground cursor-pointer"
                    >
                      Processing Fee (Optional)
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Add upfront bank charges & GST
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasFee3 && loan3.totalFee > 0 && (
                      <span className="text-xs font-bold text-primary">
                        {formatAmount(loan3.totalFee)}
                      </span>
                    )}
                    <Switch
                      id="toggle-fee-3"
                      checked={hasFee3}
                      onCheckedChange={setHasFee3}
                    />
                  </div>
                </div>

                {hasFee3 && (
                  <div className="pt-2 border-t border-border/50 space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-2">
                        <Select
                          value={feeType3}
                          onValueChange={(val: FeeType) => setFeeType3(val)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">% of Loan</SelectItem>
                            <SelectItem value="flat">Flat ({symbol})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          min={0}
                          step={feeType3 === 'percentage' ? 0.1 : 1000}
                          value={feeValue3 === 0 ? '' : feeValue3}
                          onChange={(e) =>
                            setFeeValue3(Math.max(0, parseFloat(e.target.value) || 0))
                          }
                          placeholder={
                            feeType3 === 'percentage' ? 'e.g. 0.5' : 'e.g. 10000'
                          }
                          className="h-9 text-xs font-semibold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="gst-3"
                          checked={feeIncludeGst3}
                          onCheckedChange={setFeeIncludeGst3}
                        />
                        <Label
                          htmlFor="gst-3"
                          className="text-[11px] text-muted-foreground cursor-pointer"
                        >
                          Add 18% GST {loan3.gstAmount > 0 ? `(+${formatAmount(loan3.gstAmount)})` : ''}
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3rd Loan Add Button */}
        {!showLoan3 && (
          <div className="text-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLoan3(true)}
              className="gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4" />
              Add 3rd Loan to Compare
            </Button>
          </div>
        )}
      </Card>

      {/* Comparison Results Card */}
      <Card className="p-6 space-y-5 shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">Comparison Results</h3>
          <span className="text-xs text-muted-foreground font-medium">
            Comparing {activeLoans.length} Options
          </span>
        </div>

        {/* Column Headers Row (Clear Column Identifiers) */}
        <div
          className={`grid ${
            activeLoans.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
          } gap-3 p-3 bg-muted/40 rounded-xl border border-border/60 text-center`}
        >
          {activeLoans.map((l) => {
            const isOverallWinner = bestOutflowLoan.id === l.id;
            return (
              <div key={l.id} className="space-y-0.5 min-w-0">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {l.title}
                  </span>
                  {isOverallWinner && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-semibold shrink-0">
                      ★ Best
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {l.rate}% | {l.years}Y{l.months > 0 ? ` ${l.months}M` : ''}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {/* Monthly EMI */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-3">
              Monthly EMI
            </p>
            <div
              className={`grid ${
                activeLoans.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              } gap-3`}
            >
              {activeLoans.map((l) => {
                const isBest = bestEmiLoan.id === l.id;
                return (
                  <div
                    key={l.id}
                    className={`text-center p-3 rounded-lg transition-all ${
                      isBest
                        ? 'bg-green-500/10 border-2 border-green-500 shadow-xs'
                        : 'bg-card border border-border/50'
                    }`}
                  >
                    <span className="block text-[11px] text-muted-foreground font-medium mb-0.5 truncate">
                      {l.title}
                    </span>
                    <p
                      className={`text-lg sm:text-xl font-bold truncate ${
                        isBest
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground'
                      }`}
                    >
                      {formatAmount(l.emi)}
                    </p>
                    {isBest && (
                      <span className="text-[10px] text-green-700 dark:text-green-300 font-semibold block mt-0.5">
                        Lowest EMI
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {activeLoans.length === 2 && (
              <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
                Difference: {formatAmount(Math.abs(loan1.emi - loan2.emi))} / month
              </p>
            )}
          </div>

          {/* Total Interest */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-3">
              Total Interest Payable
            </p>
            <div
              className={`grid ${
                activeLoans.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              } gap-3`}
            >
              {activeLoans.map((l) => {
                const isBest = bestInterestLoan.id === l.id;
                return (
                  <div
                    key={l.id}
                    className={`text-center p-3 rounded-lg transition-all ${
                      isBest
                        ? 'bg-green-500/10 border-2 border-green-500 shadow-xs'
                        : 'bg-card border border-border/50'
                    }`}
                  >
                    <span className="block text-[11px] text-muted-foreground font-medium mb-0.5 truncate">
                      {l.title}
                    </span>
                    <p
                      className={`text-base sm:text-lg font-bold truncate ${
                        isBest
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground'
                      }`}
                    >
                      {formatAmount(l.totalInterest)}
                    </p>
                    {isBest && (
                      <span className="text-[10px] text-green-700 dark:text-green-300 font-semibold block mt-0.5">
                        Lowest Interest
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {activeLoans.length === 2 && (
              <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
                Difference: {formatAmount(Math.abs(loan1.totalInterest - loan2.totalInterest))}
              </p>
            )}
          </div>

          {/* Processing Fees (Shown if any loan has fee > 0) */}
          {hasAnyFees && (
            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-3">
                Processing Fees & Taxes
              </p>
              <div
                className={`grid ${
                  activeLoans.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
                } gap-3`}
              >
                {activeLoans.map((l) => {
                  const lowestFee = [...activeLoans].sort(
                    (a, b) => a.totalFee - b.totalFee
                  )[0];
                  const isLowest = lowestFee.id === l.id;
                  return (
                    <div
                      key={l.id}
                      className={`text-center p-3 rounded-lg ${
                        isLowest
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-card border border-border/50'
                      }`}
                    >
                      <span className="block text-[11px] text-muted-foreground font-medium mb-0.5 truncate">
                        {l.title}
                      </span>
                      <p className="text-base font-bold text-foreground truncate">
                        {formatAmount(l.totalFee)}
                      </p>
                      {l.gstAmount > 0 && (
                        <span className="text-[10px] text-muted-foreground block">
                          incl. 18% GST
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total Payment / Outflow */}
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-4 rounded-xl border-2 border-primary/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-3">
              Total Net Outflow{' '}
              {hasAnyFees
                ? '(Principal + Interest + Fees)'
                : '(Principal + Interest)'}
            </p>
            <div
              className={`grid ${
                activeLoans.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              } gap-3`}
            >
              {activeLoans.map((l) => {
                const isBest = bestOutflowLoan.id === l.id;
                return (
                  <div
                    key={l.id}
                    className={`text-center p-3 rounded-lg transition-all ${
                      isBest
                        ? 'bg-green-500/15 border-2 border-green-500 shadow-sm'
                        : 'bg-card/80 border border-border/60'
                    }`}
                  >
                    <span className="block text-[11px] text-muted-foreground font-medium mb-0.5 truncate">
                      {l.title}
                    </span>
                    <p
                      className={`text-lg sm:text-xl font-bold truncate ${
                        isBest
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-primary'
                      }`}
                    >
                      {formatAmount(l.totalOutflow)}
                    </p>
                    {isBest && (
                      <span className="text-[10px] text-green-700 dark:text-green-300 font-semibold block mt-0.5">
                        ★ Most Economical
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-3">
              You save: {formatAmount(maxSavings)}
            </p>
          </div>

          {/* Recommendation Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              {bestOutflowLoan.title} is the better option overall
            </p>
          </div>

          {/* Action Buttons: Save to History & Export PDF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(true)}
              className="gap-2 font-semibold border-border hover:bg-muted text-foreground"
            >
              <Save className="w-4 h-4 text-primary" />
              Save Comparison
            </Button>
            <Button
              variant="default"
              onClick={() => setShareDialogOpen(true)}
              className="gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Export & Share Comparison PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Save to History Dialog */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="loancompare"
        inputs={{
          title1: loan1.title,
          amount1,
          rate1,
          tenure1: `${tenureYears1}Y ${tenureMonths1}M`,
          hasFee1,
          fee1: loan1.totalFee,
          title2: loan2.title,
          amount2,
          rate2,
          tenure2: `${tenureYears2}Y ${tenureMonths2}M`,
          hasFee2,
          fee2: loan2.totalFee,
          ...(showLoan3
            ? {
                title3: loan3.title,
                amount3,
                rate3,
                tenure3: `${tenureYears3}Y ${tenureMonths3}M`,
                hasFee3,
                fee3: loan3.totalFee,
              }
            : {}),
        }}
        results={{
          optimalOption: bestOutflowLoan.title,
          maxSavings,
          emi1: loan1.emi,
          emi2: loan2.emi,
          totalInterest1: loan1.totalInterest,
          totalInterest2: loan2.totalInterest,
          totalOutflow1: loan1.totalOutflow,
          totalOutflow2: loan2.totalOutflow,
          ...(showLoan3
            ? {
                emi3: loan3.emi,
                totalInterest3: loan3.totalInterest,
                totalOutflow3: loan3.totalOutflow,
              }
            : {}),
        }}
      />

      {/* Share / PDF Export Modal */}
      <ShareReportModal
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={
          showLoan3
            ? 'Side-by-Side 3-Way Loan Comparison Report'
            : 'Side-by-Side Dual Loan Comparison Report'
        }
        inputs={[
          {
            label: `${loan1.title} Principal`,
            value: formatAmount(amount1),
          },
          {
            label: `${loan1.title} Rate & Tenure`,
            value: `${rate1}% | ${tenureYears1} Yrs ${
              tenureMonths1 > 0 ? `${tenureMonths1} Mos ` : ''
            }(${loan1.totalMonths} Mos)`,
          },
          ...(loan1.totalFee > 0
            ? [
                {
                  label: `${loan1.title} Processing Fee`,
                  value: `${formatAmount(loan1.totalFee)} (${
                    feeType1 === 'percentage'
                      ? `${feeValue1}%`
                      : `Flat ${formatAmount(feeValue1)}`
                  }${feeIncludeGst1 ? ' + 18% GST' : ''})`,
                },
              ]
            : []),
          {
            label: `${loan2.title} Principal`,
            value: formatAmount(amount2),
          },
          {
            label: `${loan2.title} Rate & Tenure`,
            value: `${rate2}% | ${tenureYears2} Yrs ${
              tenureMonths2 > 0 ? `${tenureMonths2} Mos ` : ''
            }(${loan2.totalMonths} Mos)`,
          },
          ...(loan2.totalFee > 0
            ? [
                {
                  label: `${loan2.title} Processing Fee`,
                  value: `${formatAmount(loan2.totalFee)} (${
                    feeType2 === 'percentage'
                      ? `${feeValue2}%`
                      : `Flat ${formatAmount(feeValue2)}`
                  }${feeIncludeGst2 ? ' + 18% GST' : ''})`,
                },
              ]
            : []),
          ...(showLoan3
            ? [
                {
                  label: `${loan3.title} Principal`,
                  value: formatAmount(amount3),
                },
                {
                  label: `${loan3.title} Rate & Tenure`,
                  value: `${rate3}% | ${tenureYears3} Yrs ${
                    tenureMonths3 > 0 ? `${tenureMonths3} Mos ` : ''
                  }(${loan3.totalMonths} Mos)`,
                },
                ...(loan3.totalFee > 0
                  ? [
                      {
                        label: `${loan3.title} Processing Fee`,
                        value: `${formatAmount(loan3.totalFee)} (${
                          feeType3 === 'percentage'
                            ? `${feeValue3}%`
                            : `Flat ${formatAmount(feeValue3)}`
                        }${feeIncludeGst3 ? ' + 18% GST' : ''})`,
                      },
                    ]
                  : []),
              ]
            : []),
        ]}
        results={[
          {
            label: 'Optimal Choice Recommendation',
            value: `✓ ${bestOutflowLoan.title} saves ${formatAmount(maxSavings)} overall`,
            isHighlight: true,
          },
          {
            label: `${loan1.title} Monthly EMI`,
            value: formatAmount(loan1.emi),
          },
          {
            label: `${loan2.title} Monthly EMI`,
            value: formatAmount(loan2.emi),
          },
          ...(showLoan3
            ? [
                {
                  label: `${loan3.title} Monthly EMI`,
                  value: formatAmount(loan3.emi),
                },
              ]
            : []),
          {
            label: `${loan1.title} Total Interest`,
            value: formatAmount(loan1.totalInterest),
          },
          {
            label: `${loan2.title} Total Interest`,
            value: formatAmount(loan2.totalInterest),
          },
          ...(showLoan3
            ? [
                {
                  label: `${loan3.title} Total Interest`,
                  value: formatAmount(loan3.totalInterest),
                },
              ]
            : []),
          {
            label: `${loan1.title} Total Net Outflow`,
            value: formatAmount(loan1.totalOutflow),
          },
          {
            label: `${loan2.title} Total Net Outflow`,
            value: formatAmount(loan2.totalOutflow),
          },
          ...(showLoan3
            ? [
                {
                  label: `${loan3.title} Total Net Outflow`,
                  value: formatAmount(loan3.totalOutflow),
                },
              ]
            : []),
        ]}
        analysis={[
          {
            title: 'Side-by-Side Trade-Off & Decision Insights',
            items: pdfTradeOffInsights,
          },
        ]}
      />
    </div>
  );
};

export default LoanComparison;
