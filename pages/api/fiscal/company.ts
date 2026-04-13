// pages/api/fiscal/company.ts
// Cadastro e consulta de empresa na NuvemFiscal

import type { NextApiRequest, NextApiResponse } from "next";
import {
  cadastrarEmpresa,
  consultarEmpresa,
  uploadCertificado,
} from "@/src/services/nuvemfiscal";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET — consultar empresa
  if (req.method === "GET") {
    const { cnpj } = req.query;

    if (!cnpj || typeof cnpj !== "string") {
      return res.status(400).json({ error: "CNPJ é obrigatório" });
    }

    try {
      const empresa = await consultarEmpresa(cnpj);
      return res.status(200).json({ success: true, empresa });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        return res.status(404).json({ success: false, error: "Empresa não cadastrada na NuvemFiscal" });
      }
      return res.status(500).json({
        success: false,
        error: "Erro ao consultar empresa",
        details: error?.response?.data?.message || error.message,
      });
    }
  }

  // POST — cadastrar empresa
  if (req.method === "POST") {
    const { action } = req.body;

    // Upload de certificado digital
    if (action === "upload_certificado") {
      const { cnpj, certificado_base64, senha } = req.body;

      if (!cnpj || !certificado_base64 || !senha) {
        return res.status(400).json({
          error: "cnpj, certificado_base64 e senha são obrigatórios",
        });
      }

      try {
        const resultado = await uploadCertificado(cnpj, certificado_base64, senha);
        return res.status(200).json({ success: true, resultado });
      } catch (error: any) {
        return res.status(500).json({
          success: false,
          error: "Falha ao enviar certificado",
          details: error?.response?.data?.message || error.message,
        });
      }
    }

    // Cadastro de empresa
    const {
      cnpj,
      razao_social,
      nome_fantasia,
      inscricao_estadual,
      inscricao_municipal,
      regime_tributario,
      endereco,
    } = req.body;

    if (!cnpj || !razao_social) {
      return res.status(400).json({
        error: "cnpj e razao_social são obrigatórios",
      });
    }

    try {
      const empresa = await cadastrarEmpresa({
        cpf_cnpj: cnpj,
        razao_social,
        nome_fantasia,
        inscricao_estadual,
        inscricao_municipal,
        regime_tributario: regime_tributario || 1,
        endereco: endereco || {
          logradouro: "Não informado",
          numero: "S/N",
          bairro: "Centro",
          codigo_municipio: 2507507,
          cidade: "Joao Pessoa",
          uf: "PB",
          cep: "58000000",
        },
      });

      return res.status(200).json({ success: true, empresa });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: "Falha ao cadastrar empresa",
        details: error?.response?.data?.message || error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
