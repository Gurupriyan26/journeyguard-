"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { hashToken } from "@/lib/tokens";
import { calculateDistanceKm, hasCrossedThreshold } from "@/lib/distance";
import { playAlertChime, requestNotificationPermission, showSystemNotification } from "@/lib/notifications";
import JourneyMap from "@/components/maps/JourneyMap";
import DistanceCard from "@/components/journey/DistanceCard";
import LocationStatus from "@/components/journey/LocationStatus";
import AlertSelector from "@/components/guardian/AlertSelector";
import { Trip, TripLocation } from "@/types/journey";
import {
  BellRing,
  BellOff,
  Volume2,
  AlertTriangle,
  Radio,
  MapPin,
  ArrowLeft,
  X,
} from "lucide-react";

export default function GuardianTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [latestLocation, setLatestLocation] = useState<TripLocation | null>(null);
  const [previousDistance, setPreviousDistance] = useState<number | null>(null);
  const [selectedThreshold, setSelectedThreshold] = useState<number>(50); // Default 50km
  const [triggeredThresholds, setTriggeredThresholds] = useState<number[]>([]);
  const [activeAlertBanner, setActiveAlertBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const previousDistanceRef = useRef<number | null>(null);
  const triggeredThresholdsRef = useRef<number[]>([]);

  // Keep refs in sync
  useEffect(() => {
    previousDistanceRef.current = previousDistance;
    triggeredThresholdsRef.current = triggeredThresholds;
  }, [previousDistance, triggeredThresholds]);

  // Request browser notification permission
  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      setNotificationEnabled(granted);
    });
  }, []);

  // Fetch / Poll trip and latest location
  useEffect(() => {
    let isMounted = true;

    async function fetchTripData() {
      try {
        let foundTrip: Trip | null = null;
        let foundLocation: TripLocation | null = null;

        // 1. Try local cache / session storage first
        if (typeof window !== "undefined") {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith("jg_trip_")) {
              try {
                const item = JSON.parse(sessionStorage.getItem(key) || "{}");
                if (item.rawGuardianToken === token || item.id === token) {
                  foundTrip = item;
                  if (item.start_lat && item.start_lng) {
                    foundLocation = {
                      id: "init",
                      trip_id: item.id,
                      latitude: item.start_lat,
                      longitude: item.start_lng,
                      accuracy: 10,
                      recorded_at: new Date().toISOString(),
                    };
                  }
                  break;
                }
              } catch {}
            }
          }
        }

        // 2. Query Supabase using token hash
        if (isSupabaseConfigured && supabase) {
          const tokenHash = await hashToken(token);

          // Find guardian access record
          const { data: accessData } = await supabase
            .from("guardian_access")
            .select("trip_id, expires_at")
            .eq("access_token_hash", tokenHash)
            .limit(1);

          let targetTripId = accessData && accessData.length > 0 ? accessData[0].trip_id : null;

          if (!targetTripId && token.length === 36) {
            targetTripId = token;
          }

          if (targetTripId) {
            const { data: tripData } = await supabase
              .from("trips")
              .select("*")
              .eq("id", targetTripId)
              .single();

            if (tripData) {
              foundTrip = tripData;
            }

            // Fetch latest location
            const { data: locData } = await supabase
              .from("trip_locations")
              .select("*")
              .eq("trip_id", targetTripId)
              .order("recorded_at", { ascending: false })
              .limit(1);

            if (locData && locData.length > 0) {
              foundLocation = locData[0];
            }
          }
        }

        if (!isMounted) return;

        if (!foundTrip) {
          setErrorMsg("Journey not found or tracking link has expired.");
          setIsLoading(false);
          return;
        }

        setTrip(foundTrip);
        setIsLoading(false);

        if (foundLocation) {
          setLatestLocation(foundLocation);

          // Calculate current distance
          const currentDist = calculateDistanceKm(
            foundLocation.latitude,
            foundLocation.longitude,
            foundTrip.destination_lat,
            foundTrip.destination_lng
          );

          // Check threshold alert triggers
          const prevDist = previousDistanceRef.current;
          const triggeredList = triggeredThresholdsRef.current;

          if (
            !triggeredList.includes(selectedThreshold) &&
            hasCrossedThreshold(prevDist, currentDist, selectedThreshold)
          ) {
            // Trigger Alert!
            const newTriggered = [...triggeredList, selectedThreshold];
            setTriggeredThresholds(newTriggered);
            triggeredThresholdsRef.current = newTriggered;

            const alertText = `🚨 Traveller is now approx ${currentDist} km from ${foundTrip.destination_name}. Time to prepare for pickup!`;
            setActiveAlertBanner(alertText);
            playAlertChime();
            showSystemNotification(
              `JourneyGuard Alert: ${foundTrip.destination_name}`,
              alertText
            );
          }

          setPreviousDistance(currentDist);
        }
      } catch (err: any) {
        console.error("Tracking fetch error:", err);
      }
    }

    fetchTripData();
    // Poll updates every 5 seconds
    const interval = setInterval(fetchTripData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, selectedThreshold]);

  const destLat = trip?.destination_lat || 11.0168;
  const destLng = trip?.destination_lng || 76.9558;
  const travLat = latestLocation?.latitude || trip?.start_lat || 13.0827;
  const travLng = latestLocation?.longitude || trip?.start_lng || 80.2707;

  const currentDistanceKm = calculateDistanceKm(travLat, travLng, destLat, destLng);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-16 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Verifying secure tracking link...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !trip) {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-16 text-white flex items-center justify-center">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Notice</h2>
          <p className="text-xs text-slate-400 mb-6">{errorMsg || "Invalid or expired link"}</p>
          <Link
            href="/track"
            className="inline-block px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
          >
            Try Another Token
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between">
      <Navbar statusBadge="Guardian Active" badgeType="guardian" />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 w-full space-y-6 flex-1">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 font-semibold">
              Guardian Mode
            </span>
          </div>
        </div>

        {/* High-priority Alert Banner */}
        {activeAlertBanner && (
          <div className="rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-5 shadow-2xl animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🚨</span>
                <div>
                  <h3 className="font-extrabold text-amber-200 text-sm">
                    Arrival Threshold Reached!
                  </h3>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                    {activeAlertBanner}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveAlertBanner(null)}
                className="text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Location Staleness & Consent Status */}
        <LocationStatus
          isSharingActive={trip.status === "active"}
          lastUpdatedTimestamp={latestLocation?.recorded_at}
          accuracyMeters={latestLocation?.accuracy}
        />

        {/* Distance Card */}
        <DistanceCard
          remainingDistanceKm={currentDistanceKm}
          destinationName={trip.destination_name}
          startName={trip.start_name || undefined}
        />

        {/* Threshold Alert Selector */}
        <AlertSelector
          currentDistanceKm={currentDistanceKm}
          selectedThreshold={selectedThreshold}
          onSelectThreshold={(km) => {
            setSelectedThreshold(km);
            requestNotificationPermission();
          }}
          triggeredThresholds={triggeredThresholds}
        />

        {/* Live Leaflet Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              <span>Live Route & Position</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Auto-refreshing (5s)
            </span>
          </div>

          <JourneyMap
            travellerPos={
              latestLocation
                ? { lat: latestLocation.latitude, lng: latestLocation.longitude }
                : null
            }
            destinationPos={{
              lat: destLat,
              lng: destLng,
              name: trip.destination_name,
            }}
          />
        </div>

        {/* Notification Status Banner */}
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2.5">
            {notificationEnabled ? (
              <BellRing className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <BellOff className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-300">
              {notificationEnabled
                ? "Audio Chime & System Notifications are Active"
                : "Enable notifications so we can wake you up when traveller arrives"}
            </span>
          </div>

          {!notificationEnabled ? (
            <button
              onClick={() => {
                requestNotificationPermission().then((res) => {
                  setNotificationEnabled(res);
                  playAlertChime();
                });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shrink-0 shadow-sm"
            >
              Enable Alerts
            </button>
          ) : (
            <button
              onClick={playAlertChime}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition shrink-0 border border-slate-700"
            >
              <Volume2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Test Audio</span>
            </button>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-600">
        JourneyGuard • Guardian Live Tracking Dashboard
      </footer>
    </div>
  );
}
