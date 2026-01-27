import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Briefcase, TrendingUp, AlertCircle, RotateCcw, Repeat, Banknote, CalendarDays, Percent, Save, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SaveDialog from '@/components/SaveDialog';
import { useCurrency } from '@/hooks/useCurrency';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TimeCostCalculator = () => {
    // Currency Defaults
    const CURRENCY_DEFAULTS: any = {
        INR: { salary: 50000, price: 5000, expenses: 2000, downPayment: 0, resale: 0 },
        USD: { salary: 4000, price: 500, expenses: 200, downPayment: 0, resale: 0 },
        EUR: { salary: 3500, price: 450, expenses: 150, downPayment: 0, resale: 0 },
        GBP: { salary: 3000, price: 400, expenses: 150, downPayment: 0, resale: 0 },
        JPY: { salary: 400000, price: 50000, expenses: 20000, downPayment: 0, resale: 0 },
    };

    // Update defaults when currency changes (optional UX choice: only if using defaults?)
    // For now, let's just use defaults on init or have a "Reset to Currency Defaults" button?
    // User requested "manage pre defined values... according to currencies". 
    // Best approach: useEffect that sets values ONLY if they seem to match the *previous* default (to avoid overwriting user data)
    // OR simpler: just set them when currency changes. Let's do that for the "Fresh" feel.

    // Actually, to be safe, I'll only update on mount or if the user hits Reset.
    // But the user *specifically* asked for management according to currencies.
    // Let's Add a useEffect that updates the defaults when the currency changes.
    // Let's Add a useEffect that updates the defaults when the currency changes.
    const { code, symbol, formatAmount } = useCurrency(); // destructure code directly

    useEffect(() => {
        const defaults = CURRENCY_DEFAULTS[code] || CURRENCY_DEFAULTS['INR'];
        setMonthlySalary(defaults.salary);
        setItemPrice(defaults.price);
        setMonthlyWorkExpenses(defaults.expenses);
        // We generally shouldn't overwrite *everything* if the user is typing, but for a Calculator app,
        // switching currency usually implies starting a new calculation context.
    }, [code]);

    // Basic Inputs
    const [monthlySalary, setMonthlySalary] = useState(50000);
    const [workHoursPerWeek, setWorkHoursPerWeek] = useState(40);
    const [itemPrice, setItemPrice] = useState(5000);

    // Advanced Inputs
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [commuteHoursPerWeek, setCommuteHoursPerWeek] = useState(5);
    const [monthlyWorkExpenses, setMonthlyWorkExpenses] = useState(2000);
    const [showSave, setShowSave] = useState(false);

    // New Optional Fields
    // 1. Cost Per Use
    const [lifespanYears, setLifespanYears] = useState(1);
    const [usageFrequency, setUsageFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'once'>('daily');

    // 2. Resale
    const [resaleValue, setResaleValue] = useState(0);

    // 3. EMI
    const [isEmi, setIsEmi] = useState(false);
    const [interestRate, setInterestRate] = useState(14); // Personal loan / Credit card
    const [loanTenureMonths, setLoanTenureMonths] = useState(12);
    const [downPayment, setDownPayment] = useState(0);

    // Constants
    const WEEKS_PER_MONTH = 4.33;
    const OPP_COST_RATE = 0.12; // 12% annual return
    const OPP_COST_YEARS = 10;

    // Calculations
    const results = useMemo(() => {
        // 1. Basic Hourly Rate
        const totalMonthlyWorkHours = workHoursPerWeek * WEEKS_PER_MONTH;
        const basicHourlyRate = monthlySalary / totalMonthlyWorkHours;

        // 2. True Hourly Rate (Advanced)
        let finalHourlyRate = basicHourlyRate;
        let trueMonthlyHours = totalMonthlyWorkHours;
        let trueMonthlyIncome = monthlySalary;

        if (isAdvancedMode) {
            trueMonthlyHours = (workHoursPerWeek + commuteHoursPerWeek) * WEEKS_PER_MONTH;
            trueMonthlyIncome = monthlySalary - monthlyWorkExpenses;
            // Prevent division by zero or negative income scenarios for safety
            if (trueMonthlyHours > 0) {
                finalHourlyRate = trueMonthlyIncome / trueMonthlyHours;
            }
        }

        // --- NEW CALCULATIONS ---

        // 3. Real Price (with EMI Interest)
        let totalInterest = 0;
        let realPrice = itemPrice;

        if (isEmi) {
            const principal = itemPrice - downPayment;
            if (principal > 0) {
                const r = interestRate / 12 / 100;
                const n = loanTenureMonths;
                const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                const totalAmountPaid = (emi * n) + downPayment;
                totalInterest = totalAmountPaid - itemPrice;
                realPrice = totalAmountPaid;
            }
        }

        // 4. Time Cost (Using Real Price)
        const hoursNeeded = finalHourlyRate > 0 ? realPrice / finalHourlyRate : 0;
        const daysNeeded = hoursNeeded / 8; // Assuming 8 hour work day for visualization
        const weeksNeeded = daysNeeded / 5;

        // 5. Cost Per Use
        const totalUses = (() => {
            const days = lifespanYears * 365;
            switch (usageFrequency) {
                case 'daily': return days;
                case 'weekly': return days / 7;
                case 'monthly': return days / 30;
                case 'once': return 1;
                default: return days;
            }
        })();

        // Net Cost for CPU (Real Price - Resale)
        const netCost = realPrice - resaleValue;
        const costPerUse = totalUses > 0 ? netCost / totalUses : 0;

        // 6. Opportunity Cost (Future Value of Real Price)
        // FV = PV * (1 + r)^n
        const futureValue = realPrice * Math.pow((1 + OPP_COST_RATE), OPP_COST_YEARS);

        return {
            basicHourlyRate,
            finalHourlyRate,
            hoursNeeded,
            daysNeeded,
            weeksNeeded,
            futureValue,
            trueMonthlyIncome,
            realPrice,
            totalInterest,
            costPerUse,
            netCost,
            totalUses
        };
    }, [monthlySalary, workHoursPerWeek, itemPrice, isAdvancedMode, commuteHoursPerWeek, monthlyWorkExpenses, isEmi, interestRate, loanTenureMonths, downPayment, lifespanYears, usageFrequency, resaleValue]);

    const handleReset = () => {
        setMonthlySalary(50000);
        setWorkHoursPerWeek(40);
        setItemPrice(5000);
        setCommuteHoursPerWeek(5);
        setMonthlyWorkExpenses(2000);
        setIsAdvancedMode(false);

        // Reset New Fields
        setLifespanYears(1);
        setUsageFrequency('daily');
        setResaleValue(0);
        setIsEmi(false);
        setInterestRate(14);
        setLoanTenureMonths(12);
        setDownPayment(0);
    };

    return (
        <div className="p-4 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Time-Cost Calculator</h1>
                        <p className="text-sm text-muted-foreground">Is it worth your time?</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                    <Button size="sm" onClick={() => setShowSave(true)}>
                        <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Inputs */}
                <div className="md:col-span-5 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Financial Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CalculatorInput
                                label="Monthly Take-home Salary"
                                value={monthlySalary}
                                onChange={setMonthlySalary}
                                prefix={symbol}
                            />
                            <CalculatorInput
                                label="Work Hours per Week"
                                value={workHoursPerWeek}
                                onChange={setWorkHoursPerWeek}
                                min={1}
                                max={168}
                            />
                            <CalculatorInput
                                label="Price of Item you want"
                                value={itemPrice}
                                onChange={setItemPrice}
                                prefix={symbol}
                            />


                            <Accordion type="single" collapsible className="w-full pt-2">
                                <AccordionItem value="emi">
                                    <AccordionTrigger className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-purple-500" />
                                            Purchase Details (EMI & Resale)
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2">
                                        <CalculatorInput
                                            label="Estimated Resale Value"
                                            value={resaleValue}
                                            onChange={setResaleValue}
                                            prefix={symbol}
                                        />

                                        <div className="pt-2 border-t">
                                            <div className="flex items-center justify-between pb-2">
                                                <Label>Buying on EMI?</Label>
                                                <Switch checked={isEmi} onCheckedChange={setIsEmi} />
                                            </div>

                                            {isEmi && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <CalculatorInput
                                                            label="Down Payment"
                                                            value={downPayment}
                                                            onChange={setDownPayment}
                                                            prefix={symbol}
                                                        />
                                                        <CalculatorInput
                                                            label="Interest Rate (%)"
                                                            value={interestRate}
                                                            onChange={setInterestRate}
                                                            suffix="%"
                                                        />
                                                    </div>
                                                    <CalculatorInput
                                                        label="Loan Tenure (Months)"
                                                        value={loanTenureMonths}
                                                        onChange={setLoanTenureMonths}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="usage">
                                    <AccordionTrigger className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <Repeat className="w-4 h-4 text-green-500" />
                                            Usage Analysis (Cost per Use)
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2">
                                        <CalculatorInput
                                            label="Expected Lifespan (Years)"
                                            value={lifespanYears}
                                            onChange={setLifespanYears}
                                            min={0.1}
                                            step={0.1}
                                        />
                                        <div className="space-y-2">
                                            <Label>How often will you use it?</Label>
                                            <Select value={usageFrequency} onValueChange={(v: any) => setUsageFrequency(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily (365/yr)</SelectItem>
                                                    <SelectItem value="weekly">Weekly (52/yr)</SelectItem>
                                                    <SelectItem value="monthly">Monthly (12/yr)</SelectItem>
                                                    <SelectItem value="once">Just Once</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="flex items-center justify-between pt-4 pb-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Advanced Mode</Label>
                                    <p className="text-xs text-muted-foreground">Include commute & expenses</p>
                                </div>
                                <Switch
                                    checked={isAdvancedMode}
                                    onCheckedChange={setIsAdvancedMode}
                                />
                            </div>

                            {isAdvancedMode && (
                                <div className="space-y-4 pt-2 border-t animate-in fade-in slide-in-from-top-2">
                                    <CalculatorInput
                                        label="Commute Hours per Week"
                                        value={commuteHoursPerWeek}
                                        onChange={setCommuteHoursPerWeek}
                                    />
                                    <CalculatorInput
                                        label="Monthly Work Expenses"
                                        value={monthlyWorkExpenses}
                                        onChange={setMonthlyWorkExpenses}
                                        prefix={symbol}
                                        tooltip="Commute costs, work meals, coffee, etc."
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Results */}
                <div className="md:col-span-7 space-y-6">
                    {/* Main Result Card */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle>The True Cost</CardTitle>
                            <CardDescription>How much life/work this item costs you</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center py-6">
                                <span className="text-5xl font-bold text-primary block">
                                    {Math.ceil(results.hoursNeeded)}
                                </span>
                                <span className="text-lg text-muted-foreground uppercase tracking-wider font-medium">
                                    Work Hours
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-background/80 p-3 rounded-lg border shadow-sm">
                                    <div className="text-2xl font-bold">{results.daysNeeded.toFixed(1)}</div>
                                    <div className="text-xs text-muted-foreground">Work Days (8h)</div>
                                </div>
                                <div className="bg-background/80 p-3 rounded-lg border shadow-sm">
                                    <div className="text-2xl font-bold">{results.weeksNeeded.toFixed(1)}</div>
                                    <div className="text-xs text-muted-foreground">Work Weeks</div>
                                </div>
                            </div>

                            {isAdvancedMode && (
                                <Alert className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <AlertTitle className="text-yellow-800 dark:text-yellow-300">True Hourly Wage: {formatAmount(results.finalHourlyRate)}/hr</AlertTitle>
                                    <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
                                        Your base wage is {formatAmount(results.basicHourlyRate)}/hr, but after commute ({commuteHoursPerWeek}h/wk) and expenses ({formatAmount(monthlyWorkExpenses)}/mo), your real earnings are lower.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cost Per Use Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Repeat className="w-5 h-5 text-blue-600" />
                                Value for Money
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <span className="text-3xl font-bold text-blue-600 block">
                                    {formatAmount(Math.round(results.costPerUse))}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    cost per use
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                <div className="flex justify-between border-b pb-1">
                                    <span className="text-muted-foreground">Est. Uses</span>
                                    <span>{Math.round(results.totalUses)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                    <span className="text-muted-foreground">Net Cost</span>
                                    <span>{formatAmount(Math.round(results.netCost))}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result Breakdown if EMI or Resale */}
                    {(isEmi || resaleValue > 0) && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Banknote className="w-5 h-5 text-purple-600" />
                                    Real Cost Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Price</span>
                                    <span>{formatAmount(itemPrice)}</span>
                                </div>
                                {isEmi && (
                                    <div className="flex justify-between text-red-600">
                                        <span>+ Interest Paid</span>
                                        <span>{formatAmount(Math.round(results.totalInterest))}</span>
                                    </div>
                                )}
                                {resaleValue > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>- Resale Value</span>
                                        <span>{formatAmount(resaleValue)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <span>Net Cost to You</span>
                                    <span>{formatAmount(Math.round(results.netCost))}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Opportunity Cost Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Opportunity Cost
                            </CardTitle>
                            <CardDescription>
                                If you invested this {formatAmount(Math.round(results.realPrice))} instead...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between border-b pb-4">
                                    <span className="text-sm text-muted-foreground">In 10 Years (at 12% return)</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatAmount(Math.round(results.futureValue))}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground italic">
                                    "Compound interest is the eighth wonder of the world. He who understands it, earns it... he who doesn't... pays it."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <SaveDialog
                open={showSave}
                onOpenChange={setShowSave}
                calculationType="time-cost"
                inputs={{
                    salary: monthlySalary,
                    workHours: workHoursPerWeek,
                    itemPrice,
                    commuteHours: commuteHoursPerWeek
                }}
                results={{
                    basicHourlyRate: Math.round(results.basicHourlyRate),
                    trueHourlyRate: Math.round(results.finalHourlyRate),
                    hoursToWork: Math.round(results.hoursNeeded),
                    opportunityCost: Math.round(results.futureValue)
                }}
            />
        </div>
    );
};

export default TimeCostCalculator;
