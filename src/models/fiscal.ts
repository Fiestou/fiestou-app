// src/models/fiscal.ts
// Tipagens para integração NuvemFiscal

export type NfeStatus =
  | "processando"
  | "autorizada"
  | "rejeitada"
  | "cancelada"
  | "erro";

export interface FiscalNfeReference {
  nfeId: string;
  status: NfeStatus;
  numero?: number;
  serie?: number;
  chaveAcesso?: string;
  dataEmissao: string;
  valorTotal: number;
  motivoRejeicao?: string;
  pdfUrl?: string;
  xmlUrl?: string;
}

export interface FiscalConfig {
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  regimeTributario: 1 | 2 | 3; // 1=Simples, 2=Simples (excesso), 3=Normal
  ncmPadrao: string;
  cfopPadrao: number;
  certificadoUploadado: boolean;
  nuvemfiscalEmpresaId?: string;
  emissaoAutomatica: boolean;
}

export interface NfeEmitente {
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual?: string;
  crt: 1 | 2 | 3;
  endereco: NfeEndereco;
}

export interface NfeDestinatario {
  cpfCnpj: string;
  nome: string;
  email?: string;
  indicadorIE: 1 | 2 | 9; // 9=Não contribuinte
  endereco: NfeEndereco;
}

export interface NfeEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: number;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  codigoPais?: number;
  nomePais?: string;
}

export interface NfeProduto {
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: number;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface EmitNfePayload {
  orderId: number;
  storeId?: number;
  ambiente?: 1 | 2; // 1=Produção, 2=Homologação
}

export interface NuvemFiscalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface NuvemFiscalNfeResponse {
  id: string;
  status: string;
  numero?: number;
  serie?: number;
  chave?: string;
  data_emissao?: string;
  valor_total?: number;
  motivo_status?: string;
  ambiente?: number;
}
