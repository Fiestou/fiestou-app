const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { dosDate, dosTime };
}

function createSingleFileZipBuffer(fileName: string, fileBuffer: Buffer): Buffer {
  const nameBuffer = Buffer.from(fileName, "utf8");
  const { dosDate, dosTime } = toDosDateTime();
  const checksum = crc32(fileBuffer);
  const size = fileBuffer.length;

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8);
  localHeader.writeUInt16LE(dosTime, 10);
  localHeader.writeUInt16LE(dosDate, 12);
  localHeader.writeUInt32LE(checksum, 14);
  localHeader.writeUInt32LE(size, 18);
  localHeader.writeUInt32LE(size, 22);
  localHeader.writeUInt16LE(nameBuffer.length, 26);
  localHeader.writeUInt16LE(0, 28);

  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0, 8);
  centralHeader.writeUInt16LE(0, 10);
  centralHeader.writeUInt16LE(dosTime, 12);
  centralHeader.writeUInt16LE(dosDate, 14);
  centralHeader.writeUInt32LE(checksum, 16);
  centralHeader.writeUInt32LE(size, 20);
  centralHeader.writeUInt32LE(size, 24);
  centralHeader.writeUInt16LE(nameBuffer.length, 28);
  centralHeader.writeUInt16LE(0, 30);
  centralHeader.writeUInt16LE(0, 32);
  centralHeader.writeUInt16LE(0, 34);
  centralHeader.writeUInt16LE(0, 36);
  centralHeader.writeUInt32LE(0, 38);
  centralHeader.writeUInt32LE(0, 42);

  const localPart = Buffer.concat([localHeader, nameBuffer, fileBuffer]);
  const centralPart = Buffer.concat([centralHeader, nameBuffer]);

  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(1, 8);
  endRecord.writeUInt16LE(1, 10);
  endRecord.writeUInt32LE(centralPart.length, 12);
  endRecord.writeUInt32LE(localPart.length, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([localPart, centralPart, endRecord]);
}

function sanitizeFileName(name: string, fallback = "imagem-cliente") {
  const normalized = (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ .]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  return normalized || fallback;
}

function getExtensionFromPath(pathname: string): string {
  const match = pathname.match(/\.([a-zA-Z0-9]{2,6})$/);
  if (!match) return "";
  return `.${match[1].toLowerCase()}`;
}

function extensionFromContentType(contentType: string): string {
  const normalized = (contentType || "").toLowerCase();
  if (normalized.includes("jpeg")) return ".jpg";
  if (normalized.includes("png")) return ".png";
  if (normalized.includes("webp")) return ".webp";
  if (normalized.includes("gif")) return ".gif";
  if (normalized.includes("svg")) return ".svg";
  return "";
}

function parseHost(rawValue?: string): string | null {
  if (!rawValue) return null;
  try {
    return new URL(rawValue).host;
  } catch {
    return null;
  }
}

function getAllowedHosts(): Set<string> {
  const hosts = new Set<string>([
    "testeapi.fiestou.com.br",
    "api.fiestou.com.br",
  ]);

  [
    process.env.NEXT_PUBLIC_API_REST,
    process.env.API_REST,
    process.env.INTERNAL_API_REST,
  ]
    .map((value) => parseHost(value))
    .filter((value): value is string => !!value)
    .forEach((host) => hosts.add(host));

  return hosts;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ response: false, message: "Método não permitido" });
  }

  const rawUrl = String(req.query?.url || "").trim();
  const rawFilename = String(req.query?.filename || "imagem-cliente").trim();
  const zip = String(req.query?.zip || "0") === "1";

  if (!rawUrl) {
    return res.status(400).json({ response: false, message: "URL da imagem é obrigatória" });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ response: false, message: "URL inválida" });
  }

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({ response: false, message: "Protocolo de URL inválido" });
  }

  const allowedHosts = getAllowedHosts();
  if (!allowedHosts.has(parsedUrl.host) || !parsedUrl.pathname.includes("/storage/")) {
    return res.status(403).json({ response: false, message: "Host de mídia não permitido" });
  }

  try {
    const upstream = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Fiestou-Order-Downloader/1.0",
      },
    });

    if (!upstream.ok) {
      return res
        .status(400)
        .json({ response: false, message: "Não foi possível baixar a imagem da personalização" });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const dataBuffer = Buffer.from(await upstream.arrayBuffer());

    if (!dataBuffer.length) {
      return res.status(400).json({ response: false, message: "Arquivo de imagem vazio" });
    }

    const extFromPath = getExtensionFromPath(parsedUrl.pathname);
    const extFromContent = extensionFromContentType(contentType);
    const extension = extFromPath || extFromContent || ".bin";

    const baseName = sanitizeFileName(rawFilename, "imagem-cliente");
    const fileName = baseName.toLowerCase().endsWith(extension) ? baseName : `${baseName}${extension}`;

    if (!zip) {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
      return res.status(200).send(dataBuffer);
    }

    const zipFileName = `${sanitizeFileName(baseName, "imagem-cliente")}.zip`;
    const zipBuffer = createSingleFileZipBuffer(fileName, dataBuffer);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("Content-Disposition", `attachment; filename=\"${zipFileName}\"`);
    return res.status(200).send(zipBuffer);
  } catch {
    return res.status(500).json({
      response: false,
      message: "Falha ao preparar download da personalização",
    });
  }
}
