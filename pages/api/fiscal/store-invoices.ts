import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const SPEDY_API_KEY = process.env.SPEDY_API_KEY || "";
const SPEDY_BASE = process.env.SPEDY_ENVIRONMENT === "production"
  ? "https://api.spedy.com.br/v1"
  : "https://sandbox-api.spedy.com.br/v1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const storeId = req.query.storeId as string;
  if (!storeId) return res.status(400).json({ error: "storeId obrigatorio" });

  try {
    const response = await axios.get(`${SPEDY_BASE}/service-invoices`, {
      headers: { "X-Api-Key": SPEDY_API_KEY },
      params: { pageSize: 50 },
    });

    const allInvoices = response.data?.items || [];

    // Filter invoices that match this store by integrationId pattern
    // Our integrationId format: "fiestou-taxa-{orderId}"
    // We return all for now since we only have Fiestou as emitter
    const invoices = allInvoices.map((inv: any) => ({
      id: inv.id,
      integrationId: inv.integrationId,
      status: inv.status,
      numero: inv.number,
      amount: inv.amount,
      description: inv.description,
      issuedOn: inv.issuedOn,
      effectiveDate: inv.effectiveDate,
      receiver: {
        name: inv.receiver?.name,
        federalTaxNumber: inv.receiver?.federalTaxNumber,
      },
      authorization: inv.authorization,
      processingDetail: inv.processingDetail,
    }));

    return res.status(200).json({ success: true, invoices });
  } catch (error: any) {
    console.error("Erro ao listar notas:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Falha ao buscar notas fiscais",
      details: error?.response?.data?.message || error.message,
    });
  }
}