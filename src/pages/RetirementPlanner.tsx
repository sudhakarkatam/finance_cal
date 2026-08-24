import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  Calculator,
  Users,
  PiggyBank,
  TrendingUp,
  Share2,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResultChart from "@/components/ui/ResultChart";

const RetirementPlanner = () => {
  const { formatAmount, symbol } = useCurrency();
  // Basic inputs
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyContribution, setMonthlyContribution] = useState(25000);
  const [expectedReturnAccumulation, setExpectedReturnAccumulation] =
    useState(10); // During working years
  const [expectedReturnRetirement, setExpectedReturnRetirement] = useState(7); // During retirement

  // Advanced features
  const [inflationEnabled, setInflationEnabled] = useState(true);
  const [inflationRate, setInflationRate] = useState(6);
  const [pensionEnabled, setPensionEnabled] = useState(false);
  const [monthlyPension, setMonthlyPension] = useState(50000);
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [lifestyleExpenses, setLifestyleExpenses] = useState(100000);

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  const calculateRetirement = () => {
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;

    if (yearsToRetirement <= 0) {
      return {
        corpusAtRetirement: currentSavings,
        totalContributions: 0,
        totalReturns: 0,
        shortfall: 0,
        requiredMonthlyContribution: 0,
        isAchievable: true,
      };
    }

    // Future value of current savings
    const futureSavings =
      currentSavings *
      Math.pow(1 + expectedReturnAccumulation / 100, yearsToRetirement);

    // Future value of monthly contributions
    const months = yearsToRetirement * 12;
    const monthlyRate = expectedReturnAccumulation / (12 * 100);

    let futureContributions = 0;
    if (monthlyRate === 0) {
      futureContributions = monthlyContribution * months;
    } else {
      futureContributions =
        (monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1)) /
        monthlyRate;
    }

    const corpusAtRetirement = futureSavings + futureContributions;

    // Calculate required corpus for retirement years
    let requiredCorpus = 0;
    if (pensionEnabled) {
      // If pension is available, calculate additional corpus needed
      const monthlyPensionNeeded = lifestyleExpenses - monthlyPension;
      if (monthlyPensionNeeded > 0) {
        const retirementMonths = yearsInRetirement * 12;
        const pensionRate = inflationEnabled
          ? (expectedReturnRetirement - inflationRate) / 100
          : expectedReturnRetirement / 100;
        const pensionMonthlyRate = pensionRate / 12;

        if (pensionMonthlyRate === 0) {
          requiredCorpus = monthlyPensionNeeded * retirementMonths;
        } else {
          requiredCorpus =
            (monthlyPensionNeeded *
              (1 - Math.pow(1 + pensionMonthlyRate, -retirementMonths))) /
            pensionMonthlyRate;
        }
      }
    } else {
      // No pension, need full corpus for expenses
      const retirementMonths = yearsInRetirement * 12;
      const expenseRate = inflationEnabled
        ? (expectedReturnRetirement - inflationRate) / 100
        : expectedReturnRetirement / 100;
      const expenseMonthlyRate = expenseRate / 12;

      if (expenseMonthlyRate === 0) {
        requiredCorpus = lifestyleExpenses * retirementMonths;
      } else {
        requiredCorpus =
          (lifestyleExpenses *
            (1 - Math.pow(1 + expenseMonthlyRate, -retirementMonths))) /
          expenseMonthlyRate;
      }
    }

    const shortfall = Math.max(0, requiredCorpus - corpusAtRetirement);
    const isAchievable = corpusAtRetirement >= requiredCorpus;

    // Calculate required monthly contribution
    let requiredMonthlyContribution = monthlyContribution;
    let excessContribution = 0;

    if (shortfall > 0) {
      const targetCorpus = requiredCorpus - futureSavings;
      if (monthlyRate > 0 && targetCorpus > 0) {
        requiredMonthlyContribution =
          (targetCorpus * monthlyRate) /
          (Math.pow(1 + monthlyRate, months) - 1);
      }
    } else if (isAchievable && monthlyContribution > 0) {
      // User is contributing more than needed - calculate how much they can reduce
      const excessCorpus = corpusAtRetirement - requiredCorpus;

      // Calculate the excess contribution by working backwards
      const averageMonthlyRate = expectedReturnAccumulation / (12 * 100);
      if (averageMonthlyRate > 0) {
        excessContribution =
          excessCorpus /
          (Math.pow(1 + averageMonthlyRate, yearsToRetirement) - 1) /
          averageMonthlyRate /
          12;
      }

      // More precise calculation for excess contribution
      let testContribution = monthlyContribution;
      let minContribution = 0;
      let maxContribution = monthlyContribution;

      // Binary search to find the minimum contribution needed
      for (let i = 0; i < 20; i++) {
        const midContribution = (minContribution + maxContribution) / 2;

        // Calculate future contributions for test amount
        let testFutureContributions = 0;
        if (averageMonthlyRate === 0) {
          testFutureContributions = midContribution * months;
        } else {
          testFutureContributions =
            (midContribution * (Math.pow(1 + averageMonthlyRate, months) - 1)) /
            averageMonthlyRate;
        }

        const testCorpusAtRetirement = futureSavings + testFutureContributions;

        if (testCorpusAtRetirement >= requiredCorpus) {
          maxContribution = midContribution;
          excessContribution = monthlyContribution - midContribution;
        } else {
          minContribution = midContribution;
        }
      }

      requiredMonthlyContribution = maxContribution;
    }

    return {
      corpusAtRetirement: Math.round(corpusAtRetirement),
      totalContributions: Math.round(futureContributions),
      totalReturns: Math.round(
        corpusAtRetirement -
        futureContributions -
        futureSavings +
        currentSavings,
      ),
      shortfall: Math.round(shortfall),
      requiredMonthlyContribution: Math.round(
        Math.max(requiredMonthlyContribution, 0),
      ),
      excessContribution: Math.round(Math.max(excessContribution, 0)),
      requiredCorpus: Math.round(requiredCorpus),
      isAchievable,
      yearsToRetirement,
      yearsInRetirement,
    };
  };

  const result = useMemo(() => {
    return calculateRetirement();
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    expectedReturnAccumulation,
    inflationEnabled,
    inflationRate,
    pensionEnabled,
    monthlyPension,
    lifeExpectancy,
    lifestyleExpenses,
  ]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setCurrentAge(30);
    setRetirementAge(60);
    setCurrentSavings(500000);
    setMonthlyContribution(25000);
    setExpectedReturnAccumulation(10);
    setExpectedReturnRetirement(7);
    setInflationEnabled(true);
    setInflationRate(6);
    setPensionEnabled(false);
    setMonthlyPension(50000);
    setLifeExpectancy(80);
    setLifestyleExpenses(100000);
    setIsCalculated(false);
  };

  // Generate year-wise projection
  const generateYearlyProjection = () => {
    const projection = [];
    const yearsToRetirement = retirementAge - currentAge;

    for (let year = 1; year <= yearsToRetirement; year++) {
      const age = currentAge + year;
      const yearsRemaining = yearsToRetirement - year;

      // Future value calculations
      const futureSavingsValue =
        currentSavings *
        Math.pow(1 + expectedReturnAccumulation / 100, yearsRemaining);
      const futureContributionsValue =
        monthlyContribution * 12 * yearsRemaining;

      const portfolioValue = futureSavingsValue + futureContributionsValue;

      projection.push({
        year,
        age,
        portfolioValue: Math.round(portfolioValue),
        contributionsThisYear: monthlyContribution * 12,
      });
    }

    return projection;
  };

  const yearlyProjection = generateYearlyProjection();

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Retirement Planner
              </h2>
              <p className="text-xs text-muted-foreground">
                Plan your retirement corpus and savings
              </p>
            </div>
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

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Current age"
            value={currentAge}
            onChange={setCurrentAge}
            min={18}
            max={70}
            step={1}
            suffix="Years"
          />

          <CalculatorInput
            label="Retirement age"
            value={retirementAge}
            onChange={setRetirementAge}
            min={currentAge + 5}
            max={80}
            step={1}
            suffix="Years"
          />

          <CalculatorInput
            label="Current savings"
            value={currentSavings}
            onChange={setCurrentSavings}
            min={0}
            max={100000000}
            step={100000}
            prefix={symbol}
            placeholder="500000"
          />

          <CalculatorInput
            label="Monthly contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            min={0}
            max={500000}
            step={1000}
            prefix={symbol}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Expected annual return (during accumulation phase)"
            value={expectedReturnAccumulation}
            onChange={setExpectedReturnAccumulation}
            min={1}
            max={20}
            step={0.1}
            suffix="%"
          />

          <CalculatorInput
            label="Expected return after retirement (p.a)"
            value={expectedReturnRetirement}
            onChange={setExpectedReturnRetirement}
            min={1}
            max={15}
            step={0.1}
            suffix="%"
          />
        </div>

        {/* Retirement Phase Settings */}
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-3">Retirement Phase Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalculatorInput
              label="Life expectancy"
              value={lifeExpectancy}
              onChange={setLifeExpectancy}
              min={retirementAge + 10}
              max={100}
              step={1}
              suffix="Years"
            />

            <CalculatorInput
              label="Monthly lifestyle expenses"
              value={lifestyleExpenses}
              onChange={setLifestyleExpenses}
              min={10000}
              max={1000000}
              step={10000}
              prefix={symbol}
            />
          </div>

          {/* Pension Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="pension" className="text-sm font-medium">
                Monthly Pension
              </Label>
              <Switch
                id="pension"
                checked={pensionEnabled}
                onCheckedChange={setPensionEnabled}
              />
            </div>
            {pensionEnabled && (
              <CalculatorInput
                label="Expected monthly pension"
                value={monthlyPension}
                onChange={setMonthlyPension}
                min={0}
                max={lifestyleExpenses}
                step={5000}
                prefix={symbol}
              />
            )}
          </div>
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
            Account for inflation in retirement planning calculations
          </p>
          {inflationEnabled && (
            <CalculatorInput
              label="Expected inflation rate (p.a)"
              value={inflationRate}
              onChange={setInflationRate}
              min={1}
              max={50}
              step={0.1}
              suffix="%"
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 gap-2" size="lg" onClick={handleCalculate}>
            <Calculator className="w-4 h-4" />
            Calculate Retirement Plan
          </Button>

          {isCalculated && (
            <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  View Projections
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Year-wise Retirement Savings Projection
                  </DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Annual Contribution</TableHead>
                      <TableHead>Portfolio Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyProjection.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>
                          {formatAmount(row.contributionsThisYear)}
                        </TableCell>
                        <TableCell>
                          {formatAmount(row.portfolioValue)}
                        </TableCell>
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
        <h3 className="text-lg font-semibold text-foreground">
          Retirement Analysis
        </h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">
            Projected Corpus at Retirement
          </p>
          <p className="text-3xl font-bold text-primary-foreground">
            {formatAmount(result.corpusAtRetirement)}
          </p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">
              Total contributions
            </span>
            <span className="font-semibold text-foreground">
              {formatAmount(result.totalContributions)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total returns</span>
            <span className="font-semibold text-foreground">
              {formatAmount(result.totalReturns)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Required corpus
            </span>
            <span className="font-semibold text-foreground">
              {formatAmount(result.requiredCorpus)}
            </span>
          </div>
          {result.shortfall > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Shortfall</span>
              <span className="font-semibold text-red-600">
                {formatAmount(result.shortfall)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">
              {result.isAchievable && result.excessContribution > 0
                ? "Minimum monthly contribution"
                : "Required monthly contribution"}
            </span>
            <span className="text-xl font-bold text-primary">
              {formatAmount(result.requiredMonthlyContribution)}
            </span>
          </div>
          {result.isAchievable && result.excessContribution > 0 && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">
                  You can reduce your contribution by
                </span>
                <span className="font-semibold text-green-800">
                  {formatAmount(result.excessContribution)}/month
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Your current contribution of{" "}
                {formatAmount(monthlyContribution)} is{" "}
                {formatAmount(
                  monthlyContribution - result.requiredMonthlyContribution,
                )}{" "}
                more than needed
              </p>
            </div>
          )}
        </div>

        {result.isAchievable ? (
          result.excessContribution > 0 ? (
            <Alert>
              <AlertDescription className="text-green-800">
                🎉 Excellent! Your current monthly contribution of{" "}
                {formatAmount(monthlyContribution)} exceeds the requirement.
                You can reduce it by {formatAmount(result.excessContribution)}{" "}
                to {formatAmount(result.requiredMonthlyContribution)} per
                month while still achieving your retirement goal comfortably.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription className="text-green-800">
                🎉 Perfect! With your current monthly contribution of{" "}
                {formatAmount(monthlyContribution)}, you will achieve your
                retirement goal exactly as planned.
              </AlertDescription>
            </Alert>
          )
        ) : (
          <Alert>
            <AlertDescription className="text-orange-800">
              To achieve your retirement goal, you need to contribute{" "}
              {formatAmount(result.requiredMonthlyContribution)} per month.
              Consider increasing your monthly contribution or extending your
              working years.
            </AlertDescription>
          </Alert>
        )}

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
        calculationType="retirement"
        inputs={{
          currentAge,
          retirementAge,
          currentSavings,
          monthlyContribution,
          expectedReturnAccumulation,
          expectedReturnRetirement,
          inflationEnabled: inflationEnabled ? 1 : 0,
          inflationRate,
          pensionEnabled: pensionEnabled ? 1 : 0,
          monthlyPension,
          lifeExpectancy,
          lifestyleExpenses,
        }}
        results={
          {
            corpusAtRetirement: result.corpusAtRetirement,
            totalContributions: result.totalContributions,
            totalReturns: result.totalReturns,
            shortfall: result.shortfall,
            requiredMonthlyContribution: result.requiredMonthlyContribution,
            excessContribution: result.excessContribution,
            requiredCorpus: result.requiredCorpus,
            isAchievable: result.isAchievable ? 1 : 0,
            yearsToRetirement: result.yearsToRetirement,
            yearsInRetirement: result.yearsInRetirement,
          } as Record<string, number>
        }
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Retirement Financial Independence Statement"
        inputs={[
          { label: "Current Age / Retirement Age", value: `${currentAge} to ${retirementAge} Years` },
          { label: "Target Life Expectancy", value: `${lifeExpectancy} Years` },
          { label: "Current Monthly Expenses", value: formatAmount(lifestyleExpenses) },
          { label: "Current Existing Savings", value: formatAmount(currentSavings) },
          { label: "Monthly Savings Contribution", value: formatAmount(monthlyContribution) },
          { label: "Accumulation Expected Return", value: `${expectedReturnAccumulation}%` },
          { label: "Inflation Rate", value: `${inflationRate}%` },
        ]}
        results={[
          { label: "Total Target Required Corpus", value: formatAmount(result.requiredCorpus) },
          { label: "Projected Corpus at Retirement (Age 60)", value: formatAmount(result.corpusAtRetirement) },
          { label: "Minimum Required Monthly Contribution", value: formatAmount(result.requiredMonthlyContribution), isHighlight: true },
          { label: "Retirement Goal Status", value: result.isAchievable ? "🎉 Fully Achievable" : `Shortfall of ${formatAmount(result.shortfall)}`, isHighlight: true },
        ]}
        analysis={[
          {
            title: "Retirement Goal Feasibility & Advisory Analysis",
            items: [
              { label: "Target Required Corpus", value: formatAmount(result.requiredCorpus) },
              { label: "Accumulated Savings at Retirement", value: formatAmount(result.corpusAtRetirement) },
              {
                label: "Advisory Recommendation",
                value: result.isAchievable
                  ? (result.excessContribution > 0
                      ? `Exceeds requirement! You can reduce monthly contribution by ${formatAmount(result.excessContribution)} to ${formatAmount(result.requiredMonthlyContribution)}/mo.`
                      : "Current monthly contribution is on track for target retirement corpus.")
                  : `Increase monthly SIP by ${formatAmount(result.requiredMonthlyContribution - monthlyContribution)} to bridge the ${formatAmount(result.shortfall)} gap.`,
                isHighlight: true,
              },
            ],
          },
        ]}
        scheduleTitle="Retirement Corpus Projection"
        scheduleHeaders={{ period: "Age / Year", invested: "Annual Contribution", interest: "Growth Earned", balance: "Portfolio Value" }}
        schedule={yearlyProjection?.map((p) => ({
          period: `Age ${p.age} (Yr ${p.year})`,
          invested: p.contributionsThisYear,
          interest: Math.max(0, p.portfolioValue - (currentSavings + p.contributionsThisYear * p.year)),
          total: p.portfolioValue,
        }))}
      />
    </div>
  );
};

export default RetirementPlanner;
