import { ReactNode, useState } from 'react';
import { Home, Calculator, TrendingUp, PieChart, Wallet, History, Receipt, HandCoins, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CalculatorLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const CalculatorLayout = ({ children, showHeader = false }: CalculatorLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/gratuity', icon: HandCoins, label: 'Gratuity Cal' },
  ];

  return (
    <div className="flex h-screen bg-background pt-2 sm:pt-4">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors",
                  (location.pathname === item.path || (item.path === '/' && (location.pathname === '/' || location.pathname === '/home')))
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Header with hamburger menu - only show on Home page */}
        {showHeader && (
          <header className="bg-primary text-primary-foreground px-4 py-3 mx-2 mt-2 sm:mt-4 sm:mx-4 shadow-md flex items-center gap-3 relative z-10 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Financial Calculators</h1>
          </header>
        )}

        {/* Hamburger menu for calculator pages - positioned absolutely */}
        {!showHeader && (
          <div className="absolute top-4 left-4 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-primary hover:bg-primary/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}

        <main className={`flex-1 overflow-y-auto ${showHeader ? 'pb-20' : 'pb-16'}`}>
          {children}
        </main>

        {/* Bottom navigation for mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
          <div className="flex justify-around items-center py-2">
            {[
              { path: '/', icon: Home, label: 'Home' },
              { path: '/simple', icon: Calculator, label: 'Simple' },
              { path: '/sip', icon: PieChart, label: 'SIP' },
              { path: '/emi', icon: Receipt, label: 'EMI' },
              { path: '/history', icon: History, label: 'History' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                  (location.pathname === item.path || (item.path === '/' && (location.pathname === '/' || location.pathname === '/home')))
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default CalculatorLayout;
