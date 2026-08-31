"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { BrowserLocationProvider, LocationReading } from "@/lib/location/browserLocationProvider";
import { calculateDistanceKm } from "@/lib/distance";
import { requestScreenWakeLock, releaseScreenWakeLock } from "@/lib/wakelock";
import JourneyMap from "@/components/maps/JourneyMap";
import DistanceCard from "@/components/journey/DistanceCard";
import LocationStatus from "@/components/journey/LocationStatus";
import BatterySpeedCard from "@/components/journey/BatterySpeedCard";
import GuardianShareCard from "@/components/journey/GuardianShareCard";
import ShareModal from "@/components/journey/ShareModal";
import { Trip } from "@/types/journey";
import {
  Share2,
  Square,
  Pause,
  Play,
  MapPin,
  ArrowLeft,
  Sliders,
  Sun,
  Zap,
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
  const [simSliderVal, setSimSliderVal] = useState<number>(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const locationProviderRef = useRef<BrowserLocationProvider | null>(null);
  const unsubscribeGpsRef = useRef<(() => void) | null>(null);

  // 1. Toggle Screen Wake Lock
  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      await releaseScreenWakeLock();
      setWakeLockActive(false);
    } else {
      const success = await requestScreenWakeLock();
      setWakeLockActive(success);
    }
  };

  // 2. Load Trip Data from Storage or Supabase
  useEffect(() => {
    async function loadTrip() {
      let foundTrip: any = null;

      if (typeof window !== "undefined") {
        // Try sessionStorage first, then localStorage
        const sessionCached = sessionStorage.getItem(`jg_trip_${tripId}`);
        const localCached = localStorage.getItem(`jg_trip_${tripId}`);
        const rawCached = sessionCached || localCached;

        if (rawCached) {
          try {
            foundTrip = JSON.parse(rawCached);
            setTrip(foundTrip);
            if (foundTrip.rawGuardianToken) {
              setShareToken(foundTrip.rawGuardianToken);
            }
            if (foundTrip.start_lat && foundTrip.start_lng) {
              setCurrentLocation({
                latitude: foundTrip.start_lat,
                longitude: foundTrip.start_lng,
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
        try {
          const { data, error } = await supabase
            .from("trips")
            .select("*")
            .eq("id", tripId)
            .single();

          if (data && !error) {
            setTrip((prev) => ({ ...prev, ...data }));
          }

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
              speed_kmh: locData[0].speed_kmh,
              heading: locData[0].heading,
              battery_level: locData[0].battery_level,
              is_charging: locData[0].is_charging,
              timestamp: new Date(locData[0].recorded_at).getTime(),
            });
          }
        } catch (err) {
          console.warn("Supabase query notice:", err);
        }
      }
    }

    loadTrip();
    requestScreenWakeLock().then((active) => setWakeLockActive(active));

    return () => {
      releaseScreenWakeLock();
    };
  }, [tripId]);

  // 3. Start Zero-Lag GPS Tracking
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
      minIntervalMs: 2500, // 2.5s streaming
    });
    locationProviderRef.current = provider;

    const stopTracking = provider.startTracking(
      async (reading) => {
        setCurrentLocation(reading);

        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from("trip_locations").insert({
              trip_id: tripId,
              latitude: reading.latitude,
              longitude: reading.longitude,
              accuracy: reading.accuracy,
              speed_kmh: reading.speed_kmh,
              heading: reading.heading,
              battery_level: reading.battery_level,
              is_charging: reading.is_charging,
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

  // 4. End Journey handler
  const handleEndJourney = async () => {
    if (!confirm("Are you sure you want to end this journey? Location sharing will stop immediately.")) {
      return;
    }

    setIsEnding(true);
    setIsSharingActive(false);
    releaseScreenWakeLock();

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

  const destLat = trip?.destination_lat || 11.0168;
  const destLng = trip?.destination_lng || 76.9558;
  const startLat = trip?.start_lat || 13.0827;
  const startLng = trip?.start_lng || 80.2707;

  const currentLat = currentLocation?.latitude || startLat;
  const currentLng = currentLocation?.longitude || startLng;

  const remainingKm = calculateDistanceKm(currentLat, currentLng, destLat, destLng);

  // Smooth Interactive Slider Simulation Step
  const handleSliderChange = (percentage: number) => {
    setSimSliderVal(percentage);
    setSimulationMode(true);

    const fraction = percentage / 100;
    const newLat = startLat + (destLat - startLat) * fraction;
    const newLng = startLng + (destLng - startLng) * fraction;

    const simulatedReading: LocationReading = {
      latitude: newLat,
      longitude: newLng,
      accuracy: 8,
      timestamp: Date.now(),
      speed: 18.0,
      speed_kmh: 65,
      battery_level: 82,
      is_charging: true,
    };

    setCurrentLocation(simulatedReading);

    if (isSupabaseConfigured && supabase) {
      supabase.from("trip_locations").insert({
        trip_id: tripId,
        latitude: simulatedReading.latitude,
        longitude: simulatedReading.longitude,
        accuracy: simulatedReading.accuracy,
        speed_kmh: 65,
        battery_level: 82,
        is_charging: true,
        recorded_at: new Date().toISOString(),
      });
    }
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const token = shareToken || (trip as any)?.rawGuardianToken || tripId;
    return `${window.location.origin}/track/${token}`;
  };

  const currentShareUrl = getShareUrl();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between">
      <Navbar
        statusBadge={isSharingActive ? "Zero-Lag GPS Active" : "Sharing Paused"}
        badgeType={isSharingActive ? "active" : "neutral"}
      />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 w-full space-y-5 flex-1">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Screen Wake Lock Toggle */}
            <button
              type="button"
              onClick={toggleWakeLock}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-bold transition ${
                wakeLockActive
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Keep screen awake during travel"
            >
              <Sun className={`h-3.5 w-3.5 ${wakeLockActive ? "text-amber-400 animate-spin" : ""}`} />
              <span>{wakeLockActive ? "Screen Awake" : "Wake Lock Off"}</span>
            </button>

            <button
              onClick={() => setIsSharingActive(!isSharingActive)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-bold transition ${
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
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-sm"
            >
              <Square className="h-3.5 w-3.5" />
              <span>{isEnding ? "Ending..." : "End Trip"}</span>
            </button>
          </div>
        </div>

        {/* PROMINENT GUARDIAN SHARE LINK CARD (Always visible!) */}
        <GuardianShareCard
          shareUrl={currentShareUrl}
          destinationName={trip?.destination_name || "Destination"}
          travellerName={trip?.traveller_name}
        />

        {/* Location Status Badge */}
        <LocationStatus
          isSharingActive={isSharingActive}
          lastUpdatedTimestamp={currentLocation?.timestamp}
          accuracyMeters={currentLocation?.accuracy}
        />

        {/* Real-time Battery, Speed & GPS Card */}
        <BatterySpeedCard
          batteryLevel={currentLocation?.battery_level}
          isCharging={currentLocation?.is_charging}
          speedKmh={currentLocation?.speed_kmh}
          accuracyMeters={currentLocation?.accuracy}
          heading={currentLocation?.heading}
        />

        {/* Distance Card */}
        <DistanceCard
          remainingDistanceKm={remainingKm}
          destinationName={trip?.destination_name || "Coimbatore"}
          startName={trip?.start_name || "Origin"}
          speedKmh={currentLocation?.speed_kmh}
        />

        {/* Interactive Live Map with Satellite Switcher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span>Live Route Map</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Broadcasting 2.5s GPS
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

        {/* Interactive Movement Simulator */}
        <div className="glass-panel-glow rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Movement Simulator
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">
              {simSliderVal}% Towards Destination
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Slide forward to simulate moving towards {trip?.destination_name} and trigger your guardian&apos;s alert chimes:
          </p>

          <input
            type="range"
            min="0"
            max="100"
            value={simSliderVal}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full mb-3"
            aria-label="Simulate movement towards destination"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
            <span>Origin ({trip?.start_name || "Start"})</span>
            <span className="text-amber-400">50km Alarm Zone</span>
            <span>Arrival ({trip?.destination_name || "End"})</span>
          </div>
        </div>

        {/* Reusable Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={currentShareUrl}
          destinationName={trip?.destination_name || "Destination"}
        />
      </main>

      <footer className="py-6 text-center text-xs text-slate-600">
        JourneyGuard • Traveller Control Console
      </footer>
    </div>
  );
}
