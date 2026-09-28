import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Share2, FileText, Printer, MessageCircle, Check, Copy, Download, SlidersHorizontal, UserCheck, ShieldCheck, StickyNote, Edit3, Phone, Sparkles, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { ScheduleRow } from "./InvestmentScheduleDialog";
import { useCurrency } from "@/hooks/useCurrency";

interface ShareReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  inputs: { label: string; value: string }[];
  results: { label: string; value: string; isHighlight?: boolean }[];
  analysis?: { title: string; items: { label: string; value: string; isHighlight?: boolean }[] }[];
  schedule?: ScheduleRow[];
  scheduleTitle?: string;
  scheduleHeaders?: { period?: string; invested?: string; interest?: string; withdrawal?: string; balance?: string };
  isLoanSchedule?: boolean;
}

// Helper to convert Blob to Base64 string for native Capacitor Filesystem
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

// Helper to extract clean numeric value from formatted strings like "₹1,00,000", "$50,000", "12.5%"
const parseNumericValue = (val: string): number => {
  if (!val) return 0;
  // If there's an explicit currency match, prioritize it (e.g. "₹2,40,00,000" or "(₹50,000)")
  const currencyMatch = val.match(/(?:₹|\$|€|£|¥|rs\.?|inr|usd|eur)\s*([0-9,]+(?:\.[0-9]+)?)/i);
  if (currencyMatch && currencyMatch[1]) {
    return parseFloat(currencyMatch[1].replace(/,/g, "")) || 0;
  }
  // Otherwise, match the first numeric token with optional decimal
  const numMatch = val.match(/[-+]?[0-9,]+(?:\.[0-9]+)?/);
  if (numMatch) {
    return parseFloat(numMatch[0].replace(/,/g, "")) || 0;
  }
  return 0;
};

interface DonutItem {
  label: string;
  value: number;
  pct: number;
  pctExact: string;
  color: string;
}

interface MultiLoanDonutItem {
  id: string;
  title: string;
  principal: number;
  interest: number;
  outflow: number;
  principalPct: number;
  interestPct: number;
  principalPctExact: string;
  interestPctExact: string;
  isBest: boolean;
  color1: string;
  color2: string;
}

interface DonutData {
  hasSplit: boolean;
  items?: DonutItem[];
  multiLoans?: MultiLoanDonutItem[];
  savingsDiff?: number;
  bestLoanTitle?: string;
  val1: number;
  val2: number;
  totalVal: number;
  label1: string;
  label2: string;
  totalLabel: string;
  pct1: number;
  pct2: number;
  pctExact1: string;
  pctExact2: string;
  color1: string;
  color2: string;
  breakdownTitle: string;
}

// Feature 1: Pure Canvas-to-PNG Donut Generator
// Renders 100% reliably in PDF exports (html2canvas) and across all screens with zero SVG stroke/rendering bugs
const generateDonutDataUrl = (
  slices: { pct: number; color: string }[],
  centerText?: string,
  centerSubtext?: string
): string => {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    const size = 200; // High DPI (2.6x density for crystal clear print rasterization)
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const cx = size / 2;
    const cy = size / 2;
    const radius = 68;
    const lineWidth = 24;

    ctx.clearRect(0, 0, size, size);

    const totalPct = slices.reduce((acc, s) => acc + s.pct, 0) || 100;
    const startAngle = -Math.PI / 2; // 12 o'clock
    let currentAngle = startAngle;

    slices.forEach((slice) => {
      const sliceAngle = (Math.max(1, slice.pct) / totalPct) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
      ctx.strokeStyle = slice.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "butt";
      ctx.stroke();

      // Subtle Clean Dividers between segments (2.5px crisp white line)
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(
        cx + (radius - lineWidth / 2 - 1) * Math.cos(currentAngle),
        cy + (radius - lineWidth / 2 - 1) * Math.sin(currentAngle)
      );
      ctx.lineTo(
        cx + (radius + lineWidth / 2 + 1) * Math.cos(currentAngle),
        cy + (radius + lineWidth / 2 + 1) * Math.sin(currentAngle)
      );
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Final Divider at closing boundary
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(
      cx + (radius - lineWidth / 2 - 1) * Math.cos(currentAngle),
      cy + (radius - lineWidth / 2 - 1) * Math.sin(currentAngle)
    );
    ctx.lineTo(
      cx + (radius + lineWidth / 2 + 1) * Math.cos(currentAngle),
      cy + (radius + lineWidth / 2 + 1) * Math.sin(currentAngle)
    );
    ctx.stroke();

    // Center Hole Disk: Crisp white circular background
    ctx.beginPath();
    ctx.arc(cx, cy, radius - lineWidth / 2 - 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center Typography
    const displayMain = centerText || `${Math.round(slices[0]?.pct || 50)}%`;
    const displaySub = centerSubtext || "RATIO";

    ctx.fillStyle = "#0f172a";
    ctx.font = displayMain.length > 4 ? "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" : "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayMain, cx, cy - 8);

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(displaySub, cx, cy + 18);

    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Donut canvas generation error:", err);
    return "";
  }
};

// Robust helper to extract verified totals from results first (avoiding monthly input confusion)
const extractFinancialSplit = (
  inputs: { label: string; value: string }[],
  results: { label: string; value: string }[]
) => {
  // 1. Look for Invested / Principal in RESULTS first (Results always contain the actual total capital)
  const investedItem =
    results.find((r) => /total.invest|total.principal|invested.amount|^invested|deposit.amount|principal.amount|total.deposited/i.test(r.label)) ||
    results.find((r) => /invest|principal|deposit/i.test(r.label) && !/interest|gain|return|rate/i.test(r.label));
  let invested = parseNumericValue(investedItem?.value || "");

  // Fallback to inputs only if not in results, while explicitly ignoring recurring/monthly fields
  const inputInvestItem = inputs.find((i) => !/monthly|yearly|annual|step|frequency|period|tenure|duration|rate/i.test(i.label) && /invest|principal|deposit|borrowed|loan/i.test(i.label));
  if (invested <= 0) {
    invested = parseNumericValue(inputInvestItem?.value || "");
  }

  // 2. Look for Returns / Interest / Gain in RESULTS
  const returnsItem =
    results.find((r) => /total.compound.interest|total.simple.interest|total.interest|estimated.wealth|wealth.gain|interest.earned|estimated.returns|tax-free.interest|accumulated.interest/i.test(r.label)) ||
    results.find((r) => /interest|return|gain|profit/i.test(r.label) && !/rate|period|regime/i.test(r.label));
  let returns = parseNumericValue(returnsItem?.value || "");

  // 3. Look for Total Maturity / Final Corpus / Total Payment
  const totalItem =
    results.find((r) => /total.maturity|final.maturity|maturity.value|final.corpus|total.outflow|total.payment|total.amount|maturity.amount|accumulated.corpus/i.test(r.label)) ||
    results.find((r) => r.isHighlight && !/regime|ratio/i.test(r.label));
  let total = parseNumericValue(totalItem?.value || "");

  // Reconcile and cross-verify values
  if (total > 0 && invested > 0 && returns <= 0) {
    returns = Math.max(0, total - invested);
  } else if (total > 0 && returns > 0 && invested <= 0) {
    invested = Math.max(0, total - returns);
  } else if (invested > 0 && returns > 0 && total <= 0) {
    total = invested + returns;
  }

  return {
    invested,
    returns,
    total,
    investedLabel: investedItem?.label || inputInvestItem?.label,
    returnsLabel: returnsItem?.label,
    totalLabel: totalItem?.label,
  };
};

// Feature 1: Dynamic Donut Ratio Extraction for Split Calculators
const extractDonutData = (
  title: string,
  inputs: { label: string; value: string }[],
  results: { label: string; value: string }[],
  isLoan: boolean
): DonutData | null => {
  const t = title.toLowerCase();

  // 0. Multi-Loan Comparison (Separate Donut for Each Compared Loan)
  if (t.includes("compare") || t.includes("comparison")) {
    const principalInputs = inputs.filter((i) => /principal/i.test(i.label));
    const interestResults = results.filter((r) => /total.*interest/i.test(r.label));
    const outflowResults = results.filter((r) => /total.*outflow|total.*payment|outflow/i.test(r.label));

    if (principalInputs.length >= 2) {
      const parsedLoans: MultiLoanDonutItem[] = principalInputs
        .map((pInp, idx) => {
          const loanTitle = pInp.label.replace(/principal/i, "").trim() || `Loan ${idx + 1}`;
          const principal = parseNumericValue(pInp.value);
          const matchingInterest =
            interestResults.find(
              (r) => loanTitle && r.label.toLowerCase().includes(loanTitle.toLowerCase())
            ) || interestResults[idx];
          const interest = matchingInterest ? parseNumericValue(matchingInterest.value) : 0;

          const matchingOutflow =
            outflowResults.find(
              (r) => loanTitle && r.label.toLowerCase().includes(loanTitle.toLowerCase())
            ) || outflowResults[idx];
          const outflow = matchingOutflow
            ? parseNumericValue(matchingOutflow.value)
            : principal + interest;

          const total = outflow > 0 ? outflow : principal + interest;
          const rawP = total > 0 ? (principal / total) * 100 : 50;
          const pExact = rawP.toFixed(1);
          const iExact = (100 - parseFloat(pExact)).toFixed(1);
          const pPct = Math.round(rawP);
          const iPct = 100 - pPct;

          return {
            id: `loan-${idx + 1}`,
            title: loanTitle,
            principal,
            interest,
            outflow: total,
            principalPct: pPct,
            interestPct: iPct,
            principalPctExact: `${pExact}%`,
            interestPctExact: `${iExact}%`,
            isBest: false,
            color1: "#0f172a", // Dark Slate (Principal)
            color2: "#f59e0b", // Amber (Interest)
          };
        })
        .filter((l) => l.principal > 0);

      if (parsedLoans.length >= 2) {
        let minOutflow = Infinity;
        let maxOutflow = -Infinity;
        let bestIdx = 0;
        parsedLoans.forEach((l, idx) => {
          if (l.outflow < minOutflow) {
            minOutflow = l.outflow;
            bestIdx = idx;
          }
          if (l.outflow > maxOutflow) {
            maxOutflow = l.outflow;
          }
        });
        parsedLoans[bestIdx].isBest = true;
        const savingsDiff = maxOutflow - minOutflow;
        const bestLoanTitle = parsedLoans[bestIdx].title;

        return {
          hasSplit: true,
          multiLoans: parsedLoans,
          savingsDiff,
          bestLoanTitle,
          val1: parsedLoans[0].principal,
          val2: parsedLoans[0].interest,
          totalVal: savingsDiff,
          label1: `${parsedLoans[0].title} Principal`,
          label2: `${parsedLoans[0].title} Interest`,
          totalLabel: "Max Outflow Difference (Savings)",
          pct1: parsedLoans[0].principalPct,
          pct2: parsedLoans[0].interestPct,
          pctExact1: parsedLoans[0].principalPctExact,
          pctExact2: parsedLoans[0].interestPctExact,
          color1: "#0f172a",
          color2: "#f59e0b",
          breakdownTitle: "Side-by-Side Loan Outflow & Interest Burden",
        };
      }
    }
  }

  // 1. Loans / Amortization (Principal vs Total Interest)
  if (isLoan || t.includes("loan") || t.includes("emi")) {
    const loanRes = results.find((r) => /principal/i.test(r.label));
    const loanInp = inputs.find((i) => /loan|principal|borrowed/i.test(i.label));
    let loanVal = parseNumericValue(loanRes?.value || loanInp?.value || "");

    const interestRes =
      results.find((r) => /total.*interest|payable.*interest|interest.*payable/i.test(r.label)) ||
      results.find((r) => /interest/i.test(r.label));
    const interestVal = parseNumericValue(interestRes?.value || "");

    const totalPaymentRes = results.find((r) => /total.*payment|total.*outflow|outflow/i.test(r.label));
    let totalPayment = parseNumericValue(totalPaymentRes?.value || "");

    if (loanVal <= 0 && totalPayment > 0 && interestVal > 0) {
      loanVal = Math.max(0, totalPayment - interestVal);
    }
    if (totalPayment <= 0 && loanVal > 0 && interestVal > 0) {
      totalPayment = loanVal + interestVal;
    }

    if (loanVal > 0 && interestVal > 0) {
      const total = totalPayment > 0 ? totalPayment : loanVal + interestVal;
      const rawPct1 = (loanVal / total) * 100;
      const p1Exact = rawPct1.toFixed(2);
      const p2Exact = (100 - parseFloat(p1Exact)).toFixed(2);
      return {
        hasSplit: true,
        val1: loanVal,
        val2: interestVal,
        totalVal: total,
        label1: loanRes?.label || loanInp?.label || "Principal Loan Amount",
        label2: interestRes?.label || "Total Interest Payable",
        totalLabel: totalPaymentRes?.label || "Total Outflow Amount",
        pct1: Math.round(rawPct1),
        pct2: 100 - Math.round(rawPct1),
        pctExact1: `${p1Exact}%`,
        pctExact2: `${p2Exact}%`,
        color1: "#0f172a", // Dark Slate
        color2: "#f59e0b", // Amber
        breakdownTitle: "Loan Outflow Breakdown",
      };
    }
  }

  // 2. Tax Calculators (Net In-Hand vs Tax Paid)
  if (t.includes("tax") || t.includes("gst")) {
    const taxRes = results.find((r) => /tax|gst/i.test(r.label));
    const taxVal = parseNumericValue(taxRes?.value || "");

    const inHandRes = results.find((r) => /net|base|take.home|in.hand|after.tax|post.tax/i.test(r.label));
    let inHandVal = parseNumericValue(inHandRes?.value || "");

    const grossRes = results.find((r) => /invoice|total|gross|taxable/i.test(r.label));
    const grossInp = inputs.find((i) => /salary|income|amount|taxable|gross/i.test(i.label));
    const grossVal = parseNumericValue(grossRes?.value || grossInp?.value || "");

    if (inHandVal <= 0 && grossVal > taxVal) {
      inHandVal = grossVal - taxVal;
    }

    if (taxVal > 0 && inHandVal > 0) {
      const total = inHandVal + taxVal;
      const rawPct1 = (inHandVal / total) * 100;
      const p1Exact = rawPct1.toFixed(2);
      const p2Exact = (100 - parseFloat(p1Exact)).toFixed(2);
      return {
        hasSplit: true,
        val1: inHandVal,
        val2: taxVal,
        totalVal: total,
        label1: inHandRes?.label || "Net Base Amount",
        label2: taxRes?.label || "Tax / GST Amount",
        totalLabel: grossRes?.label || "Final Invoice Amount",
        pct1: Math.round(rawPct1),
        pct2: 100 - Math.round(rawPct1),
        pctExact1: `${p1Exact}%`,
        pctExact2: `${p2Exact}%`,
        color1: "#047857", // Emerald
        color2: "#ef4444", // Red
        breakdownTitle: "Tax & Amount Breakdown",
      };
    }
  }

  // 3. SWP (Systematic Withdrawal Plan: Total Withdrawn vs Remaining Balance)
  if (t.includes("swp") || t.includes("withdrawal")) {
    const withdrawnRes = results.find((r) => /withdrawn/i.test(r.label));
    const withdrawnVal = parseNumericValue(withdrawnRes?.value || "");

    const balanceRes = results.find((r) => /remaining|final.balance/i.test(r.label));
    const balanceVal = parseNumericValue(balanceRes?.value || "");

    const initialRes =
      results.find((r) => /initial|corpus|invest/i.test(r.label)) ||
      inputs.find((i) => /invest|corpus/i.test(i.label));

    if (withdrawnVal > 0 && balanceVal >= 0) {
      const total = withdrawnVal + balanceVal;
      const rawPct1 = (withdrawnVal / total) * 100;
      const p1Exact = rawPct1.toFixed(2);
      const p2Exact = (100 - parseFloat(p1Exact)).toFixed(2);
      return {
        hasSplit: true,
        val1: withdrawnVal,
        val2: balanceVal,
        totalVal: total,
        label1: withdrawnRes?.label || "Total Amount Withdrawn",
        label2: balanceRes?.label || "Final Remaining Balance",
        totalLabel: initialRes?.label ? `Total Value (${initialRes.label})` : "Total Portfolio Benefit",
        pct1: Math.round(rawPct1),
        pct2: 100 - Math.round(rawPct1),
        pctExact1: `${p1Exact}%`,
        pctExact2: `${p2Exact}%`,
        color1: "#0284c7", // Sky Blue
        color2: "#10b981", // Emerald
        breakdownTitle: "Withdrawal & Balance Breakdown",
      };
    }
  }

  // 4. Investment / Savings / Growth (Invested Capital vs Wealth Gained)
  const { invested, returns, total, investedLabel, returnsLabel, totalLabel: resTotalLabel } =
    extractFinancialSplit(inputs, results);

  if (invested > 0 && returns > 0) {
    const sum = total > 0 ? total : invested + returns;
    const rawPct1 = (invested / sum) * 100;
    const p1Exact = rawPct1.toFixed(2);
    const p2Exact = (100 - parseFloat(p1Exact)).toFixed(2);
    return {
      hasSplit: true,
      val1: invested,
      val2: returns,
      totalVal: sum,
      label1: investedLabel || "Invested Capital",
      label2: returnsLabel || "Interest Earned",
      totalLabel: resTotalLabel || "Maturity Value",
      pct1: Math.round(rawPct1),
      pct2: 100 - Math.round(rawPct1),
      pctExact1: `${p1Exact}%`,
      pctExact2: `${p2Exact}%`,
      color1: "#047857", // Emerald
      color2: "#f59e0b", // Amber/Gold
      breakdownTitle: "Return Breakdown",
    };
  }

  return null;
};

interface SmartInsight {
  icon: string;
  title: string;
  text: string;
}

// Feature 3: Intelligent Financial Insight Generator across all calculator types
const generateSmartInsight = (
  title: string,
  inputs: { label: string; value: string }[],
  results: { label: string; value: string }[],
  isLoan: boolean,
  currSymbol: string = "₹"
): SmartInsight | null => {
  const t = title.toLowerCase();

  // 0. Multi-Loan Comparison (Comparative Borrowing Burden)
  if (t.includes("compare") || t.includes("comparison")) {
    const principalInputs = inputs.filter((i) => /principal/i.test(i.label));
    const interestResults = results.filter((r) => /total.*interest/i.test(r.label));
    const outflowResults = results.filter((r) => /total.*outflow|total.*payment|outflow/i.test(r.label));

    if (principalInputs.length >= 2 && interestResults.length >= 2) {
      const loanBurdenStats = principalInputs
        .map((pInp, idx) => {
          const loanTitle = pInp.label.replace(/principal/i, "").trim() || `Loan ${idx + 1}`;
          const principal = parseNumericValue(pInp.value);
          const matchingInterest =
            interestResults.find(
              (r) => loanTitle && r.label.toLowerCase().includes(loanTitle.toLowerCase())
            ) || interestResults[idx];
          const interest = matchingInterest ? parseNumericValue(matchingInterest.value) : 0;

          const matchingOutflow =
            outflowResults.find(
              (r) => loanTitle && r.label.toLowerCase().includes(loanTitle.toLowerCase())
            ) || outflowResults[idx];
          const outflow = matchingOutflow
            ? parseNumericValue(matchingOutflow.value)
            : principal + interest;
          const totalRepay = outflow > 0 ? outflow : principal + interest;
          const costPerHundred = principal > 0 ? Math.round((totalRepay / principal) * 100) : 0;
          const interestPct = totalRepay > 0 ? Math.round((interest / totalRepay) * 100) : 0;

          return {
            title: loanTitle,
            principal,
            interest,
            outflow: totalRepay,
            costPerHundred,
            interestPct,
          };
        })
        .filter((it) => it.principal > 0);

      if (loanBurdenStats.length >= 2) {
        const sortedByOutflow = [...loanBurdenStats].sort((a, b) => a.outflow - b.outflow);
        const bestLoan = sortedByOutflow[0];
        const worstLoan = sortedByOutflow[sortedByOutflow.length - 1];
        const savingsDiff = worstLoan.outflow - bestLoan.outflow;

        let burdenText = "";
        if (loanBurdenStats.length === 2) {
          const l1 = loanBurdenStats[0];
          const l2 = loanBurdenStats[1];
          burdenText = `For every ${currSymbol}100 borrowed: ${l1.title} requires ${currSymbol}${l1.costPerHundred} total repayment (${l1.interestPct}% interest), while ${l2.title} requires ${currSymbol}${l2.costPerHundred} (${l2.interestPct}% interest). Choosing ${bestLoan.title} reduces your borrowing burden, saving ${currSymbol}${savingsDiff.toLocaleString("en-IN")} in total outflow.`;
        } else {
          const breakdownList = loanBurdenStats
            .map((l) => `${l.title}: ${currSymbol}${l.costPerHundred} per ${currSymbol}100 borrowed (${l.interestPct}% interest)`)
            .join("; ");
          burdenText = `Comparative borrowing burden: ${breakdownList}. Choosing ${bestLoan.title} minimizes your total debt outflow, saving up to ${currSymbol}${savingsDiff.toLocaleString("en-IN")}.`;
        }

        return {
          icon: "💡",
          title: "Borrowing Burden & Outflow Ratio",
          text: burdenText,
        };
      }
    }
  }

  // 1. Loans / EMI (Borrowing cost per unit borrowed)
  if (isLoan || t.includes("loan") || t.includes("emi")) {
    let loanVal = parseNumericValue(
      results.find((r) => /principal/i.test(r.label))?.value ||
      inputs.find((i) => /loan|principal|borrowed/i.test(i.label))?.value || ""
    );
    const interestVal = parseNumericValue(
      results.find((r) => /total.interest|interest/i.test(r.label))?.value || ""
    );
    const totalPayment = parseNumericValue(
      results.find((r) => /total.payment|outflow/i.test(r.label))?.value || ""
    );

    if (loanVal <= 0 && totalPayment > 0 && interestVal > 0) {
      loanVal = Math.max(0, totalPayment - interestVal);
    }

    if (loanVal > 0 && interestVal > 0) {
      const totalRepay = loanVal + interestVal;
      const costPerHundred = Math.round((totalRepay / loanVal) * 100);
      const interestPct = Math.round((interestVal / totalRepay) * 100);
      return {
        icon: "💡",
        title: "Borrowing Burden & Outflow Ratio",
        text: `For every ${currSymbol}100 borrowed, total repayment is ${currSymbol}${costPerHundred}. Interest charges constitute ${interestPct}% of your total repayment outflow over the loan tenure.`,
      };
    }
  }

  // 2. Tax Calculators (Effective Tax Liability %)
  if (t.includes("tax") || t.includes("gst")) {
    const taxVal = parseNumericValue(results.find((r) => /tax|gst/i.test(r.label))?.value || "");
    const baseVal = parseNumericValue(
      inputs.find((i) => /salary|income|amount|taxable|gross/i.test(i.label))?.value ||
      results.find((r) => /total|gross|taxable/i.test(r.label))?.value || ""
    );
    if (baseVal > 0 && taxVal >= 0) {
      const effectiveRate = ((taxVal / baseVal) * 100).toFixed(1);
      return {
        icon: "🛡️",
        title: "Effective Tax Liability",
        text: `Your estimated effective tax liability works out to ${effectiveRate}% of the total taxable base. Strategic deductions can help optimize this further.`,
      };
    }
  }

  // 3. SWP (Systematic Withdrawal Plan)
  if (t.includes("swp") || t.includes("withdrawal")) {
    const invested = parseNumericValue(results.find((r) => /initial.investment|corpus/i.test(r.label))?.value || "");
    const withdrawn = parseNumericValue(results.find((r) => /withdrawn/i.test(r.label))?.value || "");
    const finalBal = parseNumericValue(results.find((r) => /remaining|final.balance/i.test(r.label))?.value || "");
    const totalBenefit = withdrawn + finalBal;
    if (invested > 0 && withdrawn > 0) {
      const netGain = totalBenefit - invested;
      const gainPct = Math.round((netGain / invested) * 100);
      return {
        icon: "🌊",
        title: "Cashflow & Corpus Longevity",
        text: `Total lifetime benefit is ₹${totalBenefit.toLocaleString("en-IN")} (₹${withdrawn.toLocaleString("en-IN")} withdrawn + ₹${finalBal.toLocaleString("en-IN")} remaining balance), representing a ${gainPct >= 0 ? "+" : ""}${gainPct}% return over your initial corpus.`,
      };
    }
  }

  // 4. Inflation Impact
  if (t.includes("inflation")) {
    const lossVal = results.find((r) => /loss|purchasing.power/i.test(r.label))?.value || "";
    return {
      icon: "📉",
      title: "Purchasing Power Erosion",
      text: lossVal
        ? `Inflation erodes real purchasing power by ${lossVal} over this duration. Asset growth must exceed inflation to prevent real wealth loss.`
        : "Inflation steadily reduces money's purchasing power. Ensure investments earn higher post-tax returns than the inflation rate.",
    };
  }

  // 5. Investments & Compounding (SIP, Compound, FD, RD, PPF, NPS, SSY, Lumpsum, Mutual Fund)
  const { invested, returns, total } = extractFinancialSplit(inputs, results);

  if (invested > 0 && returns > 0) {
    const actualTotal = total > 0 ? total : invested + returns;
    const multiplier = (actualTotal / invested).toFixed(2);
    const returnPct = Math.round((returns / invested) * 100);

    if (returns >= invested) {
      return {
        icon: "🚀",
        title: "Compounding Growth Milestone",
        text: `Your wealth returns exceed your original deposited capital (${multiplier}x total growth, +${returnPct}% net gain). Your accumulated compounding returns are now out-earning your contributions.`,
      };
    }
    return {
      icon: "💡",
      title: "Wealth Multiplier Projection",
      text: `Your invested capital grows by ${multiplier}x (+${returnPct}% net wealth gain). Long-term compounding accelerates growth exponentially in the later years.`,
    };
  }

  // 6. Retirement & Goal Planning
  if (t.includes("retire") || t.includes("goal") || t.includes("education")) {
    return {
      icon: "🎯",
      title: "Strategic Action Plan",
      text: "Compounding rewards early and disciplined execution. Review your contributions periodically and consider annual step-ups to counter inflation.",
    };
  }

  // 7. Fallback for CAGR / Growth Rates
  if (t.includes("cagr") || t.includes("rate")) {
    return {
      icon: "📈",
      title: "Growth Rate Interpretation",
      text: "Compounded rates represent the true smoothed annual geometric growth, removing the distortion of short-term market volatility.",
    };
  }

  return null;
};

// Helper function to prepare high-contrast, clean Light PDF clone regardless of app Dark Mode
const preparePdfClone = (element: HTMLElement): HTMLElement => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove("dark");
  clone.style.maxHeight = "none";
  clone.style.height = "auto";
  clone.style.overflow = "visible";
  clone.style.background = "#ffffff";
  clone.style.color = "#0f172a";
  clone.style.width = "680px";
  clone.style.padding = "20px";
  clone.style.boxSizing = "border-box";
  clone.style.borderRadius = "0px";
  clone.style.border = "none";

  // 1. Remove print:hidden elements (like "Edit Note" button)
  const printHiddenElements = clone.querySelectorAll(".print\\:hidden");
  printHiddenElements.forEach((el) => el.parentNode?.removeChild(el));

  // 2. Unclip scrollable inner containers
  const scrollables = clone.querySelectorAll(".overflow-y-auto, .max-h-60");
  scrollables.forEach((el) => {
    (el as HTMLElement).style.maxHeight = "none";
    (el as HTMLElement).style.height = "auto";
    (el as HTMLElement).style.overflow = "visible";
  });

  // 3. Force clean light theme card backgrounds
  const cards = clone.querySelectorAll(".bg-muted\\/40, .bg-muted\\/30, .bg-muted\\/20, .bg-muted\\/50, .bg-card");
  cards.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.backgroundColor = "#f8fafc";
    hEl.style.borderColor = "#cbd5e1";
    hEl.style.color = "#0f172a";
  });

  // 3b. Force crisp styling on highlighted primary cards (e.g. Total Maturity / Monthly EMI)
  const primaryCards = clone.querySelectorAll(".bg-primary");
  primaryCards.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.backgroundColor = "#047857"; // deep rich emerald green
    hEl.style.borderColor = "#065f46";
    hEl.style.color = "#ffffff";
    const innerTexts = hEl.querySelectorAll("span, p, div");
    innerTexts.forEach((item) => {
      (item as HTMLElement).style.color = "#ffffff";
    });
  });

  // 4. Force high-contrast text on labels
  const mutedTexts = clone.querySelectorAll(".text-muted-foreground");
  mutedTexts.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.color = "#475569";
  });

  // 5. Force high-contrast text on ALL values - no amber/yellow/grey in PDF
  const boldTexts = clone.querySelectorAll(".font-semibold, .font-bold, .font-extrabold");
  boldTexts.forEach((el) => {
    const hEl = el as HTMLElement;
    if (!hEl.closest(".bg-primary") && !hEl.classList.contains("text-white") && !hEl.classList.contains("text-primary-foreground")) {
      if (hEl.classList.contains("text-emerald-600") || hEl.classList.contains("dark:text-emerald-400") || hEl.classList.contains("text-primary")) {
        hEl.style.color = "#047857"; // darker emerald for PDF
      } else {
        hEl.style.color = "#0f172a"; // all other bold text → solid dark slate
      }
    }
  });

  // 5b. Fix amber/yellow/slate interest column text → solid dark color for PDF
  const amberTexts = clone.querySelectorAll(".text-amber-600, .dark\\:text-amber-400, .text-slate-600, .dark\\:text-slate-300");
  amberTexts.forEach((el) => {
    if (!el.closest(".bg-primary")) {
      (el as HTMLElement).style.color = "#1e293b"; // slate-800 → very dark, readable on white
    }
  });

  // 5c. Fix ALL muted/grey text to be clearly readable
  const allMutedTexts = clone.querySelectorAll(".text-muted-foreground, .text-gray-500, .text-gray-400, .text-slate-400, .text-slate-500");
  allMutedTexts.forEach((el) => {
    if (!el.closest(".bg-primary")) {
      (el as HTMLElement).style.color = "#334155"; // slate-700 → dark and clear
    }
  });

  // 5d. Ensure allocation bar track has clean background
  const barTracks = clone.querySelectorAll(".bg-slate-200, .dark\\:bg-slate-700");
  barTracks.forEach((el) => {
    (el as HTMLElement).style.backgroundColor = "#e2e8f0";
  });

  // 6. Fix Personal Note box background & text (solid black for crisp contrast)
  const noteBoxes = clone.querySelectorAll(".bg-amber-50, .dark\\:bg-amber-950\\/40");
  noteBoxes.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.backgroundColor = "#fffbeb";
    hEl.style.borderColor = "#fcd34d";
    hEl.style.color = "#0f172a";
    // Force all inner note texts to solid black
    const noteChildren = hEl.querySelectorAll("p, span, div");
    noteChildren.forEach((child) => {
      (child as HTMLElement).style.color = "#0f172a";
    });
  });

  // 6b. Fix Smart Insight box background & text for PDF
  const insightBoxes = clone.querySelectorAll(".bg-emerald-50\\/80, .dark\\:bg-emerald-950\\/40");
  insightBoxes.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.backgroundColor = "#ecfdf5";
    hEl.style.borderColor = "#a7f3d0";
    hEl.style.color = "#064e3b";
    const children = hEl.querySelectorAll("p, span, div");
    children.forEach((child) => {
      (child as HTMLElement).style.color = "#064e3b";
    });
  });

  // 7. Fix Table Header & Borders for A4 printing
  const tableHeaders = clone.querySelectorAll("thead");
  tableHeaders.forEach((el) => {
    (el as HTMLElement).style.backgroundColor = "#e2e8f0";
    (el as HTMLElement).style.color = "#0f172a";
  });

  // 7b. Prevent sections and table rows from splitting across PDF pages
  const avoidBreakBlocks = clone.querySelectorAll("tr, thead, .bg-muted\\/30, .bg-muted\\/40, .bg-emerald-50\\/80, .bg-amber-50, .bg-blue-50\\/70, .bg-card");
  avoidBreakBlocks.forEach((el) => {
    (el as HTMLElement).style.pageBreakInside = "avoid";
    (el as HTMLElement).style.breakInside = "avoid";
  });

  // 7c. Solid background for analysis cards in PDF
  const analysisCards = clone.querySelectorAll(".bg-blue-50\\/70");
  analysisCards.forEach((el) => {
    (el as HTMLElement).style.backgroundColor = "#eff6ff";
    (el as HTMLElement).style.borderColor = "#bfdbfe";
  });

  // 7d. Force all table cell text to solid dark color
  const tableCells = clone.querySelectorAll("td");
  tableCells.forEach((el) => {
    const hEl = el as HTMLElement;
    // Keep emerald for balance column, make everything else dark black
    if (!hEl.classList.contains("text-emerald-600")) {
      hEl.style.color = "#0f172a";
    }
  });

  // 8. Fix Google Play Store Link styling for PDF link recognition
  const playLinks = clone.querySelectorAll("a");
  playLinks.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.color = "#2563eb";
    hEl.style.fontWeight = "bold";
    hEl.style.textDecoration = "underline";
  });

  // 9. Fix analysis section text colors for PDF
  const analysisLabels = clone.querySelectorAll(".text-blue-900, .dark\\:text-blue-200");
  analysisLabels.forEach((el) => {
    (el as HTMLElement).style.color = "#1e3a5f"; // dark navy blue
  });

  // 10. Fix Dark Header Banners (Executive & Emerald PDF themes) for crisp high-contrast print text
  const darkHeaders = clone.querySelectorAll(".bg-slate-900, .bg-emerald-950");
  darkHeaders.forEach((headerEl) => {
    const isEmerald = headerEl.classList.contains("bg-emerald-950");
    (headerEl as HTMLElement).style.backgroundColor = isEmerald ? "#064e3b" : "#0f172a";
    (headerEl as HTMLElement).style.color = "#ffffff";
    (headerEl as HTMLElement).style.borderColor = isEmerald ? "#047857" : "#1e293b";

    // Re-style all child text elements inside dark headers
    const allChildTexts = headerEl.querySelectorAll("h3, span, p, div");
    allChildTexts.forEach((child) => {
      const cEl = child as HTMLElement;
      if (cEl.classList.contains("text-white") || cEl.tagName === "H3") {
        cEl.style.color = "#ffffff";
      } else if (cEl.classList.contains("text-amber-400") || cEl.classList.contains("text-amber-300")) {
        cEl.style.color = "#fde047"; // bright golden yellow
      } else if (cEl.classList.contains("text-emerald-300") || cEl.classList.contains("text-emerald-400")) {
        cEl.style.color = "#6ee7b7"; // bright mint emerald
      } else {
        cEl.style.color = "#e2e8f0"; // crisp light slate (Date, By: author)
      }
    });

    // Fix Category Badge inside dark headers
    const categoryBadges = headerEl.querySelectorAll(".rounded-full");
    categoryBadges.forEach((badge) => {
      const bEl = badge as HTMLElement;
      if (isEmerald) {
        bEl.style.backgroundColor = "rgba(16, 185, 129, 0.3)";
        bEl.style.color = "#a7f3d0";
        bEl.style.borderColor = "rgba(52, 211, 153, 0.7)";
      } else {
        bEl.style.backgroundColor = "rgba(245, 158, 11, 0.3)";
        bEl.style.color = "#fef08a";
        bEl.style.borderColor = "rgba(251, 191, 36, 0.7)";
      }
    });
  });

  return clone;
};

export const ShareReportModal = ({
  open,
  onOpenChange,
  title,
  inputs,
  results,
  analysis,
  schedule,
  scheduleTitle,
  scheduleHeaders,
  isLoanSchedule = false,
}: ShareReportModalProps) => {
  const { toast } = useToast();
  const { formatAmount: formatCurrency, symbol } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Optional PDF Customizer State
  const [enableClientBranding, setEnableClientBranding] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [preparedFor, setPreparedFor] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [pdfTheme, setPdfTheme] = useState<"classic" | "executive" | "emerald">("executive");

  // Feature 6: Schedule Condenser State (detect if > 36 rows)
  const isLongSchedule = Boolean(schedule && schedule.length > 36);
  const [showDetailedSchedule, setShowDetailedSchedule] = useState(false);

  // Feature 1: Compute Dynamic Donut Data & High-Res Canvas PNG Data-URL
  const donutData = useMemo(
    () => extractDonutData(title, inputs, results, isLoanSchedule),
    [title, inputs, results, isLoanSchedule]
  );

  const donutDataUrl = useMemo(() => {
    if (!donutData) return "";
    return generateDonutDataUrl(
      [
        { pct: donutData.pct1, color: donutData.color1 },
        { pct: donutData.pct2, color: donutData.color2 },
      ],
      `${donutData.pct1}%`,
      "RATIO"
    );
  }, [donutData]);

  // Generate individual high-res canvas PNG data-URLs for each compared loan
  const multiLoanDonuts = useMemo(() => {
    if (!donutData?.multiLoans || donutData.multiLoans.length === 0) return [];
    return donutData.multiLoans.map((loan) => {
      const url = generateDonutDataUrl(
        [
          { pct: loan.principalPct, color: loan.color1 },
          { pct: loan.interestPct, color: loan.color2 },
        ],
        `${loan.principalPct}%`,
        "PRIN"
      );
      return {
        ...loan,
        donutDataUrl: url,
      };
    });
  }, [donutData]);

  // Contextual Statement Classification & Unique Document Reference
  const statementCategory = useMemo(() => {
    const t = title.toLowerCase();
    if (isLoanSchedule || /loan|emi|mortgage|borrow/i.test(t)) {
      return {
        badge: "Loan Statement",
        icon: "🏦",
      };
    }
    if (/tax|gst|salary|vat/i.test(t)) {
      return {
        badge: "Tax Projection",
        icon: "📑",
      };
    }
    if (/retire|pension|epf|gratuity/i.test(t)) {
      return {
        badge: "Retirement Plan",
        icon: "🎯",
      };
    }
    if (/sip|compound|lumpsum|mutual|wealth|fd|rd|ppf|ssy|nps/i.test(t)) {
      return {
        badge: "Wealth Projection",
        icon: "📈",
      };
    }
    return {
      badge: "Financial Statement",
      icon: "📊",
    };
  }, [title, isLoanSchedule]);

  // Generate a truly unique Document Reference ID per export session (Format: FC-YYMMDD-XXXX, e.g. FC-260927-8K3F)
  const [docRefId, setDocRefId] = useState(() => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FC-${yy}${mm}${dd}-${rand}`;
  });

  // Mint a fresh unique reference number each time user opens the export modal
  useEffect(() => {
    if (open) {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      setDocRefId(`FC-${yy}${mm}${dd}-${rand}`);
    }
  }, [open]);

  // Feature 3: Compute Intelligent Financial Insight
  const smartInsight = useMemo(
    () => generateSmartInsight(title, inputs, results, isLoanSchedule, symbol),
    [title, inputs, results, isLoanSchedule, symbol]
  );

  // Feature 6: Condense schedule to annual milestones (default) or clamp to 75 rows (max 3 pages)
  const displaySchedule = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];
    if (!isLongSchedule) return schedule;

    if (showDetailedSchedule) {
      // Hard cap at 75 rows to guarantee maximum 3 pages
      return schedule.slice(0, 75);
    }

    // Auto-condense monthly schedules into annual milestones for a compact 1-2 page PDF
    const step = 12;
    return schedule.filter((_, idx) => {
      return idx === 0 || (idx + 1) % step === 0 || idx === schedule.length - 1;
    });
  }, [schedule, isLongSchedule, showDetailedSchedule]);

  // Format today's date for statement header
  const statementDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Generate plain text report for sharing
  const generateFormattedText = () => {
    let text = `📊 *${title.toUpperCase()} REPORT*\n`;
    text += `🔖 *Doc Ref:* #${docRefId} | 📅 *Date:* ${statementDate}\n`;
    if (enableClientBranding && preparedFor) {
      text += `👤 *Prepared for:* ${preparedFor}\n`;
    }
    if (enableClientBranding && preparedBy) {
      text += `🏢 *Prepared by:* ${preparedBy}\n`;
    }
    if (enableClientBranding && contactInfo) {
      text += `📞 *Contact:* ${contactInfo}\n`;
    }
    if (enableClientBranding && personalNote) {
      text += `📝 *Note:* ${personalNote}\n`;
    }
    text += `-----------------------------------\n`;
    text += `INPUT PARAMETERS:\n`;
    if (donutData?.multiLoans && donutData.multiLoans.length >= 2) {
      donutData.multiLoans.forEach((loan, lIdx) => {
        text += `\n[${loan.title}]\n`;
        const loanInputs = inputs.filter((inp) =>
          loan.title && inp.label.toLowerCase().includes(loan.title.toLowerCase())
        );
        const itemsToRender =
          loanInputs.length > 0
            ? loanInputs
            : inputs.filter((_, idx) => idx % donutData.multiLoans!.length === lIdx);
        itemsToRender.forEach((item) => {
          const cleanLabel = item.label.replace(new RegExp(loan.title, "i"), "").trim();
          text += `• ${cleanLabel || item.label}: ${item.value}\n`;
        });
      });
    } else {
      inputs.forEach((item) => {
        text += `• ${item.label}: ${item.value}\n`;
      });
    }
    text += `\nSUMMARY & RESULTS:\n`;
    results.forEach((item) => {
      text += `• ${item.label}: ${item.value}\n`;
    });

    if (donutData?.multiLoans && donutData.multiLoans.length > 0) {
      text += `\n📊 ${donutData.breakdownTitle.toUpperCase()}:\n`;
      donutData.multiLoans.forEach((loan) => {
        text += `\n[${loan.title}${loan.isBest ? " ★ Lowest Outflow" : ""}]\n`;
        text += `• Principal: ${formatCurrency(loan.principal)} (${loan.principalPctExact})\n`;
        text += `• Interest: ${formatCurrency(loan.interest)} (${loan.interestPctExact})\n`;
        text += `• Net Outflow: ${formatCurrency(loan.outflow)}\n`;
      });
      if (donutData.savingsDiff && donutData.savingsDiff > 0) {
        text += `\n✓ ${donutData.bestLoanTitle} saves ${formatCurrency(donutData.savingsDiff)} in total net outflow.\n`;
      }
    } else if (donutData) {
      text += `\n📊 ${donutData.breakdownTitle.toUpperCase()}:\n`;
      if (donutData.items && donutData.items.length > 0) {
        donutData.items.forEach((item) => {
          text += `• ${item.label}: ${formatCurrency(item.value)} — ${item.pctExact}\n`;
        });
      } else {
        text += `• ${donutData.label1}: ${formatCurrency(donutData.val1)} — ${donutData.pctExact1}\n`;
        text += `• ${donutData.label2}: ${formatCurrency(donutData.val2)} — ${donutData.pctExact2}\n`;
      }
      if (donutData.totalLabel) {
        text += `• ${donutData.totalLabel}: ${formatCurrency(donutData.totalVal)}\n`;
      }
    }

    if (smartInsight) {
      text += `\n${smartInsight.icon} *KEY INSIGHT:*\n${smartInsight.text}\n`;
    }

    if (analysis && analysis.length > 0) {
      text += `\nDETAILED ANALYSIS:\n`;
      analysis.forEach((sec) => {
        text += `\n[${sec.title}]\n`;
        sec.items.forEach((item) => {
          text += `• ${item.label}: ${item.value}\n`;
        });
      });
    }

    if (displaySchedule && displaySchedule.length > 0) {
      text += `\nSCHEDULE HIGHLIGHTS (${displaySchedule.length} ${isLongSchedule && !showDetailedSchedule ? "Annual Milestones" : "Periods"}):\n`;
      text += `• Start Balance: ${formatCurrency(displaySchedule[0].total)}\n`;
      text += `• Final Maturity: ${formatCurrency(displaySchedule[displaySchedule.length - 1].total)}\n`;
    }
    text += `-----------------------------------\n`;
    text += `📱 Calculated via Financial Companion App:\nhttps://play.google.com/store/apps/details?id=com.easecraft.financialcalculator`;
    return text;
  };

  const handleWhatsAppShare = () => {
    const text = generateFormattedText();
    const encodedText = encodeURIComponent(text);

    // Try native share if available (Android/Mobile)
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: text,
        })
        .catch(() => {
          window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
        });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
    }
  };

  const handleCopyText = () => {
    const text = generateFormattedText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Report Copied",
      description: "Formatted summary copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    document.body.classList.add("printing-share-report");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-share-report");
    }, 1000);
  };

  // Helper to trigger browser file download
  const downloadBlobLocally = (blob: Blob, fileName: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  // Helper to save PDF to Capacitor Native Cache
  const savePdfToCache = async (pdfBlob: Blob, fileName: string): Promise<string> => {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const base64Data = await blobToBase64(pdfBlob);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });
    return savedFile.uri;
  };

  // Core Unified PDF Generator (Used by Share, WhatsApp, and Download)
  const generatePdfBlob = async (): Promise<{ blob: Blob; fileName: string } | null> => {
    // 1. Ensure html2pdf is available (loads offline bundled vendor file, with graceful CDN fallback)
    if (!(window as any).html2pdf) {
      await new Promise<void>((resolve, reject) => {
        const loadScript = (src: string, onFail?: () => void) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => {
            if ((window as any).html2pdf) {
              resolve();
            } else if (onFail) {
              onFail();
            } else {
              reject(new Error("Unable to initialize PDF generator."));
            }
          };
          script.onerror = () => {
            if (onFail) {
              onFail();
            } else {
              reject(new Error("Unable to load PDF generator."));
            }
          };
          document.body.appendChild(script);
        };

        // Load offline bundled vendor library
        loadScript("/vendor/html2pdf.bundle.min.js", () => {
          console.warn("Local html2pdf script unavailable, falling back to CDN...");
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
        });
      });
    }

    const element = document.getElementById("printable-share-report");
    if (!element) return null;

    const clone = preparePdfClone(element);

    // Mount clone off-screen
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.appendChild(clone);
    document.body.appendChild(container);

    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_statement.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0, enableLinks: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    };

    try {
      const pdfBlob: Blob = await (window as any).html2pdf().set(opt).from(clone).output('blob');
      return { blob: pdfBlob, fileName };
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  // Dedicated WhatsApp PDF Share (Directly targets WhatsApp on Android)
  const handleWhatsAppPDFShare = async () => {
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Preparing WhatsApp Share...",
        description: "Generating PDF for WhatsApp.",
      });

      const result = await generatePdfBlob();
      if (!result) return;
      const { blob: pdfBlob, fileName } = result;

      const isCapacitorNative = Boolean(
        (window as any).Capacitor?.isNativePlatform?.() ||
        (window as any).Capacitor?.platform === "android"
      );

      const shareText = `📊 *${title.toUpperCase()} REPORT*\nCalculated via Financial Calculator App:\nhttps://play.google.com/store/apps/details?id=com.easecraft.financialcalculator`;

      if (isCapacitorNative) {
        try {
          const fileUri = await savePdfToCache(pdfBlob, fileName);
          const { registerPlugin } = await import("@capacitor/core");
          const WhatsAppShare = registerPlugin<any>("WhatsAppShare");

          // Directly invoke native WhatsApp Intent
          await WhatsAppShare.sharePdf({
            url: fileUri,
            text: shareText,
            title: title,
          });
          return;
        } catch (pluginErr: any) {
          console.warn("Direct WhatsApp plugin call error, falling back:", pluginErr);
          // If WhatsApp isn't installed or plugin isn't linked yet, fallback gracefully
          const { Share } = await import("@capacitor/share");
          const fileUri = await savePdfToCache(pdfBlob, fileName);
          await Share.share({
            title: title,
            text: shareText,
            url: fileUri,
            dialogTitle: "Share PDF to WhatsApp",
          });
          return;
        }
      }

      // Web Browser fallback
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: title,
          text: shareText,
        });
      } else {
        // Desktop browser fallback: download PDF and launch WhatsApp web
        downloadBlobLocally(pdfBlob, fileName);
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
        toast({
          title: "PDF Saved & WhatsApp Opened",
          description: "Attach the downloaded PDF to your chat!",
        });
      }
    } catch (err: any) {
      console.error("WhatsApp PDF Share Error:", err);
      toast({
        title: "WhatsApp Share",
        description: err?.message || "Could not open WhatsApp directly.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Share Action: Generates PDF and opens the native app chooser (WhatsApp, Gmail, Drive, etc.)
  const handleSharePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Preparing PDF Report...",
        description: "Building document to share.",
      });

      const result = await generatePdfBlob();
      if (!result) return;
      const { blob: pdfBlob, fileName } = result;

      // Detect Capacitor Android Native Platform
      const isCapacitorNative = Boolean(
        (window as any).Capacitor?.isNativePlatform?.() ||
        (window as any).Capacitor?.platform === "android"
      );

      if (isCapacitorNative) {
        try {
          const fileUri = await savePdfToCache(pdfBlob, fileName);
          const { Share } = await import("@capacitor/share");

          // Open Native Android App Chooser (WhatsApp, Gmail, Telegram, Drive, etc.)
          await Share.share({
            title: title,
            text: `📊 *${title.toUpperCase()} REPORT*\nCalculated via Financial Calculator App:\nhttps://play.google.com/store/apps/details?id=com.easecraft.financialcalculator`,
            url: fileUri,
            dialogTitle: "Share PDF Report via...",
          });
          return;
        } catch (nativeErr) {
          console.warn("Native share fallback:", nativeErr);
        }
      }

      // Web Browser fallback
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: title,
          text: `📊 *${title.toUpperCase()} REPORT*`,
        });
      } else {
        // Fallback for desktop: download file & offer WhatsApp text share
        downloadBlobLocally(pdfBlob, fileName);
        handleWhatsAppShare();
      }
    } catch (err) {
      console.error("PDF generation or share error:", err);
      toast({
        title: "Share Error",
        description: "Unable to share PDF. Opening text summary instead.",
        variant: "destructive",
      });
      handleWhatsAppShare();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Download Action: Saves PDF to device
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Generating PDF...",
        description: "Saving report to your device.",
      });

      const result = await generatePdfBlob();
      if (!result) return;
      const { blob: pdfBlob, fileName } = result;

      const isCapacitorNative = Boolean(
        (window as any).Capacitor?.isNativePlatform?.() ||
        (window as any).Capacitor?.platform === "android"
      );

      if (isCapacitorNative) {
        try {
          const fileUri = await savePdfToCache(pdfBlob, fileName);
          const { Share } = await import("@capacitor/share");

          await Share.share({
            title: title,
            url: fileUri,
            dialogTitle: "Save or Open PDF Statement",
          });
        } catch (nativeErr) {
          downloadBlobLocally(pdfBlob, fileName);
        }
      } else {
        downloadBlobLocally(pdfBlob, fileName);
      }

      toast({
        title: "PDF Ready! 🎉",
        description: `Exported ${fileName}`,
      });
    } catch (err) {
      console.error(err);
      handlePrintPDF();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-5 border-border bg-card print:p-0 print:border-none print:shadow-none print:bg-white print:max-h-none print:h-auto print:static">
        <DialogHeader className="pb-2 print:hidden">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Share2 className="w-5 h-5 text-primary" />
            Share & Export Full PDF Report
          </DialogTitle>
        </DialogHeader>

        {/* Optional Client Branding & Customizer Control Switch (Hidden on Print) */}
        <div className="print:hidden space-y-2 mb-1">
          <div className="bg-muted/30 border border-border/80 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="text-xs font-semibold text-foreground block">Client Branding & Custom Notes</span>
                <span className="text-[10px] text-muted-foreground block">Toggle ON if you want to add Client Name, Prepared By & Notes</span>
              </div>
            </div>
            <Switch
              checked={enableClientBranding}
              onCheckedChange={setEnableClientBranding}
            />
          </div>

          {enableClientBranding && (
            <div className="bg-muted/40 border border-border/80 rounded-lg p-3 space-y-2.5 text-xs animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Prepared For (Client)</label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={preparedFor}
                    onChange={(e) => setPreparedFor(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Prepared By (Advisor/Firm)</label>
                  <Input
                    placeholder="e.g. EaseCraft Advisory"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Contact Phone / WhatsApp</label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Personal / Advisor Note</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs justify-between font-normal bg-background border-input"
                    onClick={() => setNoteDialogOpen(true)}
                  >
                    <span className="truncate text-muted-foreground">
                      {personalNote ? `📝 ${personalNote.slice(0, 25)}...` : "Click to enter note..."}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                  </Button>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">PDF Visual Theme</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPdfTheme("classic")}
                      className={`flex-1 py-1 px-1.5 rounded text-[11px] border font-medium transition-all ${
                        pdfTheme === "classic"
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      Classic Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfTheme("executive")}
                      className={`flex-1 py-1 px-1.5 rounded text-[11px] border font-medium transition-all ${
                        pdfTheme === "executive"
                          ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      Navy Exec
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfTheme("emerald")}
                      className={`flex-1 py-1 px-1.5 rounded text-[11px] border font-medium transition-all ${
                        pdfTheme === "emerald"
                          ? "bg-emerald-950 text-amber-400 border-emerald-950 shadow-sm"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      Emerald
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature 6: Schedule Condenser Option (Only for long schedules > 36 periods) */}
          {isLongSchedule && (
            <div className="bg-muted/30 border border-border/80 rounded-lg p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {showDetailedSchedule ? "Detailed Schedule (Max 3 Pages)" : "Compact Annual Milestones (1–2 Pages)"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {showDetailedSchedule
                      ? `Monthly periods clamped at 75 rows to guarantee under 3 pages`
                      : `Auto-condensed to annual milestones for a fast, compact 1–2 page PDF`}
                  </span>
                </div>
              </div>
              <Switch
                checked={showDetailedSchedule}
                onCheckedChange={setShowDetailedSchedule}
              />
            </div>
          )}
        </div>

        {/* Scrollable Preview Card */}
        <div id="printable-share-report" className="flex-1 overflow-y-auto pr-1 space-y-3 border border-border rounded-xl p-4 bg-card print:bg-white print:text-black print:overflow-visible print:max-h-none print:h-auto">
          {/* Header Theme Switch */}
          <div className={`p-3.5 rounded-lg border transition-all ${
            pdfTheme === "executive"
              ? "bg-slate-900 text-white border-slate-800"
              : pdfTheme === "emerald"
              ? "bg-emerald-950 text-white border-emerald-900"
              : "bg-card text-foreground border-border/60"
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`font-bold text-base ${pdfTheme === "classic" ? "text-foreground" : "text-white"}`}>{title}</h3>
                
                {/* Prepared For, Prepared By, and Contact Info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs font-semibold">
                  {enableClientBranding && preparedFor && (
                    <span className={`flex items-center gap-1 ${pdfTheme === "classic" ? "text-primary" : "text-amber-400"}`}>
                      <UserCheck className="w-3.5 h-3.5" /> For: {preparedFor}
                    </span>
                  )}
                  {enableClientBranding && preparedBy && (
                    <span className={`flex items-center gap-1 ${pdfTheme === "classic" ? "text-muted-foreground" : "text-slate-300"}`}>
                      🏢 By: {preparedBy}
                    </span>
                  )}
                  {enableClientBranding && contactInfo && (
                    <span className={`flex items-center gap-1 ${pdfTheme === "classic" ? "text-muted-foreground" : "text-slate-300"}`}>
                      <Phone className="w-3 h-3" /> {contactInfo}
                    </span>
                  )}
                  {(!enableClientBranding || (!preparedFor && !preparedBy && !contactInfo)) && (
                    <span className={`text-[11px] ${pdfTheme === "classic" ? "text-muted-foreground" : "text-slate-300"}`}>
                      Financial Summary Statement & Analysis
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 shadow-sm ${
                  pdfTheme === "classic"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                }`}>
                  <span>{statementCategory.icon}</span>
                  <span>{statementCategory.badge}</span>
                </span>
                <div className={`text-[10px] space-y-0.5 ${pdfTheme === "classic" ? "text-muted-foreground" : "text-slate-300"}`}>
                  <div className="font-mono text-[9px] opacity-90">Doc Ref: #{docRefId}</div>
                  <div>Date: {statementDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Paragraph Personal Note Box */}
          {enableClientBranding && personalNote && (
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <StickyNote className="w-3 h-3 text-amber-600" /> Advisor / Personal Note
                </span>
                <button
                  type="button"
                  onClick={() => setNoteDialogOpen(true)}
                  className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline print:hidden cursor-pointer"
                >
                  Edit Note
                </button>
              </div>
              <div className="text-amber-900 dark:text-amber-200 text-xs space-y-1.5 leading-relaxed font-medium">
                {personalNote.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx} className="text-xs">
                    {para.split("\n").map((line, lIdx) => (
                      <span key={lIdx}>
                        {line}
                        {lIdx < para.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Inputs Section */}
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-muted-foreground uppercase text-[10px]">
              Calculation Inputs
            </p>
            {donutData?.multiLoans && donutData.multiLoans.length >= 2 ? (
              <div
                className={`grid ${
                  donutData.multiLoans.length === 3 ? "grid-cols-3" : "grid-cols-2"
                } gap-2.5 pt-0.5`}
              >
                {donutData.multiLoans.map((loan, lIdx) => {
                  const loanInputs = inputs.filter((inp) =>
                    loan.title && inp.label.toLowerCase().includes(loan.title.toLowerCase())
                  );
                  const itemsToRender =
                    loanInputs.length > 0
                      ? loanInputs
                      : inputs.filter((_, idx) => idx % donutData.multiLoans!.length === lIdx);

                  return (
                    <div
                      key={lIdx}
                      className="bg-muted/30 p-2.5 rounded-xl border border-border/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-border/40">
                        <span className="font-bold text-foreground text-xs">{loan.title}</span>
                        {loan.isBest && (
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                            ★ Best Option
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 pt-0.5">
                        {itemsToRender.map((inp, idx) => {
                          const cleanLabel = inp.label
                            .replace(new RegExp(loan.title, "i"), "")
                            .trim();
                          return (
                            <div
                              key={idx}
                              className="bg-background/80 dark:bg-card p-1.5 rounded-lg border border-border/40"
                            >
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {cleanLabel || inp.label}
                              </span>
                              <span className="font-semibold text-foreground text-xs block">
                                {inp.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {inputs.map((inp, idx) => (
                  <div key={idx} className="bg-muted/40 p-2 rounded-lg border border-border/50">
                    <span className="text-[10px] text-muted-foreground block">{inp.label}</span>
                    <span className="font-semibold text-foreground text-xs">{inp.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature 1: Visual Asset Allocation & Donut Ratio Breakdown */}
          {donutData && (
            donutData.multiLoans && donutData.multiLoans.length >= 2 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-0.5">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    {donutData.breakdownTitle || "Side-by-Side Loan Outflow & Interest Burden"}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Principal vs Interest
                  </span>
                </div>

                <div
                  className={`grid ${
                    donutData.multiLoans.length === 3 ? "grid-cols-3" : "grid-cols-2"
                  } gap-2.5`}
                >
                  {donutData.multiLoans.map((loan, idx) => {
                    const donutImgUrl = multiLoanDonuts[idx]?.donutDataUrl || "";
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl p-2.5 border transition-all ${
                          loan.isBest
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/60 shadow-xs"
                            : "bg-muted/30 border-border/70"
                        }`}
                      >
                        {/* Header Row: Loan Title + Best Option Badge */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-border/40 gap-1">
                          <span className="font-bold text-foreground text-xs truncate">
                            {loan.title}
                          </span>
                          {loan.isBest && (
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                              ★ Lowest Outflow
                            </span>
                          )}
                        </div>

                        {/* Donut Chart & Key Metrics */}
                        <div className="flex items-center gap-2.5 pt-2">
                          <div className="shrink-0 flex items-center justify-center">
                            {donutImgUrl ? (
                              <img
                                src={donutImgUrl}
                                alt={`${loan.title} Breakdown`}
                                width="58"
                                height="58"
                                className="w-[58px] h-[58px] shrink-0 rounded-full shadow-xs"
                                style={{ width: "58px", height: "58px", display: "block" }}
                              />
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-muted-foreground truncate">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: loan.color1 }}
                                />
                                <span className="truncate text-[10px]">Principal:</span>
                              </span>
                              <span className="font-semibold text-foreground shrink-0 text-[10px]">
                                {formatCurrency(loan.principal)} ({loan.principalPct}%)
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-muted-foreground truncate">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: loan.color2 }}
                                />
                                <span className="truncate text-[10px]">Interest:</span>
                              </span>
                              <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0 text-[10px]">
                                {formatCurrency(loan.interest)} ({loan.interestPct}%)
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-border/50 font-bold">
                              <span className="text-muted-foreground truncate text-[10px]">
                                Net Outflow:
                              </span>
                              <span
                                className={`shrink-0 text-[11px] font-bold ${
                                  loan.isBest
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : "text-foreground"
                                }`}
                              >
                                {formatCurrency(loan.outflow)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Segmented Bar for visual proportion */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full flex overflow-hidden mt-2">
                          <div
                            style={{
                              width: `${loan.principalPct}%`,
                              backgroundColor: loan.color1,
                            }}
                            className="h-full"
                          />
                          <div
                            style={{
                              width: `${loan.interestPct}%`,
                              backgroundColor: loan.color2,
                            }}
                            className="h-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Savings Callout Banner */}
                {donutData.savingsDiff && donutData.savingsDiff > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg py-1 px-2.5 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium text-[11px]">
                      Optimal Option Advantage
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                      ✓ {donutData.bestLoanTitle} saves {formatCurrency(donutData.savingsDiff)} in total net outflow
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 border border-border/70 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  {/* Crisp Vector Donut with Center Text (Pure High-DPI PNG Canvas: 100% html2canvas & PDF compatible) */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    {donutDataUrl ? (
                      <img
                        src={donutDataUrl}
                        alt="Allocation Ratio Donut Chart"
                        width="76"
                        height="76"
                        className="w-[76px] h-[76px] shrink-0 rounded-full shadow-sm"
                        style={{ width: "76px", height: "76px", display: "block" }}
                      />
                    ) : null}
                  </div>

                  {/* Return Breakdown in simple text */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between pb-0.5 border-b border-border/40">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {donutData.breakdownTitle || "Return Breakdown"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono font-medium">
                        100.00%
                      </span>
                    </div>
                    {donutData.items && donutData.items.length > 0 ? (
                      donutData.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 truncate text-muted-foreground font-medium max-w-[55%]">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: it.color }}
                            />
                            <span className="truncate">{it.label}:</span>
                          </span>
                          <span className="font-bold shrink-0 text-foreground">
                            {formatCurrency(it.value)} — {it.pctExact}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 truncate text-muted-foreground font-medium max-w-[55%]">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: donutData.color1 }}
                            />
                            <span className="truncate">{donutData.label1}:</span>
                          </span>
                          <span className="font-bold shrink-0 text-foreground">
                            {formatCurrency(donutData.val1)} — {donutData.pctExact1}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 truncate text-muted-foreground font-medium max-w-[55%]">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: donutData.color2 }}
                            />
                            <span className="truncate">{donutData.label2}:</span>
                          </span>
                          <span className="font-bold shrink-0 text-foreground">
                            {formatCurrency(donutData.val2)} — {donutData.pctExact2}
                          </span>
                        </div>
                      </>
                    )}
                    {donutData.totalLabel && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60 font-bold text-foreground">
                        <span className="truncate max-w-[55%]">{donutData.totalLabel}:</span>
                        <span className="shrink-0 text-primary font-extrabold">
                          {formatCurrency(donutData.totalVal)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segmented Visual Allocation Bar (Guaranteed to render on every PDF engine) */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full flex overflow-hidden">
                  {donutData.items && donutData.items.length > 0 ? (
                    donutData.items.map((it, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${it.pct}%`, backgroundColor: it.color }}
                        className="h-full"
                      />
                    ))
                  ) : (
                    <>
                      <div
                        style={{ width: `${donutData.pct1}%`, backgroundColor: donutData.color1 }}
                        className="h-full"
                      />
                      <div
                        style={{ width: `${donutData.pct2}%`, backgroundColor: donutData.color2 }}
                        className="h-full"
                      />
                    </>
                  )}
                </div>
              </div>
            )
          )}

          {/* Results Section */}
          <div className="space-y-1.5 pt-1">
            <p className="font-semibold text-muted-foreground uppercase text-[10px]">
              Calculated Output Summary
            </p>
            <div className="space-y-1.5">
              {results.map((res, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg flex justify-between items-center text-xs ${
                    res.isHighlight
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted/40 border border-border/70 text-foreground"
                  }`}
                >
                  <span>{res.label}</span>
                  <span className="font-bold text-sm">{res.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3: Dynamic Key Financial Insight Callout */}
          {smartInsight && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs flex items-start gap-2.5">
              <span className="text-base shrink-0 leading-none mt-0.5">{smartInsight.icon}</span>
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-emerald-950 dark:text-emerald-200 block text-[11px] uppercase tracking-wide">
                  {smartInsight.title}
                </span>
                <p className="text-emerald-900 dark:text-emerald-100 text-xs leading-relaxed font-medium">
                  {smartInsight.text}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Analysis Section (e.g. Step-Up, Prepayment, Inflation) */}
          {analysis && analysis.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="font-semibold text-muted-foreground uppercase text-[10px]">
                Detailed Analysis & Feature Impact
              </p>
              {analysis.map((sec, sIdx) => (
                <div key={sIdx} className="bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 space-y-1.5 text-xs">
                  <p className="font-bold text-blue-900 dark:text-blue-200 text-xs">{sec.title}</p>
                  <div className="space-y-1">
                    {sec.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex justify-between items-start gap-3 text-xs py-0.5">
                        <span className="text-muted-foreground shrink-0 font-medium max-w-[42%]">{item.label}:</span>
                        <span className={`font-semibold text-right leading-relaxed ${item.isHighlight ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-foreground"}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feature 6: Hard Cap at 3 Pages & Intelligent Condensing */}
          {displaySchedule && displaySchedule.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-muted-foreground uppercase text-[10px]">
                  {scheduleTitle || (isLoanSchedule ? "Payment Amortization Schedule" : "Growth Schedule")} ({displaySchedule.length} {isLongSchedule && !showDetailedSchedule ? "Milestones" : "Periods"})
                </p>
                {isLongSchedule && (
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                    {showDetailedSchedule ? "Detailed View (Max 3 Pages)" : "Annual Summary (Compact)"}
                  </span>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto print:max-h-none print:overflow-visible">
                {scheduleHeaders?.withdrawal || displaySchedule.some(r => r.withdrawal !== undefined) ? (
                  <table className="w-full text-left text-xs border-collapse table-fixed">
                    <thead className="bg-muted/80 text-foreground font-bold border-b">
                      <tr>
                        <th className="p-1.5 text-[11px] w-[18%]">{scheduleHeaders?.period || "Period"}</th>
                        <th className="p-1.5 text-right text-[11px] w-[20%]">{scheduleHeaders?.invested || "Starting Balance"}</th>
                        <th className="p-1.5 text-right text-[11px] w-[20%]">{scheduleHeaders?.interest || "Interest Earned"}</th>
                        <th className="p-1.5 text-right text-[11px] w-[21%]">{scheduleHeaders?.withdrawal || "Withdrawals"}</th>
                        <th className="p-1.5 text-right text-[11px] w-[21%]">{scheduleHeaders?.balance || "Ending Balance"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {displaySchedule.map((row, sIdx) => (
                        <tr key={sIdx} className="hover:bg-muted/30">
                          <td className="p-1.5 font-medium truncate">{row.period}</td>
                          <td className="p-1.5 text-right truncate">{formatCurrency(row.invested)}</td>
                          <td className="p-1.5 text-right truncate text-amber-600 dark:text-amber-400">+{formatCurrency(row.interest)}</td>
                          <td className="p-1.5 text-right truncate text-rose-600 dark:text-rose-400">-{formatCurrency(row.withdrawal || 0)}</td>
                          <td className="p-1.5 text-right font-bold truncate text-emerald-600 dark:text-emerald-400">{formatCurrency(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-xs border-collapse table-fixed">
                    <thead className="bg-muted/80 text-foreground font-bold border-b">
                      <tr>
                        <th className="p-1.5 text-[11px] w-[20%]">
                          {scheduleHeaders?.period || "Period"}
                        </th>
                        <th className="p-1.5 text-right text-[11px] w-[26%]">
                          {scheduleHeaders?.invested || (isLoanSchedule ? "Principal Paid" : "Invested")}
                        </th>
                        <th className="p-1.5 text-right text-[11px] w-[26%]">
                          {scheduleHeaders?.interest || (isLoanSchedule ? "Interest Paid" : "Interest")}
                        </th>
                        <th className="p-1.5 text-right text-[11px] w-[28%]">
                          {scheduleHeaders?.balance || (isLoanSchedule ? "Remaining Balance" : "Balance")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {displaySchedule.map((row, sIdx) => (
                        <tr key={sIdx} className="hover:bg-muted/30">
                          <td className="p-1.5 font-medium truncate">{row.period}</td>
                          <td className="p-1.5 text-right truncate">{formatCurrency(row.invested)}</td>
                          <td className={`p-1.5 text-right truncate ${isLoanSchedule ? "text-slate-600 dark:text-slate-300" : "text-amber-600 dark:text-amber-400"}`}>
                            {isLoanSchedule ? "" : "+"}{formatCurrency(row.interest)}
                          </td>
                          <td className={`p-1.5 text-right font-bold truncate ${isLoanSchedule ? "text-foreground font-semibold" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {formatCurrency(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {isLongSchedule && !showDetailedSchedule && (
                <p className="text-[10px] text-muted-foreground text-center pt-1 italic">
                  Showing annual milestone summary (Optimized for 1–2 page PDF report). Full schedule available in app.
                </p>
              )}
            </div>
          )}

          {/* Feature 5: Branded Footer with Honest Informational Disclaimer & Play Store Link */}
          <div className="pt-3 border-t border-border/60 space-y-2 text-[10px] text-muted-foreground print:text-black">
            <div className="flex items-center justify-between text-[11px]">
              <span>Calculated via Financial Companion</span>
              <a
                href="https://play.google.com/store/apps/details?id=com.easecraft.financialcalculator"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-semibold text-[11px] print:text-black"
              >
                Get App on Google Play ↗
              </a>
            </div>
            <p className="text-[9px] text-muted-foreground/80 leading-tight">
              Disclaimer: This statement is an illustrative projection generated for informational purposes only. Figures are estimates based on user inputs and compounding mathematical models, and do not constitute official banking, investment, tax, or legal advice.
            </p>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print Output) */}
        <div className="space-y-2 pt-2 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="default"
              onClick={handleSharePDF}
              disabled={isGeneratingPDF}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-11 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              {isGeneratingPDF ? "Preparing..." : "Share PDF Report"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="gap-2 font-semibold text-xs h-11 border-border text-foreground hover:bg-muted"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleWhatsAppPDFShare}
              disabled={isGeneratingPDF}
              className="gap-1.5 text-[11px] text-muted-foreground hover:text-emerald-600 h-8 font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrintPDF}
              className="gap-1.5 text-[11px] text-muted-foreground hover:text-foreground h-8"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyText}
              className="gap-1.5 text-[11px] text-muted-foreground hover:text-foreground h-8"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Popup Dialog for entering Multi-Line Advisor / Personal Note */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-md p-5 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <StickyNote className="w-4 h-4 text-amber-500" />
              Add Advisor / Personal Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Type your custom advice, strategy recommendations, or client disclaimers below. Multiple paragraphs will be formatted cleanly into paragraphs in your PDF report statement.
            </p>
            <Textarea
              placeholder="e.g. Plan reviewed with 6.0% inflation adjustment.&#10;&#10;We recommend increasing your SIP contribution by 10% annually to reach your goal 3 years earlier."
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              className="min-h-[140px] text-xs bg-background leading-relaxed p-3"
            />
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-[11px] text-muted-foreground">Tip: Press Enter twice for a new paragraph.</span>
              <Button size="sm" onClick={() => setNoteDialogOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ShareReportModal;
