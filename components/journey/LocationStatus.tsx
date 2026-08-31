"use client";

import { useEffect, useState } from "react";
import { Radio, AlertTriangle, ShieldCheck, Wifi } from "lucide-react";

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
  const [timeAgoText, setTimeAgoText] = useState("Just now");
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

      if (elapsedSeconds < 15) {
        setTimeAgoText("Live now (few seconds ago)");
        setIsStale(false);
      } else if (elapsedSeconds < 60) {
        setTimeAgoText(`Live (${elapsedSeconds}s ago)`);
        setIsStale(false);
      } else {
        const mins = Math.floor(elapsedSeconds / 60);
        setTimeAgoText(`Updated ${mins} min${mins > 1 ? "s" : ""} ago`);
        setIsStale(mins >= 3); // Flag stale if >3 minutes without GPS update
      }
    };

    updateStaleness();
    const interval = setInterval(updateStaleness, 4000);
    return () => clearInterval(interval);
  }, [lastUpdatedTimestamp]);

  // Accuracy quality classification
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
      {/* Active Sharing Banner */}
      <div
        className={`rounded-xl px-4 py-3 border flex items-center justify-between transition-all duration-300 ${
          isSharingActive
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
            : "bg-amber-950/40 border-amber-500/30 text-amber-300"
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
            <span className="text-xs font-bold">
              {isSharingActive ? "GPS Sharing Active" : "Location Sharing Paused"}
            </span>
            <span className="text-[10px] opacity-75">
              {isSharingActive ? "Broadcasting live coordinates" : "No GPS data sent"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
          <ShieldCheck className="h-3 w-3" />
          <span>Protected</span>
        </div>
      </div>

      {/* GPS Staleness and Satellite Accuracy */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          {isStale ? (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 animate-bounce" />
          ) : (
            <Radio className="h-4 w-4 text-blue-400 shrink-0" />
          )}

          <div className="flex flex-col">
            <span
              className={`font-semibold ${
                isStale ? "text-amber-300" : "text-slate-200"
              }`}
            >
              {timeAgoText}
            </span>
            {accuracyMeters !== undefined && accuracyMeters !== null && (
              <span className="text-[10px] text-slate-500 font-mono">
                {accuracyLevel} (±{Math.round(accuracyMeters)}m)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Wifi className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-[10px] font-mono text-slate-400">5s Refresh</span>
        </div>
      </div>
    </div>
  );
}
