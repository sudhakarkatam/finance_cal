import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, FileText, Info, Receipt } from 'lucide-react';
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { calculateIncomeTax, formatCurrency } from '@/lib/calculations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

const IncomeTaxCalculator = () => {
  // Basic Details
  const [financialYear, setFinancialYear] = useState<'2025-26' | '2024-25' | '2023-24'>('2025-26');
  const [ageCategory, setAgeCategory] = useState<'below60' | '60to79' | '80plus'>('below60');
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');

  // Income Details
  const [grossSalary, setGrossSalary] = useState(0);
  const [exemptAllowances, setExemptAllowances] = useState(0);
  const [interestIncome, setInterestIncome] = useState(0);
  const [rentalIncome, setRentalIncome] = useState(0);
  const [homeLoanInterestSelfOccupied, setHomeLoanInterestSelfOccupied] = useState(0);
  const [homeLoanInterestLetOut, setHomeLoanInterestLetOut] = useState(0);
  const [capitalGains, setCapitalGains] = useState(0);
  const [capitalGainsType, setCapitalGainsType] = useState<'STCG' | 'LTCG'>('LTCG');
  const [capitalGainsAssetType, setCapitalGainsAssetType] = useState<'equity' | 'property' | 'debt' | 'other'>('equity');
  const [cryptoIncome, setCryptoIncome] = useState(0);

  // Deductions
  const [section80C, setSection80C] = useState(0);
  const [section80CCD1B, setSection80CCD1B] = useState(0);
  const [section80D, setSection80D] = useState(0);
  const [section80DAdditional, setSection80DAdditional] = useState(0);
  const [section80G, setSection80G] = useState(0);
  const [section80E, setSection80E] = useState(0);
  const [section80TTA, setSection80TTA] = useState(0);
  const [section80EE, setSection80EE] = useState(0);
  const [section80EEA, setSection80EEA] = useState(0);
  const [section80U, setSection80U] = useState(0);

  // UI State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [additionalIncomeOpen, setAdditionalIncomeOpen] = useState(false);
  const [additionalDeductionsOpen, setAdditionalDeductionsOpen] = useState(false);
  const [infoDialogField, setInfoDialogField] = useState<string | null>(null);

  // Auto-calculate section 80TTA if interest income exists
  const auto80TTA = useMemo(() => {
    if (interestIncome > 0 && section80TTA === 0) {
      return Math.min(interestIncome, 10000);
    }
    return section80TTA;
  }, [interestIncome, section80TTA]);

  const result = useMemo(() => {
    return calculateIncomeTax({
      financialYear,
      ageCategory,
      taxRegime,
      grossSalary,
      exemptAllowances,
      interestIncome,
      rentalIncome,
      homeLoanInterestSelfOccupied,
      homeLoanInterestLetOut,
      capitalGains,
      capitalGainsType,
      capitalGainsAssetType,
      cryptoIncome,
      section80C,
      section80CCD1B,
      section80D,
      section80DAdditional,
      section80G,
      section80E,
      section80TTA: auto80TTA,
      section80EE,
      section80EEA,
      section80U,
    });
  }, [
    financialYear,
    ageCategory,
    taxRegime,
    grossSalary,
    exemptAllowances,
    interestIncome,
    rentalIncome,
    homeLoanInterestSelfOccupied,
    homeLoanInterestLetOut,
    capitalGains,
    capitalGainsType,
    capitalGainsAssetType,
    cryptoIncome,
    section80C,
    section80CCD1B,
    section80D,
    section80DAdditional,
    section80G,
    section80E,
    auto80TTA,
    section80EE,
    section80EEA,
    section80U,
  ]);

  const handleReset = () => {
    setFinancialYear('2025-26');
    setAgeCategory('below60');
    setTaxRegime('new');
    setGrossSalary(0);
    setExemptAllowances(0);
    setInterestIncome(0);
    setRentalIncome(0);
    setHomeLoanInterestSelfOccupied(0);
    setHomeLoanInterestLetOut(0);
    setCapitalGains(0);
    setCapitalGainsType('LTCG');
    setCapitalGainsAssetType('equity');
    setCryptoIncome(0);
    setSection80C(0);
    setSection80CCD1B(0);
    setSection80D(0);
    setSection80DAdditional(0);
    setSection80G(0);
    setSection80E(0);
    setSection80TTA(0);
    setSection80EE(0);
    setSection80EEA(0);
    setSection80U(0);
  };

  // Info Dialog Component
  const InfoIcon = ({ fieldName }: { fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => {
        setInfoDialogField(fieldName);
        setInfoDialogOpen(true);
      }}
    >
      <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
    </Button>
  );

  // Info Dialog Content Helper
  const getInfoContent = (fieldName: string) => {
    const infoContent: Record<string, JSX.Element> = {
      financialYear: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">What is Financial Year?</h3>
          <p className="text-muted-foreground">
            Financial Year (FY) is the 12-month period from April 1 to March 31 for which you earned income.
          </p>
          <p className="text-muted-foreground">
            Assessment Year (AY) is the year in which you file your tax return (next year after FY).
          </p>
          <p className="text-muted-foreground">
            <strong>Example:</strong> Income earned from April 1, 2025 to March 31, 2026 = FY 2025-26. You will file this income's tax return in AY 2026-27 (between April-July 2026).
          </p>
          <p className="text-muted-foreground">
            <strong>Simple Rule:</strong> Always select the year when you earned the income.
          </p>
        </div>
      ),
      ageCategory: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Why does age matter for tax?</h3>
          <p className="text-muted-foreground">
            Your age affects tax exemption limits and deduction benefits.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong>Below 60 (Regular):</strong> Standard tax slabs apply</li>
            <li><strong>60-79 (Senior Citizen):</strong> Higher exemption limit of ₹3 lakh (in old regime)</li>
            <li><strong>80+ (Super Senior):</strong> Highest exemption of ₹5 lakh (in old regime)</li>
          </ul>
          <p className="text-muted-foreground">
            Age is calculated as of March 31 of the financial year.
          </p>
        </div>
      ),
      taxRegime: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Old Regime vs New Regime</h3>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-2">NEW REGIME (Recommended for most):</p>
            <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300 text-xs">
              <li>Lower tax rates (up to ₹12 lakh is tax-free with rebate!)</li>
              <li>Simpler - no need to track deductions</li>
              <li>Standard deduction of ₹75,000 included</li>
              <li>Cannot claim 80C, 80D, HRA and most other deductions</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-2">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">OLD REGIME:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 text-xs">
              <li>Can claim all deductions (80C, 80D, HRA, home loan interest)</li>
              <li>Better if you have large investments/loans</li>
              <li>Higher tax rates</li>
              <li>Need proof of all investments</li>
            </ul>
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            <strong>How to decide:</strong> If your deductions &lt; ₹2.5 lakh → Choose New Regime. If you have home loan, large 80C investments → Calculate both and compare.
          </p>
        </div>
      ),
      grossSalary: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">What is Gross Salary?</h3>
          <p className="text-muted-foreground">
            Total salary BEFORE any deductions (PF, professional tax, TDS). Also called CTC (Cost to Company) or Annual Package.
          </p>
          <p className="text-muted-foreground">
            Includes: Basic salary + HRA + Special allowance + Bonuses + Other allowances
          </p>
          <p className="text-muted-foreground">
            <strong>Where to find it:</strong> Check your salary slip: Look for "Gross Salary" or "Total Earnings". Form 16 (from employer): Part B shows gross salary.
          </p>
          <p className="text-muted-foreground">
            <strong>Example:</strong> If you earn ₹50,000/month gross salary, Annual Gross Salary = ₹50,000 × 12 = ₹6,00,000
          </p>
        </div>
      ),
      exemptAllowances: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">What are Exempt Allowances?</h3>
          <p className="text-muted-foreground">
            These are parts of your salary that are TAX-FREE:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong>HRA:</strong> House Rent Allowance (if you pay rent)</li>
            <li><strong>LTA:</strong> Leave Travel Allowance (twice in 4 years)</li>
            <li><strong>Food Coupons:</strong> Up to ₹2,200/month (₹26,400/year)</li>
            <li><strong>Other exemptions:</strong> Children education allowance, uniform allowance, etc.</li>
          </ul>
          <p className="text-muted-foreground">
            Check your Form 16 Part B - it shows "Allowances to the extent exempt"
          </p>
        </div>
      ),
      interestIncome: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">What is Income from Interest?</h3>
          <p className="text-muted-foreground">
            Interest earned from savings accounts, fixed deposits (FDs), recurring deposits (RDs), and bonds.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong>Savings Account:</strong> Usually 2.5-4% per year</li>
            <li><strong>Fixed Deposits:</strong> Rates: 6-8% typically</li>
            <li><strong>Example:</strong> ₹5 lakh FD at 7% = ₹35,000 interest</li>
          </ul>
          <p className="text-muted-foreground">
            <strong>Where to find:</strong> Bank statements show interest credited. Form 26AS (on income tax portal) shows all interest income.
          </p>
          <p className="text-muted-foreground">
            <strong>Note:</strong> Interest &gt; ₹40,000 (₹50,000 for seniors): Bank deducts 10% TDS. All interest is taxable - even if TDS deducted, declare full amount.
          </p>
        </div>
      ),
      rentalIncome: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">What is Rental Income?</h3>
          <p className="text-muted-foreground">
            If you own property and rent it out, the rent received is taxable.
          </p>
          <p className="text-muted-foreground">
            <strong>Calculation Example:</strong> Rent received: ₹15,000/month = ₹1,80,000/year. Municipal taxes: ₹10,000. Net Annual Value: ₹1,70,000. Less: 30% deduction: ₹51,000. Income from House Property: ₹1,19,000.
          </p>
          <p className="text-muted-foreground">
            <strong>What to include:</strong> Monthly rent × 12 + Any advance rent (proportionate) + Maintenance charges (if kept by you).
          </p>
        </div>
      ),
      capitalGains: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">What are Capital Gains?</h3>
          <p className="text-muted-foreground">
            Profit from selling investments/assets.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong>Short-Term (STCG):</strong> Stocks/Equity MF: Less than 1 year. Property/Gold: Less than 2 years</li>
            <li><strong>Long-Term (LTCG):</strong> Stocks/Equity MF: More than 1 year. Property/Gold: More than 2 years</li>
          </ul>
          <p className="text-muted-foreground">
            <strong>Tax Rates:</strong> Equity LTCG: 10% on gains above ₹1,25,000 exemption (from FY 2025-26). Equity STCG: 15%. Property LTCG: 20% with indexation OR 12.5% without indexation.
          </p>
        </div>
      ),
      section80C: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80C - Basic Deductions</h3>
          <p className="text-muted-foreground">
            Maximum deduction: ₹1,50,000 per year. Most common tax-saving section.
          </p>
          <p className="text-muted-foreground">
            <strong>Eligible investments/expenses:</strong> PPF, ELSS mutual funds, life insurance premium, NSC, tax-saving FDs, principal repayment of home loan, Sukanya Samriddhi Yojana, EPF, tuition fees for children (max 2 children), etc.
          </p>
          <p className="text-muted-foreground">
            <strong>Important:</strong> Available only in Old Regime. Not allowed in New Regime.
          </p>
        </div>
      ),
      section80D: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80D - Health Insurance Premium</h3>
          <p className="text-muted-foreground">
            Deduction for health insurance premium paid for self, spouse, children, and parents.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li><strong>Self, Spouse, Children:</strong> Max ₹25,000 (₹50,000 if any member is senior citizen)</li>
            <li><strong>Parents:</strong> Max ₹25,000 (₹50,000 if parents are senior citizens)</li>
            <li><strong>Total limit:</strong> ₹1,00,000 if both you and parents are seniors</li>
          </ul>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Both New and Old Regime.
          </p>
        </div>
      ),
      section80CCD1B: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80CCD(1B) - NPS Additional</h3>
          <p className="text-muted-foreground">
            Additional deduction for NPS (National Pension System) contribution over and above the ₹1,50,000 limit of Section 80C.
          </p>
          <p className="text-muted-foreground">
            <strong>Maximum:</strong> ₹50,000 per year. This is in addition to the ₹1,50,000 under Section 80C.
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Both New and Old Regime.
          </p>
          <p className="text-muted-foreground">
            <strong>Benefit:</strong> If you contribute ₹2,00,000 to NPS, ₹1,50,000 goes to 80C and ₹50,000 goes to 80CCD(1B).
          </p>
        </div>
      ),
      section80EE: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80EE - First Home Loan Interest</h3>
          <p className="text-muted-foreground">
            Additional deduction for first-time homebuyers on home loan interest.
          </p>
          <p className="text-muted-foreground">
            <strong>Maximum:</strong> ₹50,000 per year. This is in addition to Section 24(b) deduction of ₹2,00,000.
          </p>
          <p className="text-muted-foreground">
            <strong>Conditions:</strong> Loan sanctioned between April 1, 2016 and March 31, 2017. Loan amount not exceeding ₹35 lakh. Property value not exceeding ₹50 lakh. First-time homebuyer.
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Old Regime only.
          </p>
        </div>
      ),
      section80EEA: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80EEA - Affordable Home Loan Interest</h3>
          <p className="text-muted-foreground">
            Additional deduction for affordable housing loan interest (applicable from FY 2019-20).
          </p>
          <p className="text-muted-foreground">
            <strong>Maximum:</strong> ₹1,50,000 per year. This is in addition to Section 24(b) deduction.
          </p>
          <p className="text-muted-foreground">
            <strong>Conditions:</strong> Loan sanctioned between April 1, 2019 and March 31, 2022. Property value not exceeding ₹45 lakh. First-time homebuyer. Stamp duty value not exceeding ₹45 lakh.
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Old Regime only.
          </p>
        </div>
      ),
      homeLoanInterestSelfOccupied: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Home Loan Interest Deduction (Self-Occupied)</h3>
          <p className="text-muted-foreground">
            If you have a home loan for a house you live in, you can claim interest deduction.
          </p>
          <p className="text-muted-foreground">
            <strong>Deduction Limits:</strong> Old Regime: Up to ₹2,00,000 per year. New Regime: NOT ALLOWED (except ₹1.5L if first home under 80EEA).
          </p>
          <p className="text-muted-foreground">
            <strong>Conditions:</strong> House should be self-occupied (you live in it). Loan must be from bank/housing finance company. Construction should be completed. Only interest component (not principal).
          </p>
          <p className="text-muted-foreground">
            <strong>Example:</strong> Monthly EMI: ₹30,000 (Interest: ₹12,000). Annual interest = ₹12,000 × 12 = ₹1,44,000 → Enter this amount.
          </p>
          <p className="text-muted-foreground">
            <strong>Where to find:</strong> Bank's annual interest certificate or loan statement shows interest paid.
          </p>
        </div>
      ),
      homeLoanInterestLetOut: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Home Loan Interest for Rented Property</h3>
          <p className="text-muted-foreground">
            If you own a property that's rented out and you have a loan on it, you can claim full interest deduction.
          </p>
          <p className="text-muted-foreground">
            <strong>Key Difference:</strong> NO LIMIT on interest deduction. Can claim full interest amount. Available in both old and new regime.
          </p>
          <p className="text-muted-foreground">
            <strong>How it works:</strong> Annual interest: ₹4,00,000. Rental income: ₹3,00,000. Net loss from house property: ₹1,00,000 (after 30% standard deduction). This loss reduces your total taxable income!
          </p>
          <p className="text-muted-foreground">
            <strong>Note:</strong> Maximum loss that can be set off: ₹2,00,000 per year. Excess loss can be carried forward for 8 years.
          </p>
        </div>
      ),
      cryptoIncome: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Cryptocurrency & Digital Asset Income</h3>
          <p className="text-muted-foreground">
            From April 1, 2022, income from virtual digital assets is taxable.
          </p>
          <p className="text-muted-foreground">
            <strong>What's included:</strong> Profit from selling Bitcoin, Ethereum, other cryptocurrencies, NFT sales profit, any other virtual digital asset gains.
          </p>
          <p className="text-muted-foreground">
            <strong>Tax Rate:</strong> 30% flat (highest rate!). No deductions allowed (not even purchase cost beyond sale price). Plus 4% cess = 31.2% total.
          </p>
          <p className="text-muted-foreground">
            <strong>Calculation:</strong> Bought Bitcoin: ₹5,00,000. Sold Bitcoin: ₹8,00,000. Profit: ₹3,00,000 → Enter this amount.
          </p>
          <p className="text-muted-foreground">
            <strong>Important Rules:</strong> TDS: 1% TDS deducted by exchange on all transactions. No loss set-off: Crypto losses can't reduce other income. Gift tax: Receiving crypto as gift is also taxable.
          </p>
        </div>
      ),
      section80DAdditional: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80D - Additional for Parents</h3>
          <p className="text-muted-foreground">
            Additional deduction for health insurance premium paid for parents.
          </p>
          <p className="text-muted-foreground">
            <strong>Maximum:</strong> ₹25,000 per year (₹50,000 if parents are senior citizens).
          </p>
          <p className="text-muted-foreground">
            <strong>Total Limit:</strong> Combined with self/family deduction, total can be up to ₹1,00,000 if both you and parents are senior citizens.
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Both New and Old Regime.
          </p>
          <p className="text-muted-foreground">
            <strong>Example:</strong> Self premium: ₹20,000. Parents premium: ₹30,000. Total deduction: ₹50,000 (if parents are seniors).
          </p>
        </div>
      ),
      section80G: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80G - Donations</h3>
          <p className="text-muted-foreground">
            Deduction for donations made to eligible charitable organizations and funds.
          </p>
          <p className="text-muted-foreground">
            <strong>Types:</strong> 100% deduction (donations to PM Relief Fund, National Defence Fund, etc.). 50% deduction (donations to registered trusts, NGOs, etc.).
          </p>
          <p className="text-muted-foreground">
            <strong>No Upper Limit:</strong> You can claim unlimited deduction for eligible donations.
          </p>
          <p className="text-muted-foreground">
            <strong>Conditions:</strong> Organization must be registered under Section 80G. You must have receipt and 80G certificate from the organization.
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Old Regime only.
          </p>
        </div>
      ),
      section80E: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80E - Education Loan Interest</h3>
          <p className="text-muted-foreground">
            Deduction for interest paid on education loan for higher studies (self, spouse, or children).
          </p>
          <p className="text-muted-foreground">
            <strong>Maximum:</strong> No upper limit! You can claim full interest amount.
          </p>
          <p className="text-muted-foreground">
            <strong>Conditions:</strong> Loan must be from bank or financial institution. Only for higher education (after 12th standard). Can be claimed for 8 years from the year interest starts being paid.
          </p>
          <p className="text-muted-foreground">
            <strong>Example:</strong> Annual interest: ₹60,000. You can claim full ₹60,000 deduction.
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Old Regime only.
          </p>
        </div>
      ),
      section80TTA: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80TTA/80TTB - Savings Interest Exemption</h3>
          <p className="text-muted-foreground">
            Deduction for interest earned on savings accounts and fixed deposits.
          </p>
          <p className="text-muted-foreground">
            <strong>Section 80TTA (Below 60 years):</strong> Maximum ₹10,000 per year for interest on savings account only.
          </p>
          <p className="text-muted-foreground">
            <strong>Section 80TTB (60+ years):</strong> Maximum ₹50,000 per year for interest on savings account, fixed deposits, and recurring deposits.
          </p>
          <p className="text-muted-foreground">
            <strong>Example:</strong> Savings interest: ₹15,000. Deduction: ₹10,000 (if below 60) or ₹15,000 (if 60+, but max ₹50,000).
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Old Regime only.
          </p>
        </div>
      ),
      section80U: (
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-2">Section 80U - Disability Deduction</h3>
          <p className="text-muted-foreground">
            Deduction for individuals with physical or mental disability.
          </p>
          <p className="text-muted-foreground">
            <strong>Deduction Amount:</strong> 40-80% disability: ₹75,000 per year. 80%+ severe disability: ₹1,25,000 per year.
          </p>
          <p className="text-muted-foreground">
            <strong>Conditions:</strong> Must have disability certificate from medical authority. Disability must be 40% or more. Available for taxpayer only (not dependents).
          </p>
          <p className="text-muted-foreground">
            <strong>Available in:</strong> Old Regime only.
          </p>
        </div>
      ),
    };
    return infoContent[fieldName] || <div className="text-sm text-muted-foreground">Info about {fieldName} - Please refer to official Income Tax Department website for details.</div>;
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Income Tax Calculator</h2>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setInfoDialogField('main');
                    setInfoDialogOpen(true);
                  }}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {infoDialogField === 'main' ? 'About Income Tax Calculator' : `About ${infoDialogField}`}
                  </DialogTitle>
                </DialogHeader>
                {infoDialogField === 'main' ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">What is Income Tax?</h3>
                      <p className="text-muted-foreground">
                        Income Tax is a direct tax levied by the Government of India on income earned by individuals, HUFs, and other entities during a financial year. It is governed by the Income Tax Act, 1961, and rules are updated annually through the Finance Act.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">New Tax Regime (FY 2025-26)</h3>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                        <p className="text-muted-foreground text-xs">
                          <strong>Standard Deduction:</strong> ₹75,000 (for salaried and pensioners)
                        </p>
                        <p className="text-muted-foreground text-xs">
                          <strong>Section 87A Rebate:</strong> Up to ₹60,000 rebate, making income up to ₹12 lakh effectively tax-free
                        </p>
                        <p className="text-muted-foreground text-xs">
                          <strong>Key Point:</strong> No other major deductions (like 80C investments, HRA, etc.) are allowed except NPS employer contributions and standard deduction
                        </p>
                        <p className="text-muted-foreground text-xs">
                          <strong>Tax-Free Income:</strong> After the standard deduction, income up to ₹12.75 lakh for salaried individuals is effectively tax-free
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Old Tax Regime</h3>
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
                        <p className="text-muted-foreground text-xs">
                          <strong>Standard Deduction:</strong> ₹50,000 (for salaried)
                        </p>
                        <p className="text-muted-foreground text-xs">
                          <strong>Section 87A Rebate:</strong> Up to ₹25,000 rebate for taxable income up to ₹7 lakh
                        </p>
                        <p className="text-muted-foreground text-xs">
                          <strong>All Deductions Available:</strong> Section 80C, 80D, HRA, home loan interest, and all other deductions can be claimed
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Frequently Asked Questions (FAQs)</h3>
                      <div className="space-y-3">
                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <p className="font-semibold text-foreground text-xs mb-1">Q1. Which regime should I choose?</p>
                          <p className="text-muted-foreground text-xs">
                            A: If your total deductions (80C, 80D, HRA, home loan interest, etc.) are less than ₹2.5 lakh, the New Regime is usually better. If you have significant investments and deductions, calculate both using this calculator and choose the one with lower tax.
                          </p>
                        </div>

                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <p className="font-semibold text-foreground text-xs mb-1">Q2. Is HRA available in New Regime?</p>
                          <p className="text-muted-foreground text-xs">
                            A: No, HRA exemption is not available in the New Regime. However, standard deduction of ₹75,000 is available, which may compensate for some taxpayers.
                          </p>
                        </div>

                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <p className="font-semibold text-foreground text-xs mb-1">Q3. What is Section 87A rebate?</p>
                          <p className="text-muted-foreground text-xs">
                            A: Section 87A provides tax rebate. In New Regime (FY 2025-26), if taxable income is up to ₹12 lakh, you get rebate up to ₹60,000 (or tax amount, whichever is less), making income effectively tax-free.
                          </p>
                        </div>

                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <p className="font-semibold text-foreground text-xs mb-1">Q4. Can I switch between regimes?</p>
                          <p className="text-muted-foreground text-xs">
                            A: Yes, you can choose a different regime each year while filing your return. However, once you opt for New Regime, you cannot claim deductions like 80C, HRA for that year.
                          </p>
                        </div>

                        <div className="bg-secondary/50 p-3 rounded-lg">
                          <p className="font-semibold text-foreground text-xs mb-1">Q5. What if my salary is ₹12.75 lakh in New Regime?</p>
                          <p className="text-muted-foreground text-xs">
                            A: After standard deduction of ₹75,000, taxable income is ₹12 lakh. With Section 87A rebate of ₹60,000, your tax becomes zero - effectively making ₹12.75 lakh income tax-free!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Examples to Understand Better</h3>
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-xs">Example 1: New Regime Tax-Free Income</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Situation:</strong> Annual salary = ₹12,75,000<br />
                            <strong>Standard Deduction:</strong> ₹75,000<br />
                            <strong>Taxable Income:</strong> ₹12,00,000<br />
                            <strong>Tax Before Rebate:</strong> ₹60,000 (5% of ₹4L-8L = ₹20,000 + 10% of ₹8L-12L = ₹40,000)<br />
                            <strong>Section 87A Rebate:</strong> ₹60,000 (full tax rebate)<br />
                            <strong>Final Tax:</strong> ₹0<br />
                            <strong>Result:</strong> Entire ₹12.75 lakh salary is tax-free!
                          </p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="font-semibold text-green-900 dark:text-green-100 mb-1 text-xs">Example 2: New Regime vs Old Regime Comparison</p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            <strong>Situation:</strong> Salary ₹15,00,000, Deductions: 80C (₹1,50,000), 80D (₹25,000), HRA (₹1,20,000)<br />
                            <strong>New Regime:</strong> Taxable = ₹14,25,000 (after ₹75K deduction), Tax = ₹1,62,500<br />
                            <strong>Old Regime:</strong> Taxable = ₹10,05,000 (after all deductions), Tax = ₹1,01,000<br />
                            <strong>Result:</strong> Old Regime saves ₹61,500 - Better choice!
                          </p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1 text-xs">Example 3: Minimal Deductions Scenario</p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            <strong>Situation:</strong> Salary ₹10,00,000, Only 80C (₹50,000), No HRA, No home loan<br />
                            <strong>New Regime:</strong> Taxable = ₹9,25,000, Tax = ₹21,250 (after ₹60K rebate = ₹0)<br />
                            <strong>Old Regime:</strong> Taxable = ₹8,25,000, Tax = ₹30,000<br />
                            <strong>Result:</strong> New Regime is better - saves ₹30,000!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  getInfoContent(infoDialogField || '')
                )}
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Financial Year</Label>
                  <InfoIcon fieldName="financialYear" />
                </div>
                <Select value={financialYear} onValueChange={(value: any) => setFinancialYear(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-26">FY 2025-26 (AY 2026-27)</SelectItem>
                    <SelectItem value="2024-25">FY 2024-25 (AY 2025-26)</SelectItem>
                    <SelectItem value="2023-24">FY 2023-24 (AY 2024-25)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Age Category</Label>
                  <InfoIcon fieldName="ageCategory" />
                </div>
                <Select value={ageCategory} onValueChange={(value: any) => setAgeCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below60">Below 60 (Regular Citizen)</SelectItem>
                    <SelectItem value="60to79">60-79 (Senior Citizen)</SelectItem>
                    <SelectItem value="80plus">80+ (Super Senior Citizen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Tax Regime</Label>
                  <InfoIcon fieldName="taxRegime" />
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={taxRegime === 'new'}
                      onCheckedChange={(checked) => setTaxRegime(checked ? 'new' : 'old')}
                    />
                    <Label className={taxRegime === 'new' ? 'font-semibold' : ''}>
                      New Regime (Section 115BAC)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={taxRegime === 'old'}
                      onCheckedChange={(checked) => setTaxRegime(checked ? 'old' : 'new')}
                    />
                    <Label className={taxRegime === 'old' ? 'font-semibold' : ''}>
                      Old Regime
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  The calculator will compute tax for both regimes. You can choose your preferred regime, but the Summary tab shows comparison.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="income" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Gross Salary Income</Label>
                  <InfoIcon fieldName="grossSalary" />
                </div>
                <CalculatorInput
                  label=""
                  value={grossSalary}
                  onChange={setGrossSalary}
                  min={0}
                  max={50000000}
                  step={1000}
                  prefix="₹"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Exempt Allowances (HRA, LTA, Food Coupons)</Label>
                  <InfoIcon fieldName="exemptAllowances" />
                </div>
                <CalculatorInput
                  label=""
                  value={exemptAllowances}
                  onChange={setExemptAllowances}
                  min={0}
                  max={5000000}
                  step={1000}
                  prefix="₹"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Income from Interest</Label>
                  <InfoIcon fieldName="interestIncome" />
                </div>
                <CalculatorInput
                  label=""
                  value={interestIncome}
                  onChange={setInterestIncome}
                  min={0}
                  max={10000000}
                  step={1000}
                  prefix="₹"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Rental Income</Label>
                  <InfoIcon fieldName="rentalIncome" />
                </div>
                <CalculatorInput
                  label=""
                  value={rentalIncome}
                  onChange={setRentalIncome}
                  min={0}
                  max={10000000}
                  step={1000}
                  prefix="₹"
                />
              </div>

              <Collapsible open={additionalIncomeOpen} onOpenChange={setAdditionalIncomeOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="font-medium">Additional Income (Optional)</span>
                    {additionalIncomeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Home Loan Interest - Self Occupied</Label>
                      <InfoIcon fieldName="homeLoanInterestSelfOccupied" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={homeLoanInterestSelfOccupied}
                      onChange={setHomeLoanInterestSelfOccupied}
                      min={0}
                      max={5000000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Home Loan Interest - Let Out</Label>
                      <InfoIcon fieldName="homeLoanInterestLetOut" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={homeLoanInterestLetOut}
                      onChange={setHomeLoanInterestLetOut}
                      min={0}
                      max={10000000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Capital Gains</Label>
                      <InfoIcon fieldName="capitalGains" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={capitalGains}
                      onChange={setCapitalGains}
                      min={0}
                      max={50000000}
                      step={1000}
                      prefix="₹"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={capitalGainsType} onValueChange={(value: any) => setCapitalGainsType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Gains Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STCG">Short-Term (STCG)</SelectItem>
                          <SelectItem value="LTCG">Long-Term (LTCG)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={capitalGainsAssetType} onValueChange={(value: any) => setCapitalGainsAssetType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Asset Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equity">Equity/Shares</SelectItem>
                          <SelectItem value="property">Property</SelectItem>
                          <SelectItem value="debt">Debt Funds</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Income from Digital Assets/Crypto</Label>
                      <InfoIcon fieldName="cryptoIncome" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={cryptoIncome}
                      onChange={setCryptoIncome}
                      min={0}
                      max={50000000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Section 80C (max ₹1,50,000)</Label>
                  <InfoIcon fieldName="section80C" />
                </div>
                <CalculatorInput
                  label=""
                  value={section80C}
                  onChange={setSection80C}
                  min={0}
                  max={150000}
                  step={1000}
                  prefix="₹"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Section 80D - Health Insurance Premium</Label>
                  <InfoIcon fieldName="section80D" />
                </div>
                <CalculatorInput
                  label=""
                  value={section80D}
                  onChange={setSection80D}
                  min={0}
                  max={50000}
                  step={1000}
                  prefix="₹"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Standard Deduction:</strong> ₹75,000 (New Regime) / ₹50,000 (Old Regime) - Auto-calculated for salary income
                </p>
              </div>

              <Collapsible open={additionalDeductionsOpen} onOpenChange={setAdditionalDeductionsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="font-medium">Additional Deductions (Optional)</span>
                    {additionalDeductionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80CCD(1B) - NPS Additional (max ₹50,000)</Label>
                      <InfoIcon fieldName="section80CCD1B" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80CCD1B}
                      onChange={setSection80CCD1B}
                      min={0}
                      max={50000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80D - Additional for Parents</Label>
                      <InfoIcon fieldName="section80DAdditional" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80DAdditional}
                      onChange={setSection80DAdditional}
                      min={0}
                      max={50000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80G - Donations</Label>
                      <InfoIcon fieldName="section80G" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80G}
                      onChange={setSection80G}
                      min={0}
                      max={10000000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80E - Education Loan Interest</Label>
                      <InfoIcon fieldName="section80E" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80E}
                      onChange={setSection80E}
                      min={0}
                      max={10000000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80TTA/TTB - Savings Interest</Label>
                      <InfoIcon fieldName="section80TTA" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80TTA}
                      onChange={setSection80TTA}
                      min={0}
                      max={ageCategory === '60to79' || ageCategory === '80plus' ? 50000 : 10000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80EE - First Home (max ₹50,000)</Label>
                      <InfoIcon fieldName="section80EE" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80EE}
                      onChange={setSection80EE}
                      min={0}
                      max={50000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80EEA - Affordable Home (max ₹1,50,000)</Label>
                      <InfoIcon fieldName="section80EEA" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80EEA}
                      onChange={setSection80EEA}
                      min={0}
                      max={150000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Section 80U - Disability</Label>
                      <InfoIcon fieldName="section80U" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={section80U}
                      onChange={setSection80U}
                      min={0}
                      max={125000}
                      step={1000}
                      prefix="₹"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4">Tax Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Gross Total Income</p>
                    <p className="text-lg font-bold">{formatCurrency(result.grossTotalIncome)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Taxable Income (New Regime)</p>
                    <p className="text-lg font-bold">{formatCurrency(result.taxableIncomeNew)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Taxable Income (Old Regime)</p>
                    <p className="text-lg font-bold">{formatCurrency(result.taxableIncomeOld)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Deductions (New Regime)</p>
                    <p className="text-lg font-bold">{formatCurrency(result.totalDeductionsNew)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Deductions (Old Regime)</p>
                    <p className="text-lg font-bold">{formatCurrency(result.totalDeductionsOld)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card className={`p-4 ${result.recommendation === 'new' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-secondary/50'}`}>
                    <h4 className="font-semibold mb-2">New Regime Tax</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Tax (before rebate):</span>
                        <span>{formatCurrency(result.taxNew)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rebate (87A):</span>
                        <span>-{formatCurrency(result.rebateNew)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Surcharge:</span>
                        <span>{formatCurrency(result.surchargeNew)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cess (4%):</span>
                        <span>{formatCurrency(result.cessNew)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total Tax:</span>
                        <span>{formatCurrency(result.totalTaxNew)}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className={`p-4 ${result.recommendation === 'old' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-secondary/50'}`}>
                    <h4 className="font-semibold mb-2">Old Regime Tax</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Tax (before rebate):</span>
                        <span>{formatCurrency(result.taxOld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rebate (87A):</span>
                        <span>-{formatCurrency(result.rebateOld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Surcharge:</span>
                        <span>{formatCurrency(result.surchargeOld)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cess (4%):</span>
                        <span>{formatCurrency(result.cessOld)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total Tax:</span>
                        <span>{formatCurrency(result.totalTaxOld)}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className={`p-4 mt-4 ${result.recommendation === 'new' ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700' : 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'}`}>
                  <h4 className="font-semibold mb-2">Recommendation</h4>
                  <p className="text-sm">
                    <strong>{result.recommendation === 'new' ? 'New Regime' : 'Old Regime'}</strong> is better for you.
                    {result.taxSavings > 0 && (
                      <span> You can save {formatCurrency(result.taxSavings)} by choosing {result.recommendation === 'new' ? 'New' : 'Old'} Regime.</span>
                    )}
                  </p>
                </Card>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="incometax"
        inputs={{
          financialYear,
          ageCategory,
          taxRegime,
          grossSalary,
          exemptAllowances,
          interestIncome,
          rentalIncome,
          homeLoanInterestSelfOccupied,
          homeLoanInterestLetOut,
          capitalGains,
          capitalGainsType,
          capitalGainsAssetType,
          cryptoIncome,
          section80C,
          section80CCD1B,
          section80D,
          section80DAdditional,
          section80G,
          section80E,
          section80TTA: auto80TTA,
          section80EE,
          section80EEA,
          section80U,
        }}
        results={{
          grossTotalIncome: result.grossTotalIncome,
          taxableIncomeNew: result.taxableIncomeNew,
          taxableIncomeOld: result.taxableIncomeOld,
          totalDeductionsNew: result.totalDeductionsNew,
          totalDeductionsOld: result.totalDeductionsOld,
          taxNew: result.taxNew,
          taxOld: result.taxOld,
          rebateNew: result.rebateNew,
          rebateOld: result.rebateOld,
          surchargeNew: result.surchargeNew,
          surchargeOld: result.surchargeOld,
          cessNew: result.cessNew,
          cessOld: result.cessOld,
          totalTaxNew: result.totalTaxNew,
          totalTaxOld: result.totalTaxOld,
          taxSavings: result.taxSavings,
        }}
      />
    </div>
  );
};

export default IncomeTaxCalculator;

