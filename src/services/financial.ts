import Api from "./api";

const api = new Api();

export async function getFinancialOverview() {
  return api.bridge({
    method: "get",
    url: "info/financial/overview",
  });
}

export async function getFinancialAnticipations(params?: {
  page?: number;
  size?: number;
  status?: string;
}) {
  return api.bridge({
    method: "get",
    url: "info/financial/anticipations",
    data: params ?? {},
  });
}

export async function createFinancialAnticipation(data: {
  requested_amount: number;
  payment_date: string;
  timeframe?: string;
  type?: string;
  metadata?: Record<string, any>;
}) {
  return api.bridge({
    method: "post",
    url: "info/financial/anticipations",
    data,
  });
}

export async function cancelFinancialAnticipation(anticipationId: string) {
  return api.bridge({
    method: "post",
    url: `info/financial/anticipations/${anticipationId}/cancel`,
    data: {},
  });
}

export async function updateAutomaticAnticipationSettings(data: {
  enabled: boolean;
  type: "full" | "1025";
  volume_percentage?: number | null;
  delay?: number | null;
  anticipation_days?: number[];
}) {
  return api.bridge({
    method: "patch",
    url: "info/financial/automatic-anticipation-settings",
    data,
  });
}

export async function updateTransferSettings(data: {
  transfer_enabled: boolean;
  transfer_interval: "daily" | "weekly" | "monthly";
  transfer_day?: number | null;
}) {
  return api.bridge({
    method: "patch",
    url: "info/transfer-settings",
    data,
  });
}

export async function getAdminAnticipations(params?: {
  status?: string;
  search?: string;
  size?: number;
}) {
  return api.bridge({
    method: "get",
    url: "admin/anticipations",
    data: params ?? {},
  });
}

export async function cancelAdminAnticipation(data: {
  recipient_code: string;
  anticipation_id: string;
}) {
  return api.bridge({
    method: "post",
    url: "admin/anticipations/cancel",
    data,
  });
}
