import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CalculatorLayout from "./components/CalculatorLayout";
import Home from "./pages/Home";
import SimpleInterest from "./pages/SimpleInterest";
import CompoundInterest from "./pages/CompoundInterest";
import SIPCalculator from "./pages/SIPCalculator";
import MutualFund from "./pages/MutualFund";
import SWPCalculator from "./pages/SWPCalculator";
import EMICalculator from "./pages/EMICalculator";
import LoanComparison from "./pages/LoanComparison";
import HomeLoanCalculator from "./pages/HomeLoanCalculator";
import LumpsumCalculator from "./pages/LumpsumCalculator";
import PPFCalculator from "./pages/PPFCalculator";
import FDCalculator from "./pages/FDCalculator";
import RDCalculator from "./pages/RDCalculator";
import GratuityCalculator from "./pages/GratuityCalculator";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import GoalPlanning from "./pages/GoalPlanning";
import RetirementPlanner from "./pages/RetirementPlanner";
import EducationPlanner from "./pages/EducationPlanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CalculatorLayout showHeader={true}><Home /></CalculatorLayout>} />
          <Route path="/home" element={<CalculatorLayout showHeader={true}><Home /></CalculatorLayout>} />
          <Route path="/simple" element={<CalculatorLayout><SimpleInterest /></CalculatorLayout>} />
          <Route path="/compound" element={<CalculatorLayout><CompoundInterest /></CalculatorLayout>} />
          <Route path="/sip" element={<CalculatorLayout><SIPCalculator /></CalculatorLayout>} />
          <Route path="/mutual-fund" element={<CalculatorLayout><MutualFund /></CalculatorLayout>} />
          <Route path="/swp" element={<CalculatorLayout><SWPCalculator /></CalculatorLayout>} />
          <Route path="/emi" element={<CalculatorLayout><EMICalculator /></CalculatorLayout>} />
          <Route path="/loan-compare" element={<CalculatorLayout><LoanComparison /></CalculatorLayout>} />
          <Route path="/home-loan" element={<CalculatorLayout><HomeLoanCalculator /></CalculatorLayout>} />
          <Route path="/lumpsum" element={<CalculatorLayout><LumpsumCalculator /></CalculatorLayout>} />
          <Route path="/ppf" element={<CalculatorLayout><PPFCalculator /></CalculatorLayout>} />
          <Route path="/fd" element={<CalculatorLayout><FDCalculator /></CalculatorLayout>} />
          <Route path="/rd" element={<CalculatorLayout><RDCalculator /></CalculatorLayout>} />
          <Route path="/gratuity" element={<CalculatorLayout><GratuityCalculator /></CalculatorLayout>} />
          <Route path="/history" element={<CalculatorLayout><History /></CalculatorLayout>} />
          <Route path="/goal-planning" element={<CalculatorLayout><GoalPlanning /></CalculatorLayout>} />
          <Route path="/retirement-planner" element={<CalculatorLayout><RetirementPlanner /></CalculatorLayout>} />
          <Route path="/education-planner" element={<CalculatorLayout><EducationPlanner /></CalculatorLayout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
