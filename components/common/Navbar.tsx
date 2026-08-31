"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Compass, Navigation } from "lucide-react";

interface NavbarProps {
  statusBadge?: string;
  badgeType?: "active" | "guardian" | "neutral";
}

export default function Navbar({ statusBadge, badgeType = "neutral" }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              JourneyGuard
            </span>
            <span className="text-[10px] font-medium text-slate-400 -mt-1 hidden sm:inline">
              Safe Journeys • Smarter Pickups
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {statusBadge && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                badgeType === "active"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : badgeType === "guardian"
                  ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  badgeType === "active"
                    ? "bg-emerald-400 animate-pulse"
                    : badgeType === "guardian"
                    ? "bg-blue-400"
                    : "bg-slate-400"
                }`}
              />
              <span>{statusBadge}</span>
            </div>
          )}

          {pathname !== "/journey/create" && pathname !== "/" && !pathname.startsWith("/journey/") && (
            <Link
              href="/journey/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-medium transition shadow-sm"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Start Journey</span>
            </Link>
          )}

          {pathname !== "/track" && pathname !== "/" && !pathname.startsWith("/track/") && (
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Follow</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
