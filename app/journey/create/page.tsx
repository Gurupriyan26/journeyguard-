"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { getBatteryStatus, BatteryInfo } from "@/lib/battery";
import {
  MapPin,
  Navigation,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Bus,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCircle2,
  Phone,
  User,
  Bell,
  Sliders,
} from "lucide-react";
import DestinationAutocomplete from "@/components/journey/DestinationAutocomplete";

// Predefined popular hubs with descriptive tags & icons
const DESTINATION_PRESETS = [
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558, tag: "~500 km", region: "Kongu Region", icon: "🏙️" },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, tag: "Central Hub", region: "Capital", icon: "🏛️" },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, tag: "~350 km", region: "Karnataka", icon: "🏢" },
  { name: "Madurai", lat: 9.9252, lng: 78.1198, tag: "~460 km", region: "South TN", icon: "🛕" },
  { name: "Salem", lat: 11.6643, lng: 78.146, tag: "~340 km", region: "Central TN", icon: "⛰️" },
  { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047, tag: "~330 km", region: "Delta Hub", icon: "🏰" },
  { name: "Kochi", lat: 9.9312, lng: 76.2673, tag: "~680 km", region: "Kerala Coast", icon: "🌴" },
];

export default function CreateJourney() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [travellerName, setTravellerName] = useState("");
  const [travellerPhone, setTravellerPhone] = useState("");
  const [defaultThresholdKm, setDefaultThresholdKm] = useState<number>(50);
  const [batteryState, setBatteryState] = useState<BatteryInfo | null>(null);
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

  // Acquire GPS and Battery on mount
  const acquireGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let placeName = "Current Location";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await res.json();
          if (data && data.address) {
            placeName =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state_district ||
              "Current Location";
          }
        } catch {}

        setStartLocation({
          lat: latitude,
          lng: longitude,
          accuracy,
          name: placeName,
        });
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        setGpsError(
          "Could not acquire exact GPS location. Defaulting to Chennai hub."
        );
        setStartLocation({
          lat: 13.0827,
          lng: 80.2707,
          accuracy: 50,
          name: "Chennai",
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    acquireGps();
    getBatteryStatus().then((info) => setBatteryState(info));
  }, []);

  const handleStartJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let destLat = 11.0168;
      let destLng = 76.9558;

      if (destinationCoords) {
        destLat = destinationCoords.lat;
        destLng = destinationCoords.lng;
      } else {
        const cleanDest = destination.trim().toLowerCase();
        const matchedPreset = DESTINATION_PRESETS.find(
          (p) => p.name.toLowerCase() === cleanDest
        );

        if (matchedPreset) {
          destLat = matchedPreset.lat;
          destLng = matchedPreset.lng;
        } else {
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
          } catch {}
        }
      }

      const sLat = startLocation?.lat || 13.0827;
      const sLng = startLocation?.lng || 80.2707;
      const sName = startLocation?.name || "Chennai";

      const tripId = crypto.randomUUID();
      const rawGuardianToken = generateSecureToken(24);
      const tokenHash = await hashToken(rawGuardianToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (isSupabaseConfigured && supabase) {
        const { error: tripError } = await supabase.from("trips").insert({
          id: tripId,
          start_lat: sLat,
          start_lng: sLng,
          start_name: sName,
          destination_name: destination.trim(),
          destination_lat: destLat,
          destination_lng: destLng,
          traveller_name: travellerName.trim() || null,
          traveller_phone: travellerPhone.trim() || null,
          status: "active",
          started_at: new Date().toISOString(),
        });

        if (tripError) {
          console.warn("Supabase insert notice:", tripError.message);
        }

        await supabase.from("trip_locations").insert({
          trip_id: tripId,
          latitude: sLat,
          longitude: sLng,
          accuracy: startLocation?.accuracy || 10,
          battery_level: batteryState?.level ?? 85,
          is_charging: batteryState?.charging ?? true,
          recorded_at: new Date().toISOString(),
        });

        await supabase.from("guardian_access").insert({
          trip_id: tripId,
          access_token_hash: tokenHash,
          expires_at: expiresAt,
        });
      }

      const tripRecord = {
        id: tripId,
        start_lat: sLat,
        start_lng: sLng,
        start_name: sName,
        destination_name: destination.trim(),
        destination_lat: destLat,
        destination_lng: destLng,
        traveller_name: travellerName.trim() || null,
        traveller_phone: travellerPhone.trim() || null,
        default_threshold_km: defaultThresholdKm,
        status: "active",
        rawGuardianToken,
        tokenHash,
        expiresAt,
        started_at: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`jg_trip_${tripId}`, JSON.stringify(tripRecord));
          localStorage.setItem(`jg_trip_${tripId}`, JSON.stringify(tripRecord));
          localStorage.setItem(`jg_token_${rawGuardianToken}`, tripId);
        } catch (e) {
          console.warn("Storage write error:", e);
        }
      }

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 w-full flex-1 flex flex-col justify-center">
        {/* Page Header */}
        <div className="text-left mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 mb-3">
            <Bus className="h-6 w-6" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Start a Journey
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Set your destination. Once started, your family can track your live route and call you directly with 1 tap.
          </p>
        </div>

        {/* Creation Card */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <form onSubmit={handleStartJourney} className="space-y-6">
            {/* Starting Location Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Starting Point (Your GPS)
                </label>
                <button
                  type="button"
                  onClick={acquireGps}
                  disabled={isGettingGps}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition font-bold"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGettingGps ? "animate-spin" : ""}`} />
                  <span>{isGettingGps ? "Acquiring..." : "Refresh GPS"}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3.5 text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white">
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
                <p className="text-[11px] text-amber-400/90 mt-1.5">{gpsError}</p>
              )}
            </div>

            {/* Destination Autocomplete Field */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
                Where are you heading? (Live Auto-Suggestions)
              </label>

              <DestinationAutocomplete
                value={destination}
                onChange={(name, lat, lng) => {
                  setDestination(name);
                  if (lat !== undefined && lng !== undefined) {
                    setDestinationCoords({ lat, lng });
                  } else {
                    setDestinationCoords(null);
                  }
                }}
                placeholder="Type city, railway station, bus stand or town..."
                required
              />
            </div>

            {/* Sliding Popular Destination Carousel */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Popular Destination Hubs (Slide to choose):
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  ↔ Swipe sideways
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-hide snap-x">
                {DESTINATION_PRESETS.map((city) => {
                  const isSelected = destination.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => {
                        setDestination(city.name);
                        setDestinationCoords({ lat: city.lat, lng: city.lng });
                      }}
                      className={`snap-start shrink-0 w-36 sm:w-40 p-3.5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-b from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-lg shadow-blue-500/25 scale-[1.03] ring-2 ring-cyan-400/40"
                          : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{city.icon}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>

                      <div>
                        <div className="font-extrabold text-sm text-white">{city.name}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? "text-cyan-100" : "text-slate-400"
                          }`}
                        >
                          {city.tag} • {city.region}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Arrival Wake-Up Radius Selector */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Default Wake-Up Radius for Parents:</span>
                <span className="text-[10px] text-cyan-400 font-bold">Rings siren when you arrive here</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[50, 25, 10, 5].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setDefaultThresholdKm(km)}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold text-xs transition ${
                      defaultThresholdKm === km
                        ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/25"
                        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Traveller Info: Phone & Name for Direct Calling */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Direct Contact Info (Optional)
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  📞 Enables 1-Tap Calling for Parents
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={travellerName}
                    onChange={(e) => setTravellerName(e.target.value)}
                    placeholder="Your Name (e.g. Rahul)"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-3 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={travellerPhone}
                    onChange={(e) => setTravellerPhone(e.target.value)}
                    placeholder="Mobile (+91 98765 43210)"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-10 pr-3 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-xs text-cyan-200">
                    Consent-First Privacy & Zero-Lag GPS
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300">
                    Zero-lag continuous GPS tracking starts only after tapping &quot;Start Journey&quot;. Screen Wake-Lock will keep your phone active overnight.
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-rose-400 font-bold">{submitError}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!destination || isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-black text-white transition hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-40 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <Navigation className="h-4 w-4" />
              <span>{isSubmitting ? "Starting Journey..." : "Start & Generate Guardian Link"}</span>
            </button>
          </form>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600">
        JourneyGuard • Real-time Trip Privacy & Safety
      </footer>
    </div>
  );
}
