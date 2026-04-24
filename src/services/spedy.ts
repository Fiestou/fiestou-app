// src/services/spedy.ts
// Integração completa com a API Spedy
// Documentação: https://docs.spedy.com.br | https://api.spedy.com.br/llms.txt

import axios, { AxiosInstance } from "axios";

function getBaseUrl(): string {
  const env = process.env.SPEDY_ENVIRONMENT || "sandbox";
  if (env === "production") return "https://api.spedy.com.br/v1";
  return process.env.SPEDY_BASE_URL || "https://sandbox-api.spedy.com.br/v1";
}

function getApiKey(): string {
  return process.env.SPEDY_API_KEY || "";
}

/**
 * Cria instância axios autenticada via API Key
 * Spedy usa header X-Api-Key (sem OAuth2)
 */
function createClient(): AxiosInstance {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Credenciais Spedy não configuradas (SPEDY_API_KEY)");
  }

  return axios.create({
    baseURL: getBaseUrl(),
    timeout: 30_000,
    headers: {
      "X-Api-Key": apiKey,
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
  email?: string;
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

function mapRegimeTributario(crt: number): string {
  switch (crt) {
    case 1: return "simplesNacional";
    case 2: return "simplesNacionalExcessoSublimite";
    case 3: return "regimeNormal";
    default: return "simplesNacional";
  }
}

export async function cadastrarEmpresa(data: CadastrarEmpresaParams) {
  const client = createClient();

  const body = {
    name: data.nome_fantasia || data.razao_social,
    legalName: data.razao_social,
    federalTaxNumber: data.cpf_cnpj.replace(/\D/g, ""),
    stateTaxNumber: data.inscricao_estadual || undefined,
    cityTaxNumber: data.inscricao_municipal || undefined,
    email: data.email || "fiscal@fiestou.com.br",
    taxRegime: mapRegimeTributario(data.regime_tributario),
    address: {
      street: data.endereco.logradouro,
      number: data.endereco.numero || "S/N",
      additionalInformation: data.endereco.complemento || undefined,
      district: data.endereco.bairro,
      postalCode: data.endereco.cep.replace(/\D/g, ""),
      city: {
        code: String(data.endereco.codigo_municipio),
        name: data.endereco.cidade,
        state: data.endereco.uf,
      },
    },
  };

  const response = await client.post("/companies", body);
  return response.data;
}

export async function consultarEmpresa(companyIdOrCnpj: string) {
  const client = createClient();
  const response = await client.get(`/companies/${companyIdOrCnpj}`);
  return response.data;
}

export async function listarEmpresas() {
  const client = createClient();
  const response = await client.get("/companies");
  return response.data;
}

// ========================================
// CERTIFICADO DIGITAL
// ========================================

export async function uploadCertificado(
  companyId: string,
  certificadoBuffer: Buffer,
  senha: string
) {
  const client = createClient();
  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("file", certificadoBuffer, { filename: "certificado.pfx" });
  form.append("password", senha);

  const response = await client.post(`/companies/${companyId}/certificates`, form, {
    headers: {
      ...form.getHeaders(),
      "X-Api-Key": getApiKey(),
    },
  });

  return response.data;
}

// ========================================
// NFS-e (NOTAS DE SERVIÇO)
// ========================================

export interface EmitirNfseParams {
  ambiente: 1 | 2; // 1=Produção, 2=Homologação
  referencia?: string;
  emitente: {
    cpf_cnpj: string;
    inscricao_municipal?: string;
  };
  tomador: {
    cpf_cnpj: string;
    razao_social: string;
    email?: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      codigo_municipio: string;
      cidade: string;
      uf: string;
      cep: string;
    };
  };
  servico: {
    codigo_cnae?: string;
    codigo_tributacao_municipio?: string;
    item_lista_servico?: string;
    discriminacao: string;
    codigo_municipio: string;
    valor_servicos: number;
    aliquota_iss?: number;
  };
}

/**
 * Mapeia código de tributação municipal pra código LC 116/03
 * Usado na Spedy como federalServiceCode
 */
function mapFederalServiceCode(ctiss?: string, itemLista?: string): string {
  if (itemLista && itemLista !== "00") return itemLista;
  // Mapeamento dos CTISS usados pelo Fiestou
  const map: Record<string, string> = {
    "772920200": "7.02",   // Locação de equipamentos
    "749010400": "10.02",  // Agenciamento/intermediação
  };
  return map[ctiss || ""] || "10.02";
}

/**
 * Mapeia código de tributação municipal pra cityServiceCode da Spedy
 */
function mapCityServiceCode(ctiss?: string): string {
  const map: Record<string, string> = {
    "772920200": "0702",
    "749010400": "1002",
  };
  return map[ctiss || ""] || ctiss || "1002";
}

export async function emitirNfse(params: EmitirNfseParams) {
  const client = createClient();

  const aliquotaIss = params.servico.aliquota_iss || 0.05;
  const valorServicos = params.servico.valor_servicos;
  const issAmount = +(valorServicos * aliquotaIss).toFixed(2);

  const body: any = {
    integrationId: params.referencia || undefined,
    effectiveDate: new Date().toISOString(),
    status: "enqueued",
    sendEmailToCustomer: false,
    description: params.servico.discriminacao.substring(0, 2000),
    federalServiceCode: mapFederalServiceCode(
      params.servico.codigo_tributacao_municipio,
      params.servico.item_lista_servico
    ),
    cityServiceCode: mapCityServiceCode(params.servico.codigo_tributacao_municipio),
    taxationType: "taxationInMunicipality",
    receiver: {
      name: params.tomador.razao_social.substring(0, 150),
      ...(params.tomador.email ? { email: params.tomador.email } : {}),
      address: {
        street: params.tomador.endereco.logradouro || "Não informado",
        number: params.tomador.endereco.numero || "S/N",
        district: params.tomador.endereco.bairro || "Centro",
        postalCode: (params.tomador.endereco.cep || "58000000").replace(/\D/g, ""),
        city: {
          code: params.tomador.endereco.codigo_municipio || "2507507",
          name: params.tomador.endereco.cidade || "João Pessoa",
          state: params.tomador.endereco.uf || "PB",
        },
      },
    },
    total: {
      invoiceAmount: valorServicos,
      issRate: aliquotaIss,
      issAmount: issAmount,
      issWithheld: false,
    },
  };

  // CPF ou CNPJ do tomador
  const docLimpo = (params.tomador.cpf_cnpj || "").replace(/\D/g, "");
  if (docLimpo && docLimpo !== "00000000000" && docLimpo.length >= 11) {
    body.receiver.federalTaxNumber = docLimpo;
  }

  const response = await client.post("/service-invoices", body);
  return normalizeNfseResponse(response.data);
}

/**
 * Normaliza resposta da Spedy pro formato que os API Routes esperam
 * (mantém compatibilidade com o formato anterior da NuvemFiscal)
 */
function normalizeNfseResponse(data: any) {
  return {
    id: data.id,
    status: mapSpedyStatus(data.status),
    numero: data.number || null,
    serie: data.rps?.series || null,
    chave: data.accessKey || null,
    data_emissao: data.issuedOn || data.effectiveDate || null,
    valor_total: data.amount || data.totals?.invoiceAmount || null,
    motivo_status: data.processingDetail?.message || null,
    ambiente: data.environmentType === "production" ? 1 : 2,
    // Campos extras da Spedy
    spedy_id: data.id,
    spedy_status: data.status,
    processing_detail: data.processingDetail || null,
  };
}

/**
 * Mapeia status da Spedy pro formato interno
 */
function mapSpedyStatus(status: string): string {
  const map: Record<string, string> = {
    created: "processando",
    enqueued: "processando",
    received: "processando",
    authorized: "autorizada",
    rejected: "rejeitada",
    canceled: "cancelada",
    denied: "rejeitada",
    removed: "cancelada",
    disabled: "cancelada",
    inContingent: "processando",
  };
  return map[status] || status;
}

export async function consultarNfse(nfseId: string) {
  const client = createClient();
  const response = await client.get(`/service-invoices/${nfseId}`);
  return normalizeNfseResponse(response.data);
}

export async function downloadNfsePdf(nfseId: string): Promise<Buffer> {
  const client = createClient();
  const response = await client.get(`/service-invoices/${nfseId}/pdf`, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

export async function downloadNfseXml(nfseId: string): Promise<string> {
  const client = createClient();
  const response = await client.get(`/service-invoices/${nfseId}/xml`, {
    responseType: "text",
  });
  return response.data;
}

export async function cancelarNfse(nfseId: string, justificativa: string) {
  const client = createClient();
  const response = await client.delete(`/service-invoices/${nfseId}`, {
    data: { justification: justificativa.substring(0, 255) },
  });
  return {
    success: true,
    status: "cancelada",
    ...response.data,
  };
}

// ========================================
// NF-e (NOTAS DE PRODUTO)
// ========================================

interface EmitirNfeParams {
  ambiente: 1 | 2;
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

function mapFreteSpedy(mod: number): string {
  const m: Record<number, string> = {
    0: "byIssuer",
    1: "byReceiver",
    2: "byThirdParties",
    9: "free",
  };
  return m[mod] || "free";
}

export async function emitirNfe(params: EmitirNfeParams) {
  const client = createClient();

  const crt = params.emitente.regime_tributario;
  const items = params.itens.map((item) => {
    const taxes: any = {};

    if (crt === 1 || crt === 2) {
      // Simples Nacional — CSOSN 400
      taxes.icms = { origin: 0, csosn: 400 };
      taxes.pis = { cst: 7 };
      taxes.cofins = { cst: 7 };
    } else {
      // Regime Normal — CST 00
      taxes.icms = {
        origin: 0,
        cst: 0,
        baseTaxModality: 3,
        baseTax: item.valor_total,
        rate: 18.0,
        amount: +(item.valor_total * 0.18).toFixed(2),
      };
      taxes.pis = {
        cst: 1,
        baseTax: item.valor_total,
        rate: 0.0065,
        amount: +(item.valor_total * 0.0065).toFixed(2),
      };
      taxes.cofins = {
        cst: 1,
        baseTax: item.valor_total,
        rate: 0.03,
        amount: +(item.valor_total * 0.03).toFixed(2),
      };
    }

    return {
      code: item.codigo_produto,
      description: item.descricao.substring(0, 120),
      ncm: item.ncm.replace(/\D/g, ""),
      cfop: item.cfop,
      unit: item.unidade,
      quantity: item.quantidade,
      unitAmount: item.valor_unitario,
      totalAmount: item.valor_total,
      unitTax: item.unidade,
      quantityTax: item.quantidade,
      unitTaxAmount: item.valor_unitario,
      makeupTotal: true,
      taxes,
    };
  });

  const destDoc = params.destinatario.cpf_cnpj.replace(/\D/g, "");

  const body: any = {
    integrationId: params.referencia_externa || undefined,
    isFinalCustomer: true,
    operationType: "outgoing",
    destination: "internal",
    presenceType: "internet",
    operationNature: params.natureza_operacao || "Venda de Mercadoria",
    sendEmailToCustomer: !!params.destinatario.email,
    receiver: {
      name: params.destinatario.nome.substring(0, 60),
      ...(destDoc.length >= 11 ? { federalTaxNumber: destDoc } : {}),
      ...(params.destinatario.email ? { email: params.destinatario.email } : {}),
      address: {
        street: params.destinatario.endereco.logradouro,
        number: params.destinatario.endereco.numero || "S/N",
        district: params.destinatario.endereco.bairro,
        postalCode: params.destinatario.endereco.cep.replace(/\D/g, ""),
        city: {
          code: String(params.destinatario.endereco.codigo_municipio),
          name: params.destinatario.endereco.nome_municipio,
          state: params.destinatario.endereco.uf,
        },
      },
    },
    items,
    payments: [
      {
        method: "pix",
        amount: params.valor_total,
      },
    ],
    total: {
      invoiceAmount: params.valor_total,
      productAmount: params.valor_total,
    },
    transport: {
      freightMode: mapFreteSpedy(params.frete.modalidade),
    },
  };

  if (params.informacoes_complementares) {
    body.additionalInformation = params.informacoes_complementares.substring(0, 5000);
  }

  const response = await client.post("/product-invoices", body);
  return normalizeNfeResponse(response.data);
}

function normalizeNfeResponse(data: any) {
  return {
    id: data.id,
    status: mapSpedyStatus(data.status),
    numero: data.number || null,
    serie: data.series || null,
    chave: data.accessKey || null,
    data_emissao: data.issuedOn || null,
    valor_total: data.amount || null,
    motivo_status: data.processingDetail?.message || null,
    ambiente: data.environmentType === "production" ? 1 : 2,
    spedy_id: data.id,
    spedy_status: data.status,
    processing_detail: data.processingDetail || null,
  };
}

// ========================================
// CONSULTA / DOWNLOAD / CANCELAMENTO NF-e
// ========================================

export async function consultarNfe(nfeId: string) {
  const client = createClient();
  const response = await client.get(`/product-invoices/${nfeId}`);
  return normalizeNfeResponse(response.data);
}

export async function listarNfes(cpfCnpj: string, opts?: {
  ambiente?: 1 | 2;
  top?: number;
  skip?: number;
  referencia?: string;
}) {
  const client = createClient();
  const params = new URLSearchParams();
  if (opts?.referencia) params.set("transactionId", opts.referencia);
  params.set("page", String(Math.floor((opts?.skip || 0) / (opts?.top || 20)) + 1));
  params.set("pageSize", String(opts?.top || 20));

  const response = await client.get(`/product-invoices?${params.toString()}`);
  return response.data;
}

export async function downloadNfePdf(nfeId: string): Promise<Buffer> {
  const client = createClient();
  const response = await client.get(`/product-invoices/${nfeId}/pdf`, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

export async function downloadNfeXml(nfeId: string): Promise<string> {
  const client = createClient();
  const response = await client.get(`/product-invoices/${nfeId}/xml`, {
    responseType: "text",
  });
  return response.data;
}

export async function cancelarNfe(nfeId: string, justificativa: string) {
  const client = createClient();
  const response = await client.delete(`/product-invoices/${nfeId}`, {
    data: { justification: justificativa.substring(0, 255) },
  });
  return {
    success: true,
    status: "cancelada",
    ...response.data,
  };
}

// ========================================
// UTILITÁRIOS
// ========================================

export async function consultarStatusSefaz() {
  // Spedy não tem endpoint dedicado pra status SEFAZ
  // Retorna status genérico
  return { disponivel: true, provider: "spedy" };
}

export async function consultarCnpj(cnpj: string) {
  // Spedy não tem endpoint de consulta CNPJ
  // Usa a API pública da ReceitaWS como fallback
  const clean = cnpj.replace(/\D/g, "");
  const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${clean}`, {
    timeout: 10_000,
  });
  return response.data;
}

export async function consultarCep(cep: string) {
  // Spedy não tem endpoint de CEP
  // Usa ViaCEP como fallback
  const clean = cep.replace(/\D/g, "");
  const response = await axios.get(`https://viacep.com.br/ws/${clean}/json/`, {
    timeout: 10_000,
  });
  return response.data;
}
