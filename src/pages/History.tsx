import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar } from 'lucide-react';
import { getHistory, deleteCalculation, CalculationHistory } from '@/lib/storage';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';
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
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (id: string) => {
    deleteCalculation(id);
    loadHistory();
    setDeleteId(null);
    toast.success('Calculation deleted');
  };

  const getCalculatorName = (type: string) => {
    const names: Record<string, string> = {
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
    };
    return names[type] || type;
  };

  const formatResultValue = (key: string, value: number) => {
    // Format currency values
    const currencyKeys = ['amount', 'principal', 'total', 'invested', 'returns', 'interest', 'maturity', 'value', 'future', 'shortfall', 'required', 'achieved', 'savings', 'contributions', 'withdrawn', 'balance', 'withdrawal'];
    if (currencyKeys.some(currencyKey => key.toLowerCase().includes(currencyKey))) {
      return formatCurrency(value);
    }
    // Format percentage values
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('return') || key.toLowerCase().includes('inflation') || key.toLowerCase().includes('percentage') || key.toLowerCase().includes('progress')) {
      return `${value}%`;
    }
    // Format time values
    if (key.toLowerCase().includes('time') || key.toLowerCase().includes('years') || key.toLowerCase().includes('period') || key.toLowerCase().includes('tenure')) {
      return `${value} years`;
    }
    // Format EMI values
    if (key.toLowerCase().includes('emi') || key.toLowerCase().includes('installment')) {
      return formatCurrency(value);
    }
    // Format boolean values
    if (key.toLowerCase().includes('met') || key.toLowerCase().includes('enabled')) {
      return value === 1 ? 'Yes' : 'No';
    }
    // Default formatting
    return value.toLocaleString();
  };

  if (history.length === 0) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="p-12 max-w-lg shadow-2xl border-0 bg-gradient-to-br from-card to-secondary/10">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-foreground">No History Yet</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Your saved calculations will appear here once you start using the calculators
              </p>
            </div>
            <div className="w-16 h-1 mx-auto bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 pb-20 bg-gradient-to-br from-background to-secondary/10 min-h-screen">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Calculation History</h2>
            <p className="text-xs text-muted-foreground">
              {history.length} saved calculation{history.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => (
          <Card key={item.id} className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-secondary/5 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
            {/* Decorative gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 rounded-full text-xs font-semibold text-primary-foreground shadow-md">
                      {getCalculatorName(item.type)}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-full">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(new Date(item.date), 'MMM dd, yyyy • hh:mm a')}
                      </span>
                    </div>
                  </div>

                  {item.note && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-xl">
                      <p className="text-sm text-foreground italic leading-relaxed">"{item.note}"</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Input Parameters */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Input Parameters</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(item.inputs).map(([key, value]) => (
                          <div key={key} className="bg-secondary/20 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground font-medium mb-0.5">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-xs font-bold text-foreground">
                              {key.toLowerCase().includes('rate') ? `${value}%` :
                               key.toLowerCase().includes('months') ? `${value} months` :
                               key.toLowerCase().includes('time') || key.toLowerCase().includes('years') || key.toLowerCase().includes('period') ? `${value} years` :
                               key.toLowerCase().includes('enabled') ? (value === 1 ? 'Yes' : 'No') :
                               formatCurrency(Number(value))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Calculation Results */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Calculation Results</h4>
                      <div className="space-y-2">
                        {(() => {
                          // Hide inflation adjusted goal field for Goal Planning in history
                          const filteredResults = Object.entries(item.results).filter(([key]) => {
                            if (item.type === 'goalplanning' && key.toLowerCase().includes('inflationadjustedgoal')) {
                              return false;
                            }
                            return true;
                          });

                          return filteredResults.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {filteredResults.slice(0, 6).map(([key, value]) => (
                                <div key={key} className="bg-gradient-to-r from-primary/5 to-primary/10 p-2 rounded-md border border-primary/20">
                                  <div className="text-xs text-muted-foreground font-medium mb-0.5">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                  </div>
                                  <div className="text-sm font-bold text-primary">
                                    {key.toLowerCase().includes('normal') ? (
                                      <span title="Normal value (without inflation)">{formatResultValue(key, value)}</span>
                                    ) : key.toLowerCase().includes('inflation') ? (
                                      <span title="Inflation-adjusted value" className="text-orange-600">{formatResultValue(key, value)}</span>
                                    ) : (
                                      formatResultValue(key, value)
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calculation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this calculation from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
