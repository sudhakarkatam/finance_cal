import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, HandCoins, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const GratuityCalculator = () => {
  const [lastDrawnSalary, setLastDrawnSalary] = useState(50000);
  const [yearsOfService, setYearsOfService] = useState(5);
  const [isGratuityActCovered, setIsGratuityActCovered] = useState(true);
  const [isEligible, setIsEligible] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const calculateGratuity = () => {
    const basicSalary = lastDrawnSalary; // b = Last drawn basic salary + dearness allowance
    const tenureYears = yearsOfService; // n = Tenure of service in years
    const completedYears = Math.floor(tenureYears);

    // For employees with less than 5 years of service, gratuity is not applicable
    if (completedYears < 5) {
      return {
        gratuityAmount: 0,
        basicSalary,
        completedYears,
        isEligible: false,
        message: 'Gratuity is applicable only after 5 years of continuous service'
      };
    }

    let gratuityAmount = 0;

    if (isGratuityActCovered) {
      // Formula for employees covered under Gratuity Act: Gratuity = (n * b * 15) / 26
      gratuityAmount = (tenureYears * basicSalary * 15) / 26;
    } else {
      // Formula for employees not covered under Gratuity Act: Gratuity = (15 * last drawn salary * tenure) / 30
      gratuityAmount = (15 * basicSalary * tenureYears) / 30;
    }

    // Maximum gratuity limit as per Gratuity Act (₹20,00,000 for private sector)
    const maxGratuityLimit = 2000000;
    const finalGratuityAmount = Math.min(gratuityAmount, maxGratuityLimit);

    return {
      gratuityAmount: Math.round(finalGratuityAmount),
      basicSalary,
      completedYears,
      isEligible: true,
      message: `Gratuity calculated using ${isGratuityActCovered ? 'Gratuity Act' : 'Standard'} formula for ${completedYears} years of service`
    };
  };

  const result = calculateGratuity();

  const handleReset = () => {
    setLastDrawnSalary(50000);
    setYearsOfService(5);
    setIsGratuityActCovered(true);
    setIsEligible(true);
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <HandCoins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Gratuity Calculator</h2>
              <p className="text-xs text-muted-foreground">Calculate gratuity based on service tenure</p>
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
                  <DialogTitle>About Gratuity & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Gratuity?</h3>
                    <p className="text-muted-foreground">
                      Gratuity is a lump sum payment made by an employer to an employee as a token of gratitude for services rendered. It is governed by the Payment of Gratuity Act, 1972, and is paid when an employee completes 5 or more years of continuous service, retires, resigns, or in case of death or disablement.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Eligibility</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Minimum Service:</strong> 5 years of continuous service with the same employer</li>
                      <li><strong>Coverage:</strong> Applies to employees in establishments with 10 or more employees</li>
                      <li>Service can be continuous or broken, but must total 5 years</li>
                      <li>Part-time employees are also eligible if they meet the service criteria</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculation Formula</h3>
                    <p className="text-muted-foreground mb-2">
                      <strong>For employees covered under Gratuity Act:</strong>
                    </p>
                    <p className="text-muted-foreground mb-2 font-mono text-xs bg-muted p-2 rounded">
                      Gratuity = (Last drawn salary × 15/26) × Number of years of service
                    </p>
                    <p className="text-muted-foreground mb-2">
                      <strong>For employees NOT covered under Gratuity Act:</strong>
                    </p>
                    <p className="text-muted-foreground font-mono text-xs bg-muted p-2 rounded">
                      Gratuity = (Last drawn salary × 15/30) × Number of years of service
                    </p>
                    <p className="text-muted-foreground mt-2">
                      <strong>Note:</strong> Last drawn salary = Basic salary + Dearness Allowance (DA). The fraction 15/26 represents 15 days of salary for each year, where 26 represents working days in a month.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Maximum Limits</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Private Sector Employees:</strong> Maximum tax-exempt gratuity is ₹20,00,000 (effective March 29, 2018)</li>
                      <li><strong>Central Government Employees:</strong> Maximum gratuity limit is ₹25,00,000 (effective January 1, 2024)</li>
                      <li>Employers can pay more than the limit, but amounts above the limit are taxable</li>
                      <li>The limit applies to total gratuity received from all employers during the employee's career</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Tax Exemption</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Gratuity received by government employees is completely tax-free under Section 10(10)(i)</li>
                      <li>For employees covered under Gratuity Act: Gratuity up to ₹20 lakh is exempt under Section 10(10)(ii)</li>
                      <li>For employees NOT covered under Gratuity Act: Gratuity up to ₹20 lakh is exempt under Section 10(10)(iii)</li>
                      <li>Amount exceeding the exemption limit is taxable as "Income from Other Sources"</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">When Gratuity is Paid</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>On retirement or superannuation</li>
                      <li>On resignation after 5 years of service</li>
                      <li>On death or disablement (even if service is less than 5 years)</li>
                      <li>On termination due to retrenchment, layoff, or closure</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The Gratuity calculator helps you estimate the gratuity amount you're entitled to receive. It automatically applies the correct formula based on whether you're covered under the Gratuity Act and shows you the maximum tax-exempt limit applicable to your situation.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Standard 5 Years Service</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Last drawn salary = ₹50,000/month, Service = 7 years, Gratuity Act covered<br />
                          <strong>Formula:</strong> (Years × Salary × 15) ÷ 26<br />
                          <strong>Calculation:</strong> (7 × ₹50,000 × 15) ÷ 26 = ₹2,01,923<br />
                          <strong>Result:</strong> Gratuity amount = ₹2,01,923<br />
                          <strong>Tax Status:</strong> Fully tax-free (under ₹20 lakh limit)<br />
                          <strong>Note:</strong> If salary changes, only last drawn salary is considered
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: Maximum Limit Scenario</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Last salary = ₹1,00,000/month, Service = 25 years, Gratuity Act covered<br />
                          <strong>Calculation:</strong> (25 × ₹1,00,000 × 15) ÷ 26 = ₹14,42,308<br />
                          <strong>Limit:</strong> Maximum tax-free gratuity = ₹20,00,000 (private sector)<br />
                          <strong>Result:</strong> You receive ₹14,42,308 (below limit, fully tax-free)<br />
                          <strong>If Above Limit:</strong> Amount above ₹20 lakh is taxable as income
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Gratuity Act vs Non-Act</p>
                        <p className="text-sm">
                          <strong>Same Situation:</strong> Salary = ₹60,000, Service = 10 years<br />
                          <strong>Gratuity Act Formula:</strong> (10 × ₹60,000 × 15) ÷ 26 = ₹3,46,154<br />
                          <strong>Non-Act Formula:</strong> (15 × ₹60,000 × 10) ÷ 30 = ₹3,00,000<br />
                          <strong>Difference:</strong> ₹46,154 more under Gratuity Act<br />
                          <strong>Result:</strong> Covered employees get higher gratuity benefit<br />
                          <strong>Tip:</strong> Check if your organization is covered under Gratuity Act
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Tax Exemption Calculation</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Gratuity received = ₹22,00,000, Tax bracket = 30%<br />
                          <strong>Tax-Free Amount:</strong> ₹20,00,000 (maximum limit)<br />
                          <strong>Taxable Amount:</strong> ₹22,00,000 - ₹20,00,000 = ₹2,00,000<br />
                          <strong>Tax Payable:</strong> ₹2,00,000 × 30% = ₹60,000<br />
                          <strong>Net Receipt:</strong> ₹22,00,000 - ₹60,000 = ₹21,40,000<br />
                          <strong>Benefit:</strong> 90.9% of gratuity remains tax-free
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Real-World Scenario</p>
                        <p className="text-sm">
                          <strong>Sunil's Story:</strong> Worked 22 years, last salary = ₹80,000/month, covered under Gratuity Act<br />
                          <strong>Calculation:</strong> (22 × ₹80,000 × 15) ÷ 26 = ₹10,15,385<br />
                          <strong>Received:</strong> ₹10,15,385 (fully tax-free)<br />
                          <strong>Benefit:</strong> This was in addition to PF and other retirement benefits<br />
                          <strong>Value:</strong> Equivalent to 12.7 months of salary as bonus<br />
                          <strong>Planning:</strong> Sunil used this for home down payment in retirement
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Gratuity is calculated on basic salary + DA only, not total salary</li>
                      <li>Service period includes full years only - partial years are not counted</li>
                      <li>No gratuity if service is less than 5 years (except death/disablement)</li>
                      <li>Maximum ₹20 lakh is tax-free for private sector (₹25 lakh for government employees)</li>
                      <li>Can receive gratuity from multiple employers - limit applies to total from all</li>
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
              label="Last Drawn Salary (Basic + DA)"
              value={lastDrawnSalary}
              onChange={setLastDrawnSalary}
              min={10000}
              max={500000}
              step={1000}
              prefix="₹"
              placeholder="50000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Monthly basic salary + dearness allowance
            </p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Years of Service"
              value={yearsOfService}
              onChange={setYearsOfService}
              min={1}
              max={40}
              step={0.5}
              suffix="Years"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Total completed years of continuous service
            </p>
          </div>

          {/* Gratuity Act Coverage Toggle */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="gratuity-act" className="text-sm font-medium">
                Covered under Gratuity Act
              </Label>
              <Switch
                id="gratuity-act"
                checked={isGratuityActCovered}
                onCheckedChange={setIsGratuityActCovered}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isGratuityActCovered
                ? 'Uses formula: (Years × Salary × 15) ÷ 26'
                : 'Uses formula: (15 × Salary × Years) ÷ 30'
              }
            </p>
          </div>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
          onClick={() => setIsEligible(result.isEligible)}
        >
          <HandCoins className="w-5 h-5" />
          Calculate Gratuity
        </Button>
      </Card>

      <Card className="p-6 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Gratuity Calculation</h3>

        {!result.isEligible ? (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {result.message}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Gratuity Amount</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(result.gratuityAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
              </div>
            </div>

            <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Last Drawn Salary</span>
                <span className="font-semibold text-foreground">{formatCurrency(result.basicSalary)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Completed Years</span>
                <span className="font-semibold text-foreground">{result.completedYears} years</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Calculation Method</span>
                <span className="font-semibold text-foreground">
                  {isGratuityActCovered ? '15/26 days per year (Gratuity Act)' : '15/30 days per year (Standard)'}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Gratuity is calculated as per the Payment of Gratuity Act 1972.
                <br /><br />
                <strong>For Private Sector Employees:</strong> Maximum tax-exempt gratuity is ₹20,00,000 under Section 10(10) of Income Tax Act (effective March 29, 2018).
                <br /><br />
                <strong>For Central Government Employees:</strong> Maximum gratuity limit is ₹25,00,000 (effective January 1, 2024).
                <br /><br />
                <strong>Key Points:</strong>
                • Minimum 5 years of continuous service required for eligibility
                • Employers can pay higher amounts, but only the specified limits are tax-exempt
                • Tax-exempt limit applies to total gratuity received from all employers during career
              </p>
            </div>
          </>
        )}

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
        inputs={{ lastDrawnSalary, yearsOfService }}
        results={{
          gratuityAmount: result.gratuityAmount,
          basicSalary: result.basicSalary,
          completedYears: result.completedYears,
          isEligible: result.isEligible ? 1 : 0
        }}
      />
    </div>
  );
};

export default GratuityCalculator;