import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Coins, Info, Calendar, Share2 } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ResultChart from '@/components/ui/ResultChart';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import InvestmentScheduleDialog, { ScheduleRow } from '@/components/InvestmentScheduleDialog';
import { useCurrency } from '@/hooks/useCurrency';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const LumpsumCalculator = () => {
  const { formatAmount, symbol } = useCurrency();
  const [investment, setInvestment] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [months, setMonths] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const totalYears = years + (months / 12);

  const lumpsumSchedule = useMemo(() => {
    const list: ScheduleRow[] = [];
    const rate = expectedReturn / 100;
    const totalYearsVal = Math.max(1, Math.ceil(totalYears));

    for (let y = 1; y <= totalYearsVal; y++) {
      const timeVal = y > totalYears ? totalYears : y;
      const fv = investment * Math.pow(1 + rate, timeVal);
      list.push({
        period: `Year ${y}`,
        invested: investment,
        interest: Math.round(Math.max(0, fv - investment)),
        total: Math.round(fv),
      });
    }
    return list;
  }, [investment, expectedReturn, totalYears]);

  const calculateLumpsum = () => {
    const rate = expectedReturn / 100;
    const futureValue = investment * Math.pow(1 + rate, totalYears);
    const returns = futureValue - investment;

    return {
      invested: investment,
      returns: Math.round(returns),
      total: Math.round(futureValue)
    };
  };

  const result = calculateLumpsum();

  const handleReset = () => {
    setInvestment(100000);
    setExpectedReturn(12);
    setYears(10);
    setMonths(0);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Lumpsum Calculator</h2>
              <p className="text-xs text-muted-foreground">One-time investment returns</p>
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
                  <DialogTitle>About Lumpsum Investment & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Lumpsum Investment?</h3>
                    <p className="text-muted-foreground">
                      Lumpsum investment is a one-time investment where you invest a large amount of money at once, rather than investing small amounts regularly (like SIP). This investment strategy is ideal when you have a substantial amount available and want to invest it immediately.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">When to Choose Lumpsum?</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>When you receive a large sum (bonus, inheritance, sale proceeds)</li>
                      <li>When you want to invest immediately and benefit from market timing</li>
                      <li>When you have a high-risk tolerance and can handle market volatility</li>
                      <li>When you're confident about market conditions</li>
                      <li>For short to medium-term investment goals (1-5 years)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Lumpsum vs SIP</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Lumpsum:</strong> One-time investment, potentially higher returns if timed well, but higher risk</li>
                      <li><strong>SIP:</strong> Regular investments, rupee cost averaging, lower risk, disciplined investing</li>
                      <li>Lumpsum requires market timing knowledge</li>
                      <li>SIP reduces timing risk through regular investments</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculation Formula</h3>
                    <p className="text-muted-foreground mb-2">
                      Lumpsum uses compound interest formula:
                    </p>
                    <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded mb-2">
                      Future Value = Principal × (1 + Rate)^Time
                    </p>
                    <p className="text-muted-foreground">
                      Where: Principal = Initial investment, Rate = Annual return rate, Time = Investment period in years
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Lumpsum investments are subject to market risks and volatility</li>
                      <li>Returns depend on entry timing and market performance</li>
                      <li>Power of compounding works best with longer investment horizons</li>
                      <li>Consider your risk tolerance before choosing lumpsum investment</li>
                      <li>Diversification is key - don't put all money in one asset class</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The Lumpsum calculator helps you estimate the future value of your one-time investment. Enter your investment amount, expected annual return, and investment period to see projected returns. This helps you plan your investments and set realistic financial goals.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: One-Time Investment</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Invest ₹5,00,000 lump sum for 10 years at 12% annual return<br />
                          <strong>Formula:</strong> Future Value = Principal × (1 + Rate)^Years<br />
                          <strong>Calculation:</strong> ₹5,00,000 × (1.12)^10 = ₹15,52,924<br />
                          <strong>Returns:</strong> ₹10,52,924 (211% gain)<br />
                          <strong>Growth:</strong> Money triples in 10 years at 12% return<br />
                          <strong>Use Case:</strong> Ideal for bonus, inheritance, or sale proceeds
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Bonus Investment Scenario</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Received ₹10,00,000 bonus, invest for 15 years at 10% return<br />
                          <strong>Option A - Keep in Savings:</strong> ₹10,00,000 → ₹12,00,000 (4% return)<br />
                          <strong>Option B - Invest Lumpsum:</strong> ₹10,00,000 → ₹41,77,248 (10% return)<br />
                          <strong>Difference:</strong> ₹29,77,248 more with investment<br />
                          <strong>Benefit:</strong> Lumpsum investment multiplies bonus significantly<br />
                          <strong>Tip:</strong> Invest windfalls immediately rather than keeping in savings
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Market Timing Impact</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹3,00,000 to invest, considering timing<br />
                          <strong>Market at Peak:</strong> Invest today → 10 years → ₹7,77,000<br />
                          <strong>Wait for Dip:</strong> Delay 2 years, get 20% better entry → 8 years → ₹7,73,000<br />
                          <strong>Reality:</strong> Waiting often hurts more than immediate investment<br />
                          <strong>Lesson:</strong> Time in market beats timing the market<br />
                          <strong>Strategy:</strong> Invest immediately if you have money ready
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Lumpsum vs SIP Comparison</p>
                        <p className="text-sm">
                          <strong>Lumpsum:</strong> ₹10,00,000 today, 10 years, 12% → ₹31,05,848<br />
                          <strong>SIP:</strong> ₹8,333/month (₹10L over 10 years), 12% → ₹18,50,000<br />
                          <strong>Difference:</strong> Lumpsum gives ₹12,55,848 more (67% higher)<br />
                          <strong>Reason:</strong> Full amount starts compounding immediately<br />
                          <strong>Trade-off:</strong> Lumpsum has higher risk but better returns if timed well<br />
                          <strong>When to Use:</strong> Lumpsum if you have large amount; SIP if building gradually
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Invest lump sum immediately when available - time in market beats timing</li>
                      <li>Diversify large lump sum across different asset classes to reduce risk</li>
                      <li>Consider staggered investment if uncertain about market conditions (25% each quarter)</li>
                      <li>Lumpsum works best for long-term goals (5+ years) where volatility smooths out</li>
                      <li>Don't wait for "perfect" entry point - historical data shows immediate investment wins</li>
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
          label="Investment amount"
          value={investment}
          onChange={setInvestment}
          min={1000}
          max={10000000}
          step={1000}
          prefix={symbol}
        />

        <CalculatorInput
          label="Expected return (p.a)"
          value={expectedReturn}
          onChange={setExpectedReturn}
          min={0}
          max={100}
          step={0.1}
          suffix="%"
        />

        <div className="bg-card p-4 rounded-lg border">
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground">Investment Period</label>
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
            Total period: <span className="font-semibold text-foreground">{totalYears.toFixed(1)} years</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>

        <ResultChart
          principal={result.invested}
          returns={result.returns}
          principalLabel="Invested"
          returnsLabel="Returns"
        />

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Invested amount</span>
            <span className="font-semibold text-foreground">{formatAmount(result.invested)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Expected returns</span>
            <span className="font-semibold text-primary">{formatAmount(result.returns)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Total value</span>
            <span className="text-xl font-bold text-primary">{formatAmount(result.total)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full gap-2 h-11 text-sm font-semibold border border-primary/20"
            onClick={() => setScheduleModalOpen(true)}
          >
            <Calendar className="w-4 h-4 text-primary" />
            View Annual Growth Schedule Table
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="lumpsum"
        inputs={{ investment, expectedReturn, years, months }}
        results={result}
      />

      <ShareReportModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Lumpsum Investment Report"
        inputs={[
          { label: "One-Time Investment", value: formatAmount(investment) },
          { label: "Expected Return (p.a)", value: `${expectedReturn}%` },
          { label: "Investment Duration", value: `${totalYears.toFixed(1)} Years` },
        ]}
        results={[
          { label: "Invested Amount", value: formatAmount(result.invested) },
          { label: "Estimated Returns", value: formatAmount(result.returns) },
          { label: "Total Maturity Value", value: formatAmount(result.total), isHighlight: true },
        ]}
        schedule={lumpsumSchedule}
      />

      <InvestmentScheduleDialog
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        title="Lumpsum Investment Growth Schedule"
        schedule={lumpsumSchedule}
      />
    </div>
  );
};

export default LumpsumCalculator;
