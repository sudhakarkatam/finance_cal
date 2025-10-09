import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import {
  Calculator,
  Home as HomeIcon,
  Car,
  Scale,
  PiggyBank,
  Landmark,
  Coins,
  Target,
  GraduationCap,
  TrendingDown,
  FileText,
  Receipt,
  Repeat,
  HandCoins,
  LucideIcon,
  Calculator as CalcIcon,
  Building,
  CreditCard,
  DollarSign,
  PiggyBank as BankIcon,
  TrendingUp as TrendIcon,
  Percent,
  Briefcase,
  Users,
  BookOpen,
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
  GraduationCap as GraduationCapIcon
} from 'lucide-react';

interface CalculatorCard {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
  available: boolean;
  color?: string;
}

const Home = () => {
  const navigate = useNavigate();

  const loanCalculators: CalculatorCard[] = [
    { title: 'EMI Calculator', icon: CreditCardIcon, path: '/emi', description: 'Monthly loan installments', available: true, color: 'orange' },
    { title: 'Loan Comparison', icon: ScaleIcon, path: '/loan-compare', description: 'Compare two loans', available: true, color: 'blue' },
    { title: 'Home Loan', icon: HomeIcon2, path: '/home-loan', description: 'Home loan with tax benefits', available: true, color: 'yellow' },
  ];

  const investmentCalculators: CalculatorCard[] = [
    { title: 'SIP Calculator', icon: PieChart, path: '/sip', description: 'Systematic investment', available: true, color: 'purple' },
    { title: 'Mutual Fund', icon: Wallet, path: '/mutual-fund', description: 'Fund returns', available: true, color: 'green' },
    { title: 'SWP Calculator', icon: TrendingDown, path: '/swp', description: 'Withdrawal planning', available: true, color: 'blue' },
    { title: 'Lumpsum', icon: CoinsIcon, path: '/lumpsum', description: 'One-time investment', available: true, color: 'purple' },
  ];

  const depositCalculators: CalculatorCard[] = [
    { title: 'FD Calculator', icon: PiggyBankIcon, path: '/fd', description: 'Fixed deposits', available: true, color: 'green' },
    { title: 'RD Calculator', icon: Repeat, path: '/rd', description: 'Recurring deposits', available: true, color: 'blue' },
    { title: 'PPF Calculator', icon: Landmark, path: '/ppf', description: 'Public provident fund', available: true, color: 'orange' },
  ];

  const planningCalculators: CalculatorCard[] = [
    { title: 'Retirement Planner', icon: Users, path: '/retirement-planner', description: 'Plan your retirement corpus', available: true, color: 'purple' },
    { title: 'Goal Planning', icon: TargetIcon, path: '/goal-planning', description: 'Achieve financial goals', available: true, color: 'orange' },
    { title: 'Education Planner', icon: GraduationCapIcon, path: '/education-planner', description: 'Child education fund', available: true, color: 'blue' },
  ];

  const basicCalculators: CalculatorCard[] = [
    { title: 'Simple Interest', icon: CircleDot, path: '/simple', description: 'Basic interest calculation', available: true, color: 'green' },
    { title: 'Compound Interest', icon: BarChart3, path: '/compound', description: 'Compounding returns', available: true, color: 'purple' },
  ];

  const handleCardClick = (card: CalculatorCard) => {
    if (card.available) {
      navigate(card.path);
    }
  };

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 pb-24 max-w-6xl mx-auto">

      {renderSection('Basic Calculators', basicCalculators)}
      {renderSection('Loan & EMI Calculators', loanCalculators)}
      {renderSection('Investment Calculators', investmentCalculators)}
      {renderSection('Deposit Calculators', depositCalculators)}
      {renderSection('Planning Tools', planningCalculators)}
    </div>
  );

  function renderSection(title: string, calculators: CalculatorCard[]) {
    const getColorClasses = (color?: string) => {
      switch (color) {
        case 'green': return 'bg-green-100 text-green-600';
        case 'blue': return 'bg-blue-100 text-blue-600';
        case 'orange': return 'bg-orange-100 text-orange-600';
        case 'yellow': return 'bg-yellow-100 text-yellow-600';
        case 'purple': return 'bg-purple-100 text-purple-600';
        case 'red': return 'bg-red-100 text-red-600';
        default: return 'bg-primary/10 text-primary';
      }
    };

    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground px-1">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            const colorClasses = getColorClasses(calc.color);
            return (
              <Card
                key={calc.title}
                onClick={() => handleCardClick(calc)}
                className={`p-4 flex flex-col items-center justify-center gap-3 text-center transition-all min-h-[140px] ${
                  calc.available
                    ? 'cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`p-3 rounded-full ${calc.available ? colorClasses : 'bg-muted'}`}>
                  <Icon className={`w-8 h-8 ${calc.available ? colorClasses.split(' ')[1] : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-sm text-foreground leading-tight">{calc.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{calc.description}</p>
                  {!calc.available && (
                    <span className="text-xs text-primary font-medium mt-1 block">Coming Soon</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  function renderAdditionalSection(title: string, calculators: CalculatorCard[]) {
    const getColorClasses = (color?: string) => {
      switch (color) {
        case 'green': return 'bg-green-100 text-green-600';
        case 'blue': return 'bg-blue-100 text-blue-600';
        case 'orange': return 'bg-orange-100 text-orange-600';
        case 'yellow': return 'bg-yellow-100 text-yellow-600';
        case 'purple': return 'bg-purple-100 text-purple-600';
        case 'red': return 'bg-red-100 text-red-600';
        default: return 'bg-primary/10 text-primary';
      }
    };

    return (
      <div className="space-y-3 mb-6">
        <h2 className="text-lg font-bold text-foreground px-1">{title}</h2>
        <div className="grid grid-cols-3 gap-3">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            const colorClasses = getColorClasses(calc.color);
            return (
              <Card
                key={calc.title}
                onClick={() => handleCardClick(calc)}
                className={`p-3 flex flex-col items-center justify-center gap-2 text-center transition-all min-h-[120px] ${
                  calc.available
                    ? 'cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`p-2 rounded-full ${calc.available ? colorClasses : 'bg-muted'}`}>
                  <Icon className={`w-6 h-6 ${calc.available ? colorClasses.split(' ')[1] : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-semibold text-xs text-foreground leading-tight">{calc.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{calc.description}</p>
                  {!calc.available && (
                    <span className="text-xs text-primary font-medium mt-1 block">Coming Soon</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
};

export default Home;
