import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, HandCoins } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { formatCurrency } from '@/lib/calculations';

const GratuityCalculator = () => {
  const [lastDrawnSalary, setLastDrawnSalary] = useState(50000);
  const [yearsOfService, setYearsOfService] = useState(5);
  const [isGratuityActCovered, setIsGratuityActCovered] = useState(true);
  const [isEligible, setIsEligible] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

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