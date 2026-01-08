/**
 * Haptic feedback utilities for web
 * Uses navigator.vibrate when available, gracefully degrades when not
 */

/**
 * Soft haptic feedback (10ms)
 * Use for light interactions like button taps, icon clicks
 */
export function softHaptic(): void {
  if (typeof window === "undefined") return;
  
  try {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  } catch {
    // Silently fail if vibrate is not supported or blocked
  }
}

/**
 * Medium haptic feedback (16ms)
 * Use for more significant interactions
 */
export function mediumHaptic(): void {
  if (typeof window === "undefined") return;
  
  try {
    if (navigator.vibrate) {
      navigator.vibrate(16);
    }
  } catch {
    // Silently fail if vibrate is not supported or blocked
  }
}
