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

export function moneyFormat(number?: number | string, separator?: string) {
  if (!number) return 0;

  number = typeof number == "string" ? parseFloat(number) : number;
  number = number.toFixed(2);

  number = number.replace(".", separator ?? ",");

  return number;
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

export function justNumber(str: any) {
  if (!str) return;

  return str.toString().replace(/\D/g, "");
}

export function getFirstName(str: string) {
  str += " ";

  return str.split(" ")[0];
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

  return `${year}-${month < 10 ? "0" + month : month}-${
    day < 10 ? "0" + day : day
  }`;
}

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
    return await fetch(`https://viacep.com.br/ws/${justNumber(zipCode)}/json/`)
      .then((data) => data.json())
      .then((data) => data);
  }

  return {};
}

export function isCEPInRegion(cep: string): boolean {
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
