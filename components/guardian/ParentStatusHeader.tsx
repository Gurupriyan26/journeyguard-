"use client";

import { useState } from "react";
import { Phone, MessageCircle, Share2, ShieldCheck, Volume2, Check, BellRing } from "lucide-react";
import { playAlertSound, unlockAudioContext } from "@/lib/notifications";
import { triggerHaptic } from "@/lib/haptics";
import ShareModal from "@/components/journey/ShareModal";

interface ParentStatusHeaderProps {
  destinationName: string;
  isSharingActive: boolean;
  shareUrl: string;
  speedKmh?: number | null;
  travellerName?: string | null;
  travellerPhone?: string | null;
}

export default function ParentStatusHeader({
  destinationName,
  isSharingActive,
  shareUrl,
  speedKmh,
  travellerName,
  travellerPhone,
}: ParentStatusHeaderProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAlarmArmed, setIsAlarmArmed] = useState(false);

  const handleArmAlarm = () => {
    unlockAudioContext();
    triggerHaptic("success");
    playAlertSound("gentle_chime");
    setIsAlarmArmed(true);
  };

  // Status classification for parent reassurance
  const statusHeadline = isSharingActive
    ? speedKmh && speedKmh > 15
      ? "Safe & Moving on Route"
      : "Journey Active (Steady/Stationary)"
    : "Journey Paused / Resting";

  const cleanPhone = travellerPhone ? travellerPhone.replace(/\s+/g, "") : "";

  return (
    <>
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/50 via-slate-900/95 to-blue-950/50 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
        {/* Top Status & Safety Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  100% Automatic Tracking Active
                </span>
                {travellerName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-extrabold">
                    {travellerName}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                {statusHeadline}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                You don&apos;t need to configure anything. Just leave this page open on your phone or nightstand.
              </p>
            </div>
          </div>

          {/* Quick Actions: Direct Call & Family Share */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
            {cleanPhone ? (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg shadow-emerald-600/30 active:scale-95"
              >
                <Phone className="h-4 w-4" />
                <span>Call {travellerName || "Traveller"}</span>
              </a>
            ) : (
              <a
                href="tel:"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg shadow-emerald-600/30 active:scale-95"
              >
                <Phone className="h-4 w-4" />
                <span>Call Phone</span>
              </a>
            )}

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
            >
              <Share2 className="h-4 w-4 text-cyan-400" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Wake-Up Alarm Arming Banner for Parents */}
        <div className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isAlarmArmed
            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
            : "bg-blue-950/60 border-blue-500/40 text-blue-100"
        }`}>
          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 shrink-0">
              {isAlarmArmed ? <Check className="h-4 w-4 text-emerald-400" /> : <BellRing className="h-4 w-4 text-cyan-300 animate-pulse" />}
            </div>
            <div>
              <span className="font-extrabold block">
                {isAlarmArmed ? "✅ Wake-Up Siren is Armed & Ready!" : "Tap below once to test and arm your night alarm"}
              </span>
              <span className="text-[11px] text-slate-300">
                {isAlarmArmed
                  ? "Your phone will sound a loud alarm when your traveller is close to arriving."
                  : "Ensures your phone will ring at full volume even while you are sleeping."}
              </span>
            </div>
          </div>

          {!isAlarmArmed ? (
            <button
              type="button"
              onClick={handleArmAlarm}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs transition shadow-lg shadow-blue-500/30 shrink-0 self-start sm:self-center"
            >
              🔊 Tap to Enable Siren
            </button>
          ) : (
            <button
              type="button"
              onClick={() => playAlertSound("loud_siren")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] transition shrink-0 self-start sm:self-center"
            >
              Test Siren Sound
            </button>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        destinationName={destinationName}
      />
    </>
  );
}
