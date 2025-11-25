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

  // Helper function to parse number from comma-separated string
  const parseNumberFromString = (str: string): number => {
    // Remove commas and parse as number
    const numStr = str.replace(/,/g, '');
    return Number(numStr);
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatNumberWithCommas(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input while typing
    if (inputValue === '') {
      setDisplayValue('');
      return;
    }

    // Allow partial numbers while typing (including decimals for interest rates)
    // Check if it's a decimal number or whole number with commas
    if (/^\d*\.?\d*$/.test(inputValue.replace(/,/g, ''))) {
      setDisplayValue(inputValue);

      // Only update parent state if we have a valid number
      const numValue = parseNumberFromString(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If empty on blur, reset to min value
    if (inputValue === '') {
      setDisplayValue(formatNumberWithCommas(min));
      onChange(min);
    } else {
      const numValue = parseNumberFromString(inputValue);
      // Allow 0 and valid numbers, clamp to min/max range
      if (!isNaN(numValue) && numValue >= 0) {
        const clampedValue = Math.min(Math.max(numValue, min), max);
        setDisplayValue(formatNumberWithCommas(clampedValue));
        onChange(clampedValue);
      } else {
        setDisplayValue(formatNumberWithCommas(min));
        onChange(min);
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
