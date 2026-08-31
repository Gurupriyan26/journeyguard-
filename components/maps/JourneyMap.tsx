"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Maximize2, Layers, Satellite, Map as MapIcon, Moon } from "lucide-react";

export type MapLayerStyle = "dark" | "satellite" | "street";

interface JourneyMapProps {
  travellerPos?: { lat: number; lng: number } | null;
  destinationPos: { lat: number; lng: number; name?: string };
  startPos?: { lat: number; lng: number; name?: string } | null;
  className?: string;
}

const TILE_LAYERS: Record<MapLayerStyle, { url: string; maxZoom: number; attribution: string }> = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    maxZoom: 19,
    attribution: "CartoDB Voyager",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 18,
    attribution: "Esri / ArcGIS Satellite",
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    attribution: "OpenStreetMap",
  },
};

export default function JourneyMap({
  travellerPos,
  destinationPos,
  startPos,
  className = "h-[380px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative z-0",
}: JourneyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ traveller?: any; destination?: any; line?: any }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayerStyle>("dark");

  // Switch tile layer dynamically
  const switchLayer = (style: MapLayerStyle) => {
    setActiveLayer(style);
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const newTile = L.tileLayer(TILE_LAYERS[style].url, {
        maxZoom: TILE_LAYERS[style].maxZoom,
        subdomains: "abcd",
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTile;
    });
  };

  // Recenter helper
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (travellerPos && destinationPos) {
      import("leaflet").then((L) => {
        const bounds = L.latLngBounds([
          [travellerPos.lat, travellerPos.lng],
          [destinationPos.lat, destinationPos.lng],
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      });
    } else if (travellerPos) {
      mapInstanceRef.current.setView([travellerPos.lat, travellerPos.lng], 12);
    }
  };

  useEffect(() => {
    let isMounted = true;

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
        zoomControl: false,
        attributionControl: false,
      }).setView(initialCenter, 10);

      mapInstanceRef.current = map;

      // Base tile layer
      const baseTile = L.tileLayer(TILE_LAYERS[activeLayer].url, {
        maxZoom: TILE_LAYERS[activeLayer].maxZoom,
        subdomains: "abcd",
      }).addTo(map);
      tileLayerRef.current = baseTile;

      // Custom animated pulse marker for Traveller
      const travellerIcon = L.divIcon({
        className: "custom-traveller-pin",
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: rgba(56, 189, 248, 0.5); animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(37, 99, 235, 0.6); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
            <div style="position: relative; width: 28px; height: 28px; background: #0284c7; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
              🚍
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Custom marker for Destination
      const destinationIcon = L.divIcon({
        className: "custom-destination-pin",
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="position: relative; width: 30px; height: 30px; background: #dc2626; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
              🏁
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Add Destination marker
      const destMarker = L.marker([destinationPos.lat, destinationPos.lng], {
        icon: destinationIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #0f172a;">
            📍 Destination Stop<br><span style="font-weight: 400; color: #475569;">${destinationPos.name || "Arrival Point"}</span>
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
            `<div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #0f172a;">
              🚍 Live GPS Position
            </div>`
          );
        markersRef.current.traveller = travMarker;

        const line = L.polyline(
          [
            [travellerPos.lat, travellerPos.lng],
            [destinationPos.lat, destinationPos.lng],
          ],
          {
            color: "#38bdf8",
            weight: 4,
            opacity: 0.9,
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

      {/* Floating Map Controls & Layer Switcher */}
      {mapLoaded && (
        <>
          {/* Layer switcher pill on top left */}
          <div className="absolute top-3 left-3 z-[400] flex items-center p-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl">
            <button
              type="button"
              onClick={() => switchLayer("dark")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                activeLayer === "dark"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Moon className="h-3 w-3" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => switchLayer("satellite")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                activeLayer === "satellite"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Satellite className="h-3 w-3" />
              <span>Satellite</span>
            </button>

            <button
              type="button"
              onClick={() => switchLayer("street")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                activeLayer === "street"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MapIcon className="h-3 w-3" />
              <span>Street</span>
            </button>
          </div>

          {/* Recenter button on top right */}
          <div className="absolute top-3 right-3 z-[400]">
            <button
              type="button"
              onClick={handleRecenter}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950/85 text-slate-200 hover:text-white border border-slate-800 shadow-xl backdrop-blur-md transition hover:bg-slate-800"
              title="Fit Full Route"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {/* Map attribution tag */}
      <div className="absolute bottom-2 left-2 z-[400] px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[9px] font-mono text-slate-400 border border-slate-800 pointer-events-none">
        {TILE_LAYERS[activeLayer].attribution}
      </div>
    </div>
  );
}
