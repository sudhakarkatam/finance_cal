import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Heart, ExternalLink, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.easecraft.financialcalculator";
const PLAY_STORE_MARKET_URL =
  "market://details?id=com.easecraft.financialcalculator";

const ReviewPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleOpenPlayStore = async () => {
    const isCapacitorNative = Boolean(
      (window as any).Capacitor?.isNativePlatform?.() ||
      (window as any).Capacitor?.platform === "android"
    );

    if (isCapacitorNative) {
      try {
        const { InAppReview } = await import("@capacitor-community/in-app-review");
        await InAppReview.requestReview();
        toast({
          title: "Thank you for your rating!",
          description: "Your feedback helps us keep improving the app.",
        });
        return;
      } catch (err) {
        console.warn("InAppReview failed or unavailable, fallback to market intent", err);
        window.location.href = PLAY_STORE_MARKET_URL;
        return;
      }
    }

    window.open(PLAY_STORE_URL, "_blank");
    toast({
      title: "Thank you for your support!",
      description: "Opening Google Play Store...",
    });
  };

  const handleRating = async (stars: number) => {
    setRating(stars);
    await handleOpenPlayStore();
  };

  const handleShareApp = async () => {
    const shareData = {
      title: "Financial Calculator",
      text: "Calculate EMI, SIP, Compound Interest, FD, RD, and Taxes easily with Financial Calculator on Google Play:\nhttps://play.google.com/store/apps/details?id=com.easecraft.financialcalculator",
      url: PLAY_STORE_URL,
      dialogTitle: "Share Financial Calculator",
    };

    const isCapacitorNative = Boolean(
      (window as any).Capacitor?.isNativePlatform?.() ||
      (window as any).Capacitor?.platform === "android"
    );

    if (isCapacitorNative) {
      try {
        const { Share } = await import("@capacitor/share");
        await Share.share(shareData);
        return;
      } catch (err) {
        console.warn("Capacitor Share failed, fallback to navigator.share", err);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        return;
      } catch (err) {
        return;
      }
    }

    navigator.clipboard.writeText(PLAY_STORE_URL);
    toast({
      title: "Link Copied!",
      description: "Google Play Store link copied to clipboard.",
    });
  };

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto pt-2 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-foreground">Rate & Review</h1>
      </div>

      {/* Main Review Card */}
      <Card className="p-6 space-y-6 text-center shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-primary/10 rounded-full mb-1">
            <Heart className="w-8 h-8 text-primary fill-primary/20 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Enjoying Financial Calculator?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your rating and honest feedback help us keep improving the app and adding new financial tools!
          </p>
        </div>

        {/* Interactive Star Rating Widget */}
        <div className="flex flex-col items-center space-y-3 py-4 px-2 bg-muted/30 rounded-xl border border-border/50 text-center">
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
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 transition-transform transform hover:scale-125 focus:outline-none cursor-pointer"
                  title={`Rate ${star} out of 5`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      active
                        ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                        : "text-muted-foreground/30 hover:text-amber-200"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground font-medium min-h-[18px] transition-all">
            {hoverRating || rating
              ? (hoverRating || rating) >= 5
                ? "Loved it! Thank you for your support ❤️"
                : (hoverRating || rating) === 4
                ? "Great! Thank you for your support 😊"
                : (hoverRating || rating) === 3
                ? "Good! Tell us how we can make it even better 👍"
                : "Thank you for your feedback! We're actively improving 🚀"
              : "Your feedback helps us keep improving the app!"}
          </p>
        </div>

        {/* Direct Google Play Store Button */}
        <Button
          onClick={handleOpenPlayStore}
          size="lg"
          className="w-full gap-2 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
        >
          <ExternalLink className="w-5 h-5" />
          Review on Google Play Store
        </Button>
      </Card>

      {/* Share App Card */}
      <Card className="p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-semibold text-foreground">Share with Friends & Family</h2>
            <p className="text-xs text-muted-foreground">Recommend Financial Calculator to others</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Help friends, family, and colleagues calculate loans, EMI, SIP, taxes, and investments with Financial Calculator.
        </p>

        <Button
          variant="outline"
          size="lg"
          onClick={handleShareApp}
          className="w-full gap-2 text-sm font-semibold border-primary/40 text-primary hover:bg-primary/10"
        >
          <Share2 className="w-4 h-4" />
          Share Financial Calculator
        </Button>
      </Card>
    </div>
  );
};

export default ReviewPage;
