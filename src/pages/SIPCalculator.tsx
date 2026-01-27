import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  TrendingUp,
  Calculator,
  TrendingUp as TrendingUpIcon,
  Info,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import ResultChart from "@/components/ui/ResultChart";
import SaveDialog from "@/components/SaveDialog";
import {
  calculateSIP,
  calculateStepUpSIP,
  calculateInflationAdjustedSIP,
  calculateStepUpSIPWithComparison,
} from "@/lib/calculations";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SIPCalculator = () => {
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  // Basic SIP inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [months, setMonths] = useState(0);

  // Advanced features
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const calculateAdvancedSIP = () => {
    if (stepUpEnabled && stepUpPercentage > 0) {
      return calculateStepUpSIP(
        monthlyInvestment,
        expectedReturn,
        totalYears,
        stepUpPercentage,
      );
    }

    // Fallback to regular SIP calculation
    return calculateSIP(monthlyInvestment, expectedReturn, totalYears);
  };

  const totalYears = years + months / 12;

  const normalResult = useMemo(() => {
    return stepUpEnabled
      ? calculateAdvancedSIP()
      : calculateSIP(monthlyInvestment, expectedReturn, totalYears);
  }, [
    monthlyInvestment,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
  ]);

  const stepUpResult = useMemo(() => {
    return calculateStepUpSIP(
      monthlyInvestment,
      expectedReturn,
      totalYears,
      stepUpPercentage,
    );
  }, [monthlyInvestment, expectedReturn, totalYears, stepUpPercentage]);

  const comparisonResult = useMemo(() => {
    if (stepUpEnabled && stepUpPercentage > 0) {
      return calculateStepUpSIPWithComparison(
        monthlyInvestment,
        expectedReturn,
        totalYears,
        stepUpPercentage,
      );
    }
    return null;
  }, [
    monthlyInvestment,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
  ]);

  const result = useMemo(() => {
    if (!inflationEnabled) return normalResult;

    // Calculate inflation-adjusted result using inflation-adjusted return rate
    const inflationAdjustedResult = calculateInflationAdjustedSIP(
      monthlyInvestment,
      expectedReturn,
      totalYears,
      inflationRate,
      stepUpEnabled ? stepUpPercentage : 0,
    );

    // Return result with both normal and inflation-adjusted values
    return {
      ...inflationAdjustedResult,
      normalTotal: normalResult.total,
      inflationAdjustedTotal: inflationAdjustedResult.total,
      inflationRate: inflationRate,
    };
  }, [
    normalResult,
    inflationEnabled,
    inflationRate,
    monthlyInvestment,
    expectedReturn,
    totalYears,
    stepUpEnabled,
    stepUpPercentage,
  ]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setMonthlyInvestment(100000);
    setExpectedReturn(12);
    setYears(10);
    setMonths(0);
    setStepUpEnabled(false);
    setStepUpPercentage(10);
    setInflationEnabled(false);
    setInflationRate(6);
    setIsCalculated(false);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                SIP Calculator
              </h2>
              <p className="text-xs text-muted-foreground">
                Systematic Investment Plan
              </p>
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
                  <DialogTitle>About SIP & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      What is SIP?
                    </h3>
                    <p className="text-muted-foreground">
                      Systematic Investment Plan (SIP) is an investment strategy
                      where you invest a fixed amount regularly (usually
                      monthly) in mutual funds or other investment instruments.
                      SIP allows you to invest small amounts consistently over
                      time, helping you build wealth through the power of
                      compounding and rupee cost averaging.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Benefits of SIP
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        <strong>Rupee Cost Averaging:</strong> Buying more units
                        when prices are low and fewer when prices are high
                      </li>
                      <li>
                        <strong>Discipline:</strong> Encourages regular saving
                        and investing habits
                      </li>
                      <li>
                        <strong>Affordability:</strong> Start with small amounts
                        (as low as ₹500 per month)
                      </li>
                      <li>
                        <strong>Power of Compounding:</strong> Earn returns on
                        your returns over time
                      </li>
                      <li>
                        <strong>Flexibility:</strong> Increase, decrease, pause,
                        or stop SIP anytime
                      </li>
                      <li>
                        <strong>Long-term Wealth Creation:</strong> Ideal for
                        achieving long-term financial goals
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Step-Up SIP
                    </h3>
                    <p className="text-muted-foreground">
                      Step-Up SIP automatically increases your investment amount
                      every year by a fixed percentage. This helps you keep pace
                      with salary increments and inflation, accelerating your
                      wealth creation. For example, if you start with
                      ₹10,000/month and set a 10% step-up, your investment will
                      be ₹11,000/month in year 2, ₹12,100/month in year 3, and
                      so on.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      SIP Calculation
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      SIP uses the future value of annuity formula to calculate
                      returns:
                    </p>
                    <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded mb-2">
                      Future Value = P × [((1 + r)^n - 1) / r] × (1 + r)
                    </p>
                    <p className="text-muted-foreground">
                      Where: P = Monthly investment, r = Monthly return rate, n
                      = Number of months
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Important Points
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        SIP does not guarantee returns - market-linked
                        investments are subject to market risks
                      </li>
                      <li>
                        Longer investment periods generally provide better
                        results due to compounding
                      </li>
                      <li>
                        Choose SIP based on your risk appetite, financial goals,
                        and investment horizon
                      </li>
                      <li>Review and rebalance your portfolio periodically</li>
                      <li>
                        Consider inflation when setting expected returns for
                        real returns
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Calculator Features
                    </h3>
                    <p className="text-muted-foreground">
                      The SIP calculator helps you estimate the future value of
                      your systematic investments. You can calculate regular
                      SIP, step-up SIP, and inflation-adjusted returns to
                      understand both nominal and real returns. This helps you
                      plan your investments better and set realistic financial
                      goals.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Examples to Understand Better
                    </h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Example 1: Basic Monthly SIP
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invest ₹10,000/month for
                          10 years at 12% annual return
                          <br />
                          <strong>Total Invested:</strong> ₹10,000 × 12 × 10 =
                          ₹12,00,000
                          <br />
                          <strong>Calculation:</strong> Using compound interest
                          formula with monthly contributions
                          <br />
                          <strong>Maturity Value:</strong> Approximately
                          ₹23,00,000
                          <br />
                          <strong>Returns Earned:</strong> ₹11,00,000 (92% of
                          investment)
                          <br />
                          <strong>Benefit:</strong> Disciplined investing
                          creates wealth over time
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Example 2: Step-Up SIP Benefits
                        </p>
                        <p className="text-sm">
                          <strong>Regular SIP:</strong> ₹10,000/month for 20
                          years → ₹99,00,000 corpus
                          <br />
                          <strong>Step-Up SIP:</strong> Start ₹10,000, increase
                          10% yearly for 20 years → ₹1,45,00,000 corpus
                          <br />
                          <strong>Extra Investment:</strong> Step-up invests
                          ₹34,00,000 more
                          <br />
                          <strong>Extra Returns:</strong> ₹46,00,000 more corpus
                          (₹12 lakh extra gains)
                          <br />
                          <strong>Benefit:</strong> Step-up SIP accelerates
                          wealth creation with salary increments
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Example 3: Long-Term Wealth Creation
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹5,000/month SIP for 30
                          years at 12% return
                          <br />
                          <strong>Total Invested:</strong> ₹18,00,000
                          <br />
                          <strong>Final Corpus:</strong> ₹1,75,00,000 (₹1.75
                          crores)
                          <br />
                          <strong>Returns:</strong> ₹1,57,00,000 (8.7x the
                          investment)
                          <br />
                          <strong>Power of Compounding:</strong> Last 10 years
                          contributed ₹60 lakhs to final corpus
                          <br />
                          <strong>Lesson:</strong> Time is the most powerful
                          factor in wealth creation
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Example 4: Inflation-Adjusted Returns
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹20,000/month SIP, 12%
                          return, 6% inflation, 20 years
                          <br />
                          <strong>Nominal Corpus:</strong> ₹1,98,00,000
                          <br />
                          <strong>Real Value:</strong> ₹61,00,000
                          (inflation-adjusted purchasing power)
                          <br />
                          <strong>Insight:</strong> ₹1.98 crores sounds huge but
                          buys what ₹61 lakhs would today
                          <br />
                          <strong>Planning:</strong> Factor inflation to set
                          realistic retirement goals
                          <br />
                          <strong>Solution:</strong> Increase SIP amount
                          periodically to beat inflation
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Real-World Retirement Planning
                        </p>
                        <p className="text-sm">
                          <strong>Amit's Strategy:</strong> Started
                          ₹15,000/month SIP at age 30, step-up 10% yearly,
                          target ₹2 crores by age 60
                          <br />
                          <strong>Year 1-10:</strong> Invested ₹27,00,000, value
                          grew to ₹35,00,000
                          <br />
                          <strong>Year 11-20:</strong> SIP increased to
                          ₹39,000/month, corpus reached ₹1,15,00,000
                          <br />
                          <strong>Year 21-30:</strong> SIP at ₹1,00,000/month,
                          final corpus = ₹2,45,00,000
                          <br />
                          <strong>Success:</strong> Exceeded target by ₹45 lakhs
                          through step-up strategy
                          <br />
                          <strong>Key:</strong> Started early, stayed
                          disciplined, increased investments with income growth
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
                        Start SIP as early as possible - even ₹5,000/month can
                        build crores over 30 years
                      </li>
                      <li>
                        Enable step-up SIP to match salary increments -
                        accelerates wealth creation
                      </li>
                      <li>
                        Don't stop SIP during market downturns - you buy more
                        units at lower prices
                      </li>
                      <li>
                        Review and rebalance portfolio annually based on risk
                        appetite and goals
                      </li>
                      <li>
                        Consider inflation when setting return expectations -
                        12% nominal = 6% real (with 6% inflation)
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



        <div className="space-y-6">
          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Monthly Investment"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={0}
              max={10000000}
              step={500}
              prefix={symbol}
              placeholder="100000"
            />
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Expected Return (p.a)"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={0}
              max={100}
              step={0.1}
              suffix="%"
            />
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground">
                Investment Period
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CalculatorInput
                label="Years"
                value={years}
                onChange={setYears}
                min={0}
                max={40}
                step={1}
              />
              <CalculatorInput
                label="Months"
                value={months}
                onChange={setMonths}
                min={0}
                max={11}
                step={1}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Total period:{" "}
              <span className="font-semibold text-foreground">
                {totalYears.toFixed(1)} years
              </span>
            </div>
          </div>

          {/* Step-Up SIP */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="step-up" className="text-sm font-medium">
                Step-Up SIP
              </Label>
              <Switch
                id="step-up"
                checked={stepUpEnabled}
                onCheckedChange={setStepUpEnabled}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Increase your SIP amount automatically every year
            </p>
            {stepUpEnabled && (
              <CalculatorInput
                label="Annual Step-Up Percentage"
                value={stepUpPercentage}
                onChange={setStepUpPercentage}
                min={1}
                max={50}
                step={1}
                suffix="%"
              />
            )}
          </div>

          {/* Inflation Adjustment */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="inflation" className="text-sm font-medium">
                Inflation Adjustment
              </Label>
              <Switch
                id="inflation"
                checked={inflationEnabled}
                onCheckedChange={setInflationEnabled}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Account for inflation to see real returns (affects calculation)
            </p>
            {inflationEnabled && (
              <CalculatorInput
                label="Expected Inflation Rate (p.a)"
                value={inflationRate}
                onChange={setInflationRate}
                min={1}
                max={50}
                step={0.1}
                suffix="%"
              />
            )}
          </div>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
          onClick={handleCalculate}
        >
          <Calculator className="w-5 h-5" />
          Calculate SIP
        </Button>
      </Card>

      <Card className="p-6 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">
          Investment Analysis
        </h3>

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-xl">
          <ResultChart
            principal={result.invested}
            returns={result.returns}
            principalLabel="Invested"
            returnsLabel={
              inflationEnabled ? "Inflation-Adjusted Returns" : "Returns"
            }
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-xs text-muted-foreground mb-1">
                Total Invested
              </p>
              <p className="text-base font-bold text-foreground">
                {formatCurrency(result.invested)}
              </p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Returns</p>
              <p className="text-base font-bold text-primary">
                {formatCurrency(result.returns)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-primary-foreground/80 mb-1">
                {inflationEnabled
                  ? "Inflation-Adjusted Maturity Value"
                  : "Maturity Value"}
              </p>
              <p className="text-2xl font-bold text-primary-foreground">
                {formatCurrency(result.total)}
              </p>
            </div>

            {inflationEnabled && "normalTotal" in result && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-center shadow-md">
                <p className="text-xs text-green-100 mb-1">
                  Normal Maturity Value (without inflation)
                </p>
                <p className="text-xl font-bold text-green-50">
                  {formatCurrency(result.normalTotal)}
                </p>
              </div>
            )}
          </div>

          {/* Step-Up vs No Step-Up Comparison */}
          {stepUpEnabled && comparisonResult && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 text-center">
                📈 Step-Up SIP Benefit Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/70 p-3 rounded-lg text-center border border-blue-100">
                  <p className="text-xs text-blue-600 mb-1">Without Step-Up</p>
                  <p className="text-lg font-bold text-blue-800">
                    {formatCurrency(comparisonResult.withoutStepUp.total)}
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded-lg text-center border border-blue-100">
                  <p className="text-xs text-green-600 mb-1">With Step-Up</p>
                  <p className="text-lg font-bold text-green-800">
                    {formatCurrency(comparisonResult.withStepUp.total)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg text-center border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Benefit</p>
                  <p className="text-lg font-bold text-green-800">
                    +{comparisonResult.percentageDifference}%
                  </p>
                  <p className="text-sm font-semibold text-green-700">
                    {formatCurrency(comparisonResult.difference)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Features Summary */}
        {(stepUpEnabled || inflationEnabled) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">
              📊 Advanced Features Applied
            </h4>
            <div className="space-y-2">
              {stepUpEnabled && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Step-Up SIP</span>
                  <span className="font-semibold text-blue-800">
                    {stepUpPercentage}% annual increase
                  </span>
                </div>
              )}
              {inflationEnabled && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">
                    Inflation Adjustment
                  </span>
                  <span className="font-semibold text-blue-800">
                    {inflationRate}% per year
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-5 h-5" />
          Save Calculation
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="sip"
        inputs={{
          monthlyInvestment,
          expectedReturn,
          years,
          months,
          stepUpEnabled: stepUpEnabled ? 1 : 0,
          stepUpPercentage,
          inflationEnabled: inflationEnabled ? 1 : 0,
          inflationRate,
        }}
        results={{
          ...result,
          normalTotal: normalResult.total,
          inflationAdjustedTotal: result.total,
          inflationRate: inflationEnabled ? inflationRate : 0,
        }}
      />
    </div>
  );
};

export default SIPCalculator;
