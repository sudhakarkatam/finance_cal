import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  RotateCcw,
  ArrowRightLeft,
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  Coins,
  Globe,
  Building2,
  Percent,
  Sparkles,
} from "lucide-react";
import CalculatorInput from "@/components/ui/CalculatorInput";
import SaveDialog from "@/components/SaveDialog";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Dictionary of world currencies with symbols and country flags
const ALL_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  AED: { code: "AED", name: "Emirati Dirham", symbol: "AED", flag: "🇦🇪" },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦" },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  KWD: { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", flag: "🇰🇼" },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  THB: { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  QAR: { code: "QAR", name: "Qatari Riyal", symbol: "QR", flag: "🇶🇦" },
  OMR: { code: "OMR", name: "Omani Rial", symbol: "OMR", flag: "🇴🇲" },
  BHD: { code: "BHD", name: "Bahraini Dinar", symbol: "BD", flag: "🇧🇭" },
  NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  VND: { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳" },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  RUB: { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
  EGP: { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬" },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
  LKR: { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰" },
  NPR: { code: "NPR", name: "Nepalese Rupee", symbol: "NRs", flag: "🇳🇵" },
  BDT: { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩" },
  PKR: { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", flag: "🇵🇰" },
  PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
};

// Fallback rates relative to 1 USD
const DEFAULT_USD_RATES: Record<string, number> = {
  USD: 1,
  INR: 88.67,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  CAD: 1.38,
  AUD: 1.52,
  SGD: 1.34,
  JPY: 154.5,
  KWD: 0.31,
  CHF: 0.88,
  CNY: 7.24,
  THB: 34.5,
  MYR: 4.42,
  QAR: 3.64,
  OMR: 0.385,
  BHD: 0.376,
  NZD: 1.68,
  HKD: 7.78,
  KRW: 1390.0,
  IDR: 15900.0,
  VND: 25400.0,
  ZAR: 18.2,
  BRL: 5.75,
  RUB: 98.5,
  MXN: 20.2,
  EGP: 49.5,
  TRY: 34.8,
  LKR: 292.0,
  NPR: 135.5,
  BDT: 119.5,
  PKR: 278.5,
  PHP: 58.8,
};

type PresetType = "bank" | "airport" | "wise" | "custom";

const CurrencyCalculator = () => {
  const { toast } = useToast();

  // Rates
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_USD_RATES);
  const [isFetching, setIsFetching] = useState(false);

  // Conversion Inputs
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [amount, setAmount] = useState<number>(1000);

  // Fee Calculator Block State
  const [includeFees, setIncludeFees] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetType>("bank");
  const [feePercentage, setFeePercentage] = useState<number>(2.0);
  const [fixedFee, setFixedFee] = useState<number>(5);

  // Dialog & Search States
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState<"from" | "to">("from");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Live Rates with offline detection & cache bypass
  const fetchLiveRates = async (showToast = false) => {
    setIsFetching(true);
    try {
      // 1. Check if device has active network connection
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new Error("Device is offline");
      }

      // 2. Fetch with cache bypass to prevent Service Worker returning stale 200 OK
      const response = await fetch("https://open.er-api.com/v6/latest/USD", {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("API network response error");

      const data = await response.json();
      if (data && data.rates) {
        const fetchedRates = { ...DEFAULT_USD_RATES, ...data.rates };
        setRates(fetchedRates);
        localStorage.setItem("currency_rates_cache", JSON.stringify(fetchedRates));

        if (showToast) {
          toast({
            title: "Rates Updated",
            description: "Fetched latest market exchange rates.",
          });
        }
      }
    } catch (error) {
      console.warn("Using cached exchange rates:", error);
      loadCachedRates();
      if (showToast) {
        toast({
          title: "Offline Mode",
          description: "Unable to reach live rates. Using saved offline rates.",
          variant: "destructive",
        });
      }
    } finally {
      setIsFetching(false);
    }
  };

  const loadCachedRates = () => {
    try {
      const cached = localStorage.getItem("currency_rates_cache");
      if (cached) {
        setRates({ ...DEFAULT_USD_RATES, ...JSON.parse(cached) });
      }
    } catch (e) {
      console.warn("Error loading cached rates:", e);
    }
  };

  useEffect(() => {
    loadCachedRates();
    fetchLiveRates(false);
  }, []);

  // Handle Preset Button Click
  const handlePresetSelect = (preset: PresetType) => {
    setActivePreset(preset);
    if (preset === "bank") {
      setFeePercentage(2.0);
      setFixedFee(5);
    } else if (preset === "airport") {
      setFeePercentage(4.5);
      setFixedFee(10);
    } else if (preset === "wise") {
      setFeePercentage(0.5);
      setFixedFee(1.5);
    }
  };

  // Math
  const conversionResult = useMemo(() => {
    const fromUsdRate = rates[fromCurrency] || 1;
    const toUsdRate = rates[toCurrency] || 1;

    // Direct mid-market exchange rate
    const midMarketRate = toUsdRate / fromUsdRate;

    // Gross converted (Mid-market)
    const grossAmount = amount * midMarketRate;

    // Fee calculations
    let totalFeeDeductionInFromCurrency = 0;
    let totalFeeDeductionInToCurrency = 0;

    if (includeFees) {
      const percentageDeduction = (amount * (feePercentage || 0)) / 100;
      totalFeeDeductionInFromCurrency = percentageDeduction + (fixedFee || 0);
      totalFeeDeductionInToCurrency = totalFeeDeductionInFromCurrency * midMarketRate;
    }

    const netAmount = Math.max(0, grossAmount - totalFeeDeductionInToCurrency);
    const effectiveExchangeRate = amount > 0 ? netAmount / amount : midMarketRate;

    return {
      midMarketRate,
      grossAmount,
      totalFeeDeductionInFromCurrency,
      totalFeeDeductionInToCurrency,
      netAmount,
      effectiveExchangeRate,
    };
  }, [amount, fromCurrency, toCurrency, rates, includeFees, feePercentage, fixedFee]);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleReset = () => {
    setFromCurrency("USD");
    setToCurrency("INR");
    setAmount(1000);
    setIncludeFees(false);
    setActivePreset("bank");
    setFeePercentage(2.0);
    setFixedFee(5);
  };

  // Filtered currency list for search modal
  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return Object.values(ALL_CURRENCIES).filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectCurrency = (code: string) => {
    if (searchTarget === "from") setFromCurrency(code);
    else setToCurrency(code);
    setCurrencySearchOpen(false);
    setSearchQuery("");
  };

  // Priority targets for Quick Comparison Grid
  const quickMatrixTargets = useMemo(() => {
    const defaultList = ["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "SGD", "JPY"];
    return defaultList.filter((code) => code !== fromCurrency).slice(0, 6);
  }, [fromCurrency]);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto pt-2">
      {/* Sleek Header */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Currency Converter
              </h2>
              <p className="text-xs text-muted-foreground">
                Live Mid-Market Exchange Rates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLiveRates(true)}
              disabled={isFetching}
              className="gap-1.5 text-xs h-8"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Converter Card */}
      <Card className="p-5 space-y-5 shadow-lg border-border">
        {/* From Currency Block */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            You Send
          </Label>

          <div className="flex items-center gap-2 p-1.5 rounded-xl border-2 border-border bg-card focus-within:border-primary/60 transition-all shadow-sm">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTarget("from");
                setCurrencySearchOpen(true);
              }}
              className="h-11 gap-2 px-3 hover:bg-muted font-bold text-sm rounded-lg shrink-0 border-r border-border rounded-r-none"
            >
              <span className="text-xl">{ALL_CURRENCIES[fromCurrency]?.flag}</span>
              <span className="text-foreground font-extrabold">{fromCurrency}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>

            <div className="flex-1 pr-2">
              <CalculatorInput
                label=""
                value={amount}
                onChange={setAmount}
                min={0.01}
                max={100000000}
                step={1}
                prefix={ALL_CURRENCIES[fromCurrency]?.symbol || "$"}
              />
            </div>
          </div>

          {/* Quick Amount Preset Chips */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-muted-foreground mr-1">
              Quick:
            </span>
            {[100, 500, 1000, 5000, 10000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  amount === val
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border/70 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                }`}
              >
                {ALL_CURRENCIES[fromCurrency]?.symbol}
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Swap Button Divider */}
        <div className="flex justify-center -my-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapCurrencies}
            className="gap-2 rounded-full px-4 h-9 shadow-md bg-card hover:bg-primary hover:text-primary-foreground border-2 border-border transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Swap</span>
          </Button>
        </div>

        {/* To Currency Block */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recipient Gets
          </Label>

          <div className="flex items-center gap-2 p-1.5 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTarget("to");
                setCurrencySearchOpen(true);
              }}
              className="h-11 gap-2 px-3 hover:bg-emerald-500/10 font-bold text-sm rounded-lg shrink-0 border-r border-emerald-500/20 rounded-r-none"
            >
              <span className="text-xl">{ALL_CURRENCIES[toCurrency]?.flag}</span>
              <span className="text-foreground font-extrabold">{toCurrency}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>

            <div className="flex-1 px-3 py-1 text-right">
              <span className="text-xs text-muted-foreground block font-medium">
                {includeFees ? "Net Payout" : "Total Value"}
              </span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {ALL_CURRENCIES[toCurrency]?.symbol}{" "}
                {(includeFees
                  ? conversionResult.netAmount
                  : conversionResult.grossAmount
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Mid-Market Exchange Rate Line */}
        <div className="bg-muted/40 p-2.5 rounded-lg border border-border/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Coins className="w-4 h-4 text-primary" />
            <span>
              1 {fromCurrency} = {conversionResult.midMarketRate.toFixed(4)}{" "}
              {toCurrency}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Mid-Market Rate</span>
        </div>

        {/* ------------------------------------------------------------------------ */}
        {/* 🏦 BANK & EXCHANGE FEES BLOCK (PRESET BUTTONS + EDITABLE INPUTS) */}
        {/* ------------------------------------------------------------------------ */}
        <div className="border border-border/80 rounded-xl p-4 space-y-4 bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <Label htmlFor="fee-switch" className="text-xs font-bold text-foreground cursor-pointer">
                Include Bank / Exchange Fees
              </Label>
            </div>

            <Switch
              id="fee-switch"
              checked={includeFees}
              onCheckedChange={setIncludeFees}
            />
          </div>

          {includeFees && (
            <div className="space-y-4 pt-3 border-t border-border/60">
              {/* 4 Interactive Fee Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "bank", label: "🏦 Bank Wire", sub: "2.0% + $5" },
                  { id: "airport", label: "✈️ Airport Forex", sub: "4.5% + $10" },
                  { id: "wise", label: "⚡ Online (Wise)", sub: "0.5% + $1.5" },
                  { id: "custom", label: "⚙️ Custom Fee", sub: "Edit Below" },
                ].map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={activePreset === preset.id ? "default" : "outline"}
                    onClick={() => handlePresetSelect(preset.id as PresetType)}
                    className="flex flex-col items-center justify-center h-14 p-1.5 text-center transition-all"
                  >
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span className="text-[10px] opacity-80 font-normal mt-0.5">
                      {preset.sub}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Editable Input Boxes for Markup % and Fixed Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">
                    Exchange Markup / FX Spread (%)
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={feePercentage}
                      onChange={(e) => {
                        setActivePreset("custom");
                        setFeePercentage(parseFloat(e.target.value) || 0);
                      }}
                      step={0.1}
                      min={0}
                      max={20}
                      className="pr-8 text-sm font-semibold"
                    />
                    <Percent className="w-3.5 h-3.5 absolute right-3 top-3 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">
                    Fixed Fee ({ALL_CURRENCIES[fromCurrency]?.symbol || "$"})
                  </Label>
                  <Input
                    type="number"
                    value={fixedFee}
                    onChange={(e) => {
                      setActivePreset("custom");
                      setFixedFee(parseFloat(e.target.value) || 0);
                    }}
                    step={1}
                    min={0}
                    className="text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Fee Breakdown Summary Box */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Mid-Market Amount:</span>
                  <span className="font-semibold text-foreground">
                    {ALL_CURRENCIES[toCurrency]?.symbol}{" "}
                    {conversionResult.grossAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                  <span>Total Fees & Spread Deduction:</span>
                  <span>
                    - {ALL_CURRENCIES[toCurrency]?.symbol}{" "}
                    {conversionResult.totalFeeDeductionInToCurrency.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    ({ALL_CURRENCIES[fromCurrency]?.symbol}{conversionResult.totalFeeDeductionInFromCurrency.toFixed(2)})
                  </span>
                </div>

                <div className="flex justify-between pt-1.5 border-t border-amber-500/30 font-bold text-sm text-foreground">
                  <span>Actual Net Payout Received:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {ALL_CURRENCIES[toCurrency]?.symbol}{" "}
                    {conversionResult.netAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          className="w-full gap-2 text-base font-semibold"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-4 h-4" />
          Save Calculation
        </Button>
      </Card>

      {/* ------------------------------------------------------------------------ */}
      {/* DYNAMIC MULTI-CURRENCY COMPARISON MATRIX */}
      {/* ------------------------------------------------------------------------ */}
      <Card className="p-5 space-y-3 bg-card shadow-md border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Equivalent of {ALL_CURRENCIES[fromCurrency]?.symbol}
            {amount.toLocaleString()} {fromCurrency} in Top Currencies
          </h3>
          <p className="text-xs text-muted-foreground">
            Tap any currency to quickly convert
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {quickMatrixTargets.map((targetCode) => {
            const targetInfo = ALL_CURRENCIES[targetCode] || {
              symbol: targetCode,
              name: targetCode,
              flag: "🌐",
            };
            const fromUsd = rates[fromCurrency] || 1;
            const toUsd = rates[targetCode] || 1;
            const rate = toUsd / fromUsd;
            const convertedVal = amount * rate;

            return (
              <div
                key={targetCode}
                onClick={() => setToCurrency(targetCode)}
                className="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{targetInfo.flag}</span>
                    <span className="text-xs font-semibold text-foreground">
                      {targetInfo.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                    {targetCode}
                  </span>
                </div>

                <p className="text-base font-bold text-foreground truncate">
                  {targetInfo.symbol}{" "}
                  {convertedVal.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>

                <p className="text-[11px] text-muted-foreground">
                  1 {fromCurrency} = {rate.toFixed(4)} {targetCode}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ------------------------------------------------------------------------ */}
      {/* 🔍 SEARCH CURRENCY MODAL DIALOG */}
      {/* ------------------------------------------------------------------------ */}
      <Dialog open={currencySearchOpen} onOpenChange={setCurrencySearchOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-4">
          <DialogHeader className="pb-2">
            <DialogTitle>
              Select {searchTarget === "from" ? "Source" : "Target"} Currency
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by currency name or code (e.g. AED, Euro, USD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
              autoFocus
            />
          </div>

          {/* Currency List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[50vh]">
            {filteredCurrencies.map((c) => {
              const isSelected =
                (searchTarget === "from" && fromCurrency === c.code) ||
                (searchTarget === "to" && toCurrency === c.code);

              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => selectCurrency(c.code)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{c.code}</span>
                        <span className="text-xs opacity-80">({c.symbol})</span>
                      </div>
                      <p className="text-xs opacity-75">{c.name}</p>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}

            {filteredCurrencies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No currency matching "{searchQuery}" found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="fd"
        inputs={{
          amount,
          fromCurrency: `${ALL_CURRENCIES[fromCurrency]?.symbol || ""} ${fromCurrency}`,
          toCurrency: `${ALL_CURRENCIES[toCurrency]?.symbol || ""} ${toCurrency}`,
          midMarketRate: conversionResult.midMarketRate,
        }}
        results={{
          netAmountReceived: conversionResult.netAmount,
        }}
      />
    </div>
  );
};

export default CurrencyCalculator;
