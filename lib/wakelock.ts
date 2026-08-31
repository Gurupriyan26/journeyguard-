/**
 * Screen Wake Lock API Helper
 * Prevents mobile screens from sleeping or throttling background GPS during journeys.
 */

let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === "undefined" || !("wakeLock" in navigator)) {
    return false;
  }

  try {
    wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
    
    wakeLockSentinel.addEventListener("release", () => {
      wakeLockSentinel = null;
    });

    return true;
  } catch (err) {
    console.warn("Screen Wake Lock could not be acquired:", err);
    return false;
  }
}

export async function releaseScreenWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {}
    wakeLockSentinel = null;
  }
}

export function isWakeLockActive(): boolean {
  return wakeLockSentinel !== null && !wakeLockSentinel.released;
}
