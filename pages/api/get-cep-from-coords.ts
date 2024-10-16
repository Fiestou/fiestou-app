import type { NextApiRequest, NextApiResponse } from "next";

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

interface GeocodeResponse {
  results: {
    address_components: {
      long_name: string;
      types: string[];
    }[];
  }[];
  status: string;
}

const getCepFromCoordinates = async (lat: string, lng: string): Promise<string | null> => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
  );
  const data: GeocodeResponse = await response.json();

  if (data.status === "OK") {
    const result = data.results.find((r) =>
      r.address_components.some((component) => component.types.includes("postal_code"))
    );
    if (result) {
      const cep = result.address_components.find((component) =>
        component.types.includes("postal_code")
      )?.long_name;
      return cep ?? null;
    }
    return null;
  } else {
    console.error("Erro ao buscar o CEP pela coordenada.");
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ message: "Latitude e longitude são obrigatórios" });
    return;
  }

  try {
    const cep = await getCepFromCoordinates(lat as string, lng as string);

    if (cep) {
      res.json({ cep });
    } else {
      res.json({ message: "Não foi possível encontrar o CEP para as coordenadas fornecidas." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}
