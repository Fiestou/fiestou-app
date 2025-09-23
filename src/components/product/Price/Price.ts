type PriceProps = {
  price: number;
  promotionalPrice?: number | null;
  priceFormatted?: string; // opcional se quiser usar helper
  currency?: string; // "BRL"
};
