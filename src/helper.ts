export function nl2br(str: string, is_xhtml?: any) {
  if (typeof str === "undefined" || str === null) {
    return "";
  }
  var breakTag =
    is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + breakTag + "$2"
  );
}

export function getSummary(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text; // Retorna o texto completo se ele for menor ou igual ao tamanho máximo
  } else {
    const trimmedText = text.substring(0, maxLength - 3).trim(); // Remove os espaços em branco e corta o texto para o tamanho desejado
    return (trimmedText + "...").replace(/<br>\s*/g, "<br>"); // Adiciona reticências ao final do resumo
  }
}

export function tagfy(str: string) {
  const words = str.trim().split(" ");
  const mainWords = words.slice(0, 2);
  const tag = mainWords.join("-").toLowerCase();
  return tag;
}

export function slugfy(str: string) {
  return !!str
    ? str
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "-")
      .replace(/\-\-+/g, "-")
      .replace(/(^-+|-+$)/g, "-")
    : "";
}

export function calcDeliveryTotal(dp: unknown): number {
  if (Array.isArray(dp)) {
    return dp.reduce((acc, it: any) => acc + (Number(it?.price) || 0), 0);
  }
  // fallback caso algum dia a API retorne objeto { total } ou número
  const maybe = dp as any;
  return Number(maybe?.total ?? maybe ?? 0) || 0;
}

export function moneyFormat(value?: number | string, separator = ","): string {
  const n = Number(
    typeof value === "string" ? value.replace(/[^\d.-]/g, "") : value
  );
  const fixed = Number.isFinite(n) ? n : 0;
  return fixed.toFixed(2).replace(".", separator);
}

export function serializeParam(key: string, value: any): string {
  if (Array.isArray(value)) {
    // Serializa arrays no formato key[]=value1&key[]=value2...
    return value
      .map((item) => `${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`)
      .join("&");
  } else if (typeof value === "object" && value !== null) {
    // Serializa objetos recursivamente no formato key[subkey]=value...
    return Object.keys(value)
      .map((subKey) => serializeParam(`${key}[${subKey}]`, value[subKey]))
      .join("&");
  } else {
    // Serializa valores simples
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

export function getQueryUrlParams() {
  const searchParams = new URLSearchParams(window.location.search);
  const paramsObj: any = {};

  searchParams.forEach((value, key) => {
    paramsObj[key] = value;
  });

  return paramsObj;
}

export function dateFormat(date?: any) {
  const handle = date ?? new Date();

  const day = String(handle.getDate()).padStart(2, "0");
  const month = String(handle.getMonth() + 1).padStart(2, "0"); // Lembrando que o mês começa em 0 (janeiro)
  const year = handle.getFullYear();

  return `${year}-${month}-${day}`;
}

export function dateBRFormat(date: any) {
  if (!!date) {
    let split = date.split("T");
    split = split[0].split("-");

    const day = split[2];
    const month = split[1];
    const year = split[0];
    return `${day}/${month}/${year}`;
  }
}

export function convertToCents(value: any) {
  if (typeof value === "string") {
    value = value.replace(",", ".");
  }

  value = parseFloat(value);

  if (isNaN(value)) {
    return 0;
  }

  return Math.round(value * 100);
}

export const findDates = (dateArray: any) => {
  if (dateArray.length === 0) {
    return { minDate: null, maxDate: null };
  }

  let minDate = dateArray[0];
  let maxDate = dateArray[0];

  for (let i = 1; i < dateArray.length; i++) {
    if (dateArray[i] < minDate) {
      minDate = dateArray[i];
    }
    if (dateArray[i] > maxDate) {
      maxDate = dateArray[i];
    }
  }

  return { minDate, maxDate };
};

export function clean(str: any) {
  if (!!str) {
    return "";
  }

  if (typeof str !== "string") {
    str = String(str);
  }

  return str.replace(/(<([^>]+)>)/gi, "");
}

export function cleanText(str: string) {
  return nl2br((str ?? "").replace(/<\/?span[^>]*>/g, ""));
}

export function handleTags(old: string, str: string) {
  old = `${old}, ${str}`;

  let tags = old
    .split(",")
    .filter((item) => !!item)
    .map((item) => item.trim());

  const reduce: any = [];

  for (let palavra of tags) {
    if (!reduce.includes(palavra)) {
      reduce.push(palavra);
    }
  }

  return reduce.filter((item: any) => !!item).join(",");
}

export function phoneNumber(str: string) {
  return str.replace(/\D/g, "");
}

export function phoneAreaCode(str?: string) {
  if (!str) return "";

  let cleanNumber = str.replace(/\D/g, "");

  if (cleanNumber.startsWith("55")) {
    cleanNumber = cleanNumber.substring(2);
  }

  const areaCode = cleanNumber.substring(0, 2);

  return areaCode;
}

export function phoneJustNumber(str?: string) {
  if (!str) return "";

  let cleanNumber = str.replace(/\D/g, "");

  if (cleanNumber.startsWith("55")) {
    cleanNumber = cleanNumber.substring(2);
  }

  const number = cleanNumber.substring(2);

  return number;
}

export function justNumber(str: any): string {
  if (!str)
    return "";

  return str.toString().replace(/\D/g, "");
}

export function getFirstName(str: string) {
  str += " ";

  return str.split(" ")[0];
}

export function justValidateNumber(input: any) {
  if (!input) return "";

  // Regex que mantém apenas números (0-9), pontos (.) e vírgulas (,)
  return input.toString().replace(/[^0-9.,]/g, "");
}

export function realMoneyNumber(input: any) {
  if (!input) return "";

  input = input.toString().replace(/\D/g, "");

  const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  const formattedValue = new Intl.NumberFormat("pt-BR", options).format(
    input / 100
  );

  return formattedValue;
}

export function decimalNumber(input: any) {
  if (!input) {
    return "";
  }

  // Remove todos os caracteres que não sejam dígitos, pontos ou vírgulas
  input = input.replace(/[^0-9.,]/g, "");

  // Substitui vírgulas por pontos para unificar o separador decimal
  input = input.replace(/,/g, ".");

  // Se houver mais de um ponto, remove os extras
  const parts = input.split(".");
  if (parts.length > 2) {
    input = parts[0] + "." + parts.slice(1).join("");
  }

  return input;
}

export function shortId(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let id = "";

  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return id;
}

export function getImage(image: any, size?: string) {
  if (!image) return "";

  if (!!image?.medias) {
    image = image?.medias;
  }

  const img = !!image?.base_url ? image : image[0] ?? {};

  if (img?.extension === ".gif") {
    return !!img?.base_url ? img.base_url + img.permanent_url : "";
  }

  if (!!img?.base_url && !!img?.details?.sizes) {
    const url =
      img.base_url +
      (!!size ? img?.details?.sizes[size] : img?.details?.sizes["lg"]);

    return img.base_url != url.trim() ? url : "";
  }

  return "";
}

export function isMobileDevice() {
  const userAgent = window.navigator.userAgent;
  const mobileKeywords = ["Mobi", "Android", "iPhone", "iPad", "Windows Phone"];

  return mobileKeywords.some((keyword) => userAgent.includes(keyword));
}

export function print_r(obj: Object | Array<any>) {
  return JSON.stringify(obj, null, "\t");
}

export function replaceWord(
  sentence: string,
  oldWord: string,
  newWord: string
): string {
  return sentence.replace(new RegExp(oldWord, "g"), newWord);
}

export function filterRepeatRemove(arrayValue: Array<any>) {
  return arrayValue.filter((valor: any, indice: any, arr: string | any[]) => {
    return !!valor && arr.indexOf(valor) === indice;
  });
}

export function getShortMonth(month: string | number) {
  let months: any = [
    "",
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return months[month];
}

export function getExtenseData(data_informada = "", pos = "") {
  if (!!data_informada) {
    let monthes = new Array(
      "",
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro"
    );
    let semana = new Array(
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado"
    );

    var day_informado = data_informada.split("-")[2];
    var month_informado = data_informada.split("-")[1];
    var year_informado = data_informada.split("-")[0];

    var data =
      day_informado.split("T")[0] +
      " de " +
      monthes[parseInt(month_informado)] +
      " de " +
      year_informado;

    return pos == "m"
      ? parseInt(month_informado)
      : pos == "d"
        ? day_informado.split("T")[0]
        : pos == "Y"
          ? year_informado
          : data.split("T")[0];
  }

  return "";
}

export function getShorDate(date = "") {
  var day = date.split("-")[2];
  var month = date.split("-")[1];
  var year = date.split("-")[0];

  if (!!day && !!month && !!year) {
    var handle = day.split("T")[0] + "/" + month + "/" + year;

    return handle.split("T")[0];
  }

  return false;
}

export function getDate(date?: any, days = 0) {
  var result = new Date(date);

  result.setDate(result.getDate() + days);

  let day = result.getDate();
  let month = result.getMonth() + 1;
  let year = result.getFullYear();

  let date_ = new Date(year, month, day);

  day = date_.getDate();
  month = date_.getMonth();
  year = date_.getFullYear();

  return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day
    }`;
}

export const getCurrentDate = (daysAhead = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);

  return date.toISOString();
};

export const generateDocumentNumber = () => {
  const randomNumber = Math.floor(Math.random() * 1000000000); // Gera um número aleatório de até 9 dígitos
  return randomNumber.toString();
};

export function CopyClipboard(element: any) {
  var copyText: any = document.getElementById(element);

  if (!!copyText) {
    copyText.select();
    copyText.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(copyText.value);
  }
}

export async function getZipCode(zipCode: string) {
  var validacep = /^[0-9]{8}$/;

  if (validacep.test(justNumber(zipCode))) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await fetch(`https://viacep.com.br/ws/${justNumber(zipCode)}/json/`)
      .then((data) => data.json())
      .then((data) => data);
  }

  return {};
}

export function isCEPInRegion(cep: string): boolean {
  if (!cep) return false;

  const cepRanges: { region: string; start: string; end: string }[] = [
    { region: "João Pessoa", start: "58000001", end: "58999999" },
  ];

  const sanitizedCEP = cep.replace(/\D/g, "");

  for (const range of cepRanges) {
    if (sanitizedCEP >= range.start && sanitizedCEP <= range.end) {
      return true;
    }
  }

  return false;
}

export const getSocial = (link: string) => {
  if (link.toLowerCase().includes("facebook")) {
    return "facebook";
  }

  if (link.toLowerCase().includes("instagram")) {
    return "instagram";
  }

  if (link.toLowerCase().includes("twitter")) {
    return "twitter";
  }

  if (link.toLowerCase().includes("yout")) {
    return "youtube";
  }

  if (link.toLowerCase().includes("linkedin")) {
    return "linkedin";
  }

  if (link.toLowerCase().includes("pinterest")) {
    return "pinterest";
  }

  if (link.toLowerCase().includes("tiktok")) {
    return "tiktok";
  }

  if (link.toLowerCase().includes("facebook")) {
    return "facebook";
  }

  return "link";
};

export const maskHandle: any = {
  date: (input: string) => {
    input = input.replace(/\D/g, "");

    input = input.substring(0, 8);

    const size = input.length;
    if (size > 2 && size <= 4) {
      input = `${input.substring(0, 2)}/${input.substring(2)}`;
    } else if (size > 4) {
      input = `${input.substring(0, 2)}/${input.substring(
        2,
        4
      )}/${input.substring(4)}`;
    }
    return input;
  },
  decimal: (input: any) => {
    if (!input) {
      return "";
    }

    // Remove todos os caracteres que não sejam dígitos, pontos ou vírgulas
    input = input.replace(/[^0-9.,]/g, "");

    // Substitui vírgulas por pontos para unificar o separador decimal
    input = input.replace(/,/g, ".");

    // Se houver mais de um ponto, remove os extras
    const parts = input.split(".");
    if (parts.length > 2) {
      input = parts[0] + "." + parts.slice(1).join("");
    }

    return input;
  },
  phone: (input: string) => {
    if (!input) return "";

    input = input.replace(/\D/g, "");

    input = input.substring(0, 11);

    if (input.length > 10) {
      input = `(${input.substring(0, 2)}) ${input.substring(
        2,
        7
      )}-${input.substring(7)}`;
    } else if (input.length > 6) {
      input = `(${input.substring(0, 2)}) ${input.substring(
        2,
        6
      )}-${input.substring(6)}`;
    } else if (input.length > 2) {
      input = `(${input.substring(0, 2)}) ${input.substring(2)}`;
    } else if (input.length > 0) {
      input = `(${input}`;
    }

    return input;
  },
  real: (input: any) => {
    input = input.replace(/\D/g, "");

    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const formattedValue = new Intl.NumberFormat("pt-BR", options).format(
      input / 100
    );

    return formattedValue;
  },
  dollar: (input: any) => {
    input = input.replace(/\D/g, "");

    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const formattedValue = new Intl.NumberFormat("en-US", options).format(
      input / 100
    );

    return formattedValue;
  },
  euro: (input: any) => {
    input = input.replace(/\D/g, "");

    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const formattedValue = new Intl.NumberFormat("de-DE", options).format(
      input / 100
    );

    return formattedValue;
  },
  cnpj: (input: string): boolean => {
    if (!input) return false;

    let cnpj = input.replace(/\D/g, "");

    if (cnpj.length !== 14) return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length += 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1));
  },
  cpf: (input: string): boolean => {
    if (!input) return false;

    let cpf = input.replace(/\D/g, "");

    if (cpf.length !== 11) return false;

    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let check1 = (sum * 10) % 11;
    if (check1 === 10) check1 = 0;

    if (check1 !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }

    let check2 = (sum * 10) % 11;
    if (check2 === 10) check2 = 0;

    return check2 === parseInt(cpf.charAt(10));
  },
  dni: (input: string): boolean => {
    if (!input) return false;

    const dni = input.replace(/\D/g, "");
    const dniNumber = parseInt(dni.slice(0, 8));
    const dniLetter = input.slice(-1).toUpperCase();
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const validLetter = letters.charAt(dniNumber % 23);

    return validLetter === dniLetter;
  },
  ssn: (input: string): boolean => {
    if (!input) return false;
    const ssn = input.replace(/\D/g, ""); // Remove caracteres não numéricos
    return /^\d{3}-\d{2}-\d{4}$/.test(ssn); // Verifica se segue o formato correto
  },
  nuip: (input: string): boolean => {
    if (!input) return false;
    const nuip = input.replace(/\D/g, ""); // Remove caracteres não numéricos
    return nuip.length >= 6 && nuip.length <= 10; // Verifica se tem entre 6 e 10 dígitos
  },
};

export const documentIsValid = (document?: string) => {
  return maskHandle.cpf(document) || maskHandle.cnpj(document);
};

export const getBrazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
