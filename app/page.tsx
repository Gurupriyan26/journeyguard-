import Link from "next/link";
import Navbar from "@/components/common/Navbar";
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
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] -right-40 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="mx-auto max-w-5xl px-4 pt-12 pb-20 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md shadow-sm mb-6 animate-shimmer">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Consent-First Long-Distance Journey Tracking</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
            Travel peacefully.
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
              We&apos;ll wake them when you&apos;re close.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-400">
            JourneyGuard automatically alerts your family or loved ones when you enter
            their pickup radius — without keeping them awake all night watching a map.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex w-full max-w-md flex-col sm:flex-row gap-3.5">
            <Link
              href="/journey/create"
              className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-bold text-white transition-all duration-200 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02] shadow-lg shadow-blue-500/25 text-sm"
            >
              <Navigation className="h-4 w-4" />
              <span>Start a Journey</span>
            </Link>

            <Link
              href="/track"
              className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 px-6 py-4 font-bold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-white hover:border-slate-700 text-sm backdrop-blur"
            >
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>Follow a Journey</span>
            </Link>
          </div>

          {/* Interactive Live Demo Preview Card */}
          <div className="mt-14 w-full max-w-2xl rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl shadow-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl bg-blue-500/10 border-l border-b border-blue-500/20 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span>Live Simulation Preview</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  En Route
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Chennai → Coimbatore
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>ETA: ~45 mins • Alert Set at 50 km</span>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  42.8 <span className="text-sm text-slate-400 font-semibold">km</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center sm:justify-end gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Approaching Threshold
                </span>
              </div>
            </div>

            {/* Simulated progress visual */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: "88%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Chennai (Origin)</span>
                <span className="font-semibold text-blue-300">88% Completed</span>
                <span>Coimbatore (Destination)</span>
              </div>
            </div>
          </div>

          {/* 3-Step Visual Workflow */}
          <div className="mt-20 w-full">
            <h2 className="text-2xl font-bold text-white">How JourneyGuard Works</h2>
            <p className="text-xs text-slate-400 mt-1">Three simple steps for stress-free long-distance travel</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-left relative glass-card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-black text-sm border border-blue-500/20 mb-4">
                  01
                </div>
                <h3 className="font-bold text-white text-base">Start Your Journey</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Enter your destination. JourneyGuard captures your live GPS only while the journey is running.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-left relative glass-card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-black text-sm border border-cyan-500/20 mb-4">
                  02
                </div>
                <h3 className="font-bold text-white text-base">Share Private Link</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Send a temporary tracking link via WhatsApp. Your guardian does not need an account or app.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-left relative glass-card-hover">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-black text-sm border border-emerald-500/20 mb-4">
                  03
                </div>
                <h3 className="font-bold text-white text-base">Automatic Wake-Up Alert</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  When you cross into their chosen radius (e.g., 25 km), a loud alert sounds on their device.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<MapPin className="h-5 w-5 text-blue-400" />}
              title="Live Interactive Map"
              description="Real-time Leaflet map tracking without draining battery excessively."
            />
            <FeatureCard
              icon={<Bell className="h-5 w-5 text-amber-400" />}
              title="Threshold Audio Alerts"
              description="Plays a loud chime so guardians can sleep until it is time to leave."
            />
            <FeatureCard
              icon={<Share2 className="h-5 w-5 text-cyan-400" />}
              title="One-Tap WhatsApp Share"
              description="Share directly to WhatsApp with pre-formatted invitation text."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
              title="Consent & Privacy First"
              description="Encrypted tokens, no permanent history, stop sharing anytime."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 text-center text-xs text-slate-500 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>JourneyGuard • Consent-based journey tracking platform</span>
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 text-left glass-card-hover">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-white text-sm">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
