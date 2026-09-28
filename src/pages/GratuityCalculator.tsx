import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandCoins, Info, RotateCcw, Save, Share2 } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import ShareReportModal from '@/components/ShareReportModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { triggerHaptic } from '@/lib/haptics';
import { recordPositiveEngagement } from '@/lib/reviewManager';

const GratuityCalculator = () => {
  const symbol = "₹";
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const [lastDrawnSalary, setLastDrawnSalary] = useState(50000);
  const [yearsOfService, setYearsOfService] = useState(5);
  const [monthsOfService, setMonthsOfService] = useState(0);
  const [isGratuityActCovered, setIsGratuityActCovered] = useState(true);
  const [isEligible, setIsEligible] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const calculateGratuity = () => {
    const basicSalary = lastDrawnSalary; // Basic salary + Dearness Allowance (DA)
    const completedYears = Math.floor(yearsOfService);
    const months = Math.floor(monthsOfService);

    // Continuous service requirement: minimum 5 full years with the organization
    // (Except in cases of death or permanent disablement where 5 years is waived)
    if (completedYears < 5) {
      return {
        totalGratuity: 0,
        taxExemptGratuity: 0,
        taxableGratuity: 0,
        basicSalary,
        completedYears,
        months,
        effectiveYears: completedYears,
        isEligible: false,
        message: 'Gratuity is payable only after completing 5 continuous years of service (waived on death/disablement).'
      };
    }

    // Under Section 4(2) of Payment of Gratuity Act 1972:
    // Any fraction of service in excess of 6 months (>= 6 months) is rounded up to 1 full year.
    // For non-covered establishments: only completed full years are counted (months ignored).
    let effectiveYears = completedYears;
    if (isGratuityActCovered) {
      if (months >= 6) {
        effectiveYears = completedYears + 1;
      }
    }

    let calculatedGratuity = 0;

    if (isGratuityActCovered) {
      // Formula for employees covered under Gratuity Act: (Effective Years × Last Basic+DA × 15) / 26
      calculatedGratuity = (effectiveYears * basicSalary * 15) / 26;
    } else {
      // Formula for employees NOT covered: (Completed Years × Last Basic+DA × 15) / 30
      calculatedGratuity = (completedYears * basicSalary * 15) / 30;
    }

    // Statutory Tax Exemption Limit under Section 10(10):
    // ₹20,00,000 for private sector employees. Amounts in excess are taxable.
    const maxTaxExemptLimit = 2000000;
    const finalTotalGratuity = Math.round(calculatedGratuity);
    const taxExemptGratuity = Math.min(finalTotalGratuity, maxTaxExemptLimit);
    const taxableGratuity = Math.max(0, finalTotalGratuity - maxTaxExemptLimit);

    return {
      totalGratuity: finalTotalGratuity,
      taxExemptGratuity,
      taxableGratuity,
      basicSalary,
      completedYears,
      months,
      effectiveYears,
      isEligible: true,
      message: `Calculated using ${isGratuityActCovered ? 'Gratuity Act (15/26 days)' : 'Standard (15/30 days)'} formula for ${effectiveYears} effective years.`
    };
  };

  const result = calculateGratuity();

  const handleReset = () => {
    triggerHaptic();
    setLastDrawnSalary(50000);
    setYearsOfService(5);
    setMonthsOfService(0);
    setIsGratuityActCovered(true);
    setIsEligible(true);
  };

  const handleCalculateClick = () => {
    triggerHaptic();
    setIsEligible(result.isEligible);
    recordPositiveEngagement('gratuity_calculated');
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
              <p className="text-xs text-muted-foreground">Payment of Gratuity Act, 1972 statutory rules</p>
            </div>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    triggerHaptic();
                    setInfoDialogOpen(true);
                  }}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>About Gratuity & 2026 Statutory Rules</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">What is Gratuity?</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Gratuity is a statutory monetary benefit provided by employers under the Payment of Gratuity Act, 1972. It is given upon retirement, resignation after 5 continuous years, superannuation, or in the unfortunate event of death or permanent disability.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">5-Year Continuous Service Rule</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      An employee must complete at least 5 years of continuous service with the same employer to become eligible. The 5-year requirement is legally waived only in case of death or permanent disablement.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Calculation Formula & 6-Month Rounding Rule</h3>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-xs">
                      <p>
                        <strong>Covered under Gratuity Act (Sec 4(2)):</strong>
                      </p>
                      <p className="font-mono bg-background p-2 rounded border text-primary font-semibold">
                        Gratuity = (Effective Years × Last Basic + DA × 15) ÷ 26
                      </p>
                      <p className="text-muted-foreground">
                        * Under the Act, any tenure in excess of 6 months (≥ 6 months) rounds up to 1 full year. For example, 7 years 7 months is counted as 8 years.
                      </p>
                      <p className="pt-2 border-t">
                        <strong>Not Covered under Gratuity Act:</strong>
                      </p>
                      <p className="font-mono bg-background p-2 rounded border">
                        Gratuity = (Completed Years × Last Basic + DA × 15) ÷ 30
                      </p>
                      <p className="text-muted-foreground">
                        * Only completed full years are counted; extra months are truncated.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Tax Exemption Ceiling (Section 10(10))</h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      <li><strong>Private Sector:</strong> Up to ₹20,00,000 is 100% tax-free under Section 10(10). Any gratuity paid above ₹20 Lakhs is taxable under standard salary slabs.</li>
                      <li><strong>Central Government Employees:</strong> Gratuity ceiling is ₹25,00,000 (effective Jan 1, 2024 following 50% DA hike).</li>
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
            Complies with Payment of Gratuity Act, 1972 & Section 10(10) Indian Tax Rules.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <CalculatorInput
              label="Last Drawn Monthly Salary (Basic + DA)"
              value={lastDrawnSalary}
              onChange={setLastDrawnSalary}
              min={1000}
              max={1000000}
              step={1000}
              prefix={symbol}
              placeholder="50000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Basic salary plus Dearness Allowance (DA) only, excluding HRA or variable bonuses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <CalculatorInput
                label="Completed Years"
                value={yearsOfService}
                onChange={setYearsOfService}
                min={1}
                max={50}
                step={1}
                suffix="Years"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Full completed continuous years
              </p>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <CalculatorInput
                label="Additional Months"
                value={monthsOfService}
                onChange={setMonthsOfService}
                min={0}
                max={11}
                step={1}
                suffix="Months"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {isGratuityActCovered
                  ? "≥ 6 months rounds up to +1 full year under the Act"
                  : "Months are ignored for non-covered establishments"}
              </p>
            </div>
          </div>

          {/* Gratuity Act Coverage Toggle */}
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="gratuity-act" className="text-sm font-medium">
                Covered under Payment of Gratuity Act
              </Label>
              <Switch
                id="gratuity-act"
                checked={isGratuityActCovered}
                onCheckedChange={(val) => {
                  triggerHaptic();
                  setIsGratuityActCovered(val);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isGratuityActCovered
                ? "Formula: (Effective Years × Salary × 15) ÷ 26 (Standard for establishments with 10+ employees)"
                : "Formula: (Completed Years × Salary × 15) ÷ 30"}
            </p>
          </div>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold shadow-md"
          size="lg"
          onClick={handleCalculateClick}
        >
          <HandCoins className="w-5 h-5" />
          Calculate Gratuity
        </Button>
      </Card>

      <Card className="p-6 space-y-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">Gratuity Valuation</h3>

        {!result.isEligible ? (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {result.message}
            </p>
            <p className="text-xs text-yellow-700/80 dark:text-yellow-300/80 mt-1">
              You have currently entered {yearsOfService} years. Gratuity becomes payable once an employee completes 5 years of continuous service.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-5 rounded-2xl border border-primary/20">
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Total Gratuity Payable
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-primary">
                  {formatAmount(result.totalGratuity)}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                  {result.message}
                </p>
              </div>
            </div>

            {/* Tax Exemption Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 p-3.5 rounded-xl">
                <span className="text-xs font-semibold text-green-800 dark:text-green-300 block">
                  Tax-Exempt Portion (Sec 10(10))
                </span>
                <span className="text-xl font-bold text-green-700 dark:text-green-400 mt-1 block">
                  {formatAmount(result.taxExemptGratuity)}
                </span>
                <span className="text-[11px] text-green-700/70 dark:text-green-300/70 mt-0.5 block">
                  100% Tax-Free (Ceiling: ₹20 Lakh)
                </span>
              </div>

              <div className="bg-muted/40 border border-border p-3.5 rounded-xl">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Taxable Portion (Above ₹20L)
                </span>
                <span className={`text-xl font-bold mt-1 block ${result.taxableGratuity > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                  {formatAmount(result.taxableGratuity)}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  {result.taxableGratuity > 0
                    ? "Taxable at your income tax slab"
                    : "Fully exempt under statutory limit"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 bg-muted/30 p-4 rounded-xl text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Last Basic + DA</span>
                <span className="font-semibold text-foreground">{formatAmount(result.basicSalary)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/60">
                <span className="text-muted-foreground">Tenure Entered</span>
                <span className="font-semibold text-foreground">
                  {result.completedYears} yrs {result.months > 0 ? `${result.months} mos` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/60">
                <span className="text-muted-foreground">Effective Service for Formula</span>
                <span className="font-semibold text-primary">
                  {result.effectiveYears} Years
                  {isGratuityActCovered && result.months >= 6 ? " (Rounded up: ≥ 6 mos)" : ""}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-border/60">
                <span className="text-muted-foreground">Statutory Formula</span>
                <span className="font-medium text-foreground text-xs">
                  {isGratuityActCovered ? "15/26 days per year (Payment of Gratuity Act)" : "15/30 days per year"}
                </span>
              </div>
            </div>
          </>
        )}

        <Button
          className="w-full gap-2 h-11 text-base font-semibold"
          size="lg"
          onClick={() => {
            triggerHaptic();
            setSaveDialogOpen(true);
            recordPositiveEngagement('save');
          }}
        >
          <Save className="w-4 h-4" />
          Save Calculation
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/10 h-11"
          onClick={() => {
            triggerHaptic();
            setShareDialogOpen(true);
            recordPositiveEngagement('share_report');
          }}
        >
          <Share2 className="w-4 h-4" />
          Export & Share Report PDF
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="gratuity"
        inputs={{
          lastDrawnSalary,
          yearsOfService,
          monthsOfService,
          isGratuityActCovered: isGratuityActCovered ? 1 : 0
        }}
        results={{
          gratuityAmount: result.totalGratuity,
          taxExemptGratuity: result.taxExemptGratuity,
          taxableGratuity: result.taxableGratuity,
          basicSalary: result.basicSalary,
          completedYears: result.effectiveYears,
          isEligible: result.isEligible ? 1 : 0
        }}
      />

      <ShareReportModal
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title="Gratuity Benefit Valuation Statement"
        inputs={[
          { label: "Last Drawn Basic Salary (+DA)", value: formatAmount(lastDrawnSalary) },
          { label: "Service Tenure", value: `${yearsOfService} Years ${monthsOfService > 0 ? `${monthsOfService} Months` : ''}` },
          { label: "Effective Counted Years", value: `${result.effectiveYears} Years` },
          { label: "Gratuity Act Coverage", value: isGratuityActCovered ? "Covered (15/26 days)" : "Not Covered (15/30 days)" },
        ]}
        results={[
          { label: "Total Gratuity Payable", value: formatAmount(result.totalGratuity), isHighlight: true },
          { label: "Tax Exemption Limit (Sec 10(10))", value: formatAmount(result.taxExemptGratuity) },
          { label: "Taxable Gratuity", value: formatAmount(result.taxableGratuity) },
          { label: "Eligibility Status", value: result.isEligible ? "Eligible (>= 5 Years)" : "Not Eligible (< 5 Years)" },
        ]}
      />
    </div>
  );
};

export default GratuityCalculator;