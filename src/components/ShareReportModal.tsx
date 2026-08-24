import { useState } from "react";
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
import { Share2, FileText, Printer, MessageCircle, Check, Copy, SlidersHorizontal, UserCheck, ShieldCheck, StickyNote, Edit3 } from "lucide-react";
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
  const cards = clone.querySelectorAll(".bg-muted\\/40, .bg-card");
  cards.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.backgroundColor = "#f8fafc";
    hEl.style.borderColor = "#cbd5e1";
    hEl.style.color = "#0f172a";
  });

  // 4. Force high-contrast text on labels
  const mutedTexts = clone.querySelectorAll(".text-muted-foreground");
  mutedTexts.forEach((el) => {
    const hEl = el as HTMLElement;
    hEl.style.color = "#475569";
  });

  // 5. Force high-contrast text on ALL values - no amber/yellow/grey in PDF
  const boldTexts = clone.querySelectorAll(".font-semibold, .font-bold");
  boldTexts.forEach((el) => {
    const hEl = el as HTMLElement;
    if (!hEl.classList.contains("text-white")) {
      if (hEl.classList.contains("text-emerald-600") || hEl.classList.contains("dark:text-emerald-400")) {
        hEl.style.color = "#047857"; // darker emerald for PDF
      } else {
        hEl.style.color = "#0f172a"; // all other bold text → solid black
      }
    }
  });

  // 5b. Fix amber/yellow/slate interest column text → solid dark color for PDF
  const amberTexts = clone.querySelectorAll(".text-amber-600, .dark\\:text-amber-400, .text-slate-600, .dark\\:text-slate-300");
  amberTexts.forEach((el) => {
    (el as HTMLElement).style.color = "#1e293b"; // slate-800 → very dark, readable on white
  });

  // 5c. Fix ALL muted/grey text to be clearly readable
  const allMutedTexts = clone.querySelectorAll(".text-muted-foreground, .text-gray-500, .text-gray-400, .text-slate-400, .text-slate-500");
  allMutedTexts.forEach((el) => {
    (el as HTMLElement).style.color = "#334155"; // slate-700 → dark and clear
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

  // 7. Fix Table Header & Borders for A4 printing
  const tableHeaders = clone.querySelectorAll("thead");
  tableHeaders.forEach((el) => {
    (el as HTMLElement).style.backgroundColor = "#e2e8f0";
    (el as HTMLElement).style.color = "#0f172a";
  });

  // 7b. Prevent table rows from splitting across PDF pages
  const tableRows = clone.querySelectorAll("tr");
  tableRows.forEach((el) => {
    (el as HTMLElement).style.pageBreakInside = "avoid";
    (el as HTMLElement).style.breakInside = "avoid";
  });

  // 7c. Force all table cell text to solid dark color
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

    // Fix Verified Report badge inside dark headers
    const verifiedBadges = headerEl.querySelectorAll(".rounded-full");
    verifiedBadges.forEach((badge) => {
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
  const { formatAmount: formatCurrency } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Optional PDF Customizer State
  const [enableClientBranding, setEnableClientBranding] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [preparedFor, setPreparedFor] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [pdfTheme, setPdfTheme] = useState<"classic" | "executive" | "emerald">("executive");

  // Format today's date for statement header
  const statementDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Generate plain text report for sharing
  const generateFormattedText = () => {
    let text = `📊 *${title.toUpperCase()} REPORT*\n`;
    if (enableClientBranding && preparedFor) {
      text += `👤 *Prepared for:* ${preparedFor}\n`;
    }
    if (enableClientBranding && preparedBy) {
      text += `🏢 *Prepared by:* ${preparedBy}\n`;
    }
    if (enableClientBranding && personalNote) {
      text += `📝 *Note:* ${personalNote}\n`;
    }
    text += `-----------------------------------\n`;
    text += `INPUT PARAMETERS:\n`;
    inputs.forEach((item) => {
      text += `• ${item.label}: ${item.value}\n`;
    });
    text += `\nSUMMARY & RESULTS:\n`;
    results.forEach((item) => {
      text += `• ${item.label}: ${item.value}\n`;
    });

    if (analysis && analysis.length > 0) {
      text += `\nDETAILED ANALYSIS:\n`;
      analysis.forEach((sec) => {
        text += `\n[${sec.title}]\n`;
        sec.items.forEach((item) => {
          text += `• ${item.label}: ${item.value}\n`;
        });
      });
    }

    if (schedule && schedule.length > 0) {
      text += `\nSCHEDULE HIGHLIGHTS (${schedule.length} Periods):\n`;
      text += `• Start Balance: ${formatCurrency(schedule[0].total)}\n`;
      text += `• Final Maturity: ${formatCurrency(schedule[schedule.length - 1].total)}\n`;
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

  const handleDownloadPDF = async () => {
    let container: HTMLDivElement | null = null;
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Generating PDF Report...",
        description: "Preparing your multi-page financial statement.",
      });

      // Load html2pdf bundle dynamically if not present
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const element = document.getElementById("printable-share-report");
      if (!element) return;

      const clone = preparePdfClone(element);

      // Mount clone off-screen
      container = document.createElement("div");
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

      const pdfBlob: Blob = await (window as any).html2pdf().set(opt).from(clone).output('blob');

      // Detect Capacitor Android Native Platform
      const isCapacitorNative = Boolean(
        (window as any).Capacitor?.isNativePlatform?.() ||
        (window as any).Capacitor?.platform === "android"
      );

      let handledNatively = false;

      if (isCapacitorNative) {
        try {
          const { Filesystem, Directory } = await import("@capacitor/filesystem");
          const { Share } = await import("@capacitor/share");

          const base64Data = await blobToBase64(pdfBlob);

          // Write PDF to Cache / Filesystem
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });

          // Open Android Share / Save Sheet with Native URI
          await Share.share({
            title: title,
            text: `📊 *${title.toUpperCase()} REPORT*\nCalculated via Financial Companion App:\nhttps://play.google.com/store/apps/details?id=com.easecraft.financialcalculator`,
            url: savedFile.uri,
            dialogTitle: "Save or Open PDF Statement",
          });

          handledNatively = true;
        } catch (nativeErr) {
          console.warn("Capacitor Native File System fallback:", nativeErr);
        }
      }

      if (!handledNatively) {
        const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile],
            title: title,
            text: `Save or share ${title} PDF Statement:`,
          });
        } else {
          // Desktop browser download fallback
          const blobUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }
      }

      toast({
        title: "PDF Generated Successfully! 🎉",
        description: `Exported ${fileName}`,
      });
    } catch (err) {
      console.error(err);
      handlePrintPDF();
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setIsGeneratingPDF(false);
    }
  };

  const handleWhatsAppPDFShare = async () => {
    let container: HTMLDivElement | null = null;
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Preparing WhatsApp PDF Document...",
        description: "Building your PDF report attachment.",
      });

      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const element = document.getElementById("printable-share-report");
      if (!element) {
        handleWhatsAppShare();
        return;
      }

      const clone = preparePdfClone(element);

      container = document.createElement("div");
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

      const pdfBlob: Blob = await (window as any).html2pdf().set(opt).from(clone).output('blob');

      const isCapacitorNative = Boolean(
        (window as any).Capacitor?.isNativePlatform?.() ||
        (window as any).Capacitor?.platform === "android"
      );

      let sharedNatively = false;

      if (isCapacitorNative) {
        try {
          const { Filesystem, Directory } = await import("@capacitor/filesystem");
          const { Share } = await import("@capacitor/share");

          const base64Data = await blobToBase64(pdfBlob);

          // Write PDF to Cache / Filesystem
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });

          // Open Native Share Sheet (Select WhatsApp -> Attached PDF Document!)
          await Share.share({
            title: title,
            text: `📊 *${title.toUpperCase()} REPORT*\nCalculated via Financial Companion App:\nhttps://play.google.com/store/apps/details?id=com.easecraft.financialcalculator`,
            url: savedFile.uri,
            dialogTitle: "Share PDF Document on WhatsApp / Apps",
          });

          sharedNatively = true;
        } catch (nativeErr) {
          console.warn("Capacitor Native WhatsApp Share fallback:", nativeErr);
        }
      }

      if (!sharedNatively) {
        const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile],
            title: title,
            text: `📊 *${title.toUpperCase()} REPORT*`,
          });
        } else {
          handleWhatsAppShare();
        }
      }
    } catch (err) {
      console.error(err);
      handleWhatsAppShare();
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Prepared For (Client Name)</label>
                  <Input
                    placeholder="e.g. Rahul Sharma & Family"
                    value={preparedFor}
                    onChange={(e) => setPreparedFor(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Prepared By (Advisor / Firm)</label>
                  <Input
                    placeholder="e.g. Sudhakar / EaseCraft Advisory"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
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
                
                {/* Prepared For & Prepared By Metas */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs font-semibold">
                  {enableClientBranding && preparedFor && (
                    <span className={`flex items-center gap-1 ${pdfTheme === "classic" ? "text-primary" : "text-amber-400"}`}>
                      <UserCheck className="w-3.5 h-3.5" /> Prepared for: {preparedFor}
                    </span>
                  )}
                  {enableClientBranding && preparedBy && (
                    <span className={`flex items-center gap-1 ${pdfTheme === "classic" ? "text-muted-foreground" : "text-slate-300"}`}>
                      🏢 By: {preparedBy}
                    </span>
                  )}
                  {(!enableClientBranding || (!preparedFor && !preparedBy)) && (
                    <span className={`text-[11px] ${pdfTheme === "classic" ? "text-muted-foreground" : "text-slate-300"}`}>
                      Financial Summary Statement & Analysis
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                  pdfTheme === "classic"
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                }`}>
                  <ShieldCheck className="w-3 h-3" /> Verified Report
                </span>
                <span className={`text-[10px] ${pdfTheme === "classic" ? "text-muted-foreground" : "text-slate-400"}`}>
                  Date: {statementDate}
                </span>
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
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {inputs.map((inp, idx) => (
                <div key={idx} className="bg-muted/40 p-2 rounded-lg border border-border/50">
                  <span className="text-[10px] text-muted-foreground block">{inp.label}</span>
                  <span className="font-semibold text-foreground text-xs">{inp.value}</span>
                </div>
              ))}
            </div>
          </div>

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
                      <div key={iIdx} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className={`font-semibold ${item.isHighlight ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-foreground"}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Complete Growth / Amortization Payment Schedule Table inside PDF report */}
          {schedule && schedule.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <p className="font-semibold text-muted-foreground uppercase text-[10px]">
                {scheduleTitle || (isLoanSchedule ? "Complete Amortization Schedule" : "Complete Growth Schedule")} ({schedule.length} Periods)
              </p>

              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto print:max-h-none print:overflow-visible">
                {scheduleHeaders?.withdrawal || schedule.some(r => r.withdrawal !== undefined) ? (
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
                      {schedule.map((row, sIdx) => (
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
                      {schedule.map((row, sIdx) => (
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
            </div>
          )}

          {/* Branded Footer with Play Store App Link */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground print:text-black">
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
        </div>

        {/* Action Buttons (Hidden on Print Output) */}
        <div className="grid grid-cols-2 gap-2 pt-2 print:hidden">
          <Button
            type="button"
            variant="default"
            onClick={handleWhatsAppPDFShare}
            disabled={isGeneratingPDF}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-11"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            Share WhatsApp PDF
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="gap-2 font-semibold text-xs h-11 border-primary/40 text-primary hover:bg-primary/10"
          >
            <Printer className="w-4 h-4" />
            {isGeneratingPDF ? "Generating PDF..." : "Export & Download PDF"}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={handleCopyText}
          className="w-full gap-2 text-xs text-muted-foreground h-9 print:hidden"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied to Clipboard!" : "Copy Summary Text"}
        </Button>
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
