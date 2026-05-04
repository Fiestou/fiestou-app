import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Minus, Plus, Search } from "lucide-react";

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

async function geocodeQuery(query: string): Promise<[number, number] | null> {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`,
      { headers: { "Accept-Language": "pt-BR" } }
    );
    const data = await resp.json();
    if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch {
    return null;
  }
}

export default function DeliveryRadiusMap({
  lat, lng, radiusKm, storeCep, storeCity, storeState, onUpdate,
}: DeliveryRadiusMapProps) {
  const hasInitialCoords = !!(lat && lng);
  const [center, setCenter] = useState<[number, number] | null>(
    hasInitialCoords ? [lat!, lng!] : null
  );
  const [radius, setRadius] = useState(radiusKm || 15);
  const [mapReady, setMapReady] = useState(hasInitialCoords);

  // City search
  const [cityQuery, setCityQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; coords: [number, number] }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<any>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // Se tem coords salvas, abre direto no mapa
  // Se tem CEP/cidade da loja, tenta geocodar automaticamente
  useEffect(() => {
    if (hasInitialCoords) return;
    if (!storeCep && !storeCity) return;

    const query = storeCep
      ? `${storeCep}, ${storeState || "Brasil"}`
      : `${storeCity}, ${storeState || "PB"}, Brasil`;

    geocodeQuery(query).then((coords) => {
      if (coords) {
        setCenter(coords);
        setMapReady(true);
        onUpdateRef.current(coords[0], coords[1], radius);
      }
    });
  }, []);

  // Busca cidades enquanto o usuario digita
  const handleSearchInput = (value: string) => {
    setCityQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=br&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "pt-BR" } }
        );
        const data = await resp.json();
        const results = data.map((item: any) => ({
          name: item.display_name.split(",").slice(0, 3).join(","),
          coords: [parseFloat(item.lat), parseFloat(item.lon)] as [number, number],
        }));
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
      }
      setSearching(false);
    }, 400);
  };

  const selectCity = (coords: [number, number], name: string) => {
    setCenter(coords);
    setMapReady(true);
    setShowSuggestions(false);
    setCityQuery(name);
    onUpdateRef.current(coords[0], coords[1], radius);
  };

  // Enter = seleciona primeiro resultado ou busca imediata
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();

    if (suggestions.length > 0) {
      selectCity(suggestions[0].coords, suggestions[0].name);
      return;
    }

    if (cityQuery.length >= 2) {
      setSearching(true);
      const coords = await geocodeQuery(cityQuery + ", Brasil");
      setSearching(false);
      if (coords) {
        selectCity(coords, cityQuery);
      }
    }
  };

  const handleCenterChange = useCallback((newLat: number, newLng: number) => {
    setCenter([newLat, newLng]);
    onUpdateRef.current(newLat, newLng, radius);
  }, [radius]);

  const handleRadiusChange = useCallback((newRadius: number) => {
    const r = Math.max(1, Math.round(newRadius));
    setRadius(r);
    if (center) onUpdateRef.current(center[0], center[1], r);
  }, [center]);

  return (
    <div className="space-y-3">
      {/* Busca de cidade */}
      {!mapReady && (
        <div className="bg-gradient-to-br from-cyan-50 to-zinc-50 border border-cyan-200 rounded-xl p-5 text-center">
          <MapPin size={28} className="text-cyan-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-700 mb-1">Onde fica sua loja?</p>
          <p className="text-xs text-zinc-500 mb-4">
            Busque sua cidade para posicionar o mapa. Depois ajuste o pin e o raio.
          </p>
          <div className="relative max-w-sm mx-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={cityQuery}
                onChange={e => handleSearchInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: João Pessoa, Recife, São Paulo..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                autoComplete="off"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectCity(s.coords, s.name)}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-cyan-50 transition-colors border-b border-zinc-100 last:border-0"
                  >
                    <MapPin size={12} className="inline mr-1.5 text-cyan-500" />
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mapa */}
      {mapReady && center && (
        <>
          {/* Busca rapida para trocar de cidade */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={cityQuery}
              onChange={e => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar outra cidade..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-cyan-300"
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectCity(s.coords, s.name)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-cyan-50 transition-colors border-b border-zinc-100 last:border-0"
                  >
                    <MapPin size={10} className="inline mr-1 text-cyan-500" />
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100" style={{ height: "min(340px, 50vh)" }}>
            <MapInner
              center={center}
              radiusMeters={radius * 1000}
              onCenterChange={handleCenterChange}
            />
          </div>

          {/* Controle de raio */}
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
        </>
      )}
    </div>
  );
}
