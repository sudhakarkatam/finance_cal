import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  Target,
  Calculator,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Briefcase,
  Share2,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import { calculateGoalPlanning } from "@/lib/calculations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GoalPlanning = () => {
  const { formatAmount, symbol } = useCurrency();
  // Goal category and basic inputs
  const [goalCategory, setGoalCategory] = useState("house");
  const [goalAmount, setGoalAmount] = useState(5000000);
  const [targetYears, setTargetYears] = useState(10);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(8);

  // Advanced features
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  // Goal category configurations
  const goalCategories = {
    house: {
      name: "House Purchase",
      icon: Home,
      defaultAmount: 5000000,
      color: "bg-blue-500",
    },
    car: {
      name: "Car Purchase",
      icon: Car,
      defaultAmount: 1000000,
      color: "bg-red-500",
    },
    vacation: {
      name: "Dream Vacation",
      icon: Plane,
      defaultAmount: 500000,
      color: "bg-green-500",
    },
    education: {
      name: "Education",
      icon: GraduationCap,
      defaultAmount: 800000,
      color: "bg-purple-500",
    },
    wedding: {
      name: "Wedding",
      icon: Heart,
      defaultAmount: 2000000,
      color: "bg-pink-500",
    },
    business: {
      name: "Business/Startup",
      icon: Briefcase,
      defaultAmount: 1000000,
      color: "bg-orange-500",
    },
    custom: {
      name: "Custom Goal",
      icon: Target,
      defaultAmount: 1000000,
      color: "bg-gray-500",
    },
  };

  const currentGoalConfig =
    goalCategories[goalCategory as keyof typeof goalCategories];

  const result = useMemo(() => {
    return calculateGoalPlanning(
      goalAmount,
      targetYears,
      currentSavings,
      monthlyContribution,
      expectedReturn,
      inflationEnabled ? inflationRate : 0,
      stepUpEnabled ? stepUpPercentage : 0,
    );
  }, [
    goalAmount,
    targetYears,
    currentSavings,
    monthlyContribution,
    expectedReturn,
    inflationEnabled,
    inflationRate,
    stepUpEnabled,
    stepUpPercentage,
  ]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleGoalCategoryChange = (category: string) => {
    setGoalCategory(category);
    const config = goalCategories[category as keyof typeof goalCategories];
    setGoalAmount(config.defaultAmount);
  };

  const handleReset = () => {
    setGoalCategory("house");
    setGoalAmount(5000000);
    setTargetYears(10);
    setCurrentSavings(100000);
    setMonthlyContribution(10000);
    setExpectedReturn(8);
    setInflationEnabled(false);
    setInflationRate(6);
    setStepUpEnabled(false);
    setStepUpPercentage(10);
    setIsCalculated(false);
  };

  // Generate year-wise projection
  const generateYearlyProjection = () => {
    const projection = [];
    let currentMonthlyContrib = monthlyContribution;

    for (let year = 1; year <= targetYears; year++) {
      const yearlyContribution = currentMonthlyContrib * 12;

      // Calculate portfolio value at the end of this year
      const yearsRemaining = targetYears - year;

      // Future value of current savings
      const futureSavingsValue =
        currentSavings * Math.pow(1 + expectedReturn / 100, yearsRemaining);

      // Future value of all contributions made up to this year
      let futureContributionsValue = 0;
      let tempMonthlyContrib = monthlyContribution;

      for (let y = 1; y <= year; y++) {
        const yearContribution = tempMonthlyContrib * 12;
        const yearsFromNow = targetYears - y;
        futureContributionsValue +=
          yearContribution * Math.pow(1 + expectedReturn / 100, yearsFromNow);

        // Apply step-up for next year
        if (stepUpEnabled && y < targetYears) {
          tempMonthlyContrib *= 1 + stepUpPercentage / 100;
        }
      }

      const portfolioValue = futureSavingsValue + futureContributionsValue;

      projection.push({
        year,
        yearlyContribution,
        cumulativeContributions: yearlyContribution * year,
        portfolioValue: Math.round(portfolioValue),
        goalProgress: Math.round((portfolioValue / goalAmount) * 100),
      });

      // Apply step-up for next year
      if (stepUpEnabled && year < targetYears) {
        currentMonthlyContrib *= 1 + stepUpPercentage / 100;
      }
    }

    return projection;
  };

  const yearlyProjection = useMemo(
    () => generateYearlyProjection(),
    [
      monthlyContribution,
      targetYears,
      currentSavings,
      expectedReturn,
      stepUpEnabled,
      stepUpPercentage,
    ],
  );

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 ${currentGoalConfig.color.replace("bg-", "bg-").replace("-500", "-100")} rounded-lg`}
            >
              <currentGoalConfig.icon
                className={`w-6 h-6 ${currentGoalConfig.color.replace("bg-", "text-").replace("-500", "-600")}`}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Goal Planning
              </h2>
              <p className="text-xs text-muted-foreground">
                Plan for {currentGoalConfig.name.toLowerCase()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Goal Category Selection */}
        <div className="bg-card p-4 rounded-lg border">
          <Label className="text-sm font-medium mb-3 block">
            Select Goal Type
          </Label>
          <Select value={goalCategory} onValueChange={handleGoalCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your goal type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(goalCategories).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className="w-4 h-4" />
                    {config.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Goal Amount"
            value={goalAmount}
            onChange={setGoalAmount}
            min={1000}
            max={30000000}
            step={1000}
            prefix={symbol}
            placeholder="5000000"
          />

          <CalculatorInput
            label="Target Years"
            value={targetYears}
            onChange={setTargetYears}
            min={1}
            max={40}
            step={1}
            suffix="Years"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Current Savings"
            value={currentSavings}
            onChange={setCurrentSavings}
            min={0}
            max={goalAmount}
            step={10000}
            prefix={symbol}
          />

          <CalculatorInput
            label="Expected Return (p.a)"
            value={expectedReturn}
            onChange={setExpectedReturn}
            min={0}
            max={20}
            step={0.1}
            suffix="%"
          />
        </div>

        <CalculatorInput
          label="Monthly Contribution"
          value={monthlyContribution}
          onChange={setMonthlyContribution}
          min={0}
          max={500000}
          step={1000}
          prefix={symbol}
        />

        {/* Step-Up Contributions */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="step-up" className="text-sm font-medium">
              Step-Up Contributions
            </Label>
            <Switch
              id="step-up"
              checked={stepUpEnabled}
              onCheckedChange={setStepUpEnabled}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Increase your monthly contributions automatically every year.
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
            Account for inflation to see your real goal amount.
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

        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="flex-1 gap-2" size="lg" onClick={handleCalculate}>
            <Calculator className="w-4 h-4" />
            Calculate Goal
          </Button>

          {isCalculated && (
            <Dialog open={showCalculations} onOpenChange={setShowCalculations}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calculator className="w-4 h-4" />
                  View Projections
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Year-wise Goal Progress</DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Yearly Contribution</TableHead>
                      <TableHead>Cumulative Contributions</TableHead>
                      <TableHead>Portfolio Value</TableHead>
                      <TableHead>Goal Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyProjection.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell>
                          {formatAmount(row.yearlyContribution)}
                        </TableCell>
                        <TableCell>
                          {formatAmount(row.cumulativeContributions)}
                        </TableCell>
                        <TableCell>
                          {formatAmount(row.portfolioValue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{row.goalProgress}%</span>
                            <div className="w-16 h-2 bg-gray-200 rounded">
                              <div
                                className={`h-2 rounded ${row.goalProgress >= 100 ? "bg-green-500" : "bg-blue-500"}`}
                                style={{
                                  width: `${Math.min(row.goalProgress, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
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
          Goal Achievement Analysis
        </h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">
            {inflationEnabled
              ? "Inflation-Adjusted Goal Amount"
              : "Total Amount Needed"}
          </p>
          <p className="text-3xl font-bold text-primary-foreground">
            {formatAmount(
              inflationEnabled && "inflationAdjustedGoal" in result
                ? result.inflationAdjustedGoal
                : goalAmount,
            )}
          </p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">
              Future value of current savings
            </span>
            <span className="font-semibold text-foreground">
              {formatAmount(result.futureSavings)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Future value of contributions
            </span>
            <span className="font-semibold text-foreground">
              {formatAmount(result.futureContributions)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Total projected amount
            </span>
            <span className="font-semibold text-foreground">
              {formatAmount(result.totalAchieved)}
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
              {result.goalMet && result.excessContribution > 0
                ? "Minimum monthly contribution"
                : "Min monthly contribution"}
            </span>
            <span className="text-xl font-bold text-primary">
              {formatAmount(result.requiredMonthlyContribution)}
            </span>
          </div>
          {result.goalMet && result.excessContribution > 0 && (
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

        {result.goalMet ? (
          result.excessContribution > 0 ? (
            <Alert>
              <AlertDescription className="text-green-800">
                🎉 Excellent! Your current monthly contribution of{" "}
                {formatAmount(monthlyContribution)} exceeds the requirement.
                You can reduce it by {formatAmount(result.excessContribution)}{" "}
                to {formatAmount(result.requiredMonthlyContribution)} per
                month while still achieving your goal comfortably.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription className="text-green-800">
                🎉 Perfect! With your current monthly contribution of{" "}
                {formatAmount(monthlyContribution)}, you will achieve your
                goal exactly as planned.
              </AlertDescription>
            </Alert>
          )
        ) : (
          <Alert>
            <AlertDescription className="text-orange-800">
              To achieve your goal, you need to contribute{" "}
              {formatAmount(result.requiredMonthlyContribution)} per month.
              Consider increasing your monthly contribution or extending the
              time horizon.
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
        calculationType="goalplanning"
        inputs={
          {
            goalAmount,
            targetYears,
            currentSavings,
            monthlyContribution,
            expectedReturn,
            inflationEnabled: inflationEnabled ? 1 : 0,
            inflationRate,
            stepUpEnabled: stepUpEnabled ? 1 : 0,
            stepUpPercentage,
          } as Record<string, number | string>
        }
        results={
          {
            futureSavings: result.futureSavings,
            futureContributions: result.futureContributions,
            totalAchieved: result.totalAchieved,
            shortfall: result.shortfall,
            requiredMonthlyContribution: result.requiredMonthlyContribution,
            excessContribution: result.excessContribution,
            goalMet: result.goalMet ? 1 : 0,
            inflationAdjustedGoal:
              "inflationAdjustedGoal" in result
                ? result.inflationAdjustedGoal
                : goalAmount,
          } as Record<string, number>
        }
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Financial Goal Planning Roadmap"
        inputs={[
          { label: "Target Goal Category", value: goalCategory.toUpperCase() },
          { label: "Goal Amount Target", value: formatAmount(goalAmount) },
          { label: "Target Time Horizon", value: `${targetYears} Years` },
          { label: "Current Initial Savings", value: formatAmount(currentSavings) },
          { label: "Planned Monthly Savings", value: formatAmount(monthlyContribution) },
          { label: "Expected Investment Return", value: `${expectedReturn}%` },
          ...(inflationEnabled ? [{ label: "Annual Inflation Rate", value: `${inflationRate}%` }] : []),
        ]}
        results={[
          { label: "Target Required Corpus", value: formatAmount("inflationAdjustedGoal" in result ? (result as any).inflationAdjustedGoal : goalAmount) },
          { label: "Projected Wealth Achieved", value: formatAmount(result.totalAchieved) },
          { label: "Required Monthly Contribution", value: formatAmount(result.requiredMonthlyContribution), isHighlight: true },
          { label: "Goal Readiness Status", value: result.goalMet ? "🎉 Fully Achievable" : `Shortfall of ${formatAmount(result.shortfall)}`, isHighlight: true },
        ]}
      />
    </div>
  );
};

export default GoalPlanning;
