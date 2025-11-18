import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [inputMode, setInputMode] = useState<'manual' | 'date'>('date');
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);
  const [datePickerStep, setDatePickerStep] = useState<'year' | 'month' | 'date'>('year');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [startDatePickerStep, setStartDatePickerStep] = useState<'year' | 'month' | 'date'>('year');
  const [startSelectedYear, setStartSelectedYear] = useState<number>(2025);
  const [startSelectedMonth, setStartSelectedMonth] = useState<number>(new Date().getMonth());
  const [calendarYearMode, setCalendarYearMode] = useState<'start' | 'end' | null>(null);

  // Initialize with current year context when entering year selection mode
  const handleStartYearClick = () => {
    // If startDate exists, use its year, otherwise default to 2025
    const currentYear = startDate ? startDate.getFullYear() : 2025;
    setStartSelectedYear(currentYear);
    setStartSelectedMonth(startDate ? startDate.getMonth() : new Date().getMonth());
    setCalendarYearMode('start');
  };

  const handleEndYearClick = () => {
    // If endDate exists, use its year, otherwise default to 2025
    const currentYear = endDate ? endDate.getFullYear() : 2025;
    setSelectedYear(currentYear);
    setSelectedMonth(endDate ? endDate.getMonth() : new Date().getMonth());
    setCalendarYearMode('end');
  };

  // Generate year options (1975 to 2075, 101 years total)
  const yearOptions = Array.from({ length: 101 }, (_, i) => 1975 + i);

  // Generate month options
  const monthOptions = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  // Generate day options for selected month and year
  const getDayOptions = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Sync temp end date with actual end date
  useEffect(() => {
    setTempEndDate(endDate);
  }, [endDate]);

  // Reset internal state when dates are cleared (reset button pressed)
  useEffect(() => {
    if (!startDate && !endDate) {
      setCalendarYearMode(null);
      setStartSelectedYear(2025);
      setStartSelectedMonth(new Date().getMonth());
      setSelectedYear(2025);
      setSelectedMonth(new Date().getMonth());
    }
  }, [startDate, endDate]);

  const getTotalDays = () => {
    if (inputMode === 'date' && startDate && tempEndDate) {
      return Math.max(0, differenceInDays(tempEndDate, startDate));
    }
    // For manual input, calculate days precisely
    // Use actual average days per year and month for accurate conversion
    return (manualYears * 365) + (manualMonths * 30) + manualDays;
  };

  const dateRangeToYMD = (start: Date, end: Date) => {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    
    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastDayOfPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastDayOfPrevMonth.getDate();
    }
    
    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months, days };
  };

  const getTimeInYears = () => {
    if (inputMode === 'date' && startDate && tempEndDate) {
      // For date-based input, use actual days
      return getTotalDays() / 365;
    }
    // For manual input, use direct conversion method
    // Formula: years + months/12 + days/365
    return manualYears + (manualMonths / 12) + (manualDays / 365);
  };

  const getFormattedDuration = () => {
    if (inputMode === 'date' && startDate && tempEndDate) {
      const { years, months, days } = dateRangeToYMD(startDate, tempEndDate);
      const parts = [];
      if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
      if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
      if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
      return parts.length > 0 ? parts.join(' ') : '0 days';
    }
    // For manual input, show the entered values
    const parts = [];
    if (manualYears > 0) parts.push(`${manualYears} ${manualYears === 1 ? 'year' : 'years'}`);
    if (manualMonths > 0) parts.push(`${manualMonths} ${manualMonths === 1 ? 'month' : 'months'}`);
    if (manualDays > 0) parts.push(`${manualDays} ${manualDays === 1 ? 'day' : 'days'}`);
    return parts.length > 0 ? parts.join(' ') : '0 days';
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setTempEndDate(date);
    onEndDateChange(date);
  };

  const handleYearSelect = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    setCalendarYearMode(null); // Go back to calendar view so user can select month/date
  };

  const handleMonthSelect = (month: string) => {
    const monthNum = parseInt(month);
    setSelectedMonth(monthNum);
    setDatePickerStep('date');
  };

  const handleDaySelect = (day: string) => {
    const dayNum = parseInt(day);
    const newDate = new Date(selectedYear, selectedMonth, dayNum);
    handleEndDateSelect(newDate);
    setCalendarYearMode(null); // Go back to calendar view
    setDatePickerStep('year'); // Reset for next time
    setSelectedYear(2025); // Reset to default
    setSelectedMonth(new Date().getMonth()); // Reset month
  };

  const handleStartYearSelect = (year: string) => {
    const yearNum = parseInt(year);
    setStartSelectedYear(yearNum);
    setCalendarYearMode(null); // Go back to calendar view so user can select month/date
  };

  const handleStartMonthSelect = (month: string) => {
    const monthNum = parseInt(month);
    setStartSelectedMonth(monthNum);
    setStartDatePickerStep('date');
  };

  const handleStartDaySelect = (day: string) => {
    const dayNum = parseInt(day);
    const newDate = new Date(startSelectedYear, startSelectedMonth, dayNum);
    onStartDateChange(newDate);
    setCalendarYearMode(null); // Go back to calendar view
    setStartDatePickerStep('year'); // Reset for next time
    setStartSelectedYear(2025); // Reset to default
    setStartSelectedMonth(new Date().getMonth()); // Reset month
  };

  const resetDatePicker = () => {
    setDatePickerStep('year');
    setSelectedYear(2025);
    setSelectedMonth(new Date().getMonth());
    setStartDatePickerStep('year');
    setStartSelectedYear(2025);
    setStartSelectedMonth(new Date().getMonth());
    setCalendarYearMode(null); // Reset to calendar view
    setTempEndDate(undefined);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const currentIndex = yearOptions.indexOf(selectedYear);
    if (direction === 'next' && currentIndex < yearOptions.length - 1) {
      setSelectedYear(yearOptions[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedYear(yearOptions[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex === yearOptions.length - 1) {
      // Stay at current year if at end
      setSelectedYear(selectedYear);
    } else if (direction === 'prev' && currentIndex === 0) {
      // Stay at current year if at beginning
      setSelectedYear(selectedYear);
    }
  };

  const navigateStartYear = (direction: 'prev' | 'next') => {
    const currentIndex = yearOptions.indexOf(startSelectedYear);
    if (direction === 'next' && currentIndex < yearOptions.length - 1) {
      setStartSelectedYear(yearOptions[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setStartSelectedYear(yearOptions[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex === yearOptions.length - 1) {
      // Stay at current year if at end
      setStartSelectedYear(startSelectedYear);
    } else if (direction === 'prev' && currentIndex === 0) {
      // Stay at current year if at beginning
      setStartSelectedYear(startSelectedYear);
    }
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
          {/* Start Date - Guided Selection */}
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
                {calendarYearMode === 'start' ? (
                  <div className="p-4 space-y-4 min-w-64">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Select Year</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateStartYear('prev')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <Button
                            variant="ghost"
                            className="font-semibold text-lg h-auto py-2 cursor-pointer"
                            onClick={() => setCalendarYearMode(null)}
                          >
                            {startSelectedYear}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateStartYear('next')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Select value={startSelectedYear.toString()} onValueChange={handleStartYearSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder={`${startSelectedYear}`} />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      onStartDateChange(date);
                      if (date) {
                        setStartSelectedYear(date.getFullYear());
                        setStartSelectedMonth(date.getMonth());
                      }
                    }}
                    onYearClick={handleStartYearClick}
                    displayYear={startSelectedYear}
                    initialFocus
                    className="pointer-events-auto"
                  />
                )}
              </PopoverContent>
            </Popover>

            {/* End Date - Guided Selection */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !tempEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempEndDate ? format(tempEndDate, "dd MMM yyyy") : <span>End</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {calendarYearMode === 'end' ? (
                  <div className="p-4 space-y-4 min-w-64">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Select Year</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateYear('prev')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <Button
                            variant="ghost"
                            className="font-semibold text-lg h-auto py-2 cursor-pointer"
                            onClick={() => setCalendarYearMode(null)}
                          >
                            {selectedYear}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateYear('next')}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Select value={selectedYear.toString()} onValueChange={handleYearSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder={`${selectedYear}`} />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <Calendar
                    mode="single"
                    selected={tempEndDate}
                    onSelect={(date) => {
                      handleEndDateSelect(date);
                      if (date) {
                        setSelectedYear(date.getFullYear());
                        setSelectedMonth(date.getMonth());
                      }
                    }}
                    onYearClick={handleEndYearClick}
                    displayYear={selectedYear}
                    initialFocus
                    className="pointer-events-auto"
                  />
                )}
              </PopoverContent>
            </Popover>
          </div>

          {startDate && tempEndDate && (
            <div className="bg-secondary/50 p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-bold text-primary">
                {getTotalDays()} days ({getTimeInYears().toFixed(2)} years)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Years</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={manualYears}
                onChange={(e) => onManualYearsChange(Number(e.target.value) || 0)}
                className="h-10"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Months</Label>
              <Input
                type="number"
                min="0"
                max="11"
                value={manualMonths}
                onChange={(e) => onManualMonthsChange(Number(e.target.value) || 0)}
                className="h-10"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Days</Label>
              <Input
                type="number"
                min="0"
                max="364"
                value={manualDays}
                onChange={(e) => onManualDaysChange(Number(e.target.value) || 0)}
                className="h-10"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-accent/10 p-2 rounded text-center">
        <p className="text-xs text-muted-foreground">Total: <span className="font-bold text-foreground">{getFormattedDuration()}</span></p>
      </div>
    </div>
  );
};

export default DateRangeInput;
