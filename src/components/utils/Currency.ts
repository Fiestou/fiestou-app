export const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatMoney = (value: any): string => {
  const num =
    typeof value === "string"
      ? parseFloat(value.replace(/\./g, "").replace(",", "."))
      : Number(value);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};
