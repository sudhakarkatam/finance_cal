import { InAppReview } from "@capacitor-community/in-app-review";
import { triggerHaptic } from "./haptics";

const STORAGE_KEYS = {
  ENGAGEMENT_COUNT: "fc_engagement_count",
  REVIEW_STATUS: "fc_review_status", // 'rated' | 'dismissed' | 'pending'
  LAST_PROMPT_TIME: "fc_review_last_prompt_time",
};

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.easecraft.financialcalculator";
const PLAY_STORE_MARKET_URL =
  "market://details?id=com.easecraft.financialcalculator";

const MILESTONES = [3, 8, 18, 35]; // Show on 3rd, 8th, etc. significant actions
const COOLDOWN_DAYS = 7;

type ReviewListener = (shouldShow: boolean) => void;
const listeners: ReviewListener[] = [];

export const subscribeToReviewPrompt = (listener: ReviewListener) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifyListeners = (shouldShow: boolean) => {
  listeners.forEach((l) => l(shouldShow));
};

export const checkShouldPromptReview = (): boolean => {
  try {
    const status = localStorage.getItem(STORAGE_KEYS.REVIEW_STATUS);
    if (status === "rated" || status === "never") {
      return false;
    }

    const lastPrompt = localStorage.getItem(STORAGE_KEYS.LAST_PROMPT_TIME);
    if (lastPrompt) {
      const daysSinceLastPrompt =
        (Date.now() - parseInt(lastPrompt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPrompt < COOLDOWN_DAYS) {
        return false;
      }
    }

    const count = parseInt(
      localStorage.getItem(STORAGE_KEYS.ENGAGEMENT_COUNT) || "0",
      10
    );

    return MILESTONES.includes(count) || (count > 35 && count % 25 === 0);
  } catch {
    return false;
  }
};

/**
 * Record a positive user action (calculating, saving, generating PDF, schedule view).
 */
export const recordPositiveEngagement = (action = "action") => {
  try {
    const current = parseInt(
      localStorage.getItem(STORAGE_KEYS.ENGAGEMENT_COUNT) || "0",
      10
    );
    const updated = current + 1;
    localStorage.setItem(STORAGE_KEYS.ENGAGEMENT_COUNT, updated.toString());

    if (checkShouldPromptReview()) {
      // Short delay so prompt appears smoothly after action completes
      setTimeout(() => {
        notifyListeners(true);
      }, 800);
    }
  } catch (err) {
    console.debug("Failed recording engagement", err);
  }
};

/**
 * Launch the native Google Play In-App Review sheet or redirect to Play Store.
 */
export const launchPlayStoreReview = async () => {
  triggerHaptic();
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEW_STATUS, "rated");
    localStorage.setItem(STORAGE_KEYS.LAST_PROMPT_TIME, Date.now().toString());

    const isCapacitorNative = Boolean(
      (window as any).Capacitor?.isNativePlatform?.() ||
        (window as any).Capacitor?.platform === "android"
    );

    if (isCapacitorNative) {
      try {
        await InAppReview.requestReview();
        return;
      } catch (err) {
        console.warn("InAppReview failed, falling back to market URL", err);
        try {
          window.location.href = PLAY_STORE_MARKET_URL;
          return;
        } catch {
          // fallback to web
        }
      }
    }

    // Web browser or fallback
    window.open(PLAY_STORE_URL, "_blank");
  } catch (err) {
    console.error("Error launching review", err);
    window.open(PLAY_STORE_URL, "_blank");
  }
};

/**
 * Snooze the review prompt for 7 days.
 */
export const snoozeReviewPrompt = () => {
  triggerHaptic();
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_PROMPT_TIME, Date.now().toString());
    localStorage.setItem(STORAGE_KEYS.REVIEW_STATUS, "dismissed");
    notifyListeners(false);
  } catch {}
};

/**
 * Dismiss forever if user says "Not now / Don't ask again".
 */
export const dismissReviewPromptForever = () => {
  triggerHaptic();
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEW_STATUS, "never");
    notifyListeners(false);
  } catch {}
};
