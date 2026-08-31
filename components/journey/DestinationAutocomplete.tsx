"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Check, Navigation, Building2, Train, Bus } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export interface PlaceSuggestion {
  name: string;
  fullName: string;
  lat: number;
  lng: number;
  type?: string;
  icon?: string;
}

// Built-in high-speed preset database for instant zero-latency suggestions
const INSTANT_PRESETS: PlaceSuggestion[] = [
  { name: "Coimbatore", fullName: "Coimbatore, Tamil Nadu, India", lat: 11.0168, lng: 76.9558, type: "city", icon: "🏙️" },
  { name: "Gandhipuram Bus Stand", fullName: "Gandhipuram, Coimbatore, Tamil Nadu", lat: 11.0183, lng: 76.9657, type: "bus", icon: "🚍" },
  { name: "Coimbatore Junction Railway Station", fullName: "Gopalapuram, Coimbatore, Tamil Nadu", lat: 10.9982, lng: 76.9648, type: "train", icon: "🚆" },
  { name: "Chennai", fullName: "Chennai, Tamil Nadu, India", lat: 13.0827, lng: 80.2707, type: "city", icon: "🏙️" },
  { name: "Chennai Central Railway Station", fullName: "Park Town, Chennai, Tamil Nadu", lat: 13.0825, lng: 80.2755, type: "train", icon: "🚆" },
  { name: "Koyambedu CMBT Bus Stand", fullName: "Koyambedu, Chennai, Tamil Nadu", lat: 13.0694, lng: 80.2052, type: "bus", icon: "🚍" },
  { name: "Bangalore", fullName: "Bengaluru, Karnataka, India", lat: 12.9716, lng: 77.5946, type: "city", icon: "🏙️" },
  { name: "Majestic Bus Stand", fullName: "Kempegowda Bus Station, Bengaluru", lat: 12.9774, lng: 77.5713, type: "bus", icon: "🚍" },
  { name: "KSR Bengaluru City Railway Station", fullName: "Majestic, Bengaluru, Karnataka", lat: 12.9781, lng: 77.5696, type: "train", icon: "🚆" },
  { name: "Madurai", fullName: "Madurai, Tamil Nadu, India", lat: 9.9252, lng: 78.1198, type: "city", icon: "🏙️" },
  { name: "Mattuthavani Bus Stand", fullName: "Mattuthavani, Madurai, Tamil Nadu", lat: 9.9392, lng: 78.1566, type: "bus", icon: "🚍" },
  { name: "Madurai Junction", fullName: "Madurai Main, Tamil Nadu", lat: 9.9189, lng: 78.1105, type: "train", icon: "🚆" },
  { name: "Trichy", fullName: "Tiruchirappalli, Tamil Nadu, India", lat: 10.7905, lng: 78.7047, type: "city", icon: "🏙️" },
  { name: "Central Bus Stand Trichy", fullName: "Cantonment, Tiruchirappalli, Tamil Nadu", lat: 10.8038, lng: 78.6856, type: "bus", icon: "🚍" },
  { name: "Salem", fullName: "Salem, Tamil Nadu, India", lat: 11.6643, lng: 78.146, type: "city", icon: "🏙️" },
  { name: "Salem New Bus Stand", fullName: "Meyyanur, Salem, Tamil Nadu", lat: 11.6672, lng: 78.1345, type: "bus", icon: "🚍" },
  { name: "Tiruppur", fullName: "Tiruppur, Tamil Nadu, India", lat: 11.1085, lng: 77.3411, type: "city", icon: "🏙️" },
  { name: "Kochi", fullName: "Kochi, Kerala, India", lat: 9.9312, lng: 76.2673, type: "city", icon: "🏙️" },
  { name: "Vyttila Mobility Hub", fullName: "Vyttila, Kochi, Kerala", lat: 9.9678, lng: 76.3195, type: "bus", icon: "🚍" },
  { name: "Trivandrum", fullName: "Thiruvananthapuram, Kerala, India", lat: 8.5241, lng: 76.9366, type: "city", icon: "🏙️" },
  { name: "Hyderabad", fullName: "Hyderabad, Telangana, India", lat: 17.385, lng: 78.4867, type: "city", icon: "🏙️" },
  { name: "Secunderabad Junction", fullName: "Secunderabad, Telangana", lat: 17.4344, lng: 78.5015, type: "train", icon: "🚆" },
  { name: "Mumbai", fullName: "Mumbai, Maharashtra, India", lat: 19.076, lng: 72.8777, type: "city", icon: "🏙️" },
  { name: "Delhi", fullName: "New Delhi, Delhi, India", lat: 28.6139, lng: 77.209, type: "city", icon: "🏙️" },
];

interface DestinationAutocompleteProps {
  value: string;
  onChange: (name: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  required?: boolean;
}

export default function DestinationAutocomplete({
  value,
  onChange,
  placeholder = "Search destination city, bus stand, or railway station...",
  required = false,
}: DestinationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    onChange(text);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // 1. Instant local matching for 0ms immediate suggestions
    const qLower = text.trim().toLowerCase();
    const localMatches = INSTANT_PRESETS.filter(
      (item) =>
        item.name.toLowerCase().includes(qLower) ||
        item.fullName.toLowerCase().includes(qLower)
    );

    setSuggestions(localMatches);
    setIsOpen(true);

    // 2. Debounced online geocoding lookup via OpenStreetMap Nominatim
    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text.trim()
          )}&addressdetails=1&limit=6`
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const apiSuggestions: PlaceSuggestion[] = data.map((item: any) => {
            const shortName = item.name || item.display_name.split(",")[0];
            const isBusOrTrain = /station|bus|railway|stop/i.test(item.display_name);
            return {
              name: shortName,
              fullName: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              type: isBusOrTrain ? "transit" : "city",
              icon: isBusOrTrain ? "🚍" : "📍",
            };
          });

          // Merge without duplicate names
          const combined = [...localMatches];
          for (const item of apiSuggestions) {
            if (!combined.some((c) => c.name.toLowerCase() === item.name.toLowerCase())) {
              combined.push(item);
            }
          }

          setSuggestions(combined.slice(0, 7));
        }
      } catch (err) {
        // Fallback to local matches
      } finally {
        setIsLoading(false);
      }
    }, 280);
  };

  const handleSelectSuggestion = (place: PlaceSuggestion) => {
    triggerHaptic("tap");
    setQuery(place.name);
    onChange(place.name, place.lat, place.lng);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    triggerHaptic("tap");
    setQuery("");
    onChange("", undefined, undefined);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field with Icons */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-cyan-400">
          <Search className="h-4 w-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 pl-11 pr-11 py-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition font-bold"
        />

        {/* Right side Clear / Loading indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 gap-1.5">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
          )}

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Clear destination"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Auto-Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-slide-up max-h-72 overflow-y-auto divide-y divide-slate-800/80">
          <div className="px-3 py-1.5 bg-slate-900/90 text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
            <span>Destination Suggestions</span>
            <span className="text-slate-400 font-normal">Tap to select</span>
          </div>

          {suggestions.map((place, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={`${place.name}-${place.lat}-${index}`}
                type="button"
                onClick={() => handleSelectSuggestion(place)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-white"
                    : "hover:bg-slate-800/60 text-slate-200"
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{place.icon || "📍"}</span>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-white flex items-center gap-2">
                    <span className="truncate">{place.name}</span>
                    {place.type === "bus" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        Bus Stand
                      </span>
                    )}
                    {place.type === "train" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        Railway
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 truncate mt-0.5 font-normal">
                    {place.fullName}
                  </p>
                </div>

                <div className="shrink-0 text-right text-[10px] text-cyan-400/80 font-mono mt-1 hidden sm:block">
                  GPS: {place.lat.toFixed(2)}, {place.lng.toFixed(2)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
