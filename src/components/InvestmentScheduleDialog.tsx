import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Eye, EyeOff, TrendingUp } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export interface ScheduleRow {
  period: string; // e.g., "Year 1" or "Month 12"
  invested: number;
  interest: number;
  total: number;
}

interface InvestmentScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  schedule: ScheduleRow[];
}

export const InvestmentScheduleDialog = ({
  open,
  onOpenChange,
  title,
  schedule,
}: InvestmentScheduleDialogProps) => {
  const { formatAmount: formatCurrency } = useCurrency();
  const [showAllRows, setShowAllRows] = useState(false);

  const displayedSchedule = useMemo(() => {
    if (showAllRows || schedule.length <= 15) {
      return schedule;
    }
    return schedule.slice(0, 15);
  }, [schedule, showAllRows]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-4">
        <DialogHeader className="pb-2 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
            <Calendar className="w-5 h-5 text-primary" />
            {title} ({schedule.length} Periods)
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Table View */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/60 sticky top-0 z-10 backdrop-blur-xs">
              <TableRow>
                <TableHead className="w-[100px] text-xs font-bold">Period</TableHead>
                <TableHead className="text-right text-xs font-bold">Total Invested</TableHead>
                <TableHead className="text-right text-xs font-bold">Interest Earned</TableHead>
                <TableHead className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Total Balance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSchedule.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-semibold text-xs py-2.5">{row.period}</TableCell>
                  <TableCell className="text-right text-xs font-medium py-2.5">
                    {formatCurrency(row.invested)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-medium text-amber-600 dark:text-amber-400 py-2.5">
                    +{formatCurrency(row.interest)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 py-2.5">
                    {formatCurrency(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Toggle Show All / Truncated */}
        {schedule.length > 15 && (
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {displayedSchedule.length} of {schedule.length} rows
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllRows(!showAllRows)}
              className="gap-2 text-xs h-8"
            >
              {showAllRows ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Show First 15
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Show Full Schedule ({schedule.length})
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentScheduleDialog;
