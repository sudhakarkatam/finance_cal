import { ReactNode, useState, useEffect } from "react";
import {
  Home,
  Calculator,
  TrendingUp,
  PieChart,
  History,
  Receipt,
  HandCoins,
  Menu,
  X,
  Home as HomeIcon,
  PiggyBank,
  Briefcase,
  Settings,
  Flag,
  Percent,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSafeArea } from "@/hooks/use-safe-area";

interface CalculatorLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const CalculatorLayout = ({
  children,
  showHeader = false,
}: CalculatorLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const safeAreaInsets = useSafeArea();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  // Handle back button navigation
  useEffect(() => {
    // Push state when navigating to non-home pages to track history
    if (!isHomePage) {
      window.history.pushState({ fromCalculator: true }, "", location.pathname);
    }
  }, [location.pathname, isHomePage]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we're on a calculator page and user presses back, go to home
      if (!isHomePage) {
        event.preventDefault();
        navigate("/");
      }
      // If on home page, allow default behavior (may close app)
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isHomePage, navigate]);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/gratuity", icon: HandCoins, label: "Gratuity Cal" },
    { path: "/cagr", icon: TrendingUp, label: "CAGR Calculator" },
    { path: "/hra", icon: HomeIcon, label: "HRA Calculator" },
    { path: "/ssy", icon: PiggyBank, label: "SSY Calculator" },
    { path: "/epf", icon: Briefcase, label: "EPF Calculator" },

    { path: "/inflation", icon: TrendingUp, label: "Inflation Cal" },
    { path: "/gst", icon: Percent, label: "GST Calculator" },
    { path: "/percentage", icon: Percent, label: "Percentage Cal" },
    // Hidden calculators - routes still accessible via direct URL
    { path: "/income-tax", icon: Receipt, label: "Income Tax" },
    // { path: "/german-tax", icon: Flag, label: "Germany Tax" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  // Calculate the total height of bottom navigation including safe area
  const bottomNavHeight = 64; // Base height in pixels (py-3 + icon + label ≈ 64px)
  const totalBottomHeight = bottomNavHeight + safeAreaInsets.bottom;

  return (
    <div
      className="flex h-screen bg-background overflow-hidden"
      style={{
        paddingTop: `${safeAreaInsets.top}px`,
      }}
    >
      {/* Sidebar - only show on home page */}
      {isHomePage && (
        <>
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
            style={{
              paddingTop: `${safeAreaInsets.top}px`,
            }}
          >
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
            <div className="flex flex-col h-full pb-20">
              <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
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
                        location.pathname === item.path ||
                          (item.path === "/" &&
                            (location.pathname === "/" ||
                              location.pathname === "/home"))
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header with hamburger menu - only show on Home page */}
        {showHeader && (
          <header className="bg-primary text-primary-foreground px-4 py-3 mx-2 mt-2 sm:mx-4 sm:mt-3 shadow-md flex items-center gap-3 relative z-10 rounded-lg flex-shrink-0">
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

        {/* Main content area with proper scrolling and padding */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden lg:pb-4"
          style={{
            paddingBottom: `${totalBottomHeight + 16}px`, // Extra 16px for breathing room
          }}
        >
          {children}
        </main>

        {/* Bottom navigation for mobile with proper safe area handling */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30"
          style={{
            paddingBottom: `${safeAreaInsets.bottom}px`,
            paddingLeft: `${safeAreaInsets.left}px`,
            paddingRight: `${safeAreaInsets.right}px`,
          }}
        >
          <div className="flex justify-around items-center py-3 px-2">
            {[
              { path: "/", icon: Home, label: "Home" },
              { path: "/simple", icon: Calculator, label: "Simple" },
              { path: "/sip", icon: PieChart, label: "SIP" },
              { path: "/emi", icon: Receipt, label: "EMI" },
              { path: "/history", icon: History, label: "History" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] touch-manipulation",
                  location.pathname === item.path ||
                    (item.path === "/" &&
                      (location.pathname === "/" ||
                        location.pathname === "/home"))
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default CalculatorLayout;
