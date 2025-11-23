import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Calculator, Receipt, Info } from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
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

const GSTCalculator = () => {
  const [amount, setAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [isInclusive, setIsInclusive] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const result = useMemo(() => {
    return calculateGST(amount, gstRate, isInclusive);
  }, [amount, gstRate, isInclusive]);

  const handleReset = () => {
    setAmount(10000);
    setGstRate(18);
    setIsInclusive(false);
  };

  const commonGSTRates = [
    { rate: 5, label: "5%" },
    { rate: 12, label: "12%" },
    { rate: 18, label: "18%" },
    { rate: 28, label: "28%" },
  ];

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">GST Calculator</h2>
              <p className="text-xs text-muted-foreground">
                Calculate GST inclusive or exclusive
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
                  <DialogTitle>GST Calculator Information</DialogTitle>
                </DialogHeader>
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

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Real-World Examples
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Example 1: Laptop Purchase (Exclusive)
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Product Price:</strong> ₹50,000
                          <br />
                          <strong>GST Rate:</strong> 18%
                          <br />
                          <strong>GST Amount:</strong> ₹9,000
                          <br />
                          <strong>CGST:</strong> ₹4,500 | <strong>SGST:</strong>{" "}
                          ₹4,500
                          <br />
                          <strong>Total Payment:</strong> ₹59,000
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                          Example 2: Restaurant Bill (Inclusive)
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Bill Amount:</strong> ₹1,180 (inclusive)
                          <br />
                          <strong>GST Rate:</strong> 18%
                          <br />
                          <strong>Base Amount:</strong> ₹1,000
                          <br />
                          <strong>GST Amount:</strong> ₹180
                          <br />
                          <strong>CGST:</strong> ₹90 | <strong>SGST:</strong>{" "}
                          ₹90
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                      Pro Tips
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>
                        Always check if price is GST inclusive or exclusive
                      </li>
                      <li>
                        Keep GST invoices for business purchases to claim input
                        tax credit
                      </li>
                      <li>Use this calculator to verify bills and invoices</li>
                      <li>
                        GST registration mandatory if turnover exceeds ₹40L
                      </li>
                      <li>File GST returns on time to avoid penalties</li>
                    </ul>
                  </div>
                </div>
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
          <Label className="text-sm font-medium mb-3 block">GST Type</Label>
          <Select
            value={isInclusive ? "inclusive" : "exclusive"}
            onValueChange={(value) => setIsInclusive(value === "inclusive")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exclusive">GST Exclusive</SelectItem>
              <SelectItem value="inclusive">GST Inclusive</SelectItem>
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
          prefix="₹"
        />

        <div>
          <CalculatorInput
            label="GST rate"
            value={gstRate}
            onChange={setGstRate}
            min={0}
            max={28}
            step={0.1}
            suffix="%"
          />
          <div className="mt-3 flex gap-2">
            {commonGSTRates.map((item) => (
              <Button
                key={item.rate}
                variant={gstRate === item.rate ? "default" : "outline"}
                size="sm"
                onClick={() => setGstRate(item.rate)}
              >
                {item.label}
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
        <h3 className="text-lg font-semibold">GST Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border text-center">
            <p className="text-xs text-blue-600 mb-1">Base Amount</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
              ₹{result.originalAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border text-center">
            <p className="text-xs text-orange-600 mb-1">GST Amount</p>
            <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
              ₹{result.gstAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border text-center">
            <p className="text-xs text-green-600 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">
              ₹{result.totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-lg">
          <h4 className="text-sm font-semibold mb-3 text-center">
            GST Components
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">CGST</p>
              <p className="text-lg font-bold">
                ₹{result.cgst.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">SGST</p>
              <p className="text-lg font-bold">
                ₹{result.sgst.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">IGST</p>
              <p className="text-lg font-bold">
                ₹{result.igst.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default GSTCalculator;
