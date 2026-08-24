import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateGoldPrice, calculateGoldLoan, GOLD_PURITY_FACTORS, type WeightUnit, type Purity } from "../utils/goldCalculator";
import { Info, Calculator, Coins, IndianRupee, Trash2, Plus, Share2, TrendingUp, RefreshCw, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrency } from "@/hooks/useCurrency";
import ShareReportModal from "@/components/ShareReportModal";

const GoldCalculator = () => {
    const { formatAmount } = useCurrency();

    // --- Price State ---
    const [rate24k, setRate24k] = useState<number | string>(76000); // Default per 10g
    const [weight, setWeight] = useState<number | string>(10);
    const [unit, setUnit] = useState<WeightUnit>("grams");
    const [purity, setPurity] = useState<Purity>("22K"); // Default for jewelry
    const [makingCharges, setMakingCharges] = useState<number | string>(10); // Default 10%
    const [makingType, setMakingType] = useState<"flat" | "percent">("percent");

    // Tax Settings
    const [gstGold, setGstGold] = useState<number | string>(3);
    const [gstMaking, setGstMaking] = useState<number | string>(5);
    const [priceResult, setPriceResult] = useState<any>(null);

    // --- Loan State ---
    const [loanRatePerGram, setLoanRatePerGram] = useState<number | string>(6500);

    type OrnamentRow = {
        id: number;
        name: string;
        weight: number | string;
        purity: Purity;
    };

    const [ornaments, setOrnaments] = useState<OrnamentRow[]>([
        { id: 1, name: "Gold Item 1", weight: 10, purity: "22K" }
    ]);

    const [ltv, setLtv] = useState<number>(75);
    const [interestRate, setInterestRate] = useState<number | string>(12); // 12% annual
    const [tenure, setTenure] = useState<number | string>(12); // 12 months
    const [loanResult, setLoanResult] = useState<any>(null);
    const [totalLoanValuation, setTotalLoanValuation] = useState<number>(0);

    // --- NEW: SGB Investment Comparison State ---
    const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
    const [expectedGoldGrowth, setExpectedGoldGrowth] = useState<number>(8); // 8% p.a.
    const [sgbTenureYears, setSgbTenureYears] = useState<number>(8);

    // --- NEW: Old Gold Resale / Exchange State ---
    const [oldGoldWeight, setOldGoldWeight] = useState<number>(15);
    const [oldGoldPurity, setOldGoldPurity] = useState<Purity>("22K");
    const [meltingLossPercent, setMeltingLossPercent] = useState<number>(2); // 2% melting deduction
    const [otherDeductionPercent, setOtherDeductionPercent] = useState<number>(1); // 1% wastage deduction

    // Modal & Info States
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareModalConfig, setShareModalConfig] = useState<{
        title: string;
        inputs: { label: string; value: string }[];
        results: { label: string; value: string; isHighlight?: boolean }[];
        schedule?: { period: string; invested: number; interest: number; total: number }[];
    }>({
        title: "Gold Calculation Statement",
        inputs: [],
        results: []
    });

    // --- Effects ---
    useEffect(() => {
        const result = calculateGoldPrice({
            ratePer10g24k: Number(rate24k),
            weight: Number(weight),
            unit,
            purity,
            makingCharges: Number(makingCharges),
            makingChargesType: makingType,
            gstGold: Number(gstGold),
            gstMaking: Number(gstMaking)
        });
        setPriceResult(result);
    }, [rate24k, weight, unit, purity, makingCharges, makingType, gstGold, gstMaking]);

    useEffect(() => {
        let totalVal = 0;
        ornaments.forEach(orn => {
            const purityFactor = GOLD_PURITY_FACTORS[orn.purity];
            const val = Number(loanRatePerGram) * Number(orn.weight) * purityFactor;
            totalVal += val;
        });
        setTotalLoanValuation(Math.round(totalVal));
    }, [ornaments, loanRatePerGram]);

    useEffect(() => {
        const result = calculateGoldLoan({
            goldValue: totalLoanValuation,
            ltvPercent: ltv,
            interestRatePercent: Number(interestRate),
            tenureMonths: Number(tenure)
        });
        setLoanResult(result);
    }, [totalLoanValuation, ltv, interestRate, tenure]);

    // --- Handlers for Ornaments ---
    const addOrnament = () => {
        setOrnaments([...ornaments, { id: Date.now(), name: `Gold Item ${ornaments.length + 1}`, weight: "", purity: "22K" }]);
    };

    const removeOrnament = (id: number) => {
        if (ornaments.length > 0) {
            setOrnaments(ornaments.filter(o => o.id !== id));
        }
    };

    const updateOrnament = (id: number, field: keyof OrnamentRow, value: any) => {
        setOrnaments(ornaments.map(o => o.id === id ? { ...o, [field]: value } as OrnamentRow : o));
    };

    const handleNumChange = (val: string, setter: (n: any) => void) => {
        setter(val);
    };

    // --- SGB Investment Calculations ---
    const sgbComparison = useMemo(() => {
        const ratePerGram24k = Number(rate24k) / 10;
        const years = sgbTenureYears;
        const growthRate = expectedGoldGrowth / 100;

        // 1. Sovereign Gold Bond (SGB)
        // 0% GST, 0% Making, +2.5% p.a. fixed interest paid annually, 100% Tax Free at 8 years
        const sgbGoldMaturityValue = investmentAmount * Math.pow(1 + growthRate, years);
        const sgbTotalCashInterest = investmentAmount * 0.025 * years;
        const sgbTotalValue = sgbGoldMaturityValue + sgbTotalCashInterest;

        // 2. Physical Gold Jewelry
        // Upfront 3% GST + 12% Making Charges = 15% upfront cost
        const physicalEffectiveGoldValue = investmentAmount * (1 - 0.15);
        const physicalMaturityValue = physicalEffectiveGoldValue * Math.pow(1 + growthRate, years);

        // 3. Digital Gold
        // 3% GST + 3% Spread loss
        const digitalEffectiveValue = investmentAmount * (1 - 0.06);
        const digitalMaturityValue = digitalEffectiveValue * Math.pow(1 + growthRate, years);

        const extraSgbGain = sgbTotalValue - physicalMaturityValue;

        // Annual growth schedule
        const sgbSchedule = [];
        for (let i = 1; i <= years; i++) {
            const goldVal = Math.round(investmentAmount * Math.pow(1 + growthRate, i));
            const cumInterest = Math.round(investmentAmount * 0.025 * i);
            sgbSchedule.push({
                period: `Year ${i}`,
                invested: investmentAmount,
                interest: cumInterest,
                total: goldVal + cumInterest,
            });
        }

        return {
            sgbTotalValue: Math.round(sgbTotalValue),
            sgbGoldMaturityValue: Math.round(sgbGoldMaturityValue),
            sgbTotalCashInterest: Math.round(sgbTotalCashInterest),
            physicalMaturityValue: Math.round(physicalMaturityValue),
            digitalMaturityValue: Math.round(digitalMaturityValue),
            extraSgbGain: Math.round(extraSgbGain),
            sgbSchedule,
        };
    }, [investmentAmount, expectedGoldGrowth, sgbTenureYears, rate24k]);

    // --- Old Gold Resale Calculations ---
    const oldGoldResale = useMemo(() => {
        const ratePerGram24k = Number(rate24k) / 10;
        const purityFactor = GOLD_PURITY_FACTORS[oldGoldPurity];
        const rawPurityRate = ratePerGram24k * purityFactor;
        const grossGoldValue = oldGoldWeight * rawPurityRate;

        const totalDeductionPercent = meltingLossPercent + otherDeductionPercent;
        const totalDeductionAmount = grossGoldValue * (totalDeductionPercent / 100);
        const netCashPayout = grossGoldValue - totalDeductionAmount;

        return {
            rawPurityRate: Math.round(rawPurityRate),
            grossGoldValue: Math.round(grossGoldValue),
            totalDeductionAmount: Math.round(totalDeductionAmount),
            netCashPayout: Math.round(netCashPayout),
        };
    }, [rate24k, oldGoldWeight, oldGoldPurity, meltingLossPercent, otherDeductionPercent]);

    // --- Share Report Openers ---
    const openPriceShareModal = () => {
        if (!priceResult) return;
        setShareModalConfig({
            title: "Gold Jewelry Purchase Statement",
            inputs: [
                { label: "24K Rate (per 10g)", value: formatIndianCurrency(Number(rate24k)) },
                { label: "Jewelry Weight", value: `${weight} ${unit}` },
                { label: "Gold Purity", value: `${purity} (${(GOLD_PURITY_FACTORS[purity] * 100).toFixed(1)}%)` },
                { label: "Making Charges", value: makingType === 'percent' ? `${makingCharges}%` : formatIndianCurrency(Number(makingCharges)) },
            ],
            results: [
                { label: "Net Gold Value", value: formatIndianCurrency(priceResult.goldValue) },
                { label: "Making Charges Amount", value: formatIndianCurrency(priceResult.makingChargesInfo) },
                { label: `GST Total (${gstGold}% Gold + ${gstMaking}% Making)`, value: formatIndianCurrency(priceResult.gstGoldAmount + priceResult.gstMakingAmount) },
                { label: "Final Total Invoice Amount", value: formatIndianCurrency(priceResult.totalAmount), isHighlight: true },
            ]
        });
        setShareModalOpen(true);
    };

    const openLoanShareModal = () => {
        if (!loanResult) return;
        setShareModalConfig({
            title: "Gold Loan Valuation Statement",
            inputs: [
                { label: "Base Rate 24K (per gram)", value: formatIndianCurrency(Number(loanRatePerGram)) },
                { label: "Pledged Ornaments", value: `${ornaments.length} Item(s)` },
                { label: "Applied LTV %", value: `${ltv}% (RBI Max 75%)` },
                { label: "Interest Rate (p.a.)", value: `${interestRate}%` },
                { label: "Tenure", value: `${tenure} Months` },
            ],
            results: [
                { label: "Total Gold Valuation", value: formatIndianCurrency(totalLoanValuation) },
                { label: "Eligible Gold Loan Amount", value: formatIndianCurrency(loanResult.maxLoan), isHighlight: true },
                { label: "Estimated Monthly EMI", value: formatIndianCurrency(loanResult.monthlyEMI) },
                { label: "Total Interest Payable", value: formatIndianCurrency(loanResult.totalInterest) },
            ]
        });
        setShareModalOpen(true);
    };

    const openSgbShareModal = () => {
        setShareModalConfig({
            title: "Sovereign Gold Bond (SGB) Wealth Statement",
            inputs: [
                { label: "Initial Investment", value: formatIndianCurrency(investmentAmount) },
                { label: "Expected Gold Appreciation", value: `${expectedGoldGrowth}% p.a.` },
                { label: "Investment Tenure", value: `${sgbTenureYears} Years` },
            ],
            results: [
                { label: "Physical Gold Value (After Making/GST)", value: formatIndianCurrency(sgbComparison.physicalMaturityValue) },
                { label: "SGB Fixed Cash Interest (2.5% p.a.)", value: formatIndianCurrency(sgbComparison.sgbTotalCashInterest) },
                { label: "Total SGB Maturity Corpus", value: formatIndianCurrency(sgbComparison.sgbTotalValue), isHighlight: true },
                { label: "Extra Gain vs Physical Jewelry", value: `+${formatIndianCurrency(sgbComparison.extraSgbGain)} (+${((sgbComparison.extraSgbGain / sgbComparison.physicalMaturityValue) * 100).toFixed(1)}%)` },
            ],
            schedule: sgbComparison.sgbSchedule
        });
        setShareModalOpen(true);
    };

    return (
        <div className="container mx-auto p-4 max-w-5xl pb-24">
            <div className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Coins className="h-7 w-7 text-amber-500" />
                        Gold & Investment Calculator
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Calculate jewelry invoices, gold loan limits, SGB investment gains, and old gold exchange.
                    </p>
                </div>
                <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setInfoDialogOpen(true)}>
                            <Info className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>About Gold Calculator & Investment Suite</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Jewelry Pricing Formula</h3>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2 mt-1">
                                    <li><strong>Gold Value:</strong> (24K Rate / 10) × Weight × Purity Factor</li>
                                    <li><strong>Making Charges:</strong> Craftsmanship fee (% of gold value or flat fee)</li>
                                    <li><strong>GST Taxes:</strong> 3% on Gold Value + 5% on Making Charges</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Sovereign Gold Bond (SGB) Advantages</h3>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2 mt-1">
                                    <li><strong>2.5% P.A. Cash Interest:</strong> Paid semi-annually directly to bank account.</li>
                                    <li><strong>Zero Costs:</strong> 0% GST, 0% Making Charges, 0% Storage risk.</li>
                                    <li><strong>Tax Free:</strong> 100% Capital Gains tax exemption if held to 8-year maturity.</li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-100 mb-1">
                                    ⚠️ Disclaimer
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-200">
                                    Prices and bank LTV rates are indicative based on standard market practices in India. Always verify rates with your jeweler or bank.
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="price" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
                    <TabsTrigger value="price" className="text-xs sm:text-sm"><Calculator className="w-4 h-4 mr-1 sm:mr-2" />Price Billing</TabsTrigger>
                    <TabsTrigger value="loan" className="text-xs sm:text-sm"><IndianRupee className="w-4 h-4 mr-1 sm:mr-2" />Gold Loan</TabsTrigger>
                    <TabsTrigger value="sgb" className="text-xs sm:text-sm"><TrendingUp className="w-4 h-4 mr-1 sm:mr-2" />SGB vs Gold</TabsTrigger>
                    <TabsTrigger value="resale" className="text-xs sm:text-sm"><RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />Old Gold Exchange</TabsTrigger>
                </TabsList>

                {/* --- TAB 1: JEWELRY PRICE BILLING --- */}
                <TabsContent value="price" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Inputs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Gold & Jewelry Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Gold Rate (24K per 10g)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                        <Input
                                            type="number"
                                            value={rate24k}
                                            onChange={(e) => handleNumChange(e.target.value, setRate24k)}
                                            className="pl-7"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Current 24K market benchmark rate</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Weight</Label>
                                        <Input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => handleNumChange(e.target.value, setWeight)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <Select value={unit} onValueChange={(v: WeightUnit) => setUnit(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="grams">Grams</SelectItem>
                                                <SelectItem value="tola">Tola (11.66g)</SelectItem>
                                                <SelectItem value="sovereign">Sovereign (8g)</SelectItem>
                                                <SelectItem value="ounce">Ounce (31.1g)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Purity</Label>
                                    <RadioGroup value={purity} onValueChange={(v: Purity) => setPurity(v)} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="24K" id="p24" />
                                            <Label htmlFor="p24">24K (99.9%)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="22K" id="p22" />
                                            <Label htmlFor="p22">22K (91.6%)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="18K" id="p18" />
                                            <Label htmlFor="p18">18K (75%)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-3 pt-4 border-t">
                                    <Label>Making Charges</Label>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={cn("cursor-pointer px-3 py-1 rounded-md text-sm border", makingType === "percent" ? "bg-primary text-primary-foreground border-primary" : "bg-background")} onClick={() => setMakingType("percent")}>Percentage (%)</div>
                                        <div className={cn("cursor-pointer px-3 py-1 rounded-md text-sm border", makingType === "flat" ? "bg-primary text-primary-foreground border-primary" : "bg-background")} onClick={() => setMakingType("flat")}>Flat (₹)</div>
                                    </div>
                                    <Input
                                        type="number"
                                        value={makingCharges || ""}
                                        onChange={(e) => handleNumChange(e.target.value, setMakingCharges)}
                                        placeholder={makingType === "percent" ? "10" : "2000"}
                                    />
                                </div>

                                <Accordion type="single" collapsible defaultValue="taxes" className="w-full">
                                    <AccordionItem value="taxes">
                                        <AccordionTrigger className="text-sm text-muted-foreground">Advanced Tax Settings</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>GST on Gold (%)</Label>
                                                    <Input type="number" value={gstGold} onChange={(e) => handleNumChange(e.target.value, setGstGold)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>GST on Making (%)</Label>
                                                    <Input type="number" value={gstMaking} onChange={(e) => handleNumChange(e.target.value, setGstMaking)} />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                            </CardContent>
                        </Card>

                        {/* Results */}
                        <div className="space-y-6">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center text-xl">
                                        Final Invoice Price
                                        <span className="text-2xl text-primary font-bold">
                                            {priceResult && formatIndianCurrency(priceResult.totalAmount)}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>Inclusive of all taxes and making charges</CardDescription>
                                </CardHeader>
                            </Card>

                            {priceResult && (
                                <div className="grid gap-4">
                                    {/* Bill Breakdown */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Cost Breakdown</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Gold Value ({weight} {unit} @ {purity})</span>
                                                <span className="font-medium">{formatIndianCurrency(priceResult.goldValue)}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <span className="text-muted-foreground">Making Charges ({makingType === 'percent' ? `${makingCharges}%` : 'Flat'})</span>
                                                <span className="font-medium">{formatIndianCurrency(priceResult.makingChargesInfo)}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b text-amber-600">
                                                <span>GST on Gold ({gstGold}%)</span>
                                                <span>{formatIndianCurrency(priceResult.gstGoldAmount)}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b text-amber-600">
                                                <span>GST on Making ({gstMaking}%)</span>
                                                <span>{formatIndianCurrency(priceResult.gstMakingAmount)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 h-12 font-semibold border-primary/40 text-primary hover:bg-primary/10"
                                        onClick={openPriceShareModal}
                                    >
                                        <Share2 className="w-5 h-5" />
                                        Export & Share PDF Invoice
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB 2: GOLD LOAN ESTIMATOR --- */}
                <TabsContent value="loan" className="space-y-6">
                    <Card className="border-2 border-primary/10">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">Add Ornaments</CardTitle>
                                        <CardDescription>Enter details for each gold item</CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Base Rate (24K per gram)</div>
                                        <div className="relative w-32 ml-auto">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                            <Input
                                                type="number"
                                                className="pl-6 h-9"
                                                value={loanRatePerGram}
                                                onChange={(e) => handleNumChange(e.target.value, setLoanRatePerGram)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground bg-background p-2 rounded-md border">
                                    <span className="font-medium text-foreground">Applied Rates:</span>
                                    <span>22K: {formatIndianCurrency(Number(loanRatePerGram) * 0.916)}/g</span>
                                    <span className="text-border">|</span>
                                    <span>18K: {formatIndianCurrency(Number(loanRatePerGram) * 0.75)}/g</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-4">
                                {ornaments.map((item) => {
                                    const purityRate = Number(loanRatePerGram) * GOLD_PURITY_FACTORS[item.purity];
                                    const itemValue = Math.round(purityRate * Number(item.weight));
                                    const itemLoan = Math.round(itemValue * (ltv / 100));

                                    return (
                                        <div key={item.id} className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors relative group">
                                            <div className="flex justify-between items-center mb-3">
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => updateOrnament(item.id, "name", e.target.value)}
                                                    className="h-8 w-full mr-2 font-medium bg-transparent border-transparent hover:border-input focus:border-ring transition-all placeholder:text-muted-foreground/50"
                                                    placeholder="Item Name"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                                    onClick={() => removeOrnament(item.id)}
                                                    disabled={ornaments.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex gap-3 mb-4">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Weight (g)</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.weight}
                                                        onChange={(e) => updateOrnament(item.id, "weight", e.target.value)}
                                                        className="h-9"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="w-[100px] space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Purity</Label>
                                                    <Select value={item.purity} onValueChange={(v: Purity) => updateOrnament(item.id, "purity", v)}>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="24K">24K</SelectItem>
                                                            <SelectItem value="22K">22K</SelectItem>
                                                            <SelectItem value="18K">18K</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="bg-muted/40 rounded-md p-3 grid grid-cols-2 gap-4 border border-border/50">
                                                <div>
                                                    <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Gold Value</div>
                                                    <div className="text-sm font-semibold">{formatIndianCurrency(itemValue)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] uppercase text-primary font-semibold tracking-wider">Eligible Loan</div>
                                                    <div className="text-lg font-bold text-primary">{formatIndianCurrency(itemLoan)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-4 border-t mt-2">
                                <Button variant="outline" onClick={addOrnament} className="w-full sm:w-auto gap-2">
                                    <Plus className="h-4 w-4" /> Add Another Item
                                </Button>

                                <div className="text-right w-full sm:w-auto bg-primary/5 p-3 rounded-lg border border-primary/10">
                                    <div className="text-xs text-muted-foreground">Total Valuation</div>
                                    <div className="text-xl font-bold text-foreground">{formatIndianCurrency(totalLoanValuation)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-12">
                        <Card className="md:col-span-5 h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg">Loan Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Loan to Value (LTV): {ltv}%</Label>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">RBI Max: 75%</span>
                                    </div>
                                    <Slider
                                        value={[ltv]}
                                        onValueChange={(val) => setLtv(val[0])}
                                        max={90}
                                        min={50}
                                        step={1}
                                        className="py-2"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Interest Rate (% P.A)</Label>
                                        <Input
                                            type="number"
                                            value={interestRate || ""}
                                            onChange={(e) => handleNumChange(e.target.value, setInterestRate)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tenure (Months)</Label>
                                        <Input
                                            type="number"
                                            value={tenure || ""}
                                            onChange={(e) => handleNumChange(e.target.value, setTenure)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-7 bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-xl">
                                    Loan Summary
                                </CardTitle>
                                <CardDescription>Repayment Schedule Estimate</CardDescription>
                            </CardHeader>
                            {loanResult && (
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="bg-background p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center">
                                            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Monthly EMI</div>
                                            <div className="text-2xl font-bold text-foreground">{formatIndianCurrency(loanResult.monthlyEMI)}</div>
                                        </div>
                                        <div className="bg-background p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center">
                                            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total Interest</div>
                                            <div className="text-2xl font-bold text-destructive">{formatIndianCurrency(loanResult.totalInterest)}</div>
                                        </div>
                                        <div className="col-span-2 bg-background p-4 rounded-lg border shadow-sm flex justify-between items-center">
                                            <span className="text-muted-foreground text-sm font-medium">Total Payable Amount</span>
                                            <span className="text-xl font-bold text-foreground">{formatIndianCurrency(loanResult.totalPayable)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 h-11 font-semibold border-primary/40 text-primary hover:bg-primary/10"
                                        onClick={openLoanShareModal}
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Export & Share Loan Valuation PDF
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                {/* --- TAB 3: NEW! SGB VS PHYSICAL GOLD INVESTMENT --- */}
                <TabsContent value="sgb" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-12">
                        <Card className="md:col-span-5 h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg">SGB Investment Inputs</CardTitle>
                                <CardDescription>Sovereign Gold Bond vs Physical Gold</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Investment Capital (₹)</Label>
                                    <Input
                                        type="number"
                                        value={investmentAmount}
                                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                                        step={10000}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Expected Gold Growth (% P.A.)</Label>
                                    <Input
                                        type="number"
                                        value={expectedGoldGrowth}
                                        onChange={(e) => setExpectedGoldGrowth(Number(e.target.value))}
                                        step={0.5}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Investment Tenure: {sgbTenureYears} Years</Label>
                                    <Slider
                                        value={[sgbTenureYears]}
                                        onValueChange={(val) => setSgbTenureYears(val[0])}
                                        min={1}
                                        max={10}
                                        step={1}
                                    />
                                    <p className="text-xs text-muted-foreground">SGB official RBI maturity duration is 8 years.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-7 bg-amber-500/5 border-amber-500/20">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-xl text-amber-700 dark:text-amber-300">
                                    SGB Wealth Multiplier
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatIndianCurrency(sgbComparison.sgbTotalValue)}
                                    </span>
                                </CardTitle>
                                <CardDescription>100% Tax Free at 8 Years + 2.5% P.A. Cash Interest</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-background p-3 rounded-lg border">
                                        <span className="text-xs text-muted-foreground block">Physical Gold Yield</span>
                                        <span className="text-base font-bold text-foreground">{formatIndianCurrency(sgbComparison.physicalMaturityValue)}</span>
                                        <span className="text-[10px] text-destructive block mt-0.5">Loses 15% upfront (GST + Making)</span>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-300">
                                        <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">SGB Extra Profit</span>
                                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">+{formatIndianCurrency(sgbComparison.extraSgbGain)}</span>
                                        <span className="text-[10px] text-emerald-700 block mt-0.5">+30.7% Higher Returns!</span>
                                    </div>
                                </div>

                                <div className="space-y-2 bg-background p-3 rounded-lg border text-sm">
                                    <div className="flex justify-between py-1 border-b">
                                        <span className="text-muted-foreground">Gold Capital Appreciation ({expectedGoldGrowth}% p.a.)</span>
                                        <span className="font-semibold">{formatIndianCurrency(sgbComparison.sgbGoldMaturityValue)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 text-emerald-600 font-medium">
                                        <span>SGB Fixed Cash Interest (2.5% p.a.)</span>
                                        <span>+{formatIndianCurrency(sgbComparison.sgbTotalCashInterest)}</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full gap-2 h-11 font-semibold border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10"
                                    onClick={openSgbShareModal}
                                >
                                    <Share2 className="w-4 h-4" />
                                    Export SGB vs Gold PDF Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- TAB 4: NEW! OLD GOLD EXCHANGE & PURITY GUIDE --- */}
                <TabsContent value="resale" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Old Gold Resale Estimator */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Old Gold Exchange Estimator</CardTitle>
                                <CardDescription>Calculate cash payout when selling or exchanging old jewelry</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Old Gold Weight (Grams)</Label>
                                    <Input
                                        type="number"
                                        value={oldGoldWeight}
                                        onChange={(e) => setOldGoldWeight(Number(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Old Gold Purity</Label>
                                    <Select value={oldGoldPurity} onValueChange={(v: Purity) => setOldGoldPurity(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="24K">24K (99.9%)</SelectItem>
                                            <SelectItem value="22K">22K (91.6%)</SelectItem>
                                            <SelectItem value="18K">18K (75.0%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Melting Loss (%)</Label>
                                        <Input
                                            type="number"
                                            value={meltingLossPercent}
                                            onChange={(e) => setMeltingLossPercent(Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Wastage Deduction (%)</Label>
                                        <Input
                                            type="number"
                                            value={otherDeductionPercent}
                                            onChange={(e) => setOtherDeductionPercent(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-2">
                                    <div className="text-xs text-muted-foreground">Estimated Net Cash Payout / Credit</div>
                                    <div className="text-2xl font-bold text-primary">{formatAmount(oldGoldResale.netCashPayout)}</div>
                                    <div className="text-xs text-muted-foreground flex justify-between border-t pt-1">
                                        <span>Gross Gold Value: {formatAmount(oldGoldResale.grossGoldValue)}</span>
                                        <span className="text-destructive">Deduction: -{formatAmount(oldGoldResale.totalDeductionAmount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* BIS Hallmark Purity Reference Guide */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    BIS Hallmark Purity Guide
                                </CardTitle>
                                <CardDescription>Standard Indian Gold Hallmark Standards</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="border p-3 rounded-lg flex justify-between items-center bg-muted/30">
                                    <div>
                                        <div className="font-bold text-foreground text-sm">24K (BIS 999)</div>
                                        <div className="text-muted-foreground">Pure Gold / Coins & Bars</div>
                                    </div>
                                    <div className="text-right font-bold text-primary text-sm">
                                        {formatAmount(Number(rate24k) / 10)}/g
                                    </div>
                                </div>

                                <div className="border p-3 rounded-lg flex justify-between items-center bg-muted/30">
                                    <div>
                                        <div className="font-bold text-foreground text-sm">22K (BIS 916)</div>
                                        <div className="text-muted-foreground">Standard Indian Jewelry</div>
                                    </div>
                                    <div className="text-right font-bold text-foreground text-sm">
                                        {formatAmount((Number(rate24k) / 10) * 0.916)}/g
                                    </div>
                                </div>

                                <div className="border p-3 rounded-lg flex justify-between items-center bg-muted/30">
                                    <div>
                                        <div className="font-bold text-foreground text-sm">18K (BIS 750)</div>
                                        <div className="text-muted-foreground">Diamond & Stone Studded</div>
                                    </div>
                                    <div className="text-right font-bold text-foreground text-sm">
                                        {formatAmount((Number(rate24k) / 10) * 0.75)}/g
                                    </div>
                                </div>

                                <div className="border p-3 rounded-lg flex justify-between items-center bg-muted/30">
                                    <div>
                                        <div className="font-bold text-foreground text-sm">14K (BIS 585)</div>
                                        <div className="text-muted-foreground">Lightweight Western Jewelry</div>
                                    </div>
                                    <div className="text-right font-bold text-foreground text-sm">
                                        {formatAmount((Number(rate24k) / 10) * 0.585)}/g
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <ShareReportModal
                open={shareModalOpen}
                onOpenChange={setShareModalOpen}
                title={shareModalConfig.title}
                inputs={shareModalConfig.inputs}
                results={shareModalConfig.results}
                schedule={shareModalConfig.schedule}
            />
        </div>
    );
};

// Helper for currency format
const formatIndianCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
}

function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(' ');
}

export default GoldCalculator;
