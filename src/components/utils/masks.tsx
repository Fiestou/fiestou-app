// DATA
export const maskDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8); // ddmmyyyy
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd}/${mm}`;
  return `${dd}/${mm}/${yyyy}`;
};

export const partialDateOk = (masked: string) => {
  const [d, m] = masked.split("/");
  if (d && d.length === 2) {
    const day = +d;
    if (day < 1 || day > 31) return false;
  }
  if (m && m.length === 2) {
    const month = +m;
    if (month < 1 || month > 12) return false;
  }
  return true;
};

// CPF
export const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  if (d.length <= 3) return p1;
  if (d.length <= 6) return `${p1}.${p2}`;
  if (d.length <= 9) return `${p1}.${p2}.${p3}`;
  return `${p1}.${p2}.${p3}-${p4}`;
};

export const partialCPFOk = (s: string) =>
  /^(\d{0,3})(?:\.(\d{0,3}))?(?:\.(\d{0,3}))?(?:-(\d{0,2}))?$/.test(s);

// CNPJ
export const maskCNPJ = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 8);
  const p4 = d.slice(8, 12);
  const p5 = d.slice(12, 14);
  if (d.length <= 2) return p1;
  if (d.length <= 5) return `${p1}.${p2}`;
  if (d.length <= 8) return `${p1}.${p2}.${p3}`;
  if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`;
  return `${p1}.${p2}.${p3}/${p4}-${p5}`;
};

export const partialCNPJOk = (s: string) =>
  /^(\d{0,2})(?:\.(\d{0,3}))?(?:\.(\d{0,3}))?(?:\/(\d{0,4}))?(?:-(\d{0,2}))?$/.test(s);
