import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Briefcase, Info, ChevronDown, ChevronUp, Calendar, Share2, Sparkles, TrendingDown } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import InvestmentScheduleDialog, { ScheduleRow } from "@/components/InvestmentScheduleDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCurrency } from "@/hooks/useCurrency";
import { triggerHaptic } from "@/lib/haptics";
import { recordPositiveEngagement } from "@/lib/reviewManager";

const NPSCalculator = () => {
    const { formatAmount } = useCurrency();
    const [currentAge, setCurrentAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(60);
    const [monthlyContribution, setMonthlyContribution] = useState(5000);
    const [annuityPercentage, setAnnuityPercentage] = useState(40); // Min 40% mandatory by PFRDA

    // Inflation Adjustment Toggle
    const [inflationEnabled, setInflationEnabled] = useState(false);
    const [inflationRate, setInflationRate] = useState(6);

    // Advanced Options
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [stepUpRate, setStepUpRate] = useState(5); // Annual increase in contribution
    const [employerContribution, setEmployerContribution] = useState(0); // Monthly
    const [isTier2, setIsTier2] = useState(false); // Tier 1 is default (Tax saving)

    // Asset Allocation
    const [equityAllocation, setEquityAllocation] = useState(50);
    const [corporateAllocation, setCorporateAllocation] = useState(30);
    const [govtAllocation, setGovtAllocation] = useState(20);

    // Expected Returns
    const [equityReturn, setEquityReturn] = useState(12);
    const [corporateReturn, setCorporateReturn] = useState(9);
    const [govtReturn, setGovtReturn] = useState(7);

    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);

    const result = useMemo(() => {
        const years = Math.max(1, retirementAge - currentAge);

        // Weighted Average Return
        const weightedReturn =
            (equityAllocation * equityReturn +
                corporateAllocation * corporateReturn +
                govtAllocation * govtReturn) / 100;

        const monthlyRate = weightedReturn / 12 / 100;

        let totalCorpus = 0;
        let totalInvested = 0;
        let currentMonthlyContribution = monthlyContribution + employerContribution;

        // Calculate year by year for step-up
        for (let i = 0; i < years; i++) {
            for (let j = 0; j < 12; j++) {
                totalCorpus = (totalCorpus + currentMonthlyContribution) * (1 + monthlyRate);
                totalInvested += currentMonthlyContribution;
            }
            currentMonthlyContribution *= (1 + stepUpRate / 100);
        }

        const totalInterest = Math.max(0, totalCorpus - totalInvested);

        // PFRDA Withdrawal Rules:
        // If total corpus <= 5 Lakhs, 100% lump sum withdrawal is permitted without annuity.
        // Otherwise: User-selected Annuity % (minimum 40%), remainder is Lump sum.
        const isEligibleForFullWithdrawal = totalCorpus <= 500000;
        const effectiveAnnuityPct = isEligibleForFullWithdrawal ? 0 : annuityPercentage;
        const effectiveLumpSumPct = 100 - effectiveAnnuityPct;

        const lumpSum = (totalCorpus * effectiveLumpSumPct) / 100;
        const annuityAmount = (totalCorpus * effectiveAnnuityPct) / 100;

        // Estimated Monthly Pension (assuming 6% annuity yield)
        const estimatedPension = (annuityAmount * 0.06) / 12;

        // Purchasing power today (Inflation adjusted: P = Corpus / (1 + r)^years)
        const inflationFactor = Math.pow(1 + inflationRate / 100, years);
        const purchasingPowerCorpus = totalCorpus / inflationFactor;
        const purchasingPowerPension = estimatedPension / inflationFactor;

        // Tax Benefits Calculation (Tier 1 Only)
        let taxSaved80CCD1 = 0;
        let taxSaved80CCD1B = 0;
        let taxSaved80CCD2 = 0;
        let totalTaxSaved = 0;

        if (!isTier2) {
            const annualSelfContribution = monthlyContribution * 12;
            const annualEmployerContribution = employerContribution * 12;

            // 80CCD(1): Up to 1.5L (within 80C) + 80CCD(1B) extra 50k
            const totalEligibleSelf = Math.min(annualSelfContribution, 200000);
            const totalSelfTaxSave = totalEligibleSelf * 0.312;

            // 80CCD(2): Employer Contribution (14% under New Regime / Govt, 10% under Old Regime)
            const eligible80CCD2 = Math.min(annualEmployerContribution, 750000);
            taxSaved80CCD2 = eligible80CCD2 * 0.312;

            totalTaxSaved = totalSelfTaxSave + taxSaved80CCD2;
        }

        return {
            years,
            totalCorpus,
            totalInvested,
            totalInterest,
            lumpSum,
            annuityAmount,
            estimatedPension,
            purchasingPowerCorpus,
            purchasingPowerPension,
            isEligibleForFullWithdrawal,
            effectiveAnnuityPct,
            effectiveLumpSumPct,
            totalTaxSaved,
            weightedReturn,
            taxSaved80CCD2
        };
    }, [
        currentAge,
        retirementAge,
        monthlyContribution,
        employerContribution,
        stepUpRate,
        annuityPercentage,
        inflationRate,
        equityAllocation,
        corporateAllocation,
        govtAllocation,
        equityReturn,
        corporateReturn,
        govtReturn,
        isTier2
    ]);

    const npsSchedule = useMemo(() => {
        const list: ScheduleRow[] = [];
        const years = Math.max(1, retirementAge - currentAge);
        const weightedReturn =
            (equityAllocation * equityReturn +
                corporateAllocation * corporateReturn +
                govtAllocation * govtReturn) / 100;
        const monthlyRate = weightedReturn / 12 / 100;

        let totalCorpus = 0;
        let totalInvested = 0;
        let currentMonthlyContribution = monthlyContribution + employerContribution;

        for (let i = 0; i < years; i++) {
            for (let j = 0; j < 12; j++) {
                totalCorpus = (totalCorpus + currentMonthlyContribution) * (1 + monthlyRate);
                totalInvested += currentMonthlyContribution;
            }
            list.push({
                period: `Age ${currentAge + i + 1}`,
                invested: Math.round(totalInvested),
                interest: Math.round(Math.max(0, totalCorpus - totalInvested)),
                total: Math.round(totalCorpus),
            });
            currentMonthlyContribution *= (1 + stepUpRate / 100);
        }
        return list;
    }, [currentAge, retirementAge, monthlyContribution, employerContribution, stepUpRate, equityAllocation, equityReturn, corporateAllocation, corporateReturn, govtAllocation, govtReturn]);

    const handleReset = () => {
        triggerHaptic();
        setCurrentAge(25);
        setRetirementAge(60);
        setMonthlyContribution(5000);
        setEmployerContribution(0);
        setAnnuityPercentage(40);
        setInflationEnabled(false);
        setInflationRate(6);
        setStepUpRate(5);
        setEquityAllocation(50);
        setCorporateAllocation(30);
        setGovtAllocation(20);
        setIsTier2(false);
    };

    return (
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
            <Card className="p-6 space-y-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">NPS Calculator</h2>
                            <p className="text-xs text-muted-foreground">
                                National Pension System (PFRDA 2026 Rules)
                            </p>
                        </div>
                        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2"
                                    onClick={() => {
                                        triggerHaptic();
                                        setInfoDialogOpen(true);
                                    }}
                                >
                                    <Info className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>NPS Rules & Tax Guidelines</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 text-sm">
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        The National Pension System (NPS) is a voluntary retirement scheme regulated by the PFRDA (Pension Fund Regulatory and Development Authority).
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-muted p-3 rounded-lg">
                                            <h4 className="font-semibold mb-2 text-primary">Tier I (Pension Account)</h4>
                                            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                                <li>Mandatory retirement lock-in until age 60.</li>
                                                <li>Entry age: 18 to 70 years; exit up to 75.</li>
                                                <li>Tax deduction up to ₹2 Lakh under Sec 80CCD.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <h4 className="font-semibold mb-2 text-primary">Tier II (Savings Account)</h4>
                                            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                                <li>Zero lock-in, withdraw anytime.</li>
                                                <li>No tax exemption (except Central Govt employees under Sec 80C).</li>
                                                <li>Requires active Tier I account.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-950/40 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                        <h4 className="font-semibold mb-1 text-green-700 dark:text-green-300">PFRDA Withdrawal Rules at Age 60</h4>
                                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                                            <li>
                                                <strong className="text-foreground">60% Lump Sum:</strong> 100% tax-free under Section 10(12A).
                                            </li>
                                            <li>
                                                <strong className="text-foreground">Minimum 40% Annuity:</strong> Must be invested in a monthly pension annuity from an ASP (Annuity Service Provider). The monthly pension is taxable as ordinary income.
                                            </li>
                                            <li>
                                                <strong className="text-foreground">₹5 Lakh Full Withdrawal Exemption:</strong> If the total accumulated corpus at retirement is ₹5,00,000 or less, the subscriber has the legal option to withdraw 100% as a lump sum without purchasing an annuity!
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <h4 className="font-semibold mb-1 text-blue-700 dark:text-blue-300">Section 80CCD Tax Deductions</h4>
                                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                                            <li>
                                                <strong className="text-foreground">Sec 80CCD(1):</strong> Employee contribution up to ₹1.5 Lakhs (within 80C umbrella).
                                            </li>
                                            <li>
                                                <strong className="text-foreground">Sec 80CCD(1B):</strong> Exclusive additional deduction of ₹50,000 above the ₹1.5 Lakh 80C limit!
                                            </li>
                                            <li>
                                                <strong className="text-foreground">Sec 80CCD(2):</strong> Employer contribution up to 14% of Basic + DA under the New Tax Regime (and Govt sector), fully tax-deductible.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </Button>
                </div>

                <Alert className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                    <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs ml-2">
                        PFRDA Guidelines: 60% Tax-Free Lump Sum, 40% Annuity & Sec 80CCD Tax Benefits.
                    </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border">
                            <Label className="text-xs font-semibold">Account Type</Label>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs ${!isTier2 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>Tier I (Tax Saving)</span>
                                <Switch
                                    checked={isTier2}
                                    onCheckedChange={(val) => {
                                        triggerHaptic();
                                        setIsTier2(val);
                                    }}
                                />
                                <span className={`text-xs ${isTier2 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>Tier II</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <CalculatorInput
                                label="Current Age"
                                value={currentAge}
                                onChange={setCurrentAge}
                                min={18}
                                max={70}
                                suffix="yrs"
                            />
                            <CalculatorInput
                                label="Retirement Age"
                                value={retirementAge}
                                onChange={setRetirementAge}
                                min={currentAge + 1}
                                max={75}
                                suffix="yrs"
                            />
                        </div>

                        <CalculatorInput
                            label="Monthly Contribution"
                            value={monthlyContribution}
                            onChange={setMonthlyContribution}
                            min={500}
                            max={1000000}
                            step={500}
                            prefix="₹"
                        />

                        <CalculatorInput
                            label="Annuity Ratio (%)"
                            value={annuityPercentage}
                            onChange={setAnnuityPercentage}
                            min={40}
                            max={100}
                            step={5}
                            suffix="%"
                            tooltip="PFRDA requires a minimum of 40% to be converted to annuity pension"
                        />

                        {/* Inflation Purchasing Power Toggle */}
                        <div className="bg-card p-4 rounded-xl border border-primary/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="nps-inflation" className="text-sm font-semibold flex items-center gap-1.5">
                                        <TrendingDown className="w-4 h-4 text-orange-500" />
                                        Adjust for Inflation
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        View purchasing power in today's money
                                    </p>
                                </div>
                                <Switch
                                    id="nps-inflation"
                                    checked={inflationEnabled}
                                    onCheckedChange={(val) => {
                                        triggerHaptic();
                                        setInflationEnabled(val);
                                    }}
                                />
                            </div>

                            {inflationEnabled && (
                                <div className="pt-2 border-t">
                                    <CalculatorInput
                                        label="Expected Inflation Rate (p.a)"
                                        value={inflationRate}
                                        onChange={setInflationRate}
                                        min={1}
                                        max={20}
                                        step={0.5}
                                        suffix="%"
                                    />
                                </div>
                            )}
                        </div>

                        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full flex justify-between p-0 h-auto hover:bg-transparent text-primary"
                                    onClick={() => triggerHaptic()}
                                >
                                    <span>Advanced Options (Step-Up & Employer)</span>
                                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4 pt-4">
                                <CalculatorInput
                                    label="Annual Step-up (%)"
                                    value={stepUpRate}
                                    onChange={setStepUpRate}
                                    min={0}
                                    max={50}
                                    suffix="%"
                                    tooltip="Increase contribution every year as salary grows"
                                />
                                <CalculatorInput
                                    label="Employer Contribution (Monthly)"
                                    value={employerContribution}
                                    onChange={setEmployerContribution}
                                    min={0}
                                    max={1000000}
                                    prefix="₹"
                                    tooltip="Corporate NPS (Deductible up to 14% under Sec 80CCD(2))"
                                />
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-muted/40 p-4 rounded-xl border space-y-4">
                            <Label className="text-xs font-semibold">Asset Allocation (%)</Label>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                    <span className="block mb-1 font-semibold text-green-600 dark:text-green-400">Equity (E)</span>
                                    <input
                                        type="number"
                                        className="w-full p-1.5 rounded border text-center font-semibold bg-background"
                                        value={equityAllocation}
                                        onChange={(e) => setEquityAllocation(Number(e.target.value))}
                                    />
                                    <span className="text-[10px] text-muted-foreground mt-1 block">Exp: {equityReturn}%</span>
                                </div>
                                <div>
                                    <span className="block mb-1 font-semibold text-blue-600 dark:text-blue-400">Corp (C)</span>
                                    <input
                                        type="number"
                                        className="w-full p-1.5 rounded border text-center font-semibold bg-background"
                                        value={corporateAllocation}
                                        onChange={(e) => setCorporateAllocation(Number(e.target.value))}
                                    />
                                    <span className="text-[10px] text-muted-foreground mt-1 block">Exp: {corporateReturn}%</span>
                                </div>
                                <div>
                                    <span className="block mb-1 font-semibold text-orange-600 dark:text-orange-400">Govt (G)</span>
                                    <input
                                        type="number"
                                        className="w-full p-1.5 rounded border text-center font-semibold bg-background"
                                        value={govtAllocation}
                                        onChange={(e) => setGovtAllocation(Number(e.target.value))}
                                    />
                                    <span className="text-[10px] text-muted-foreground mt-1 block">Exp: {govtReturn}%</span>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground text-center pt-2 border-t flex justify-between px-1">
                                <span>Total Allocation: {equityAllocation + corporateAllocation + govtAllocation}%</span>
                                <span>Weighted Return: <strong className="text-foreground">{result.weightedReturn.toFixed(1)}%</strong></span>
                            </div>
                        </div>

                        {result.isEligibleForFullWithdrawal && (
                            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
                                <strong>💡 PFRDA Full Withdrawal Exemption:</strong> Since your projected retirement corpus is under ₹5,00,000, you are permitted to withdraw 100% as a lump sum without purchasing an annuity!
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 space-y-4 shadow-lg">
                    <h3 className="text-lg font-semibold">Corpus Projection</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Contributions</span>
                            <span className="font-semibold">{formatAmount(result.totalInvested)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Interest Earned</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">+{formatAmount(result.totalInterest)}</span>
                        </div>
                        <div className="pt-3 border-t flex justify-between items-baseline">
                            <span className="text-base font-semibold">Total Corpus</span>
                            <span className="text-2xl font-bold text-primary">{formatAmount(result.totalCorpus)}</span>
                        </div>

                        {inflationEnabled && (
                            <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 p-3.5 rounded-xl mt-2 space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-orange-800 dark:text-orange-300">
                                        Purchasing Power Today ({inflationRate}% Inflation)
                                    </span>
                                    <span className="text-base font-bold text-orange-900 dark:text-orange-200">
                                        {formatAmount(result.purchasingPowerCorpus)}
                                    </span>
                                </div>
                                <p className="text-[11px] text-orange-700/80 dark:text-orange-300/80">
                                    At retirement in {result.years} years, {formatAmount(result.totalCorpus)} will buy what {formatAmount(result.purchasingPowerCorpus)} buys today.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6 space-y-4 shadow-lg">
                    <h3 className="text-lg font-semibold">Retirement Income</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Lump Sum ({result.effectiveLumpSumPct}%)</span>
                            <span className="font-semibold">{formatAmount(result.lumpSum)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Annuity Value ({result.effectiveAnnuityPct}%)</span>
                            <span className="font-semibold">{formatAmount(result.annuityAmount)}</span>
                        </div>
                        <div className="bg-primary/10 p-3.5 rounded-xl mt-2">
                            <div className="text-xs text-muted-foreground text-center mb-1">
                                Estimated Monthly Pension (at ~6% annuity yield)
                            </div>
                            <div className="text-xl font-bold text-center text-primary">
                                {formatAmount(result.estimatedPension)} / month
                            </div>
                            {inflationEnabled && (
                                <div className="text-center text-xs text-muted-foreground mt-1 pt-1 border-t border-primary/20">
                                    Today's equivalent value: <strong>{formatAmount(result.purchasingPowerPension)} / mo</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {!isTier2 && (
                <Card className="p-5 bg-green-50/80 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                    <h3 className="text-base font-semibold text-green-800 dark:text-green-300 mb-3">
                        Annual Tax Savings (Section 80CCD)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div>
                            <span className="block text-muted-foreground">Self (80CCD(1) & 1B)</span>
                            <span className="font-bold text-green-700 dark:text-green-400">
                                {formatAmount(Math.min(monthlyContribution * 12, 200000) * 0.312)}
                            </span>
                        </div>
                        {employerContribution > 0 && (
                            <div>
                                <span className="block text-muted-foreground">Employer (80CCD(2))</span>
                                <span className="font-bold text-green-700 dark:text-green-400">
                                    {formatAmount(result.taxSaved80CCD2)}
                                </span>
                            </div>
                        )}
                        <div className="col-span-2 pt-2 border-t border-green-200 dark:border-green-800 flex justify-between font-bold text-base text-green-800 dark:text-green-300">
                            <span>Total Annual Tax Saved</span>
                            <span>{formatAmount(result.totalTaxSaved)}</span>
                        </div>
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                <Button
                    variant="secondary"
                    className="w-full gap-2 h-11 text-sm font-semibold border border-primary/20"
                    onClick={() => {
                        triggerHaptic();
                        setScheduleModalOpen(true);
                        recordPositiveEngagement('view_schedule');
                    }}
                >
                    <Calendar className="w-4 h-4 text-primary" />
                    View Annual NPS Accumulation Schedule
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                        className="w-full gap-2 h-12 text-base font-semibold shadow-md"
                        size="lg"
                        onClick={() => {
                            triggerHaptic();
                            setSaveDialogOpen(true);
                            recordPositiveEngagement('save');
                        }}
                    >
                        <Save className="w-5 h-5" />
                        Save Calculation
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full gap-2 h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/10"
                        size="lg"
                        onClick={() => {
                            triggerHaptic();
                            setShareModalOpen(true);
                            recordPositiveEngagement('share_report');
                        }}
                    >
                        <Share2 className="w-5 h-5" />
                        Export & Share Report
                    </Button>
                </div>
            </div>

            <SaveDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                calculationType="nps"
                inputs={{
                    currentAge,
                    retirementAge,
                    monthlyContribution,
                    stepUpRate,
                    employerContribution,
                    annuityPercentage,
                    inflationEnabled: inflationEnabled ? 1 : 0,
                    inflationRate: inflationEnabled ? inflationRate : 0
                }}
                results={{
                    totalCorpus: result.totalCorpus,
                    monthlyPension: result.estimatedPension,
                    totalTaxSaved: result.totalTaxSaved,
                    purchasingPowerCorpus: inflationEnabled ? result.purchasingPowerCorpus : undefined
                }}
            />

            <ShareReportModal
                open={shareModalOpen}
                onOpenChange={setShareModalOpen}
                title="National Pension System (NPS) Statement"
                inputs={[
                    { label: "Current Age / Retirement Age", value: `${currentAge} to ${retirementAge} Years (${result.years} yrs)` },
                    { label: "Monthly Contribution", value: formatAmount(monthlyContribution) },
                    ...(employerContribution > 0 ? [{ label: "Employer Monthly Contribution", value: formatAmount(employerContribution) }] : []),
                    ...(stepUpRate > 0 ? [{ label: "Annual Step-Up", value: `${stepUpRate}%` }] : []),
                    { label: "Annuity Allocation", value: `${result.effectiveAnnuityPct}%` },
                    ...(inflationEnabled ? [{ label: "Inflation Rate Adjusted", value: `${inflationRate}%` }] : []),
                    { label: "Portfolio Expected Return", value: `${result.weightedReturn.toFixed(1)}%` },
                ]}
                results={[
                    { label: "Total Accumulated Corpus", value: formatAmount(result.totalCorpus), isHighlight: true },
                    ...(inflationEnabled ? [{ label: `Purchasing Power Today (${inflationRate}% Inflation)`, value: formatAmount(result.purchasingPowerCorpus), isHighlight: true }] : []),
                    { label: `${result.effectiveLumpSumPct}% Tax-Free Lump Sum`, value: formatAmount(result.lumpSum) },
                    { label: "Estimated Monthly Pension", value: `${formatAmount(result.estimatedPension)}/mo` },
                    { label: "Total Invested Capital", value: formatAmount(result.totalInvested) },
                    { label: "Total Wealth Gain", value: formatAmount(result.totalInterest) },
                ]}
                analysis={[
                    ...(!isTier2 ? [{
                        title: "💡 NPS Tax Deductions (Section 80CCD)",
                        items: [
                            { label: "80CCD(1) & 80CCD(1B) Self Tax Savings", value: formatAmount(Math.min(monthlyContribution * 12, 200000) * 0.312) },
                            ...(employerContribution > 0 ? [{ label: "80CCD(2) Employer Tax Savings", value: formatAmount(result.taxSaved80CCD2) }] : []),
                            { label: "Total Annual Tax Saved", value: formatAmount(result.totalTaxSaved), isHighlight: true }
                        ]
                    }] : [])
                ]}
                scheduleTitle="NPS Accumulation Schedule"
                scheduleHeaders={{ period: "Age", invested: "Total Contributions", interest: "Growth Earned", balance: "Corpus Value" }}
                schedule={npsSchedule}
            />

            <InvestmentScheduleDialog
                open={scheduleModalOpen}
                onOpenChange={setScheduleModalOpen}
                title="NPS Accumulation Schedule"
                schedule={npsSchedule}
            />
        </div>
    );
};

export default NPSCalculator;
