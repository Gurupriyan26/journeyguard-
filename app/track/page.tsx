"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import { Compass, Search, ArrowRight, Sparkles, KeyRound } from "lucide-react";

export default function TrackLookupPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    let token = tokenInput.trim();
    if (!token) {
      setErrorMsg("Please enter a tracking token or paste the shared link.");
      return;
    }

    if (token.includes("/track/")) {
      const parts = token.split("/track/");
      token = parts[parts.length - 1].split("?")[0].replace("/", "");
    }

    if (!token) {
      setErrorMsg("Invalid tracking token or link format.");
      return;
    }

    router.push(`/track/${encodeURIComponent(token)}`);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-12 flex-1 flex flex-col justify-center w-full">
        <div className="glass-panel-glow rounded-3xl p-7 sm:p-9 text-center backdrop-blur-xl relative">
          {/* Compass Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
            <Compass className="h-7 w-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Follow a Journey
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Enter the private tracking token or paste the full tracking link sent by the traveller.
          </p>

          <form onSubmit={handleTrack} className="mt-7 space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Paste token or link (e.g. 7f9a2b...)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono transition"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 text-left font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3.5 font-bold text-white transition hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 text-sm"
            >
              <Search className="h-4 w-4" />
              <span>Track Live Journey</span>
            </button>
          </form>

          {/* Quick Demo Test Section */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Testing without a live link?</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              You can start a simulated journey from the creator page or enter any active token.
            </p>
            <Link
              href="/journey/create"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-cyan-300 transition"
            >
              <span>Create a new test trip</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600">
        JourneyGuard • Private Guardian Tracking Portal
      </footer>
    </div>
  );
}
