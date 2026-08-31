"use client";

import { CheckCircle2, Navigation, Bell, Flag } from "lucide-react";

interface TripTimelineProps {
  startName?: string;
  destinationName: string;
  remainingDistanceKm: number;
  selectedThresholdKm: number;
  isCompleted: boolean;
}

export default function TripTimeline({
  startName,
  destinationName,
  remainingDistanceKm,
  selectedThresholdKm,
  isCompleted,
}: TripTimelineProps) {
  // Step completion logic
  const isStarted = true;
  const isMidTransit = remainingDistanceKm > selectedThresholdKm && !isCompleted;
  const isInProximity = remainingDistanceKm <= selectedThresholdKm && !isCompleted;

  const steps = [
    {
      label: "Departed",
      subtext: startName || "Origin Station",
      status: "done",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: "In Transit",
      subtext: isMidTransit ? `${remainingDistanceKm} km remaining` : "Passed mid-way",
      status: isCompleted || isInProximity ? "done" : "active",
      icon: <Navigation className="h-4 w-4 text-blue-400" />,
    },
    {
      label: `Proximity (${selectedThresholdKm}km Alert)`,
      subtext: isInProximity ? "Approaching stop" : `Triggers at ${selectedThresholdKm} km`,
      status: isCompleted ? "done" : isInProximity ? "active" : "upcoming",
      icon: <Bell className="h-4 w-4 text-amber-400" />,
    },
    {
      label: "Arrived",
      subtext: destinationName,
      status: isCompleted ? "done" : "upcoming",
      icon: <Flag className="h-4 w-4 text-rose-400" />,
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
        <span>Trip Progression</span>
        <span className="text-[11px] font-normal text-slate-400">Live Stage Tracker</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className={`p-3.5 rounded-2xl border transition-all ${
              step.status === "active"
                ? "bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/30"
                : step.status === "done"
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-slate-900/40 border-slate-800/80 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {step.icon}
                <span>Step {idx + 1}</span>
              </span>

              {step.status === "active" && (
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </div>

            <div className="font-bold text-xs text-white">{step.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{step.subtext}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
