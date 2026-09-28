import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Universal safe haptic feedback utility.
 * Triggers native capacitor haptics on Android/iOS, with a silent web fallback.
 */
export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light): Promise<void> => {
  try {
    await Haptics.impact({ style });
  } catch {
    // In web browsers or unsupporting devices, fallback or silently ignore
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore vibration errors
      }
    }
  }
};

export const triggerNotificationHaptic = async (
  type: NotificationType = NotificationType.Success
): Promise<void> => {
  try {
    await Haptics.notification({ type });
  } catch {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([15, 30, 15]);
      } catch {
        // Ignore vibration errors
      }
    }
  }
};
