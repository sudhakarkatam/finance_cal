import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, TrendingUp, Info } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CAGRCalculator = () => {
  const [beginningValue, setBeginningValue] = useState(10000);
  const [endingValue, setEndingValue] = useState(15000);
  const [years, setYears] = useState(3);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const calculateCAGR = () => {
    const startValue = beginningValue;
    const endValue = endingValue;
    const timePeriod = years;

    // CAGR Formula: (Ending Value / Beginning Value)^(1 / Number of Years) - 1
    let cagr = 0;

    if (startValue > 0 && endValue > 0 && timePeriod > 0) {
      cagr = (Math.pow(endValue / startValue, 1 / timePeriod) - 1) * 100;
    }

    const totalGrowth = endValue - startValue;
    const absoluteReturn = ((endValue - startValue) / startValue) * 100;

    return {
      cagr: cagr,
      totalGrowth: Math.round(totalGrowth),
      absoluteReturn: Math.round(absoluteReturn * 100) / 100,
      beginningValue: startValue,
      endingValue: endValue,
      years: timePeriod
    };
  };

  const result = calculateCAGR();

  const handleReset = () => {
    setBeginningValue(10000);
    setEndingValue(15000);
    setYears(3);
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
              <h2 className="text-lg font-semibold text-foreground">CAGR Calculator</h2>
              <p className="text-xs text-muted-foreground">Compound Annual Growth Rate</p>
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
                  <DialogTitle>About CAGR & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is CAGR?</h3>
                    <p className="text-muted-foreground">
                      Compound Annual Growth Rate (CAGR) is the mean annual growth rate of an investment over a specified time period longer than one year. It represents one of the most accurate ways to calculate and determine returns for anything that can rise or fall in value over time.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">CAGR Formula</h3>
                    <p className="text-muted-foreground mb-2">
                      CAGR = (Ending Value / Beginning Value)<sup>(1/Number of Years)</sup> - 1
                    </p>
                    <p className="text-muted-foreground">
                      This formula smooths out the volatility and provides a single annualized rate that represents the consistent annual return over the investment period.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Use Cases</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Mutual Funds:</strong> Compare different mutual funds over the same time period</li>
                      <li><strong>Stocks:</strong> Evaluate stock performance over multiple years</li>
                      <li><strong>Portfolio Analysis:</strong> Assess overall investment portfolio growth</li>
                      <li><strong>Business Growth:</strong> Measure company revenue or profit growth rates</li>
                      <li><strong>Investment Planning:</strong> Project future investment values based on historical CAGR</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">CAGR vs Absolute Returns</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>CAGR:</strong> Shows annualized growth rate, accounts for compounding effect</li>
                      <li><strong>Absolute Returns:</strong> Shows total percentage gain/loss over the entire period</li>
                      <li>CAGR is better for comparing investments with different time periods</li>
                      <li>CAGR assumes reinvestment of gains, providing a smoothed growth rate</li>
                      <li>Absolute returns don't account for the time value or volatility</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>CAGR does not reflect investment risk or volatility</li>
                      <li>It assumes a steady growth rate, which may not match actual year-to-year performance</li>
                      <li>CAGR cannot be used for investments with negative ending values</li>
                      <li>It's most useful for investments held for more than one year</li>
                      <li>For SIP investments, CAGR should be used carefully as contributions occur over time</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The CAGR calculator helps you determine the annualized return rate of your investments. Simply enter your beginning value, ending value, and the time period to get the CAGR percentage. The calculator also shows absolute returns and total growth for comparison purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Mutual Fund Returns</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invested ₹1,00,000 in mutual fund in 2019, current value = ₹1,75,000 in 2024<br />
                          <strong>Time Period:</strong> 5 years<br />
                          <strong>Absolute Return:</strong> (₹1,75,000 - ₹1,00,000) / ₹1,00,000 = 75%<br />
                          <strong>CAGR Calculation:</strong> (1,75,000 / 1,00,000)^(1/5) - 1 = 11.84%<br />
                          <strong>Result:</strong> Your investment grew at 11.84% annually, not 75%/5 = 15%<br />
                          <strong>Insight:</strong> CAGR shows smoothed annual growth rate accounting for compounding
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Stock Investment</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Bought shares for ₹50,000 in 2020, sold for ₹95,000 in 2023<br />
                          <strong>Time Period:</strong> 3 years<br />
                          <strong>Absolute Return:</strong> 90% total<br />
                          <strong>CAGR:</strong> (95,000 / 50,000)^(1/3) - 1 = 23.87% per year<br />
                          <strong>Comparison:</strong> If simple interest, would be 30%/year, but CAGR is 23.87%<br />
                          <strong>Use:</strong> CAGR helps compare with other investments over different periods
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: CAGR vs Absolute Returns</p>
                        <p className="text-sm">
                          <strong>Investment A:</strong> ₹1,00,000 → ₹2,00,000 in 7 years (100% absolute, 10.41% CAGR)<br />
                          <strong>Investment B:</strong> ₹1,00,000 → ₹1,80,000 in 5 years (80% absolute, 12.47% CAGR)<br />
                          <strong>Which is better?</strong> Investment B has higher CAGR (12.47% vs 10.41%)<br />
                          <strong>Lesson:</strong> CAGR normalizes time period - B grew faster annually despite lower total return<br />
                          <strong>Tip:</strong> Always use CAGR when comparing investments with different time periods
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Negative Returns Recovery</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invested ₹2,00,000, value dropped to ₹1,40,000 in 2 years<br />
                          <strong>CAGR:</strong> (1,40,000 / 2,00,000)^(1/2) - 1 = -16.18% per year<br />
                          <strong>To Recover:</strong> Need to reach ₹2,00,000 again<br />
                          <strong>Required CAGR:</strong> If recovered in 2 more years, need 19.35% CAGR<br />
                          <strong>Reality Check:</strong> It takes higher returns to recover from losses due to compounding math
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Use CAGR to compare investments with different holding periods fairly</li>
                      <li>CAGR doesn't show volatility - a 12% CAGR could have big ups and downs</li>
                      <li>For SIP investments, CAGR calculation should account for monthly contributions</li>
                      <li>Compare your CAGR with benchmark indices (Sensex/Nifty) to evaluate performance</li>
                      <li>CAGR assumes reinvestment - if you withdrew dividends, actual returns differ</li>
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
              label="Beginning Value"
              value={beginningValue}
              onChange={setBeginningValue}
              min={1}
              max={10000000}
              step={100}
              prefix="₹"
              placeholder="10000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Initial investment or starting amount
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Ending Value"
              value={endingValue}
              onChange={setEndingValue}
              min={1}
              max={100000000}
              step={100}
              prefix="₹"
              placeholder="15000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Final value or current amount
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={50}
              step={0.5}
              suffix="Years"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Investment period in years
            </p>
          </div>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
        >
          <TrendingUp className="w-5 h-5" />
          Calculate CAGR
        </Button>
      </Card>

      <Card className="p-6 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">CAGR Analysis</h3>

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-xl">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Compound Annual Growth Rate (CAGR)</p>
            <p className="text-3xl font-bold text-primary">{result.cagr > 0 ? `${result.cagr.toFixed(2)}%` : 'Invalid Input'}</p>
            <p className="text-xs text-muted-foreground mt-1">Annual growth rate</p>
          </div>
        </div>

        <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Beginning Value</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.beginningValue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Ending Value</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.endingValue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Time Period</span>
            <span className="font-semibold text-foreground">{result.years} years</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Growth</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.totalGrowth)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Absolute Return</span>
            <span className="font-semibold text-foreground">{result.absoluteReturn}%</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>CAGR Formula:</strong> (Ending Value / Beginning Value)<sup>1/Time Period</sup> - 1
            <br /><br />
            CAGR represents the annual growth rate that would take you from the beginning value to the ending value over the specified time period, assuming compound growth.
          </p>
        </div>

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
        calculationType="fd"
        inputs={{ beginningValue, endingValue, years }}
        results={{
          cagr: Math.round(result.cagr * 100) / 100,
          totalGrowth: result.totalGrowth,
          absoluteReturn: result.absoluteReturn,
          beginningValue: result.beginningValue,
          endingValue: result.endingValue,
          years: result.years
        }}
      />
    </div>
  );
};

export default CAGRCalculator;