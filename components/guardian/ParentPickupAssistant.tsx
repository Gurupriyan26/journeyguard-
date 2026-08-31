"use client";

import { useState, useEffect } from "react";
import { Car, Clock, Navigation, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

interface ParentPickupAssistantProps {
  remainingDistanceKm: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  speedKmh?: number | null;
}

export default function ParentPickupAssistant({
  remainingDistanceKm,
  destinationName,
  destinationLat,
  destinationLng,
  speedKmh,
}: ParentPickupAssistantProps) {
  // Prep & drive buffer time in minutes (default: 20 mins to get ready and drive to stop)
  const [prepBufferMins, setPrepBufferMins] = useState<number>(20);
  const [recommendedLeaveTime, setRecommendedLeaveTime] = useState<string>("");
  const [arrivalTimeStr, setArrivalTimeStr] = useState<string>("");

  const effectiveSpeed = speedKmh && speedKmh > 10 ? speedKmh : 60;
  const travelMinsRemaining = Math.round((remainingDistanceKm / effectiveSpeed) * 60);

  useEffect(() => {
    // Calculate expected arrival time
    const now = Date.now();
    const arrivalDate = new Date(now + travelMinsRemaining * 60 * 1000);
    setArrivalTimeStr(
      arrivalDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    // Calculate recommended departure time from home
    const leaveDate = new Date(now + Math.max(0, travelMinsRemaining - prepBufferMins) * 60 * 1000);
    setRecommendedLeaveTime(
      leaveDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }, [travelMinsRemaining, prepBufferMins]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?destination=${destinationLat},${destinationLng}`;

  return (
    <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 transition-all duration-300">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Parent Pickup Assistant
            </h3>
            <p className="text-xs text-slate-400">
              Personalized planner so you arrive right on time
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
          <ShieldCheck className="h-3 w-3" />
          <span>Smart Timing</span>
        </span>
      </div>

      {/* Recommended Departure Highlight Box */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-blue-950/50 p-4 sm:p-5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
              Suggested Time to Leave Home
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {recommendedLeaveTime ? recommendedLeaveTime : "--:--"}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Leaves you <strong>{prepBufferMins} mins</strong> to drive & park before traveller arrives at <strong>{arrivalTimeStr}</strong>.
            </p>
          </div>

          {/* Drive time buffer selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 px-2">Drive buffer:</span>
            {[15, 20, 30].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setPrepBufferMins(mins)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  prepBufferMins === mins
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action: Open Pickup Point in Google Maps */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/20"
        >
          <Navigation className="h-4 w-4" />
          <span>Get Driving Directions to {destinationName}</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </a>
      </div>
    </div>
  );
}
