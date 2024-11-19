import { useState } from "react";
import { Button } from "../ui/form";

interface Location {
  lat: number;
  lng: number;
}

export default function LocationComponent() {
  const [location, setLocation] = useState<Location | null>(null);
  const [cep, setCep] = useState<string | null>(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      console.log("Geolocalização não é suportada por este navegador.");
    }
  };

  const showPosition = async (position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setLocation({ lat, lng });

    try {
      const response = await fetch(
        `/api/get-cep-from-coords?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      if (data.cep) {
        setCep(data.cep);
      } else {
        console.error("Erro ao buscar o CEP");
      }
    } catch (error) {
      console.error("Erro ao buscar o CEP:", error);
    }
  };

  const showError = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("Permissão negada pelo usuário.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Informação de localização indisponível.");
        break;
      case error.TIMEOUT:
        console.log("O pedido para obter a localização expirou.");
        break;
    }
  };

  return (
    <div className="z-[10000] relative">
      <button onClick={getLocation}>Obter Localização</button>
      {location && (
        <p>
          Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}
      {cep && <p>CEP: {cep}</p>}
    </div>
  );
}
