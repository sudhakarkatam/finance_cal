import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeInputProps {
  label: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  manualYears: number;
  manualMonths: number;
  manualDays: number;
  onManualYearsChange: (value: number) => void;
  onManualMonthsChange: (value: number) => void;
  onManualDaysChange: (value: number) => void;
}

const DateRangeInput = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  manualYears,
  manualMonths,
  manualDays,
  onManualYearsChange,
  onManualMonthsChange,
  onManualDaysChange,
}: DateRangeInputProps) => {
  const [inputMode, setInputMode] = useState<'manual' | 'date'>('manual');

  const getTotalDays = () => {
    if (inputMode === 'date' && startDate && endDate) {
      return Math.max(0, differenceInDays(endDate, startDate));
    }
    return (manualYears * 365) + (manualMonths * 30) + manualDays;
  };

  const getTimeInYears = () => {
    return getTotalDays() / 365;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'manual' | 'date')} className="w-auto">
          <TabsList className="h-7 p-0.5">
            <TabsTrigger value="manual" className="text-xs h-6 px-3">Manual</TabsTrigger>
            <TabsTrigger value="date" className="text-xs h-6 px-3">Date Range</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {inputMode === 'date' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM yyyy") : <span>Start</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={onStartDateChange}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd MMM yyyy") : <span>End</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          {startDate && endDate && (
            <div className="bg-secondary/50 p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-bold text-primary">
                {getTotalDays()} days ({getTimeInYears().toFixed(2)} years)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Years</Label>
            <Input
              type="number"
              value={manualYears}
              onChange={(e) => onManualYearsChange(Number(e.target.value))}
              min={0}
              max={50}
              className="h-10 text-center font-semibold"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Months</Label>
            <Input
              type="number"
              value={manualMonths}
              onChange={(e) => onManualMonthsChange(Number(e.target.value))}
              min={0}
              max={11}
              className="h-10 text-center font-semibold"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Days</Label>
            <Input
              type="number"
              value={manualDays}
              onChange={(e) => onManualDaysChange(Number(e.target.value))}
              min={0}
              max={364}
              className="h-10 text-center font-semibold"
            />
          </div>
        </div>
      )}
      
      <div className="bg-accent/10 p-2 rounded text-center">
        <p className="text-xs text-muted-foreground">Total: <span className="font-bold text-foreground">{getTimeInYears().toFixed(2)} years</span></p>
      </div>
    </div>
  );
};

export default DateRangeInput;
