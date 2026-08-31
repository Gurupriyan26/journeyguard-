/**
 * Mobile Hardware Haptic Feedback Engine
 * Provides physical vibrations for button clicks, arrival alarms, and proximity alerts on Android & iOS.
 */

export type HapticPattern = "tap" | "success" | "warning" | "alarm";

export function triggerHaptic(type: HapticPattern = "tap") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (type) {
      case "tap":
        // Subtle 15ms tap vibration
        navigator.vibrate(15);
        break;

      case "success":
        // Light double pulse
        navigator.vibrate([20, 50, 20]);
        break;

      case "warning":
        // Stronger warning pulse
        navigator.vibrate([40, 80, 40]);
        break;

      case "alarm":
        // Emergency wake-up repeating vibration
        navigator.vibrate([300, 100, 300, 100, 300, 100, 500]);
        break;
    }
  } catch (err) {
    // Vibration blocked or unsupported
  }
}
