import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalculatorInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  tooltip?: string;
}

const CalculatorInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000000000,
  step = 1,
  prefix = '',
  suffix = '',
  placeholder,
  tooltip,
}: CalculatorInputProps) => {
  const { locale } = useCurrency();
  const [displayValue, setDisplayValue] = useState(value.toString());

  // Helper function to format number with commas
  const formatNumberWithCommas = (num: number): string => {
    // Don't format decimal numbers (like interest rates)
    if (num % 1 !== 0) {
      return num.toString();
    }
    return new Intl.NumberFormat(locale).format(num);
  };

  // Helper function to parse number from formatted string
  const parseNumberFromString = (str: string): number => {
    if (!str) return 0;

    // Check if locale uses comma as decimal separator (differs from standard JS Number parsing)
    // A simple heuristic: if formatted 1.1 comes out as "1,1", then comma is decimal.
    const isCommaDecimal = new Intl.NumberFormat(locale).format(1.1).includes(',');

    let cleanStr = str;
    if (isCommaDecimal) {
      // Remove thousands separator (dots) and replace decimal comma with dot
      cleanStr = str.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // Remove thousands separator (commas)
      cleanStr = str.replace(/,/g, '');
    }

    return Number(cleanStr);
  };

  // Update display value when prop value changes, but avoid overriding user input while typing
  // if the parsed values match.
  useEffect(() => {
    const currentParsed = parseNumberFromString(displayValue);
    // If the prop value matches what we currently have (parsed), don't reformat yet. 
    // This allows typing "1000" without it instantly becoming "1,000" until blur or significant change.
    // However, if the prop value is completely different (external update), we MUST update.

    // Exact equality check might fail for floats, so use small epsilon or just loose check?
    // Actually, simply checking if (value === currentParsed) is enough for most cases.
    if (value !== currentParsed) {
      setDisplayValue(formatNumberWithCommas(value));
    }
  }, [value, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input while typing, pass 0 to parent so live calculations update
    if (inputValue === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Determine allowed characters based on locale
    const isCommaDecimal = new Intl.NumberFormat(locale).format(1.1).includes(',');
    const validRegex = isCommaDecimal
      ? /^[\d.]*(,[\d]*)?$/  // Euro style: allows digits, dots (thousands) and one comma
      : /^[\d,]*(\.[\d]*)?$/; // US/IN style: allows digits, commas (thousands) and one dot

    // However, for typing convenience, we usually just want to validate that it COULD be a number
    // Simplest approach for "controlled" input that doesn't fight the user:
    // Just allow digits, dots, and commas during typing, but validate the parsed number.

    // Let's rely on the parsing logic to check validity.
    // But we need to prevent invalid multiple separators

    // Simple check:
    if (isCommaDecimal) {
      // Can't have more than one comma
      if ((inputValue.match(/,/g) || []).length > 1) return;
      // Allowed chars: digits, dot, comma
      if (!/^[\d.,]*$/.test(inputValue)) return;
    } else {
      // Can't have more than one dot
      if ((inputValue.match(/\./g) || []).length > 1) return;
      // Allowed chars: digits, dot, comma
      if (!/^[\d.,]*$/.test(inputValue)) return;
    }

    setDisplayValue(inputValue);

    // Only update parent state if we have a valid number
    const numValue = parseNumberFromString(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      // Debounce or just update? Updating immediately can cause re-formatting if parent passes back value.
      // The parent usually passes back 'value'. If we call onChange, parent updates 'value', which triggers useEffect -> setDisplayValue(formatted).
      // This 'round trip' reformats the user's input while they are typing, which is annoying (cursor jumps, partially typed stuff changes).

      // Fix: Don't update parent if the parsed value is the same as current prop value?
      // Or better: The useEffect [value] dependency causes the reformat.
      // We should ONLY reformatted if the *prop* value changes externally, OR on Blur.
      // But if we don't update parent, the calculation results won't update live.

      // Compromise: Update parent always, BUT check in useEffect if we need to update displayValue.
      // If the 'value' prop matches the parsed current 'displayValue', don't overwrite 'displayValue'.

      onChange(numValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If empty on blur, set to 0 (or min if min is specified and > 0, but allow 0 for optional inputs)
    if (inputValue === '') {
      const fallbackVal = min <= 0 ? 0 : 0;
      setDisplayValue(formatNumberWithCommas(fallbackVal));
      onChange(fallbackVal);
    } else {
      const numValue = parseNumberFromString(inputValue);
      // Allow 0 and valid numbers
      if (!isNaN(numValue) && numValue >= 0) {
        const clampedValue = Math.min(Math.max(numValue, Math.min(0, min)), max);
        setDisplayValue(formatNumberWithCommas(clampedValue));
        onChange(clampedValue);
      } else {
        setDisplayValue('0');
        onChange(0);
      }
    }
  };


  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        <div className="flex items-center gap-1 bg-secondary px-3 py-2 rounded-md border">
          {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
          <Input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
      </div>
    </div>
  );
};

export default CalculatorInput;
