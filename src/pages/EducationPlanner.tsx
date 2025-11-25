import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  Calculator,
  GraduationCap,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import { useCurrency } from '@/hooks/useCurrency';
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

const EducationPlanner = () => {
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  // Basic inputs
  const [childCurrentAge, setChildCurrentAge] = useState(5);
  const [educationStartAge, setEducationStartAge] = useState(18);
  const [currentEducationCost, setCurrentEducationCost] = useState(1000000);
  const [currentSavings, setCurrentSavings] = useState(200000);
  const [monthlyContribution, setMonthlyContribution] = useState(15000);
  const [expectedReturn, setExpectedReturn] = useState(10);

  // Advanced features
  const [educationInflationEnabled, setEducationInflationEnabled] =
    useState(true);
  const [educationInflationRate, setEducationInflationRate] = useState(8);
  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpPercentage, setStepUpPercentage] = useState(10);

  // Education type
  const [educationType, setEducationType] = useState("undergraduate");

  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);

  // Education type configurations
  const educationTypes = {
    school: { name: "School Education", duration: 4, multiplier: 0.8 },
    undergraduate: { name: "Undergraduate", duration: 4, multiplier: 1.0 },
    postgraduate: { name: "Postgraduate", duration: 2, multiplier: 1.5 },
    medical: { name: "Medical", duration: 5, multiplier: 3.0 },
    engineering: { name: "Engineering", duration: 4, multiplier: 1.8 },
    mba: { name: "MBA", duration: 2, multiplier: 2.5 },
  };

  const currentEducationConfig =
    educationTypes[educationType as keyof typeof educationTypes];

  const calculateEducation = () => {
    const yearsToEducation = educationStartAge - childCurrentAge;
    const educationDuration = currentEducationConfig.duration;

    if (yearsToEducation <= 0) {
      return {
        requiredCorpus: currentEducationCost * educationDuration,
        totalContributions: 0,
        totalReturns: 0,
        shortfall: 0,
        requiredMonthlyContribution: 0,
        isAchievable: true,
        yearsToEducation: 0,
      };
    }

    // Calculate future cost of education with inflation
    const futureEducationCost = educationInflationEnabled
      ? currentEducationCost *
      Math.pow(1 + educationInflationRate / 100, yearsToEducation)
      : currentEducationCost;

    const totalRequiredCorpus = futureEducationCost * educationDuration;

    // Future value of current savings
    const futureSavings =
      currentSavings * Math.pow(1 + expectedReturn / 100, yearsToEducation);

    // Future value of monthly contributions with step-up
    const months = yearsToEducation * 12;
    const monthlyRate = expectedReturn / (12 * 100);

    let futureContributions = 0;
    let currentMonthlyContrib = monthlyContribution;

    for (let month = 1; month <= months; month++) {
      // Calculate future value of this month's investment
      const monthsRemaining = months - month;
      const monthFutureValue =
        currentMonthlyContrib * Math.pow(1 + monthlyRate, monthsRemaining);
      futureContributions += monthFutureValue;

      // Apply step-up at the beginning of each year
      if (stepUpEnabled && month % 12 === 0 && month < months) {
        currentMonthlyContrib *= 1 + stepUpPercentage / 100;
      }
    }

    const totalCorpusAtEducation = futureSavings + futureContributions;
    const shortfall = Math.max(0, totalRequiredCorpus - totalCorpusAtEducation);
    const isAchievable = totalCorpusAtEducation >= totalRequiredCorpus;

    // Calculate required monthly contribution
    let requiredMonthlyContribution = monthlyContribution;
    let excessContribution = 0;

    if (shortfall > 0) {
      // User needs to contribute more
      const targetCorpus = totalRequiredCorpus - futureSavings;
      if (monthlyRate > 0 && targetCorpus > 0) {
        requiredMonthlyContribution =
          (targetCorpus * monthlyRate) /
          (Math.pow(1 + monthlyRate, months) - 1);
      }
    } else if (isAchievable && monthlyContribution > 0) {
      // User is contributing more than needed - calculate how much they can reduce
      const excessCorpus = totalCorpusAtEducation - totalRequiredCorpus;

      // Calculate the excess contribution by working backwards
      // This is an approximation since step-up makes it complex
      const averageMonthlyRate = expectedReturn / (12 * 100);
      if (averageMonthlyRate > 0) {
        // Approximate excess contribution (this is a simplified calculation)
        excessContribution =
          excessCorpus /
          (Math.pow(1 + averageMonthlyRate, yearsToEducation) - 1) /
          averageMonthlyRate /
          12;
      }

      // More precise calculation for excess contribution
      let testContribution = monthlyContribution;
      let minContribution = 0;
      let maxContribution = monthlyContribution;

      // Binary search to find the minimum contribution needed
      for (let i = 0; i < 20; i++) {
        // Max 20 iterations for precision
        const midContribution = (minContribution + maxContribution) / 2;
        let testFutureContributions = 0;
        let currentTestContrib = midContribution;

        for (let month = 1; month <= months; month++) {
          const monthsRemaining = months - month;
          const monthFutureValue =
            currentTestContrib * Math.pow(1 + monthlyRate, monthsRemaining);
          testFutureContributions += monthFutureValue;

          if (stepUpEnabled && month % 12 === 0 && month < months) {
            currentTestContrib *= 1 + stepUpPercentage / 100;
          }
        }

        const testTotalCorpus = futureSavings + testFutureContributions;

        if (testTotalCorpus >= totalRequiredCorpus) {
          maxContribution = midContribution;
          excessContribution = monthlyContribution - midContribution;
        } else {
          minContribution = midContribution;
        }
      }

      requiredMonthlyContribution = maxContribution;
    }

    return {
      requiredCorpus: Math.round(totalRequiredCorpus),
      totalContributions: Math.round(futureContributions),
      totalReturns: Math.round(
        totalCorpusAtEducation -
        futureContributions -
        futureSavings +
        currentSavings,
      ),
      shortfall: Math.round(shortfall),
      requiredMonthlyContribution: Math.round(
        Math.max(requiredMonthlyContribution, 0),
      ),
      excessContribution: Math.round(Math.max(excessContribution, 0)),
      isAchievable,
      yearsToEducation,
      futureEducationCost: Math.round(futureEducationCost),
      totalCorpusAtEducation: Math.round(totalCorpusAtEducation),
    };
  };

  const result = useMemo(() => {
    return calculateEducation();
  }, [
    childCurrentAge,
    educationStartAge,
    currentEducationCost,
    currentSavings,
    monthlyContribution,
    expectedReturn,
    educationInflationEnabled,
    educationInflationRate,
    stepUpEnabled,
    stepUpPercentage,
    educationType,
  ]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleEducationTypeChange = (type: string) => {
    setEducationType(type);
    const config = educationTypes[type as keyof typeof educationTypes];
    const newCost = 1000000 * config.multiplier;
    setCurrentEducationCost(Math.round(newCost));
  };

  const handleReset = () => {
    setChildCurrentAge(5);
    setEducationStartAge(18);
    setCurrentEducationCost(1000000);
    setCurrentSavings(200000);
    setMonthlyContribution(15000);
    setExpectedReturn(10);
    setEducationInflationEnabled(true);
    setEducationInflationRate(8);
    setStepUpEnabled(false);
    setStepUpPercentage(10);
    setEducationType("undergraduate");
    setIsCalculated(false);
  };

  // Generate year-wise projection
  const generateYearlyProjection = () => {
    const projection = [];
    const yearsToEducation = educationStartAge - childCurrentAge;

    for (let year = 1; year <= yearsToEducation; year++) {
      const age = childCurrentAge + year;
      const yearsRemaining = yearsToEducation - year;

      // Future value calculations
      const futureSavingsValue =
        currentSavings * Math.pow(1 + expectedReturn / 100, yearsRemaining);
      const futureContributionsValue =
        monthlyContribution * 12 * yearsRemaining;
      const portfolioValue = futureSavingsValue + futureContributionsValue;

      // Future education cost
      const futureCost = educationInflationEnabled
        ? currentEducationCost *
        Math.pow(1 + educationInflationRate / 100, yearsRemaining)
        : currentEducationCost;

      projection.push({
        year,
        age,
        portfolioValue: Math.round(portfolioValue),
        educationCost: Math.round(futureCost),
        contributionsThisYear: monthlyContribution * 12,
      });
    }

    return projection;
  };

  const yearlyProjection = generateYearlyProjection();

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Education Planner
              </h2>
              <p className="text-xs text-muted-foreground">
                Plan your child's education fund
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

        {/* Child Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Child's current age"
            value={childCurrentAge}
            onChange={setChildCurrentAge}
            min={0}
            max={17}
            step={1}
            suffix="Years"
          />

          <CalculatorInput
            label="Education start age"
            value={educationStartAge}
            onChange={setEducationStartAge}
            min={childCurrentAge + 10}
            max={25}
            step={1}
            suffix="Years"
          />
        </div>

        {/* Education Type Selection */}
        <div className="bg-card p-4 rounded-lg border">
          <Label className="text-sm font-medium mb-3 block">
            Education Type
          </Label>
          <Select
            value={educationType}
            onValueChange={handleEducationTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose education type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(educationTypes).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{config.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({config.duration} years)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Current education cost (per year)"
            value={currentEducationCost}
            onChange={setCurrentEducationCost}
            min={100000}
            max={10000000}
            step={50000}
            prefix={symbol}
          />

          <CalculatorInput
            label="Current savings for education"
            value={currentSavings}
            onChange={setCurrentSavings}
            min={0}
            max={50000000}
            step={10000}
            prefix={symbol}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Monthly contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            min={0}
            max={200000}
            step={1000}
            prefix={symbol}
          />

          <CalculatorInput
            label="Expected return (p.a)"
            value={expectedReturn}
            onChange={setExpectedReturn}
            min={1}
            max={20}
            step={0.1}
            suffix="%"
          />
        </div>

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
            Increase your monthly contributions automatically every year
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

        {/* Education Inflation */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <Label
              htmlFor="education-inflation"
              className="text-sm font-medium"
            >
              Education Cost Inflation
            </Label>
            <Switch
              id="education-inflation"
              checked={educationInflationEnabled}
              onCheckedChange={setEducationInflationEnabled}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Account for rising education costs due to inflation
          </p>
          {educationInflationEnabled && (
            <CalculatorInput
              label="Education inflation rate (p.a)"
              value={educationInflationRate}
              onChange={setEducationInflationRate}
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
            Calculate Education Plan
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
                    Year-wise Education Planning Projection
                  </DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Child's Age</TableHead>
                      <TableHead>Annual Contribution</TableHead>
                      <TableHead>Portfolio Value</TableHead>
                      <TableHead>Education Cost (Annual)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyProjection.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>
                          {formatCurrency(row.contributionsThisYear)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(row.portfolioValue)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(row.educationCost)}
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
          Education Fund Analysis
        </h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">
            Total Education Cost ({currentEducationConfig.duration} years)
          </p>
          <p className="text-3xl font-bold text-primary-foreground">
            {formatCurrency(result.requiredCorpus)}
          </p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">
              Future value of current savings
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(
                Math.round(
                  currentSavings *
                  Math.pow(1 + expectedReturn / 100, result.yearsToEducation),
                ),
              )}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Future value of contributions
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(result.totalContributions)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Total projected amount
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(result.totalCorpusAtEducation)}
            </span>
          </div>
          {result.shortfall > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Shortfall</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(result.shortfall)}
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
              {formatCurrency(result.requiredMonthlyContribution)}
            </span>
          </div>
          {result.isAchievable && result.excessContribution > 0 && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">
                  You can reduce your contribution by
                </span>
                <span className="font-semibold text-green-800">
                  {formatCurrency(result.excessContribution)}/month
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Your current contribution of{" "}
                {formatCurrency(monthlyContribution)} is{" "}
                {formatCurrency(
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
                🎓 Excellent! Your current monthly contribution of{" "}
                {formatCurrency(monthlyContribution)} exceeds the requirement.
                You can reduce it by {formatCurrency(result.excessContribution)}{" "}
                to {formatCurrency(result.requiredMonthlyContribution)} per
                month while still funding your child's{" "}
                {currentEducationConfig.name.toLowerCase()} comfortably.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription className="text-green-800">
                🎓 Perfect! With your current monthly contribution of{" "}
                {formatCurrency(monthlyContribution)}, you will be able to fund
                your child's {currentEducationConfig.name.toLowerCase()} exactly
                as planned.
              </AlertDescription>
            </Alert>
          )
        ) : (
          <Alert>
            <AlertDescription className="text-orange-800">
              To fund your child's education, you need to contribute{" "}
              {formatCurrency(result.requiredMonthlyContribution)} per month.
              Consider starting early or increasing your monthly contribution.
            </AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-4 h-4" />
          Save to History
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="education"
        inputs={{
          childCurrentAge,
          educationStartAge,
          currentEducationCost,
          currentSavings,
          monthlyContribution,
          expectedReturn,
          educationInflationEnabled: educationInflationEnabled ? 1 : 0,
          educationInflationRate,
          stepUpEnabled: stepUpEnabled ? 1 : 0,
          stepUpPercentage,
          educationType,
        }}
        results={{
          requiredCorpus: result.requiredCorpus,
          totalContributions: result.totalContributions,
          totalReturns: result.totalReturns,
          shortfall: result.shortfall,
          requiredMonthlyContribution: result.requiredMonthlyContribution,
          isAchievable: result.isAchievable ? 1 : 0,
          yearsToEducation: result.yearsToEducation,
          futureEducationCost: result.futureEducationCost,
          totalCorpusAtEducation: result.totalCorpusAtEducation,
        }}
      />
    </div>
  );
};

export default EducationPlanner;
