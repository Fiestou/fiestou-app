import type { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import axios from "axios";

const SPEDY_API_KEY = process.env.SPEDY_API_KEY || "";
const SPEDY_BASE = process.env.SPEDY_ENVIRONMENT === "production"
  ? "https://api.spedy.com.br/v1"
  : "https://sandbox-api.spedy.com.br/v1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const api = new Api();

  if (req.method === "GET") {
    const storeId = req.query.storeId as string;
    if (!storeId) return res.status(400).json({ error: "storeId obrigatorio" });

    try {
      const result: any = await api.bridge({
        method: "get",
        url: `fiscal/store-config?store_id=${storeId}`,
      }, { req });

      return res.status(200).json({ success: true, config: result?.data || null });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "POST") {
    const { storeId, cnpj, razaoSocial, nomeFantasia, inscricaoMunicipal,
            regimeTributario, federalServiceCode, cityServiceCode, cnaeCode,
            endereco } = req.body;

    if (!storeId || !cnpj || !razaoSocial) {
      return res.status(400).json({ error: "storeId, cnpj e razaoSocial sao obrigatorios" });
    }

    try {
      // Register company in Spedy
      const spedyPayload = {
        name: nomeFantasia || razaoSocial,
        legalName: razaoSocial,
        federalTaxNumber: cnpj.replace(/\D/g, ""),
        taxRegime: regimeTributario || "simplesNacional",
        email: `fiscal+${storeId}@fiestou.com.br`,
        address: {
          street: endereco?.street || "Nao informado",
          number: endereco?.number || "S/N",
          district: endereco?.district || "Centro",
          postalCode: (endereco?.postalCode || "58000000").replace(/\D/g, ""),
          city: {
            code: endereco?.cityCode || "2507507",
            name: endereco?.city || "Joao Pessoa",
            state: endereco?.state || "PB",
          },
        },
      };

      const spedyResp = await axios.post(`${SPEDY_BASE}/companies`, spedyPayload, {
        headers: { "X-Api-Key": SPEDY_API_KEY, "Content-Type": "application/json" },
      });

      const spedyCompany = spedyResp.data;

      // Save config via backend
      const saveResult: any = await api.bridge({
        method: "post",
        url: "fiscal/store-config",
        data: {
          store_id: storeId,
          spedy_company_id: spedyCompany.id,
          spedy_api_key: spedyCompany.apiCredentials?.apiKey || "",
          cnpj: cnpj.replace(/\D/g, ""),
          razao_social: razaoSocial,
          nome_fantasia: nomeFantasia,
          inscricao_municipal: inscricaoMunicipal,
          regime_tributario: regimeTributario || "simplesNacional",
          federal_service_code: federalServiceCode || "7.02",
          city_service_code: cityServiceCode,
          cnae_code: cnaeCode,
        },
      }, { req });

      return res.status(200).json({
        success: true,
        config: saveResult?.data,
        spedyCompanyId: spedyCompany.id,
      });
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        error: "Falha ao cadastrar empresa",
        details: error?.response?.data || error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}