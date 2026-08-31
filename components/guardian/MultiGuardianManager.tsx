"use client";

import { useState } from "react";
import { Users, UserPlus, Bell, Check, Copy, Shield, Share2, Sliders } from "lucide-react";

interface GuardianRole {
  id: string;
  name: string;
  relation: string;
  thresholdKm: number;
  icon: string;
}

interface MultiGuardianManagerProps {
  currentDistanceKm: number;
  baseShareUrl: string;
  onSelectActiveThreshold?: (km: number) => void;
}

const DEFAULT_GUARDIANS: GuardianRole[] = [
  { id: "dad", name: "Dad / Father", relation: "Driver / Station Pickup", thresholdKm: 50, icon: "👨" },
  { id: "mom", name: "Mom / Mother", relation: "Home Preparation", thresholdKm: 25, icon: "👩" },
  { id: "sibling", name: "Sibling / Friend", relation: "Arrival Receiver", thresholdKm: 10, icon: "🧑" },
];

export default function MultiGuardianManager({
  currentDistanceKm,
  baseShareUrl,
  onSelectActiveThreshold,
}: MultiGuardianManagerProps) {
  const [guardians, setGuardians] = useState<GuardianRole[]>(DEFAULT_GUARDIANS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCopyLink = (roleId: string) => {
    const url = `${baseShareUrl}?role=${roleId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(roleId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUpdateThreshold = (roleId: string, newKm: number) => {
    setGuardians((prev) =>
      prev.map((g) => (g.id === roleId ? { ...g, thresholdKm: newKm } : g))
    );
    if (onSelectActiveThreshold) {
      onSelectActiveThreshold(newKm);
    }
  };

  return (
    <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Family & Guardian Profiles
            </h3>
            <p className="text-xs text-slate-400">
              Each family member can have their own custom wake-up distance
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20 font-bold hidden sm:inline">
          Multi-Guardian Support
        </span>
      </div>

      {/* Guardian cards list */}
      <div className="space-y-2.5">
        {guardians.map((g) => {
          const isTriggered = currentDistanceKm <= g.thresholdKm;
          return (
            <div
              key={g.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isTriggered
                  ? "bg-amber-950/30 border-amber-500/40"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{g.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {g.relation}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    Alert Radius: <strong className="text-cyan-300">{g.thresholdKm} km</strong>
                    {isTriggered && (
                      <span className="text-amber-400 font-bold ml-2">🚨 Inside Alert Zone!</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Threshold Adjuster & Share Button */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Distance options */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  {[50, 25, 10, 5].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => handleUpdateThreshold(g.id, km)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        g.thresholdKm === km
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {km}k
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyLink(g.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    copiedId === g.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                  title="Copy Custom Link"
                >
                  {copiedId === g.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
