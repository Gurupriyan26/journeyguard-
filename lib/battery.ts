/**
 * Battery Status API Helper
 * Reads traveller battery level and charging status to reassure guardians.
 */

export interface BatteryInfo {
  level: number; // 0 to 100
  charging: boolean;
}

export async function getBatteryStatus(): Promise<BatteryInfo | null> {
  if (typeof window === "undefined" || !("getBattery" in navigator)) {
    return null;
  }

  try {
    const battery = await (navigator as any).getBattery();
    return {
      level: Math.round(battery.level * 100),
      charging: Boolean(battery.charging),
    };
  } catch (err) {
    return null;
  }
}
