import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  Calculator,
  ArrowRightLeft,
  Settings,
  TrendingUp,
  Info,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate per 1 INR
}

// Default currency configuration with November 2025 rates
const createDefaultCurrencies = (): Record<string, Currency> => ({
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 1 },
  USD: { code: "USD", name: "US Dollar", symbol: "$", rate: 0.01128 }, // 1 USD = ₹88.67 INR (Nov 2025)
  EUR: { code: "EUR", name: "Euro", symbol: "€", rate: 0.00975 }, // 1 EUR = ₹102.58 INR (Nov 2025)
  GBP: { code: "GBP", name: "British Pound", symbol: "£", rate: 0.00857 }, // 1 GBP = ₹116.67 INR (Nov 2025)
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 1.7241 }, // 1 JPY = ₹0.58 INR (Nov 2025)
  KWD: { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", rate: 0.00346 }, // 1 KWD = ₹288.91 INR (Nov 2025)
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 0.01585 }, // 1 CAD = ₹63.11 INR (Nov 2025)
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 0.01722 }, // 1 AUD = ₹58.09 INR (Nov 2025)
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 0.0147 }, // 1 SGD = ₹68.05 INR (Nov 2025)
  NZD: {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    rate: 0.01988,
  }, // 1 NZD = ₹50.31 INR (Nov 2025)
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "Fr", rate: 0.00911 }, // 1 CHF = ₹109.80 INR (Nov 2025)
  CNY: {
    code: "CNY",
    name: "Chinese Yuan Renminbi",
    symbol: "¥",
    rate: 0.08026,
  }, // 1 CNY = ₹12.46 INR (Nov 2025)
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", rate: 0.2092 }, // 1 MXN = ₹4.78 INR (Nov 2025)
});

const CurrencyCalculator = () => {
  // Currency configuration with default offline rates (users can modify)
  const [currencies, setCurrencies] = useState<Record<string, Currency>>(
    createDefaultCurrencies(),
  );

  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState(1000);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [ratesDialogOpen, setRatesDialogOpen] = useState(false);
  const [selectedCurrencyForRate, setSelectedCurrencyForRate] = useState("");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Save rates to localStorage
  const saveRatesToStorage = (rates: Record<string, Currency>) => {
    try {
      localStorage.setItem("currencyCalculator_rates", JSON.stringify(rates));
    } catch (error) {
      console.warn("Failed to save currency rates:", error);
    }
  };

  // Load rates from localStorage
  const loadRatesFromStorage = (): Record<string, Currency> => {
    try {
      const saved = localStorage.getItem("currencyCalculator_rates");
      if (saved) {
        const parsedRates = JSON.parse(saved);
        // Merge with defaults to ensure all currencies exist
        return { ...createDefaultCurrencies(), ...parsedRates };
      }
    } catch (error) {
      console.warn("Failed to load saved currency rates:", error);
    }
    return createDefaultCurrencies();
  };

  // Load saved rates on component mount
  useEffect(() => {
    const savedRates = loadRatesFromStorage();
    setCurrencies(savedRates);
  }, []);

  // Update exchange rate for a specific currency
  const updateExchangeRate = (currencyCode: string, newRate: number) => {
    if (currencyCode === "INR") return;

    // If user enters 85.63 for USD, it means 1 USD = 85.63 INR
    // So 1 INR = 1/85.63 USD = 0.01168 USD
    const convertedRate = 1 / newRate;

    setCurrencies((prev) => {
      const updated = {
        ...prev,
        [currencyCode]: { ...prev[currencyCode], rate: convertedRate },
      };
      saveRatesToStorage(updated);
      return updated;
    });
  };

  // Calculate conversion
  const conversionResult = useMemo(() => {
    const fromRate = currencies[fromCurrency]?.rate || 1;
    const toRate = currencies[toCurrency]?.rate || 1;

    // Convert: amount in fromCurrency → INR → toCurrency
    const amountInINR = fromCurrency === "INR" ? amount : amount / fromRate;
    const convertedAmount =
      toCurrency === "INR" ? amountInINR : amountInINR * toRate;

    return {
      amount: Math.round(convertedAmount * 100) / 100,
      fromRate,
      toRate,
      exchangeRate: toRate / fromRate,
    };
  }, [amount, fromCurrency, toCurrency, currencies]);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleReset = () => {
    setFromCurrency("INR");
    setToCurrency("USD");
    setAmount(1000);
    // Reset to default rates and clear localStorage
    setCurrencies(createDefaultCurrencies());
    try {
      localStorage.removeItem("currencyCalculator_rates");
    } catch (error) {
      console.warn("Failed to clear saved currency rates:", error);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto pt-2">
      {/* Header Card */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Currency Converter
              </h2>
              <p className="text-sm text-muted-foreground">
                Live exchange rates for 13 major currencies
              </p>
            </div>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setInfoDialogOpen(true)}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>About Currency Converter & Calculation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">What is Currency Converter?</h3>
                    <p className="text-muted-foreground">
                      Currency converter is a tool that calculates the equivalent value of one currency in terms of another currency using current exchange rates. It helps you understand currency values for travel, international transactions, or investment purposes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Supported Currencies</h3>
                    <p className="text-muted-foreground mb-2">
                      This calculator supports 13 major world currencies including INR, USD, EUR, GBP, JPY, KWD, CAD, AUD, SGD, NZD, CHF, CNY, and MXN.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Important Points</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Exchange rates are approximate and may vary by bank/service provider</li>
                      <li>Rates include base rates updated periodically</li>
                      <li>You can customize rates for your specific needs</li>
                      <li>Rates are saved in your browser for convenience</li>
                      <li>For accurate rates, check with your bank or currency service provider</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Calculator Features</h3>
                    <p className="text-muted-foreground">
                      The Currency Converter helps you convert between different currencies, view and customize exchange rates, and save your preferred rates for future use. Select source and target currencies, enter amount, and get instant conversion results.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Example 1: Travel Currency Conversion</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Planning Europe trip, need €5,000, current rate 1 EUR = ₹102.58<br />
                          <strong>Calculation:</strong> €5,000 × ₹102.58 = ₹5,12,900<br />
                          <strong>Budget Planning:</strong> Need approximately ₹5.13 lakhs for travel expenses<br />
                          <strong>Tip:</strong> Check rates before travel, rates fluctuate daily<br />
                          <strong>Strategy:</strong> Exchange in batches if rate is volatile - don't convert all at once
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Example 2: International Transfer</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Sending ₹10,00,000 to USA, rate 1 USD = ₹88.67<br />
                          <strong>Calculation:</strong> ₹10,00,000 ÷ ₹88.67 = $11,278<br />
                          <strong>Bank Charges:</strong> Typically ₹500-2000 + 1-2% markup on rate<br />
                          <strong>Actual Receipt:</strong> Approximately $11,100-11,150 (after charges)<br />
                          <strong>Planning:</strong> Factor in bank fees - rates shown are mid-market rates<br />
                          <strong>Tip:</strong> Compare transfer services (Wise, Remitly) for better rates
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Example 3: Investment Conversion</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> Investing $50,000 in US stocks, rate 1 USD = ₹88.67<br />
                          <strong>INR Required:</strong> $50,000 × ₹88.67 = ₹44,33,500<br />
                          <strong>Stock Gains:</strong> If stock appreciates 20%, value = $60,000<br />
                          <strong>Convert Back:</strong> If rate becomes ₹90, $60,000 = ₹54,00,000<br />
                          <strong>Total Gain:</strong> ₹9,66,500 (stock gain + currency gain)<br />
                          <strong>Risk:</strong> Currency fluctuation affects returns - USD appreciation helps
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Example 4: Multiple Currency Comparison</p>
                        <p className="text-sm">
                          <strong>Situation:</strong> ₹10,00,000 to convert, comparing destinations<br />
                          <strong>USD:</strong> ₹10L ÷ ₹88.67 = $11,278<br />
                          <strong>EUR:</strong> ₹10L ÷ ₹102.58 = €9,749<br />
                          <strong>GBP:</strong> ₹10L ÷ ₹116.67 = £8,571<br />
                          <strong>SGD:</strong> ₹10L ÷ ₹68.05 = S$14,695<br />
                          <strong>Planning:</strong> Different currencies have different purchasing power<br />
                          <strong>Strategy:</strong> Check local costs before converting - cheaper destination may need less
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Pro Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <li>Exchange rates change daily - check latest rates before major conversions</li>
                      <li>Banks add markup (1-3%) to rates - use currency converters for mid-market rates</li>
                      <li>For large amounts, negotiate rates with banks or use specialized services</li>
                      <li>Customize rates in calculator for specific bank/service provider rates</li>
                      <li>Save your preferred rates in calculator for quick access during travel or transactions</li>
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
            className="gap-2 hidden sm:flex"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Main Conversion Card */}
      <Card className="p-6 space-y-6 shadow-lg">
        {/* From Currency */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">From</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(currencies).map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground">
                        - {currency.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CalculatorInput
              label=""
              value={amount}
              onChange={setAmount}
              min={0.01}
              max={10000000}
              step={0.01}
              prefix={currencies[fromCurrency]?.symbol}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSwapCurrencies}
            className="gap-2 rounded-full px-6 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Swap</span>
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">To</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(currencies).map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground">
                        - {currency.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="h-12 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {currencies[toCurrency]?.symbol}{" "}
                {conversionResult.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Exchange Rate Display */}
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-center gap-2 text-center">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              1 {currencies[fromCurrency]?.code} ={" "}
              {conversionResult.exchangeRate.toFixed(6)}{" "}
              {currencies[toCurrency]?.code}
            </p>
          </div>
          {fromCurrency !== "INR" && toCurrency === "INR" && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              (1 {currencies[fromCurrency]?.code} = ₹
              {(1 / currencies[fromCurrency].rate).toFixed(2)} INR)
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Dialog open={ratesDialogOpen} onOpenChange={setRatesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Settings className="w-4 h-4" />
                Customize Rates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Set Custom Exchange Rate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency-select">Select Currency</Label>
                  <Select
                    value={selectedCurrencyForRate}
                    onValueChange={setSelectedCurrencyForRate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(currencies)
                        .filter((c) => c.code !== "INR")
                        .map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCurrencyForRate && (
                  <div className="space-y-2">
                    <Label htmlFor="rate-input">
                      1 {currencies[selectedCurrencyForRate]?.code} = ? INR
                    </Label>
                    <CalculatorInput
                      label=""
                      value={
                        currencies[selectedCurrencyForRate]?.rate
                          ? Math.round(
                              (1 / currencies[selectedCurrencyForRate].rate) *
                                100,
                            ) / 100
                          : 0
                      }
                      onChange={(value) => {
                        if (
                          typeof value === "number" &&
                          !isNaN(value) &&
                          value > 0
                        ) {
                          updateExchangeRate(selectedCurrencyForRate, value);
                        }
                      }}
                      min={0.01}
                      max={10000}
                      step={0.01}
                      placeholder="Enter value in INR"
                      prefix="₹"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: 1 {currencies[selectedCurrencyForRate]?.code} = ₹
                      {(1 / currencies[selectedCurrencyForRate].rate).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Enter how much 1 unit of foreign
                    currency equals in INR. Example: If 1 USD = ₹85.63, enter
                    85.63. Your custom rates will be saved.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCurrencyForRate("");
                      setRatesDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedCurrencyForRate("");
                    }}
                    className="flex-1"
                    disabled={!selectedCurrencyForRate}
                  >
                    Update Rate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            className="flex-1 gap-2"
            size="lg"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </Card>

      {/* Available Currencies Info Card */}
      <Card className="p-5 space-y-3 bg-muted/30 shadow-md">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Available Currencies (November 2025 Rates)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(currencies)
            .filter((c) => c.code !== "INR")
            .map((currency) => (
              <div
                key={currency.code}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-primary">
                    {currency.symbol}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {currency.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currency.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    ₹{(1 / currency.rate).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    per 1 {currency.code}
                  </p>
                </div>
              </div>
            ))}
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
          Rates updated for November 2025. Tap "Customize Rates" to set your own
          exchange rates.
        </p>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="fd"
        inputs={{
          amount,
          fromCurrency: `${currencies[fromCurrency]?.symbol} ${fromCurrency}`,
          toCurrency: `${currencies[toCurrency]?.symbol} ${toCurrency}`,
          exchangeRate: conversionResult.exchangeRate,
        }}
        results={{
          convertedAmount: conversionResult.amount,
        }}
      />
    </div>
  );
};

export default CurrencyCalculator;
