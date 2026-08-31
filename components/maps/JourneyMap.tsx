"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Maximize2, Navigation, Layers } from "lucide-react";

interface JourneyMapProps {
  travellerPos?: { lat: number; lng: number } | null;
  destinationPos: { lat: number; lng: number; name?: string };
  startPos?: { lat: number; lng: number; name?: string } | null;
  className?: string;
}

export default function JourneyMap({
  travellerPos,
  destinationPos,
  startPos,
  className = "h-[360px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative z-0",
}: JourneyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ traveller?: any; destination?: any; line?: any }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Recenter helper
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (travellerPos && destinationPos) {
      import("leaflet").then((L) => {
        const bounds = L.latLngBounds([
          [travellerPos.lat, travellerPos.lng],
          [destinationPos.lat, destinationPos.lng],
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45] });
      });
    } else if (travellerPos) {
      mapInstanceRef.current.setView([travellerPos.lat, travellerPos.lng], 12);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet for Next.js SSR compatibility
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialCenter: [number, number] = travellerPos
        ? [travellerPos.lat, travellerPos.lng]
        : [destinationPos.lat, destinationPos.lng];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false, // We'll customize zoom or let user use pinch
        attributionControl: false,
      }).setView(initialCenter, 10);

      mapInstanceRef.current = map;

      // Dark / modern CartoDB tiles with high readability
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Custom animated pulse marker for Traveller
      const travellerIcon = L.divIcon({
        className: "custom-traveller-pin",
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(59, 130, 246, 0.6); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
            <div style="position: relative; width: 26px; height: 26px; background: #2563eb; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
              🚍
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Custom sleek marker for Destination
      const destinationIcon = L.divIcon({
        className: "custom-destination-pin",
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <div style="position: relative; width: 28px; height: 28px; background: #dc2626; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
              🏁
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Add Destination marker
      const destMarker = L.marker([destinationPos.lat, destinationPos.lng], {
        icon: destinationIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 12px; font-weight: 600;">
            📍 Destination<br><span style="font-weight: 400; color: #64748b;">${destinationPos.name || "Arrival Point"}</span>
          </div>`
        );

      markersRef.current.destination = destMarker;

      // Add Traveller marker & Polyline
      if (travellerPos) {
        const travMarker = L.marker([travellerPos.lat, travellerPos.lng], {
          icon: travellerIcon,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: inherit; font-size: 12px; font-weight: 600;">
              🚍 Traveller Live Position
            </div>`
          );
        markersRef.current.traveller = travMarker;

        // Draw glowing polyline
        const line = L.polyline(
          [
            [travellerPos.lat, travellerPos.lng],
            [destinationPos.lat, destinationPos.lng],
          ],
          {
            color: "#3b82f6",
            weight: 3.5,
            opacity: 0.85,
            dashArray: "8, 8",
          }
        ).addTo(map);
        markersRef.current.line = line;

        const bounds = L.latLngBounds([
          [travellerPos.lat, travellerPos.lng],
          [destinationPos.lat, destinationPos.lng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync position updates
  useEffect(() => {
    if (!mapInstanceRef.current || !travellerPos) return;

    import("leaflet").then((L) => {
      if (markersRef.current.traveller) {
        markersRef.current.traveller.setLatLng([travellerPos.lat, travellerPos.lng]);
      }
      if (markersRef.current.line) {
        markersRef.current.line.setLatLngs([
          [travellerPos.lat, travellerPos.lng],
          [destinationPos.lat, destinationPos.lng],
        ]);
      }
    });
  }, [travellerPos?.lat, travellerPos?.lng, destinationPos.lat, destinationPos.lng]);

  return (
    <div className="relative w-full group">
      <div ref={mapContainerRef} className={className} />

      {/* Floating map controls */}
      {mapLoaded && (
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleRecenter}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/90 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition hover:bg-slate-800"
            title="Fit Route"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Map attribution tag */}
      <div className="absolute bottom-2 left-2 z-[400] px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-sm text-[9px] font-mono text-slate-400 border border-slate-800/60 pointer-events-none">
        OpenStreetMap • Voyager
      </div>
    </div>
  );
}
