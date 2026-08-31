"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import {
  MapPin,
  Navigation,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Bus,
} from "lucide-react";

// Predefined coordinates for common South Indian travel hubs (for quick testing)
const DESTINATION_PRESETS: Array<{ name: string; lat: number; lng: number; tag: string }> = [
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558, tag: "~500 km" },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, tag: "Central Hub" },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, tag: "~350 km" },
  { name: "Madurai", lat: 9.9252, lng: 78.1198, tag: "~460 km" },
  { name: "Salem", lat: 11.6643, lng: 78.146, tag: "~340 km" },
  { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047, tag: "~330 km" },
  { name: "Kochi", lat: 9.9312, lng: 76.2673, tag: "~680 km" },
];

export default function CreateJourney() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    name?: string;
  } | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Request browser location on load or on tap
  const acquireGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStartLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          name: "Current GPS Location",
        });
        setIsGettingGps(false);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        // Fallback default: Chennai coordinates for test scenario
        setStartLocation({
          lat: 13.0827,
          lng: 80.2707,
          accuracy: 50,
          name: "Chennai (Default / GPS unavailable)",
        });
        setGpsError("GPS permission denied or unavailable. Using default starting location.");
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    acquireGps();
  }, []);

  const handleStartJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Resolve destination coordinates (preset or geocoded fallback)
      const cleanDest = destination.trim().toLowerCase();
      let destLat = 11.0168; // Default Coimbatore lat
      let destLng = 76.9558; // Default Coimbatore lng

      const matchedPreset = DESTINATION_PRESETS.find(
        (p) => p.name.toLowerCase() === cleanDest
      );

      if (matchedPreset) {
        destLat = matchedPreset.lat;
        destLng = matchedPreset.lng;
      } else {
        // Try quick geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              destination
            )}&limit=1`
          );
          const data = await res.json();
          if (data && data.length > 0) {
            destLat = parseFloat(data[0].lat);
            destLng = parseFloat(data[0].lon);
          }
        } catch {
          // Fallback to default
        }
      }

      // Starting coordinates
      const sLat = startLocation?.lat || 13.0827; // Chennai
      const sLng = startLocation?.lng || 80.2707;
      const sName = startLocation?.name || "Chennai";

      const tripId = crypto.randomUUID();
      const rawGuardianToken = generateSecureToken(24);
      const tokenHash = await hashToken(rawGuardianToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (isSupabaseConfigured && supabase) {
        // 2. Insert into Supabase
        const { error: tripError } = await supabase.from("trips").insert({
          id: tripId,
          start_lat: sLat,
          start_lng: sLng,
          start_name: sName,
          destination_name: destination.trim(),
          destination_lat: destLat,
          destination_lng: destLng,
          status: "active",
          started_at: new Date().toISOString(),
        });

        if (tripError) {
          throw new Error(tripError.message);
        }

        // Insert initial location record
        await supabase.from("trip_locations").insert({
          trip_id: tripId,
          latitude: sLat,
          longitude: sLng,
          accuracy: startLocation?.accuracy || 10,
          recorded_at: new Date().toISOString(),
        });

        // Insert guardian token hash
        await supabase.from("guardian_access").insert({
          trip_id: tripId,
          access_token_hash: tokenHash,
          expires_at: expiresAt,
        });
      }

      // Store raw token and trip data locally in browser session
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `jg_trip_${tripId}`,
          JSON.stringify({
            id: tripId,
            start_lat: sLat,
            start_lng: sLng,
            start_name: sName,
            destination_name: destination.trim(),
            destination_lat: destLat,
            destination_lng: destLng,
            status: "active",
            rawGuardianToken,
            tokenHash,
            expiresAt,
            started_at: new Date().toISOString(),
          })
        );
      }

      // 3. Navigate to active trip screen
      router.push(`/journey/${tripId}`);
    } catch (err: any) {
      console.error("Failed to create journey:", err);
      setSubmitError(err?.message || "Failed to start journey. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 w-full">
        {/* Page Header */}
        <div className="text-left mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 mb-4">
            <Bus className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Start a Journey
          </h1>

          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Set your destination. Once started, you get a secure link to share with guardians
            so they know when to prepare for pickup.
          </p>
        </div>

        {/* Creation Card */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <form onSubmit={handleStartJourney} className="space-y-6">
            {/* Starting Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Starting Point (Your GPS)
                </label>
                <button
                  type="button"
                  onClick={acquireGps}
                  disabled={isGettingGps}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-cyan-300 transition font-medium"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGettingGps ? "animate-spin" : ""}`} />
                  <span>{isGettingGps ? "Acquiring..." : "Refresh GPS"}</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3.5 text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {startLocation?.name || "Detecting GPS location..."}
                  </span>
                </div>
                {startLocation && (
                  <span className="text-[11px] font-mono text-slate-400">
                    ±{Math.round(startLocation.accuracy || 10)}m
                  </span>
                )}
              </div>

              {gpsError && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400/90 mt-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>

            {/* Destination Input */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Destination City / Place
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Coimbatore, Salem, Chennai..."
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                />
              </div>

              {/* Quick Preset Hubs */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Popular Destinations (One-tap select):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DESTINATION_PRESETS.slice(0, 6).map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => setDestination(city.name)}
                      className={`p-2.5 rounded-xl border text-left transition text-xs ${
                        destination.toLowerCase() === city.name.toLowerCase()
                          ? "bg-blue-600/90 text-white border-blue-400 shadow-sm"
                          : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-bold">{city.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{city.tag}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy & Consent Guarantee */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-xs text-blue-200">
                    Consent-first privacy guarantee
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    Location broadcasting begins only when you start the journey. You can pause or permanently stop sharing with 1-tap at any moment.
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-rose-400 font-medium">{submitError}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!destination || isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-bold text-white transition hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-40 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <Navigation className="h-4 w-4" />
              <span>{isSubmitting ? "Starting Journey..." : "Start & Generate Guardian Link"}</span>
            </button>
          </form>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600">
        JourneyGuard • Real-time Trip Privacy
      </footer>
    </div>
  );
}
