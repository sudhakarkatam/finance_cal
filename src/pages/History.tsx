import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, ChevronDown, ChevronUp, Clock, FileText } from 'lucide-react';
import { getHistory, deleteCalculation, CalculationHistory } from '@/lib/storage';
import { format } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const History = () => {
  const { formatAmount } = useCurrency();
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking delete
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteCalculation(deleteId);
      loadHistory();
      setDeleteId(null);
      toast.success('Calculation deleted');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCalculatorName = (type: string) => {
    const names: Record<string, string> = {
      // Existing
      simple: 'Simple Interest',
      compound: 'Compound Interest',
      sip: 'SIP',
      mutualfund: 'Mutual Fund',
      swp: 'SWP',
      emi: 'EMI Calculator',
      loancompare: 'Loan Comparison',
      homeloan: 'Home Loan',
      lumpsum: 'Lumpsum',
      ppf: 'PPF',
      fd: 'Fixed Deposit',
      rd: 'Recurring Deposit',
      goalplanning: 'Goal Planning',
      retirement: 'Retirement Planner',
      education: 'Education Planner',
      hra: 'HRA Calculator',
      ssy: 'SSY Calculator',
      incometax: 'Income Tax',
      germantax: 'German Tax',
      inflation: 'Inflation',
      gst: 'GST Calculator',
      percentage: 'Percentage',
      nps: 'NPS Calculator',
      'rent-vs-buy': 'Rent vs Buy',
      'global-tax': 'Global Tax',
      epf: 'EPF Calculator',

      // New
      'time-cost': 'Time-Cost Calculator',
      'trip-cost': 'Trip Cost Calculator',
    };
    return names[type] || type;
  };

  const formatValue = (key: string, value: any) => {
    if (typeof value !== 'number') return value;

    const k = key.toLowerCase();

    // Currency
    if (['amount', 'price', 'cost', 'salary', 'income', 'expense', 'value', 'total', 'profit', 'interest', 'tax', 'returns', 'invested', 'maturity', 'toll', 'food'].some(term => k.includes(term))) {
      return formatAmount(value);
    }

    // Percentage
    if (['rate', 'inflation', 'percentage', 'tax'].some(term => k.includes(term)) && value < 100) {
      return `${value}%`;
    }

    // Time
    if (['years', 'period', 'tenure'].some(term => k.includes(term))) {
      return `${value} Years`;
    }

    if (k.includes('months')) {
      return `${value} Months`;
    }

    // Distance/Fuel
    if (k.includes('distance')) return `${value} km`;
    if (k.includes('mileage')) return `${value} km/l`;

    return value.toLocaleString();
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">No History</h3>
        <p className="text-muted-foreground max-w-sm">
          Your saved calculations will appear here. Save a calculation to see it later!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          {history.length} Saved
        </span>
      </div>

      <div className="space-y-4">
        {history.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <Card
              key={item.id}
              onClick={() => toggleExpand(item.id)}
              className={`cursor-pointer transition-all duration-300 border-l-4 hover:shadow-md ${isExpanded ? 'border-l-primary ring-1 ring-primary/10' : 'border-l-muted hover:border-l-primary/50'
                }`}
            >
              <div className="p-4">
                {/* Header Row */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{getCalculatorName(item.type)}</span>
                      {item.note && <FileText className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.date), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(item.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Note Preview (if collapsed) */}
                {!isExpanded && item.note && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-1 border-l-2 pl-2 italic">
                    {item.note}
                  </p>
                )}

                {/* Expanded Content */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t' : 'grid-rows-[0fr] opacity-0'
                  }`}>
                  <div className="overflow-hidden space-y-4">

                    {item.note && (
                      <div className="bg-secondary/20 p-3 rounded-lg border border-secondary">
                        <span className="text-xs font-semibold text-primary block mb-1">Note</span>
                        <p className="text-sm text-foreground">{item.note}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {/* Inputs Section */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inputs</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(item.inputs).map(([key, value]) => (
                            <div key={key} className="bg-muted/30 p-2 rounded">
                              <div className="text-xs text-muted-foreground capitalize mb-0.5">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="font-medium truncate" title={String(value)}>
                                {formatValue(key, value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Results Section */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Results</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {Object.entries(item.results).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center bg-primary/5 p-2 rounded border border-primary/10">
                              <span className="text-muted-foreground capitalize text-xs">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="font-bold text-primary">
                                {formatValue(key, value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this history?</AlertDialogTitle>
            <AlertDialogDescription>
              This calculation will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
