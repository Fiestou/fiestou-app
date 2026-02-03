import Api from "@/src/services/api";
import { CartType } from "@/src/models/cart";
import { DeliveryItem } from "@/src/types/filtros";
import { justNumber, isCEPInRegion, getAllowedRegionsDescription } from "@/src/helper";
import { formatCep } from "@/src/components/utils/FormMasks";

// Tipos
export type CepValidationResult = {
  valid: boolean;
  sanitized: string;
  formatted: string;
  error?: string;
};

export type ApplyDeliveryResult = {
  success: boolean;
  message?: string;
  updatedCart?: CartType[];
};

export type DeliveryCalculationResult = {
  success: boolean;
  fees: DeliveryItem[];
  error?: string;
};

export function validateCep(cep: string): CepValidationResult {
  const sanitized = justNumber(cep);
  const formatted = formatCep(sanitized);

  if (sanitized.length !== 8) {
    return { valid: false, sanitized, formatted, error: "Informe um CEP válido para calcular o frete." };
  }

  if (!isCEPInRegion(sanitized)) {
    return { valid: false, sanitized, formatted, error: `Por enquanto atendemos apenas ${getAllowedRegionsDescription()}.` };
  }

  return { valid: true, sanitized, formatted };
}

export function extractProductIds(cart: CartType[]): number[] {
  return cart
    .map((item) => Number(item?.product?.id ?? (typeof item?.product === "number" ? item.product : NaN)))
    .filter((id) => Number.isFinite(id));
}

export async function calculateDeliveryFees(api: Api, sanitizedZip: string, productIds: number[]): Promise<DeliveryCalculationResult> {
  try {
    const response: any = await api.request({
      method: "get",
      url: `delivery-zipcodes/${sanitizedZip}`,
      data: { ids: productIds },
    });

    const rawList = Array.isArray(response?.data) ? response.data
      : Array.isArray(response?.data?.data) ? response.data.data
      : Array.isArray(response) ? response : [];

    const fees: DeliveryItem[] = rawList
      .map((item: any) => ({
        price: Number(item?.price),
        store_id: Number(item?.store_id ?? item?.storeId ?? item?.store),
      }))
      .filter((fee: DeliveryItem) => Number.isFinite(fee.price) && Number.isFinite(fee.store_id));

    if (!fees.length) {
      return { success: false, fees: [], error: "Não conseguimos calcular o frete para este CEP." };
    }

    return { success: true, fees };
  } catch (error: any) {
    return {
      success: false,
      fees: [],
      error: error?.response?.data?.error || error?.message || "Não conseguimos calcular o frete agora.",
    };
  }
}

export function applyDeliveryToCart(cart: CartType[], fees: DeliveryItem[], sanitizedZip: string): ApplyDeliveryResult {
  if (!fees.length) {
    return { success: false, message: "Não conseguimos calcular o frete para este CEP." };
  }

  const formattedZip = formatCep(sanitizedZip);
  const feeMap = new Map<number, number>();

  fees.forEach((fee) => {
    const storeId = Number(fee?.store_id);
    const price = Number(fee?.price);
    if (Number.isFinite(storeId) && Number.isFinite(price)) {
      feeMap.set(storeId, price);
    }
  });

  const missingStores: string[] = [];

  const updatedCart = cart.map((item) => {
    const productStore = item?.product?.store ?? {};
    const storeSource = item?.details?.deliveryStoreId ?? (typeof productStore === "object" ? productStore?.id : productStore);
    const storeId = Number(storeSource);

    const details = { ...(item.details ?? {}) };
    details.deliveryZipCode = sanitizedZip;
    details.deliveryZipCodeFormatted = formattedZip;

    if (Number.isFinite(storeId)) {
      details.deliveryStoreId = storeId;
      if (feeMap.has(storeId)) {
        const feeValue = feeMap.get(storeId) ?? 0;
        details.deliveryFee = feeValue;

      } else {
        delete details.deliveryFee;
        missingStores.push(productStore?.companyName ?? productStore?.title ?? item?.product?.title ?? `Produto #${item?.product?.id ?? ""}`);
      }
    } else {
      delete details.deliveryStoreId;
      delete details.deliveryFee;
      missingStores.push(productStore?.companyName ?? productStore?.title ?? item?.product?.title ?? `Produto #${item?.product?.id ?? ""}`);
    }

    const updatedItem = { ...item, details };
    return updatedItem;
  });

  if (missingStores.length) {
    const unique = Array.from(new Set(missingStores.filter(Boolean)));
    return {
      success: false,
      message: unique.length ? `Não conseguimos calcular o frete para: ${unique.join(", ")}` : "Não conseguimos calcular o frete para este CEP.",
    };
  }

  return { success: true, updatedCart };
}

// Função completa: valida CEP, calcula frete e aplica ao carrinho
export async function calculateAndApplyDelivery(api: Api, cart: CartType[], cep: string): Promise<ApplyDeliveryResult> {
  const validation = validateCep(cep);
  if (!validation.valid) return { success: false, message: validation.error };

  const productIds = extractProductIds(cart);
  if (!productIds.length) return { success: false, message: "Não encontramos produtos válidos no carrinho." };

  const calculation = await calculateDeliveryFees(api, validation.sanitized, productIds);
  if (!calculation.success) return { success: false, message: calculation.error };

  return applyDeliveryToCart(cart, calculation.fees, validation.sanitized);
}
