import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, FileText, Printer, MessageCircle, Check, Copy } from "lucide-react";
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
}

export const ShareReportModal = ({
  open,
  onOpenChange,
  title,
  inputs,
  results,
  analysis,
  schedule,
}: ShareReportModalProps) => {
  const { toast } = useToast();
  const { formatAmount: formatCurrency } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Generate plain text report for sharing
  const generateFormattedText = () => {
    let text = `📊 *${title.toUpperCase()} REPORT*\n`;
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

      // Clone element temporarily for full height unclipped rendering
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.maxHeight = "none";
      clone.style.height = "auto";
      clone.style.overflow = "visible";
      clone.style.background = "#ffffff";
      clone.style.color = "#000000";
      clone.style.width = "680px"; // Fits A4 printable width (210mm - 20mm margins) perfectly
      clone.style.padding = "20px";
      clone.style.boxSizing = "border-box";
      clone.style.borderRadius = "0px";
      clone.style.border = "none";

      // Make scrollable inner table containers unclipped in clone
      const scrollables = clone.querySelectorAll(".overflow-y-auto, .max-h-60");
      scrollables.forEach((el) => {
        (el as HTMLElement).style.maxHeight = "none";
        (el as HTMLElement).style.height = "auto";
        (el as HTMLElement).style.overflow = "visible";
      });

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
        html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };

      const pdfBlob = await (window as any).html2pdf().set(opt).from(clone).output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      // On Android WebViews (Capacitor), use native Web Share API file drawer to save or open PDF
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
        title: "Preparing WhatsApp PDF File...",
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

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.maxHeight = "none";
      clone.style.height = "auto";
      clone.style.overflow = "visible";
      clone.style.background = "#ffffff";
      clone.style.color = "#000000";
      clone.style.width = "680px";
      clone.style.padding = "20px";
      clone.style.boxSizing = "border-box";

      const scrollables = clone.querySelectorAll(".overflow-y-auto, .max-h-60");
      scrollables.forEach((el) => {
        (el as HTMLElement).style.maxHeight = "none";
        (el as HTMLElement).style.height = "auto";
        (el as HTMLElement).style.overflow = "visible";
      });

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
        html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };

      const pdfBlob = await (window as any).html2pdf().set(opt).from(clone).output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: title,
          text: `📊 *${title.toUpperCase()} REPORT*\nCalculated via Financial Companion App:\nhttps://play.google.com/store/apps/details?id=com.easecraft.financialcalculator`,
        });
      } else {
        handleWhatsAppShare();
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

        {/* Scrollable Preview Card */}
        <div id="printable-share-report" className="flex-1 overflow-y-auto pr-1 space-y-3 border border-border rounded-xl p-4 bg-card print:bg-white print:text-black print:overflow-visible print:max-h-none print:h-auto">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div>
              <h3 className="font-bold text-base text-foreground">{title}</h3>
              <p className="text-[11px] text-muted-foreground">Financial Summary Statement & Analysis</p>
            </div>
            <span className="text-[10px] font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              Verified Report
            </span>
          </div>

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

          {/* Complete Growth / Payment Schedule Table inside PDF report */}
          {schedule && schedule.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <p className="font-semibold text-muted-foreground uppercase text-[10px]">
                Complete Growth Schedule ({schedule.length} Periods)
              </p>

              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto print:max-h-none print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse table-fixed">
                  <thead className="bg-muted/80 text-foreground font-bold border-b">
                    <tr>
                      <th className="p-1.5 text-[11px] w-[20%]">Period</th>
                      <th className="p-1.5 text-right text-[11px] w-[26%]">Invested</th>
                      <th className="p-1.5 text-right text-[11px] w-[26%]">Interest</th>
                      <th className="p-1.5 text-right text-[11px] w-[28%]">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {schedule.map((row, sIdx) => (
                      <tr key={sIdx} className="hover:bg-muted/30">
                        <td className="p-1.5 font-medium truncate">{row.period}</td>
                        <td className="p-1.5 text-right truncate">{formatCurrency(row.invested)}</td>
                        <td className="p-1.5 text-right text-amber-600 dark:text-amber-400 truncate">
                          +{formatCurrency(row.interest)}
                        </td>
                        <td className="p-1.5 text-right font-bold text-emerald-600 dark:text-emerald-400 truncate">
                          {formatCurrency(row.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    </Dialog>
  );
};

export default ShareReportModal;
