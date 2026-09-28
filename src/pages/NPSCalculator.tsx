import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Briefcase, Info, ChevronDown, ChevronUp, Calendar, Share2 } from "lucide-react";
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

const NPSCalculator = () => {
    const { formatAmount } = useCurrency();
    const [currentAge, setCurrentAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(60);
    const [monthlyContribution, setMonthlyContribution] = useState(5000);

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
        const years = retirementAge - currentAge;
        const months = years * 12;

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
            // For each month in this year
            for (let j = 0; j < 12; j++) {
                totalCorpus = (totalCorpus + currentMonthlyContribution) * (1 + monthlyRate);
                totalInvested += currentMonthlyContribution;
            }
            // Increase contribution for next year
            currentMonthlyContribution *= (1 + stepUpRate / 100);
        }

        const totalInterest = totalCorpus - totalInvested;

        // Withdrawal Rules (Tier 1)
        // 60% Lump sum (Tax free), 40% Annuity (Taxable)
        const lumpSum = totalCorpus * 0.60;
        const annuityAmount = totalCorpus * 0.40;

        // Estimated Monthly Pension (assuming 6% annuity rate)
        const estimatedPension = (annuityAmount * 0.06) / 12;

        // Tax Benefits Calculation (Tier 1 Only)
        let taxSaved80CCD1 = 0;
        let taxSaved80CCD1B = 0;
        let taxSaved80CCD2 = 0;
        let totalTaxSaved = 0;

        if (!isTier2) {
            const annualSelfContribution = monthlyContribution * 12;
            const annualEmployerContribution = employerContribution * 12;

            // 80CCD(1): Up to 1.5L (within 80C)
            const eligible80CCD1 = Math.min(annualSelfContribution, 150000);
            taxSaved80CCD1 = eligible80CCD1 * 0.312; // 30% slab + cess

            // 80CCD(1B): Additional 50k
            const remainingSelf = Math.max(0, annualSelfContribution - 150000);
            const eligible80CCD1B = Math.min(remainingSelf, 50000);
            // Or if 80C is full, we can claim 50k from the start. 
            // Simplified: We assume user maximizes 1.5L first then 50k.
            // Better logic: 50k is exclusive. 
            // Let's assume user claims 50k under 1B first for max benefit if 80C is full? 
            // Standard practice: 1.5L 80C + 50k 1B.
            // Let's calculate max potential tax save on total contribution up to 2L
            const totalEligibleSelf = Math.min(annualSelfContribution, 200000);
            const totalSelfTaxSave = totalEligibleSelf * 0.312;

            // 80CCD(2): Employer Contribution (10% of Basic+DA). 
            // We assume the input amount is within the 10% limit.
            // Tax free up to 7.5L (combined with PF/Superannuation)
            const eligible80CCD2 = Math.min(annualEmployerContribution, 750000);
            taxSaved80CCD2 = eligible80CCD2 * 0.312;

            totalTaxSaved = totalSelfTaxSave + taxSaved80CCD2;
        }

        return {
            totalCorpus,
            totalInvested,
            totalInterest,
            lumpSum,
            annuityAmount,
            estimatedPension,
            totalTaxSaved,
            weightedReturn,
            taxSaved80CCD2
        };
    }, [currentAge, retirementAge, monthlyContribution, employerContribution, stepUpRate, equityAllocation, corporateAllocation, govtAllocation, equityReturn, corporateReturn, govtReturn, isTier2]);

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
        setCurrentAge(25);
        setRetirementAge(60);
        setMonthlyContribution(5000);
        setEmployerContribution(0);
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
                                National Pension System (Tier I & II)
                            </p>
                        </div>
                        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="ml-2">
                                    <Info className="w-5 h-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>NPS Guide</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 text-sm">
                                    <p>
                                        The National Pension System (NPS) is a government-backed retirement savings scheme.
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-muted p-3 rounded-lg">
                                            <h4 className="font-semibold mb-2 text-primary">Tier I (Pension)</h4>
                                            <ul className="list-disc list-inside space-y-1 text-xs">
                                                <li>Mandatory lock-in until age 60.</li>
                                                <li>Tax benefits available.</li>
                                                <li>Min contribution: ₹500/time, ₹1000/year.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <h4 className="font-semibold mb-2 text-primary">Tier II (Investment)</h4>
                                            <ul className="list-disc list-inside space-y-1 text-xs">
                                                <li>No lock-in, withdraw anytime.</li>
                                                <li>No tax benefits (except for Govt employees).</li>
                                                <li>Requires active Tier I account.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <h4 className="font-semibold mb-2 text-green-700">Tax Benefits (Tier I Only)</h4>
                                        <ul className="space-y-2 text-xs">
                                            <li>
                                                <span className="font-bold">Sec 80CCD(1):</span> Deduction up to ₹1.5 Lakhs (part of 80C).
                                            </li>
                                            <li>
                                                <span className="font-bold">Sec 80CCD(1B):</span> Exclusive additional deduction of ₹50,000.
                                            </li>
                                            <li>
                                                <span className="font-bold">Sec 80CCD(2):</span> Employer contribution (up to 10% of Basic+DA) is tax-free.
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <h4 className="font-semibold mb-2 text-blue-700">Withdrawal Rules (at 60)</h4>
                                        <ul className="space-y-2 text-xs">
                                            <li>
                                                <span className="font-bold">60% Lump Sum:</span> Completely tax-free.
                                            </li>
                                            <li>
                                                <span className="font-bold">40% Annuity:</span> Must buy pension plan. Monthly pension is taxable as income.
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
                        This calculator is designed for Indian financial rules (Rupees ₹).
                    </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                            <Label>Account Type</Label>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${!isTier2 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>Tier I</span>
                                <Switch checked={isTier2} onCheckedChange={setIsTier2} />
                                <span className={`text-sm ${isTier2 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>Tier II</span>
                            </div>
                        </div>

                        <CalculatorInput
                            label="Current Age"
                            value={currentAge}
                            onChange={setCurrentAge}
                            min={18}
                            max={60}
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
                        <CalculatorInput
                            label="Monthly Contribution"
                            value={monthlyContribution}
                            onChange={setMonthlyContribution}
                            min={500}
                            max={1000000}
                            step={500}
                            prefix="₹"
                        />

                        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full flex justify-between p-0 h-auto hover:bg-transparent text-primary">
                                    <span>Advanced Options</span>
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
                                    tooltip="Increase contribution every year"
                                />
                                <CalculatorInput
                                    label="Employer Contribution (Monthly)"
                                    value={employerContribution}
                                    onChange={setEmployerContribution}
                                    min={0}
                                    max={1000000}
                                    prefix="₹"
                                    tooltip="For Corporate NPS (Sec 80CCD(2))"
                                />
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                            <Label>Asset Allocation (%)</Label>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                    <span className="block mb-1 font-medium text-green-600">Equity (E)</span>
                                    <input
                                        type="number"
                                        className="w-full p-1 rounded border text-center"
                                        value={equityAllocation}
                                        onChange={(e) => setEquityAllocation(Number(e.target.value))}
                                    />
                                    <span className="text-[10px] text-muted-foreground mt-1 block">Exp: {equityReturn}%</span>
                                </div>
                                <div>
                                    <span className="block mb-1 font-medium text-blue-600">Corp (C)</span>
                                    <input
                                        type="number"
                                        className="w-full p-1 rounded border text-center"
                                        value={corporateAllocation}
                                        onChange={(e) => setCorporateAllocation(Number(e.target.value))}
                                    />
                                    <span className="text-[10px] text-muted-foreground mt-1 block">Exp: {corporateReturn}%</span>
                                </div>
                                <div>
                                    <span className="block mb-1 font-medium text-orange-600">Govt (G)</span>
                                    <input
                                        type="number"
                                        className="w-full p-1 rounded border text-center"
                                        value={govtAllocation}
                                        onChange={(e) => setGovtAllocation(Number(e.target.value))}
                                    />
                                    <span className="text-[10px] text-muted-foreground mt-1 block">Exp: {govtReturn}%</span>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                                Weighted Avg Return: <span className="font-bold text-foreground">{result.weightedReturn.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Button className="w-full gap-2" size="lg" onClick={() => setSaveDialogOpen(true)}>
                    <Save className="w-4 h-4" />
                    Save Result
                </Button>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 space-y-4 shadow-lg">
                    <h3 className="text-lg font-semibold">Corpus Projection</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Investment</span>
                            <span className="font-semibold">{formatAmount(result.totalInvested)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Interest Earned</span>
                            <span className="font-semibold text-green-600">+{formatAmount(result.totalInterest)}</span>
                        </div>
                        <div className="pt-3 border-t flex justify-between text-lg font-bold">
                            <span>Total Corpus</span>
                            <span className="text-primary">{formatAmount(result.totalCorpus)}</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4 shadow-lg">
                    <h3 className="text-lg font-semibold">Retirement Income</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Lump Sum (60%)</span>
                            <span className="font-semibold">{formatAmount(result.lumpSum)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Annuity Value (40%)</span>
                            <span className="font-semibold">{formatAmount(result.annuityAmount)}</span>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg mt-2">
                            <div className="text-xs text-muted-foreground text-center mb-1">Estimated Monthly Pension</div>
                            <div className="text-xl font-bold text-center text-primary">
                                {formatAmount(result.estimatedPension)}/mo
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {!isTier2 && (
                <Card className="p-6 bg-green-50 border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Annual Tax Savings (Approx)</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-muted-foreground">Self Contribution</span>
                            <span className="font-bold text-green-700">
                                {formatAmount(Math.min(monthlyContribution * 12, 200000) * 0.312)}
                            </span>
                        </div>
                        {employerContribution > 0 && (
                            <div>
                                <span className="block text-muted-foreground">Employer Contrib.</span>
                                <span className="font-bold text-green-700">
                                    {formatAmount(result.taxSaved80CCD2)}
                                </span>
                            </div>
                        )}
                        <div className="col-span-2 pt-2 border-t border-green-200 flex justify-between font-bold text-lg text-green-800">
                            <span>Total Tax Saved</span>
                            <span>{formatAmount(result.totalTaxSaved)}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                        *Assuming 30% tax slab + 4% cess. Actual savings depend on your tax regime and income.
                    </p>
                </Card>
            )}

            <div className="space-y-3">
                <Button
                    variant="secondary"
                    className="w-full gap-2 h-11 text-sm font-semibold border border-primary/20"
                    onClick={() => setScheduleModalOpen(true)}
                >
                    <Calendar className="w-4 h-4 text-primary" />
                    View Annual NPS Accumulation Schedule
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                        className="w-full gap-2 h-12 text-base font-semibold"
                        size="lg"
                        onClick={() => setSaveDialogOpen(true)}
                    >
                        <Save className="w-5 h-5" />
                        Save Calculation
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full gap-2 h-12 text-base font-semibold border-primary/40 text-primary hover:bg-primary/10"
                        size="lg"
                        onClick={() => setShareModalOpen(true)}
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
                inputs={{ currentAge, retirementAge, monthlyContribution, stepUpRate, employerContribution }}
                results={{
                    totalCorpus: result.totalCorpus,
                    monthlyPension: result.estimatedPension,
                    totalTaxSaved: result.totalTaxSaved
                }}
            />

            <ShareReportModal
                open={shareModalOpen}
                onOpenChange={setShareModalOpen}
                title="National Pension System (NPS) Report"
                inputs={[
                    { label: "Current Age / Target Age", value: `${currentAge} to ${retirementAge} Years` },
                    { label: "Monthly Contribution", value: formatAmount(monthlyContribution) },
                    ...(employerContribution > 0 ? [{ label: "Employer Contribution", value: formatAmount(employerContribution) }] : []),
                    ...(stepUpRate > 0 ? [{ label: "Annual Step-Up", value: `${stepUpRate}%` }] : []),
                    { label: "Portfolio Expected Return", value: `${result.weightedReturn.toFixed(1)}%` },
                    { label: "NPS Account Tier", value: isTier2 ? "Tier 2 (Investment)" : "Tier 1 (Tax Saving)" },
                ]}
                results={[
                    { label: "Total Invested Capital", value: formatAmount(result.totalInvested) },
                    { label: "Total Wealth Gain", value: formatAmount(result.totalInterest) },
                    { label: "60% Tax-Free Lumpsum at 60", value: formatAmount(result.lumpSum) },
                    { label: "Estimated Monthly Pension", value: formatAmount(result.estimatedPension), isHighlight: true },
                    { label: "Total Accumulated Corpus", value: formatAmount(result.totalCorpus), isHighlight: true },
                ]}
                analysis={[
                    ...(!isTier2 ? [{
                        title: "💡 NPS Tax Savings Benefit (Sec 80CCD)",
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
