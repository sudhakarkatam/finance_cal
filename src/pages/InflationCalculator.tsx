import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Calculator, TrendingUp, Info, Share2 } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import {
  calculateInflation,
  calculatePresentValue,
} from "@/lib/calculations";
import { useCurrency } from "@/hooks/useCurrency";
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

const InflationCalculator = () => {
  const { formatAmount, symbol } = useCurrency();
  const [calculationType, setCalculationType] = useState<"future" | "present">(
    "future",
  );
  const [currentPrice, setCurrentPrice] = useState(100000);
  const [futurePrice, setFuturePrice] = useState(200000);
  const [inflationRate, setInflationRate] = useState(6);
  const [years, setYears] = useState(10);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const result = useMemo(() => {
    if (calculationType === "future") {
      return calculateInflation(currentPrice, inflationRate, years);
    } else {
      return calculatePresentValue(futurePrice, inflationRate, years);
    }
  }, [calculationType, currentPrice, futurePrice, inflationRate, years]);

  const handleReset = () => {
    setCalculationType("future");
    setCurrentPrice(100000);
    setFuturePrice(200000);
    setInflationRate(6);
    setYears(10);
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Inflation Calculator</h2>
              <p className="text-xs text-muted-foreground">
                Calculate future or present value
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
                  <DialogTitle>Inflation Calculator Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      What is Inflation?
                    </h3>
                    <p className="text-muted-foreground">
                      Inflation is the rate at which the general level of prices
                      for goods and services rises, causing purchasing power to
                      fall. A 6% inflation rate means that what costs ₹100 today
                      will cost ₹106 next year. Understanding inflation is
                      crucial for financial planning, retirement corpus
                      calculation, and long-term investment decisions.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Why Use Inflation Calculator?
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        Plan for future expenses accurately (education,
                        marriage, retirement)
                      </li>
                      <li>
                        Understand real value of your investments and savings
                      </li>
                      <li>
                        Set realistic financial goals considering inflation
                        impact
                      </li>
                      <li>Calculate how much to save today for future needs</li>
                      <li>
                        Compare nominal returns vs real returns on investments
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Formulas Used
                    </h3>
                    <div className="bg-muted p-3 rounded-lg space-y-2">
                      <p className="font-mono text-xs">
                        <strong>Future Value:</strong> FV = PV × (1 + r)^t
                      </p>
                      <p className="font-mono text-xs">
                        <strong>Present Value:</strong> PV = FV / (1 + r)^t
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Where: PV = Present Value, FV = Future Value, r =
                        Inflation Rate (as decimal), t = Time in years
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      India's Inflation Rates
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        <strong>General Inflation (CPI):</strong> 4-6% per year
                        (RBI target: 4% ±2%)
                      </li>
                      <li>
                        <strong>Food Inflation:</strong> 5-8% per year
                      </li>
                      <li>
                        <strong>Healthcare Inflation:</strong> 10-15% per year
                      </li>
                      <li>
                        <strong>Education Inflation:</strong> 8-12% per year
                      </li>
                      <li>
                        <strong>Real Estate:</strong> Varies by city, 5-10% in
                        metros
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Real-World Examples
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Example 1: Future Cost of Car
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Current Cost:</strong> ₹10,00,000
                          <br />
                          <strong>Inflation:</strong> 6% per year
                          <br />
                          <strong>Time:</strong> 5 years
                          <br />
                          <strong>Calculation:</strong> ₹10,00,000 × (1.06)^5 =
                          ₹13,38,226
                          <br />
                          <strong>Lesson:</strong> Need to save extra ₹3,38,226
                          to buy same car in 5 years
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Example 2: Retirement Planning
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Monthly Expenses Today:</strong> ₹50,000
                          <br />
                          <strong>Retirement After:</strong> 20 years
                          <br />
                          <strong>Inflation:</strong> 7% per year
                          <br />
                          <strong>Future Monthly Need:</strong> ₹50,000 ×
                          (1.07)^20 = ₹1,93,484
                          <br />
                          <strong>Insight:</strong> Need almost 4x current
                          expenses in 20 years
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Example 3: Real Value of Savings
                        </p>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          <strong>FD Amount in 10 years:</strong> ₹50,00,000
                          <br />
                          <strong>Inflation:</strong> 6% per year
                          <br />
                          <strong>Present Value:</strong> ₹50,00,000 / (1.06)^10
                          = ₹27,91,983
                          <br />
                          <strong>Lesson:</strong> ₹50L in 10 years = ₹28L today
                          in purchasing power
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Example 4: Education Planning
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>MBA Cost Today:</strong> ₹20,00,000
                          <br />
                          <strong>Child's Age:</strong> 8 years (needs at 18)
                          <br />
                          <strong>Education Inflation:</strong> 9% per year
                          <br />
                          <strong>Future Cost:</strong> ₹20,00,000 × (1.09)^10 =
                          ₹47,31,142
                          <br />
                          <strong>Action:</strong> Start SIP to accumulate ₹47+
                          lakhs
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Impact of Inflation Over Time
                    </h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-semibold mb-2">
                        ₹1,00,000 today will be worth (at 6% inflation):
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <strong>5 years:</strong> ₹74,726
                        </div>
                        <div>
                          <strong>10 years:</strong> ₹55,839
                        </div>
                        <div>
                          <strong>15 years:</strong> ₹41,727
                        </div>
                        <div>
                          <strong>20 years:</strong> ₹31,180
                        </div>
                        <div>
                          <strong>25 years:</strong> ₹23,300
                        </div>
                        <div>
                          <strong>30 years:</strong> ₹17,411
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                      Pro Tips
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>
                        Always factor inflation in long-term financial planning
                      </li>
                      <li>
                        Use category-specific inflation (education 9%,
                        healthcare 12%)
                      </li>
                      <li>
                        Invest in assets that beat inflation (equity, real
                        estate)
                      </li>
                      <li>
                        Increase SIP contributions annually to match inflation
                      </li>
                      <li>
                        Calculate retirement needs using 7-8% inflation for
                        safety
                      </li>
                      <li>Real return = Nominal return - Inflation rate</li>
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
            Calculation Type
          </Label>
          <Select
            value={calculationType}
            onValueChange={(value) =>
              setCalculationType(value as "future" | "present")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="future">Future Value</SelectItem>
              <SelectItem value="present">Present Value</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {calculationType === "future" ? (
          <CalculatorInput
            label="Current price"
            value={currentPrice}
            onChange={setCurrentPrice}
            min={1}
            max={100000000}
            step={1000}
            prefix={symbol}
          />
        ) : (
          <CalculatorInput
            label="Future price"
            value={futurePrice}
            onChange={setFuturePrice}
            min={1}
            max={100000000}
            step={1000}
            prefix={symbol}
          />
        )}

        <CalculatorInput
          label="Inflation rate"
          value={inflationRate}
          onChange={setInflationRate}
          min={0}
          max={50}
          step={0.1}
          suffix="%"
        />
        <CalculatorInput
          label="Time period"
          value={years}
          onChange={setYears}
          min={1}
          max={50}
          step={1}
          suffix="years"
        />

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Calculator className="w-4 h-4" />
          Calculate
        </Button>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold">Result</h3>
        {calculationType === "future" ? (
          <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md">
            <p className="text-xs text-primary-foreground/80 mb-1">
              Future Price
            </p>
            <p className="text-3xl font-bold text-primary-foreground">
              {formatAmount("futurePrice" in result ? result.futurePrice : 0)}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-center shadow-md">
            <p className="text-xs text-green-100 mb-1">Present Value</p>
            <p className="text-3xl font-bold text-green-50">
              {formatAmount(
                "presentValue" in result ? result.presentValue : 0,
              )}
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/10"
          onClick={() => setShareDialogOpen(true)}
        >
          <Share2 className="w-4 h-4" />
          Export & Share Report PDF
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="inflation"
        inputs={{
          calculationType,
          currentPrice:
            calculationType === "future" ? currentPrice : futurePrice,
          inflationRate,
          years,
        }}
        results={
          calculationType === "future"
            ? { futurePrice: "futurePrice" in result ? result.futurePrice : 0 }
            : {
              presentValue:
                "presentValue" in result ? result.presentValue : 0,
            }
        }
      />

      <ShareReportModal
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title="Inflation Purchasing Power Impact Report"
        inputs={[
          { label: "Calculation Type", value: calculationType === "future" ? "Future Cost Projection" : "Present Value Equivalency" },
          { label: calculationType === "future" ? "Today's Cost/Price" : "Target Future Cost", value: formatAmount(calculationType === "future" ? currentPrice : futurePrice) },
          { label: "Annual Inflation Rate", value: `${inflationRate}%` },
          { label: "Time Duration", value: `${years} Years` },
        ]}
        results={[
          {
            label: calculationType === "future" ? "Projected Future Cost" : "Equivalent Present Value",
            value: formatAmount(calculationType === "future" ? ("futurePrice" in result ? result.futurePrice : 0) : ("presentValue" in result ? result.presentValue : 0)),
            isHighlight: true
          },
          { label: "Purchasing Power Loss", value: `${Math.round((1 - 1 / Math.pow(1 + inflationRate / 100, years)) * 100)}%` },
        ]}
      />
    </div>
  );
};

export default InflationCalculator;
