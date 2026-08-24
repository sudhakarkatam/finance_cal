import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, RotateCcw, Info, Share2 } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import DateRangeInput from '@/components/ui/DateRangeInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import { calculateCompoundInterest, calculateCompoundInterestFromMonthlyRupees, calculateCompoundInterestFromMonthlyRupeesWithDays } from '@/lib/calculations';
import { differenceInDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCurrency } from '@/hooks/useCurrency';

const CompoundInterest = () => {
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6);
  const [interestRateType, setInterestRateType] = useState<'percent-per-annum' | 'rupee-per-month'>('percent-per-annum');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [manualYears, setManualYears] = useState(5);
  const [manualMonths, setManualMonths] = useState(0);
  const [manualDays, setManualDays] = useState(0);
  const [frequency, setFrequency] = useState('1');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Convert date range to years, months, days for consistent calculation
  const dateRangeToYMD = (start: Date, end: Date) => {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastDayOfPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastDayOfPrevMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  const getTimeInYears = () => {
    if (startDate && endDate) {
      // Convert date range to years/months/days, then use same logic as manual input
      // This ensures consistent calculation regardless of input method
      const { years, months, days } = dateRangeToYMD(startDate, endDate);
      const compoundingFrequency = Number(frequency);

      // Vaddi Calculator Method: Use 360 days/year, 30 days/month convention
      // For yearly compounding: Hybrid method handles time internally (not needed here)
      // For other frequencies: Use pure compound with 360/30 convention

      if (compoundingFrequency === 12) {
        // Monthly compounding: use 360/30 convention (pure compound)
        const totalDays = (years * 360) + (months * 30) + days;
        return totalDays / 360;
      } else if (compoundingFrequency === 4) {
        // Quarterly compounding: use 360/30 convention (pure compound)
        const totalDays = (years * 360) + (months * 30) + days;
        return totalDays / 360;
      } else if (compoundingFrequency === 1) {
        // Yearly compounding: Hybrid method handles this internally
        // This function is only called for standard calculateCompoundInterest
        // For "rupee per month", use calculateCompoundInterestFromMonthlyRupeesWithDays
        // For "percent per annum", hybrid is not used - return time for standard formula
        const totalDays = (years * 360) + (months * 30) + days;
        return totalDays / 360;
      }

      // Default: use 360/30 convention
      const totalDays = (years * 360) + (months * 30) + days;
      return totalDays / 360;
    }
    // Vaddi Calculator Method: Use 360 days/year, 30 days/month convention for ALL frequencies
    // This matches Indian rural lending practices (https://interest-calculator.anreddy.in)
    // Convert years, months, days to total days using 360/30 convention
    const totalDays = (manualYears * 360) + (manualMonths * 30) + manualDays;

    // For all frequencies, use the same 360/30 convention
    // Time in years = totalDays / 360
    return totalDays / 360;
  };

  // Calculate result based on interest rate type
  const timeInYears = getTimeInYears();
  const result = useMemo(() => {
    const compoundingFrequency = Number(frequency);

    // For yearly compounding (frequency = 1), always use hybrid method to match Vaddi Calculator
    // This applies to both "percent per annum" and "rupee per month" inputs
    if (compoundingFrequency === 1 && (startDate && endDate || manualYears > 0 || manualMonths > 0 || manualDays > 0)) {
      // Use hybrid method: compound for whole years, simple for fractional period
      const getYMD = () => {
        if (startDate && endDate) {
          return dateRangeToYMD(startDate, endDate);
        }
        return { years: manualYears, months: manualMonths, days: manualDays };
      };

      const { years, months, days } = getYMD();
      const annualRate = interestRateType === 'rupee-per-month' ? rate * 12 : rate;

      if (years > 0) {
        // Step 1: Compound interest for whole years
        const amountAfterYears = principal * Math.pow(1 + annualRate / 100, years);

        // Step 2: Simple interest for fractional period using 360/30 convention
        const fractionalDays = (months * 30) + days;
        const fractionalTime = fractionalDays / 360;
        const simpleInterest = amountAfterYears * (annualRate / 100) * fractionalTime;
        const finalAmount = amountAfterYears + simpleInterest;

        return {
          interest: Math.round(finalAmount - principal),
          total: Math.round(finalAmount),
          principal: Math.round(principal),
        };
      } else {
        // For periods less than 1 year, use simple interest only with 360/30 convention
        const fractionalDays = (months * 30) + days;
        const fractionalTime = fractionalDays / 360;
        const simpleInterest = principal * (annualRate / 100) * fractionalTime;
        const finalAmount = principal + simpleInterest;

        return {
          interest: Math.round(simpleInterest),
          total: Math.round(finalAmount),
          principal: Math.round(principal),
        };
      }
    }

    // For other frequencies or when using standard calculateCompoundInterest
    if (interestRateType === 'rupee-per-month') {
      // For date-based calculations with custom days, use specialized function
      if (startDate && endDate) {
        const days = Math.max(0, differenceInDays(endDate, startDate));
        return calculateCompoundInterestFromMonthlyRupeesWithDays(
          principal,
          rate,
          days,
          compoundingFrequency,
          startDate,
          endDate
        );
      }
      // For manual time input, use the standard function
      return calculateCompoundInterestFromMonthlyRupees(
        principal,
        rate,
        timeInYears,
        compoundingFrequency
      );
    } else {
      // Use standard function for percent per annum (for non-yearly frequencies)
      return calculateCompoundInterest(principal, rate, timeInYears, compoundingFrequency);
    }
  }, [principal, rate, interestRateType, frequency, timeInYears, startDate, endDate, manualYears, manualMonths, manualDays]);

  // Calculate annual rate for display purposes (when rupee-per-month is selected)
  const annualRate = useMemo(() => {
    if (interestRateType === 'rupee-per-month') {
      // The input is percentage per month (e.g., 2 = 2% per month)
      // Annual rate = Monthly rate * 12 (e.g., 2% × 12 = 24% p.a.)
      return rate * 12;
    } else {
      // Percent per annum - use as is
      return rate;
    }
  }, [rate, interestRateType]);

  const frequencyOptions = [
    { value: '1', label: 'Yearly' },
    { value: '2', label: 'Half-Yearly' },
    { value: '4', label: 'Quarterly' },
    { value: '12', label: 'Monthly' },
  ];

  // Compute active YMD duration for display in reports and inputs
  const activeYMD = useMemo(() => {
    if (startDate && endDate) {
      return dateRangeToYMD(startDate, endDate);
    }
    return { years: manualYears, months: manualMonths, days: manualDays };
  }, [startDate, endDate, manualYears, manualMonths, manualDays]);

  const compoundSchedule = useMemo(() => {
    const totalTime = getTimeInYears();
    if (totalTime <= 0) return [];

    const totalPeriods = Math.max(1, Math.ceil(totalTime));
    const n = Number(frequency) || 1;
    const r = annualRate / 100;
    const rows = [];
    let prevAmount = principal;

    for (let i = 1; i <= totalPeriods; i++) {
      const isLast = i === totalPeriods;
      const timeForPeriod = isLast ? totalTime : i;
      
      let amount = 0;
      const compoundingFrequency = Number(frequency);

      // Use exact calculation for fractional period on last period
      if (compoundingFrequency === 1 && (startDate && endDate || manualYears > 0 || manualMonths > 0 || manualDays > 0)) {
        const effYears = Math.floor(timeForPeriod);
        const fraction = timeForPeriod - effYears;
        const compoundPart = principal * Math.pow(1 + r, effYears);
        amount = compoundPart * (1 + r * fraction);
      } else {
        amount = principal * Math.pow(1 + r / n, n * timeForPeriod);
      }

      const interestEarned = amount - principal;
      const periodLabel = isLast && totalTime % 1 !== 0
        ? `Final (${totalTime.toFixed(2)} Yrs)`
        : `Year ${i}`;

      const openingBalance = i === 1 ? principal : prevAmount;
      prevAmount = amount;

      rows.push({
        period: periodLabel,
        invested: Math.round(openingBalance),
        interest: Math.round(interestEarned),
        total: Math.round(amount),
      });
    }
    return rows;
  }, [principal, annualRate, frequency, manualYears, manualMonths, manualDays, startDate, endDate]);

  const handleReset = () => {
    setPrincipal(100000);
    setRate(6);
    setInterestRateType('percent-per-annum');
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
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Compound Interest Calculator</h2>
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
                  <DialogTitle>About Compound Interest & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Compound Interest?</h3>
                    <p className="text-muted-foreground">
                      Compound Interest is the interest calculated on the initial principal amount plus all accumulated interest from previous periods. It's often called "interest on interest" because you earn returns on both your original investment and previously earned interest, leading to exponential growth over time.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Compound Interest Formula</h3>
                    <p className="text-muted-foreground mb-2">
                      Compound Interest uses this formula:
                    </p>
                    <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded mb-2">
                      Amount = Principal × (1 + Rate/Frequency)^(Frequency × Time)<br />
                      Interest = Amount - Principal
                    </p>
                    <p className="text-muted-foreground">
                      Where: Rate = Annual interest rate, Frequency = Compounding periods per year, Time = Period in years
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Characteristics</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Exponential Growth:</strong> Interest grows exponentially over time</li>
                      <li><strong>Compounding Effect:</strong> Interest earns interest on itself</li>
                      <li><strong>Higher Returns:</strong> Better returns than simple interest for same rate and time</li>
                      <li><strong>Frequency Matters:</strong> More frequent compounding = higher returns</li>
                      <li><strong>Time is Powerful:</strong> Longer time periods dramatically increase returns</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Compounding Frequencies</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Yearly:</strong> Interest compounded once per year</li>
                      <li><strong>Half-Yearly:</strong> Interest compounded twice per year (every 6 months)</li>
                      <li><strong>Quarterly:</strong> Interest compounded 4 times per year (every 3 months) - Most common for FDs</li>
                      <li><strong>Monthly:</strong> Interest compounded 12 times per year (every month) - Highest returns</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      <strong>Note:</strong> More frequent compounding (monthly/quarterly) gives better returns than yearly compounding.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Basic Compound Interest</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Principal = ₹1,00,000, Rate = 8% p.a., Time = 5 years, Yearly compounding<br />
                          <strong>Year 1:</strong> ₹1,00,000 × 1.08 = ₹1,08,000 (₹8,000 interest)<br />
                          <strong>Year 2:</strong> ₹1,08,000 × 1.08 = ₹1,16,640 (₹8,640 interest - higher than year 1)<br />
                          <strong>Year 3:</strong> ₹1,16,640 × 1.08 = ₹1,25,971 (₹9,331 interest)<br />
                          <strong>Final Amount:</strong> ₹1,00,000 × (1.08)^5 = ₹1,46,933<br />
                          <strong>Total Interest:</strong> ₹46,933 (vs ₹40,000 with simple interest)<br />
                          <strong>Benefit:</strong> ₹6,933 extra due to compounding effect
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Compounding Frequency Impact</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹5,00,000 at 8% for 5 years<br />
                          <strong>Yearly Compounding:</strong> ₹5L × (1.08)^5 = ₹7,34,664 (Interest: ₹2,34,664)<br />
                          <strong>Quarterly Compounding:</strong> ₹5L × (1.02)^20 = ₹7,42,974 (Interest: ₹2,42,974)<br />
                          <strong>Monthly Compounding:</strong> ₹5L × (1.00667)^60 = ₹7,44,867 (Interest: ₹2,44,867)<br />
                          <strong>Difference:</strong> Monthly gives ₹10,203 more than yearly<br />
                          <strong>Insight:</strong> More frequent compounding = marginally higher returns<br />
                          <strong>Reality:</strong> Difference is small but adds up over long periods
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Power of Time - The 8th Wonder</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹1,00,000 at 10% compound interest<br />
                          <strong>10 Years:</strong> ₹2,59,374 (₹1,59,374 interest - doubles)<br />
                          <strong>20 Years:</strong> ₹6,72,750 (₹5,72,750 interest - 6.7x)<br />
                          <strong>30 Years:</strong> ₹17,44,940 (₹16,44,940 interest - 17.4x)<br />
                          <strong>Magic:</strong> Last 10 years earned ₹10,72,190 (more than first 20 years combined)<br />
                          <strong>Lesson:</strong> Time is the most powerful factor - start early for maximum benefit
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Compound vs Simple Interest Comparison</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹10,00,000 at 8% for 10 years<br />
                          <strong>Simple Interest:</strong> ₹10L + (₹10L × 0.08 × 10) = ₹18,00,000<br />
                          <strong>Compound Interest:</strong> ₹10L × (1.08)^10 = ₹21,58,925<br />
                          <strong>Difference:</strong> ₹3,58,925 more with compound interest (40% higher)<br />
                          <strong>Over 20 Years:</strong> Simple = ₹26L, Compound = ₹46,60,957 (₹20.6L difference)<br />
                          <strong>Insight:</strong> Gap widens dramatically with longer time periods
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Investment Scenario</p>
                        <p className="text-sm">
                          <strong>Neha's Investment:</strong> Invested ₹2,00,000 in fixed deposit at 7% compound interest (quarterly) for 10 years<br />
                          <strong>Calculation:</strong> ₹2L × (1.0175)^40 = ₹4,00,000 (approximately doubles)<br />
                          <strong>Interest Earned:</strong> ₹2,00,000<br />
                          <strong>vs Simple Interest:</strong> Would have been ₹3,40,000 (₹60,000 less)<br />
                          <strong>Strategy:</strong> Neha chose quarterly compounding FD for better returns<br />
                          <strong>Success:</strong> ₹2 lakhs became ₹4 lakhs through power of compounding
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Start early - even 5-10 extra years can double your final amount due to compounding</li>
                      <li>Choose higher compounding frequency when available - monthly is better than quarterly, which is better than yearly</li>
                      <li>Don't withdraw early - breaking compound interest cycle significantly reduces returns</li>
                      <li>For long-term goals, compound interest is essential - simple interest falls short</li>
                      <li>Time beats rate - 7% for 30 years beats 10% for 15 years due to compounding effect</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
          label="Principal amount"
          value={principal}
          onChange={setPrincipal}
          min={1000}
          max={10000000}
          step={1000}
          prefix={symbol}
        />

        <div className="space-y-3">
          <Label>Interest Rate is in</Label>
          <RadioGroup
            value={interestRateType}
            onValueChange={(value) => setInterestRateType(value as 'percent-per-annum' | 'rupee-per-month')}
            className="flex flex-wrap gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percent-per-annum" id="percent-per-annum" />
              <Label htmlFor="percent-per-annum" className="cursor-pointer font-normal">
                Percent per annum
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rupee-per-month" id="rupee-per-month" />
              <Label htmlFor="rupee-per-month" className="cursor-pointer font-normal">
                Rupee per month
              </Label>
            </div>
          </RadioGroup>
        </div>

        <CalculatorInput
          label={interestRateType === 'rupee-per-month' ? 'Interest Rate (% per month)' : 'Rate of Interest (p.a.)'}
          value={rate}
          onChange={setRate}
          min={0}
          max={interestRateType === 'rupee-per-month' ? 10 : 30}
          step={0.1}
          suffix="%"
          placeholder={interestRateType === 'rupee-per-month' ? '2.0' : '8.0'}
        />

        {interestRateType === 'rupee-per-month' && (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Equivalent Annual Rate:</strong> {annualRate.toFixed(2)}% p.a.
              <br />
              <span className="text-xs text-blue-700 dark:text-blue-300">
                ({rate.toFixed(2)}% per month × 12 = {annualRate.toFixed(2)}% per annum)
              </span>
            </p>
          </div>
        )}

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
        calculationType="compound"
        inputs={{
          principal,
          rate,
          interestRateType,
          annualRate: annualRate.toFixed(2),
          time: getTimeInYears(),
          frequency: Number(frequency)
        }}
        results={result}
        schedule={compoundSchedule}
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Compound Interest Calculation Statement"
        inputs={[
          { label: "Principal Investment", value: formatCurrency(principal) },
          { label: "Interest Rate", value: interestRateType === 'rupee-per-month' ? `₹${rate}/month (${annualRate.toFixed(1)}% p.a.)` : `${rate}% p.a.` },
          { label: "Compounding Frequency", value: frequency === '1' ? 'Annually' : frequency === '2' ? 'Semi-Annually' : frequency === '4' ? 'Quarterly' : 'Monthly' },
          { label: "Tenure Period", value: `${getTimeInYears().toFixed(2)} Years (${activeYMD.years}y ${activeYMD.months}m ${activeYMD.days}d)` },
        ]}
        results={[
          { label: "Principal Amount", value: formatCurrency(result.principal) },
          { label: "Total Compound Interest Earned", value: formatCurrency(result.interest) },
          { label: "Final Maturity Corpus", value: formatCurrency(result.total), isHighlight: true },
        ]}
        analysis={[
          {
            title: "📈 Compounding Growth & Yield Analysis",
            items: [
              { label: "Effective Annual Rate (EAR)", value: `${((Math.pow(1 + (annualRate / 100) / Number(frequency), Number(frequency)) - 1) * 100).toFixed(2)}% p.a.` },
              { label: "Wealth Growth Multiplier", value: `${(result.total / (result.principal || 1)).toFixed(2)}x` },
              { label: "Interest Share of Maturity", value: `${(((result.interest) / (result.total || 1)) * 100).toFixed(1)}% of total corpus`, isHighlight: true }
            ]
          }
        ]}
        scheduleTitle="Compound Interest Compounding Schedule"
        scheduleHeaders={{ period: "Period", invested: "Opening Principal", interest: "Interest Accumulated", balance: "Total Corpus" }}
        schedule={compoundSchedule}
      />
    </div>
  );
};

export default CompoundInterest;
