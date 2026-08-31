"use client";

import { useEffect, useState } from "react";
import { Radio, AlertTriangle, ShieldCheck, Wifi, Signal } from "lucide-react";

interface LocationStatusProps {
  isSharingActive: boolean;
  lastUpdatedTimestamp?: number | string | null;
  accuracyMeters?: number | null;
}

export default function LocationStatus({
  isSharingActive,
  lastUpdatedTimestamp,
  accuracyMeters,
}: LocationStatusProps) {
  const [timeAgoText, setTimeAgoText] = useState("Acquiring GPS");
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (!lastUpdatedTimestamp) {
      setTimeAgoText("Awaiting first GPS fix");
      setIsStale(false);
      return;
    }

    const updateStaleness = () => {
      const ts =
        typeof lastUpdatedTimestamp === "string"
          ? new Date(lastUpdatedTimestamp).getTime()
          : lastUpdatedTimestamp;
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));

      if (elapsedSeconds < 10) {
        setTimeAgoText("Live signal (just now)");
        setIsStale(false);
      } else if (elapsedSeconds < 60) {
        setTimeAgoText(`Live (${elapsedSeconds}s ago)`);
        setIsStale(false);
      } else {
        const mins = Math.floor(elapsedSeconds / 60);
        setTimeAgoText(`Updated ${mins}m ago`);
        setIsStale(mins >= 3);
      }
    };

    updateStaleness();
    const interval = setInterval(updateStaleness, 3000);
    return () => clearInterval(interval);
  }, [lastUpdatedTimestamp]);

  const accuracyLevel =
    accuracyMeters === undefined || accuracyMeters === null
      ? "Unknown"
      : accuracyMeters <= 20
      ? "High Precision"
      : accuracyMeters <= 60
      ? "Good"
      : "Approximate";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {/* Active Sharing Status */}
      <div
        className={`rounded-2xl px-4 py-3 border flex items-center justify-between transition-all duration-300 ${
          isSharingActive
            ? "glass-panel-emerald"
            : "glass-panel-amber"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isSharingActive && (
              <span className="absolute h-4 w-4 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span
              className={`relative block h-2.5 w-2.5 rounded-full ${
                isSharingActive ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-black text-white">
              {isSharingActive ? "Live GPS Stream Active" : "Location Stream Paused"}
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              {isSharingActive ? "Broadcasting 2.5s coordinates" : "No GPS data sent"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black">
          <ShieldCheck className="h-3 w-3" />
          <span>Encrypted</span>
        </div>
      </div>

      {/* GPS Staleness and Satellite Accuracy */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/75 backdrop-blur-xl px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          {isStale ? (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 animate-bounce" />
          ) : (
            <Radio className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
          )}

          <div className="flex flex-col">
            <span
              className={`font-bold ${
                isStale ? "text-amber-300" : "text-slate-100"
              }`}
            >
              {timeAgoText}
            </span>
            {accuracyMeters !== undefined && accuracyMeters !== null && (
              <span className="text-[10px] text-slate-400 font-mono">
                {accuracyLevel} (±{Math.round(accuracyMeters)}m)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Signal className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-cyan-300">2.5s Stream</span>
        </div>
      </div>
    </div>
  );
}
