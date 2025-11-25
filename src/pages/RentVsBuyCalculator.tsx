import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Home, Info, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrency } from "@/hooks/useCurrency";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const RentVsBuyCalculator = () => {
    const { formatAmount, symbol } = useCurrency();

    // Basic Buying Inputs
    const [propertyPrice, setPropertyPrice] = useState(5000000);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [loanInterest, setLoanInterest] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);

    // Basic Renting Inputs
    const [monthlyRent, setMonthlyRent] = useState(15000);
    const [investmentReturn, setInvestmentReturn] = useState(10);

    // Advanced Options State
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced Buying Costs
    const [appreciationRate, setAppreciationRate] = useState(5);
    const [maintenanceRate, setMaintenanceRate] = useState(0.5); // % of property value per year
    const [propertyTaxRate, setPropertyTaxRate] = useState(0.2); // % of property value per year
    const [homeInsurance, setHomeInsurance] = useState(5000); // Annual
    const [buyingClosingCosts, setBuyingClosingCosts] = useState(5); // % (Stamp duty, registration)
    const [sellingCosts, setSellingCosts] = useState(2); // % (Brokerage etc)

    // Advanced Renting Costs
    const [rentInflation, setRentInflation] = useState(5);
    const [securityDeposit, setSecurityDeposit] = useState(100000); // One time
    const [brokerage, setBrokerage] = useState(15000); // One time or annual? Let's assume one time for simplicity or every few years. Simplified to one-time.
    const [renterInsurance, setRenterInsurance] = useState(0); // Monthly

    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);

    const result = useMemo(() => {
        const months = loanTenure * 12;
        const downPayment = propertyPrice * (downPaymentPercent / 100);
        const loanAmount = propertyPrice - downPayment;
        const closingCostsAmount = propertyPrice * (buyingClosingCosts / 100);

        // Initial Cash Outflow for Buying
        const initialBuyingCost = downPayment + closingCostsAmount;

        // Initial Cash Outflow for Renting
        const initialRentingCost = securityDeposit + brokerage;

        // Initial Investment Corpus for Renting Scenario
        // The difference in initial costs is invested
        let rentingNetWorth = 0;

        // If buying costs more upfront, the renter invests the difference
        if (initialBuyingCost > initialRentingCost) {
            rentingNetWorth = initialBuyingCost - initialRentingCost;
        } else {
            // If renting costs more upfront (unlikely but possible), buying starts with "savings" or renter starts with debt.
            // Simplified: Renter starts with 0, but we track the difference.
            rentingNetWorth = 0;
            // In a detailed model, we'd adjust for this. For now, assume Buying is usually heavier upfront.
        }

        // EMI Calculation
        const r = loanInterest / 12 / 100;
        const emi = (loanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

        let buyingNetWorth = 0;

        let totalRentPaid = 0;
        let totalEmiPaid = 0;
        let totalMaintenance = 0;
        let totalPropertyTax = 0;

        let currentPropertyValue = propertyPrice;
        let currentRent = monthlyRent;
        let outstandingLoan = loanAmount;

        const chartData = [];

        // Simulate month by month
        for (let i = 1; i <= months; i++) {
            // --- Buying Scenario Costs ---
            // Monthly Maintenance
            const monthlyMaintenance = (currentPropertyValue * (maintenanceRate / 100)) / 12;
            // Monthly Property Tax
            const monthlyPropertyTax = (currentPropertyValue * (propertyTaxRate / 100)) / 12;
            // Monthly Insurance
            const monthlyHomeInsurance = homeInsurance / 12;

            const totalMonthlyBuyingCost = emi + monthlyMaintenance + monthlyPropertyTax + monthlyHomeInsurance;

            totalEmiPaid += emi;
            totalMaintenance += monthlyMaintenance;
            totalPropertyTax += monthlyPropertyTax;

            // Loan Amortization
            const interestComponent = outstandingLoan * r;
            const principalComponent = emi - interestComponent;
            outstandingLoan -= principalComponent;
            if (outstandingLoan < 0) outstandingLoan = 0;

            // --- Renting Scenario Costs ---
            const monthlyRenterInsurance = renterInsurance;
            const totalMonthlyRentingCost = currentRent + monthlyRenterInsurance;

            totalRentPaid += currentRent;

            // --- Comparison & Investment ---
            const monthlyDifference = totalMonthlyBuyingCost - totalMonthlyRentingCost;

            // If Buying is more expensive, Renter invests the difference
            if (monthlyDifference > 0) {
                rentingNetWorth += monthlyDifference;
            } else {
                // If Renting is more expensive, Renter withdraws from savings to pay rent (or Buyer invests the savings)
                // Simplified: Renter's net worth decreases
                rentingNetWorth += monthlyDifference;
            }

            // Grow Renter's Investments
            rentingNetWorth *= (1 + (investmentReturn / 12 / 100));

            // Property Appreciation
            currentPropertyValue *= (1 + (appreciationRate / 12 / 100));

            // Rent Inflation (Annual)
            if (i % 12 === 0) {
                currentRent *= (1 + rentInflation / 100);

                // Add data point for chart (Annual)
                chartData.push({
                    year: i / 12,
                    Buying: Math.round(currentPropertyValue - outstandingLoan),
                    Renting: Math.round(rentingNetWorth + securityDeposit) // Return of deposit
                });
            }
        }

        // Final Net Worth Calculation
        // Buying: Final Property Value - Selling Costs - Outstanding Loan (should be 0)
        const finalSellingCosts = currentPropertyValue * (sellingCosts / 100);
        buyingNetWorth = currentPropertyValue - finalSellingCosts - outstandingLoan;

        // Renting: Investment Value + Security Deposit Return
        const finalRentingNetWorth = rentingNetWorth + securityDeposit;

        const difference = buyingNetWorth - finalRentingNetWorth;
        const betterOption = difference > 0 ? "Buying" : "Renting";

        return {
            buyingNetWorth,
            rentingNetWorth: finalRentingNetWorth,
            difference: Math.abs(difference),
            betterOption,
            totalRentPaid,
            totalEmiPaid,
            finalPropertyValue: currentPropertyValue,
            chartData,
            initialBuyingCost,
            initialRentingCost
        };
    }, [propertyPrice, downPaymentPercent, loanInterest, loanTenure, appreciationRate, maintenanceRate, propertyTaxRate, homeInsurance, buyingClosingCosts, sellingCosts, monthlyRent, rentInflation, securityDeposit, brokerage, renterInsurance, investmentReturn]);

    const handleReset = () => {
        setPropertyPrice(5000000);
        setDownPaymentPercent(20);
        setLoanInterest(8.5);
        setLoanTenure(20);
        setMonthlyRent(15000);
        setInvestmentReturn(10);
        setShowAdvanced(false);
    };

    return (
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
            <Card className="p-6 space-y-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Home className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Rent vs Buy Calculator</h2>
                            <p className="text-xs text-muted-foreground">
                                Advanced Comparison with Opportunity Cost
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
                                    <DialogTitle>How it works</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 text-sm">
                                    <p>
                                        This calculator performs a comprehensive financial comparison between buying a home and renting one.
                                    </p>
                                    <div className="bg-muted p-3 rounded-lg">
                                        <h4 className="font-semibold mb-2">The "Opportunity Cost" Logic</h4>
                                        <p>
                                            The core principle is that money not spent on buying a home (like a lower down payment or lower monthly costs) is invested by the renter.
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                                            <li>
                                                <strong>Initial Investment:</strong> If buying requires ₹10L upfront (Down payment + Stamp duty) and renting requires ₹1L (Deposit), the renter invests the ₹9L difference.
                                            </li>
                                            <li>
                                                <strong>Monthly Investment:</strong> If EMI + Maintenance is ₹50k and Rent is ₹20k, the renter invests the ₹30k difference every month.
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">Buying Costs Included</h4>
                                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                                                <li>Property Price & Appreciation</li>
                                                <li>Stamp Duty & Registration</li>
                                                <li>Loan Interest</li>
                                                <li>Property Tax & Maintenance</li>
                                                <li>Home Insurance</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Renting Costs Included</h4>
                                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                                                <li>Monthly Rent & Inflation</li>
                                                <li>Security Deposit</li>
                                                <li>Brokerage</li>
                                                <li>Renter's Insurance</li>
                                            </ul>
                                        </div>
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

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                            <Home className="w-4 h-4" /> Buying Inputs
                        </h3>
                        <CalculatorInput
                            label="Property Price"
                            value={propertyPrice}
                            onChange={setPropertyPrice}
                            min={100000}
                            max={100000000}
                            step={100000}
                            prefix={symbol}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <CalculatorInput
                                label="Down Payment (%)"
                                value={downPaymentPercent}
                                onChange={setDownPaymentPercent}
                                min={5}
                                max={90}
                                suffix="%"
                            />
                            <CalculatorInput
                                label="Loan Rate (%)"
                                value={loanInterest}
                                onChange={setLoanInterest}
                                min={1}
                                max={20}
                                step={0.1}
                                suffix="%"
                            />
                        </div>
                        <CalculatorInput
                            label="Loan Tenure (Years)"
                            value={loanTenure}
                            onChange={setLoanTenure}
                            min={5}
                            max={30}
                            suffix="yrs"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Renting Inputs
                        </h3>
                        <CalculatorInput
                            label="Monthly Rent"
                            value={monthlyRent}
                            onChange={setMonthlyRent}
                            min={1000}
                            max={500000}
                            step={1000}
                            prefix={symbol}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <CalculatorInput
                                label="Rent Inflation (%)"
                                value={rentInflation}
                                onChange={setRentInflation}
                                min={0}
                                max={15}
                                suffix="%"
                            />
                            <CalculatorInput
                                label="Inv. Return (%)"
                                value={investmentReturn}
                                onChange={setInvestmentReturn}
                                min={1}
                                max={30}
                                suffix="%"
                            />
                        </div>
                    </div>
                </div>

                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full flex justify-between p-2 border rounded-lg hover:bg-muted">
                            <span className="font-semibold">Advanced Settings & Detailed Costs</span>
                            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">Buying Details</h4>
                                <CalculatorInput
                                    label="Appreciation Rate (%)"
                                    value={appreciationRate}
                                    onChange={setAppreciationRate}
                                    min={0}
                                    max={20}
                                    step={0.1}
                                    suffix="%"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <CalculatorInput
                                        label="Maintenance (%)"
                                        value={maintenanceRate}
                                        onChange={setMaintenanceRate}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        suffix="/yr"
                                    />
                                    <CalculatorInput
                                        label="Property Tax (%)"
                                        value={propertyTaxRate}
                                        onChange={setPropertyTaxRate}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        suffix="/yr"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <CalculatorInput
                                        label="Closing Costs (%)"
                                        value={buyingClosingCosts}
                                        onChange={setBuyingClosingCosts}
                                        min={0}
                                        max={15}
                                        suffix="%"
                                        tooltip="Stamp duty, registration, etc."
                                    />
                                    <CalculatorInput
                                        label="Selling Costs (%)"
                                        value={sellingCosts}
                                        onChange={setSellingCosts}
                                        min={0}
                                        max={10}
                                        suffix="%"
                                        tooltip="Brokerage when selling"
                                    />
                                </div>
                                <CalculatorInput
                                    label="Home Insurance (Annual)"
                                    value={homeInsurance}
                                    onChange={setHomeInsurance}
                                    min={0}
                                    max={100000}
                                    prefix={symbol}
                                />
                            </div>

                            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                                <h4 className="text-xs font-bold uppercase text-muted-foreground">Renting Details</h4>
                                <CalculatorInput
                                    label="Security Deposit"
                                    value={securityDeposit}
                                    onChange={setSecurityDeposit}
                                    min={0}
                                    max={1000000}
                                    prefix={symbol}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <CalculatorInput
                                        label="Brokerage"
                                        value={brokerage}
                                        onChange={setBrokerage}
                                        min={0}
                                        max={100000}
                                        prefix={symbol}
                                    />
                                    <CalculatorInput
                                        label="Renter Insurance"
                                        value={renterInsurance}
                                        onChange={setRenterInsurance}
                                        min={0}
                                        max={5000}
                                        prefix={symbol}
                                        suffix="/mo"
                                    />
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Button className="w-full gap-2" size="lg" onClick={() => setSaveDialogOpen(true)}>
                    <Save className="w-4 h-4" />
                    Save Result
                </Button>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">Verdict after {loanTenure} years</h3>
                    <p className="text-3xl font-bold text-primary">
                        {result.betterOption} is better
                    </p>
                    <p className="text-sm text-muted-foreground">
                        by approximately {formatAmount(result.difference)} in Net Worth
                    </p>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-green-700">
                        <Home className="w-4 h-4" /> Buying Outcome
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Final Property Value</span>
                            <span className="font-bold">{formatAmount(result.finalPropertyValue)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Initial Cost</span>
                            <span>{formatAmount(result.initialBuyingCost)}</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between font-bold text-lg">
                            <span>Net Worth</span>
                            <span className="text-green-600">{formatAmount(result.buyingNetWorth)}</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-blue-700">
                        <TrendingUp className="w-4 h-4" /> Renting Outcome
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Investment Value</span>
                            <span className="font-bold">{formatAmount(result.rentingNetWorth)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Initial Cost</span>
                            <span>{formatAmount(result.initialRentingCost)}</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between font-bold text-lg">
                            <span>Net Worth</span>
                            <span className="text-blue-600">{formatAmount(result.rentingNetWorth)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Net Worth Projection</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis tickFormatter={(value) => `${value / 100000}L`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip
                                formatter={(value: number) => formatAmount(value)}
                                labelFormatter={(label) => `Year ${label}`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="Buying"
                                stroke="#16a34a"
                                fillOpacity={1}
                                fill="url(#colorBuy)"
                                name="Buying Net Worth"
                            />
                            <Area
                                type="monotone"
                                dataKey="Renting"
                                stroke="#2563eb"
                                fillOpacity={1}
                                fill="url(#colorRent)"
                                name="Renting Net Worth"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <SaveDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                calculationType="rent-vs-buy"
                inputs={{ propertyPrice, monthlyRent, loanTenure, investmentReturn }}
                results={{
                    buyingNetWorth: result.buyingNetWorth,
                    rentingNetWorth: result.rentingNetWorth
                }}
            />
        </div>
    );
};

export default RentVsBuyCalculator;
