import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Calculator, ArrowRightLeft, Settings } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate per 1 INR
}

// Default currency configuration (defined outside component for access in reset function)
const createDefaultCurrencies = (): Record<string, Currency> => ({
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 1 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.01127 },  // October 2025[web:20]
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.009684 },      // October 2025[web:12]
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.00842349 },  // October 2025[web:1]
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 1.7192 }, // October 2025[web:29][web:24]
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', rate: 0.0037 },  // October 2025[web:30]
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 0.01625 }, // October 2025[web:31]
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 0.01819 }, // October 2025[web:28]
});


const CurrencyCalculator = () => {
  // Currency configuration with default offline rates (users can modify)
  const [currencies, setCurrencies] = useState<Record<string, Currency>>(createDefaultCurrencies());

  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState(1000);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [ratesDialogOpen, setRatesDialogOpen] = useState(false);
  const [selectedCurrencyForRate, setSelectedCurrencyForRate] = useState('');

  // Save rates to localStorage
  const saveRatesToStorage = (rates: Record<string, Currency>) => {
    try {
      localStorage.setItem('currencyCalculator_rates', JSON.stringify(rates));
    } catch (error) {
      console.warn('Failed to save currency rates:', error);
    }
  };

  // Load rates from localStorage
  const loadRatesFromStorage = (): Record<string, Currency> => {
    try {
      const saved = localStorage.getItem('currencyCalculator_rates');
      if (saved) {
        const parsedRates = JSON.parse(saved);
        // Merge with defaults to ensure all currencies exist
        return { ...createDefaultCurrencies(), ...parsedRates };
      }
    } catch (error) {
      console.warn('Failed to load saved currency rates:', error);
    }
    return createDefaultCurrencies();
  };

  // Load saved rates on component mount
  useEffect(() => {
    const savedRates = loadRatesFromStorage();
    setCurrencies(savedRates);
  }, []);

  // Update exchange rate for a specific currency
  // newRate represents how much 1 unit of foreign currency is worth in INR
  // We need to convert this to: 1 INR = X units of foreign currency
  const updateExchangeRate = (currencyCode: string, newRate: number) => {
    if (currencyCode === 'INR') return; // Don't update INR itself

    // If user enters 88 for USD, it means 1 USD = 88 INR
    // So 1 INR = 1/88 USD = 0.01136 USD
    const convertedRate = 1 / newRate;

    setCurrencies(prev => {
      const updated = {
        ...prev,
        [currencyCode]: { ...prev[currencyCode], rate: convertedRate }
      };
      // Save to localStorage whenever rates are updated
      saveRatesToStorage(updated);
      return updated;
    });
  };

  // Calculate conversion
  const conversionResult = useMemo(() => {
    const fromRate = currencies[fromCurrency]?.rate || 1;
    const toRate = currencies[toCurrency]?.rate || 1;

    // Convert: amount in fromCurrency → INR → toCurrency
    const amountInINR = fromCurrency === 'INR' ? amount : amount / fromRate;
    const convertedAmount = toCurrency === 'INR' ? amountInINR : amountInINR * toRate;

    return {
      amount: Math.round(convertedAmount * 100) / 100,
      fromRate,
      toRate,
      exchangeRate: toRate / fromRate
    };
  }, [amount, fromCurrency, toCurrency, currencies]);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleReset = () => {
    setFromCurrency('INR');
    setToCurrency('USD');
    setAmount(1000);
    // Reset to default rates and clear localStorage
    setCurrencies(createDefaultCurrencies());
    try {
      localStorage.removeItem('currencyCalculator_rates');
    } catch (error) {
      console.warn('Failed to clear saved currency rates:', error);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Currency Calculator</h2>
              <p className="text-xs text-muted-foreground">Convert between currencies with custom rates</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Rates
          </Button>
        </div>

        {/* Main Conversion Section */}
        <div className="space-y-4">
          {/* From Currency */}
          <div className="space-y-2">
            <Label>From Currency</Label>
            <div className="flex gap-2">
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(currencies).map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
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
              size="sm"
              onClick={handleSwapCurrencies}
              className="gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Swap
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label>To Currency</Label>
            <div className="flex gap-2">
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(currencies).map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 p-2 bg-muted rounded-md border flex items-center">
                <span className="text-lg font-semibold text-primary">
                  {currencies[toCurrency]?.symbol} {conversionResult.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Exchange Rate Display */}
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              1 {currencies[fromCurrency]?.code} = {conversionResult.exchangeRate.toFixed(4)} {currencies[toCurrency]?.code}
              {fromCurrency !== 'INR' && toCurrency === 'INR' && (
                <span className="block text-xs mt-1">
                  (₹{currencies[fromCurrency]?.rate ? (1 / currencies[fromCurrency].rate).toFixed(2) : '0.00'} INR)
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Set Values Block */}
      <Card className="p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Set Exchange Rates</h3>
          <Dialog open={ratesDialogOpen} onOpenChange={setRatesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Set Values
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Set Exchange Rate (Per 1 INR)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency-select">Select Currency</Label>
                  <Select value={selectedCurrencyForRate} onValueChange={setSelectedCurrencyForRate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a currency to set rate for" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(currencies).filter(c => c.code !== 'INR').map((currency) => (
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
                      How much is 1 {currencies[selectedCurrencyForRate]?.code} worth in INR?
                    </Label>
                    <CalculatorInput
                      label=""
                      value={currencies[selectedCurrencyForRate]?.rate ? Math.round((1 / currencies[selectedCurrencyForRate].rate) * 100) / 100 : 0}
                      onChange={(value) => {
                        if (typeof value === 'number' && !isNaN(value) && value > 0) {
                          updateExchangeRate(selectedCurrencyForRate, value);
                        }
                      }}
                      min={0.01}
                      max={10000}
                      step={0.01}
                      placeholder="Enter value in INR"
                    />
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Enter how much 1 unit of the selected currency is worth in INR. For example, if 1 USD = ₹88, enter 88. These rates will remain fixed until you update them or reset all values.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCurrencyForRate('')}
                    className="flex-1"
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={() => setRatesDialogOpen(false)}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Rates Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(currencies).filter(c => c.code !== 'INR').map((currency) => {
            // Show rate as: 1 foreign currency = X INR
            const inrValue = Math.round((1 / currency.rate) * 100) / 100;
            return (
              <div key={currency.code} className="bg-muted/30 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{currency.symbol}</span>
                    <span className="font-medium text-sm">{currency.code}</span>
                  </div>
                  <span className="text-sm font-mono bg-background px-2 py-1 rounded">
                    ₹{inrValue}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  1 {currency.code} = ₹{inrValue} INR
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded-lg">
          <p className="text-xs text-green-800 dark:text-green-200">
            <strong>Set Rates:</strong> Use the "Set Values" button above to configure exchange rates. Once set, rates remain fixed for consistent calculations.
          </p>
        </div>

        <Button
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="w-5 h-5" />
          Save Calculation
        </Button>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="fd"
        inputs={{
          fromCurrency,
          toCurrency,
          amount,
          exchangeRate: conversionResult.exchangeRate
        }}
        results={{
          convertedAmount: conversionResult.amount,
          fromRate: conversionResult.fromRate,
          toRate: conversionResult.toRate
        }}
      />
    </div>
  );
};

export default CurrencyCalculator;