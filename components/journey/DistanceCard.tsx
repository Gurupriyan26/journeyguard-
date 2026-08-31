"use client";

import { useState, useEffect } from "react";
import { Clock, Navigation, Gauge, MapPin, Sparkles, Flag, ArrowRight } from "lucide-react";

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
  // Approximate ETA assuming average speed of ~60 km/h if device speed is unavailable
  const effectiveSpeed = speedKmh && speedKmh > 10 ? speedKmh : 60;
  const estimatedHours = Math.floor(remainingDistanceKm / effectiveSpeed);
  const estimatedMinutes = Math.round((remainingDistanceKm % effectiveSpeed) * (60 / effectiveSpeed));

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
  const total = totalDistanceKm && totalDistanceKm > remainingDistanceKm ? totalDistanceKm : remainingDistanceKm + 40;
  const progressPercent = Math.min(100, Math.max(5, Math.round(((total - remainingDistanceKm) / total) * 100)));

  // SVG Circular Ring Calculation (Radius 40)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden space-y-5">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Stats Header with Circular Progress Ring */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>Destination</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {destinationName}
          </h2>

          {startName && (
            <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <span>Origin:</span>
              <strong className="text-slate-200">{startName}</strong>
            </p>
          )}
        </div>

        {/* Circular Progress Ring & Distance */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-white font-mono leading-none">
              {remainingDistanceKm}
            </span>
            <span className="text-[10px] uppercase font-bold text-cyan-300">
              km left
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Visualizer */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1 text-slate-300">
            <span>{startName || "Start"}</span>
          </span>
          <span className="font-extrabold text-cyan-300 font-mono">
            {progressPercent}% On Route
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span>{destinationName}</span>
          </span>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-700 ease-out shadow-lg shadow-cyan-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Metric Badges */}
      <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Estimated Duration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-400 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Time Left
            </span>
            <span className="text-xs font-black text-white">
              {estimatedHours > 0 ? `${estimatedHours}h ` : ""}
              {estimatedMinutes} mins
            </span>
          </div>
        </div>

        {/* Expected Arrival Clock */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Arrival Clock
            </span>
            <span className="text-xs font-black text-indigo-200 font-mono">
              {formattedArrivalTime ? formattedArrivalTime : "--:--"}
            </span>
          </div>
        </div>

        {/* Speed */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Speed
            </span>
            <span className="text-xs font-black text-emerald-300 font-mono">
              {speedKmh !== undefined && speedKmh !== null && speedKmh > 0
                ? `${Math.round(speedKmh)} km/h`
                : "~60 km/h"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
