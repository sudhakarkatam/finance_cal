import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Home, Info, Share2 } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import { calculateHRA } from '@/lib/calculations';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const HRACalculator = () => {
  const { formatAmount, symbol } = useCurrency();

  // State variables
  const [basicSalary, setBasicSalary] = useState(50000);
  const [dearnessAllowance, setDearnessAllowance] = useState(10000);
  const [hraReceived, setHraReceived] = useState(20000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [cityType, setCityType] = useState<'metro' | 'non-metro'>('metro');

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const result = useMemo(() => {
    return calculateHRA(basicSalary, dearnessAllowance, hraReceived, monthlyRent, cityType === 'metro');
  }, [basicSalary, dearnessAllowance, hraReceived, monthlyRent, cityType]);

  const handleReset = () => {
    setBasicSalary(50000);
    setDearnessAllowance(10000);
    setHraReceived(20000);
    setMonthlyRent(25000);
    setCityType('metro');
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">HRA Calculator</h2>
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
                  <DialogTitle>About HRA & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is HRA?</h3>
                    <p className="text-muted-foreground">
                      House Rent Allowance (HRA) is a component of salary provided by employers to employees to cover their rental accommodation expenses. It is one of the most common tax-saving components for salaried individuals in India, governed by Section 10(13A) of the Income Tax Act, 1961.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">HRA Exemption Rules</h3>
                    <p className="text-muted-foreground mb-2">
                      HRA exemption is calculated as the <strong>minimum</strong> of the following three amounts:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                      <li><strong>Actual HRA received</strong> from the employer</li>
                      <li><strong>Actual rent paid minus 10% of basic salary</strong> (rent - 10% of basic salary + DA)</li>
                      <li><strong>50% of salary</strong> (basic + DA) for metro cities <strong>OR 40% of salary</strong> for non-metro cities</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Metro vs Non-Metro Cities</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Metro Cities:</strong> Delhi, Mumbai, Kolkata, Chennai - 50% of salary exemption limit</li>
                      <li><strong>Non-Metro Cities:</strong> All other cities - 40% of salary exemption limit</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Requirements for HRA Exemption</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>You must actually be paying rent for a residential accommodation</li>
                      <li>You cannot claim HRA if you live in your own house or in rent-free accommodation</li>
                      <li>If rent exceeds ₹1,00,000 per year, you need to provide landlord's PAN card</li>
                      <li>Rent receipts should be maintained for submission to your employer or during tax filing</li>
                      <li>The rented property should be in the city where you are working (unless you can justify otherwise)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Only the <strong>exempt portion</strong> of HRA is tax-free - the remaining amount is taxable</li>
                      <li>If you don't receive HRA but pay rent, you cannot claim any tax benefit (HRA exemption is only for HRA received)</li>
                      <li>If you pay rent to family members (parents, spouse, etc.), they must show it as rental income in their tax returns</li>
                      <li>HRA benefits are available only to salaried individuals - self-employed cannot claim HRA exemption</li>
                      <li>The exemption is calculated on an annual basis but can be claimed monthly through your employer</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The HRA calculator helps you determine the exact tax exemption you can claim on your House Rent Allowance. It calculates all three exemption limits automatically and shows you the minimum amount that qualifies for tax exemption, along with potential tax savings across different tax slabs.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Metro City Exemption</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Basic = ₹50,000, DA = ₹10,000, HRA = ₹20,000, Rent = ₹25,000 (Mumbai)<br />
                          <strong>Calculation:</strong> Minimum of:
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>Actual HRA: ₹20,000</li>
                            <li>Rent - 10% Basic: ₹25,000 - ₹6,000 = ₹19,000</li>
                            <li>50% of Salary: 50% × ₹60,000 = ₹30,000</li>
                          </ul>
                          <strong>Result:</strong> Exemption = ₹19,000/month (minimum of three), Taxable HRA = ₹1,000/month<br />
                          <strong>Annual Savings:</strong> ₹19,000 × 12 = ₹2,28,000 tax-free, saving ₹68,400 (30% slab)
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Non-Metro City</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Basic = ₹40,000, DA = ₹5,000, HRA = ₹15,000, Rent = ₹18,000 (Pune)<br />
                          <strong>Calculation:</strong> Minimum of:
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>Actual HRA: ₹15,000</li>
                            <li>Rent - 10% Basic: ₹18,000 - ₹4,500 = ₹13,500</li>
                            <li>40% of Salary: 40% × ₹45,000 = ₹18,000</li>
                          </ul>
                          <strong>Result:</strong> Exemption = ₹13,500/month, Taxable HRA = ₹1,500/month<br />
                          <strong>Annual Savings:</strong> ₹1,62,000 tax-free, saving ₹48,600 (30% slab)
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Rent Higher Than HRA</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Basic = ₹60,000, HRA = ₹20,000, Rent = ₹35,000<br />
                          <strong>Calculation:</strong> Rent - 10% Basic = ₹35,000 - ₹6,000 = ₹29,000<br />
                          <strong>Limit:</strong> 50% of ₹60,000 = ₹30,000, Actual HRA = ₹20,000<br />
                          <strong>Result:</strong> Exemption = ₹20,000 (actual HRA), remaining ₹15,000 rent not covered<br />
                          <strong>Tip:</strong> If rent exceeds HRA significantly, negotiate higher HRA with employer
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Maximum Tax Savings</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Basic = ₹1,00,000, HRA = ₹50,000, Rent = ₹50,000 (Delhi)<br />
                          <strong>Calculation:</strong> Exemption = ₹50,000/month (full HRA)<br />
                          <strong>Annual Exemption:</strong> ₹6,00,000<br />
                          <strong>Tax Savings:</strong> ₹1,80,000/year (30% slab), ₹1,20,000 (20% slab), ₹30,000 (10% slab)<br />
                          <strong>Benefit:</strong> Maximum exemption possible when rent equals or exceeds HRA limit
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Scenario</p>
                        <p className="text-sm">
                          <strong>Raj's Story:</strong> Works in Bangalore, earns ₹80,000/month, pays ₹30,000 rent<br />
                          <strong>Mistake:</strong> Didn't claim HRA initially, paid tax on full ₹80,000<br />
                          <strong>After Calculation:</strong> Eligible for ₹24,000/month HRA exemption<br />
                          <strong>Loss:</strong> Paid extra ₹86,400 tax over 3 years (₹28,800/year at 30% slab)<br />
                          <strong>Lesson:</strong> Always claim HRA exemption - it's one of the biggest tax savers for salaried employees
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>If rent exceeds ₹1 lakh/year, maintain rent receipts and landlord's PAN card</li>
                      <li>Pay rent via bank transfer to maintain clear paper trail for IT Department</li>
                      <li>Negotiate higher HRA component if you pay high rent - it's tax-free</li>
                      <li>Can't claim HRA if you own the house or stay with parents without rent</li>
                      <li>Submit Form 12BB to employer at start of financial year for smooth processing</li>
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

        <Alert className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs ml-2">
            This calculator is designed for Indian financial rules (Rupees ₹).
          </AlertDescription>
        </Alert>

        <p className="text-sm text-muted-foreground">
          Calculate your House Rent Allowance tax exemption as per Income Tax Act Section 10(13A)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CalculatorInput
            label="Basic Salary (Monthly)"
            value={basicSalary}
            onChange={setBasicSalary}
            min={0}
            max={10000000}
            step={1000}
            prefix={symbol}
          />

          <CalculatorInput
            label="Dearness Allowance (Monthly)"
            value={dearnessAllowance}
            onChange={setDearnessAllowance}
            min={0}
            max={5000000}
            step={500}
            prefix={symbol}
          />

          <CalculatorInput
            label="HRA Received (Monthly)"
            value={hraReceived}
            onChange={setHraReceived}
            min={0}
            max={5000000}
            step={500}
            prefix={symbol}
          />

          <CalculatorInput
            label="Monthly Rent Paid"
            value={monthlyRent}
            onChange={setMonthlyRent}
            min={0}
            max={10000000}
            step={1000}
            prefix={symbol}
          />
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <Label className="text-sm font-medium text-foreground mb-3 block">City of Residence</Label>
          <Select value={cityType} onValueChange={(value: 'metro' | 'non-metro') => setCityType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select city type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metro">Metro City (Delhi, Mumbai, Kolkata, Chennai)</SelectItem>
              <SelectItem value="non-metro">Non-Metro City</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Metro cities: 50% exemption | Non-metro cities: 40% exemption
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">HRA Exemption Analysis</h3>

        {/* Calculation Breakdown */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">📋 HRA Exemption Calculation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-700">Annual Basic Salary:</span>
              <span className="font-semibold text-blue-800">{formatAmount(result.annualBasicSalary)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-700">Annual Dearness Allowance:</span>
              <span className="font-semibold text-blue-800">{formatAmount(result.annualDearnessAllowance)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-700">Annual HRA Received:</span>
              <span className="font-semibold text-blue-800">{formatAmount(result.annualHRAReceived)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-700">Annual Rent Paid:</span>
              <span className="font-semibold text-blue-800">{formatAmount(result.annualRent)}</span>
            </div>
          </div>
        </div>

        {/* Exemption Limits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
            <p className="text-xs text-orange-700 mb-1">Actual HRA Received</p>
            <p className="text-lg font-bold text-orange-800">{formatAmount(result.actualHRA)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
            <p className="text-xs text-purple-700 mb-1">Rent - 10% of Basic</p>
            <p className="text-lg font-bold text-purple-800">{formatAmount(result.rentMinus10PercentBasic)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <p className="text-xs text-green-700 mb-1">{cityType === 'metro' ? '50% of Salary' : '40% of Salary'}</p>
            <p className="text-lg font-bold text-green-800">{formatAmount(result.metroNonMetroLimit)}</p>
          </div>
        </div>

        {/* Final Results */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-center shadow-md">
            <p className="text-xs text-green-100 mb-1">HRA Exemption (Tax-Free)</p>
            <p className="text-2xl font-bold text-green-50">{formatAmount(result.hraExemption)}</p>
          </div>

          {result.taxableHRA > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl text-center shadow-md">
              <p className="text-xs text-red-100 mb-1">Taxable HRA</p>
              <p className="text-xl font-bold text-red-50">{formatAmount(result.taxableHRA)}</p>
            </div>
          )}
        </div>

        {/* Tax Savings */}
        {result.hraExemption > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2 text-center">💰 Tax Savings Estimate</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-white/70 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">5% Tax Slab</p>
                <p className="text-sm font-bold text-emerald-800">{formatAmount(Math.round(result.hraExemption * 0.05))}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">20% Tax Slab</p>
                <p className="text-sm font-bold text-emerald-800">{formatAmount(Math.round(result.hraExemption * 0.2))}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">30% Tax Slab</p>
                <p className="text-sm font-bold text-emerald-800">{formatAmount(Math.round(result.hraExemption * 0.3))}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">Max Savings</p>
                <p className="text-sm font-bold text-emerald-800">{formatAmount(Math.round(result.hraExemption * 0.3))}</p>
              </div>
            </div>
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
        calculationType="hra"
        inputs={{
          basicSalary,
          dearnessAllowance,
          hraReceived,
          monthlyRent,
          cityType
        }}
        results={{
          hraExemption: result.hraExemption,
          taxableHRA: result.taxableHRA,
          annualBasicSalary: result.annualBasicSalary,
          annualHRAReceived: result.annualHRAReceived,
          annualRent: result.annualRent
        }}
      />

      <ShareReportModal
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title="HRA Tax Exemption Statement"
        inputs={[
          { label: "Monthly Basic Salary", value: formatAmount(basicSalary) },
          { label: "Monthly DA", value: formatAmount(dearnessAllowance) },
          { label: "HRA Received (Monthly)", value: formatAmount(hraReceived) },
          { label: "Actual Rent Paid (Monthly)", value: formatAmount(monthlyRent) },
          { label: "City Classification", value: cityType === 'metro' ? "Metro City (50% Basic)" : "Non-Metro City (40% Basic)" },
        ]}
        results={[
          { label: "Annual HRA Exemption (Tax-Free)", value: formatAmount(result.hraExemption), isHighlight: true },
          { label: "Annual Taxable HRA Amount", value: formatAmount(result.taxableHRA) },
          { label: "Max Annual Tax Savings (30% Slab)", value: formatAmount(Math.round(result.hraExemption * 0.3)) },
        ]}
      />
    </div>
  );
};

export default HRACalculator;