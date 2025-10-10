import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Calculator, Home, IndianRupee } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { calculateHRA, formatCurrency } from '@/lib/calculations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const HRACalculator = () => {
  const [basicSalary, setBasicSalary] = useState(50000);
  const [dearnessAllowance, setDearnessAllowance] = useState(10000);
  const [hraReceived, setHraReceived] = useState(20000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [cityType, setCityType] = useState('metro');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

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
            prefix="₹"
          />

          <CalculatorInput
            label="Dearness Allowance (Monthly)"
            value={dearnessAllowance}
            onChange={setDearnessAllowance}
            min={0}
            max={5000000}
            step={500}
            prefix="₹"
          />

          <CalculatorInput
            label="HRA Received (Monthly)"
            value={hraReceived}
            onChange={setHraReceived}
            min={0}
            max={5000000}
            step={500}
            prefix="₹"
          />

          <CalculatorInput
            label="Monthly Rent Paid"
            value={monthlyRent}
            onChange={setMonthlyRent}
            min={0}
            max={10000000}
            step={1000}
            prefix="₹"
          />
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <Label className="text-sm font-medium text-foreground mb-3 block">City of Residence</Label>
          <Select value={cityType} onValueChange={setCityType}>
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
              <span className="font-semibold text-blue-800">{formatCurrency(result.annualBasicSalary)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-700">Annual Dearness Allowance:</span>
              <span className="font-semibold text-blue-800">{formatCurrency(result.annualDearnessAllowance)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-700">Annual HRA Received:</span>
              <span className="font-semibold text-blue-800">{formatCurrency(result.annualHRAReceived)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-700">Annual Rent Paid:</span>
              <span className="font-semibold text-blue-800">{formatCurrency(result.annualRent)}</span>
            </div>
          </div>
        </div>

        {/* Exemption Limits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
            <p className="text-xs text-orange-700 mb-1">Actual HRA Received</p>
            <p className="text-lg font-bold text-orange-800">{formatCurrency(result.actualHRA)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
            <p className="text-xs text-purple-700 mb-1">Rent - 10% of Basic</p>
            <p className="text-lg font-bold text-purple-800">{formatCurrency(result.rentMinus10PercentBasic)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <p className="text-xs text-green-700 mb-1">{cityType === 'metro' ? '50% of Salary' : '40% of Salary'}</p>
            <p className="text-lg font-bold text-green-800">{formatCurrency(result.metroNonMetroLimit)}</p>
          </div>
        </div>

        {/* Final Results */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-xl text-center shadow-md">
            <p className="text-xs text-green-100 mb-1">HRA Exemption (Tax-Free)</p>
            <p className="text-2xl font-bold text-green-50">{formatCurrency(result.hraExemption)}</p>
          </div>

          {result.taxableHRA > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl text-center shadow-md">
              <p className="text-xs text-red-100 mb-1">Taxable HRA</p>
              <p className="text-xl font-bold text-red-50">{formatCurrency(result.taxableHRA)}</p>
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
                <p className="text-sm font-bold text-emerald-800">{formatCurrency(Math.round(result.hraExemption * 0.05))}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">20% Tax Slab</p>
                <p className="text-sm font-bold text-emerald-800">{formatCurrency(Math.round(result.hraExemption * 0.2))}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">30% Tax Slab</p>
                <p className="text-sm font-bold text-emerald-800">{formatCurrency(Math.round(result.hraExemption * 0.3))}</p>
              </div>
              <div className="bg-white/70 p-3 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">Max Savings</p>
                <p className="text-sm font-bold text-emerald-800">{formatCurrency(Math.round(result.hraExemption * 0.3))}</p>
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
    </div>
  );
};

export default HRACalculator;