import { useState, useEffect, useCallback, useRef } from "react";
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
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Geocode apenas 1 vez no mount se nao tem lat/lng
  useEffect(() => {
    if (lat && lng) { setLoading(false); return; }
    if (!storeCep && !storeCity) { setLoading(false); return; }

    let cancelled = false;

    const geocode = async () => {
      try {
        const query = storeCep
          ? `${storeCep}, ${storeState || "Brasil"}`
          : `${storeCity}, ${storeState || "PB"}, Brasil`;

        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          { headers: { "Accept-Language": "pt-BR" } }
        );
        const data = await resp.json();

        if (cancelled) return;

        if (data?.[0]) {
          const newCenter: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setCenter(newCenter);
          onUpdateRef.current(newCenter[0], newCenter[1], radius);
        } else {
          setCenter([-7.115, -34.861]);
          setGeocodeError("Endere\u00e7o n\u00e3o encontrado. Ajuste o pin manualmente.");
        }
      } catch {
        if (cancelled) return;
        setCenter([-7.115, -34.861]);
        setGeocodeError("Erro ao buscar localiza\u00e7\u00e3o. Ajuste o pin.");
      }
      setLoading(false);
    };

    geocode();
    return () => { cancelled = true; };
  }, []); // Roda apenas 1 vez

  const handleCenterChange = useCallback((newLat: number, newLng: number) => {
    setCenter([newLat, newLng]);
    onUpdateRef.current(newLat, newLng, radius);
  }, [radius]);

  const handleRadiusChange = useCallback((newRadius: number) => {
    const r = Math.max(1, Math.round(newRadius));
    setRadius(r);
    if (center) onUpdateRef.current(center[0], center[1], r);
  }, [center]);

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

      <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100" style={{ height: 340 }}>
        {center && (
          <MapInner
            center={center}
            radiusMeters={radius * 1000}
            onCenterChange={handleCenterChange}
          />
        )}
      </div>

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
                className="w-12 text-center text-sm font-bold text-zinc-900 bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
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
          value={Math.min(radius, 500)}
          onChange={e => handleRadiusChange(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
          <span>1 km</span>
          <span>50</span>
          <span>100</span>
          <span>250</span>
          <span>500+ km</span>
        </div>
      </div>
    </div>
  );
}
