import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Info, Receipt, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CalculatorInput from '@/components/ui/CalculatorInput';
import SaveDialog from '@/components/SaveDialog';
import { calculateIncomeTax } from '@/lib/calculations';
import { useCurrency } from '@/hooks/useCurrency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { NEW_REGIME_SLABS, OLD_REGIME_SLABS } from '@/lib/taxConstants';


const TaxSlabsTable = ({ slabs, title }: { slabs: Array<{ min: number; max: number; rate: number }>, title: string }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted p-3 border-b font-semibold text-sm">{title}</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Income Range</TableHead>
            <TableHead className="text-right">Tax Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slabs.map((slab, i) => (
            <TableRow key={i}>
              <TableCell className="text-xs">
                {formatAmount(slab.min)} - {slab.max === Infinity ? 'Above' : formatAmount(slab.max)}
              </TableCell>
              <TableCell className="text-right text-xs">{slab.rate}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};



const IncomeTaxCalculator = () => {
  const symbol = "₹";
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  // Basic Details

  const [financialYear, setFinancialYear] = useState<'2025-26' | '2024-25'>('2025-26');
  const [ageCategory, setAgeCategory] = useState<'below60' | '60to79' | '80plus'>('below60');
  const [employmentType, setEmploymentType] = useState<'salaried' | 'business'>('salaried');

  // Income Details
  const [grossSalary, setGrossSalary] = useState(0);
  const [exemptAllowances, setExemptAllowances] = useState(0);
  const [hraExemption, setHraExemption] = useState(0); // Specific HRA input

  // Business Income Details
  const [businessIncomeType, setBusinessIncomeType] = useState<'44AD' | '44ADA' | 'regular'>('44AD');
  const [businessTurnover, setBusinessTurnover] = useState(0);
  const [businessCashTurnover, setBusinessCashTurnover] = useState(0);
  const [businessGrossReceipts, setBusinessGrossReceipts] = useState(0);
  const [businessNetProfit, setBusinessNetProfit] = useState(0); // For regular business
  const [businessExpenses, setBusinessExpenses] = useState(0);

  const [interestIncome, setInterestIncome] = useState(0);
  const [rentalIncome, setRentalIncome] = useState(0);
  const [homeLoanInterestSelfOccupied, setHomeLoanInterestSelfOccupied] = useState(0);
  const [homeLoanInterestLetOut, setHomeLoanInterestLetOut] = useState(0);

  // Capital Gains
  const [equityLTCG, setEquityLTCG] = useState(0);
  const [equitySTCG, setEquitySTCG] = useState(0);
  const [propertyLTCG, setPropertyLTCG] = useState(0);
  const [otherGains, setOtherGains] = useState(0);

  const [cryptoIncome, setCryptoIncome] = useState(0);

  // Deductions
  const [section80C, setSection80C] = useState(0);
  const [section80CCD1B, setSection80CCD1B] = useState(0);
  const [section80CCD2, setSection80CCD2] = useState(0); // Employer NPS
  const [section80D, setSection80D] = useState(0);
  const [section80DAdditional, setSection80DAdditional] = useState(0);
  const [section80G, setSection80G] = useState(0);
  const [section80E, setSection80E] = useState(0);
  const [section80TTA, setSection80TTA] = useState(0);
  const [section80TTB, setSection80TTB] = useState(0); // Senior Citizen Interest
  const [section80EE, setSection80EE] = useState(0);
  const [section80EEA, setSection80EEA] = useState(0);
  const [section80U, setSection80U] = useState(0);
  const [otherDeductionsNew, setOtherDeductionsNew] = useState(0);
  const [otherDeductionsOld, setOtherDeductionsOld] = useState(0);
  const [section80GG, setSection80GG] = useState(0);

  // UI State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoDialogField, setInfoDialogField] = useState<string | null>(null);

  // Collapsible Sections State
  const [incomeOpen, setIncomeOpen] = useState(true);
  const [deductionsOpen, setDeductionsOpen] = useState(false); // Collapsed by default
  const [capitalGainsOpen, setCapitalGainsOpen] = useState(false);

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
      taxRegime: 'new',
      employmentType,
      businessIncome: {
        type: businessIncomeType,
        turnover: businessTurnover,
        cashTurnover: businessCashTurnover,
        grossReceipts: businessGrossReceipts,
        expenses: businessExpenses,
        netProfit: businessNetProfit,
      },
      grossSalary,
      exemptAllowances,
      hraExemption,
      interestIncome,
      rentalIncome,
      homeLoanInterestSelfOccupied,
      homeLoanInterestLetOut,
      capitalGains: {
        equityLTCG,
        equitySTCG,
        propertyLTCG,
        otherGains,
      },
      cryptoIncome,
      section80C,
      section80CCD1B,
      section80CCD2,
      section80D,
      section80DAdditional,
      section80G,
      section80E,
      section80TTA: auto80TTA,
      section80TTB,
      section80EE,
      section80EEA,
      section80U,
      otherDeductionsNew,
      otherDeductionsOld: otherDeductionsOld + section80GG,
    });
  }, [
    financialYear,
    ageCategory,
    employmentType,
    businessIncomeType,
    businessTurnover,
    businessCashTurnover,
    businessGrossReceipts,
    businessExpenses,
    businessNetProfit,
    grossSalary,
    exemptAllowances,
    hraExemption,
    interestIncome,
    rentalIncome,
    homeLoanInterestSelfOccupied,
    homeLoanInterestLetOut,
    equityLTCG,
    equitySTCG,
    propertyLTCG,
    otherGains,
    cryptoIncome,
    section80C,
    section80CCD1B,
    section80CCD2,
    section80D,
    section80DAdditional,
    section80G,
    section80E,
    auto80TTA,
    section80TTB,
    section80EE,
    section80EEA,
    section80U,
    otherDeductionsNew,
    otherDeductionsOld,
    section80GG,
  ]);



  const handleReset = () => {
    setFinancialYear('2025-26');
    setAgeCategory('below60');
    setEmploymentType('salaried');
    setGrossSalary(0);
    setExemptAllowances(0);
    setHraExemption(0);
    setBusinessTurnover(0);
    setBusinessCashTurnover(0);
    setBusinessGrossReceipts(0);
    setBusinessExpenses(0);
    setBusinessNetProfit(0);
    setInterestIncome(0);
    setRentalIncome(0);
    setHomeLoanInterestSelfOccupied(0);
    setHomeLoanInterestLetOut(0);
    setEquityLTCG(0);
    setEquitySTCG(0);
    setPropertyLTCG(0);
    setOtherGains(0);
    setCryptoIncome(0);
    setSection80C(0);
    setSection80CCD1B(0);
    setSection80CCD2(0);
    setSection80D(0);
    setSection80DAdditional(0);
    setSection80G(0);
    setSection80E(0);
    setSection80TTA(0);
    setSection80TTB(0);
    setSection80EE(0);
    setSection80EEA(0);
    setSection80U(0);
    setOtherDeductionsNew(0);
    setOtherDeductionsOld(0);
    setSection80GG(0);
  };

  // Info Icon Component
  const InfoIcon = ({ fieldName }: { fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 ml-1 inline-flex"
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
    const contentMap: Record<string, JSX.Element> = {
      financialYear: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> The Financial Year (FY) is the 12-month period from <strong>April 1st to March 31st</strong> of the following year in which you earn your income. The year immediately following the Financial Year is called the <strong>Assessment Year (AY)</strong>, in which you file your returns and your income is assessed.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Current Context:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>FY 2024-25 (AY 2025-26):</strong> Current ongoing year. Income earned between April 1, 2024, and March 31, 2025.</li>
              <li><strong>FY 2025-26 (AY 2026-27):</strong> Upcoming financial year. Income earned between April 1, 2025, and March 31, 2026.</li>
            </ul>
          </div>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1 text-primary">Advance Tax Deadlines:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>June 15:</strong> 15% of tax liability.</li>
              <li><strong>Sept 15:</strong> 45% of tax liability.</li>
              <li><strong>Dec 15:</strong> 75% of tax liability.</li>
              <li><strong>Mar 15:</strong> 100% of tax liability.</li>
            </ul>
            <p className="text-xs mt-2 text-muted-foreground">Note: Senior Citizens (&gt;60) without business income are exempt. Presumptive Taxation (44AD/ADA) users pay 100% by Mar 15.</p>
          </div>
        </div>
      ),
      grossSalary: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> This is your <strong>Total Salary</strong> before any deductions are made. It is the sum of all components listed in your salary slip.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Components Include:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Basic Salary & Dearness Allowance (DA)</li>
              <li>House Rent Allowance (HRA)</li>
              <li>Special Allowances (Conveyance, Medical, etc.)</li>
              <li>Bonus / Performance Pay</li>
            </ul>
          </div>
          <p><strong>Standard Deduction:</strong> A flat deduction of <strong>₹50,000</strong> (Old Regime) or <strong>₹75,000</strong> (New Regime) is automatically subtracted from your Gross Salary.</p>
        </div>
      ),
      exemptAllowances: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Specific allowances granted by your employer that are <strong>exempt from tax</strong> under Section 10. Mostly available <strong>only under the Old Tax Regime</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Key Allowances:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>LTA:</strong> Travel costs within India (Air/Rail). Limited to 2 journeys in a block of 4 years (Current: 2022-25).</li>
              <li><strong>Children Education:</strong> ₹100/month per child (max 2).</li>
              <li><strong>Hostel Allowance:</strong> ₹300/month per child (max 2).</li>
              <li><strong>Uniform/Books:</strong> Actual expenditure incurred.</li>
            </ul>
          </div>
        </div>
      ),
      hraExemption: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Tax exemption on House Rent Allowance (HRA) received from employer. <strong>Available only in Old Regime</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Exemption Rule (Least of):</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Actual HRA Received.</li>
              <li>Actual Rent Paid - 10% of Salary (Basic + DA).</li>
              <li>50% of Salary (Metro) OR 40% of Salary (Non-Metro).</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground">Condition: You must actually pay rent and provide receipts (and Landlord's PAN if rent &gt; ₹1 Lakh/year).</p>
        </div>
      ),
      businessIncome: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Presumptive taxation scheme for small taxpayers to reduce compliance burden.</p>
          <div className="grid gap-3">
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-semibold text-primary mb-1">Section 44AD (Business)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Limit:</strong> Turnover up to ₹2 Cr (₹3 Cr if cash receipts &lt; 5%).</li>
                <li><strong>Taxable Income:</strong> 8% of turnover (6% for digital receipts).</li>
              </ul>
            </div>
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-semibold text-primary mb-1">Section 44ADA (Professionals)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Limit:</strong> Gross Receipts up to ₹50 Lakhs (₹75 Lakhs if cash receipts &lt; 5%).</li>
                <li><strong>Taxable Income:</strong> 50% of gross receipts.</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm border border-red-200 dark:border-red-900">
              <p className="font-semibold text-red-600 dark:text-red-400 mb-1">Tax Audit Limits (Section 44AB):</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Business:</strong> Turnover &gt; ₹1 Cr (₹10 Cr if &lt;5% cash txns).</li>
                <li><strong>Profession:</strong> Gross Receipts &gt; ₹50 Lakhs.</li>
                <li><strong>Presumptive:</strong> If income declared is less than presumptive rate (8%/6% or 50%) AND total income &gt; Basic Exemption Limit.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      interestIncome: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Income earned from money kept in bank accounts or deposits.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li><strong>Savings Interest:</strong> Taxable (Deduction u/s 80TTA/80TTB available).</li>
            <li><strong>FD/RD Interest:</strong> Fully taxable at slab rate. TDS applies if interest &gt; ₹40k (₹50k for seniors).</li>
          </ul>
          <p className="text-xs text-muted-foreground">This is added to "Income from Other Sources".</p>
        </div>
      ),
      rentalIncome: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Income earned from letting out a house property.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Calculation:</p>
            <p>Gross Rent - Municipal Taxes = <strong>Net Annual Value (NAV)</strong></p>
            <p className="mt-2"><strong>Deductions allowed:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Standard Deduction: Flat 30% of NAV.</li>
              <li>Interest on Home Loan (Full interest deductible for let-out).</li>
            </ul>
          </div>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1 text-primary">Loss Set-off Rules:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Loss from House Property can be set off against other heads (Salary, etc.) up to <strong>₹2 Lakhs</strong> in the same year (Old Regime Only).</li>
              <li>Unadjusted loss can be carried forward for <strong>8 years</strong> (set off only against House Property income).</li>
            </ul>
          </div>
        </div>
      ),
      capitalGains: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Profit from sale of Capital Assets (Stocks, Property, Gold).</p>
          <div className="grid gap-3">
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-semibold text-primary mb-1">Equity (Stocks/MFs) - New Rules (July '24)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>STCG (&lt;12 months):</strong> 20% Tax.</li>
                <li><strong>LTCG (&gt;12 months):</strong> 12.5% Tax. (Exempt up to ₹1.25 Lakhs/year).</li>
              </ul>
              <p className="text-xs mt-2 font-medium">Grandfathering Clause:</p>
              <p className="text-xs text-muted-foreground">Gains accrued up to <strong>Jan 31, 2018</strong> are tax-exempt. Cost of Acquisition = Higher of (Actual Cost) vs (Lower of FMV on 31-Jan-2018 & Sale Price).</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-semibold text-primary mb-1">Set-off & Carry Forward</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>STCL:</strong> Can be set off against both STCG and LTCG.</li>
                <li><strong>LTCL:</strong> Can be set off <em>only</em> against LTCG.</li>
                <li><strong>Carry Forward:</strong> Unadjusted losses can be carried forward for <strong>8 years</strong> (if ITR filed on time).</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      equityLTCG: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Long Term Capital Gains from Equity Shares or Equity Mutual Funds held for <strong>more than 12 months</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Tax Rules:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Exemption:</strong> First ₹1.25 Lakhs of gains in a year are tax-free.</li>
              <li><strong>Tax Rate:</strong> 12.5% on gains above ₹1.25 Lakhs.</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>You bought shares for ₹2 Lakhs and sold them after 2 years for ₹4 Lakhs.</p>
            <p className="mt-1"><strong>Gain:</strong> ₹2 Lakhs.</p>
            <p><strong>Taxable:</strong> ₹2L - ₹1.25L = ₹75,000.</p>
            <p><strong>Tax:</strong> 12.5% of ₹75,000 = ₹9,375.</p>
          </div>
        </div>
      ),
      equitySTCG: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Short Term Capital Gains from Equity Shares or Equity Mutual Funds held for <strong>less than 12 months</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Tax Rules:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Tax Rate:</strong> Flat 20% on the entire gain amount.</li>
              <li>No basic exemption limit applies specifically to this (unless total income is below taxable limit).</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>You bought shares for ₹1 Lakh and sold them after 6 months for ₹1.5 Lakhs.</p>
            <p className="mt-1"><strong>Gain:</strong> ₹50,000.</p>
            <p><strong>Tax:</strong> 20% of ₹50,000 = ₹10,000.</p>
          </div>
        </div>
      ),
      propertyLTCG: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Long Term Capital Gains from Property, Gold, or other assets held for <strong>more than 24 months</strong> (Property) or <strong>36 months</strong> (Gold/Others).</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">New Rules (Budget 2024):</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Tax Rate:</strong> 12.5% without indexation benefit.</li>
              <li><strong>Option:</strong> For properties bought before July 23, 2024, you can choose 20% with indexation if it lowers tax.</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>Bought a plot for ₹50 Lakhs in 2020. Sold for ₹80 Lakhs in 2025.</p>
            <p className="mt-1"><strong>Gain:</strong> ₹30 Lakhs.</p>
            <p><strong>Tax:</strong> 12.5% of ₹30 Lakhs = ₹3.75 Lakhs.</p>
          </div>
        </div>
      ),
      otherGains: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Gains that are added to your total income and taxed at your applicable <strong>Slab Rate</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Includes:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Debt Mutual Funds:</strong> (Bought after Apr 1, 2023) - Always Short Term.</li>
              <li><strong>Short Term Capital Gains:</strong> On Property/Gold (held &lt; 24/36 months).</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>You earned ₹50,000 profit from a Debt Fund held for 3 years.</p>
            <p className="mt-1">This ₹50,000 is added to your Salary/Business income.</p>
            <p>If you are in the 30% slab, you pay <strong>30% tax</strong> on this gain.</p>
          </div>
        </div>
      ),
      section80C: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Primary tax-saving deduction. <strong>Old Regime Only</strong>.</p>
          <p><strong>Limit:</strong> Max <strong>₹1.5 Lakhs</strong> per financial year.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Eligible Investments:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>EPF, PPF & Senior Citizens Savings Scheme (SCSS)</li>
              <li>ELSS Mutual Funds (3yr lock-in)</li>
              <li>Life Insurance Premiums</li>
              <li>Home Loan Principal Repayment & Stamp Duty</li>
              <li>Tuition Fees (Max 2 children)</li>
              <li>Sukanya Samriddhi Yojana (SSY)</li>
            </ul>
          </div>
        </div>
      ),
      section80CCD1B: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Additional deduction for voluntary contribution to NPS Tier I. <strong>Old Regime Only</strong>.</p>
          <p><strong>Limit:</strong> <strong>₹50,000</strong> (Over and above the ₹1.5L limit of 80C).</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>If you invest ₹50,000 in NPS Tier 1 voluntarily, you can claim this <strong>in addition</strong> to your ₹1.5 Lakh 80C limit.</p>
            <p className="mt-1">Total Deduction possible: ₹1.5L (80C) + ₹50k (80CCD1B) = <strong>₹2 Lakhs</strong>.</p>
          </div>
        </div>
      ),
      section80CCD2: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Employer's contribution to employee's NPS account. <strong>Available in BOTH Regimes</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Limits:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Private Sector:</strong> 10% of Salary (Basic + DA).</li>
              <li><strong>Govt Sector:</strong> 14% of Salary.</li>
              <li><em>Note: Budget 2025 proposes 14% for all in New Regime.</em></li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>Your Basic + DA is ₹10 Lakhs. Your employer puts ₹1 Lakh (10%) into your NPS.</p>
            <p className="mt-1">This ₹1 Lakh is <strong>fully deductible</strong> in both Old and New Regimes.</p>
          </div>
        </div>
      ),
      section80D: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Deduction for Health Insurance Premium. <strong>Old Regime Only</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Deduction Limits:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Self & Family:</strong> ₹25,000 (₹50,000 if Senior Citizen).</li>
              <li><strong>Parents:</strong> Additional ₹25,000 (₹50,000 if Senior Citizen).</li>
              <li><strong>Preventive Checkup:</strong> Up to ₹5,000 (within the above limits).</li>
            </ul>
            <p className="text-xs mt-2 text-muted-foreground">Note: Critical Illness Riders are also eligible for deduction.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>You pay ₹20,000 for your family and ₹40,000 for your senior citizen parents.</p>
            <p className="mt-1"><strong>Total Deduction:</strong> ₹20,000 + ₹40,000 = <strong>₹60,000</strong>.</p>
          </div>
        </div>
      ),
      homeLoanInterestSelfOccupied: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Deduction on interest paid on home loan for self-occupied property (Section 24). <strong>Old Regime Only</strong>.</p>
          <p><strong>Limit:</strong> Max <strong>₹2 Lakhs</strong> per financial year.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>Your Home Loan EMI is ₹40,000. Total interest paid in the year is ₹3.5 Lakhs.</p>
            <p className="mt-1">You can claim a maximum deduction of <strong>₹2 Lakhs</strong>.</p>
            <p>The remaining ₹1.5 Lakhs interest is lost (cannot be carried forward for self-occupied).</p>
          </div>
        </div>
      ),
      section80TTA: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Deduction on Savings Account interest. <strong>Old Regime Only</strong>.</p>
          <p><strong>Who:</strong> Individuals below 60 years & HUF.</p>
          <p><strong>Limit:</strong> Max <strong>₹10,000</strong>.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>You earned ₹12,000 interest from your Savings Bank account.</p>
            <p className="mt-1">You can claim <strong>₹10,000</strong> as deduction.</p>
            <p>The remaining ₹2,000 is taxable.</p>
          </div>
        </div>
      ),
      section80TTB: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Deduction on interest from <strong>All Deposits</strong> (Savings, FD, RD). <strong>Old Regime Only</strong>.</p>
          <p><strong>Who:</strong> Senior Citizens (60 years and above).</p>
          <p><strong>Limit:</strong> Max <strong>₹50,000</strong>.</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>A senior citizen earns ₹40,000 from FD interest and ₹5,000 from Savings interest.</p>
            <p className="mt-1">Total Interest: ₹45,000.</p>
            <p>Since it is within the ₹50,000 limit, the <strong>entire ₹45,000 is tax-free</strong>.</p>
          </div>
        </div>
      ),
      section80G: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Deduction for donations to charitable funds. <strong>Old Regime Only</strong>.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Limits:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>100% Deduction:</strong> PM Relief Fund, PM CARES, National Defence Fund.</li>
              <li><strong>50% Deduction:</strong> Most private charitable trusts (subject to 10% of income cap).</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example:</p>
            <p>You donate ₹10,000 to the Prime Minister's National Relief Fund.</p>
            <p className="mt-1">You can claim the <strong>full ₹10,000</strong> as a deduction.</p>
          </div>
        </div>
      ),
      otherDeductionsOld: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Other miscellaneous deductions available under the Old Regime.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Common Sections:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Section 80E:</strong> Interest on Education Loan (No upper limit, for 8 years).</li>
              <li><strong>Section 80DD/80U:</strong> Deduction for disability (₹75k or ₹1.25L).</li>
              <li><strong>Section 80GG:</strong> Rent paid if HRA not received (Max ₹60k/year).</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example (80E):</p>
            <p>You paid ₹1.2 Lakhs as interest on your education loan this year.</p>
            <p className="mt-1">You can claim the <strong>entire ₹1.2 Lakhs</strong> as a deduction.</p>
          </div>
        </div>
      ),
      otherDeductionsNew: (
        <div className="space-y-3">
          <p><strong>What is it?</strong> Very limited deductions available under the New Tax Regime.</p>
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <p className="font-semibold mb-1">Eligible Deductions:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Section 80CCH(2):</strong> Contribution to Agnipath Scheme (Corpus Fund).</li>
              <li><strong>Family Pension:</strong> Deduction of ₹15,000 or 1/3rd of pension (whichever is lower).</li>
              <li><strong>Divyangjan:</strong> Transport allowance for specially-abled employees.</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-900">
            <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Example (Family Pension):</p>
            <p>You receive ₹60,000 as family pension.</p>
            <p className="mt-1">Deduction is lower of ₹15,000 or ₹20,000 (1/3rd).</p>
            <p>So, you can claim <strong>₹15,000</strong> deduction.</p>
          </div>
        </div>
      ),
    };

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg capitalize">{fieldName.replace(/([A-Z])/g, ' $1').trim()}</h3>
        <div className="text-sm text-muted-foreground">
          {contentMap[fieldName] || <p>Information about {fieldName}.</p>}
        </div>
      </div>
    );
  };

  const comparisonData = [
    { label: "Gross Salary", old: result.oldRegime.grossSalary, new: result.newRegime.grossSalary, isHeader: true },
    { label: "Exemptions (HRA/LTA/Other)", old: result.oldRegime.hraExemption + result.oldRegime.ltaExemption + result.oldRegime.otherExemptions, new: 0, isDeduction: true },
    { label: "Standard Deduction", old: result.oldRegime.standardDeduction, new: result.newRegime.standardDeduction, isDeduction: true },
    { label: "Net Salary", old: result.oldRegime.netSalary, new: result.newRegime.netSalary, isBold: true },
    { label: "Deductions (80C, 80D, etc.)", old: result.oldRegime.totalDeductions, new: result.newRegime.totalDeductions, isDeduction: true },
    { label: "Taxable Income", old: result.oldRegime.taxableIncome, new: result.newRegime.taxableIncome, isBold: true },
    { label: "Tax on Income", old: result.oldRegime.basicTax, new: result.newRegime.basicTax },
    { label: "Rebate u/s 87A", old: result.oldRegime.rebate87A, new: result.newRegime.rebate87A, isDeduction: true },
    { label: "Surcharge", old: result.oldRegime.surcharge, new: result.newRegime.surcharge },
    { label: "Cess (4%)", old: result.oldRegime.cess, new: result.newRegime.cess },
    { label: "Total Tax Payable", old: result.oldRegime.totalTax, new: result.newRegime.totalTax, isTotal: true },
  ];

  const savings = result.oldRegime.totalTax - result.newRegime.totalTax;
  const recommendation = savings > 0
    ? `New Regime saves you ${formatAmount(savings)}`
    : savings < 0
      ? `Old Regime saves you ${formatAmount(Math.abs(savings))}`
      : "Both regimes have same tax liability";

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Receipt className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Income Tax Calculator</h1>
            <p className="text-sm text-muted-foreground">Compare Old vs New Regime for FY {financialYear}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setInfoDialogField('main');
            setInfoDialogOpen(true);
          }}>
            <Info className="w-4 h-4 mr-2" /> Tax Info
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button variant="default" size="sm" onClick={() => setSaveDialogOpen(true)}>
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              Basic Details
              <InfoIcon fieldName="financialYear" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Financial Year</Label>
                <Select value={financialYear} onValueChange={(v: any) => setFinancialYear(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-26">FY 2025-26</SelectItem>
                    <SelectItem value="2024-25">FY 2024-25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Age Category</Label>
                <Select value={ageCategory} onValueChange={(v: any) => setAgeCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below60">Below 60</SelectItem>
                    <SelectItem value="60to79">60-79 (Senior)</SelectItem>
                    <SelectItem value="80plus">80+ (Super Senior)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Employment Type</Label>
                <Select value={employmentType} onValueChange={(v: any) => setEmploymentType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried Individual</SelectItem>
                    <SelectItem value="business">Business / Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <Collapsible open={incomeOpen} onOpenChange={setIncomeOpen}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  Income Sources
                  <InfoIcon fieldName="grossSalary" />
                </h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {incomeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4">
                {employmentType === 'salaried' ? (
                  <>
                    <CalculatorInput
                      label="Gross Salary"
                      value={grossSalary}
                      onChange={setGrossSalary}
                      prefix={symbol}
                    />
                    <div className="flex items-center gap-2">
                      <Label className="flex-1">Exempt Allowances (LTA/Other)</Label>
                      <InfoIcon fieldName="exemptAllowances" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={exemptAllowances}
                      onChange={setExemptAllowances}
                      prefix={symbol}
                    />
                    <div className="flex items-center gap-2">
                      <Label className="flex-1">HRA Exemption</Label>
                      <InfoIcon fieldName="hraExemption" />
                    </div>
                    <CalculatorInput
                      label=""
                      value={hraExemption}
                      onChange={setHraExemption}
                      prefix={symbol}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="flex-1">Business Type</Label>
                      <InfoIcon fieldName="businessIncome" />
                    </div>
                    <Select value={businessIncomeType} onValueChange={(v: any) => setBusinessIncomeType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="44AD">Small Business (44AD)</SelectItem>
                        <SelectItem value="44ADA">Professional (44ADA)</SelectItem>
                        <SelectItem value="regular">Regular Business</SelectItem>
                      </SelectContent>
                    </Select>

                    {businessIncomeType === '44AD' && (
                      <>
                        <CalculatorInput
                          label="Turnover (Digital Mode)"
                          value={businessTurnover}
                          onChange={setBusinessTurnover}
                          prefix={symbol}
                        />
                        <CalculatorInput
                          label="Turnover (Cash Mode)"
                          value={businessCashTurnover}
                          onChange={setBusinessCashTurnover}
                          prefix={symbol}
                        />
                      </>
                    )}
                    {businessIncomeType === '44ADA' && (
                      <CalculatorInput
                        label="Gross Receipts"
                        value={businessGrossReceipts}
                        onChange={setBusinessGrossReceipts}
                        prefix={symbol}
                      />
                    )}
                    {businessIncomeType === 'regular' && (
                      <CalculatorInput
                        label="Net Profit"
                        value={businessNetProfit}
                        onChange={setBusinessNetProfit}
                        prefix={symbol}
                      />
                    )}
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Label className="flex-1">Interest Income</Label>
                  <InfoIcon fieldName="interestIncome" />
                </div>
                <CalculatorInput
                  label=""
                  value={interestIncome}
                  onChange={setInterestIncome}
                  prefix="₹"
                />
                <div className="flex items-center gap-2">
                  <Label className="flex-1">Rental Income</Label>
                  <InfoIcon fieldName="rentalIncome" />
                </div>
                <CalculatorInput
                  label=""
                  value={rentalIncome}
                  onChange={setRentalIncome}
                  prefix="₹"
                />
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Card className="p-5">
            <Collapsible open={capitalGainsOpen} onOpenChange={setCapitalGainsOpen}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  Capital Gains
                  <InfoIcon fieldName="capitalGains" />
                </h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {capitalGainsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label>Equity LTCG (&gt;1yr)</Label>
                    <InfoIcon fieldName="equityLTCG" />
                  </div>
                  <CalculatorInput
                    label=""
                    value={equityLTCG}
                    onChange={setEquityLTCG}
                    prefix="₹"
                    placeholder="Gains from Stocks/MF > 1yr"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label>Equity STCG (&lt;1yr)</Label>
                    <InfoIcon fieldName="equitySTCG" />
                  </div>
                  <CalculatorInput
                    label=""
                    value={equitySTCG}
                    onChange={setEquitySTCG}
                    prefix="₹"
                    placeholder="Gains from Stocks/MF < 1yr"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label>Property/Gold LTCG</Label>
                    <InfoIcon fieldName="propertyLTCG" />
                  </div>
                  <CalculatorInput
                    label=""
                    value={propertyLTCG}
                    onChange={setPropertyLTCG}
                    prefix="₹"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label>Other Gains (Slab Rate)</Label>
                    <InfoIcon fieldName="otherGains" />
                  </div>
                  <CalculatorInput
                    label=""
                    value={otherGains}
                    onChange={setOtherGains}
                    prefix="₹"
                    placeholder="Debt Funds, etc."
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Card className="p-5">
            <Collapsible open={deductionsOpen} onOpenChange={setDeductionsOpen}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  Deductions
                  <InfoIcon fieldName="section80C" />
                </h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {deductionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-muted/30 rounded-md border border-dashed">
                    <Label className="text-primary font-semibold mb-2 block">New Regime Deductions</Label>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Section 80CCD(2) (Employer NPS)</Label>
                          <InfoIcon fieldName="section80CCD2" />
                        </div>
                        <CalculatorInput label="" value={section80CCD2} onChange={setSection80CCD2} prefix="₹" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Other Deductions (New Regime)</Label>
                          <InfoIcon fieldName="otherDeductionsNew" />
                        </div>
                        <CalculatorInput label="" value={otherDeductionsNew} onChange={setOtherDeductionsNew} prefix="₹" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-md border border-dashed">
                    <Label className="text-primary font-semibold mb-2 block">Old Regime Deductions</Label>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Section 80C (Max 1.5L)</Label>
                          <InfoIcon fieldName="section80C" />
                        </div>
                        <CalculatorInput label="" value={section80C} onChange={setSection80C} prefix="₹" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Section 80D (Health Ins)</Label>
                          <InfoIcon fieldName="section80D" />
                        </div>
                        <CalculatorInput label="" value={section80D} onChange={setSection80D} prefix="₹" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Section 80CCD(1B) (NPS)</Label>
                          <InfoIcon fieldName="section80CCD1B" />
                        </div>
                        <CalculatorInput label="" value={section80CCD1B} onChange={setSection80CCD1B} prefix="₹" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Home Loan Interest (Self)</Label>
                          <InfoIcon fieldName="homeLoanInterestSelfOccupied" />
                        </div>
                        <CalculatorInput label="" value={homeLoanInterestSelfOccupied} onChange={setHomeLoanInterestSelfOccupied} prefix="₹" />
                      </div>

                      {ageCategory === 'below60' ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Label>Section 80TTA (Savings Interest)</Label>
                            <InfoIcon fieldName="section80TTA" />
                          </div>
                          <CalculatorInput label="" value={section80TTA} onChange={setSection80TTA} prefix="₹" />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Label>Section 80TTB (Senior Interest)</Label>
                            <InfoIcon fieldName="section80TTB" />
                          </div>
                          <CalculatorInput label="" value={section80TTB} onChange={setSection80TTB} prefix="₹" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Section 80G (Donations)</Label>
                          <InfoIcon fieldName="section80G" />
                        </div>
                        <CalculatorInput label="" value={section80G} onChange={setSection80G} prefix="₹" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Other Deductions (Old Regime)</Label>
                          <InfoIcon fieldName="otherDeductionsOld" />
                        </div>
                        <CalculatorInput label="" value={otherDeductionsOld} onChange={setOtherDeductionsOld} prefix="₹" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Section 80GG (Rent Paid)</Label>
                          <InfoIcon fieldName="section80GG" />
                        </div>
                        <CalculatorInput label="" value={section80GG} onChange={setSection80GG} prefix="₹" />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Right Column: Output Table */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 shadow-lg border-primary/20 overflow-hidden">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold mb-2">Tax Calculation Summary</h2>
              <Badge variant={savings > 0 ? "default" : "secondary"} className="text-sm px-3 py-1">
                {recommendation}
              </Badge>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40%]">Component</TableHead>
                    <TableHead className="text-right">Old Regime</TableHead>
                    <TableHead className="text-right">New Regime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((row, index) => (
                    <TableRow key={index} className={row.isTotal ? "bg-primary/5 font-bold border-t-2 border-primary/20" : ""}>
                      <TableCell className={`
                        ${row.isHeader ? "font-semibold text-foreground" : ""}
                        ${row.isBold ? "font-bold" : ""}
                        ${row.isDeduction ? "text-muted-foreground pl-6" : ""}
                      `}>
                        {row.label}
                      </TableCell>
                      <TableCell className={`text-right ${row.isTotal ? "text-primary text-lg" : ""}`}>
                        {formatAmount(row.old)}
                      </TableCell>
                      <TableCell className={`text-right ${row.isTotal ? "text-primary text-lg" : ""}`}>
                        {formatAmount(row.new)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold mb-2 text-sm">Old Regime Slabs</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {result.oldRegime.taxSlabs.map((slab, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{slab.rate} Slab ({formatAmount(slab.amount)})</span>
                      <span>{formatAmount(slab.tax)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold mb-2 text-sm">New Regime Slabs</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {result.newRegime.taxSlabs.map((slab, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{slab.rate} Slab ({formatAmount(slab.amount)})</span>
                      <span>{formatAmount(slab.tax)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {infoDialogField === 'main' ? 'About Income Tax Calculator' : `About ${infoDialogField?.replace(/([A-Z])/g, ' $1').trim()}`}
            </DialogTitle>
          </DialogHeader>
          {infoDialogField === 'main' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Tax Regimes Explained</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>New Regime:</strong> Lower tax rates but fewer deductions. Default regime for FY 2025-26.
                  Major benefits: Standard Deduction (₹75k), 80CCD(2), and higher rebate limit (₹12L).
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Old Regime:</strong> Higher tax rates but allows many deductions (80C, 80D, HRA, LTA, etc.).
                  Beneficial if you have high investments and expenses.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Important Tax Dates</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span>Financial Year Starts</span>
                    <span className="font-medium">April 1</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Advance Tax (15%)</span>
                    <span className="font-medium">June 15</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Advance Tax (45%)</span>
                    <span className="font-medium">September 15</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Advance Tax (75%)</span>
                    <span className="font-medium">December 15</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Advance Tax (100%)</span>
                    <span className="font-medium">March 15</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>ITR Filing Deadline</span>
                    <span className="font-bold text-primary">July 31</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TaxSlabsTable slabs={NEW_REGIME_SLABS} title="New Regime Slabs (FY 2025-26)" />
                <TaxSlabsTable slabs={OLD_REGIME_SLABS} title="Old Regime Slabs (FY 2025-26)" />
              </div>
            </div>
          ) : (
            getInfoContent(infoDialogField || '')
          )}
        </DialogContent>
      </Dialog>

      <Alert variant="destructive" className="mt-8 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/50 dark:text-yellow-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          This calculator provides estimates based on general rules. Tax laws are complex and subject to change.
          Please <strong>consult a Chartered Accountant (CA)</strong> before filing your taxes.
        </AlertDescription>
      </Alert>

      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        calculationType="incometax"
        inputs={{
          financialYear,
          ageCategory,
          employmentType,
          grossSalary,
          exemptAllowances,
          hraExemption,
          businessIncomeType,
          businessTurnover,
          businessCashTurnover,
          businessGrossReceipts,
          businessNetProfit,
          businessExpenses,
          interestIncome,
          rentalIncome,
          homeLoanInterestSelfOccupied,
          homeLoanInterestLetOut,
          equityLTCG,
          equitySTCG,
          propertyLTCG,
          otherGains,
          cryptoIncome,
          section80C,
          section80CCD1B,
          section80CCD2,
          section80D,
          section80DAdditional,
          section80TTA,
          section80TTB,
          section80G,
          section80E,
          section80EEA,
          section80GG,
          otherDeductionsOld,
          otherDeductionsNew
        }}
        results={{
          totalTaxOld: result.oldRegime.totalTax,
          totalTaxNew: result.newRegime.totalTax,
          savings: result.oldRegime.totalTax - result.newRegime.totalTax
        }}
      />
    </div>
  );
};

export default IncomeTaxCalculator;
