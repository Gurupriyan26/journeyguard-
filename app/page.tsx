"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import { playAlertSound } from "@/lib/notifications";
import { triggerHaptic } from "@/lib/haptics";
import {
  Navigation,
  Compass,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Share2,
  Sliders,
  Volume2,
  Car,
  Heart,
  Moon,
  Battery,
  Gauge,
  Phone,
  Zap,
  Smartphone,
} from "lucide-react";

export default function Home() {
  const [simProgress, setSimProgress] = useState(78);
  const [activeTab, setActiveTab] = useState<"parent" | "traveller">("parent");

  const totalDist = 480;
  const remainingDist = Math.max(0, Math.round(totalDist * (1 - simProgress / 100)));
  const isAlertTriggered = remainingDist <= 50 && remainingDist > 0;
  const isImminent = remainingDist <= 15 && remainingDist > 0;
  const isArrived = remainingDist === 0;

  const etaMins = Math.round((remainingDist / 60) * 60);
  const etaHours = Math.floor(etaMins / 60);
  const etaMinutes = etaMins % 60;

  const handleSliderChange = (val: number) => {
    setSimProgress(val);
    if (val >= 90) {
      triggerHaptic("alarm");
    } else {
      triggerHaptic("tap");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-600/20 via-cyan-500/15 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] -left-32 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-[60%] -right-32 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black text-cyan-300 backdrop-blur-md shadow-sm mb-6 animate-pulse-glow">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Mobile App • Zero-Lag Real-Time Safety Tracking</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl sm:leading-tight">
            Travel peacefully.
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-300">
              We&apos;ll wake them when you&apos;re close.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
            JourneyGuard automatically rings a loud emergency siren on your family&apos;s phone
            when you enter their pickup radius — so parents can sleep peacefully without staring at maps all night.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex w-full max-w-md flex-col sm:flex-row gap-3">
            <Link
              href="/journey/create"
              onClick={() => triggerHaptic("tap")}
              className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-black text-white transition-all duration-200 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02] shadow-xl shadow-blue-500/30 text-sm active:scale-95"
            >
              <Navigation className="h-4 w-4" />
              <span>Start a Journey</span>
            </Link>

            <Link
              href="/track"
              onClick={() => triggerHaptic("tap")}
              className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-6 py-4 font-black text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-sm backdrop-blur active:scale-95"
            >
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>Track with Code</span>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE DRAG-TO-SIMULATE JOURNEY SLIDER & TELEMETRY PREVIEW */}
          {/* ========================================================================= */}
          <div className="mt-12 w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 backdrop-blur-2xl text-left relative overflow-hidden transition-all space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sliders className="h-4 w-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  Interactive Live Simulator
                </span>
              </div>

              <span className="text-[11px] font-mono text-cyan-300 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-500/30 font-bold">
                Slide to test wake-up siren
              </span>
            </div>

            {/* Live Telemetry Preview Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Battery className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Battery</span>
                  <span className="text-xs font-black text-white flex items-center gap-1">
                    <span>88%</span>
                    <Zap className="h-2.5 w-2.5 text-amber-400" />
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-400 shrink-0">
                  <Gauge className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Speed</span>
                  <span className="text-xs font-black text-cyan-300 font-mono">68 km/h</span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Remaining</span>
                  <span className="text-xs font-black text-white font-mono">
                    {etaHours > 0 ? `${etaHours}h ` : ""}{etaMinutes}m
                  </span>
                </div>
              </div>
            </div>

            {/* Trip Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400">Simulated Route:</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Chennai <span className="text-cyan-400">→</span> Coimbatore
                </h3>
              </div>

              {/* Distance Remaining Highlight */}
              <div className="text-left sm:text-right">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-white font-mono">
                  {remainingDist} <span className="text-sm font-bold text-slate-400 font-sans">km left</span>
                </div>
                <span className="text-[11px] font-extrabold text-cyan-400 block mt-0.5 font-mono">
                  {simProgress}% Route Completed
                </span>
              </div>
            </div>

            {/* Glowing Interactive Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-extrabold text-slate-400">
                <span>📍 Chennai (Start)</span>
                <span className="text-amber-400">🚨 50km Alert Zone</span>
                <span>🏁 Coimbatore (Arrival)</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={simProgress}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full"
                aria-label="Simulate Journey Progress"
              />
            </div>

            {/* Dynamic Alarm Banner */}
            {isAlertTriggered ? (
              <div className="rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 p-4 shadow-2xl animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">🚨</span>
                    <div>
                      <h4 className="font-black text-amber-200 text-sm">
                        {isImminent ? "⚡ Arrival Imminent (Under 15 km)!" : "🔔 50 KM Wake-Up Alert Triggered!"}
                      </h4>
                      <p className="text-[11px] text-slate-200 mt-0.5 font-medium">
                        Traveller is {remainingDist} km away. Siren rings and wakes up parents automatically!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("alarm");
                      playAlertSound("loud_siren");
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition shrink-0 shadow-lg shadow-amber-500/30"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Test Siren</span>
                  </button>
                </div>
              </div>
            ) : isArrived ? (
              <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 p-4 shadow-xl animate-slide-up">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h4 className="font-black text-emerald-200 text-sm">
                      Safely Arrived at Destination!
                    </h4>
                    <p className="text-[11px] text-slate-200 mt-0.5">
                      Journey finished. Location sharing terminated securely.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center text-xs text-slate-400 font-medium">
                <span>💡 Slide forward past 90% to trigger the loud wake-up siren.</span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SLIDING TAB SWITCHER: PARENT CARE VS TRAVELLER */}
          {/* ========================================================================= */}
          <div className="mt-20 w-full max-w-4xl">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Designed for Both Parents & Travellers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select below to view features tailored for your side of the journey
            </p>

            {/* Sliding Pill Tab Buttons */}
            <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("tap");
                  setActiveTab("parent");
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
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
                onClick={() => {
                  triggerHaptic("tap");
                  setActiveTab("traveller");
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
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
                    <h3 className="font-bold text-white text-base">Night Sleep Siren</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Sleep peacefully. JourneyGuard rings a loud siren only when your traveller enters your pickup zone.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
                      <Phone className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">1-Tap Direct Call</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Instant 1-tap phone and WhatsApp calling right from the alarm screen to coordinate pickup.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Zero App Install Required</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Parents don&apos;t need to download anything. Simply open the WhatsApp link in any browser.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left animate-slide-in-right">
                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Consent-First Privacy</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Your GPS is broadcast only while active. Pause or permanently stop location sharing with a single tap.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Screen Wake-Lock</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Keeps your phone screen and GPS active overnight so background sleep never halts tracking.
                    </p>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 glass-card-hover">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Install as Mobile App</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Install as a standalone PWA on Android & iPhone with haptic feedback and offline capabilities.
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
          <span>JourneyGuard • Professional Family Care & Safe Journey Platform</span>
          <div className="flex items-center gap-4 text-slate-400 font-semibold">
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
