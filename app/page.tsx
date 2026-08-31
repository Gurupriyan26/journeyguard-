"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import { playAlertChime } from "@/lib/notifications";
import {
  Navigation,
  Compass,
  Bell,
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  Sparkles,
  ArrowRight,
  Share2,
  Sliders,
  Volume2,
  Car,
  Heart,
  Moon,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  // Interactive Journey Simulator state (0 = start, 100 = destination)
  const [simProgress, setSimProgress] = useState(78);
  const [activeTab, setActiveTab] = useState<"parent" | "traveller">("parent");

  // Calculate live values based on slider
  const totalDist = 480;
  const remainingDist = Math.max(0, Math.round(totalDist * (1 - simProgress / 100)));
  const isAlertTriggered = remainingDist <= 50 && remainingDist > 0;
  const isImminent = remainingDist <= 15 && remainingDist > 0;
  const isArrived = remainingDist === 0;

  const etaMins = Math.round((remainingDist / 60) * 60);
  const etaHours = Math.floor(etaMins / 60);
  const etaMinutes = etaMins % 60;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-600/20 via-cyan-500/15 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] -left-32 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-[60%] -right-32 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="mx-auto max-w-5xl px-4 pt-10 pb-16 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-300 backdrop-blur-md shadow-sm mb-6 animate-shimmer">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Consent-Based Long Distance Journey Protection</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl sm:leading-tight">
            Travel peacefully.
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300">
              We&apos;ll wake them when you&apos;re close.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
            JourneyGuard automatically rings a loud wake-up alert on your family&apos;s phone
            when you enter their pickup radius — so no one has to stay awake watching a map all night.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex w-full max-w-md flex-col sm:flex-row gap-3">
            <Link
              href="/journey/create"
              className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-bold text-white transition-all duration-200 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02] shadow-xl shadow-blue-500/25 text-sm"
            >
              <Navigation className="h-4 w-4" />
              <span>Start a Journey</span>
            </Link>

            <Link
              href="/track"
              className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-6 py-4 font-bold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-sm backdrop-blur"
            >
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>Follow a Journey</span>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE DRAG-TO-SIMULATE JOURNEY SLIDER (COOL SLIDING FEATURE) */}
          {/* ========================================================================= */}
          <div className="mt-14 w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 backdrop-blur-2xl text-left relative overflow-hidden transition-all">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Interactive Live Simulator
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
                Drag slider to test alerts
              </span>
            </div>

            {/* Trip Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <span className="text-xs font-bold text-slate-400">Route Preview:</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Chennai <span className="text-cyan-400">→</span> Coimbatore
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    ETA: <strong>{etaHours > 0 ? `${etaHours}h ` : ""}{etaMinutes}m</strong> • Speed: <strong>~65 km/h</strong>
                  </span>
                </p>
              </div>

              {/* Distance Remaining Highlight */}
              <div className="text-left sm:text-right">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-white">
                  {remainingDist} <span className="text-sm font-bold text-slate-400">km</span>
                </div>
                <span className="text-[11px] font-bold text-cyan-400 block mt-0.5 font-mono">
                  {simProgress}% Journey Completed
                </span>
              </div>
            </div>

            {/* Glowing Interactive Range Slider */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>📍 Chennai (0 km)</span>
                <span className="text-amber-400">🚨 50km Alert Zone</span>
                <span>🏁 Coimbatore (Destination)</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={simProgress}
                onChange={(e) => setSimProgress(Number(e.target.value))}
                className="w-full"
                aria-label="Simulate Journey Progress"
              />
            </div>

            {/* Dynamic Alarm Banner (Slides in when passing 50km threshold) */}
            {isAlertTriggered ? (
              <div className="rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-4 shadow-xl animate-slide-up">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-bounce">🚨</span>
                    <div>
                      <h4 className="font-black text-amber-200 text-xs sm:text-sm">
                        {isImminent ? "⚡ Arrival Imminent (Under 15 km)!" : "🔔 50 KM Wake-Up Alert Triggered!"}
                      </h4>
                      <p className="text-[11px] text-slate-200 mt-0.5">
                        Traveller is {remainingDist} km away. Time for parents to wake up & leave for the station!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={playAlertChime}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shrink-0 shadow-md"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Test Chime</span>
                  </button>
                </div>
              </div>
            ) : isArrived ? (
              <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 p-4 shadow-xl animate-slide-up">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h4 className="font-black text-emerald-200 text-xs sm:text-sm">
                      Safely Arrived at Destination!
                    </h4>
                    <p className="text-[11px] text-slate-200 mt-0.5">
                      Journey finished. Location sharing terminated securely.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-center text-xs text-slate-400">
                <span>💡 Drag the slider past 90% to see how the proximity alarm wakes up guardians.</span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SLIDING TAB SWITCHER: PARENT CARE VS TRAVELLER */}
          {/* ========================================================================= */}
          <div className="mt-20 w-full max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Built for Both Sides of the Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Click below to switch between parent and traveller experiences
            </p>

            {/* Sliding Pill Tab Buttons */}
            <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setActiveTab("parent")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "parent"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>For Parents & Guardians</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("traveller")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "traveller"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Navigation className="h-4 w-4" />
                <span>For Travellers</span>
              </button>
            </div>

            {/* Sliding Tab Content */}
            <div className="mt-8">
              {activeTab === "parent" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-slide-in-left">
                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
                      <Moon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Night Sleep Protection</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Sleep peacefully without anxiety. JourneyGuard sounds a loud alarm only when your child enters your pickup radius.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
                      <Car className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">When to Leave Calculator</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Tells you the exact clock time to leave home so you don&apos;t wait alone at the station for hours in the dark.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Zero App Install Required</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Parents don&apos;t need to download an app or create an account. Simply open the WhatsApp link in any phone browser.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-slide-in-right">
                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">100% Consent Controlled</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Your location is only broadcast while the journey is active. Pause or terminate sharing with a single tap anytime.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
                      <Radio className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Battery Efficient GPS</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Optimized interval polling preserves your phone battery on long overnight bus, train, or road journeys.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Instant WhatsApp Link</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Generate encrypted single-use tracking links ready to send to your family in one click.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 text-center text-xs text-slate-500 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>JourneyGuard • Real-time Family Care & Journey Tracking Platform</span>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/journey/create" className="hover:text-white transition">
              Start Trip
            </Link>
            <Link href="/track" className="hover:text-white transition">
              Follow Trip
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
