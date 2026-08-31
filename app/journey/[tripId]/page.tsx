"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { BrowserLocationProvider, LocationReading } from "@/lib/location/browserLocationProvider";
import { calculateDistanceKm } from "@/lib/distance";
import JourneyMap from "@/components/maps/JourneyMap";
import DistanceCard from "@/components/journey/DistanceCard";
import LocationStatus from "@/components/journey/LocationStatus";
import ShareModal from "@/components/journey/ShareModal";
import { Trip } from "@/types/journey";
import {
  Share2,
  Square,
  Pause,
  Play,
  FlaskConical,
  Sparkles,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function ActiveJourneyPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationReading | null>(null);
  const [isSharingActive, setIsSharingActive] = useState(true);
  const [shareToken, setShareToken] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  const locationProviderRef = useRef<BrowserLocationProvider | null>(null);
  const unsubscribeGpsRef = useRef<(() => void) | null>(null);

  // 1. Load Trip Data (from Supabase or local sessionStorage)
  useEffect(() => {
    async function loadTrip() {
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem(`jg_trip_${tripId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setTrip(parsed);
            if (parsed.rawGuardianToken) {
              setShareToken(parsed.rawGuardianToken);
            }
            if (parsed.start_lat && parsed.start_lng) {
              setCurrentLocation({
                latitude: parsed.start_lat,
                longitude: parsed.start_lng,
                accuracy: 10,
                timestamp: Date.now(),
              });
            }
          } catch (e) {
            console.error("Error parsing local trip cache", e);
          }
        }
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("id", tripId)
          .single();

        if (data && !error) {
          setTrip(data);
        }

        // Fetch latest location
        const { data: locData } = await supabase
          .from("trip_locations")
          .select("*")
          .eq("trip_id", tripId)
          .order("recorded_at", { ascending: false })
          .limit(1);

        if (locData && locData.length > 0) {
          setCurrentLocation({
            latitude: locData[0].latitude,
            longitude: locData[0].longitude,
            accuracy: locData[0].accuracy,
            timestamp: new Date(locData[0].recorded_at).getTime(),
          });
        }
      }
    }

    loadTrip();
  }, [tripId]);

  // 2. Start GPS Tracking when sharing is active
  useEffect(() => {
    if (!isSharingActive || simulationMode) {
      if (unsubscribeGpsRef.current) {
        unsubscribeGpsRef.current();
        unsubscribeGpsRef.current = null;
      }
      return;
    }

    const provider = new BrowserLocationProvider({
      enableHighAccuracy: true,
      minIntervalMs: 5000,
    });
    locationProviderRef.current = provider;

    const stopTracking = provider.startTracking(
      async (reading) => {
        setCurrentLocation(reading);

        // Upload reading to Supabase
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from("trip_locations").insert({
              trip_id: tripId,
              latitude: reading.latitude,
              longitude: reading.longitude,
              accuracy: reading.accuracy,
              recorded_at: new Date(reading.timestamp).toISOString(),
            });
          } catch (err) {
            console.error("Failed to push location update:", err);
          }
        }
      },
      (err) => {
        console.warn("GPS tracking issue:", err.message);
      }
    );

    unsubscribeGpsRef.current = stopTracking;

    return () => {
      if (unsubscribeGpsRef.current) {
        unsubscribeGpsRef.current();
      }
    };
  }, [tripId, isSharingActive, simulationMode]);

  // 3. End Journey handler
  const handleEndJourney = async () => {
    if (!confirm("Are you sure you want to end this journey? Location sharing will stop immediately.")) {
      return;
    }

    setIsEnding(true);
    setIsSharingActive(false);

    if (unsubscribeGpsRef.current) {
      unsubscribeGpsRef.current();
    }

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("trips")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
        })
        .eq("id", tripId);
    }

    router.push("/");
  };

  // Remaining distance calculation
  const destLat = trip?.destination_lat || 11.0168;
  const destLng = trip?.destination_lng || 76.9558;
  const currentLat = currentLocation?.latitude || trip?.start_lat || 13.0827;
  const currentLng = currentLocation?.longitude || trip?.start_lng || 80.2707;

  const remainingKm = calculateDistanceKm(currentLat, currentLng, destLat, destLng);

  // Simulation step helper
  const simulateStepCloser = (targetRemainingKm: number) => {
    setSimulationMode(true);
    const simulatedReading: LocationReading = {
      latitude: destLat - (destLat - 13.0827) * (targetRemainingKm / 400),
      longitude: destLng - (destLng - 80.2707) * (targetRemainingKm / 400),
      accuracy: 8,
      timestamp: Date.now(),
      speed: 16.6, // ~60 km/h
    };

    setCurrentLocation(simulatedReading);

    if (isSupabaseConfigured && supabase) {
      supabase.from("trip_locations").insert({
        trip_id: tripId,
        latitude: simulatedReading.latitude,
        longitude: simulatedReading.longitude,
        accuracy: simulatedReading.accuracy,
        recorded_at: new Date().toISOString(),
      });
    }
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const token = shareToken || tripId;
    return `${window.location.origin}/track/${token}`;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between">
      <Navbar
        statusBadge={isSharingActive ? "Traveller Live" : "Sharing Paused"}
        badgeType={isSharingActive ? "active" : "neutral"}
      />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 w-full space-y-6 flex-1">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSharingActive(!isSharingActive)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                isSharingActive
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              {isSharingActive ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              onClick={handleEndJourney}
              disabled={isEnding}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold transition shadow-sm"
            >
              <Square className="h-3.5 w-3.5" />
              <span>{isEnding ? "Ending..." : "End Trip"}</span>
            </button>
          </div>
        </div>

        {/* Location Status Badge */}
        <LocationStatus
          isSharingActive={isSharingActive}
          lastUpdatedTimestamp={currentLocation?.timestamp}
          accuracyMeters={currentLocation?.accuracy}
        />

        {/* Distance Card */}
        <DistanceCard
          remainingDistanceKm={remainingKm}
          destinationName={trip?.destination_name || "Coimbatore"}
          startName={trip?.start_name || "Origin"}
          speedKmh={currentLocation?.speed}
        />

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Guardian Link</span>
          </button>

          <button
            onClick={handleEndJourney}
            className="w-full py-3.5 px-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Square className="h-4 w-4" />
            <span>Stop & End Trip</span>
          </button>
        </div>

        {/* Interactive Live Leaflet Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              <span>Live Route Map</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Broadcasting GPS
            </span>
          </div>

          <JourneyMap
            travellerPos={
              currentLocation
                ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                : null
            }
            destinationPos={{
              lat: destLat,
              lng: destLng,
              name: trip?.destination_name || "Destination",
            }}
          />
        </div>

        {/* Demo Simulation Controls */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">
                Testing / Demo Simulation
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Simulate movement
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Click any button below to immediately jump closer to test guardian alert triggers:
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => simulateStepCloser(120)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              120 km (Far)
            </button>
            <button
              onClick={() => simulateStepCloser(49)}
              className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition"
            >
              49 km (Trigger 50km)
            </button>
            <button
              onClick={() => simulateStepCloser(24)}
              className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-semibold transition"
            >
              24 km (Trigger 25km)
            </button>
            <button
              onClick={() => simulateStepCloser(4)}
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition"
            >
              4 km (Arrival Gate)
            </button>
          </div>
        </div>

        {/* Reusable Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={getShareUrl()}
          destinationName={trip?.destination_name || "Destination"}
        />
      </main>

      <footer className="py-6 text-center text-xs text-slate-600">
        JourneyGuard • Traveller Dashboard
      </footer>
    </div>
  );
}
