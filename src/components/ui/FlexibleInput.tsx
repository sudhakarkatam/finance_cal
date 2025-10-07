import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface FlexibleInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  allowDatePicker?: boolean;
  allowTimePeriodInput?: boolean;
  timePeriodMode?: 'years' | 'months' | 'days';
  onTimePeriodModeChange?: (mode: 'years' | 'months' | 'days') => void;
}

const FlexibleInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix = '',
  suffix = '',
  allowDatePicker = false,
  allowTimePeriodInput = false,
  timePeriodMode = 'years',
  onTimePeriodModeChange,
}: FlexibleInputProps) => {
  const [date, setDate] = useState<Date>();
  const [inputMode, setInputMode] = useState<'slider' | 'date'>('slider');

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const today = new Date();
      const days = differenceInDays(selectedDate, today);
      const years = days / 365;
      onChange(Math.max(min, Math.min(max, Math.round(years * 10) / 10)));
    }
  };

  const convertValue = (val: number, fromMode: string, toMode: string) => {
    if (fromMode === toMode) return val;
    
    // Convert to days first
    let days = val;
    if (fromMode === 'years') days = val * 365;
    if (fromMode === 'months') days = val * 30;
    
    // Convert from days to target
    if (toMode === 'years') return days / 365;
    if (toMode === 'months') return days / 30;
    return days;
  };

  const handleModeChange = (newMode: 'years' | 'months' | 'days') => {
    if (onTimePeriodModeChange) {
      const convertedValue = convertValue(value, timePeriodMode, newMode);
      onChange(Math.round(convertedValue * 10) / 10);
      onTimePeriodModeChange(newMode);
    }
  };

  const getStepForMode = () => {
    if (!allowTimePeriodInput) return step;
    if (timePeriodMode === 'days') return 1;
    if (timePeriodMode === 'months') return 1;
    return 0.1;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {allowDatePicker && (
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'slider' | 'date')} className="w-auto">
            <TabsList className="h-7 p-0.5">
              <TabsTrigger value="slider" className="text-xs h-6 px-2">Slider</TabsTrigger>
              <TabsTrigger value="date" className="text-xs h-6 px-2">Date</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {inputMode === 'date' && allowDatePicker ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick end date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => date < new Date()}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-md flex-1">
              {prefix && <span className="text-sm text-primary font-medium">{prefix}</span>}
              <Input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={getStepForMode()}
                className="flex-1 h-7 text-right border-0 bg-transparent p-0 text-sm font-semibold text-primary focus-visible:ring-0"
              />
              {suffix && <span className="text-sm text-primary font-medium">{suffix}</span>}
            </div>
            
            {allowTimePeriodInput && (
              <Tabs value={timePeriodMode} onValueChange={(v) => handleModeChange(v as any)} className="w-auto">
                <TabsList className="h-9 p-0.5">
                  <TabsTrigger value="years" className="text-xs h-8 px-2">Yrs</TabsTrigger>
                  <TabsTrigger value="months" className="text-xs h-8 px-2">Mos</TabsTrigger>
                  <TabsTrigger value="days" className="text-xs h-8 px-2">Days</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
          
          <Slider
            value={[value]}
            onValueChange={(values) => onChange(values[0])}
            min={min}
            max={max}
            step={getStepForMode()}
            className="w-full"
          />
        </>
      )}
    </div>
  );
};

export default FlexibleInput;
