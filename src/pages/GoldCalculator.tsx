
import React, { useState, useEffect } from "react";
// import { formatCurrency } from "../lib/utils"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateGoldPrice, calculateGoldLoan, UNIT_CONVERSION, GOLD_PURITY_FACTORS, type WeightUnit, type Purity } from "../utils/goldCalculator";
import { Info, Calculator, Coins, IndianRupee, Trash2, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const GoldCalculator = () => {
    // --- Price State ---
    const [rate24k, setRate24k] = useState<number | string>(76000); // Default per 10g
    const [weight, setWeight] = useState<number | string>(10);
    const [unit, setUnit] = useState<WeightUnit>("grams");
    const [purity, setPurity] = useState<Purity>("22K"); // Default for jewelery
    const [makingCharges, setMakingCharges] = useState<number | string>(10); // Default 10%
    const [makingType, setMakingType] = useState<"flat" | "percent">("percent");

    // Tax Settings
    const [gstGold, setGstGold] = useState<number | string>(3);
    const [gstMaking, setGstMaking] = useState<number | string>(5);

    const [priceResult, setPriceResult] = useState<any>(null);

    // --- Loan State ---
    const [loanRatePerGram, setLoanRatePerGram] = useState<number | string>(6500); // Default approx rate

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
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [totalLoanValuation, setTotalLoanValuation] = useState<number>(0);

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

    // Calculate Total Loan Valuation whenever ornaments or rate changes
    useEffect(() => {
        let totalVal = 0;
        ornaments.forEach(orn => {
            // Valuation Logic: Rate * Weight * PurityFactor
            // Banks usually take the net weight of gold.
            const purityFactor = GOLD_PURITY_FACTORS[orn.purity];
            const val = Number(loanRatePerGram) * Number(orn.weight) * purityFactor;
            totalVal += val;
        });
        setTotalLoanValuation(Math.round(totalVal));
    }, [ornaments, loanRatePerGram]);

    useEffect(() => {
        // Recalculate loan based on total valuation
        const result = calculateGoldLoan({
            goldValue: totalLoanValuation,
            ltvPercent: ltv,
            interestRatePercent: Number(interestRate),
            tenureMonths: Number(tenure)
        });
        setLoanResult(result);
    }, [totalLoanValuation, ltv, interestRate, tenure]);

    // Handlers for Ornaments
    const addOrnament = () => {
        setOrnaments([...ornaments, { id: Date.now(), name: `Gold Item ${ornaments.length + 1}`, weight: "", purity: "22K" }]);
    };

    const removeOrnament = (id: number) => {
        if (ornaments.length > 0) { // Allow removing down to 1? The UI disables the button if length is 1. So this is safe.
            setOrnaments(ornaments.filter(o => o.id !== id));
        }
    };

    const updateOrnament = (id: number, field: keyof OrnamentRow, value: any) => {
        setOrnaments(ornaments.map(o => o.id === id ? { ...o, [field]: value } as OrnamentRow : o));
    };

    // Helper for inputs (simplified)
    const handleNumChange = (val: string, setter: (n: any) => void) => {
        setter(val);
    };


    return (
        <div className="container mx-auto p-4 max-w-4xl pb-24">
            <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Coins className="h-8 w-8 text-yellow-500" />
                        Gold Calculator
                    </h1>
                    <p className="text-muted-foreground">
                        Calculate precise jewelry prices and check gold loan eligibility.
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
                            <DialogTitle>About Gold Price & Loan Calculator</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">How Gold Price is Calculated</h3>
                                <p className="text-muted-foreground">
                                    The retail price of gold jewelry in India is calculated as:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2 mt-1">
                                    <li><strong>Gold Value:</strong> (Market Rate / 10) × Weight × Purity Factor</li>
                                    <li><strong>Making Charges:</strong> Labor charges (usually 10-20% of gold value or flat fee)</li>
                                    <li><strong>GST:</strong> 3% on Gold Value + 5% on Making Charges (Composite supply rules can vary, but this breakdown is standard for transparency)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Gold Loan Estimator</h3>
                                <p className="text-muted-foreground">
                                    This estimator helps you calculate your eligible loan amount based on the value of your gold.
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2 mt-1">
                                    <li><strong>Valuation:</strong> Banks typically value gold at the average closing price of 22K gold for the preceding 30 days.</li>
                                    <li><strong>LTV (Loan to Value):</strong> The RBI caps the LTV ratio at <strong>75%</strong> of the pledged gold's value. Some private lenders may offer higher schemes.</li>
                                    <li><strong>Purity:</strong> Stones and gems are excluded. Value is calculated on net gold weight (usually 22K).</li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-100 mb-1">
                                    ⚠️ Disclaimer
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-200">
                                    This tool provides estimates based on user inputs and standard market practices. Actual bank offers, interest rates, and valuations may vary.
                                    Always check with your lender for the final offer. This calculator is designed for the Indian market context.
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="price" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="price" className="text-base"><Calculator className="w-4 h-4 mr-2" />Price Calculator</TabsTrigger>
                    <TabsTrigger value="loan" className="text-base"><IndianRupee className="w-4 h-4 mr-2" />Loan Estimator</TabsTrigger>
                </TabsList>

                {/* --- PRICE TAB --- */}
                <TabsContent value="price" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Inputs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Gold Details</CardTitle>
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
                                    <p className="text-xs text-muted-foreground">Current approximate market rate</p>
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
                            <Card className="bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center text-xl">
                                        Final Price
                                        <span className="text-2xl text-primary font-bold">
                                            {priceResult && formatIndianCurrency(priceResult.totalAmount)}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>Inclusive of all taxes and charges</CardDescription>
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

                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg flex gap-3 text-blue-700 dark:text-blue-300 text-sm">
                                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>
                                            Typically, jewelers charge GST on the final bill value.
                                            This calculator separates GST on Gold ({gstGold}%) and Making ({gstMaking}%) for transparency.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

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
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Base Rate (24K)</div>
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

                                {/* Purity Rate Preview */}
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground bg-background p-2 rounded-md border">
                                    <span className="font-medium text-foreground">Applied Rates:</span>
                                    <span>22K: {formatIndianCurrency(Number(loanRatePerGram) * 0.916)}/g</span>
                                    <span className="text-border">|</span>
                                    <span>18K: {formatIndianCurrency(Number(loanRatePerGram) * 0.75)}/g</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* Ornament List as Cards */}
                            <div className="space-y-4">
                                {ornaments.map((item) => {
                                    const purityRate = Number(loanRatePerGram) * GOLD_PURITY_FACTORS[item.purity];
                                    const itemValue = Math.round(purityRate * Number(item.weight));
                                    const itemLoan = Math.round(itemValue * (ltv / 100));

                                    return (
                                        <div key={item.id} className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors relative group">
                                            {/* Header: Name + Delete */}
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

                                            {/* Inputs: Weight + Purity */}
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

                                            {/* Calculation Results (Below) */}
                                            <div className="bg-muted/40 rounded-md p-3 grid grid-cols-2 gap-4 border border-border/50">
                                                <div>
                                                    <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Gold Value</div>
                                                    <div className="text-sm font-semibold">{formatIndianCurrency(itemValue)}</div>
                                                    <div className="text-[10px] text-muted-foreground">@ {formatIndianCurrency(purityRate)}/g</div>
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

                            {/* Footer Actions & Summary */}
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

                    {/* Loan Controls & Summary */}
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
                                <CardContent className="grid gap-4 sm:grid-cols-2">
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

                                    <div className="col-span-2 text-xs text-center text-muted-foreground mt-2">
                                        * Processing fees and other bank charges are not included.
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Helper for currency format (could be imported but defining here for safety)
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
