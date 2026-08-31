"use client";

import { useState } from "react";
import { Bell, Volume2, CheckCircle2, Sliders, Moon, ShieldCheck, Music } from "lucide-react";
import { playAlertSound, AlarmSoundType } from "@/lib/notifications";

interface AlertSelectorProps {
  currentDistanceKm: number;
  selectedThreshold: number;
  onSelectThreshold: (km: number) => void;
  triggeredThresholds: number[];
  selectedSound?: AlarmSoundType;
  onSelectSound?: (sound: AlarmSoundType) => void;
}

const PRESET_THRESHOLDS = [
  { km: 100, label: "100 km", desc: "Long Heads-up (~1.5 hrs)" },
  { km: 50, label: "50 km", desc: "Wake up & get ready" },
  { km: 25, label: "25 km", desc: "Start driving to station" },
  { km: 10, label: "10 km", desc: "Arrival in ~10-15 mins" },
  { km: 5, label: "5 km", desc: "Entering city / gate" },
];

const SOUND_OPTIONS: Array<{ id: AlarmSoundType; label: string; icon: string }> = [
  { id: "loud_siren", label: "🚨 Loud Siren (Piercing)", icon: "🚨" },
  { id: "alarm_clock", label: "⏰ Digital Beep", icon: "⏰" },
  { id: "fanfare", label: "🎺 Bugle Fanfare", icon: "🎺" },
  { id: "gentle_chime", label: "🔔 Soft Chime", icon: "🔔" },
];

export default function AlertSelector({
  currentDistanceKm,
  selectedThreshold,
  onSelectThreshold,
  triggeredThresholds,
  selectedSound = "loud_siren",
  onSelectSound,
}: AlertSelectorProps) {
  const [customVal, setCustomVal] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [activeSound, setActiveSound] = useState<AlarmSoundType>(selectedSound);

  const handleSoundChange = (sound: AlarmSoundType) => {
    setActiveSound(sound);
    if (onSelectSound) onSelectSound(sound);
    playAlertSound(sound); // Preview immediately
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customVal);
    if (!isNaN(val) && val > 0) {
      onSelectThreshold(val);
      setIsCustom(false);
    }
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 transition-all duration-300 space-y-5">
      {/* Reassuring Night Sleep Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Night Sleep & Wake-Up Alarm</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                Max Decibel
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Your phone will ring a loud siren when your traveller enters this radius.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => playAlertSound(activeSound)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-black transition shadow-sm shrink-0"
          title="Test Siren Sound"
        >
          <Volume2 className="h-4 w-4" />
          <span>Test Sound</span>
        </button>
      </div>

      {/* Preset selection grid */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          1. Choose Wake-Up Distance:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {PRESET_THRESHOLDS.map(({ km, label, desc }) => {
            const isSelected = selectedThreshold === km;
            const isTriggered = triggeredThresholds.includes(km);
            const isPast = currentDistanceKm <= km;

            return (
              <button
                key={km}
                type="button"
                onClick={() => onSelectThreshold(km)}
                className={`p-3.5 rounded-2xl text-left transition-all duration-200 border relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white border-blue-400 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30 scale-[1.02]"
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
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isSelected ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                  ) : null}
                </div>

                <span
                  className={`text-[11px] mt-2 leading-tight block ${
                    isSelected
                      ? "text-blue-100 font-semibold"
                      : isTriggered
                      ? "text-emerald-400 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {isTriggered ? "Triggered" : isPast ? "Within radius" : desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alarm Tone Selector */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>2. Choose Alarm Sound Tone:</span>
          <span className="text-[10px] text-cyan-400 font-normal">Tap to preview sound</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOUND_OPTIONS.map((snd) => (
            <button
              key={snd.id}
              type="button"
              onClick={() => handleSoundChange(snd.id)}
              className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                activeSound === snd.id
                  ? "bg-gradient-to-r from-red-600/90 to-amber-600/90 text-white border-red-400 shadow-md"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
              }`}
            >
              <span>{snd.icon}</span>
              <span className="truncate">{snd.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Distance footer */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {!isCustom ? (
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className="text-slate-400 hover:text-cyan-300 transition flex items-center gap-1 font-semibold"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Set custom radius (km)...</span>
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="1000"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              placeholder="e.g. 35"
              autoFocus
              className="w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-slate-400">km</span>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-400 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className="text-slate-500 hover:text-slate-400 text-xs px-2"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Active Wake-Up Radius:</span>
          <strong className="text-cyan-300 font-bold text-xs">{selectedThreshold} km</strong>
        </div>
      </div>
    </div>
  );
}
