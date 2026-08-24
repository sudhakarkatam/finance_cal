import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Scale, Share2 } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import ShareReportModal from '@/components/ShareReportModal';
import { useCurrency } from '@/hooks/useCurrency';

const LoanComparison = () => {
  const { formatAmount, symbol } = useCurrency();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  // Loan 1
  const [amount1, setAmount1] = useState(3500000);
  const [rate1, setRate1] = useState(8.5);
  const [tenure1, setTenure1] = useState(240);

  // Loan 2
  const [amount2, setAmount2] = useState(4000000);
  const [rate2, setRate2] = useState(9.2);
  const [tenure2, setTenure2] = useState(240);

  const calculateLoan = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    };
  };

  const loan1 = calculateLoan(amount1, rate1, tenure1);
  const loan2 = calculateLoan(amount2, rate2, tenure2);

  const handleReset = () => {
    setAmount1(3500000);
    setRate1(8.5);
    setTenure1(240);
    setAmount2(4000000);
    setRate2(9.2);
    setTenure2(240);
  };

  const getDifference = (val1: number, val2: number) => {
    return Math.abs(val1 - val2);
  };

  const getBetterOption = (val1: number, val2: number) => {
    return val1 < val2 ? 'loan1' : 'loan2';
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Compare Loans</h2>
              <p className="text-xs text-muted-foreground">Find the best loan option</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loan 1 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary text-center pb-2 border-b">LOAN 1</h3>

            <CalculatorInput
              label="Amount"
              value={amount1}
              onChange={setAmount1}
              min={0}
              max={50000000}
              step={100000}
              prefix={symbol}
              placeholder="3500000"
            />

            <CalculatorInput
              label="Interest Rate (p.a)"
              value={rate1}
              onChange={setRate1}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              placeholder="8.5"
            />

            <CalculatorInput
              label="Tenure"
              value={tenure1}
              onChange={setTenure1}
              min={0}
              max={360}
              step={12}
              suffix="M"
              placeholder="240"
            />
          </div>

          {/* Loan 2 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary text-center pb-2 border-b">LOAN 2</h3>

            <CalculatorInput
              label="Amount"
              value={amount2}
              onChange={setAmount2}
              min={0}
              max={50000000}
              step={100000}
              prefix={symbol}
              placeholder="4000000"
            />

            <CalculatorInput
              label="Interest Rate (p.a)"
              value={rate2}
              onChange={setRate2}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
              placeholder="9.2"
            />

            <CalculatorInput
              label="Tenure"
              value={tenure2}
              onChange={setTenure2}
              min={0}
              max={360}
              step={12}
              suffix="M"
              placeholder="240"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Comparison Results</h3>

        <div className="space-y-4">
          {/* Monthly EMI */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center mb-3">Monthly EMI</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-3 rounded ${getBetterOption(loan1.emi, loan2.emi) === 'loan1' ? 'bg-green-500/10 border border-green-500/20' : ''}`}>
                <p className={`text-xl font-bold ${getBetterOption(loan1.emi, loan2.emi) === 'loan1' ? 'text-green-600' : 'text-foreground'}`}>
                  {formatAmount(loan1.emi)}
                </p>
              </div>
              <div className={`text-center p-3 rounded ${getBetterOption(loan1.emi, loan2.emi) === 'loan2' ? 'bg-green-500/10 border border-green-500/20' : ''}`}>
                <p className={`text-xl font-bold ${getBetterOption(loan1.emi, loan2.emi) === 'loan2' ? 'text-green-600' : 'text-foreground'}`}>
                  {formatAmount(loan2.emi)}
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Difference: {formatAmount(getDifference(loan1.emi, loan2.emi))}
            </p>
          </div>

          {/* Total Interest */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center mb-3">Total Interest</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-3 rounded ${getBetterOption(loan1.totalInterest, loan2.totalInterest) === 'loan1' ? 'bg-green-500/10 border border-green-500/20' : ''}`}>
                <p className={`text-lg font-bold ${getBetterOption(loan1.totalInterest, loan2.totalInterest) === 'loan1' ? 'text-green-600' : 'text-foreground'}`}>
                  {formatAmount(loan1.totalInterest)}
                </p>
              </div>
              <div className={`text-center p-3 rounded ${getBetterOption(loan1.totalInterest, loan2.totalInterest) === 'loan2' ? 'bg-green-500/10 border border-green-500/20' : ''}`}>
                <p className={`text-lg font-bold ${getBetterOption(loan1.totalInterest, loan2.totalInterest) === 'loan2' ? 'text-green-600' : 'text-foreground'}`}>
                  {formatAmount(loan2.totalInterest)}
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Difference: {formatAmount(getDifference(loan1.totalInterest, loan2.totalInterest))}
            </p>
          </div>

          {/* Total Payment */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border-2 border-primary/20">
            <p className="text-sm text-muted-foreground text-center mb-3">Total Payment</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-3 rounded ${getBetterOption(loan1.totalPayment, loan2.totalPayment) === 'loan1' ? 'bg-green-500/10 border-2 border-green-500' : ''}`}>
                <p className={`text-xl font-bold ${getBetterOption(loan1.totalPayment, loan2.totalPayment) === 'loan1' ? 'text-green-600' : 'text-primary'}`}>
                  {formatAmount(loan1.totalPayment)}
                </p>
              </div>
              <div className={`text-center p-3 rounded ${getBetterOption(loan1.totalPayment, loan2.totalPayment) === 'loan2' ? 'bg-green-500/10 border-2 border-green-500' : ''}`}>
                <p className={`text-xl font-bold ${getBetterOption(loan1.totalPayment, loan2.totalPayment) === 'loan2' ? 'text-green-600' : 'text-primary'}`}>
                  {formatAmount(loan2.totalPayment)}
                </p>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              You save: {formatAmount(getDifference(loan1.totalPayment, loan2.totalPayment))}
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-sm text-center font-semibold text-primary">
              ✓ {getBetterOption(loan1.totalPayment, loan2.totalPayment) === 'loan1' ? 'Loan 1' : 'Loan 2'} is the better option
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="w-4 h-4" />
            Export & Share Comparison PDF
          </Button>
        </div>
      </Card>

      <ShareReportModal
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title="Side-by-Side Dual Loan Comparison Report"
        inputs={[
          { label: "Loan 1 Principal", value: formatAmount(amount1) },
          { label: "Loan 1 Interest Rate & Tenure", value: `${rate1}% | ${tenure1 / 12} Yrs (${tenure1} Mos)` },
          { label: "Loan 2 Principal", value: formatAmount(amount2) },
          { label: "Loan 2 Interest Rate & Tenure", value: `${rate2}% | ${tenure2 / 12} Yrs (${tenure2} Mos)` },
        ]}
        results={[
          { label: "Optimal Choice Recommendation", value: `✓ ${getBetterOption(loan1.totalPayment, loan2.totalPayment) === 'loan1' ? 'Loan Option 1' : 'Loan Option 2'} Saves More Money`, isHighlight: true },
          { label: "Loan 1 Monthly EMI", value: formatAmount(loan1.emi) },
          { label: "Loan 2 Monthly EMI", value: formatAmount(loan2.emi) },
          { label: "Total Interest Savings Difference", value: formatAmount(getDifference(loan1.totalInterest, loan2.totalInterest)) },
          { label: "Total Payment Outflow Savings Difference", value: formatAmount(getDifference(loan1.totalPayment, loan2.totalPayment)) },
        ]}
      />
    </div>
  );
};

export default LoanComparison;
