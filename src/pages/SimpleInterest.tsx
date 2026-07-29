import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Info, Share2 } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import DateRangeInput from "@/components/ui/DateRangeInput";
import ResultChart from "@/components/ui/ResultChart";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import { calculateSimpleInterest } from "@/lib/calculations";
import { useCurrency } from "@/hooks/useCurrency";
import { differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SimpleInterest = () => {
  const { formatAmount, symbol } = useCurrency();
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [manualYears, setManualYears] = useState(5);
  const [manualMonths, setManualMonths] = useState(0);
  const [manualDays, setManualDays] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const getTimeInYears = () => {
    // Vaddi Calculator Method: Use 360 days/year, 30 days/month convention
    // This matches Indian rural lending practices (https://interest-calculator.anreddy.in)
    if (startDate && endDate) {
      // Convert date range to years/months/days, then use 360/30 convention
      const { years, months, days } = dateRangeToYMD(startDate, endDate);
      const totalDays = (years * 360) + (months * 30) + days;
      return totalDays / 360;
    }
    // For manual input, use 360/30 convention
    // Formula: (years * 360 + months * 30 + days) / 360
    const totalDays = (manualYears * 360) + (manualMonths * 30) + manualDays;
    return totalDays / 360;
  };

  // Helper function to convert date range to years, months, days
  const dateRangeToYMD = (start: Date, end: Date) => {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastDayOfPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastDayOfPrevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  const result = calculateSimpleInterest(principal, rate, getTimeInYears());

  const simpleSchedule = useMemo(() => {
    const years = Math.max(1, Math.ceil(getTimeInYears()));
    const annualInterest = (principal * rate) / 100;
    const rows = [];

    for (let i = 1; i <= years; i++) {
      const interestEarned = Math.round(annualInterest * i);
      rows.push({
        period: `Year ${i}`,
        invested: Math.round(principal),
        interest: interestEarned,
        total: Math.round(principal + interestEarned),
      });
    }
    return rows;
  }, [principal, rate, manualYears, manualMonths, manualDays, startDate, endDate]);

  const handleReset = () => {
    setPrincipal(100000);
    setRate(6);
    setStartDate(undefined);
    setEndDate(undefined);
    setManualYears(5);
    setManualMonths(0);
    setManualDays(0);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pt-2">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Simple Interest Calculator
            </h2>
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
                  <DialogTitle>About Simple Interest & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Simple Interest?</h3>
                    <p className="text-muted-foreground">
                      Simple Interest is a straightforward method of calculating interest where interest is earned only on the principal amount (original investment or loan amount) and not on any previously earned interest. The interest remains constant for each period, making it easy to calculate and understand.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Simple Interest Formula</h3>
                    <p className="text-muted-foreground mb-2">
                      Simple Interest uses this formula:
                    </p>
                    <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded mb-2">
                      Simple Interest = Principal × Rate × Time<br />
                      Total Amount = Principal + Simple Interest
                    </p>
                    <p className="text-muted-foreground">
                      Where: Principal = Initial amount, Rate = Annual interest rate (as decimal), Time = Period in years
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Characteristics</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Linear Growth:</strong> Interest grows linearly over time</li>
                      <li><strong>No Compounding:</strong> Interest is not added back to principal</li>
                      <li><strong>Constant Interest:</strong> Same interest amount each period</li>
                      <li><strong>Easy Calculation:</strong> Simple multiplication formula</li>
                      <li><strong>Lower Returns:</strong> Generally lower than compound interest for same rate and time</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">When is Simple Interest Used?</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Short-term loans (car loans, personal loans often use simple interest)</li>
                      <li>Fixed deposits with simple interest (though compound is more common)</li>
                      <li>Savings accounts (some banks offer simple interest)</li>
                      <li>Bonds with fixed interest payments</li>
                      <li>Educational loans in some cases</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Basic Simple Interest</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Principal = ₹1,00,000, Rate = 6% p.a., Time = 3 years<br />
                          <strong>Calculation:</strong> Interest = ₹1,00,000 × 0.06 × 3 = ₹18,000<br />
                          <strong>Year 1 Interest:</strong> ₹6,000<br />
                          <strong>Year 2 Interest:</strong> ₹6,000 (same as year 1)<br />
                          <strong>Year 3 Interest:</strong> ₹6,000 (same each year)<br />
                          <strong>Total Amount:</strong> ₹1,00,000 + ₹18,000 = ₹1,18,000<br />
                          <strong>Insight:</strong> Interest remains constant each year - no growth on interest
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Short-Term Loan</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Borrow ₹5,00,000 at 12% simple interest for 2 years<br />
                          <strong>Annual Interest:</strong> ₹5,00,000 × 0.12 = ₹60,000/year<br />
                          <strong>Total Interest:</strong> ₹60,000 × 2 = ₹1,20,000<br />
                          <strong>Total Repayment:</strong> ₹5,00,000 + ₹1,20,000 = ₹6,20,000<br />
                          <strong>Monthly Payment:</strong> ₹6,20,000 ÷ 24 = ₹25,833/month<br />
                          <strong>Use Case:</strong> Common for short-term personal loans
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Simple vs Compound Interest</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹10,00,000 at 8% for 5 years<br />
                          <strong>Simple Interest:</strong> ₹10L × 0.08 × 5 = ₹4,00,000, Total = ₹14,00,000<br />
                          <strong>Compound Interest:</strong> ₹10L × (1.08)^5 = ₹14,69,328, Interest = ₹4,69,328<br />
                          <strong>Difference:</strong> ₹69,328 more with compound interest<br />
                          <strong>Insight:</strong> Longer time = bigger difference. Simple interest doesn't earn interest on interest<br />
                          <strong>When Simple is Better:</strong> For borrowers (if available), as total interest is lower
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Monthly Interest Calculation</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹2,00,000 at 6% simple interest for 6 months<br />
                          <strong>Time in Years:</strong> 6 months = 0.5 years<br />
                          <strong>Calculation:</strong> Interest = ₹2,00,000 × 0.06 × 0.5 = ₹6,000<br />
                          <strong>Monthly Interest:</strong> ₹6,000 ÷ 6 = ₹1,000/month<br />
                          <strong>Alternative Method:</strong> ₹2,00,000 × (6% ÷ 12) × 6 months = ₹6,000<br />
                          <strong>Tip:</strong> For months, divide annual rate by 12 and multiply by number of months
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Scenario</p>
                        <p className="text-sm">
                          <strong>Arjun's Car Loan:</strong> Bought car for ₹8,00,000, borrowed ₹6,00,000 at 10% simple interest for 3 years<br />
                          <strong>Total Interest:</strong> ₹6,00,000 × 0.10 × 3 = ₹1,80,000<br />
                          <strong>Total Payment:</strong> ₹6,00,000 + ₹1,80,000 = ₹7,80,000<br />
                          <strong>Monthly EMI:</strong> ₹7,80,000 ÷ 36 = ₹21,667/month<br />
                          <strong>Interest Rate:</strong> Simple interest kept loan affordable - knew exact cost upfront<br />
                          <strong>Benefit:</strong> Predictable payments, no surprise interest increases
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Simple interest is easier to understand - use it for quick calculations</li>
                      <li>For short-term periods (&lt; 1 year), simple and compound interest are similar</li>
                      <li>Simple interest favors borrowers - total interest is lower than compound interest</li>
                      <li>For long-term investments, compound interest typically gives better returns</li>
                      <li>Convert time to years: months ÷ 12, days ÷ 365 for accurate calculations</li>
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
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>

        <ResultChart principal={result.principal} returns={result.interest} />

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">
              Principal amount
            </span>
            <span className="font-semibold text-foreground">
              {formatAmount(result.principal)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Total interest
            </span>
            <span className="font-semibold text-primary">
              {formatAmount(result.interest)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">
              Total amount
            </span>
            <span className="text-xl font-bold text-primary">
              {formatAmount(result.total)}
            </span>
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
        calculationType="simple"
        inputs={{ principal, rate, time: getTimeInYears() }}
        results={result}
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Simple Interest Calculation Statement"
        inputs={[
          { label: "Principal Investment", value: formatAmount(principal) },
          { label: "Annual Interest Rate", value: `${rate}%` },
          { label: "Tenure Period", value: `${getTimeInYears().toFixed(2)} Years (${manualYears}y ${manualMonths}m ${manualDays}d)` },
        ]}
        results={[
          { label: "Principal Amount", value: formatAmount(result.principal) },
          { label: "Total Simple Interest Earned", value: formatAmount(result.interest) },
          { label: "Final Maturity Amount", value: formatAmount(result.total), isHighlight: true },
        ]}
        schedule={simpleSchedule}
      />
    </div>
  );
};

export default SimpleInterest;
