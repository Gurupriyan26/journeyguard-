"use client";

import { useEffect } from "react";
import { Phone, MessageCircle, VolumeX, AlertTriangle, ShieldAlert, Navigation, Car } from "lucide-react";
import { startPersistentAlarm, stopPersistentAlarm, AlarmSoundType } from "@/lib/notifications";

interface AlarmTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingDistanceKm: number;
  destinationName: string;
  travellerName?: string | null;
  travellerPhone?: string | null;
  soundType?: AlarmSoundType;
}

export default function AlarmTriggerModal({
  isOpen,
  onClose,
  remainingDistanceKm,
  destinationName,
  travellerName,
  travellerPhone,
  soundType = "loud_siren",
}: AlarmTriggerModalProps) {
  useEffect(() => {
    if (isOpen) {
      startPersistentAlarm(soundType);
    } else {
      stopPersistentAlarm();
    }

    return () => {
      stopPersistentAlarm();
    };
  }, [isOpen, soundType]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    stopPersistentAlarm();
    onClose();
  };

  const cleanPhone = travellerPhone ? travellerPhone.replace(/\s+/g, "") : "";
  const phoneCallUrl = cleanPhone ? `tel:${cleanPhone}` : "tel:";
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
        `Hi ${travellerName || "there"}, JourneyGuard alert triggered! You are now ${remainingDistanceKm} km from ${destinationName}. Are you close?`
      )}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background pulsing red aura */}
      <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-pulse" />

      <div className="w-full max-w-lg rounded-3xl border-2 border-red-500/80 bg-slate-950 p-6 sm:p-8 shadow-2xl text-center relative z-10 overflow-hidden">
        {/* Pulsing Alarm Icon */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-2xl shadow-red-500/50 animate-bounce">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider mb-2 animate-pulse">
          🚨 Wake-Up Proximity Alert Triggered
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Traveller is Entering Pickup Zone!
        </h2>

        <div className="my-5 p-4 rounded-2xl border border-slate-800 bg-slate-900/90 text-left space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Remaining Distance:</span>
            <strong className="text-2xl font-black text-red-400 font-mono">
              {remainingDistanceKm} km
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Destination:</span>
            <strong className="text-white font-bold">{destinationName}</strong>
          </div>
          {travellerName && (
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Traveller:</span>
              <strong className="text-cyan-300 font-bold">{travellerName}</strong>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          The siren is sounding to wake you up. Time to get ready and head to the station/stop.
        </p>

        {/* Action Buttons: Phone Call & WhatsApp */}
        <div className="space-y-3">
          {cleanPhone ? (
            <a
              href={phoneCallUrl}
              onClick={stopPersistentAlarm}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition shadow-xl shadow-emerald-600/30 scale-[1.02]"
            >
              <Phone className="h-5 w-5" />
              <span>Call Traveller Directly ({travellerPhone})</span>
            </a>
          ) : (
            <a
              href="tel:"
              onClick={stopPersistentAlarm}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition shadow-xl shadow-emerald-600/30"
            >
              <Phone className="h-5 w-5" />
              <span>Make Direct Phone Call</span>
            </a>
          )}

          {cleanPhone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopPersistentAlarm}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Call / Message</span>
            </a>
          )}

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3.5 px-4 rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <VolumeX className="h-4 w-4 text-slate-400" />
            <span>I Am Awake • Stop Siren Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
