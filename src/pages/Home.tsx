import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useSearch } from "@/context/SearchContext";
import { triggerHaptic } from "@/lib/haptics";
import {
  Calculator,
  Home as HomeIcon,
  Car,
  PiggyBank,
  Landmark,
  Coins,
  TrendingDown,
  Receipt,
  Repeat,
  HandCoins,
  LucideIcon,
  Percent,
  Briefcase,
  Users,
  Wallet,
  PieChart,
  TrendingUp,
  CircleDot,
  BarChart3,
  CreditCard as CreditCardIcon,
  Home as HomeIcon2,
  Scale as ScaleIcon,
  PiggyBank as PiggyBankIcon,
  Coins as CoinsIcon,
  Target as TargetIcon,
  GraduationCap as GraduationCapIcon,
  Shield,
  Globe,
  Clock,
  Sparkles,
} from "lucide-react";

interface CalculatorCard {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
  available: boolean;
  color?: string;
  aliases: string[];
}

const FILTER_PILLS = [
  { label: "SIP", query: "sip" },
  { label: "EMI", query: "emi" },
  { label: "PF", query: "pf" },
  { label: "Goal Planner", query: "goal planner" },
  { label: "Retirement", query: "retirement" },
];

// Section 1: Basic Calculators
const basicCalculators: CalculatorCard[] = [
  {
    title: "Simple Interest",
    icon: CircleDot,
    path: "/simple",
    description: "Basic interest calculation",
    available: true,
    color: "green",
    aliases: ["simple interest", "si", "flat interest", "basic interest", "simple", "flat rate"],
  },
  {
    title: "Compound Interest",
    icon: BarChart3,
    path: "/compound",
    description: "Compounding returns",
    available: true,
    color: "purple",
    aliases: ["compound interest", "ci", "compounding", "interest on interest", "growth", "cagr", "compound"],
  },
  {
    title: "Currency Calculator",
    icon: Calculator,
    path: "/currency",
    description: "Convert between currencies",
    available: true,
    color: "blue",
    aliases: ["currency", "exchange rate", "forex", "usd", "eur", "gbp", "inr", "dollar", "rupee", "euro", "pound", "convert", "converter", "foreign exchange"],
  },
  {
    title: "Time-Cost ",
    icon: Clock,
    path: "/time-cost",
    description: "Is it worth it?",
    available: true,
    color: "red",
    aliases: ["time cost", "time-cost", "time", "hours of work", "salary hours", "hourly rate", "worth it", "impulse buy", "hours", "work hours"],
  },
  {
    title: "Trip Cost",
    icon: Car,
    path: "/trip-cost",
    description: "Real trip cost",
    available: true,
    color: "blue",
    aliases: ["trip", "trip cost", "fuel", "petrol", "diesel", "mileage", "car trip", "road trip", "toll", "split bill", "journey", "car", "travel", "vehicle", "drive"],
  },
  {
    title: "Gold Calculator",
    icon: Coins,
    path: "/gold-calculator",
    description: "Jewelry price & loan",
    available: true,
    color: "yellow",
    aliases: ["gold", "bangle", "bangles", "jewelry", "jewellery", "ornament", "ornaments", "necklace", "ring", "chain", "sovereign", "tola", "gram", "22k", "24k", "18k", "making charges", "wastage", "gold loan", "carat", "karat", "silver", "hallmark"],
  },
];

// Section 2: Loan & EMI Calculators
const loanCalculators: CalculatorCard[] = [
  {
    title: "EMI Calculator",
    icon: CreditCardIcon,
    path: "/emi",
    description: "Monthly loan installments",
    available: true,
    color: "orange",
    aliases: ["emi", "loan", "car loan", "auto loan", "personal loan", "bike loan", "car", "installment", "interest", "vehicle loan", "monthly emi", "principal", "amortization"],
  },
  {
    title: "Loan Comparison",
    icon: ScaleIcon,
    path: "/loan-compare",
    description: "Compare 2 or 3 loans",
    available: true,
    color: "blue",
    aliases: ["loan compare", "loan comparison", "compare loan", "two loans", "three loans", "which loan", "bank comparison", "cheaper loan", "processing fee", "car loan", "home loan comparison", "difference"],
  },
  {
    title: "Home Loan",
    icon: HomeIcon2,
    path: "/home-loan",
    description: "Home loan with tax benefits",
    available: true,
    color: "yellow",
    aliases: ["home loan", "house loan", "flat loan", "mortgage", "housing", "property", "house", "home", "tax benefit", "flat", "apartment", "section 24", "80c home loan"],
  },
];

// Section 3: Investment Calculators
const investmentCalculators: CalculatorCard[] = [
  {
    title: "SIP Calculator",
    icon: PieChart,
    path: "/sip",
    description: "Systematic investment",
    available: true,
    color: "purple",
    aliases: ["sip", "mutual fund sip", "systematic investment", "wealth", "monthly investment", "compounding", "returns", "mf sip", "crorepati", "investment"],
  },
  {
    title: "Mutual Fund",
    icon: Wallet,
    path: "/mutual-fund",
    description: "Direct vs Regular & Tax",
    available: true,
    color: "green",
    aliases: ["mutual fund", "mf", "direct vs regular", "ter", "capital gains", "ltcg", "stcg", "equity", "nav", "lumpsum mf", "returns", "portfolio", "growth"],
  },
  {
    title: "SWP Calculator",
    icon: TrendingDown,
    path: "/swp",
    description: "Withdrawal planning",
    available: true,
    color: "blue",
    aliases: ["swp", "systematic withdrawal", "monthly income", "pension", "regular payout", "retirement withdrawal", "cash flow", "withdrawal"],
  },
  {
    title: "Lumpsum",
    icon: CoinsIcon,
    path: "/lumpsum",
    description: "One-time investment",
    available: true,
    color: "purple",
    aliases: ["lumpsum", "one time", "one-time investment", "single deposit", "bulk investment", "lump sum", "one off", "windfall"],
  },
];

// Section 4: Deposit Calculators
const depositCalculators: CalculatorCard[] = [
  {
    title: "FD Calculator",
    icon: PiggyBankIcon,
    path: "/fd",
    description: "Fixed deposits",
    available: true,
    color: "green",
    aliases: ["fd", "fixed deposit", "bank fd", "term deposit", "senior citizen", "quarterly payout", "deposit", "fixed", "bank interest", "tds on fd"],
  },
  {
    title: "RD Calculator",
    icon: Repeat,
    path: "/rd",
    description: "Recurring deposits",
    available: true,
    color: "blue",
    aliases: ["rd", "recurring deposit", "post office rd", "monthly deposit", "deposit", "recurring", "monthly savings", "piggy bank"],
  },
  {
    title: "PPF Calculator",
    icon: Landmark,
    path: "/ppf",
    description: "Public provident fund",
    available: true,
    color: "orange",
    aliases: ["ppf", "pf", "public provident fund", "tax free", "80c", "government scheme", "15 years", "deposit", "post office ppf", "sovereign guarantee"],
  },
  {
    title: "NPS Calculator",
    icon: Briefcase,
    path: "/nps",
    description: "Pension & Tax Benefits",
    available: true,
    color: "blue",
    aliases: ["nps", "national pension", "pension", "pfrda", "tier 1", "tier 2", "80ccd", "annuity", "retirement", "old age", "pension scheme", "corporate nps"],
  },
];

// Section 5: Planning Tools
const planningCalculators: CalculatorCard[] = [
  {
    title: "Retirement Planner",
    icon: Users,
    path: "/retirement-planner",
    description: "Plan your retirement corpus",
    available: true,
    color: "purple",
    aliases: ["retirement", "retire", "pension", "fire", "corpus", "old age", "financial independence", "retirement fund", "nest egg"],
  },
  {
    title: "Goal Planning",
    icon: TargetIcon,
    path: "/goal-planning",
    description: "Achieve financial goals",
    available: true,
    color: "orange",
    aliases: ["goal", "goal planner", "goal planning", "target", "dream house", "car purchase", "vacation", "wedding", "milestone", "future goal", "house", "car"],
  },
  {
    title: "Education Planner",
    icon: GraduationCapIcon,
    path: "/education-planner",
    description: "Child education fund",
    available: true,
    color: "blue",
    aliases: ["education", "child education", "college fund", "higher education", "study abroad", "kid education", "school fees", "university", "child"],
  },
  {
    title: "Emergency Fund",
    icon: Shield,
    path: "/emergency-fund",
    description: "Build financial safety net",
    available: true,
    color: "green",
    aliases: ["emergency", "emergency fund", "safety net", "contingency", "rainy day", "job loss", "liquidity", "survival fund", "buffer", "6 months expenses"],
  },
  {
    title: "Rent vs Buy",
    icon: HomeIcon,
    path: "/rent-vs-buy",
    description: "Renting vs Buying Home",
    available: true,
    color: "yellow",
    aliases: ["rent vs buy", "rent or buy", "buying home", "renting flat", "property investment", "house", "home", "flat", "real estate", "mortgage vs rent"],
  },
];

// Additional Searchable Calculators across the app
const statutoryCalculators: CalculatorCard[] = [
  {
    title: "Gratuity Calculator",
    icon: HandCoins,
    path: "/gratuity",
    description: "Gratuity benefit & tax exemptions",
    available: true,
    color: "green",
    aliases: ["gratuity", "gratuity act", "severance", "service gratuity", "pension", "retirement gratuity", "15 26", "service", "gratuity formula", "tax free gratuity"],
  },
  {
    title: "EPF Calculator",
    icon: Briefcase,
    path: "/epf",
    description: "Provident fund & pension calculation",
    available: true,
    color: "blue",
    aliases: ["epf", "pf", "provident fund", "uan", "epfo", "employee provident fund", "vpf", "pension", "eps", "salary pf", "12 percent"],
  },
  {
    title: "CAGR Calculator",
    icon: TrendingUp,
    path: "/cagr",
    description: "Compound annual growth rate",
    available: true,
    color: "purple",
    aliases: ["cagr", "compound annual growth", "growth rate", "portfolio return", "annual return", "annualized return", "cagr formula"],
  },
  {
    title: "HRA Calculator",
    icon: HomeIcon,
    path: "/hra",
    description: "House rent allowance exemption",
    available: true,
    color: "yellow",
    aliases: ["hra", "house rent allowance", "rent receipt", "80gg", "rent tax exemption", "house", "rent", "salary hra", "metro non metro"],
  },
  {
    title: "SSY Calculator",
    icon: PiggyBank,
    path: "/ssy",
    description: "Sukanya Samriddhi Yojana",
    available: true,
    color: "orange",
    aliases: ["ssy", "sukanya samriddhi", "girl child", "daughter", "beti", "sukanya", "post office ssy", "girl education"],
  },
  {
    title: "GST Calculator",
    icon: Percent,
    path: "/gst",
    description: "Goods & Services Tax calculation",
    available: true,
    color: "green",
    aliases: ["gst", "goods and services tax", "cgst", "sgst", "igst", "tax invoice", "gst slab", "reverse gst", "inclusive gst"],
  },
  {
    title: "Inflation Calculator",
    icon: TrendingUp,
    path: "/inflation",
    description: "Future purchasing power & inflation",
    available: true,
    color: "blue",
    aliases: ["inflation", "purchasing power", "future value", "cost of living", "real value", "inflation rate", "future cost"],
  },
  {
    title: "Percentage Calculator",
    icon: Percent,
    path: "/percentage",
    description: "Percentage, discount & margin",
    available: true,
    color: "orange",
    aliases: ["percentage", "discount", "percent change", "margin", "markup", "percent off", "sale discount", "profit margin"],
  },
  {
    title: "Income Tax",
    icon: Receipt,
    path: "/income-tax",
    description: "Old vs New tax regime comparison",
    available: true,
    color: "red",
    aliases: ["income tax", "tax", "tax slab", "new regime", "old regime", "salary tax", "tds", "budget 2024", "budget 2025", "income tax calculator", "rebate 87a"],
  },
  {
    title: "German Tax",
    icon: Globe,
    path: "/german-tax",
    description: "Germany gross to net salary tax",
    available: true,
    color: "yellow",
    aliases: ["german tax", "germany", "steuer", "brutto netto", "tax", "gehalt", "steuerklasse", "german salary", "solidaritatszuschlag"],
  },
];

// Unified pool of all calculators in the app for search
const ALL_SEARCHABLE_CALCULATORS: CalculatorCard[] = [
  ...basicCalculators,
  ...loanCalculators,
  ...investmentCalculators,
  ...depositCalculators,
  ...planningCalculators,
  ...statutoryCalculators,
];

// Smart search matching helper function
const matchesQuery = (calc: CalculatorCard, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const title = calc.title.toLowerCase();
  const desc = calc.description.toLowerCase();

  // 1. Title or description match
  if (title.includes(q) || desc.includes(q)) return true;

  // 2. Query words vs Title/Desc/Aliases
  const qWords = q.split(/\s+/).filter(Boolean);
  const aliases = calc.aliases || [];

  // Direct alias includes full query (e.g. query "car" in alias "car loan")
  if (aliases.some((a) => a.toLowerCase().includes(q))) return true;

  // Multi-word queries: all words must match somewhere in title/desc/aliases
  if (qWords.length > 1) {
    const isMultiMatch = qWords.every((word) => {
      if (title.includes(word) || desc.includes(word)) return true;
      return aliases.some((a) => a.toLowerCase().includes(word));
    });
    if (isMultiMatch) return true;
  }

  // Check if any alias is contained in query
  // For short aliases (<= 2 chars like "si", "ci", "fd", "rd", "pf", "mf"),
  // only match as an exact whole word to prevent false positive bugs (e.g. "pension" or "deposit" matching "si")
  return aliases.some((a) => {
    const cleanA = a.toLowerCase();
    if (cleanA.length <= 2) {
      return qWords.includes(cleanA);
    }
    return q.includes(cleanA);
  });
};

const Home = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, isSearchOpen, closeSearch } = useSearch();

  const handleCardClick = (card: CalculatorCard) => {
    if (card.available) {
      triggerHaptic();
      closeSearch();
      navigate(card.path);
    }
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400";
      case "blue":
        return "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400";
      case "orange":
        return "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400";
      case "yellow":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/60 dark:text-yellow-400";
      case "purple":
        return "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400";
      case "red":
        return "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  // Filtered calculators based on query
  const filteredCalculators = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    return ALL_SEARCHABLE_CALCULATORS.filter((calc) => matchesQuery(calc, q));
  }, [searchQuery]);

  // Card renderer preserving the EXACT original card markup & compact proportions
  const renderCard = (calc: CalculatorCard) => {
    const Icon = calc.icon;
    const colorClasses = getColorClasses(calc.color);
    const textColorClass = calc.available
      ? colorClasses
          .split(" ")
          .filter((c) => c.startsWith("text-"))
          .join(" ")
      : "text-muted-foreground";

    return (
      <Card
        key={calc.title}
        onClick={() => handleCardClick(calc)}
        className={`p-3 flex flex-col items-center justify-center gap-2 text-center transition-all min-h-[120px] touch-manipulation select-none ${
          calc.available
            ? "cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        <div
          className={`p-2 rounded-full ${
            calc.available ? colorClasses : "bg-muted"
          }`}
        >
          <Icon className={`w-6 h-6 ${textColorClass}`} />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="font-semibold text-xs text-foreground leading-tight">
            {calc.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-tight">
            {calc.description}
          </p>
          {!calc.available && (
            <span className="text-xs text-primary font-medium mt-1 block">
              Coming Soon
            </span>
          )}
        </div>
      </Card>
    );
  };

  function renderSection(title: string, calculators: CalculatorCard[]) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground px-1">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {calculators.map(renderCard)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Quick Suggestions Pills when search mode is active */}
      {isSearchOpen && (
        <div className="bg-card/90 border border-border/70 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular searches:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
            {FILTER_PILLS.map((pill) => {
              const isActive =
                searchQuery.toLowerCase() === pill.query.toLowerCase();

              return (
                <button
                  key={pill.label}
                  onClick={() => {
                    triggerHaptic();
                    if (isActive) {
                      setSearchQuery("");
                    } else {
                      setSearchQuery(pill.query);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap border text-xs ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Search Results Mode */}
      {filteredCalculators !== null ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>Matching Tools</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({filteredCalculators.length} found for "{searchQuery}")
              </span>
            </h2>
            <button
              onClick={() => {
                triggerHaptic();
                setSearchQuery("");
                closeSearch();
              }}
              className="text-xs text-primary font-medium hover:underline"
            >
              Clear & Show All
            </button>
          </div>

          {filteredCalculators.length === 0 ? (
            <div className="bg-card border border-dashed rounded-xl p-8 text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                No calculators found matching "<strong>{searchQuery}</strong>".
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching for common terms like:
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {["sip", "emi", "pf", "goal planner", "retirement"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => {
                        triggerHaptic();
                        setSearchQuery(term);
                      }}
                      className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-md hover:bg-primary/20"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCalculators.map(renderCard)}
            </div>
          )}
        </div>
      ) : (
        /* Default State: Exact 5 Original Sections preserved untouched */
        <>
          {renderSection("Basic Calculators", basicCalculators)}
          {renderSection("Loan & EMI Calculators", loanCalculators)}
          {renderSection("Investment Calculators", investmentCalculators)}
          {renderSection("Deposit Calculators", depositCalculators)}
          {renderSection("Planning Tools", planningCalculators)}
        </>
      )}
    </div>
  );
};

export default Home;
