import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, Calendar } from 'lucide-react';
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

interface CalculatorHistoryProps {
  calculatorType: string;
  title?: string;
}

const CalculatorHistory = ({ calculatorType, title = "History" }: CalculatorHistoryProps) => {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<CalculationHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [calculatorType]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(item =>
        item.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.values(item.inputs).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        Object.values(item.results).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredHistory(filtered);
    }
  }, [history, searchTerm]);

  const loadHistory = () => {
    const allHistory = getHistory();
    const filtered = allHistory.filter(item => item.type === calculatorType);
    setHistory(filtered);
  };

  const handleDelete = (id: string) => {
    deleteCalculation(id);
    loadHistory();
    setDeleteId(null);
    toast.success('Calculation deleted');
  };

  const getCalculatorName = (type: string) => {
    const names: Record<string, string> = {
      simple: 'Simple',
      compound: 'Compound',
      sip: 'SIP',
      mutualfund: 'Mutual Fund',
      swp: 'SWP',
      emi: 'EMI',
      loancompare: 'Loan Compare',
      homeloan: 'Home Loan',
      lumpsum: 'Lumpsum',
      ppf: 'PPF',
      fd: 'FD',
      rd: 'RD',
      goalplanning: 'Goal Planning',
      retirement: 'Retirement',
      education: 'Education',
    };
    return names[type] || type;
  };

  const formatResultValue = (key: string, value: number) => {
    // Format currency values
    if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('principal') || key.toLowerCase().includes('total') || key.toLowerCase().includes('invested') || key.toLowerCase().includes('returns') || key.toLowerCase().includes('interest') || key.toLowerCase().includes('maturity') || key.toLowerCase().includes('value') || key.toLowerCase().includes('future') || key.toLowerCase().includes('shortfall') || key.toLowerCase().includes('required') || key.toLowerCase().includes('achieved') || key.toLowerCase().includes('savings') || key.toLowerCase().includes('contributions')) {
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
    return null;
  }

  return (
    <>
      <Card className="p-4 space-y-4 shadow-xl bg-gradient-to-br from-card via-card to-secondary/10 border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {filteredHistory.length} saved calculation{filteredHistory.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {history.length > 3 && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search calculations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 border-border/50 focus:border-primary/50 rounded-xl bg-background/50 backdrop-blur-sm"
            />
          </div>
        )}

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredHistory.map((item, index) => (
            <Card key={item.id} className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-background via-background to-secondary/5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              {/* Decorative gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
                          {Array.from({ length: Math.ceil(Object.keys(item.results).length / 3) }, (_, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-3 gap-2">
                              {Object.entries(item.results)
                                .slice(rowIndex * 3, (rowIndex + 1) * 3)
                                .map(([key, value]) => (
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
                          ))}
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
      </Card>

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
    </>
  );
};

export default CalculatorHistory;