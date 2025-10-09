import { ReactNode } from 'react';
import { Home, Calculator, TrendingUp, PieChart, Wallet, History, Receipt } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CalculatorLayoutProps {
  children: ReactNode;
}

const CalculatorLayout = ({ children }: CalculatorLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/simple', icon: Calculator, label: 'Simple' },
    { path: '/sip', icon: PieChart, label: 'SIP' },
    { path: '/emi', icon: Receipt, label: 'EMI' },
    { path: '/history', icon: History, label: 'History' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                (location.pathname === item.path || (item.path === '/' && (location.pathname === '/' || location.pathname === '/home')))
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CalculatorLayout;
