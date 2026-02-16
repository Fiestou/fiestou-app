export type ProductListItem = {
  id?: string | number | null;
  [key: string]: any;
};

export type ProductPageResponse<T = ProductListItem> = {
  data?: T[];
  metadata?: {
    count?: number;
  };
};

const toSingleValue = (value: any) =>
  Array.isArray(value) ? value[value.length - 1] : value;

const toArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const values = value
      .filter((item) => item !== undefined && item !== null && item !== "")
      .map((item) => String(item));
    return values.length ? values : undefined;
  }

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return [String(value)];
};

export function buildProductsQuery(params: Record<string, any>): string {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value
        .filter((item) => item !== undefined && item !== null && item !== "")
        .forEach((item) => qs.append(`${key}[]`, String(item)));
      return;
    }

    qs.append(key, String(value));
  });

  return qs.toString();
}

export function normalizeProductsFilters(params: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};

  const passthroughKeys = ["busca", "range", "tags", "store", "whereIn", "order"];
  passthroughKeys.forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== "") {
      normalized[key] = value;
    }
  });

  if (normalized.order === undefined && params.ordem !== undefined && params.ordem !== "") {
    normalized.order = params.ordem;
  }

  ["busca", "range", "store", "order"].forEach((key) => {
    if (normalized[key] !== undefined) {
      normalized[key] = toSingleValue(normalized[key]);
    }
  });

  const colors = toArray(
    params.colors ??
      params.color ??
      params.cores ??
      params.cor,
  );
  if (colors?.length) normalized.colors = colors;

  const categories = toArray(
    params.category ??
      params.categories ??
      params.categoria ??
      params.categorias,
  );
  if (categories?.length) normalized.category = categories;

  return normalized;
}

export function mergeUniqueProducts<T extends ProductListItem>(
  current: T[],
  incoming: T[],
): T[] {
  if (!current.length) return incoming;
  if (!incoming.length) return current;

  const usedIds = new Set(
    current
      .map((item) => item?.id)
      .filter((id) => id !== undefined && id !== null)
      .map((id) => String(id)),
  );

  const uniqueIncoming = incoming.filter((item) => {
    const id = item?.id;
    if (id === undefined || id === null) return true;
    const key = String(id);
    if (usedIds.has(key)) return false;
    usedIds.add(key);
    return true;
  });

  return current.concat(uniqueIncoming);
}

export function hasMoreByResult(
  total: number | undefined,
  offset: number,
  limit: number,
  batchSize: number,
): boolean {
  if (limit <= 0) return false;

  const totalCount = Number(total ?? 0);
  if (Number.isFinite(totalCount) && totalCount > 0) {
    return offset + batchSize < totalCount;
  }

  return batchSize >= limit;
}
