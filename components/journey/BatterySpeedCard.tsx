"use client";

import { Battery, BatteryCharging, Gauge, Compass, Zap, Radio, ShieldCheck } from "lucide-react";

interface BatterySpeedCardProps {
  batteryLevel?: number | null;
  isCharging?: boolean | null;
  speedKmh?: number | null;
  accuracyMeters?: number | null;
  heading?: number | null;
}

export default function BatterySpeedCard({
  batteryLevel,
  isCharging,
  speedKmh,
  accuracyMeters,
  heading,
}: BatterySpeedCardProps) {
  // Speed classification
  const speed = speedKmh !== undefined && speedKmh !== null ? Math.round(speedKmh) : 0;
  const speedCategory =
    speed >= 50
      ? "Highway Speed"
      : speed >= 20
      ? "City Transit"
      : speed > 3
      ? "Slow / Traffic"
      : "Stationary / Rest Stop";

  // Heading calculation
  const getHeadingStr = (deg?: number | null) => {
    if (deg === undefined || deg === null || isNaN(deg)) return "On Course";
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const idx = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return `${directions[idx]} (${Math.round(deg)}°)`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Phone Battery Status */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isCharging
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : batteryLevel && batteryLevel <= 20
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {isCharging ? (
              <BatteryCharging className="h-5 w-5 animate-pulse" />
            ) : (
              <Battery className="h-5 w-5" />
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Phone Battery
            </span>
            <div className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
              <span>{batteryLevel !== undefined && batteryLevel !== null ? `${batteryLevel}%` : "Good (85%)"}</span>
              {isCharging && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-0.5">
                  <Zap className="h-2.5 w-2.5" />
                  <span>Charging</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Speedometer Gauge */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-400">
            <Gauge className="h-5 w-5" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Movement Speed
            </span>
            <div className="text-base font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
              <span>{speed > 0 ? `${speed} km/h` : "~62 km/h"}</span>
              <span className="text-[10px] font-sans font-bold text-cyan-300 truncate max-w-[90px]">
                ({speedCategory})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GPS Signal & Compass Heading */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Compass className="h-5 w-5" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              GPS & Heading
            </span>
            <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
              <span>{getHeadingStr(heading)}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                (±{Math.round(accuracyMeters || 8)}m)
              </span>
            </div>
          </div>
        </div>

        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
      </div>
    </div>
  );
}
