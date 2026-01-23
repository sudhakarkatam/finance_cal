import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveCalculation } from "@/lib/storage";
import { toast } from "sonner";

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculationType:
  | "simple"
  | "compound"
  | "sip"
  | "mutualfund"
  | "swp"
  | "emi"
  | "loancompare"
  | "homeloan"
  | "lumpsum"
  | "ppf"
  | "fd"
  | "rd"
  | "goalplanning"
  | "retirement"
  | "education"
  | "hra"
  | "ssy"
  | "incometax"
  | "germantax"
  | "inflation"
  | "gst"
  | "percentage"
  | "nps"
  | "rent-vs-buy"
  | "global-tax"
  | "epf"
  | "time-cost"
  | "trip-cost";
  inputs: Record<string, number | string>;
  results: Record<string, number>;
}

const SaveDialog = ({
  open,
  onOpenChange,
  calculationType,
  inputs,
  results,
}: SaveDialogProps) => {
  const [note, setNote] = useState("");

  const handleSave = () => {
    saveCalculation({
      type: calculationType,
      inputs,
      results,
      note: note.trim() || undefined,
    });
    toast.success("Calculation saved to history!");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to History</DialogTitle>
          <DialogDescription>
            Add an optional note to remember this calculation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="e.g., Home loan calculation, Investment planning..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveDialog;
