import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface CalculatorInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

const CalculatorInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix = '',
  suffix = '',
  placeholder,
}: CalculatorInputProps) => {
  const [displayValue, setDisplayValue] = useState(value.toString());

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input while typing
    if (inputValue === '') {
      setDisplayValue('');
      return;
    }

    // Allow partial numbers while typing (including decimals for interest rates)
    if (/^\d*\.?\d*$/.test(inputValue)) {
      setDisplayValue(inputValue);

      // Only update parent state if we have a valid number
      const numValue = Number(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If empty on blur, reset to min value
    if (inputValue === '') {
      setDisplayValue(min.toString());
      onChange(min);
    } else {
      const numValue = Number(inputValue);
      // Allow 0 and valid numbers, clamp to min/max range
      if (!isNaN(numValue) && numValue >= 0) {
        const clampedValue = Math.min(Math.max(numValue, min), max);
        setDisplayValue(clampedValue.toString());
        onChange(clampedValue);
      } else {
        setDisplayValue(min.toString());
        onChange(min);
      }
    }
  };


  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
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
