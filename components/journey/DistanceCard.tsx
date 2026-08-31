"use client";

import { useState, useEffect } from "react";
import { Clock, Navigation, Gauge, MapPin } from "lucide-react";

interface DistanceCardProps {
  remainingDistanceKm: number;
  totalDistanceKm?: number;
  destinationName: string;
  startName?: string;
  speedKmh?: number | null;
}

export default function DistanceCard({
  remainingDistanceKm,
  totalDistanceKm,
  destinationName,
  startName,
  speedKmh,
}: DistanceCardProps) {
  // Approximate ETA assuming average long-distance bus/car speed of ~60 km/h if speed is unavailable
  const effectiveSpeed = speedKmh && speedKmh > 10 ? speedKmh : 60;
  const estimatedHours = Math.floor(remainingDistanceKm / effectiveSpeed);
  const estimatedMinutes = Math.round((remainingDistanceKm % effectiveSpeed) * (60 / effectiveSpeed));

  // Compute calculated arrival time safely after client mount to prevent SSR hydration mismatches
  const [formattedArrivalTime, setFormattedArrivalTime] = useState<string>("");

  useEffect(() => {
    const arrivalTime = new Date(Date.now() + (estimatedHours * 60 + estimatedMinutes) * 60 * 1000);
    setFormattedArrivalTime(
      arrivalTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [estimatedHours, estimatedMinutes]);

  // Calculate progress percentage
  const total = totalDistanceKm && totalDistanceKm > remainingDistanceKm ? totalDistanceKm : remainingDistanceKm + 30;
  const progressPercent = Math.min(100, Math.max(5, Math.round(((total - remainingDistanceKm) / total) * 100)));

  return (
    <div className="glass-panel-glow rounded-2xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Stats Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>Destination</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            {destinationName}
          </h2>
          {startName && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Departed from</span>
              <strong className="text-slate-300 font-medium">{startName}</strong>
            </p>
          )}
        </div>

        {/* Distance Remaining Highlight */}
        <div className="text-right shrink-0">
          <div className="inline-flex items-baseline gap-1 text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
            {remainingDistanceKm}
            <span className="text-sm font-semibold text-slate-400">km</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
            remaining
          </span>
        </div>
      </div>

      {/* Progress Bar Visualizer */}
      <div className="mt-5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[120px]">{startName || "Origin"}</span>
          <span className="font-semibold text-blue-300 font-mono">{progressPercent}% Completed</span>
          <span className="truncate max-w-[120px] text-right">{destinationName}</span>
        </div>

        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 transition-all duration-700 ease-out shadow-sm shadow-blue-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Metric Badges Grid */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Estimated Duration */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Estimated Time
            </span>
            <span className="text-xs font-bold text-slate-100">
              {estimatedHours > 0 ? `${estimatedHours}h ` : ""}
              {estimatedMinutes}m
            </span>
          </div>
        </div>

        {/* Expected Arrival Clock */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              ETA (Clock)
            </span>
            <span className="text-xs font-bold text-indigo-200">
              {formattedArrivalTime ? `~${formattedArrivalTime}` : "--:--"}
            </span>
          </div>
        </div>

        {/* Speed */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Movement Speed
            </span>
            <span className="text-xs font-bold text-emerald-300 font-mono">
              {speedKmh !== undefined && speedKmh !== null && speedKmh > 0
                ? `${Math.round(speedKmh * 3.6)} km/h`
                : "~60 km/h (Avg)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
