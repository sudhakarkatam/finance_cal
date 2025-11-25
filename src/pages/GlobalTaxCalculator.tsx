import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Globe, Info } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type CountryCode = 'US' | 'UK' | 'DE' | 'AU';

const GlobalTaxCalculator = () => {
    const [country, setCountry] = useState<CountryCode>('US');
    const [grossIncome, setGrossIncome] = useState(60000);

    // US Specific
    const [usStateTaxRate, setUsStateTaxRate] = useState(5);
    const [usFilingStatus, setUsFilingStatus] = useState('single');

    // Germany Specific
    const [deTaxClass, setDeTaxClass] = useState('1');
    const [deChurchTax, setDeChurchTax] = useState(false);

    const [saveDialogOpen, setSaveDialogOpen] = useState(false);

    const result = useMemo(() => {
        let tax = 0;
        let netIncome = 0;
        let details: any = {};

        if (country === 'US') {
            // 2024 Federal Brackets (Single)
            const standardDeduction = usFilingStatus === 'single' ? 14600 : 29200;
            const taxableIncome = Math.max(0, grossIncome - standardDeduction);

            let federalTax = 0;
            const brackets = usFilingStatus === 'single'
                ? [
                    { limit: 11600, rate: 0.10 },
                    { limit: 47150, rate: 0.12 },
                    { limit: 100525, rate: 0.22 },
                    { limit: 191950, rate: 0.24 },
                    { limit: 243725, rate: 0.32 },
                    { limit: 609350, rate: 0.35 },
                    { limit: Infinity, rate: 0.37 }
                ]
                : [ // Married Jointly
                    { limit: 23200, rate: 0.10 },
                    { limit: 94300, rate: 0.12 },
                    { limit: 201050, rate: 0.22 },
                    { limit: 383900, rate: 0.24 },
                    { limit: 487450, rate: 0.32 },
                    { limit: 731200, rate: 0.35 },
                    { limit: Infinity, rate: 0.37 }
                ];

            let previousLimit = 0;
            for (const bracket of brackets) {
                if (taxableIncome > previousLimit) {
                    const taxableAmount = Math.min(taxableIncome, bracket.limit) - previousLimit;
                    federalTax += taxableAmount * bracket.rate;
                    previousLimit = bracket.limit;
                } else {
                    break;
                }
            }

            const stateTax = grossIncome * (usStateTaxRate / 100);
            const FICA = grossIncome * 0.0765; // Social Security + Medicare

            tax = federalTax + stateTax + FICA;
            netIncome = grossIncome - tax;
            details = { Federal: federalTax, State: stateTax, FICA };

        } else if (country === 'UK') {
            // 2024/25 Tax Bands
            const personalAllowance = 12570;
            const taxableIncome = Math.max(0, grossIncome - personalAllowance);

            let incomeTax = 0;
            // Basic: 12,571 to 50,270 (20%)
            // Higher: 50,271 to 125,140 (40%)
            // Additional: over 125,140 (45%)

            if (grossIncome > 125140) {
                incomeTax += (grossIncome - 125140) * 0.45;
                incomeTax += (125140 - 50270) * 0.40;
                incomeTax += (50270 - 12570) * 0.20;
            } else if (grossIncome > 50270) {
                incomeTax += (grossIncome - 50270) * 0.40;
                incomeTax += (50270 - 12570) * 0.20;
            } else if (grossIncome > 12570) {
                incomeTax += (grossIncome - 12570) * 0.20;
            }

            // National Insurance (Class 1) - Simplified 8% / 2%
            // Threshold: 12,570. Upper: 50,270
            let ni = 0;
            if (grossIncome > 50270) {
                ni += (grossIncome - 50270) * 0.02;
                ni += (50270 - 12570) * 0.08;
            } else if (grossIncome > 12570) {
                ni += (grossIncome - 12570) * 0.08;
            }

            tax = incomeTax + ni;
            netIncome = grossIncome - tax;
            details = { "Income Tax": incomeTax, "National Insurance": ni };

        } else if (country === 'DE') {
            // Germany 2024 Simplified Progressive
            // Basic Allowance: 11,604
            const basicAllowance = 11604;
            let incomeTax = 0;

            if (grossIncome > basicAllowance) {
                // Very simplified progressive estimation for demo
                // Real formula is complex geometric progression
                const taxable = grossIncome - basicAllowance;
                if (taxable < 50000) incomeTax = taxable * 0.25;
                else if (taxable < 277000) incomeTax = taxable * 0.42;
                else incomeTax = taxable * 0.45;
            }

            const soli = incomeTax > 18130 ? incomeTax * 0.055 : 0;
            const church = deChurchTax ? incomeTax * 0.09 : 0;

            tax = incomeTax + soli + church;
            netIncome = grossIncome - tax;
            details = { "Income Tax": incomeTax, "Solidarity Surcharge": soli, "Church Tax": church };

        } else if (country === 'AU') {
            // Australia 2024-25 Resident
            // 0 - 18,200: Nil
            // 18,201 - 45,000: 16%
            // 45,001 - 135,000: 30%
            // 135,001 - 190,000: 37%
            // 190,001+: 45%

            let incomeTax = 0;
            if (grossIncome > 190000) {
                incomeTax = 51638 + (grossIncome - 190000) * 0.45;
            } else if (grossIncome > 135000) {
                incomeTax = 31288 + (grossIncome - 135000) * 0.37;
            } else if (grossIncome > 45000) {
                incomeTax = 4288 + (grossIncome - 45000) * 0.30;
            } else if (grossIncome > 18200) {
                incomeTax = (grossIncome - 18200) * 0.16;
            }

            const medicare = grossIncome * 0.02;

            tax = incomeTax + medicare;
            netIncome = grossIncome - tax;
            details = { "Income Tax": incomeTax, "Medicare Levy": medicare };
        }

        return { tax, netIncome, details };
    }, [country, grossIncome, usStateTaxRate, usFilingStatus, deTaxClass, deChurchTax]);

    const getCurrencySymbol = (c: CountryCode) => {
        switch (c) {
            case 'US': return '$';
            case 'UK': return '£';
            case 'DE': return '€';
            case 'AU': return 'A$';
            default: return '$';
        }
    };

    const format = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: country === 'UK' ? 'GBP' : country === 'DE' ? 'EUR' : country === 'AU' ? 'AUD' : 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
            <Card className="p-6 space-y-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Globe className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Global Income Tax</h2>
                            <p className="text-xs text-muted-foreground">
                                Estimate taxes for major economies (2024/25 Rules)
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setGrossIncome(60000)} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </Button>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-4 rounded-lg border">
                        <Label className="text-sm font-medium mb-3 block">Select Country</Label>
                        <div className="flex gap-2 flex-wrap">
                            {(['US', 'UK', 'DE', 'AU'] as CountryCode[]).map((c) => (
                                <Button
                                    key={c}
                                    variant={country === c ? "default" : "outline"}
                                    onClick={() => setCountry(c)}
                                    className="flex-1 min-w-[80px]"
                                >
                                    {c === 'US' ? '🇺🇸 USA' : c === 'UK' ? '🇬🇧 UK' : c === 'DE' ? '🇩🇪 Germany' : '🇦🇺 Australia'}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <CalculatorInput
                        label="Annual Gross Income"
                        value={grossIncome}
                        onChange={setGrossIncome}
                        min={0}
                        max={10000000}
                        step={1000}
                        prefix={getCurrencySymbol(country)}
                    />

                    {country === 'US' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Filing Status</Label>
                                <Select value={usFilingStatus} onValueChange={setUsFilingStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="married">Married Filing Jointly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <CalculatorInput
                                label="State Tax Rate (%)"
                                value={usStateTaxRate}
                                onChange={setUsStateTaxRate}
                                min={0}
                                max={15}
                                step={0.1}
                                suffix="%"
                            />
                        </div>
                    )}

                    {country === 'DE' && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label>Include Church Tax (8-9%)</Label>
                            <Switch checked={deChurchTax} onCheckedChange={setDeChurchTax} />
                        </div>
                    )}
                </div>

                <Button className="w-full gap-2" size="lg" onClick={() => setSaveDialogOpen(true)}>
                    <Save className="w-4 h-4" />
                    Save Result
                </Button>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
                    <h3 className="text-lg font-semibold text-center">Net Income</h3>
                    <p className="text-3xl font-bold text-center text-primary">
                        {format(result.netIncome)}
                    </p>
                    <p className="text-sm text-center text-muted-foreground">
                        Effective Tax Rate: {((result.tax / grossIncome) * 100).toFixed(1)}%
                    </p>
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Tax Breakdown</h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(result.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground">{key}</span>
                                <span className="font-medium text-red-600">-{format(value as number)}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between font-bold">
                            <span>Total Tax</span>
                            <span className="text-red-600">-{format(result.tax)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            <SaveDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                calculationType="global-tax"
                inputs={{ country, grossIncome }}
                results={{
                    netIncome: result.netIncome,
                    totalTax: result.tax
                }}
            />
        </div>
    );
};

export default GlobalTaxCalculator;
