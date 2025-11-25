import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, PiggyBank, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCurrency } from '@/hooks/useCurrency';

const FDCalculator = () => {
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  const [depositAmount, setDepositAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7);
  const [tenure, setTenure] = useState(1); // in years
  const [frequency, setFrequency] = useState('4'); // Quarterly
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const calculateFD = () => {
    const principal = depositAmount; // P
    const rate = interestRate / 100; // R (convert percentage to decimal)
    const years = tenure; // N (tenure in years)
    const compoundingFreq = Number(frequency); // F (compounding frequency per year)

    // FD Formula: A = P * (1 + R/F) ^ (F * N)
    const maturityAmount = principal * Math.pow(1 + rate / compoundingFreq, compoundingFreq * years);
    const interest = maturityAmount - principal;

    // TDS calculation (if interest > 40,000 for individuals)
    const tds = interest > 40000 ? interest * 0.1 : 0;

    return {
      principal,
      interest: Math.round(interest),
      maturityAmount: Math.round(maturityAmount),
      tds: Math.round(tds),
      netReturn: Math.round(interest - tds)
    };
  };

  const result = calculateFD();

  const handleReset = () => {
    setDepositAmount(100000);
    setInterestRate(7);
    setTenure(1);
    setFrequency('4');
  };

  const frequencyOptions = [
    { value: '1', label: 'Yearly' },
    { value: '2', label: 'Half-Yearly' },
    { value: '4', label: 'Quarterly' },
    { value: '12', label: 'Monthly' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">FD Calculator</h2>
              <p className="text-xs text-muted-foreground">Fixed Deposit returns calculator</p>
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
                  <DialogTitle>About FD & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Fixed Deposit (FD)?</h3>
                    <p className="text-muted-foreground">
                      Fixed Deposit (FD) is a financial instrument offered by banks and NBFCs where you deposit a lump sum amount for a fixed tenure at a predetermined interest rate. FD offers guaranteed returns and is one of the safest investment options in India.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Key Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Guaranteed Returns:</strong> Fixed interest rate for the entire tenure</li>
                      <li><strong>Safety:</strong> Low risk, covered under DICGC insurance (up to ₹5 lakh per bank)</li>
                      <li><strong>Flexibility:</strong> Choose tenure from 7 days to 10 years</li>
                      <li><strong>Tax Benefits:</strong> Tax-saving FDs (5-year lock-in) eligible under Section 80C</li>
                      <li><strong>Premature Withdrawal:</strong> Available with penalty (usually 0.5-1% reduction in interest rate)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Interest Compounding</h3>
                    <p className="text-muted-foreground mb-2">
                      FD interest can be compounded at different frequencies:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Monthly:</strong> Interest calculated and added monthly (12 times per year)</li>
                      <li><strong>Quarterly:</strong> Interest calculated and added quarterly (4 times per year) - Most common</li>
                      <li><strong>Half-Yearly:</strong> Interest calculated and added twice per year</li>
                      <li><strong>Yearly:</strong> Interest calculated and added once per year</li>
                    </ul>
                    <p className="text-muted-foreground mt-2">
                      <strong>Note:</strong> More frequent compounding (monthly/quarterly) generally gives higher returns than yearly compounding.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculation Formula</h3>
                    <p className="text-muted-foreground mb-2">
                      FD uses compound interest formula:
                    </p>
                    <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded mb-2">
                      Maturity Amount = Principal × (1 + Rate/Frequency)^(Frequency × Years)
                    </p>
                    <p className="text-muted-foreground">
                      Where: Rate = Annual interest rate, Frequency = Compounding frequency per year
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">TDS (Tax Deducted at Source)</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>TDS is deducted at 10% if interest exceeds ₹40,000 per year (₹50,000 for senior citizens)</li>
                      <li>TDS deducted only if PAN is provided</li>
                      <li>If no PAN, TDS is deducted at 20%</li>
                      <li>You can submit Form 15G/15H to avoid TDS if your total income is below taxable limit</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>FD interest rates vary by bank, tenure, and deposit amount</li>
                      <li>Longer tenures typically offer higher interest rates</li>
                      <li>Senior citizens usually get 0.25-0.50% extra interest rate</li>
                      <li>FD interest is fully taxable as per your income tax slab</li>
                      <li>Compare rates across banks before investing</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The FD calculator helps you estimate the maturity amount of your fixed deposit. Enter the deposit amount, interest rate, tenure, and compounding frequency to see projected returns, interest earned, and TDS deduction. This helps you plan your investments better.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Quarterly Compounding</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Deposit ₹5,00,000 for 5 years at 7% interest, quarterly compounding<br />
                          <strong>Quarterly Rate:</strong> 7% ÷ 4 = 1.75% per quarter<br />
                          <strong>Compounding:</strong> 5 years × 4 = 20 quarters<br />
                          <strong>Calculation:</strong> ₹5,00,000 × (1.0175)^20 = ₹7,07,274<br />
                          <strong>Interest Earned:</strong> ₹2,07,274<br />
                          <strong>vs Yearly:</strong> ₹7,01,276 (₹5,998 less) - quarterly compounding gives more<br />
                          <strong>Benefit:</strong> More frequent compounding = higher returns
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: TDS Calculation</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹10,00,000 FD for 3 years at 7%, quarterly compounding<br />
                          <strong>Annual Interest:</strong> ₹72,180 (exceeds ₹40,000 limit)<br />
                          <strong>TDS:</strong> ₹72,180 × 10% = ₹7,218 per year<br />
                          <strong>3-Year TDS:</strong> ₹21,654 deducted<br />
                          <strong>Net Interest:</strong> ₹2,15,886 - ₹21,654 = ₹1,94,232<br />
                          <strong>Maturity:</strong> ₹10,00,000 + ₹1,94,232 = ₹11,94,232<br />
                          <strong>Save TDS:</strong> Submit Form 15G/15H if total income below taxable limit
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Senior Citizen Rates</p>
                        <p className="text-sm">
                          <strong>Regular Rate:</strong> ₹10,00,000 for 5 years at 7% → ₹14,14,778<br />
                          <strong>Senior Citizen:</strong> ₹10,00,000 for 5 years at 7.5% → ₹14,44,057<br />
                          <strong>Extra Interest:</strong> ₹29,279 more (0.5% rate difference)<br />
                          <strong>Plus TDS Limit:</strong> ₹50,000 vs ₹40,000 (₹1,118 more saved)<br />
                          <strong>Total Benefit:</strong> ₹30,397 extra over 5 years<br />
                          <strong>Age Requirement:</strong> 60+ years to qualify for senior citizen rates
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Tax-Saving FD</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹1,50,000 in tax-saving FD (5-year lock-in) at 6.5%<br />
                          <strong>Tax Benefit:</strong> ₹1,50,000 deduction under Section 80C (saves ₹45,000 tax at 30%)<br />
                          <strong>Maturity:</strong> ₹2,06,138 after 5 years<br />
                          <strong>Interest Earned:</strong> ₹56,138 (fully taxable)<br />
                          <strong>Net Benefit:</strong> ₹45,000 tax saved + ₹56,138 interest = ₹1,01,138 value<br />
                          <strong>Effective Return:</strong> 13.5% including tax benefit<br />
                          <strong>Lock-in:</strong> 5 years mandatory - no premature withdrawal
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Example 5: Different Tenure Comparison</p>
                        <p className="text-sm">
                          <strong>₹5,00,000 Deposit at 7%:</strong><br />
                          <strong>1 Year:</strong> ₹5,35,616 (₹35,616 interest)<br />
                          <strong>3 Years:</strong> ₹6,15,037 (₹1,15,037 interest, 7.67% CAGR)<br />
                          <strong>5 Years:</strong> ₹7,07,274 (₹2,07,274 interest, 7.19% CAGR)<br />
                          <strong>10 Years:</strong> ₹10,00,000 (₹5,00,000 interest, doubles money)<br />
                          <strong>Insight:</strong> Longer tenure = higher total interest due to compounding<br />
                          <strong>Strategy:</strong> Lock in longer tenure if rates are attractive
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Choose quarterly compounding over yearly for better returns (typically 0.1-0.2% more)</li>
                      <li>Compare FD rates across banks - differences of 0.25-0.5% add up over years</li>
                      <li>Submit Form 15G (under 60) or 15H (60+) to avoid TDS if income below taxable limit</li>
                      <li>Senior citizens get 0.25-0.50% extra rate - leverage if eligible</li>
                      <li>Consider tax-saving FD only if you need Section 80C deduction - lock-in is 5 years</li>
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
          label="Deposit amount"
          value={depositAmount}
          onChange={setDepositAmount}
          min={1000}
          max={10000000}
          step={1000}
          prefix={symbol}
        />

        <CalculatorInput
          label="Interest Rate (p.a)"
          value={interestRate}
          onChange={setInterestRate}
          min={0}
          max={12}
          step={0.1}
          suffix="%"
          placeholder="7.0"
        />

        <CalculatorInput
          label="Tenure"
          value={tenure}
          onChange={setTenure}
          min={1}
          max={30}
          step={1}
          suffix="Years"
        />

        <div className="space-y-2">
          <Label>Interest compounding</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Results</h3>

        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 rounded-xl text-center shadow-md mb-4">
          <p className="text-xs text-primary-foreground/80 mb-1">Maturity Amount</p>
          <p className="text-3xl font-bold text-primary-foreground">{formatCurrency(result.maturityAmount)}</p>
        </div>

        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Principal amount</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.principal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total interest</span>
            <span className="font-semibold text-foreground">{formatCurrency(result.interest)}</span>
          </div>
          {result.tds > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">TDS (10%)</span>
              <span className="font-semibold text-destructive">-{formatCurrency(result.tds)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 rounded">
            <span className="text-base font-semibold text-foreground">Net returns</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(result.netReturn)}</span>
          </div>
        </div>

        {result.tds > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              TDS is deducted if interest exceeds ₹40,000 per year
            </p>
          </div>
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
        calculationType="fd"
        inputs={{ depositAmount, interestRate, tenure, frequency: Number(frequency) }}
        results={result}
      />
    </div>
  );
};

export default FDCalculator;
