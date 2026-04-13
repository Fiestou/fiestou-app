// src/services/nuvemfiscal.ts
// Integração completa com a API NuvemFiscal
// Documentação: https://www.nuvemfiscal.com.br

import axios, { AxiosInstance } from "axios";

// Cache do token em memória (server-side)
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const NUVEMFISCAL_AUTH_URL = "https://auth.nuvemfiscal.com.br/oauth/token";

function getApiUrl(): string {
  return process.env.NUVEMFISCAL_API_URL || "https://api.sandbox.nuvemfiscal.com.br";
}

function getClientId(): string {
  return process.env.NUVEMFISCAL_CLIENT_ID || "";
}

function getClientSecret(): string {
  return process.env.NUVEMFISCAL_CLIENT_SECRET || "";
}

/**
 * Obtém access token via OAuth2 client_credentials
 * Cacheia em memória até próximo do vencimento
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Retorna cache se ainda válido (margem de 60s)
  if (cachedToken && tokenExpiresAt > now + 60_000) {
    return cachedToken;
  }

  const clientId = getClientId();
  const clientSecret = getClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais NuvemFiscal não configuradas (NUVEMFISCAL_CLIENT_ID / NUVEMFISCAL_CLIENT_SECRET)");
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("scope", "empresa nfe nfse cep cnpj");

  const response = await axios.post(NUVEMFISCAL_AUTH_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 10_000,
  });

  const { access_token, expires_in } = response.data;

  cachedToken = access_token;
  tokenExpiresAt = now + (expires_in * 1000);

  return access_token;
}

/**
 * Cria instância axios autenticada para chamadas à API
 */
async function createClient(): Promise<AxiosInstance> {
  const token = await getAccessToken();

  return axios.create({
    baseURL: getApiUrl(),
    timeout: 30_000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// ========================================
// EMPRESA
// ========================================

interface CadastrarEmpresaParams {
  cpf_cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  regime_tributario: number;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigo_municipio: number;
    cidade: string;
    uf: string;
    cep: string;
  };
  optante_simples_nacional?: boolean;
}

export async function cadastrarEmpresa(data: CadastrarEmpresaParams) {
  const client = await createClient();

  const response = await client.post("/empresas", {
    cpf_cnpj: data.cpf_cnpj.replace(/\D/g, ""),
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia || data.razao_social,
    inscricao_estadual: data.inscricao_estadual,
    inscricao_municipal: data.inscricao_municipal,
    optante_simples_nacional: data.optante_simples_nacional ?? (data.regime_tributario === 1),
    endereco: {
      logradouro: data.endereco.logradouro,
      numero: data.endereco.numero,
      complemento: data.endereco.complemento || "",
      bairro: data.endereco.bairro,
      codigo_municipio: data.endereco.codigo_municipio,
      cidade: data.endereco.cidade,
      uf: data.endereco.uf,
      cep: data.endereco.cep.replace(/\D/g, ""),
      codigo_pais: 1058,
      pais: "Brasil",
    },
  });

  return response.data;
}

export async function consultarEmpresa(cpfCnpj: string) {
  const client = await createClient();
  const clean = cpfCnpj.replace(/\D/g, "");
  const response = await client.get(`/empresas/${clean}`);
  return response.data;
}

export async function listarEmpresas() {
  const client = await createClient();
  const response = await client.get("/empresas");
  return response.data;
}

// ========================================
// CERTIFICADO DIGITAL
// ========================================

export async function uploadCertificado(
  cpfCnpj: string,
  certificadoBase64: string,
  senha: string
) {
  const client = await createClient();
  const clean = cpfCnpj.replace(/\D/g, "");

  const response = await client.put(`/empresas/${clean}/certificado`, {
    certificado: certificadoBase64,
    password: senha,
  });

  return response.data;
}

// ========================================
// NF-e
// ========================================

interface EmitirNfeParams {
  ambiente: 1 | 2; // 1=Produção, 2=Homologação/Sandbox
  emitente: {
    cnpj: string;
    razao_social: string;
    inscricao_estadual?: string;
    regime_tributario: 1 | 2 | 3;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      codigo_municipio: number;
      nome_municipio: string;
      uf: string;
      cep: string;
    };
  };
  destinatario: {
    cpf_cnpj: string;
    nome: string;
    email?: string;
    indicador_ie: 1 | 2 | 9;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      codigo_municipio: number;
      nome_municipio: string;
      uf: string;
      cep: string;
    };
  };
  itens: Array<{
    numero_item: number;
    codigo_produto: string;
    descricao: string;
    ncm: string;
    cfop: number;
    unidade: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
  }>;
  frete: {
    modalidade: 0 | 1 | 2 | 3 | 4 | 9;
  };
  natureza_operacao: string;
  valor_total: number;
  informacoes_complementares?: string;
  referencia_externa?: string;
}

function getCodigoUF(uf: string): number {
  const tabela: Record<string, number> = {
    AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53,
    ES: 32, GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15,
    PB: 25, PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43,
    RO: 11, RR: 14, SC: 42, SP: 35, SE: 28, TO: 17,
  };
  return tabela[uf.toUpperCase()] || 25; // 25=PB como fallback
}

export async function emitirNfe(params: EmitirNfeParams) {
  const client = await createClient();

  const cUF = getCodigoUF(params.emitente.endereco.uf);

  // Monta o corpo da NF-e no formato NuvemFiscal
  const body: any = {
    ambiente: params.ambiente,
    referencia: params.referencia_externa,
    infNFe: {
      versao: "4.00",
      ide: {
        cUF,
        natOp: params.natureza_operacao,
        mod: 55,
        serie: 1,
        dhEmi: new Date().toISOString(),
        tpNF: 1, // Saída
        idDest: 1, // Operação interna
        cMunFG: params.emitente.endereco.codigo_municipio,
        tpImp: 1,
        tpEmis: 1, // Normal
        tpAmb: params.ambiente,
        finNFe: 1, // Normal
        indFinal: 1, // Consumidor final
        indPres: 2, // Internet
        procEmi: 0,
      },
      emit: {
        CNPJ: params.emitente.cnpj.replace(/\D/g, ""),
        xNome: params.emitente.razao_social.substring(0, 60),
        enderEmit: {
          xLgr: params.emitente.endereco.logradouro,
          nro: params.emitente.endereco.numero || "S/N",
          xCpl: params.emitente.endereco.complemento || undefined,
          xBairro: params.emitente.endereco.bairro,
          cMun: params.emitente.endereco.codigo_municipio,
          xMun: params.emitente.endereco.nome_municipio,
          UF: params.emitente.endereco.uf,
          CEP: params.emitente.endereco.cep.replace(/\D/g, ""),
          cPais: 1058,
          xPais: "BRASIL",
        },
        IE: params.emitente.inscricao_estadual || "ISENTO",
        CRT: params.emitente.regime_tributario,
      },
      dest: {
        ...(params.destinatario.cpf_cnpj.replace(/\D/g, "").length === 11
          ? { CPF: params.destinatario.cpf_cnpj.replace(/\D/g, "") }
          : { CNPJ: params.destinatario.cpf_cnpj.replace(/\D/g, "") }),
        xNome: params.destinatario.nome.substring(0, 60),
        indIEDest: params.destinatario.indicador_ie,
        ...(params.destinatario.email ? { email: params.destinatario.email } : {}),
        enderDest: {
          xLgr: params.destinatario.endereco.logradouro,
          nro: params.destinatario.endereco.numero || "S/N",
          xCpl: params.destinatario.endereco.complemento || undefined,
          xBairro: params.destinatario.endereco.bairro,
          cMun: params.destinatario.endereco.codigo_municipio,
          xMun: params.destinatario.endereco.nome_municipio,
          UF: params.destinatario.endereco.uf,
          CEP: params.destinatario.endereco.cep.replace(/\D/g, ""),
          cPais: 1058,
          xPais: "BRASIL",
        },
      },
      det: params.itens.map((item) => ({
        nItem: item.numero_item,
        prod: {
          cProd: item.codigo_produto,
          cEAN: "SEM GTIN",
          xProd: item.descricao.substring(0, 120),
          NCM: item.ncm.replace(/\D/g, ""),
          CFOP: item.cfop,
          uCom: item.unidade,
          qCom: item.quantidade,
          vUnCom: item.valor_unitario,
          vProd: item.valor_total,
          cEANTrib: "SEM GTIN",
          uTrib: item.unidade,
          qTrib: item.quantidade,
          vUnTrib: item.valor_unitario,
          indTot: 1,
        },
        imposto: criarImpostoSimples(params.emitente.regime_tributario, item.valor_total),
      })),
      total: {
        ICMSTot: {
          vBC: 0,
          vICMS: 0,
          vICMSDeson: 0,
          vFCP: 0,
          vBCST: 0,
          vST: 0,
          vFCPST: 0,
          vFCPSTRet: 0,
          vProd: params.valor_total,
          vFrete: 0,
          vSeg: 0,
          vDesc: 0,
          vII: 0,
          vIPI: 0,
          vIPIDevol: 0,
          vPIS: 0,
          vCOFINS: 0,
          vOutro: 0,
          vNF: params.valor_total,
        },
      },
      transp: {
        modFrete: params.frete.modalidade,
      },
      pag: {
        detPag: [
          {
            indPag: 0, // À vista
            tPag: "99", // Outros
            vPag: params.valor_total,
          },
        ],
      },
      ...(params.informacoes_complementares
        ? {
            infAdic: {
              infCpl: params.informacoes_complementares.substring(0, 5000),
            },
          }
        : {}),
    },
  };

  const response = await client.post("/nfe", body);
  return response.data;
}

/**
 * Cria bloco de impostos baseado no regime tributário
 * Para Simples Nacional (CRT 1) usa CSOSN 102 (sem permissão de crédito)
 * Para Regime Normal (CRT 3) usa CST 00 simplificado
 */
function criarImpostoSimples(crt: number, valorProd: number) {
  if (crt === 1 || crt === 2) {
    // Simples Nacional
    return {
      ICMS: {
        ICMSSN102: {
          orig: 0,
          CSOSN: "102",
        },
      },
      PIS: {
        PISOutr: {
          CST: "99",
          vBC: 0,
          pPIS: 0,
          vPIS: 0,
        },
      },
      COFINS: {
        COFINSOutr: {
          CST: "99",
          vBC: 0,
          pCOFINS: 0,
          vCOFINS: 0,
        },
      },
    };
  }

  // Regime Normal simplificado
  return {
    ICMS: {
      ICMS00: {
        orig: 0,
        CST: "00",
        modBC: 3,
        vBC: valorProd,
        pICMS: 18,
        vICMS: +(valorProd * 0.18).toFixed(2),
      },
    },
    PIS: {
      PISAliq: {
        CST: "01",
        vBC: valorProd,
        pPIS: 0.65,
        vPIS: +(valorProd * 0.0065).toFixed(2),
      },
    },
    COFINS: {
      COFINSAliq: {
        CST: "01",
        vBC: valorProd,
        pCOFINS: 3,
        vCOFINS: +(valorProd * 0.03).toFixed(2),
      },
    },
  };
}

// ========================================
// CONSULTA / DOWNLOAD / CANCELAMENTO
// ========================================

export async function consultarNfe(nfeId: string) {
  const client = await createClient();
  const response = await client.get(`/nfe/${nfeId}`);
  return response.data;
}

export async function listarNfes(cpfCnpj: string, opts?: {
  ambiente?: 1 | 2;
  top?: number;
  skip?: number;
  referencia?: string;
}) {
  const client = await createClient();
  const params = new URLSearchParams();
  params.set("cpf_cnpj", cpfCnpj.replace(/\D/g, ""));
  if (opts?.ambiente) params.set("ambiente", String(opts.ambiente));
  if (opts?.top) params.set("$top", String(opts.top));
  if (opts?.skip) params.set("$skip", String(opts.skip));
  if (opts?.referencia) params.set("referencia", opts.referencia);

  const response = await client.get(`/nfe?${params.toString()}`);
  return response.data;
}

export async function downloadNfePdf(nfeId: string): Promise<Buffer> {
  const client = await createClient();
  const response = await client.get(`/nfe/${nfeId}/pdf`, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

export async function downloadNfeXml(nfeId: string): Promise<string> {
  const client = await createClient();
  const response = await client.get(`/nfe/${nfeId}/xml`, {
    responseType: "text",
  });
  return response.data;
}

export async function cancelarNfe(nfeId: string, justificativa: string) {
  const client = await createClient();
  const response = await client.post(`/nfe/${nfeId}/cancelamento`, {
    justificativa: justificativa.substring(0, 255),
  });
  return response.data;
}

export async function consultarStatusSefaz(uf?: string) {
  const client = await createClient();
  const params = uf ? `?uf=${uf}` : "";
  const response = await client.get(`/nfe/sefaz/status${params}`);
  return response.data;
}

// ========================================
// CONSULTA DE CNPJ (utilitário)
// ========================================

export async function consultarCnpj(cnpj: string) {
  const client = await createClient();
  const clean = cnpj.replace(/\D/g, "");
  const response = await client.get(`/cnpj/${clean}`);
  return response.data;
}

// ========================================
// CONSULTA DE CEP (utilitário)
// ========================================

export async function consultarCep(cep: string) {
  const client = await createClient();
  const clean = cep.replace(/\D/g, "");
  const response = await client.get(`/cep/${clean}`);
  return response.data;
}
