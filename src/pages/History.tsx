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

  if (history.length === 0) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <Card className="p-12 max-w-md">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">No History Yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your saved calculations will appear here
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold text-foreground">History</h2>
        <span className="text-sm text-muted-foreground">{history.length} calculation{history.length !== 1 ? 's' : ''}</span>
      </div>
      
      {history.map((item) => (
        <Card key={item.id} className="overflow-hidden border-l-4 border-l-primary">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="px-2 py-0.5 bg-primary/10 rounded text-xs font-medium text-primary">
                    {getCalculatorName(item.type)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(item.date), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(item.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {item.note && (
              <div className="mb-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-sm text-foreground italic">"{item.note}"</p>
              </div>
            )}

            <div className="grid gap-2 bg-secondary/50 p-3 rounded-lg">
              {Object.entries(item.results).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}

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
