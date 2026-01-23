import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CalculatorInput from '@/components/ui/CalculatorInput';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Clock, Briefcase, TrendingUp, AlertCircle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Save } from 'lucide-react';
import SaveDialog from '@/components/SaveDialog';
import { useCurrency } from '@/hooks/useCurrency';

const TimeCostCalculator = () => {
    const { symbol, formatAmount } = useCurrency();

    // Basic Inputs
    const [monthlySalary, setMonthlySalary] = useState(50000);
    const [workHoursPerWeek, setWorkHoursPerWeek] = useState(40);
    const [itemPrice, setItemPrice] = useState(5000);

    // Advanced Inputs
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [commuteHoursPerWeek, setCommuteHoursPerWeek] = useState(5);
    const [monthlyWorkExpenses, setMonthlyWorkExpenses] = useState(2000);
    const [showSave, setShowSave] = useState(false);

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

        // 3. Time Cost
        const hoursNeeded = finalHourlyRate > 0 ? itemPrice / finalHourlyRate : 0;
        const daysNeeded = hoursNeeded / 8; // Assuming 8 hour work day for visualization
        const weeksNeeded = daysNeeded / 5;

        // 4. Opportunity Cost (Future Value)
        // FV = PV * (1 + r)^n
        const futureValue = itemPrice * Math.pow((1 + OPP_COST_RATE), OPP_COST_YEARS);

        return {
            basicHourlyRate,
            finalHourlyRate,
            hoursNeeded,
            daysNeeded,
            weeksNeeded,
            futureValue,
            trueMonthlyIncome
        };
    }, [monthlySalary, workHoursPerWeek, itemPrice, isAdvancedMode, commuteHoursPerWeek, monthlyWorkExpenses]);

    const handleReset = () => {
        setMonthlySalary(50000);
        setWorkHoursPerWeek(40);
        setItemPrice(5000);
        setCommuteHoursPerWeek(5);
        setMonthlyWorkExpenses(2000);
        setIsAdvancedMode(false);
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

                    {/* Opportunity Cost Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Opportunity Cost
                            </CardTitle>
                            <CardDescription>
                                If you invested this {formatAmount(itemPrice)} instead...
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
