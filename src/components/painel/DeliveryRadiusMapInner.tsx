import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<any>(null);

  return (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker) {
            const pos = marker.getLatLng();
            onDragEnd(pos.lat, pos.lng);
          }
        },
      }}
    />
  );
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function FitBounds({ center, radiusMeters }: { center: [number, number]; radiusMeters: number }) {
  const map = useMapEvents({});
  useEffect(() => {
    const circle = L.circle(center, { radius: radiusMeters });
    const bounds = circle.getBounds();
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [center, radiusMeters, map]);
  return null;
}

interface MapInnerProps {
  center: [number, number];
  radiusMeters: number;
  onCenterChange: (lat: number, lng: number) => void;
}

export default function DeliveryRadiusMapInner({ center, radiusMeters, onCenterChange }: MapInnerProps) {
  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={center}
        radius={radiusMeters}
        pathOptions={{
          color: "#06b6d4",
          fillColor: "#06b6d4",
          fillOpacity: 0.12,
          weight: 2,
        }}
      />
      <DraggableMarker position={center} onDragEnd={onCenterChange} />
      <MapClickHandler onClick={onCenterChange} />
      <FitBounds center={center} radiusMeters={radiusMeters} />
    </MapContainer>
  );
}
