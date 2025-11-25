import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Calculator, Eye, EyeOff, Info } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import { calculateSWP } from "@/lib/calculations";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SWPCalculator = () => {
  const { formatAmount, symbol } = useCurrency();
  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [withdrawalPerMonth, setWithdrawalPerMonth] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState<number | undefined>(10);
  const [inflationRate, setInflationRate] = useState(0);
  const [withdrawalStartsThisMonth, setWithdrawalStartsThisMonth] =
    useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const result = calculateSWP(
    investmentAmount,
    withdrawalPerMonth,
    expectedReturn,
    years,
    inflationRate,
    withdrawalStartsThisMonth,
  );

  const handleReset = () => {
    setInvestmentAmount(1000000);
    setWithdrawalPerMonth(10000);
    setExpectedReturn(12);
    setYears(10);
    setInflationRate(0);
    setWithdrawalStartsThisMonth(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              SWP Calculator
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
                  <DialogTitle>About SWP & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      What is SWP?
                    </h3>
                    <p className="text-muted-foreground">
                      Systematic Withdrawal Plan (SWP) is an investment strategy
                      where you withdraw a fixed amount regularly (usually
                      monthly) from your investment corpus. SWP helps you create
                      a regular income stream from your investments, ideal for
                      retirees or those seeking regular cash flow.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Benefits of SWP
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        <strong>Regular Income:</strong> Provides steady monthly
                        cash flow
                      </li>
                      <li>
                        <strong>Tax Efficiency:</strong> Only capital gains are
                        taxable, not the principal
                      </li>
                      <li>
                        <strong>Flexibility:</strong> Adjust withdrawal amount
                        or stop anytime
                      </li>
                      <li>
                        <strong>Remaining Corpus Grows:</strong> Unwithdrawn
                        amount continues to earn returns
                      </li>
                      <li>
                        <strong>Discipline:</strong> Helps manage expenses and
                        withdrawals systematically
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      How SWP Works
                    </h3>
                    <p className="text-muted-foreground">
                      In SWP, you invest a lump sum amount and then withdraw a
                      fixed amount every month. The remaining corpus continues
                      to grow at the expected return rate. The SWP duration
                      depends on your withdrawal amount, expected returns, and
                      initial investment. Higher withdrawal amounts or lower
                      returns reduce the duration.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Important Points
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>SWP is subject to market risks - returns may vary</li>
                      <li>
                        Withdrawal amount should be sustainable based on corpus
                        and expected returns
                      </li>
                      <li>Higher withdrawal rates deplete corpus faster</li>
                      <li>
                        Consider inflation when setting withdrawal amounts
                      </li>
                      <li>
                        Tax implications depend on holding period (short-term vs
                        long-term capital gains)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Calculator Features
                    </h3>
                    <p className="text-muted-foreground">
                      The SWP calculator helps you estimate how long your
                      investment corpus will last with regular withdrawals.
                      Enter your investment amount, monthly withdrawal, expected
                      return, and optionally inflation rate to see the projected
                      corpus duration and remaining balance over time.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Examples to Understand Better
                    </h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Example 1: Monthly Withdrawal Scenario
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Corpus = ₹50,00,000,
                          Withdraw ₹50,000/month, 10% annual return
                          <br />
                          <strong>Calculation:</strong> Withdrawal rate = 12%
                          per year (₹6L from ₹50L)
                          <br />
                          <strong>Result:</strong> Corpus lasts approximately
                          11-12 years
                          <br />
                          <strong>Withdrawal Strategy:</strong> Withdraw 1% of
                          corpus monthly
                          <br />
                          <strong>Tip:</strong> Keep withdrawal rate below
                          return rate to preserve corpus
                          <br />
                          <strong>Safety:</strong> At 8% withdrawal rate, corpus
                          can last 15+ years
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Example 2: Retirement Income Planning
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Retire at 60, need
                          ₹80,000/month, corpus = ₹2 crores, 12% return
                          <br />
                          <strong>Withdrawal Rate:</strong> 4.8% per year (₹9.6L
                          from ₹2Cr)
                          <br />
                          <strong>Duration:</strong> Corpus can sustain for 25+
                          years (till age 85+)
                          <br />
                          <strong>Corpus Growth:</strong> Even with withdrawals,
                          corpus grows for first 10-15 years
                          <br />
                          <strong>Safety:</strong> Conservative 4% rule ensures
                          corpus lasts retirement period
                          <br />
                          <strong>Planning:</strong> Build larger corpus if you
                          want higher monthly income
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Example 3: Corpus Duration Calculation
                        </p>
                        <p className="text-sm">
                          <strong>Situation A:</strong> ₹1 crore,
                          ₹1,00,000/month withdrawal, 10% return → Lasts 9 years
                          <br />
                          <strong>Situation B:</strong> ₹1 crore, ₹50,000/month
                          withdrawal, 10% return → Lasts 20 years
                          <br />
                          <strong>Insight:</strong> Halving withdrawal doubles
                          corpus duration
                          <br />
                          <strong>Reason:</strong> Lower withdrawal allows
                          corpus to grow while being used
                          <br />
                          <strong>Strategy:</strong> Withdraw conservatively to
                          make corpus last longer
                          <br />
                          <strong>Rule of Thumb:</strong> 4% annual withdrawal
                          (0.33% monthly) is safe for 30+ years
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Example 4: Inflation-Adjusted Withdrawals
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹1 crore corpus,
                          ₹60,000/month, 6% inflation, 12% return
                          <br />
                          <strong>Year 1:</strong> Withdraw ₹60,000/month,
                          corpus grows to ₹1.03 crores
                          <br />
                          <strong>Year 5:</strong> Withdraw ₹80,000/month
                          (inflation-adjusted), corpus = ₹95 lakhs
                          <br />
                          <strong>Year 10:</strong> Withdraw ₹1,07,000/month,
                          corpus depleting faster
                          <br />
                          <strong>Result:</strong> Corpus lasts 14 years (vs 18
                          years without inflation)
                          <br />
                          <strong>Planning:</strong> Factor inflation - ₹60,000
                          today = ₹1.07 lakhs in 10 years
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                      Pro Tips
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>
                        Follow 4% rule: Withdraw 4% of corpus annually for 30+
                        year sustainability
                      </li>
                      <li>
                        Start with lower withdrawal rate if corpus is new - let
                        it grow first
                      </li>
                      <li>
                        Consider inflation when planning - monthly needs
                        increase over time
                      </li>
                      <li>
                        Keep some corpus in liquid funds for immediate needs -
                        avoid forced selling
                      </li>
                      <li>
                        Review withdrawal rate annually based on returns and
                        remaining corpus
                      </li>
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
        <p className="text-sm text-muted-foreground">
          Systematic Withdrawal Plan - Calculate how long your investment will
          last with regular withdrawals
        </p>

        <CalculatorInput
          label="Total investment"
          value={investmentAmount}
          onChange={setInvestmentAmount}
          min={100000}
          max={1000000000}
          step={10000}
          prefix={symbol}
        />

        <CalculatorInput
          label="Withdrawal per month"
          value={withdrawalPerMonth}
          onChange={setWithdrawalPerMonth}
          min={1000}
          max={1000000}
          step={1000}
          prefix={symbol}
        />

        <CalculatorInput
          label="Expected return rate (p.a)"
          value={expectedReturn}
          onChange={setExpectedReturn}
          min={0}
          max={100}
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
          max={50}
          step={0.1}
          suffix="% p.a."
          placeholder="0"
        />

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="withdrawal-starts" className="text-sm font-medium">
              Withdrawal starts this month
            </Label>
            <Switch
              id="withdrawal-starts"
              checked={withdrawalStartsThisMonth}
              onCheckedChange={setWithdrawalStartsThisMonth}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            If enabled, withdrawal happens first, then interest is calculated on
            remaining balance
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">SWP Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">
                Initial Investment
              </span>
              <span className="font-semibold text-foreground">
                {formatAmount(result.invested)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Total Investment
              </span>
              <span className="font-semibold text-foreground">
                {formatAmount(result.invested)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Total Withdrawn
              </span>
              <span className="font-semibold text-foreground">
                {formatAmount(result.totalWithdrawn)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Total Interest Earned
              </span>
              <span className="font-semibold text-foreground">
                {formatAmount(result.totalInterest)}
              </span>
            </div>
            <div
              className={`flex justify-between items-center py-3 border-t-2 ${result.finalBalance < 0 ? "border-destructive/20 bg-destructive/5" : "border-primary/20 bg-primary/5"} -mx-4 px-4 rounded`}
            >
              <span className="text-base font-semibold text-foreground">
                Final Balance (Nominal)
              </span>
              <span
                className={`text-xl font-bold ${result.finalBalance < 0 ? "text-destructive" : "text-primary"}`}
              >
                {formatAmount(result.finalBalance)}
              </span>
            </div>
          </div>

          <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
            {inflationRate > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">
                  Inflation-Adjusted Final Value
                </span>
                <span className="font-semibold text-foreground">
                  {formatAmount(result.inflationAdjustedFinalValue)}
                </span>
              </div>
            )}
            {result.depletionMonth && (
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Depletion Period
                </span>
                <span className="font-semibold text-foreground">
                  {result.depletionMonth} months
                </span>
              </div>
            )}
            {years && (
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Sustainable Monthly Withdrawal
                </span>
                <span className="font-semibold text-foreground">
                  {formatAmount(result.sustainableWithdrawal)}
                </span>
              </div>
            )}
          </div>
        </div>

        {result.finalBalance < 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: Your investment will be exhausted before the end of
              the period. Consider reducing monthly withdrawals.
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
                <DialogTitle>
                  Complete SWP Schedule ({result.fullAmortizationData.length}{" "}
                  months)
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto mt-4">
                <div className="min-w-[700px]">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[60px]">
                            Month
                          </TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[100px]">
                            Starting Balance
                          </TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[100px]">
                            Interest Earned
                          </TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[80px]">
                            Withdrawal
                          </TableHead>
                          <TableHead className="font-semibold text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 min-w-[100px]">
                            Ending Balance
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(showAllRows
                          ? result.fullAmortizationData
                          : result.fullAmortizationData.slice(0, 24)
                        ).map((row) => (
                          <TableRow
                            key={row.month}
                            className="hover:bg-muted/30"
                          >
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 font-medium">
                              {row.month}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2">
                              {formatAmount(row.startingBalance)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-green-600">
                              +{formatAmount(row.interestEarned)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 text-red-600">
                              -{formatAmount(row.withdrawal)}
                            </TableCell>
                            <TableCell
                              className={`text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-2 font-semibold ${row.endingBalance < 0 ? "text-destructive" : ""}`}
                            >
                              {formatAmount(row.endingBalance)}
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
        inputs={{
          investmentAmount,
          withdrawalPerMonth,
          expectedReturn,
          years,
          inflationRate,
          withdrawalStartsThisMonth: withdrawalStartsThisMonth ? 1 : 0,
        }}
        results={{
          invested: result.invested,
          totalWithdrawn: result.totalWithdrawn,
          totalInterest: result.totalInterest,
          finalBalance: result.finalBalance,
          inflationAdjustedFinalValue: result.inflationAdjustedFinalValue,
          sustainableWithdrawal: result.sustainableWithdrawal,
          depletionMonth: result.depletionMonth || 0,
        }}
      />
    </div>
  );
};

export default SWPCalculator;
