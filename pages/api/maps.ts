// pages/api/distance.js
interface GeoType {
  lat: number;
  lng: number;
}

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const getCoordinatesFromCEP = async (cep: string) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=${apiKey}`
  );
  const data = await response.json();

  console.log(data, "getCoordinatesFromCEP");

  if (data.status === "OK") {
    const { lat, lng }: GeoType = data.results[0].geometry.location;
    return { lat, lng };
  } else {
    console.log(
      "Não foi possível encontrar as coordenadas para o CEP fornecido."
    );

    return {} as GeoType;
  }
};

const getDistanceBetweenCoords = async (
  origin: GeoType,
  destination: GeoType
) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`
  );
  const data = await response.json();

  if (data.status === "OK") {
    const distance = data.rows[0].elements[0].distance.value;
    return distance;
  } else {
    console.error("Erro ao calcular a distância.");
    return null;
  }
};

export default async function handler(req: any, res: any) {
  const { cep } = req.query;

  if (!cep) {
    res.json({ message: "CEP é obrigatório" });
  }

  const originCoords: GeoType = {
    lat: -7.118113399999999,
    lng: -34.8428071,
  };

  try {
    const destinationCoords: GeoType = await getCoordinatesFromCEP(cep);

    const distance = await getDistanceBetweenCoords(
      originCoords,
      destinationCoords
    );

    if (distance) {
      res.json({ distance: distance });
    } else {
      res.json({ message: "Erro ao buscar dados da API." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}
