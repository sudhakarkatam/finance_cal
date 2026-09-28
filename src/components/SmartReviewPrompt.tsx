import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Heart, Sparkles, X } from "lucide-react";
import {
  subscribeToReviewPrompt,
  launchPlayStoreReview,
  snoozeReviewPrompt,
  dismissReviewPromptForever,
  checkShouldPromptReview,
} from "@/lib/reviewManager";

export const SmartReviewPrompt = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Initial check on mount
    if (checkShouldPromptReview()) {
      setOpen(true);
    }

    // Subscribe to engagement milestones
    const unsubscribe = subscribeToReviewPrompt((shouldShow) => {
      setOpen(shouldShow);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRateNow = async () => {
    setOpen(false);
    await launchPlayStoreReview();
  };

  const handleRemindLater = () => {
    setOpen(false);
    snoozeReviewPrompt();
  };

  const handleNever = () => {
    setOpen(false);
    dismissReviewPromptForever();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleRemindLater()}>
      <DialogContent className="max-w-sm sm:max-w-md p-6 rounded-2xl border border-primary/20 shadow-2xl bg-card">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-7 h-7 text-amber-900" />
          </div>

          <div className="flex justify-center gap-1.5 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          <DialogTitle className="text-xl font-bold text-foreground text-center">
            Loving Financial Calculator?
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed">
            If our calculators and reports are helping your personal finance planning,
            would you take 5 seconds to rate us on Google Play?
            <br />
            <span className="text-xs text-primary font-medium mt-1 inline-block">
              Your support keeps this app 100% free with no intrusive paywalls!
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 mt-5">
          <Button
            className="w-full h-11 text-sm font-semibold gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/25"
            onClick={handleRateNow}
          >
            <Star className="w-4 h-4 fill-white" />
            Rate 5 Stars on Google Play
          </Button>

          <Button
            variant="outline"
            className="w-full h-10 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={handleRemindLater}
          >
            Remind Me Later
          </Button>

          <div className="text-center pt-1">
            <button
              onClick={handleNever}
              className="text-[11px] text-muted-foreground/70 hover:text-muted-foreground underline decoration-dotted"
            >
              Don't ask again
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartReviewPrompt;
