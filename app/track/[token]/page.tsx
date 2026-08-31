"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { hashToken } from "@/lib/tokens";
import { calculateDistanceKm, hasCrossedThreshold } from "@/lib/distance";
import {
  playAlertSound,
  startPersistentAlarm,
  stopPersistentAlarm,
  requestNotificationPermission,
  showSystemNotification,
  AlarmSoundType,
} from "@/lib/notifications";
import { triggerHaptic } from "@/lib/haptics";
import JourneyMap from "@/components/maps/JourneyMap";
import DistanceCard from "@/components/journey/DistanceCard";
import LocationStatus from "@/components/journey/LocationStatus";
import BatterySpeedCard from "@/components/journey/BatterySpeedCard";
import AlertSelector from "@/components/guardian/AlertSelector";
import ParentStatusHeader from "@/components/guardian/ParentStatusHeader";
import ParentPickupAssistant from "@/components/guardian/ParentPickupAssistant";
import MultiGuardianManager from "@/components/guardian/MultiGuardianManager";
import TripTimeline from "@/components/guardian/TripTimeline";
import AlarmTriggerModal from "@/components/guardian/AlarmTriggerModal";
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
  Car,
  Moon,
  ListOrdered,
  Users,
  Eye,
  Phone,
  Sparkles,
} from "lucide-react";

type DashboardTab = "map" | "pickup" | "alarm" | "family" | "timeline";

export default function GuardianTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [activeTab, setActiveTab] = useState<DashboardTab>("map");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [latestLocation, setLatestLocation] = useState<TripLocation | null>(null);
  const [previousDistance, setPreviousDistance] = useState<number | null>(null);
  const [selectedThreshold, setSelectedThreshold] = useState<number>(50); // Default 50km
  const [selectedSound, setSelectedSound] = useState<AlarmSoundType>("loud_siren");
  const [triggeredThresholds, setTriggeredThresholds] = useState<number[]>([]);
  const [activeAlertBanner, setActiveAlertBanner] = useState<string | null>(null);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isSeniorMode, setIsSeniorMode] = useState(false);

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

        // 1. Try local cache (sessionStorage and localStorage)
        if (typeof window !== "undefined") {
          const checkStorage = (storage: Storage) => {
            const mappedId = storage.getItem(`jg_token_${token}`);
            if (mappedId) {
              const mappedTrip = storage.getItem(`jg_trip_${mappedId}`);
              if (mappedTrip) {
                try {
                  return JSON.parse(mappedTrip);
                } catch {}
              }
            }

            const directTrip = storage.getItem(`jg_trip_${token}`);
            if (directTrip) {
              try {
                return JSON.parse(directTrip);
              } catch {}
            }

            for (let i = 0; i < storage.length; i++) {
              const key = storage.key(i);
              if (key && key.startsWith("jg_trip_")) {
                try {
                  const item = JSON.parse(storage.getItem(key) || "{}");
                  if (item.rawGuardianToken === token || item.id === token) {
                    return item;
                  }
                } catch {}
              }
            }
            return null;
          };

          const localFound = checkStorage(sessionStorage) || checkStorage(localStorage);
          if (localFound) {
            foundTrip = localFound;
            if (localFound.start_lat && localFound.start_lng) {
              foundLocation = {
                id: "init",
                trip_id: localFound.id,
                latitude: localFound.start_lat,
                longitude: localFound.start_lng,
                accuracy: 10,
                speed_kmh: 62,
                battery_level: 84,
                is_charging: true,
                recorded_at: new Date().toISOString(),
              };
            }
          }
        }

        // 2. Query Supabase using token hash OR direct ID
        if (isSupabaseConfigured && supabase) {
          try {
            const tokenHash = await hashToken(token);

            const { data: accessData } = await supabase
              .from("guardian_access")
              .select("trip_id, expires_at")
              .eq("access_token_hash", tokenHash)
              .limit(1);

            let targetTripId = accessData && accessData.length > 0 ? accessData[0].trip_id : null;

            if (!targetTripId && (token.length === 36 || foundTrip?.id)) {
              targetTripId = token.length === 36 ? token : foundTrip?.id;
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
          } catch (err) {
            console.warn("Supabase tracking fetch notice:", err);
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

          const currentDist = calculateDistanceKm(
            foundLocation.latitude,
            foundLocation.longitude,
            foundTrip.destination_lat,
            foundTrip.destination_lng
          );

          const prevDist = previousDistanceRef.current;
          const triggeredList = triggeredThresholdsRef.current;

          if (
            !triggeredList.includes(selectedThreshold) &&
            hasCrossedThreshold(prevDist, currentDist, selectedThreshold)
          ) {
            const newTriggered = [...triggeredList, selectedThreshold];
            setTriggeredThresholds(newTriggered);
            triggeredThresholdsRef.current = newTriggered;

            const alertText = `🚨 Traveller is now approx ${currentDist} km from ${foundTrip.destination_name}. Time to prepare for pickup!`;
            setActiveAlertBanner(alertText);
            setIsAlarmModalOpen(true);
            showSystemNotification(
              `JourneyGuard Alert: ${foundTrip.destination_name}`,
              alertText,
              selectedSound
            );
          }

          setPreviousDistance(currentDist);
        }
      } catch (err: any) {
        console.error("Tracking fetch error:", err);
      }
    }

    fetchTripData();
    const interval = setInterval(fetchTripData, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, selectedThreshold, selectedSound]);

  const destLat = trip?.destination_lat || 11.0168;
  const destLng = trip?.destination_lng || 76.9558;
  const travLat = latestLocation?.latitude || trip?.start_lat || 13.0827;
  const travLng = latestLocation?.longitude || trip?.start_lng || 80.2707;

  const currentDistanceKm = calculateDistanceKm(travLat, travLng, destLat, destLng);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const cleanPhone = trip?.traveller_phone ? trip.traveller_phone.replace(/\s+/g, "") : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-16 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Connecting to secure traveller GPS stream...</p>
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
            Enter Another Token
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between ${isSeniorMode ? "senior-mode-active" : ""}`}>
      <Navbar statusBadge="Guardian Active" badgeType="guardian" />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 w-full space-y-5 flex-1">
        {/* Navigation & Senior Mode Toggle */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={() => triggerHaptic("tap")}
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Senior / Parent Easy Mode Switch */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("tap");
                setIsSeniorMode(!isSeniorMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition ${
                isSeniorMode
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{isSeniorMode ? "👵 Senior Mode ON" : "👴 Senior Mode"}</span>
            </button>

            <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold hidden sm:inline">
              🛡️ Parent Care Portal
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SENIOR / PARENT EASY MODE VIEW (Extra-Large & Simplified) */}
        {/* ========================================================================= */}
        {isSeniorMode ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Giant Reassuring Header Card */}
            <div className="glass-panel-emerald rounded-3xl p-6 sm:p-8 text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live Tracking Active
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {trip.traveller_name || "Your Child"} is Travelling to {trip.destination_name}
              </h2>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around text-center">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">Distance Left</span>
                  <strong className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono">
                    {currentDistanceKm} km
                  </strong>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">Expected Arrival</span>
                  <strong className="text-2xl sm:text-3xl font-black text-white font-mono">
                    ~{Math.round(currentDistanceKm / 60)}h {Math.round(currentDistanceKm % 60)}m
                  </strong>
                </div>
              </div>
            </div>

            {/* Giant 1-Tap Action Call & Siren Buttons */}
            <div className="space-y-3">
              {cleanPhone ? (
                <a
                  href={`tel:${cleanPhone}`}
                  onClick={() => triggerHaptic("tap")}
                  className="w-full py-5 px-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition shadow-2xl shadow-emerald-600/40 active:scale-95"
                >
                  <Phone className="h-7 w-7" />
                  <span>📞 1-TAP CALL {trip.traveller_name?.toUpperCase() || "TRAVELLER"}</span>
                </a>
              ) : (
                <a
                  href="tel:"
                  onClick={() => triggerHaptic("tap")}
                  className="w-full py-5 px-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition shadow-2xl shadow-emerald-600/40 active:scale-95"
                >
                  <Phone className="h-7 w-7" />
                  <span>📞 1-TAP MAKE PHONE CALL</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("alarm");
                  playAlertSound(selectedSound);
                }}
                className="w-full py-5 px-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition shadow-2xl shadow-blue-600/40 active:scale-95"
              >
                <Volume2 className="h-7 w-7 text-cyan-300" />
                <span>🔊 TEST LOUD WAKE-UP ALARM</span>
              </button>
            </div>

            {/* Big Live Map */}
            <div className="rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
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
          </div>
        ) : (
          /* ========================================================================= */
          /* STANDARD ADVANCED MULTI-TAB VIEW */
          /* ========================================================================= */
          <>
            {/* Reassuring Parent Status Header */}
            <ParentStatusHeader
              destinationName={trip.destination_name}
              isSharingActive={trip.status === "active"}
              shareUrl={shareUrl}
              speedKmh={latestLocation?.speed_kmh}
              travellerName={trip.traveller_name}
              travellerPhone={trip.traveller_phone}
            />

            {/* Real-time Battery, Speed & GPS Accuracy Telemetry */}
            <BatterySpeedCard
              batteryLevel={latestLocation?.battery_level}
              isCharging={latestLocation?.is_charging}
              speedKmh={latestLocation?.speed_kmh}
              accuracyMeters={latestLocation?.accuracy}
              heading={latestLocation?.heading}
            />

            {/* High-priority Arrival Alert Banner */}
            {activeAlertBanner && (
              <div className="rounded-3xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-5 shadow-2xl animate-slide-up">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl animate-bounce">🚨</span>
                    <div>
                      <h3 className="font-black text-amber-200 text-sm">
                        Arrival Threshold Reached!
                      </h3>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed font-semibold">
                        {activeAlertBanner}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAlarmModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition"
                    >
                      View Actions
                    </button>
                    <button
                      onClick={() => setActiveAlertBanner(null)}
                      className="text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                      aria-label="Dismiss alert"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Distance & Live ETA Card */}
            <DistanceCard
              remainingDistanceKm={currentDistanceKm}
              destinationName={trip.destination_name}
              startName={trip.start_name || undefined}
              speedKmh={latestLocation?.speed_kmh}
            />

            {/* Sliding Segmented Tab Bar */}
            <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("tap");
                  setActiveTab("map");
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "map"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Live Map</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("tap");
                  setActiveTab("pickup");
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "pickup"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                <span>Pickup Timing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("tap");
                  setActiveTab("alarm");
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "alarm"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Night Alarms</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("tap");
                  setActiveTab("family");
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "family"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Family Roles</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("tap");
                  setActiveTab("timeline");
                }}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "timeline"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Timeline</span>
              </button>
            </div>

            {/* Sliding Tab Views */}
            <div className="transition-all duration-300">
              {/* TAB 1: LIVE MAP */}
              {activeTab === "map" && (
                <div className="space-y-4 animate-slide-in-right">
                  <LocationStatus
                    isSharingActive={trip.status === "active"}
                    lastUpdatedTimestamp={latestLocation?.recorded_at}
                    accuracyMeters={latestLocation?.accuracy}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Real-time GPS Tracking</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        Zero-Lag Broadcast (3s)
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
                </div>
              )}

              {/* TAB 2: PICKUP ASSISTANT */}
              {activeTab === "pickup" && (
                <div className="animate-slide-in-left">
                  <ParentPickupAssistant
                    remainingDistanceKm={currentDistanceKm}
                    destinationName={trip.destination_name}
                    destinationLat={destLat}
                    destinationLng={destLng}
                  />
                </div>
              )}

              {/* TAB 3: NIGHT SLEEP ALARMS */}
              {activeTab === "alarm" && (
                <div className="animate-slide-in-right">
                  <AlertSelector
                    currentDistanceKm={currentDistanceKm}
                    selectedThreshold={selectedThreshold}
                    onSelectThreshold={(km) => {
                      setSelectedThreshold(km);
                      requestNotificationPermission();
                    }}
                    triggeredThresholds={triggeredThresholds}
                    selectedSound={selectedSound}
                    onSelectSound={(snd) => setSelectedSound(snd)}
                  />
                </div>
              )}

              {/* TAB 4: MULTI-GUARDIAN FAMILY ROLES */}
              {activeTab === "family" && (
                <div className="animate-slide-in-left">
                  <MultiGuardianManager
                    currentDistanceKm={currentDistanceKm}
                    baseShareUrl={shareUrl.split("?")[0]}
                    onSelectActiveThreshold={(km) => setSelectedThreshold(km)}
                  />
                </div>
              )}

              {/* TAB 5: TRIP TIMELINE */}
              {activeTab === "timeline" && (
                <div className="animate-slide-in-left">
                  <TripTimeline
                    startName={trip.start_name || undefined}
                    destinationName={trip.destination_name}
                    remainingDistanceKm={currentDistanceKm}
                    selectedThresholdKm={selectedThreshold}
                    isCompleted={trip.status === "completed"}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Fullscreen Emergency Alarm Siren Modal */}
        <AlarmTriggerModal
          isOpen={isAlarmModalOpen}
          onClose={() => setIsAlarmModalOpen(false)}
          remainingDistanceKm={currentDistanceKm}
          destinationName={trip.destination_name}
          travellerName={trip.traveller_name}
          travellerPhone={trip.traveller_phone}
          soundType={selectedSound}
        />
      </main>

      <footer className="py-6 text-center text-xs text-slate-600">
        JourneyGuard • Professional Family Tracking & Guardian Alert Portal
      </footer>
    </div>
  );
}
