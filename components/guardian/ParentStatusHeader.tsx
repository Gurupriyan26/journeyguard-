"use client";

import { useState } from "react";
import { Phone, MessageCircle, Share2, CheckCircle2, ShieldCheck, Heart } from "lucide-react";
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

  // Status classification for parent reassurance
  const statusHeadline = isSharingActive
    ? speedKmh && speedKmh > 15
      ? "Safe & Moving on Route"
      : "Journey Active (Steady/Stationary)"
    : "Journey Paused / Resting";

  const statusSubtext = isSharingActive
    ? `Live GPS signal from ${travellerName ? `${travellerName}'s device` : "traveller"} is healthy.`
    : "The traveller has temporarily paused GPS or reached a rest stop.";

  const cleanPhone = travellerPhone ? travellerPhone.replace(/\s+/g, "") : "";

  return (
    <>
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-blue-950/40 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Reassuring Safety Badge */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Parent Care Mode Active
                </span>
                {travellerName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                    {travellerName}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                {statusHeadline}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {statusSubtext}
              </p>
            </div>
          </div>

          {/* Quick Actions: Direct Call & Family Share */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                <Phone className="h-4 w-4" />
                <span>Call {travellerName || "Traveller"}</span>
              </a>
            )}

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
            >
              <Share2 className="h-4 w-4 text-cyan-400" />
              <span>Share with Family</span>
            </button>
          </div>
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
