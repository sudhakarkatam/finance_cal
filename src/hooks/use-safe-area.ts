import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Hook to detect and manage safe area insets on mobile devices
 * Particularly useful for Android devices with navigation bars (3-button, gesture, etc.)
 */
export const useSafeArea = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);

      // Get safe area insets from CSS variables
      const top = parseSafeAreaValue(
        style.getPropertyValue('--safe-area-inset-top')
      );
      const right = parseSafeAreaValue(
        style.getPropertyValue('--safe-area-inset-right')
      );
      const bottom = parseSafeAreaValue(
        style.getPropertyValue('--safe-area-inset-bottom')
      );
      const left = parseSafeAreaValue(
        style.getPropertyValue('--safe-area-inset-left')
      );

      setInsets({ top, right, bottom, left });
    };

    // Helper function to parse CSS value to number
    const parseSafeAreaValue = (value: string): number => {
      if (!value || value === '0px' || value === '0') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Initial update
    updateInsets();

    // Update on resize
    const handleResize = () => {
      setTimeout(updateInsets, 100);
    };

    // Update on orientation change
    const handleOrientationChange = () => {
      setTimeout(updateInsets, 200);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // For Android devices, also listen for visibility changes
    // as the navigation bar might appear/disappear
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(updateInsets, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return insets;
};

/**
 * Hook to get the bottom safe area inset specifically
 * Most useful for bottom navigation bars
 */
export const useBottomSafeArea = (): number => {
  const { bottom } = useSafeArea();
  return bottom;
};

/**
 * Hook to check if device has safe area insets
 */
export const useHasSafeArea = (): boolean => {
  const insets = useSafeArea();
  return insets.top > 0 || insets.right > 0 || insets.bottom > 0 || insets.left > 0;
};
