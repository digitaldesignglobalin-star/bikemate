"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "../../hooks/useLocation";

// Load Google Maps script once (idempotent)
function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google); return; }
    const existing = document.getElementById("gm-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "gm-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Service categories ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "fuel",     type: "gas_station", label: "⛽ Fuel / EV",      icon: "⛽", bg: "bg-emerald-500/10", color: "text-emerald-400" },
  { id: "health",   type: "hospital",    label: "🏥 Hospital",        icon: "🏥", bg: "bg-red-500/10",     color: "text-red-400"     },
  { id: "medicine", type: "pharmacy",    label: "💊 Pharmacy",        icon: "💊", bg: "bg-yellow-500/10",  color: "text-yellow-400"  },
  { id: "repair",   type: "car_repair",  label: "🔧 Mechanic",        icon: "🔧", bg: "bg-[#FF2E2E]/10",   color: "text-[#FF2E2E]"   },
  { id: "puc",      keyword:"PUC Center",label: "🛡️ PUC",            icon: "🛡️", bg: "bg-blue-500/10",   color: "text-blue-400"    },
  { id: "towing",   keyword:"Towing",    label: "🚛 Towing",          icon: "🚛", bg: "bg-orange-500/10",  color: "text-orange-400"  },
];

const FALLBACK = [
  { id:"f1", type:"fuel",     name:"HP Petrol Pump",    dist:"0.5 km", open:true,  icon:"⛽", bg:"bg-emerald-500/10", color:"text-emerald-400" },
  { id:"f2", type:"health",   name:"City Hospital",     dist:"1.8 km", open:true,  icon:"🏥", bg:"bg-red-500/10",     color:"text-red-400"     },
  { id:"f3", type:"medicine", name:"Apollo Pharmacy",   dist:"1.1 km", open:true,  icon:"💊", bg:"bg-yellow-500/10",  color:"text-yellow-400"  },
  { id:"f4", type:"repair",   name:"Raju Bike Works",   dist:"0.8 km", open:true,  icon:"🔧", bg:"bg-[#FF2E2E]/10",   color:"text-[#FF2E2E]"   },
  { id:"f5", type:"puc",      name:"Modern PUC Center", dist:"2.1 km", open:true,  icon:"🛡️", bg:"bg-blue-500/10",   color:"text-blue-400"    },
  { id:"f6", type:"towing",   name:"Express Towing",    dist:"3.5 km", open:false, icon:"🚛", bg:"bg-orange-500/10",  color:"text-orange-400"  },
];

export default function MapPage() {
  const [filter, setFilter]     = useState("all");
  const [services, setServices] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [mapMode, setMapMode]   = useState("night");
  const mapRef     = useRef(null);
  const markerRef  = useRef(null);
  const googleRef  = useRef(null);
  const mapObjRef  = useRef(null);

  const { coords, status, error: locError, getLocation } = useLocation();

  // ── Places search ─────────────────────────────────────────────────────────
  const fetchNearby = async (google, map, center) => {
    const service = new google.maps.places.PlacesService(map);
    const results = [];

    await Promise.all(
      CATEGORIES.map((cat) =>
        new Promise((resolve) => {
          const req = {
            location: center,
            radius: 10000,
            ...(cat.type    ? { type: cat.type }       : {}),
            ...(cat.keyword ? { keyword: cat.keyword }  : {}),
          };
          service.nearbySearch(req, (places, st) => {
            if (st === google.maps.places.PlacesServiceStatus.OK && places) {
              places.slice(0, 5).forEach((p) => {
                results.push({
                  id:    p.place_id,
                  type:  cat.id,
                  name:  p.name,
                  dist:  "Nearby",
                  open:  p.opening_hours?.isOpen?.() ?? true,
                  icon:  cat.icon,
                  bg:    cat.bg,
                  color: cat.color,
                  lat:   p.geometry?.location?.lat(),
                  lng:   p.geometry?.location?.lng(),
                });
              });
            }
            resolve();
          });
        })
      )
    );

    setServices(results.length > 0 ? results : FALLBACK);
  };

  // ── Map initialiser ───────────────────────────────────────────────────────
  const initMap = useCallback(async (userCoords) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setServices(FALLBACK); return; }

    try {
      setLoading(true);
      const google = await loadGoogleMapsScript(apiKey);

      if (!mapRef.current) return;

      const center = { lat: userCoords.lat, lng: userCoords.lng };
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        styles: mapMode === "night" ? DARK_STYLE : [],
      });
      mapObjRef.current = map;

      // User marker
      markerRef.current = new google.maps.Marker({
        position: center,
        map,
        title: "You are here",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#FF2E2E",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      setMapReady(true);
      await fetchNearby(google, map, center);
    } catch (err) {
      console.error("[MapPage] Google Maps load error:", err);
      setServices(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [mapMode]);

  // ── 1. Ask for location once on mount ────────────────────────────────────
  useEffect(() => { getLocation(); }, [getLocation]);

  // ── 2. Once coords arrive → load map + nearby places ─────────────────────
  useEffect(() => {
    if (status === "success" && coords) {
      const t = setTimeout(() => initMap(coords), 0);
      return () => clearTimeout(t);
    } else if (status === "denied" || status === "error") {
      const t = setTimeout(() => setServices(FALLBACK), 0);
      return () => clearTimeout(t);
    }
  }, [status, coords, initMap]);

  // ── 3. Update Map Style when theme changes ────────────────────────────────
  useEffect(() => {
    if (mapObjRef.current) {
      mapObjRef.current.setOptions({ styles: mapMode === "night" ? DARK_STYLE : [] });
    }
  }, [mapMode]);

  const filtered = filter === "all" ? services : services.filter((s) => s.type === filter);

  const panTo = (s) => {
    if (!mapObjRef.current || !s.lat) return;
    mapObjRef.current.panTo({ lat: s.lat, lng: s.lng });
    mapObjRef.current.setZoom(16);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 px-4 pb-32 animate-[pageEnter_0.4s_ease_both]">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-2">
            Nearby <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-[#B0B0B0] text-sm">
            {coords ? `📍 Showing results near you` : "Instant help and essentials on your route"}
          </p>
        </div>
        <button 
          onClick={() => setMapMode(mapMode === "night" ? "day" : "night")}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold text-white transition flex items-center gap-2"
        >
          {mapMode === "night" ? "☀️ Day Mode" : "🌙 Night Mode"}
        </button>
      </div>

      {/* ── Map Container ── */}
      <div className="relative rounded-[2rem] overflow-hidden mb-8 border border-white/5 shadow-2xl bg-[#111]"
           style={{ height: "340px" }}>
        {/* Actual map div */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Overlay while waiting for GPS */}
        {(status === "idle" || status === "loading") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] z-10">
            <div className="w-16 h-16 rounded-full border-4 border-[#FF2E2E]/30 border-t-[#FF2E2E] animate-spin mb-4" />
            <p className="text-xs font-black tracking-[0.3em] uppercase text-[#555]">
              {status === "loading" ? "Acquiring GPS…" : "Preparing map…"}
            </p>
          </div>
        )}

        {/* Error state */}
        {(status === "denied" || status === "error") && !mapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] z-10 gap-4 p-6 text-center">
            <span className="text-4xl">📍</span>
            <p className="text-sm text-[#B0B0B0] max-w-xs">
              {locError || "Could not get your location. Showing default services."}
            </p>
            <button onClick={getLocation}
              className="btn btn-primary btn-sm">
              Retry Location
            </button>
          </div>
        )}

        {/* No API key — styled fallback instead of black void */}
        {status === "success" && !mapReady && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D0D0D] z-10 gap-5 p-8 text-center">
            {/* Grid decoration */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#FF2E2E]/10 to-transparent" />
              <div className="grid grid-cols-10 grid-rows-8 w-full h-full">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/10" />
                ))}
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 flex items-center justify-center text-3xl">🗺️</div>
              <div>
                <p className="text-sm font-black text-white mb-1">Map Preview Unavailable</p>
                <p className="text-[0.7rem] text-[#555] leading-relaxed max-w-xs">
                  Add <code className="text-[#FF2E2E] bg-[#FF2E2E]/10 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to <code className="text-[#FF2E2E] bg-[#FF2E2E]/10 px-1 rounded">.env.local</code> to enable live maps.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[0.65rem] font-black text-emerald-400 uppercase tracking-widest">
                  GPS Lock • {coords?.lat.toFixed(4)}°, {coords?.lng.toFixed(4)}°
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Filter chips ── */}
      <div className="relative mb-6">
        {/* Fade indicator */}
        <div className="absolute right-0 top-0 bottom-4 w-10 bg-gradient-to-l from-[#0D0D0D] to-transparent z-10 pointer-events-none" />
        <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar -mx-1 px-1">
          {[{ id: "all", label: "All Nearby", icon: "📍" }, ...CATEGORIES].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl font-black whitespace-nowrap transition-all border flex-shrink-0 ${
                filter === f.id
                  ? "bg-[#FF2E2E] border-[#FF2E2E] text-white shadow-[0_0_20px_rgba(255,46,46,0.35)]"
                  : "bg-white/[0.03] border-white/[0.08] text-[#B0B0B0] hover:border-[#FF2E2E]/30"
              }`}>
              <span className="text-base">{f.icon || "📍"}</span>
              <span className="text-xs hidden sm:inline">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Service Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-[#555] py-10 font-bold">No results found for this category.</p>
          ) : (
            filtered.map((svc, i) => (
              <div key={svc.id || i}
                onClick={() => panTo(svc)}
                className="flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-[#FF2E2E]/20 rounded-2xl transition-all cursor-pointer group"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${svc.bg} group-hover:scale-110 transition-transform`}>
                  {svc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate group-hover:text-[#FF2E2E] transition-colors">{svc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[0.65rem] text-[#555] font-bold uppercase">{svc.dist}</span>
                    <span className="w-1 h-1 rounded-full bg-[#333]" />
                    <span className={`text-[0.65rem] font-black uppercase ${svc.open ? "text-emerald-400" : "text-[#FF2E2E]"}`}>
                      {svc.open ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(svc.name)}${coords ? `&query_place_id=&center=${coords.lat},${coords.lng}` : ""}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-primary btn-sm shrink-0 text-[0.7rem] px-4">
                  Go
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Google Maps dark style ────────────────────────────────────────────────────
const DARK_STYLE = [
  { elementType: "geometry",           stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#666" }]    },
  { featureType: "road",               elementType: "geometry",      stylers: [{ color: "#2d2d2d" }] },
  { featureType: "road",               elementType: "labels.text.fill", stylers: [{ color: "#888" }] },
  { featureType: "water",              elementType: "geometry",      stylers: [{ color: "#0d0d0d" }] },
  { featureType: "poi",                elementType: "labels",        stylers: [{ visibility: "off" }] },
  { featureType: "transit",            elementType: "labels",        stylers: [{ visibility: "off" }] },
];
