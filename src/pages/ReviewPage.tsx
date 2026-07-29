import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Heart, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ReviewPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.easecraft.financialcalculator";

  const handleOpenPlayStore = () => {
    window.open(PLAY_STORE_URL, "_blank");
    toast({
      title: "Thank you for your support!",
      description: "Opening Google Play Store...",
    });
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pt-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-foreground">Rate & Review</h1>
      </div>

      {/* Main Review Card */}
      <Card className="p-6 space-y-6 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-1">
            <Heart className="w-8 h-8 text-primary fill-primary/20 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Enjoying Financial Calculator?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your 5-star rating on the Google Play Store helps us keep improving and adding new features!
          </p>
        </div>

        {/* Interactive Star Rating */}
        <div className="flex flex-col items-center space-y-3 py-4 bg-muted/30 rounded-xl border border-border/50">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tap a star to rate
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${active
                      ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                      : "text-muted border-muted-foreground/30 hover:text-amber-200"
                      }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Google Play Store Button */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleOpenPlayStore}
            size="lg"
            className="w-full gap-2 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            Review on Google Play Store
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReviewPage;
