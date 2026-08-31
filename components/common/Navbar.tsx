"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Compass, Navigation, Radio, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

interface NavbarProps {
  statusBadge?: string;
  badgeType?: "active" | "guardian" | "neutral";
}

export default function Navbar({ statusBadge, badgeType = "neutral" }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-3 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={() => triggerHaptic("tap")}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span>JourneyGuard</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 -mt-0.5 hidden sm:inline">
              Safe Mobile Journeys • Smart Wake-Up Siren
            </span>
          </div>
        </Link>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2.5">
          {statusBadge && (
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border backdrop-blur-md shadow-sm ${
                badgeType === "active"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                  : badgeType === "guardian"
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-900/90 text-slate-300 border-slate-800"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  badgeType === "active"
                    ? "bg-emerald-400 animate-ping"
                    : badgeType === "guardian"
                    ? "bg-cyan-400 animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              <span>{statusBadge}</span>
            </div>
          )}

          {pathname !== "/journey/create" && pathname !== "/" && !pathname.startsWith("/journey/") && (
            <Link
              href="/journey/create"
              onClick={() => triggerHaptic("tap")}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-black transition shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Start Journey</span>
            </Link>
          )}

          {pathname !== "/track" && pathname !== "/" && !pathname.startsWith("/track/") && (
            <Link
              href="/track"
              onClick={() => triggerHaptic("tap")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Track Trip</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
