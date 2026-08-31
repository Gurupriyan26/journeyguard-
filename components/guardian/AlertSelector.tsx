"use client";

import { useState } from "react";
import { Bell, Volume2, CheckCircle2, ChevronRight, Sliders } from "lucide-react";
import { playAlertChime } from "@/lib/notifications";

interface AlertSelectorProps {
  currentDistanceKm: number;
  selectedThreshold: number;
  onSelectThreshold: (km: number) => void;
  triggeredThresholds: number[];
}

const PRESET_THRESHOLDS = [
  { km: 100, label: "100 km", desc: "Long heads-up" },
  { km: 50, label: "50 km", desc: "Start preparing" },
  { km: 25, label: "25 km", desc: "Head to stop/station" },
  { km: 10, label: "10 km", desc: "Arrival imminent" },
  { km: 5, label: "5 km", desc: "At the gate" },
];

export default function AlertSelector({
  currentDistanceKm,
  selectedThreshold,
  onSelectThreshold,
  triggeredThresholds,
}: AlertSelectorProps) {
  const [customVal, setCustomVal] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customVal);
    if (!isNaN(val) && val > 0) {
      onSelectThreshold(val);
      setIsCustom(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Arrival & Wake-Up Alert
            </h3>
            <p className="text-xs text-slate-400">
              Plays a loud sound when traveller enters this radius
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={playAlertChime}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition shadow-sm"
          title="Test Alert Chime"
        >
          <Volume2 className="h-3.5 w-3.5 text-blue-400" />
          <span>Test Sound</span>
        </button>
      </div>

      {/* Preset selection grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PRESET_THRESHOLDS.map(({ km, label, desc }) => {
          const isSelected = selectedThreshold === km;
          const isTriggered = triggeredThresholds.includes(km);
          const isPast = currentDistanceKm <= km;

          return (
            <button
              key={km}
              type="button"
              onClick={() => onSelectThreshold(km)}
              className={`p-3 rounded-xl text-left transition-all duration-200 border relative flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-blue-600/90 to-blue-700/90 text-white border-blue-400 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/30 scale-[1.02]"
                  : isTriggered
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                  : isPast
                  ? "bg-slate-900/40 text-slate-400 border-slate-800"
                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm tracking-tight">{label}</span>
                {isTriggered ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : isSelected ? (
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                ) : null}
              </div>

              <span
                className={`text-[10px] mt-1.5 leading-tight block ${
                  isSelected
                    ? "text-blue-100 font-medium"
                    : isTriggered
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {isTriggered ? "Triggered" : isPast ? "Inside range" : desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom threshold input footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {!isCustom ? (
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className="text-slate-400 hover:text-blue-400 transition flex items-center gap-1 font-medium"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Custom distance threshold...</span>
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 w-full">
            <input
              type="number"
              min="1"
              max="1000"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              placeholder="e.g. 35"
              autoFocus
              className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
            />
            <span className="text-slate-400">km radius</span>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-400 transition"
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className="text-slate-500 hover:text-slate-400 px-2 py-1 text-xs"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <span>Active alert at:</span>
          <strong className="text-blue-400 font-bold">{selectedThreshold} km</strong>
        </div>
      </div>
    </div>
  );
}
