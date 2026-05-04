import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin, Minus, Plus } from "lucide-react";

interface DeliveryRadiusMapProps {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  storeCep?: string;
  storeCity?: string;
  storeState?: string;
  onUpdate: (lat: number, lng: number, radiusKm: number) => void;
}

// Leaflet precisa de dynamic import (SSR incompativel)
const MapInner = dynamic(() => import("./DeliveryRadiusMapInner"), { ssr: false });

export default function DeliveryRadiusMap({
  lat, lng, radiusKm, storeCep, storeCity, storeState, onUpdate,
}: DeliveryRadiusMapProps) {
  const [center, setCenter] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );
  const [radius, setRadius] = useState(radiusKm || 15);
  const [loading, setLoading] = useState(!lat || !lng);
  const [geocodeError, setGeocodeError] = useState("");

  // Geocode store address to lat/lng if not set
  useEffect(() => {
    if (center) { setLoading(false); return; }
    if (!storeCep && !storeCity) { setLoading(false); return; }

    const geocode = async () => {
      try {
        // Try Nominatim (OpenStreetMap) first
        const query = storeCep
          ? `${storeCep}, ${storeState || "Brasil"}`
          : `${storeCity}, ${storeState || "PB"}, Brasil`;
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const data = await resp.json();
        if (data?.[0]) {
          const newCenter: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setCenter(newCenter);
          onUpdate(newCenter[0], newCenter[1], radius);
        } else {
          // Fallback: Joao Pessoa
          setCenter([-7.115, -34.861]);
          setGeocodeError("Endere\u00e7o n\u00e3o encontrado. Ajuste o pin manualmente.");
        }
      } catch {
        setCenter([-7.115, -34.861]);
        setGeocodeError("Erro ao buscar localiza\u00e7\u00e3o. Ajuste o pin manualmente.");
      }
      setLoading(false);
    };
    geocode();
  }, [storeCep, storeCity, storeState]);

  const handleCenterChange = useCallback((newLat: number, newLng: number) => {
    setCenter([newLat, newLng]);
    onUpdate(newLat, newLng, radius);
  }, [radius, onUpdate]);

  const handleRadiusChange = useCallback((newRadius: number) => {
    const r = Math.max(1, newRadius);
    setRadius(r);
    if (center) onUpdate(center[0], center[1], r);
  }, [center, onUpdate]);

  if (loading) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm text-zinc-500">Localizando seu endere\u00e7o...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {geocodeError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
          {geocodeError}
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100" style={{ height: 340 }}>
        {center && (
          <MapInner
            center={center}
            radiusMeters={radius * 1000}
            onCenterChange={handleCenterChange}
          />
        )}
      </div>

      {/* Radius control */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-cyan-500" />
            <span className="text-sm font-medium text-zinc-700">Raio de entrega</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRadiusChange(radius - 5)}
              className="w-7 h-7 flex items-center justify-center bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <Minus size={14} />
            </button>
            <div className="bg-white border border-zinc-200 rounded-lg px-3 py-1 min-w-[80px] text-center">
              <input
                type="number"
                min={1}
                value={radius}
                onChange={e => handleRadiusChange(Number(e.target.value) || 1)}
                className="w-12 text-center text-sm font-bold text-zinc-900 bg-transparent border-none outline-none"
              />
              <span className="text-xs text-zinc-400 ml-0.5">km</span>
            </div>
            <button
              type="button"
              onClick={() => handleRadiusChange(radius + 5)}
              className="w-7 h-7 flex items-center justify-center bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={500}
          step={1}
          value={radius}
          onChange={e => handleRadiusChange(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
          <span>1 km</span>
          <span>50 km</span>
          <span>100 km</span>
          <span>250 km</span>
          <span>500 km</span>
        </div>
      </div>
    </div>
  );
}
