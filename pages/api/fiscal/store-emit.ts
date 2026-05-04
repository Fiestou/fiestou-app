import type { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import axios from "axios";

const SPEDY_BASE = process.env.SPEDY_ENVIRONMENT === "production"
  ? "https://api.spedy.com.br/v1"
  : "https://sandbox-api.spedy.com.br/v1";

// Observacoes padrao por regime tributario
const REGIME_OBSERVATIONS: Record<string, string> = {
  simplesNacional: "Documento emitido por ME ou EPP optante pelo Simples Nacional. Nao gera direito a credito fiscal de IPI.",
  mei: "Documento emitido por MEI - Microempreendedor Individual. Nao gera direito a credito fiscal de IPI.",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { storeId, orderId, spedyApiKey, description, federalServiceCode,
          cityServiceCode, cnaeCode, receiver, amount,
          issWithheld, issRate, regimeTributario,
          additionalObservation, replacedNfseId } = req.body;

  if (!storeId || !orderId || !spedyApiKey) {
    return res.status(400).json({ error: "storeId, orderId e spedyApiKey sao obrigatorios" });
  }

  try {
    // Monta descricao com observacao fiscal
    const baseDesc = description || `Locacao de materiais para eventos. Pedido #${orderId}`;
    const regimeObs = REGIME_OBSERVATIONS[regimeTributario || "simplesNacional"] || "";
    const extraObs = additionalObservation ? `\n${additionalObservation}` : "";
    const fullDescription = regimeObs
      ? `${baseDesc}\n\n${regimeObs}${extraObs}`
      : `${baseDesc}${extraObs}`;

    const nfsePayload: any = {
      integrationId: `store-${storeId}-order-${orderId}`,
      effectiveDate: new Date().toISOString(),
      sendEmailToCustomer: false,
      description: fullDescription,
      federalServiceCode: federalServiceCode || "7.02",
      taxationType: "taxationInMunicipality",
      receiver: {
        name: receiver?.name || "Consumidor Final",
        federalTaxNumber: (receiver?.document || "").replace(/\D/g, ""),
        address: receiver?.address ? {
          street: receiver.address.street || "Nao informado",
          number: receiver.address.number || "S/N",
          district: receiver.address.district || "Centro",
          postalCode: (receiver.address.postalCode || "58000000").replace(/\D/g, ""),
          city: {
            code: receiver.address.cityCode || "2507507",
            name: receiver.address.city || "Joao Pessoa",
            state: receiver.address.state || "PB",
          },
        } : undefined,
      },
      total: {
        invoiceAmount: Number(amount) || 0,
        issRate: typeof issRate === "number" ? issRate : 0.02,
        issWithheld: issWithheld === true,
      },
    };

    // NFS-e de substituicao: referencia a nota original
    if (replacedNfseId) {
      nfsePayload.replacedServiceInvoiceId = replacedNfseId;
    }

    if (cityServiceCode) nfsePayload.cityServiceCode = cityServiceCode;
    if (cnaeCode) nfsePayload.cnaeCode = cnaeCode;

    const spedyResp = await axios.post(`${SPEDY_BASE}/service-invoices`, nfsePayload, {
      headers: { "X-Api-Key": spedyApiKey, "Content-Type": "application/json" },
    });

    return res.status(200).json({
      success: true,
      nfseId: spedyResp.data?.id,
      status: spedyResp.data?.status,
      numero: spedyResp.data?.number,
      rps: spedyResp.data?.rps,
      issWithheld: nfsePayload.total.issWithheld,
    });
  } catch (error: any) {
    console.error("Erro ao emitir NFS-e do lojista:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Falha ao emitir nota fiscal",
      details: error?.response?.data || error.message,
    });
  }
}
