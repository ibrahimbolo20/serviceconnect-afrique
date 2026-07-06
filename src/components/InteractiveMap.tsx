/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Sliders,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  User,
  Star,
  Activity,
  Crosshair,
  Wifi
} from "lucide-react";
import { Provider } from "../types";

interface InteractiveMapProps {
  providers: Provider[];
  selectedCity: string;
  selectedCategory: string;
  onSelectProvider: (provider: Provider) => void;
  isEmergencyActive?: boolean;
}

export default function InteractiveMap({
  providers,
  selectedCity,
  selectedCategory,
  onSelectProvider,
  isEmergencyActive = false
}: InteractiveMapProps) {
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedPin, setSelectedPin] = useState<Provider | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [radarSweep, setRadarSweep] = useState(true);
  const [gpsLatitude, setGpsLatitude] = useState(12.6392); // Bamako default
  const [gpsLongitude, setGpsLongitude] = useState(-8.0029);
  const [mockTransitCoords, setMockTransitCoords] = useState<{ x: number; y: number } | null>(null);

  // Generate dynamic seed coordinates based on provider ID
  const getProviderOffsets = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = ((hash % 100) - 50) * 0.0004; // small delta offsets
    const y = (((hash >> 8) % 100) - 50) * 0.0004;
    return { x, y };
  };

  // Switch center depending on selected city name
  useEffect(() => {
    if (selectedCity.includes("Sikasso")) {
      setGpsLatitude(11.3175);
      setGpsLongitude(-5.6667);
    } else if (selectedCity.includes("Ségou")) {
      setGpsLatitude(13.4317);
      setGpsLongitude(-6.2672);
    } else if (selectedCity.includes("Mopti")) {
      setGpsLatitude(14.4842);
      setGpsLongitude(-4.1830);
    } else if (selectedCity.includes("Kayes")) {
      setGpsLatitude(14.4469);
      setGpsLongitude(-11.4442);
    } else if (selectedCity.includes("Koutiala")) {
      setGpsLatitude(12.3917);
      setGpsLongitude(-5.4642);
    } else if (selectedCity.includes("Koulikoro")) {
      setGpsLatitude(12.8627);
      setGpsLongitude(-7.5599);
    } else {
      // Default to Bamako (District de Bamako)
      setGpsLatitude(12.6392);
      setGpsLongitude(-8.0029);
    }
    setSelectedPin(null);
  }, [selectedCity]);

  // Simulate active dispatch coordinates when SOS is triggered
  useEffect(() => {
    if (isEmergencyActive) {
      setMockTransitCoords({ x: 30, y: 80 });
      const interval = setInterval(() => {
        setMockTransitCoords((prev) => {
          if (!prev) return null;
          const nextX = prev.x + (50 - prev.x) * 0.1;
          const nextY = prev.y + (50 - prev.y) * 0.1;
          return { x: nextX, y: nextY };
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setMockTransitCoords(null);
    }
  }, [isEmergencyActive]);

  // Filter providers to city
  const localProviders = providers.filter(
    (p) =>
      (selectedCity === "all" || p.city === selectedCity) &&
      (selectedCategory === "all" || p.category === selectedCategory)
  );

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none font-sans">
      
      {/* Dynamic Digital Mesh Grid Map Canvas */}
      <div className="absolute inset-0 z-0 bg-slate-950 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]">
        {/* Radar concentric circular wave indicators */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-slate-800 pointer-events-none opacity-40 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-slate-900 pointer-events-none opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-slate-950 pointer-events-none opacity-10 border-dashed" />

        {/* Heatmap Layer Overlays if enabled */}
        {showHeatmap && (
          <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-orange-600/5 to-transparent pointer-events-none z-1" />
        )}

        {/* Radar live scanning line sweeps */}
        {radarSweep && (
          <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
            <motion.div
              className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        {/* User absolute anchor GPS Pin marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <span className="hidden md:inline-block bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-0.5 rounded-md font-mono mb-1 font-semibold whitespace-nowrap shadow-md">
            Moi (Ma Position)
          </span>
          <div className="relative">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10.5 h-10.5 bg-sky-500/35 rounded-full animate-ping" />
            <div className="bg-sky-500 text-slate-950 p-2.5 rounded-full shadow-lg border-2 border-slate-950 flex items-center justify-center">
              <Navigation className="w-3.5 h-3.5 fill-sky-800 rotate-45" />
            </div>
          </div>
        </div>

        {/* Render Provider Markers on the physical grid space */}
        {localProviders.map((prov, index) => {
          const offset = getProviderOffsets(prov.id);
          // Scale off-center positioning calculations based on index
          const markerLeft = `calc(50% + ${offset.x * 230000 * (mapZoom / 13)}px)`;
          const markerTop = `calc(50% + ${offset.y * 230000 * (mapZoom / 13)}px)`;

          const isSelected = selectedPin?.id === prov.id;

          return (
            <div
              key={prov.id}
              className="absolute z-20"
              style={{ left: markerLeft, top: markerTop }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                
                {/* Floating summary label above marker name */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  onClick={() => setSelectedPin(prov)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] whitespace-nowrap shadow-md transition-all font-bold flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-extrabold scale-105"
                      : "bg-slate-900/90 hover:bg-slate-800 text-white border-slate-800 hover:border-amber-500/30"
                  }`}
                >
                  <MapPin className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{prov.name.split(" ")[0]}</span>
                </motion.button>

                {/* Pulsating point node coordinate */}
                <span className={`w-3.5 h-3.5 rounded-full border border-slate-950 absolute -bottom-5.5 ${
                  prov.isAvailable ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                }`} />
              </div>
            </div>
          );
        })}

        {/* SOS dynamic visual matching vehicle transit simulation */}
        {isEmergencyActive && mockTransitCoords && (
          <div
            className="absolute z-35 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${mockTransitCoords.x}%`, top: `${mockTransitCoords.y}%` }}
          >
            <div className="flex flex-col items-center">
              <span className="bg-red-500 text-white text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse shadow-md">
                Intervention en cours
              </span>
              <div className="w-8 h-8 rounded-full bg-red-600 border border-slate-950 flex items-center justify-center text-white scale-110 animate-bounce shadow-xl">
                🚨
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Control overlay menu panels */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800/80 shadow-lg text-xs space-y-1">
          <p className="font-extrabold text-white uppercase tracking-wider text-[10px] text-amber-400 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>COUVERTURE GPS ACTIF</span>
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Lat: {gpsLatitude.toFixed(4)}° • Lng: {gpsLongitude.toFixed(4)}°
          </p>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 pt-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{localProviders.length} Connectés à proximité</span>
          </div>
        </div>
      </div>

      {/* Top right buttons map styling settings config */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`p-3 rounded-xl backdrop-blur-md shadow-md transition border cursor-pointer ${
            showHeatmap
              ? "bg-amber-500 text-slate-950 border-amber-400"
              : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white"
          }`}
          title="Afficher les zones de forte demande"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => setRadarSweep(!radarSweep)}
          className={`p-3 rounded-xl backdrop-blur-md shadow-md transition border cursor-pointer ${
            radarSweep
              ? "bg-sky-600 text-white border-sky-400"
              : "bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white"
          }`}
          title="Activer le radar de détection"
        >
          <Activity className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom right zoom control actions */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setMapZoom((prev) => Math.min(prev + 1, 18))}
          className="p-3 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapZoom((prev) => Math.max(prev - 1, 10))}
          className="p-3 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Card Popover for selected pin profile match */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl z-30 flex flex-col gap-3 backdrop-blur-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] bg-slate-950 text-amber-500 font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-850 font-bold">
                PROFIL CARTE PROXIMITÉ
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-3">
              <img
                src={selectedPin.avatar}
                alt={selectedPin.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-800 shadow-inner"
              />
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-white text-sm block truncate">
                  {selectedPin.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  {selectedPin.specialties[0]}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold mt-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {selectedPin.rating.toFixed(1)} ({selectedPin.reviewsCount} avis)
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 italic">
              "{selectedPin.description}"
            </p>

            <div className="flex items-center justify-between border-t border-slate-850 pt-2 text-[10px] text-slate-400">
              <span>Tarif d'inscription:</span>
              <span className="font-extrabold text-white text-xs font-mono">
                {selectedPin.hourlyRate.toLocaleString()} FCFA
              </span>
            </div>

            <div className="flex gap-2 pt-1 font-bold">
              <button
                onClick={() => onSelectProvider(selectedPin)}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs py-2 rounded-xl text-center hover:brightness-110 transition cursor-pointer"
              >
                Réserver créneau
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
