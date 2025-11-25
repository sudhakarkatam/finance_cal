import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  Calculator,
  PiggyBank,
  TrendingUp,
  Info,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import { calculateSSY } from "@/lib/calculations";
import { useCurrency } from "@/hooks/useCurrency";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SSYCalculator = () => {
  const symbol = "₹";
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const [annualInvestment, setAnnualInvestment] = useState(150000);
  const [girlAge, setGirlAge] = useState(5);
  const [investmentStartYear, setInvestmentStartYear] = useState(
    new Date().getFullYear(),
  );
  const [interestRate, setInterestRate] = useState(8.2);
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(6);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const result = useMemo(() => {
    return calculateSSY(
      annualInvestment,
      girlAge,
      investmentStartYear,
      interestRate,
      inflationEnabled ? inflationRate : 0,
    );
  }, [
    annualInvestment,
    girlAge,
    investmentStartYear,
    interestRate,
    inflationEnabled,
    inflationRate,
  ]);

  const handleReset = () => {
    setAnnualInvestment(150000);
    setGirlAge(5);
    setInvestmentStartYear(new Date().getFullYear());
    setInterestRate(8.2);
    setInflationEnabled(false);
    setInflationRate(6);
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              SSY Calculator
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
                  <DialogTitle>About SSY & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      What is SSY?
                    </h3>
                    <p className="text-muted-foreground">
                      Sukanya Samriddhi Yojana (SSY) is a small savings scheme
                      launched by the Government of India exclusively for the
                      girl child. It is a long-term investment scheme designed
                      to help parents save for their daughter's education and
                      marriage expenses. The scheme offers attractive interest
                      rates and tax benefits under Section 80C of the Income Tax
                      Act.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Eligibility
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        The girl child must be below 10 years of age at the time
                        of account opening
                      </li>
                      <li>Only one SSY account can be opened per girl child</li>
                      <li>
                        Maximum two accounts per family (one for each girl
                        child)
                      </li>
                      <li>
                        Parents or legal guardians can open the account on
                        behalf of the girl child
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Investment Details
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        <strong>Minimum Investment:</strong> ₹250 per year
                      </li>
                      <li>
                        <strong>Maximum Investment:</strong> ₹1,50,000 per year
                      </li>
                      <li>
                        <strong>Investment Period:</strong> 15 years from
                        account opening
                      </li>
                      <li>
                        <strong>Maturity Period:</strong> 21 years from account
                        opening (girl's age should be 21 years)
                      </li>
                      <li>Investments can be made in multiples of ₹250</li>
                      <li>
                        Contributions must be made for 15 consecutive years
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Current Interest Rate
                    </h3>
                    <p className="text-muted-foreground">
                      <strong>8.2% p.a. (Quarter 1, FY 2024-25)</strong>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      The interest rate is reviewed and revised quarterly by the
                      Government of India. Interest is compounded annually and
                      credited to the account at the end of each financial year.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Tax Benefits
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        Investments qualify for tax deduction under Section 80C
                        (up to ₹1,50,000 per financial year)
                      </li>
                      <li>Interest earned is tax-free</li>
                      <li>Maturity proceeds are completely tax-free</li>
                      <li>
                        Triple tax benefit: Deduction on investment, tax-free
                        interest, tax-free maturity
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Withdrawal Rules
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>
                        <strong>Partial Withdrawal:</strong> Up to 50% of the
                        balance can be withdrawn after the girl child attains 18
                        years of age for higher education or marriage expenses
                      </li>
                      <li>
                        <strong>Premature Closure:</strong> Allowed in case of
                        death of the account holder or in case of extreme
                        compassionate grounds
                      </li>
                      <li>
                        <strong>Maturity:</strong> The account matures 21 years
                        from the date of opening, or when the girl child turns
                        21, whichever is later
                      </li>
                      <li>
                        After maturity, the entire balance can be withdrawn
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Calculator Features
                    </h3>
                    <p className="text-muted-foreground">
                      The SSY calculator helps you estimate the maturity amount
                      of your Sukanya Samriddhi Yojana investment. It factors in
                      your annual investment, the girl child's age, investment
                      start year, current interest rate, and optional inflation
                      adjustment to provide accurate projections for your
                      daughter's future financial needs.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      You can also enable inflation adjustment to see the real
                      purchasing power of your maturity amount, helping you
                      understand how inflation might impact your savings over
                      the 21-year period.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Examples to Understand Better
                    </h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Example 1: Basic Investment
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Girl age 5, Annual
                          investment = ₹1,50,000 (maximum), Interest rate = 8.2%
                          <br />
                          <strong>Calculation:</strong> Invest ₹1,50,000/year
                          for 15 years, then let it grow for 6 more years
                          <br />
                          <strong>Investment Period:</strong> 15 years
                          (₹22,50,000 total invested)
                          <br />
                          <strong>Maturity Period:</strong> 21 years total (girl
                          turns 21)
                          <br />
                          <strong>Result:</strong> Maturity amount approximately
                          ₹64-68 lakhs (depending on exact calculation)
                          <br />
                          <strong>Benefit:</strong> Triple tax benefit on entire
                          investment
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Example 2: Early Start Advantage
                        </p>
                        <p className="text-sm">
                          <strong>Situation A:</strong> Start at girl's age 1,
                          invest ₹1,50,000/year
                          <br />
                          <strong>Situation B:</strong> Start at girl's age 8,
                          invest ₹1,50,000/year
                          <br />
                          <strong>Difference:</strong> 7 extra years of
                          compounding
                          <br />
                          <strong>Result:</strong> Starting at age 1 gives
                          approximately 30-40% higher maturity amount
                          <br />
                          <strong>Lesson:</strong> Starting early maximizes
                          compounding benefits significantly
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Example 3: Partial Withdrawal for Education
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Girl turns 18, needs
                          ₹5,00,000 for higher education, Account balance =
                          ₹25,00,000
                          <br />
                          <strong>Calculation:</strong> Maximum withdrawal = 50%
                          of balance = ₹12,50,000
                          <br />
                          <strong>Result:</strong> Can withdraw ₹5,00,000 for
                          education expenses
                          <br />
                          <strong>Remaining:</strong> ₹20,00,000 continues to
                          grow for 3 more years till maturity
                          <br />
                          <strong>Benefit:</strong> Funds available when needed
                          without breaking the account
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Example 4: Inflation Impact
                        </p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invest ₹1,50,000/year,
                          8.2% interest, 6% inflation
                          <br />
                          <strong>Nominal Maturity:</strong> ₹65,00,000 (what
                          you'll get)
                          <br />
                          <strong>Inflation-Adjusted:</strong> ₹20-25 lakhs
                          (real purchasing power today)
                          <br />
                          <strong>Insight:</strong> Even with high returns,
                          inflation reduces real value by 60-70%
                          <br />
                          <strong>Tip:</strong> Consider increasing investment
                          periodically to maintain purchasing power
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Real-World Scenario
                        </p>
                        <p className="text-sm">
                          <strong>Priya's Story:</strong> Started SSY when
                          daughter was 3 years old, invested ₹1,50,000/year
                          <br />
                          <strong>After 15 years:</strong> Invested ₹22,50,000,
                          account value ≈ ₹35,00,000
                          <br />
                          <strong>At maturity (21 years):</strong> Final amount
                          ≈ ₹58,00,000
                          <br />
                          <strong>Tax Savings:</strong> Saved ₹2,02,500 in taxes
                          (30% slab) over 15 years
                          <br />
                          <strong>Total Benefit:</strong> ₹58,00,000 maturity +
                          ₹2,02,500 tax savings = ₹60,02,500 value from
                          ₹22,50,000 investment
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
                        Start as early as possible (when girl is 0-5 years) to
                        maximize compounding
                      </li>
                      <li>
                        Invest maximum ₹1,50,000/year to get full tax benefit
                        and higher corpus
                      </li>
                      <li>
                        Make annual investment at start of financial year for
                        better returns
                      </li>
                      <li>
                        Use partial withdrawal (50%) after girl turns 18 for
                        education expenses
                      </li>
                      <li>
                        Account matures when girl turns 21 - plan big expenses
                        accordingly
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
          Calculate maturity amount for Sukanya Samriddhi Yojana - Government
          scheme for girl child education and marriage
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Annual Investment"
            value={annualInvestment}
            onChange={setAnnualInvestment}
            min={250}
            max={150000}
            step={250}
            prefix={symbol}
          />

          <CalculatorInput
            label="Age of Girl Child"
            value={girlAge}
            onChange={setGirlAge}
            min={0}
            max={10}
            step={1}
            suffix="years"
          />

          <CalculatorInput
            label="Investment Starting Year"
            value={investmentStartYear}
            onChange={setInvestmentStartYear}
            min={2020}
            max={2030}
            step={1}
          />

          <CalculatorInput
            label="Interest Rate (p.a)"
            value={interestRate}
            onChange={setInterestRate}
            min={1}
            max={15}
            step={0.1}
            suffix="%"
          />
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
            Account for inflation to see real purchasing power at maturity
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
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">
          SSY Investment Analysis
        </h3>

        {/* Investment Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">
            📋 Investment Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <p className="text-blue-600 mb-1">Investment Period</p>
              <p className="font-bold text-blue-800">
                {result.investmentYears} years
              </p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 mb-1">Maturity Period</p>
              <p className="font-bold text-blue-800">
                {result.totalMaturityYears} years
              </p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 mb-1">Maturity Year</p>
              <p className="font-bold text-blue-800">{result.maturityYear}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 mb-1">Interest Rate</p>
              <p className="font-bold text-blue-800">{result.interestRate}%</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-xs text-muted-foreground mb-1">
                Total Invested
              </p>
              <p className="text-base font-bold text-foreground">
                {formatAmount(result.totalInvested)}
              </p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">
                Total Interest
              </p>
              <p className="text-base font-bold text-primary">
                {formatAmount(result.totalInterest)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-center shadow-md">
              <p className="text-xs text-green-100 mb-1">
                {inflationEnabled
                  ? "Inflation-Adjusted Maturity Value"
                  : "Maturity Value"}
              </p>
              <p className="text-2xl font-bold text-green-50">
                {formatAmount(
                  inflationEnabled
                    ? result.inflationAdjustedValue
                    : result.maturityValue,
                )}
              </p>
            </div>

            {inflationEnabled && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-center shadow-md">
                <p className="text-xs text-blue-100 mb-1">
                  Nominal Maturity Value (without inflation)
                </p>
                <p className="text-xl font-bold text-blue-50">
                  {formatAmount(result.maturityValue)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Investment Schedule Info */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">
            📅 Investment Schedule
          </h4>
          <div className="space-y-2 text-sm text-amber-700">
            <div className="flex justify-between">
              <span>Annual Investment:</span>
              <span className="font-semibold">
                {formatAmount(annualInvestment)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Investment Period:</span>
              <span className="font-semibold">
                {investmentStartYear} - {investmentStartYear + 15}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Interest Accumulation:</span>
              <span className="font-semibold">
                {investmentStartYear + 15} - {result.maturityYear}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Maturity Date:</span>
              <span className="font-semibold">
                {result.maturityYear} (Girl's age: {girlAge + 21})
              </span>
            </div>
          </div>
        </div>

        {/* Inflation Impact */}
        {inflationEnabled && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">
              💰 Inflation Impact Analysis
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-purple-600 mb-1">Nominal Value</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatAmount(result.maturityValue)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-purple-600 mb-1">
                  Real Value (Inflation-Adjusted)
                </p>
                <p className="text-lg font-bold text-purple-800">
                  {formatAmount(result.inflationAdjustedValue)}
                </p>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2 text-center">
              Inflation erodes purchasing power by{" "}
              {Math.round(
                ((result.maturityValue - result.inflationAdjustedValue) /
                  result.maturityValue) *
                100,
              )}
              % over {result.totalMaturityYears} years
            </p>
          </div>
        )}

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-4 h-4" />
          Save Calculation
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="ssy"
        inputs={{
          annualInvestment,
          girlAge,
          investmentStartYear,
          interestRate,
          inflationEnabled: inflationEnabled ? 1 : 0,
          inflationRate: inflationEnabled ? inflationRate : 0,
        }}
        results={{
          totalInvested: result.totalInvested,
          totalInterest: result.totalInterest,
          maturityValue: result.maturityValue,
          inflationAdjustedValue: result.inflationAdjustedValue,
          maturityYear: result.maturityYear,
        }}
      />
    </div>
  );
};

export default SSYCalculator;
