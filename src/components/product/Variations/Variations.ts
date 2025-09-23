type VariationGroup = {
  id: string;
  name: string;
  type: 'single-select' | 'multi-select';
  values: { id: string; name: string; priceDelta?: number; sku?: string }[];
};
