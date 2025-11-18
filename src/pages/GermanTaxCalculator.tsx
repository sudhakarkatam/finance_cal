import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Flag, Info } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import {
  calculateGermanIncomeTax,
  formatGermanCurrency,
  type GermanTaxInputs,
} from '@/lib/germanTaxCalculations';
import {
  type GermanTaxClass,
  type GermanState,
  TAX_CLASSES,
  GERMAN_STATES,
  DEDUCTIONS,
} from '@/lib/germanTaxConstants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

const GermanTaxCalculator = () => {
  // Basic Information
  const [grossIncome, setGrossIncome] = useState(50000);
  const [taxClass, setTaxClass] = useState<GermanTaxClass>('I');
  const [state, setState] = useState<GermanState>('Berlin');
  const [isChurchMember, setIsChurchMember] = useState(false);
  const [age, setAge] = useState(30);
  const [children, setChildren] = useState(0);

  // Deductions
  const [workRelatedExpenses, setWorkRelatedExpenses] = useState(DEDUCTIONS.workRelatedExpenses.standard);
  const [specialExpenses, setSpecialExpenses] = useState(0);
  const [extraordinaryBurdens, setExtraordinaryBurdens] = useState(0);

  // Social Security
  const [healthInsuranceType, setHealthInsuranceType] = useState<'public' | 'private' | 'exempt'>('public');
  const [healthInsuranceCost, setHealthInsuranceCost] = useState(0);

  // UI State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogField, setInfoDialogField] = useState<string | null>(null);
  const [additionalDeductionsOpen, setAdditionalDeductionsOpen] = useState(false);
  const [socialSecurityOpen, setSocialSecurityOpen] = useState(true);

  const result = useMemo(() => {
    const inputs: GermanTaxInputs = {
      grossIncome,
      taxClass,
      state,
      isChurchMember,
      age,
      children,
      workRelatedExpenses,
      specialExpenses,
      extraordinaryBurdens,
      healthInsuranceType,
      healthInsuranceCost: healthInsuranceType === 'private' ? healthInsuranceCost : undefined,
    };

    return calculateGermanIncomeTax(inputs);
  }, [
    grossIncome,
    taxClass,
    state,
    isChurchMember,
    age,
    children,
    workRelatedExpenses,
    specialExpenses,
    extraordinaryBurdens,
    healthInsuranceType,
    healthInsuranceCost,
  ]);

  const handleReset = () => {
    setGrossIncome(50000);
    setTaxClass('I');
    setState('Berlin');
    setIsChurchMember(false);
    setAge(30);
    setChildren(0);
    setWorkRelatedExpenses(DEDUCTIONS.workRelatedExpenses.standard);
    setSpecialExpenses(0);
    setExtraordinaryBurdens(0);
    setHealthInsuranceType('public');
    setHealthInsuranceCost(0);
  };

  // Info Icon Component
  const InfoIcon = ({ fieldName }: { fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => {
        setInfoDialogField(fieldName);
        setInfoDialogOpen(true);
      }}
    >
      <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
    </Button>
  );

  // Info Dialog Content Helper
  const getInfoContent = (fieldName: string) => {
    const infoContent: Record<string, JSX.Element> = {
      taxClass: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">German Tax Classes (Steuerklassen)</h3>
          <div className="space-y-2">
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Class I:</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Single individuals (not married, divorced, or widowed)</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Class II:</p>
              <p className="text-xs text-green-700 dark:text-green-300">Single parents (eligible for additional allowance of €4,260 + €240 per child)</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Class III/V:</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">Married couples with different incomes. Class III (higher earner) gets doubled basic allowance. Class V (lower earner) pays more upfront but gets refunded in tax return.</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Class IV/IV:</p>
              <p className="text-xs text-orange-700 dark:text-orange-300">Married couples with similar incomes. Both spouses in Class IV with standard calculation.</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Class VI:</p>
              <p className="text-xs text-red-700 dark:text-red-300">Multiple jobs or second job. No tax-free allowance, higher withholding. You get refunded in tax return.</p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            <strong>Note:</strong> Tax class only affects monthly withholding (salary tax). Your final tax liability is the same regardless of tax class when you file your tax return. Class III/V gives you more net income monthly but you may owe tax in your return.
          </p>
        </div>
      ),
      solidaritySurcharge: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Solidarity Surcharge (Solidaritätszuschlag)</h3>
          <p className="text-muted-foreground">
            An additional 5.5% surcharge on your income tax, introduced to finance German reunification.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Threshold:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-yellow-700 dark:text-yellow-300 ml-2">
              <li><strong>Single:</strong> Only applies if income tax &gt; €19,950</li>
              <li><strong>Married:</strong> Only applies if income tax &gt; €39,900</li>
            </ul>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              This corresponds to approximately €73,463 taxable income (single) or €146,926 (married). Most taxpayers are exempt from solidarity surcharge.
            </p>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            <strong>Calculation:</strong> If applicable, solidarity surcharge = 5.5% of your income tax amount.
          </p>
        </div>
      ),
      churchTax: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Church Tax (Kirchensteuer)</h3>
          <p className="text-muted-foreground">
            Members of recognized religious communities (Catholic, Evangelical, Jewish, etc.) pay church tax as a percentage of their income tax.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Church Tax Rates by State:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300 ml-2">
              <li><strong>8%:</strong> Bavaria, Baden-Württemberg</li>
              <li><strong>9%:</strong> All other states (Berlin, Hamburg, Hesse, etc.)</li>
            </ul>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            <strong>Important:</strong> Church tax is calculated as a percentage of your income tax, not your gross income. If you leave the church, you stop paying church tax.
          </p>
          <p className="text-muted-foreground text-xs">
            <strong>Deduction:</strong> Church tax is deductible from your income tax (reduces taxable income indirectly).
          </p>
        </div>
      ),
      socialSecurity: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Social Security Contributions</h3>
          <p className="text-muted-foreground">
            All employees in Germany must contribute to social security. These contributions are split equally between employer and employee.
          </p>
          <div className="space-y-2">
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Pension Insurance (Rentenversicherung):</p>
              <p className="text-xs text-green-700 dark:text-green-300">18.6% total (9.3% employee, 9.3% employer). Income ceiling: €85,200/year.</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Health Insurance (Krankenversicherung):</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">~14.6% total (7.3% employee). Public insurance varies by insurer. Private insurance: Fixed monthly cost set by insurer.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Unemployment Insurance (Arbeitslosenversicherung):</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">1.3% total (0.65% employee). Income ceiling: €85,200/year.</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Long-term Care Insurance (Pflegeversicherung):</p>
              <p className="text-xs text-orange-700 dark:text-orange-300">2.6% standard (0.8% employee). If age ≥23 and no children: 4.2% (2.4% employee). Income ceiling: €70,200/year.</p>
            </div>
          </div>
        </div>
      ),
      workRelatedExpenses: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Work-Related Expenses (Werbungskosten)</h3>
          <p className="text-muted-foreground">
            Costs directly related to your employment that you can deduct from taxable income.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Standard Allowance:</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">€1,230 per year (default). You can claim more if your actual expenses are higher.</p>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            <strong>Common expenses:</strong> Commuting costs, work-related travel, professional memberships, work equipment, home office costs, etc.
          </p>
        </div>
      ),
      grossIncome: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Gross Annual Income (Bruttoeinkommen)</h3>
          <p className="text-muted-foreground">
            Your total annual income BEFORE any taxes or deductions. This includes salary, bonuses, and other employment income.
          </p>
          <p className="text-muted-foreground text-xs">
            <strong>Where to find it:</strong> Check your employment contract or annual salary statement. This is your gross salary before deductions.
          </p>
          <p className="text-muted-foreground text-xs">
            <strong>Example:</strong> If you earn €5,000/month gross salary, annual gross income = €5,000 × 12 = €60,000
          </p>
        </div>
      ),
      state: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Federal State (Bundesland)</h3>
          <p className="text-muted-foreground">
            Germany has 16 federal states. The state you live in affects the church tax rate.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Church Tax Rates:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300 ml-2">
              <li><strong>8%:</strong> Bavaria, Baden-Württemberg</li>
              <li><strong>9%:</strong> All other 14 states (Berlin, Hamburg, Hesse, etc.)</li>
            </ul>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            <strong>Note:</strong> Income tax rates are the same nationwide. Only church tax rate varies by state.
          </p>
        </div>
      ),
      children: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Number of Children</h3>
          <p className="text-muted-foreground">
            Children affect your tax calculation through child allowances (Kinderfreibetrag) and long-term care insurance rates.
          </p>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Child Allowance:</p>
            <p className="text-xs text-green-700 dark:text-green-300">€6,024 per child per year (reduces taxable income)</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Long-term Care Insurance:</p>
            <p className="text-xs text-purple-700 dark:text-purple-300">If you have children, you pay standard 2.6% rate. If age ≥23 and no children, you pay 4.2% rate.</p>
          </div>
        </div>
      ),
      age: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Age</h3>
          <p className="text-muted-foreground">
            Your age affects the long-term care insurance rate.
          </p>
          <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Long-term Care Insurance:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-orange-700 dark:text-orange-300 ml-2">
              <li><strong>Age &lt; 23:</strong> Standard 2.6% rate</li>
              <li><strong>Age ≥ 23 + No children:</strong> Higher 4.2% rate (employee pays 2.4% instead of 0.8%)</li>
              <li><strong>Age ≥ 23 + Has children:</strong> Standard 2.6% rate</li>
            </ul>
          </div>
        </div>
      ),
      specialExpenses: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Special Expenses (Sonderausgaben)</h3>
          <p className="text-muted-foreground">
            Certain expenses that can be deducted from taxable income.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
            <li><strong>Insurance premiums:</strong> Health, life, liability insurance (if not already deducted)</li>
            <li><strong>Charitable donations:</strong> Donations to recognized charities (up to 20% of income)</li>
            <li><strong>Church tax:</strong> Automatically deducted if applicable</li>
            <li><strong>Pension contributions:</strong> Voluntary additional contributions</li>
          </ul>
        </div>
      ),
      extraordinaryBurdens: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Extraordinary Burdens (Außergewöhnliche Belastungen)</h3>
          <p className="text-muted-foreground">
            Unusual expenses that exceed your reasonable burden threshold based on income and family status.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Common Examples:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300 ml-2">
              <li>Medical expenses above reasonable burden (zumutbare Belastung)</li>
              <li>Nursing care costs</li>
              <li>Funeral expenses</li>
              <li>Disability-related costs</li>
            </ul>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            <strong>Note:</strong> Must exceed a reasonable burden threshold based on your income level. Lower-income earners have lower thresholds.
          </p>
        </div>
      ),
      healthInsuranceType: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Health Insurance Type</h3>
          <p className="text-muted-foreground">
            Germany requires all residents to have health insurance. The type affects your contribution amount.
          </p>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Public Health Insurance (Gesetzlich):</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-green-700 dark:text-green-300 ml-2">
              <li>~7.3% of gross income (employee share)</li>
              <li>Income ceiling: €70,200/year</li>
              <li>Minimum: ~€211.65/month, Maximum: ~€1,037.70/month</li>
              <li>Split equally between employer and employee</li>
              <li>Rates vary slightly by insurer (TK, AOK, hkk, etc.)</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Private Health Insurance (Privat):</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300 ml-2">
              <li>Fixed monthly cost set by insurer</li>
              <li>Employee pays full amount (employer pays contribution portion)</li>
              <li>Usually more expensive but better coverage</li>
              <li>Cost depends on age, health, coverage level</li>
            </ul>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Exempt:</p>
            <p className="text-xs text-purple-700 dark:text-purple-300">If insured by spouse, parents, or EU health insurance, you may be exempt.</p>
          </div>
        </div>
      ),
    };

    return (
      infoContent[fieldName] || (
        <div className="text-sm text-muted-foreground">
          Info about {fieldName} - Please refer to official German tax authorities for details.
        </div>
      )
    );
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Flag className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Germany Income Tax Calculator</h2>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setInfoDialogField('main');
                    setInfoDialogOpen(true);
                  }}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {infoDialogField === 'main'
                      ? 'About Germany Income Tax Calculator'
                      : `About ${infoDialogField}`}
                  </DialogTitle>
                </DialogHeader>
                {infoDialogField === 'main' ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">German Tax System</h3>
                      <p className="text-muted-foreground">
                        Germany has a progressive income tax system with rates from 0% to 45%. Tax class affects monthly withholding but not final tax liability. All employees pay social security contributions (health, pension, unemployment, long-term care).
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Tax-Free Allowance 2025</h3>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                        <p className="text-muted-foreground text-xs">
                          <strong>Single:</strong> €12,096 per year (Grundfreibetrag)
                        </p>
                        <p className="text-muted-foreground text-xs">
                          <strong>Married:</strong> €24,192 per year (doubled)
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Income below this threshold is tax-free.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Progressive Tax Rates 2025</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                        <li>0%: Up to €12,096 (tax-free)</li>
                        <li>14% to 24%: Progressive from €12,097 to €17,430</li>
                        <li>24% to 42%: Progressive from €17,431 to €68,429</li>
                        <li>42%: €68,430 to €277,825</li>
                        <li>45%: Above €277,826 (top rate)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Additional Taxes</h3>
                      <p className="text-muted-foreground text-xs">
                        <strong>Solidarity Surcharge:</strong> 5.5% of income tax (only if income tax &gt; €19,950 single / €39,900 married)
                      </p>
                      <p className="text-muted-foreground text-xs">
                        <strong>Church Tax:</strong> 8-9% of income tax (only if member of recognized religious community)
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Social Security Contributions</h3>
                      <p className="text-muted-foreground text-xs">
                        All employees must contribute to social security (health, pension, unemployment, long-term care). These are split equally between employer and employee.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Important Notes</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                        <li>Tax class only affects monthly withholding, not final tax liability</li>
                        <li>Class III/V gives more net income monthly but you may owe tax in your return</li>
                        <li>Married couples can choose between Class III/V (splitting) or Class IV/IV (equal)</li>
                        <li>All calculations based on 2025 German tax law (EStG)</li>
                        <li>Results are estimates - actual tax may vary based on individual circumstances</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  getInfoContent(infoDialogField || '')
                )}
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleReset} className="min-w-[80px]">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)} className="min-w-[80px]">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="social">Social Security</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Gross Annual Income</Label>
                  <InfoIcon fieldName="grossIncome" />
                </div>
                <CalculatorInput
                  label=""
                  value={grossIncome}
                  onChange={setGrossIncome}
                  min={0}
                  max={1000000}
                  step={1000}
                  prefix="€"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Tax Class</Label>
                  <InfoIcon fieldName="taxClass" />
                </div>
                <Select
                  value={taxClass}
                  onValueChange={(value: GermanTaxClass) => setTaxClass(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Class I - Single</SelectItem>
                    <SelectItem value="II">Class II - Single Parent</SelectItem>
                    <SelectItem value="III">Class III - Married (Higher Earner)</SelectItem>
                    <SelectItem value="IV">Class IV - Married (Equal Income)</SelectItem>
                    <SelectItem value="V">Class V - Married (Lower Earner)</SelectItem>
                    <SelectItem value="VI">Class VI - Second Job</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {TAX_CLASSES[taxClass].description}
                </p>
                {(taxClass === 'III' || taxClass === 'V') && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      <strong>Note:</strong> Class {taxClass === 'III' ? 'III' : 'V'} must be paired with Class {taxClass === 'III' ? 'V' : 'III'}. This calculator calculates for one spouse only. Your spouse should use Class {taxClass === 'III' ? 'V' : 'III'}.
                    </p>
                  </div>
                )}
                {taxClass === 'VI' && (
                  <div className="bg-orange-50 dark:bg-orange-950 p-2 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      <strong>Note:</strong> Class VI is for second jobs or multiple employment. You pay more tax upfront (no tax-free allowance) but get refunded in your tax return.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Federal State (Bundesland)</Label>
                  <InfoIcon fieldName="state" />
                </div>
                <Select
                  value={state}
                  onValueChange={(value: GermanState) => setState(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GERMAN_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    Church Tax Rate for {state}:{' '}
                    <span className="text-blue-700 dark:text-blue-300">
                      {GERMAN_STATES.find((s) => s.value === state)?.churchTaxRate === 0.08 ? '8%' : '9%'}
                    </span>
                    {GERMAN_STATES.find((s) => s.value === state)?.churchTaxRate === 0.08 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(Lower rate)</span>
                    )}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    This rate applies only if you are a member of a recognized religious community.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Church Tax Member</Label>
                  <InfoIcon fieldName="churchTax" />
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isChurchMember}
                      onCheckedChange={setIsChurchMember}
                    />
                    <Label>Member of recognized religious community</Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  If you are a member of Catholic, Evangelical, Jewish, or other recognized religious community, you pay church tax.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Age</Label>
                    <InfoIcon fieldName="age" />
                  </div>
                  <CalculatorInput
                    label=""
                    value={age}
                    onChange={setAge}
                    min={16}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Number of Children</Label>
                    <InfoIcon fieldName="children" />
                  </div>
                  <CalculatorInput
                    label=""
                    value={children}
                    onChange={setChildren}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Work-Related Expenses (Werbungskosten)</Label>
                  <InfoIcon fieldName="workRelatedExpenses" />
                </div>
                <CalculatorInput
                  label=""
                  value={workRelatedExpenses}
                  onChange={setWorkRelatedExpenses}
                  min={0}
                  max={100000}
                  step={100}
                  prefix="€"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Default: €1,230 (standard allowance). Enter higher amount if your actual expenses exceed this.
              </p>

              <Collapsible open={additionalDeductionsOpen} onOpenChange={setAdditionalDeductionsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="font-medium">Additional Deductions (Optional)</span>
                    {additionalDeductionsOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Special Expenses (Sonderausgaben)</Label>
                      <InfoIcon fieldName="specialExpenses" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={specialExpenses}
                      onChange={setSpecialExpenses}
                      min={0}
                      max={100000}
                      step={100}
                      prefix="€"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Insurance premiums, charitable donations, church tax (already deducted automatically).
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Extraordinary Burdens (Außergewöhnliche Belastungen)</Label>
                      <InfoIcon fieldName="extraordinaryBurdens" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={extraordinaryBurdens}
                      onChange={setExtraordinaryBurdens}
                      min={0}
                      max={100000}
                      step={100}
                      prefix="€"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Medical expenses above reasonable burden threshold.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Health Insurance Type</Label>
                  <InfoIcon fieldName="healthInsuranceType" />
                </div>
                <Select
                  value={healthInsuranceType}
                  onValueChange={(value: 'public' | 'private' | 'exempt') =>
                    setHealthInsuranceType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public Health Insurance (Gesetzlich)</SelectItem>
                    <SelectItem value="private">Private Health Insurance (Privat)</SelectItem>
                    <SelectItem value="exempt">Exempt (e.g., insured by spouse/parents/EU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {healthInsuranceType === 'private' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Monthly Private Health Insurance Cost</Label>
                    <InfoIcon fieldName="healthInsuranceType" />
                  </div>
                  <CalculatorInput
                    label=""
                    value={healthInsuranceCost}
                    onChange={setHealthInsuranceCost}
                    min={0}
                    max={2000}
                    step={50}
                    prefix="€"
                  />
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Pension, unemployment, and long-term care insurance are automatically calculated based on your gross income and age. These are mandatory contributions for all employees.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-4">Deductions Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Basic Allowance (Grundfreibetrag)</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.deductions.basicAllowance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Work-Related Expenses</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.deductions.workRelatedExpenses)}
                    </span>
                  </div>
                  {result.deductions.childAllowances > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Child Allowances ({children} child{children !== 1 ? 'ren' : ''})</span>
                      <span className="text-sm font-semibold">
                        {formatGermanCurrency(result.deductions.childAllowances)}
                      </span>
                    </div>
                  )}
                  {result.deductions.singleParentAllowance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Single Parent Allowance</span>
                      <span className="text-sm font-semibold">
                        {formatGermanCurrency(result.deductions.singleParentAllowance)}
                      </span>
                    </div>
                  )}
                  {result.deductions.specialExpenses > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Special Expenses</span>
                      <span className="text-sm font-semibold">
                        {formatGermanCurrency(result.deductions.specialExpenses)}
                      </span>
                    </div>
                  )}
                  {result.deductions.extraordinaryBurdens > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Extraordinary Burdens</span>
                      <span className="text-sm font-semibold">
                        {formatGermanCurrency(result.deductions.extraordinaryBurdens)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total Deductions</span>
                    <span>{formatGermanCurrency(result.deductions.totalDeductions)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4">Tax Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Gross Income</p>
                    <p className="text-lg font-bold">{formatGermanCurrency(result.grossIncome)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Taxable Income</p>
                    <p className="text-lg font-bold">{formatGermanCurrency(result.taxableIncome)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Income Tax</p>
                    <p className="text-lg font-bold">{formatGermanCurrency(result.incomeTax)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
                    <p className="text-lg font-bold">{result.effectiveTaxRate.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Income Tax</span>
                    <span className="text-sm font-semibold">{formatGermanCurrency(result.incomeTax)}</span>
                  </div>
                  {result.solidaritySurcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Solidarity Surcharge (5.5%)
                      </span>
                      <span className="text-sm font-semibold">
                        {formatGermanCurrency(result.solidaritySurcharge)}
                      </span>
                    </div>
                  )}
                  {result.churchTax > 0 && (
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Church Tax ({state} -{' '}
                          {GERMAN_STATES.find((s) => s.value === state)?.churchTaxRate === 0.08
                            ? '8%'
                            : '9%'}
                          )
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatGermanCurrency(result.churchTax)}
                      </span>
                    </div>
                  )}
                  {!isChurchMember && result.incomeTax > 0 && (
                    <div className="text-xs text-muted-foreground italic bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      Note: If you were a church member in {state}, church tax would be {GERMAN_STATES.find((s) => s.value === state)?.churchTaxRate === 0.08 ? '8%' : '9%'} of income tax (approximately {formatGermanCurrency(Math.round(result.incomeTax * (GERMAN_STATES.find((s) => s.value === state)?.churchTaxRate || 0.09) * 100) / 100)})
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total Taxes</span>
                    <span>{formatGermanCurrency(result.totalTaxes)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-lg mb-4">Social Security Contributions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Health Insurance</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.socialSecurity.healthInsurance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pension Insurance</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.socialSecurity.pensionInsurance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unemployment Insurance</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.socialSecurity.unemploymentInsurance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Long-term Care Insurance</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.socialSecurity.longTermCareInsurance)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total Social Contributions</span>
                    <span>{formatGermanCurrency(result.socialSecurity.total)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-lg mb-4">Net Income</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Annual Net Income</span>
                    <span className="font-bold">{formatGermanCurrency(result.netIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Net Income</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.monthly.netIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Effective Tax Rate</span>
                    <span className="text-sm font-semibold">{result.effectiveTaxRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Marginal Tax Rate</span>
                    <span className="text-sm font-semibold">{result.marginalTaxRate}%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4">Monthly Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Gross</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.monthly.grossIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Taxes</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.monthly.totalTaxes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Social Security</span>
                    <span className="text-sm font-semibold">
                      {formatGermanCurrency(result.monthly.socialSecurity)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Monthly Net</span>
                    <span>{formatGermanCurrency(result.monthly.netIncome)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="germantax"
        inputs={{
          grossIncome,
          taxClass,
          state,
          isChurchMember,
          age,
          children,
          workRelatedExpenses,
          specialExpenses,
          extraordinaryBurdens,
          healthInsuranceType,
          healthInsuranceCost,
        }}
        results={{
          grossIncome: result.grossIncome,
          taxableIncome: result.taxableIncome,
          incomeTax: result.incomeTax,
          solidaritySurcharge: result.solidaritySurcharge,
          churchTax: result.churchTax,
          totalTaxes: result.totalTaxes,
          socialSecurity: result.socialSecurity.total,
          netIncome: result.netIncome,
          effectiveTaxRate: result.effectiveTaxRate,
          marginalTaxRate: result.marginalTaxRate,
        }}
      />
    </div>
  );
};

export default GermanTaxCalculator;

