import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  Calculator,
  Percent,
  Info,
  ArrowUpDown,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import {
  calculatePercentage,
  findPercentage,
  percentageChange,
  addPercentage,
  percentageDifference,
} from "@/lib/calculations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type CalculationType =
  | "percentage"
  | "find"
  | "change"
  | "addSubtract"
  | "difference";

const PercentageCalculator = () => {
  const [calculationType, setCalculationType] =
    useState<CalculationType>("percentage");
  const [number, setNumber] = useState(100);
  const [percentage, setPercentage] = useState(10);
  const [part, setPart] = useState(25);
  const [whole, setWhole] = useState(100);
  const [originalValue, setOriginalValue] = useState(100);
  const [newValue, setNewValue] = useState(120);
  const [value1, setValue1] = useState(100);
  const [value2, setValue2] = useState(150);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const result = useMemo(() => {
    switch (calculationType) {
      case "percentage":
        return calculatePercentage(number, percentage);
      case "find":
        return findPercentage(part, whole);
      case "change":
        return percentageChange(originalValue, newValue);
      case "addSubtract":
        return addPercentage(number, percentage, operation);
      case "difference":
        return percentageDifference(value1, value2);
      default:
        return null;
    }
  }, [
    calculationType,
    number,
    percentage,
    part,
    whole,
    originalValue,
    newValue,
    value1,
    value2,
    operation,
  ]);

  const handleReset = () => {
    setNumber(100);
    setPercentage(10);
    setPart(25);
    setWhole(100);
    setOriginalValue(100);
    setNewValue(120);
    setValue1(100);
    setValue2(150);
    setOperation("add");
  };

  const calculationTypes = [
    {
      value: "percentage",
      label: "Calculate Percentage",
      description: "What is X% of Y?",
    },
    {
      value: "find",
      label: "Find Percentage",
      description: "X is what % of Y?",
    },
    {
      value: "change",
      label: "Percentage Change",
      description: "% increase/decrease from X to Y",
    },
    {
      value: "addSubtract",
      label: "Add/Subtract Percentage",
      description: "Add or subtract X% to/from Y",
    },
    {
      value: "difference",
      label: "Percentage Difference",
      description: "% difference between X and Y",
    },
  ];

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Percent className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Percentage Calculator
              </h2>
              <p className="text-xs text-muted-foreground">
                All your percentage calculations in one place
              </p>
            </div>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  title="Information"
                >
                  <Info className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Percentage Calculator Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      What is a Percentage?
                    </h3>
                    <p className="text-muted-foreground">
                      A percentage is a way of expressing a number as a fraction
                      of 100. The word "percent" comes from the Latin "per
                      centum" meaning "by the hundred". Percentages are used
                      everywhere - from calculating discounts and interest rates
                      to measuring growth and comparing data.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      5 Types of Percentage Calculations
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          1. Calculate Percentage - "What is X% of Y?"
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Formula:</strong> Result = (Y × X) / 100
                          <br />
                          <strong>Example:</strong> What is 20% of 500?
                          <br />
                          Answer: (500 × 20) / 100 = 100
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          2. Find Percentage - "X is what % of Y?"
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Formula:</strong> Percentage = (X / Y) × 100
                          <br />
                          <strong>Example:</strong> 30 is what % of 150?
                          <br />
                          Answer: (30 / 150) × 100 = 20%
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          3. Percentage Change - "% increase/decrease"
                        </p>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          <strong>Formula:</strong> % Change = ((New - Old) /
                          Old) × 100
                          <br />
                          <strong>Example:</strong> Price increased from ₹100 to
                          ₹125
                          <br />
                          Answer: ((125 - 100) / 100) × 100 = 25% increase
                        </p>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                          4. Add/Subtract Percentage - "Add X% to Y"
                        </p>
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          <strong>Formula:</strong> Result = Y + (Y × X / 100)
                          <br />
                          <strong>Example:</strong> Add 15% to ₹200
                          <br />
                          Answer: 200 + (200 × 15 / 100) = ₹230
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          5. Percentage Difference - "% difference between X &
                          Y"
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>Formula:</strong> % Diff = (|X - Y| / ((X + Y)
                          / 2)) × 100
                          <br />
                          <strong>Example:</strong> Difference between 80 and
                          120
                          <br />
                          Answer: (40 / 100) × 100 = 40%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Real-World Examples
                    </h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Shopping Discounts
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> T-shirt costs ₹800, 25%
                          discount
                          <br />
                          <strong>Discount Amount:</strong> 25% of ₹800 = ₹200
                          <br />
                          <strong>Final Price:</strong> ₹800 - ₹200 = ₹600
                          <br />
                          <strong>Or directly:</strong> Subtract 25% from ₹800 =
                          ₹600
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Exam Scores
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Scored 42 out of 50
                          <br />
                          <strong>Percentage:</strong> (42 / 50) × 100 = 84%
                          <br />
                          <strong>Grade:</strong> B (typically 80-90%)
                          <br />
                          <strong>Marks Needed for A:</strong> Need 90%, so 45
                          out of 50
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Salary Increment
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Current salary ₹50,000,
                          10% increment
                          <br />
                          <strong>Increment Amount:</strong> 10% of ₹50,000 =
                          ₹5,000
                          <br />
                          <strong>New Salary:</strong> ₹50,000 + ₹5,000 =
                          ₹55,000
                          <br />
                          <strong>Monthly Increase:</strong> ₹5,000 extra per
                          month
                        </p>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                          Investment Returns
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invested ₹1,00,000, now
                          worth ₹1,25,000
                          <br />
                          <strong>Gain:</strong> ₹25,000
                          <br />
                          <strong>% Return:</strong> (25,000 / 1,00,000) × 100 =
                          25%
                          <br />
                          <strong>Meaning:</strong> Your money grew by 25%
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Restaurant Bill with Tip
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Bill is ₹2,500, want to
                          give 15% tip
                          <br />
                          <strong>Tip Amount:</strong> 15% of ₹2,500 = ₹375
                          <br />
                          <strong>Total Payment:</strong> ₹2,500 + ₹375 = ₹2,875
                          <br />
                          <strong>Quick Tip:</strong> 10% = ₹250, so 15% = ₹250
                          + (₹250/2)
                        </p>
                      </div>

                      <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <p className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                          Sales Target Achievement
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Target ₹10,00,000,
                          achieved ₹8,50,000
                          <br />
                          <strong>Achievement %:</strong> (8,50,000 / 10,00,000)
                          × 100 = 85%
                          <br />
                          <strong>Shortfall:</strong> ₹1,50,000 (15% short)
                          <br />
                          <strong>Status:</strong> Need ₹1,50,000 more to hit
                          100%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Quick Percentage Tricks
                    </h3>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <p>
                        <strong>10%:</strong> Divide by 10 (move decimal left
                        once)
                      </p>
                      <p>
                        <strong>25%:</strong> Divide by 4 (quarter of the
                        number)
                      </p>
                      <p>
                        <strong>50%:</strong> Divide by 2 (half of the number)
                      </p>
                      <p>
                        <strong>75%:</strong> Find 50% + 25% (half + quarter)
                      </p>
                      <p>
                        <strong>20%:</strong> Find 10% and double it
                      </p>
                      <p>
                        <strong>15%:</strong> Find 10% + half of 10%
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                      Pro Tips
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Always identify the "whole" or base value first</li>
                      <li>
                        To find 1%, divide by 100 - then multiply for any %
                      </li>
                      <li>
                        Percentage increase then decrease doesn't return to
                        original (e.g., +10% then -10%)
                      </li>
                      <li>
                        Use calculator for complex percentages to avoid errors
                      </li>
                      <li>
                        When comparing, use percentage change for relative
                        comparison
                      </li>
                      <li>
                        Percentage points and percentages are different (e.g.,
                        5% to 10% is 5 percentage points but 100% increase)
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

        <div className="bg-card p-4 rounded-lg border">
          <Label className="text-sm font-medium mb-3 block">
            Select Calculation Type
          </Label>
          <Select
            value={calculationType}
            onValueChange={(value) =>
              setCalculationType(value as CalculationType)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose calculation type" />
            </SelectTrigger>
            <SelectContent>
              {calculationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Input Fields Based on Calculation Type */}
        {calculationType === "percentage" && (
          <>
            <CalculatorInput
              label="Number"
              value={number}
              onChange={setNumber}
              min={0}
              max={1000000000}
              step={1}
            />
            <CalculatorInput
              label="Percentage"
              value={percentage}
              onChange={setPercentage}
              min={0}
              max={1000}
              step={0.1}
              suffix="%"
            />
          </>
        )}

        {calculationType === "find" && (
          <>
            <CalculatorInput
              label="Part (X)"
              value={part}
              onChange={setPart}
              min={0}
              max={1000000000}
              step={1}
            />
            <CalculatorInput
              label="Whole (Y)"
              value={whole}
              onChange={setWhole}
              min={1}
              max={1000000000}
              step={1}
            />
          </>
        )}

        {calculationType === "change" && (
          <>
            <CalculatorInput
              label="Original Value"
              value={originalValue}
              onChange={setOriginalValue}
              min={0}
              max={1000000000}
              step={1}
            />
            <CalculatorInput
              label="New Value"
              value={newValue}
              onChange={setNewValue}
              min={0}
              max={1000000000}
              step={1}
            />
          </>
        )}

        {calculationType === "addSubtract" && (
          <>
            <CalculatorInput
              label="Number"
              value={number}
              onChange={setNumber}
              min={0}
              max={1000000000}
              step={1}
            />
            <CalculatorInput
              label="Percentage"
              value={percentage}
              onChange={setPercentage}
              min={0}
              max={1000}
              step={0.1}
              suffix="%"
            />
            <div className="bg-card p-4 rounded-lg border">
              <Label className="text-sm font-medium mb-3 block">
                Operation
              </Label>
              <Select
                value={operation}
                onValueChange={(value) =>
                  setOperation(value as "add" | "subtract")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Percentage</SelectItem>
                  <SelectItem value="subtract">Subtract Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {calculationType === "difference" && (
          <>
            <CalculatorInput
              label="Value 1"
              value={value1}
              onChange={setValue1}
              min={0}
              max={1000000000}
              step={1}
            />
            <CalculatorInput
              label="Value 2"
              value={value2}
              onChange={setValue2}
              min={0}
              max={1000000000}
              step={1}
            />
          </>
        )}

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Calculator className="w-4 h-4" />
          Calculate & Save
        </Button>
      </Card>

      {/* Results Card */}
      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Result</h3>

        {calculationType === "percentage" && result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-primary-foreground/80 mb-1">
                {percentage}% of {number} is
              </p>
              <p className="text-3xl font-bold text-primary-foreground">
                {"result" in result ? result.result : 0}
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Formula:</strong> ({number} × {percentage}) / 100 ={" "}
                {"result" in result ? result.result : 0}
              </p>
            </div>
          </div>
        )}

        {calculationType === "find" && result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-green-100 mb-1">
                {part} is what % of {whole}?
              </p>
              <p className="text-3xl font-bold text-green-50">
                {"percentage" in result ? result.percentage : 0}%
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Formula:</strong> ({part} / {whole}) × 100 ={" "}
                {"percentage" in result ? result.percentage : 0}%
              </p>
            </div>
          </div>
        )}

        {calculationType === "change" && result && (
          <div className="space-y-4">
            <div
              className={`bg-gradient-to-r ${
                "isIncrease" in result && result.isIncrease
                  ? "from-green-500 to-green-600"
                  : "from-red-500 to-red-600"
              } p-5 rounded-xl text-center shadow-md`}
            >
              <p className="text-xs text-white/80 mb-1">
                {"isIncrease" in result && result.isIncrease
                  ? "Percentage Increase"
                  : "Percentage Decrease"}
              </p>
              <p className="text-3xl font-bold text-white">
                {"percentageChange" in result
                  ? Math.abs(result.percentageChange)
                  : 0}
                %
              </p>
              <p className="text-xs text-white/80 mt-2">
                Change:{" "}
                {"change" in result
                  ? (result.change > 0 ? "+" : "") + result.change
                  : 0}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                  Original Value
                </p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {originalValue}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                  New Value
                </p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {newValue}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Formula:</strong> (({newValue} - {originalValue}) /{" "}
                {originalValue}) × 100 ={" "}
                {"percentageChange" in result ? result.percentageChange : 0}%
              </p>
            </div>
          </div>
        )}

        {calculationType === "addSubtract" && result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-orange-100 mb-1">
                {operation === "add" ? "Adding" : "Subtracting"} {percentage}%{" "}
                {operation === "add" ? "to" : "from"} {number}
              </p>
              <p className="text-3xl font-bold text-orange-50">
                {"result" in result ? result.result : 0}
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Original Amount:</strong> {number}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Percentage Amount ({percentage}%):</strong>{" "}
                {"percentageAmount" in result
                  ? Number(result.percentageAmount)
                  : 0}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Operation:</strong>{" "}
                {operation === "add" ? "Add" : "Subtract"}
              </p>
              <p className="text-sm font-semibold text-foreground">
                <strong>Result:</strong> {number}{" "}
                {operation === "add" ? "+" : "-"}{" "}
                {"percentageAmount" in result
                  ? Number(result.percentageAmount)
                  : 0}{" "}
                = {"result" in result ? Number(result.result) : 0}
              </p>
            </div>
          </div>
        )}

        {calculationType === "difference" && result && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-purple-100 mb-1">
                Percentage Difference between {value1} and {value2}
              </p>
              <p className="text-3xl font-bold text-purple-50">
                {"percentageDifference" in result
                  ? result.percentageDifference
                  : 0}
                %
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                  Value 1
                </p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {value1}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                  Value 2
                </p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {value2}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Absolute Difference:</strong>{" "}
                {"difference" in result ? result.difference : 0}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Formula:</strong> (|{value1} - {value2}| / ((
                {value1} + {value2}) / 2)) × 100 ={" "}
                {"percentageDifference" in result
                  ? result.percentageDifference
                  : 0}
                %
              </p>
            </div>
          </div>
        )}
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="percentage"
        inputs={{
          calculationType,
          ...(calculationType === "percentage" && { number, percentage }),
          ...(calculationType === "find" && { part, whole }),
          ...(calculationType === "change" && { originalValue, newValue }),
          ...(calculationType === "addSubtract" && {
            number,
            percentage,
            operation,
          }),
          ...(calculationType === "difference" && { value1, value2 }),
        }}
        results={
          result
            ? (Object.fromEntries(
                Object.entries(result)
                  .filter(([_, v]) => typeof v === "number")
                  .map(([k, v]) => [k, Number(v)]),
              ) as Record<string, number>)
            : {}
        }
      />
    </div>
  );
};

export default PercentageCalculator;
