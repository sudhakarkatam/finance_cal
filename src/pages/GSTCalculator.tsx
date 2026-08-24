import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SaveDialog from "@/components/SaveDialog";
import ShareReportModal from "@/components/ShareReportModal";
import CalculatorInput from "@/components/ui/CalculatorInput";
import { Share2, Receipt, Info, RotateCcw, Save } from "lucide-react";
import { calculateGST } from "@/lib/calculations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";

const TAX_CONFIG: Record<string, {
  name: string;
  rates: number[];
  defaultRate: number;
  description: string;
  showBreakdown: boolean;
}> = {
  INR: {
    name: "GST",
    rates: [5, 12, 18, 28],
    defaultRate: 18,
    description: "Goods and Services Tax",
    showBreakdown: true
  },
  USD: {
    name: "Sales Tax",
    rates: [0, 6, 8, 10],
    defaultRate: 8,
    description: "State Sales Tax",
    showBreakdown: false
  },
  EUR: {
    name: "VAT",
    rates: [7, 19],
    defaultRate: 19,
    description: "Value Added Tax (DE)",
    showBreakdown: false
  },
  GBP: {
    name: "VAT",
    rates: [5, 20],
    defaultRate: 20,
    description: "Value Added Tax (UK)",
    showBreakdown: false
  },
  JPY: {
    name: "Consumption Tax",
    rates: [8, 10],
    defaultRate: 10,
    description: "Consumption Tax",
    showBreakdown: false
  }
};

const DEFAULT_CONFIG = {
  name: "Tax",
  rates: [5, 10, 15, 20],
  defaultRate: 10,
  description: "Tax",
  showBreakdown: false
};

const GSTCalculator = () => {
  const { formatAmount, symbol, code } = useCurrency();
  const config = TAX_CONFIG[code] || DEFAULT_CONFIG;

  const [amount, setAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(config.defaultRate);
  const [isInclusive, setIsInclusive] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Reset rate when currency changes
  useEffect(() => {
    setGstRate(config.defaultRate);
  }, [code]);

  const result = useMemo(() => {
    return calculateGST(amount, gstRate, isInclusive);
  }, [amount, gstRate, isInclusive]);

  const handleReset = () => {
    setAmount(10000);
    setGstRate(config.defaultRate);
    setIsInclusive(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{config.name} Calculator</h2>
              <p className="text-xs text-muted-foreground">
                Calculate {config.name} inclusive or exclusive
              </p>
            </div>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  title="Information"
                >
                  <Info className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{config.name} Information</DialogTitle>
                </DialogHeader>

                {code === 'INR' ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        What is GST?
                      </h3>
                      <p className="text-muted-foreground">
                        Goods and Services Tax (GST) is an indirect tax levied on
                        the supply of goods and services in India. It replaced
                        multiple indirect taxes like VAT, service tax, and excise
                        duty. GST is a comprehensive, destination-based tax.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        GST Components
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>
                          <strong>CGST:</strong> Central GST (50% of total GST)
                        </li>
                        <li>
                          <strong>SGST:</strong> State GST (50% of total GST)
                        </li>
                        <li>
                          <strong>IGST:</strong> Integrated GST (for inter-state)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        GST Slabs in India
                      </h3>
                      <div className="space-y-2">
                        <div className="bg-green-50 dark:bg-green-950 p-2 rounded border">
                          <strong className="text-green-900 dark:text-green-100">
                            0% GST:
                          </strong>
                          <span className="text-sm text-green-800 dark:text-green-200 ml-2">
                            Essential items like vegetables, milk, education,
                            healthcare
                          </span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded border">
                          <strong className="text-blue-900 dark:text-blue-100">
                            5% GST:
                          </strong>
                          <span className="text-sm text-blue-800 dark:text-blue-200 ml-2">
                            Basic necessities like sugar, tea, edible oils, coal
                          </span>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950 p-2 rounded border">
                          <strong className="text-purple-900 dark:text-purple-100">
                            12% GST:
                          </strong>
                          <span className="text-sm text-purple-800 dark:text-purple-200 ml-2">
                            Processed food, computers, mobile phones
                          </span>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950 p-2 rounded border">
                          <strong className="text-orange-900 dark:text-orange-100">
                            18% GST:
                          </strong>
                          <span className="text-sm text-orange-800 dark:text-orange-200 ml-2">
                            Most goods - AC restaurants, IT services
                          </span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950 p-2 rounded border">
                          <strong className="text-red-900 dark:text-red-100">
                            28% GST:
                          </strong>
                          <span className="text-sm text-red-800 dark:text-red-200 ml-2">
                            Luxury items - cars, cigarettes, aerated drinks
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Formulas Used
                      </h3>
                      <div className="bg-muted p-3 rounded-lg space-y-2">
                        <p className="font-mono text-xs">
                          <strong>GST Exclusive:</strong>
                        </p>
                        <p className="font-mono text-xs ml-2">
                          GST = Base × (Rate / 100)
                        </p>
                        <p className="font-mono text-xs ml-2">
                          Total = Base + GST
                        </p>
                        <p className="font-mono text-xs mt-2">
                          <strong>GST Inclusive:</strong>
                        </p>
                        <p className="font-mono text-xs ml-2">
                          Base = Total / (1 + Rate/100)
                        </p>
                        <p className="font-mono text-xs ml-2">
                          GST = Total - Base
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        About {config.description}
                      </h3>
                      <p className="text-muted-foreground">
                        This calculator helps you estimate the {config.name} liability on your purchases or sales.
                        {config.name} is typically charged as a percentage of the selling price.
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg space-y-2">
                      <p className="font-mono text-xs">
                        <strong>{config.name} Exclusive:</strong> Total = Base + (Base × Rate/100)
                      </p>
                      <p className="font-mono text-xs">
                        <strong>{config.name} Inclusive:</strong> Base = Total / (1 + Rate/100)
                      </p>
                    </div>
                  </div>
                )}
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

        <div className="bg-card p-4 rounded-lg border">
          <Label className="text-sm font-medium mb-3 block">{config.name} Type</Label>
          <Select
            value={isInclusive ? "inclusive" : "exclusive"}
            onValueChange={(value) => setIsInclusive(value === "inclusive")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exclusive">{config.name} Exclusive</SelectItem>
              <SelectItem value="inclusive">{config.name} Inclusive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CalculatorInput
          label={isInclusive ? "Total amount" : "Base amount"}
          value={amount}
          onChange={setAmount}
          min={1}
          max={100000000}
          step={100}
          prefix={symbol}
        />

        <div>
          <CalculatorInput
            label={`${config.name} rate`}
            value={gstRate}
            onChange={setGstRate}
            min={0}
            max={100}
            step={0.1}
            suffix="%"
          />
          <div className="mt-3 flex gap-2 flex-wrap">
            {config.rates.map((rate) => (
              <Button
                key={rate}
                variant={gstRate === rate ? "default" : "outline"}
                size="sm"
                onClick={() => setGstRate(rate)}
              >
                {rate}%
              </Button>
            ))}
          </div>
        </div>

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-4 h-4" />
          Save Result
        </Button>
      </Card>

      <Card className="p-6 space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold">{config.name} Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border text-center">
            <p className="text-xs text-blue-600 mb-1">Base Amount</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {formatAmount(result.originalAmount)}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border text-center">
            <p className="text-xs text-orange-600 mb-1">{config.name} Amount</p>
            <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
              {formatAmount(result.gstAmount)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border text-center">
            <p className="text-xs text-green-600 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">
              {formatAmount(result.totalAmount)}
            </p>
          </div>
        </div>

        {config.showBreakdown && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="text-sm font-semibold mb-3 text-center">
              {config.name} Components
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">CGST</p>
                <p className="text-lg font-bold">
                  {formatAmount(result.cgst)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">SGST</p>
                <p className="text-lg font-bold">
                  {formatAmount(result.sgst)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">IGST</p>
                <p className="text-lg font-bold">
                  {formatAmount(result.igst)}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full gap-2 font-semibold border-primary/40 text-primary hover:bg-primary/10"
          onClick={() => setShareDialogOpen(true)}
        >
          <Share2 className="w-4 h-4" />
          Export & Share Report PDF
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="gst"
        inputs={{ amount, gstRate, isInclusive: isInclusive ? 1 : 0 }}
        results={{
          originalAmount: result.originalAmount,
          gstAmount: result.gstAmount,
          totalAmount: result.totalAmount,
        }}
      />

      <ShareReportModal
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={`${config.name} Tax Statement`}
        inputs={[
          { label: "Base Amount", value: formatAmount(amount) },
          { label: `${config.name} Rate`, value: `${gstRate}%` },
          { label: "Tax Calculation Type", value: isInclusive ? "Inclusive (Included in Price)" : "Exclusive (Added on Price)" },
        ]}
        results={[
          { label: "Net Base Amount", value: formatAmount(result.originalAmount) },
          { label: `${config.name} Amount`, value: formatAmount(result.gstAmount) },
          { label: "Final Invoice Amount", value: formatAmount(result.totalAmount), isHighlight: true },
        ]}
        analysis={[
          {
            title: "🧾 Tax Component & Rate Split Audit",
            items: [
              { label: `${config.name} Tax Rate`, value: `${gstRate}%` },
              ...(config.showBreakdown ? [
                { label: "Central GST (CGST)", value: formatAmount(result.gstAmount / 2) },
                { label: "State GST (SGST)", value: formatAmount(result.gstAmount / 2) }
              ] : []),
              { label: "Tax Share of Invoice Total", value: `${((result.gstAmount / (result.totalAmount || 1)) * 100).toFixed(1)}% of final amount`, isHighlight: true }
            ]
          }
        ]}
      />
    </div>
  );
};

export default GSTCalculator;
