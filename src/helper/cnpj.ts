export function justNumber(value: string): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * formata o CNPJ progressivamente enquanto o usuário digita:
 * 12 -> 00.000.000/0000
 * 14 -> 00.000.000/0000-00
 */
export function formatCNPJ(value: string): string {
  const v = justNumber(value).slice(0, 14); // máximo 14 dígitos
  const len = v.length;

  if (len === 0) return "";

  if (len <= 2) return v;
  if (len <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
  if (len <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
  if (len <= 12)
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`;
  // 13-14
  return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(
    8,
    12
  )}-${v.slice(12)}`;
}
