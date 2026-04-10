import Image from "next/image";
import { AttributeType, ProductType } from "@/src/models/product";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { shortId, realMoneyNumber, getImage } from "@/src/helper";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, ImageIcon, X, Smile, Type, Upload, CircleDot, CheckSquare, Hash, Palette, Sparkles } from "lucide-react";
import Api from "@/src/services/api";
import Modal from "@/src/components/utils/Modal";

interface MediaItem {
  id: number;
  base_url?: string;
  permanent_url?: string;
  details?: any;
  title?: string;
  [key: string]: any;
}

function toMediaId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const normalized = Number(value.trim());
    return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
  }

  if (value && typeof value === "object") {
    const obj = value as any;
    const normalized = Number(obj.id ?? obj.imageId);
    return Number.isFinite(normalized) && normalized > 0 ? normalized : null;
  }

  return null;
}

function normalizeVariationImageValue(value: unknown): unknown {
  if (!value) return "";

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "object") {
    const media = value as any;
    const mediaId = toMediaId(media);

    if (!mediaId) return "";

    return {
      id: mediaId,
      base_url: media.base_url ?? undefined,
      permanent_url: media.permanent_url ?? media.url ?? undefined,
      details: media.details ?? {},
      title: media.title ?? undefined,
    };
  }

  return "";
}

function normalizeAttributes(input: unknown): AttributeType[] {
  if (!input) return [];
  if (Array.isArray(input)) return input as AttributeType[];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? (parsed as AttributeType[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

type SelectTypeValue = "radio" | "checkbox" | "quantity" | "color" | "text" | "image";

const SELECT_TYPES: Array<{
  value: SelectTypeValue;
  label: string;
  summary: string;
  group: "primary" | "advanced";
}> = [
  { value: "radio", label: "Escolha única", summary: "1 opção", group: "primary" },
  { value: "checkbox", label: "Múltipla escolha", summary: "Várias opções", group: "primary" },
  { value: "quantity", label: "Por quantidade", summary: "Min e max", group: "primary" },
  { value: "color", label: "Seleção de cor", summary: "Escolha por cor", group: "primary" },
  { value: "text", label: "Texto livre", summary: "Cliente digita", group: "advanced" },
  { value: "image", label: "Envio de imagem", summary: "Cliente envia foto", group: "advanced" },
];

const PRIMARY_SELECT_TYPES = SELECT_TYPES.filter((item) => item.group === "primary");
const ADVANCED_SELECT_TYPES = SELECT_TYPES.filter((item) => item.group === "advanced");

function getSelectTypeIcon(
  type: SelectTypeValue,
  className: string,
  size = 17
) {
  if (type === "radio") return <CircleDot size={size} className={className} />;
  if (type === "checkbox") return <CheckSquare size={size} className={className} />;
  if (type === "quantity") return <Hash size={size} className={className} />;
  if (type === "color") return <Palette size={size} className={className} />;
  if (type === "text") return <Type size={size} className={className} />;
  return <Upload size={size} className={className} />;
}

function getSelectTypeAccent(type: SelectTypeValue) {
  if (type === "radio") return { icon: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" };
  if (type === "checkbox") return { icon: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" };
  if (type === "quantity") return { icon: "text-orange-700", bg: "bg-orange-100", border: "border-orange-200" };
  if (type === "color") return { icon: "text-fuchsia-700", bg: "bg-fuchsia-100", border: "border-fuchsia-200" };
  if (type === "text") return { icon: "text-lime-700", bg: "bg-lime-100", border: "border-lime-200" };
  return { icon: "text-rose-700", bg: "bg-rose-100", border: "border-rose-200" };
}

function renderSelectTypeIcon(
  type: SelectTypeValue,
  active: boolean,
  variant: "default" | "colorful" = "default"
) {
  if (variant === "colorful") {
    const accent = getSelectTypeAccent(type);
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${accent.bg} ${accent.border}`}
      >
        {getSelectTypeIcon(type, accent.icon, 15)}
      </span>
    );
  }

  const iconClass = active ? "text-yellow-700" : "text-zinc-500";
  return getSelectTypeIcon(type, iconClass, 17);
}

const COLOR_OPTIONS = [
  { name: "Vermelho", hex: "#ef4444" },
  { name: "Laranja", hex: "#f97316" },
  { name: "Amarelo", hex: "#eab308" },
  { name: "Verde", hex: "#22c55e" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Roxo", hex: "#a855f7" },
  { name: "Rosa", hex: "#ec4899" },
  { name: "Preto", hex: "#000000" },
  { name: "Branco", hex: "#ffffff" },
  { name: "Cinza", hex: "#6b7280" },
  { name: "Marrom", hex: "#92400e" },
  { name: "Dourado", hex: "#fbbf24" },
  { name: "Prata", hex: "#d1d5db" },
];

const QUICK_ATTRIBUTE_TEMPLATES: Array<{
  id: string;
  title: string;
  description: string;
  iconType: SelectTypeValue;
  build: () => AttributeType;
}> = [
  {
    id: "additional-yes-no",
    title: "Adicional simples",
    description: "Cria Sim/Não com preço para facilitar extras rápidos.",
    iconType: "radio",
    build: () => ({
      id: shortId(),
      title: "Adicionar item extra?",
      selectType: "radio",
      priceType: "on",
      limit: 0,
      variations: [
        { id: shortId(), title: "Não, obrigado", price: 0 },
        { id: shortId(), title: "Sim, adicionar", price: 10 },
      ],
    }),
  },
  {
    id: "quantity",
    title: "Por quantidade",
    description: "Ideal para itens extras por unidade com min/max.",
    iconType: "quantity",
    build: () => ({
      id: shortId(),
      title: "Quantidade extra",
      selectType: "quantity",
      priceType: "on",
      limit: 0,
      variations: [
        { id: shortId(), title: "Unidade", price: 5, minQuantity: 0, maxQuantity: 0 },
      ],
    }),
  },
  {
    id: "color",
    title: "Seleção de cor",
    description: "Cria opções iniciais de cor com um clique.",
    iconType: "color",
    build: () => ({
      id: shortId(),
      title: "Escolha uma cor",
      selectType: "color",
      priceType: "off",
      limit: 0,
      variations: [
        { id: shortId(), title: "Branco", color: "#ffffff", price: 0 },
        { id: shortId(), title: "Preto", color: "#000000", price: 0 },
      ],
    }),
  },
  {
    id: "customer-name",
    title: "Pedir nome",
    description: "Cliente informa nome ou texto para personalização.",
    iconType: "text",
    build: () =>
      ({
        id: shortId(),
        title: "Nome para personalização",
        selectType: "text",
        priceType: "off",
        limit: 0,
        variations: [],
        placeholder: "Ex: Nome da criança",
        customPrice: "",
      } as any),
  },
  {
    id: "customer-image",
    title: "Pedir imagem",
    description: "Cliente envia uma foto para personalizar o item.",
    iconType: "image",
    build: () =>
      ({
        id: shortId(),
        title: "Envie a imagem para personalização",
        selectType: "image",
        priceType: "off",
        limit: 0,
        variations: [],
        placeholder: "Ex: Envie a foto aqui",
        customPrice: "",
      } as any),
  },
];

type QuickTemplateId =
  | "additional-yes-no"
  | "quantity"
  | "color"
  | "customer-name"
  | "customer-image";

const WIZARD_STEPS = [
  { step: 1, label: "Modelo" },
  { step: 2, label: "Configurar" },
  { step: 3, label: "Revisar" },
] as const;

function moneyStringToNumber(value: string): number {
  if (!value) return 0;

  const normalized = value
    .toString()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ImagePicker({
  value,
  gallery,
  onChange,
  productId,
}: {
  value?: string | number | MediaItem | null;
  gallery: MediaItem[];
  onChange: (imageId: string | number | null, newMedia?: MediaItem) => void;
  productId?: number;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedId = toMediaId(value);
  const selectedFromGallery = selectedId
    ? gallery.find((m) => Number(m.id) === Number(selectedId))
    : null;
  const selectedObject = value && typeof value === "object" ? (value as MediaItem) : null;
  const selectedMedia = selectedFromGallery || selectedObject;
  const thumb = selectedMedia ? getImage(selectedMedia, "thumb") : null;

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const api = new Api();

      if (productId) {
        try {
          const galleryUpload: any = await api.bridge({
            method: "post",
            url: "products/upload-gallery",
            data: {
              product: productId,
              medias: [file],
            },
            opts: {
              headers: { "Content-Type": "multipart/form-data" },
            },
          });

          const uploadedCandidate =
            galleryUpload?.data?.medias?.[0] ??
            galleryUpload?.data?.data?.medias?.[0] ??
            galleryUpload?.medias?.[0] ??
            null;

          const uploadedMedia =
            uploadedCandidate?.media ??
            uploadedCandidate ??
            null;

          const uploadedMediaId = Number(uploadedMedia?.id);

          if (Number.isFinite(uploadedMediaId) && uploadedMediaId > 0) {
            onChange(uploadedMediaId, uploadedMedia);
            setUploading(false);
            setOpen(false);
            return;
          }
        } catch {}
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res: any = await api.bridge({
          method: "post",
          url: "files/upload-base64",
          data: {
            index: productId || "variation",
            dir: "products",
            medias: [{ base64, fileName: file.name.replace(/\.[^/.]+$/, "") }],
          },
        });
        const uploaded = res?.data?.[0];
        if (uploaded?.status && uploaded?.media) {
          onChange(uploaded.media.id, uploaded.media);
        }
        setUploading(false);
        setOpen(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      {thumb ? (
        <div className="relative group">
          <Image
            src={thumb}
            alt=""
            width={40}
            height={40}
            unoptimized
            onClick={() => setOpen(!open)}
            className="h-10 w-10 rounded-md object-cover cursor-pointer border border-zinc-200 hover:border-yellow-400 transition-colors"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`h-10 w-10 rounded-md border border-dashed border-zinc-300 hover:border-yellow-500 hover:bg-yellow-50 flex items-center justify-center transition-colors ${uploading ? "opacity-50" : ""}`}
          title="Adicionar imagem"
          disabled={uploading}
        >
          {uploading ? (
            <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon size={14} className="text-yellow-700" />
          )}
        </button>
      )}

      {open && (
        <div className="absolute z-20 top-12 left-0 w-60 max-w-[calc(100vw-3rem)] rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {gallery.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id, m);
                    setOpen(false);
                  }}
                  className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-colors ${
                    Number(m.id) === Number(selectedId) ? "border-yellow-400" : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <Image
                    src={getImage(m, "thumb")}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          <label className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer transition-colors">
            <Upload size={12} />
            <span>Enviar nova imagem</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

const EMOJI_CATEGORIES = [
  { label: "Festas", emojis: ["🎈", "🎉", "🎊", "🎂", "🎁", "🎀", "🎆", "🎇", "🪅", "🎃", "🎄", "🧁", "🍰", "🎵", "🎶", "🎤", "🎧", "🎪", "🎭", "🎠"] },
  { label: "Comida", emojis: ["🍕", "🍔", "🍟", "🌭", "🍿", "🧀", "🍩", "🍪", "🍫", "🍬", "🍭", "🍦", "🧃", "🥤", "🍺", "🍷", "☕", "🥂", "🍾", "🧊"] },
  { label: "Natureza", emojis: ["🌸", "🌺", "🌻", "🌹", "🌷", "💐", "🌿", "🍀", "🌳", "🌴", "⭐", "🌙", "☀️", "🌈", "🦋", "🐾", "🌊", "🔥", "❄️", "💎"] },
  { label: "Esportes", emojis: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🥊", "🏆", "🥇", "🎯", "🎲", "🎮", "🏊", "🚴", "⛷️", "🏄", "🤸", "🎳", "🛹"] },
  { label: "Simbolos", emojis: ["❤️", "💛", "💚", "💙", "💜", "🖤", "🤍", "💖", "✨", "💫", "🔴", "🟡", "🟢", "🔵", "🟣", "⬛", "⬜", "✅", "❌", "💯"] },
];

function EmojiPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`h-9 w-9 rounded-md flex items-center justify-center transition-colors ${
          open ? "bg-yellow-100 text-yellow-700" : "hover:bg-yellow-50 text-yellow-700 hover:text-yellow-800"
        }`}
        title="Inserir emoji"
      >
        <Smile size={15} />
      </button>

      {open && (
        <div className="absolute z-30 top-10 left-1/2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex border-b border-zinc-100 px-1 pt-1 gap-0.5 overflow-x-auto">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setTab(i)}
                className={`px-2 py-1.5 text-[10px] font-medium rounded-t-md whitespace-nowrap transition-colors ${
                  tab === i ? "bg-zinc-100 text-zinc-800" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {cat.emojis[0]} {cat.label}
              </button>
            ))}
          </div>
          <div className="grid max-h-40 grid-cols-6 gap-1 overflow-y-auto p-2 sm:grid-cols-8">
            {EMOJI_CATEGORIES[tab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onSelect(emoji); setOpen(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-md text-base transition-colors hover:bg-zinc-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ColorPicker({
  onSelect,
  trigger,
  buttonClassName,
  iconSize = 16,
  title = "Selecionar cor",
}: {
  onSelect: (colorName: string, colorHex: string) => void;
  trigger?: React.ReactNode;
  buttonClassName?: string;
  iconSize?: number;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          buttonClassName
            ? `${buttonClassName} ${open ? "ring-2 ring-yellow-300" : ""}`
            : `h-9 w-9 rounded-md flex items-center justify-center transition-colors ${
                open
                  ? "bg-yellow-100 text-yellow-700"
                  : "hover:bg-yellow-50 text-yellow-700 hover:text-yellow-800"
              }`
        }
        title={title}
      >
        {trigger ?? <Palette size={iconSize} />}
      </button>

      {open && (
        <div className="absolute z-30 top-10 left-1/2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => { onSelect(color.name, color.hex); setOpen(false); }}
                className="group relative w-10 h-10 rounded-lg border-2 border-zinc-200 hover:border-zinc-400 transition-all hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {color.hex === "#ffffff" && (
                  <div className="absolute inset-0 rounded-lg border border-zinc-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Variable({
  product,
  emitAttributes,
}: {
  product: ProductType;
  emitAttributes: (attrs: AttributeType[] | string) => void;
}) {
  const api = useMemo(() => new Api(), []);
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteVar, setConfirmDeleteVar] = useState<string | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardTemplateId, setWizardTemplateId] = useState<QuickTemplateId | null>(null);
  const [wizardGroupTitle, setWizardGroupTitle] = useState("");
  const [wizardAdditionalLabel, setWizardAdditionalLabel] = useState("Sim, adicionar");
  const [wizardAdditionalPrice, setWizardAdditionalPrice] = useState("10,00");
  const [wizardQuantityLabel, setWizardQuantityLabel] = useState("Unidade");
  const [wizardQuantityPrice, setWizardQuantityPrice] = useState("5,00");
  const [wizardQuantityMin, setWizardQuantityMin] = useState("");
  const [wizardQuantityMax, setWizardQuantityMax] = useState("");
  const [wizardColorHexes, setWizardColorHexes] = useState<string[]>(["#ffffff", "#000000"]);
  const [wizardColorWithPrice, setWizardColorWithPrice] = useState(false);
  const [wizardCustomPlaceholder, setWizardCustomPlaceholder] = useState("");
  const [wizardCustomPrice, setWizardCustomPrice] = useState("");

  const fetchGallery = useCallback(async () => {
    if (!product?.id) return;
    try {
      const res: any = await api.bridge({
        method: "get",
        url: `products/gallery/${product.id}`,
      });
      setGalleryMedia(res?.data ?? []);
    } catch {}
  }, [api, product?.id]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const lastProductAttrsRef = useRef<string | null>(null);
  useEffect(() => {
    const serialized = product?.attributes != null
      ? (typeof product.attributes === "string" ? product.attributes : JSON.stringify(product.attributes))
      : null;
    if (serialized === lastProductAttrsRef.current) return;
    lastProductAttrsRef.current = serialized;
    setAttributes(normalizeAttributes(product?.attributes ?? []));
  }, [product?.attributes]);

  const emit = (attrs: AttributeType[]) => {
    setHasChanges(false);
    setSaving(true);
    try {
      emitAttributes(JSON.stringify(attrs));
    } catch {
      emitAttributes(attrs);
    }
    setTimeout(() => setSaving(false), 500);
  };

  const handleSave = () => {
    emit(attributes);
  };

  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      try {
        emitAttributes(JSON.stringify(attributes));
      } catch {
        emitAttributes(attributes);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [attributes, hasChanges, emitAttributes]);

  const addAttribute = () => {
    const newAttr: AttributeType = {
      id: shortId(),
      title: "",
      variations: [],
      selectType: "radio",
      limit: 0,
      priceType: "on",
    };
    const next = [...attributes, newAttr];
    setAttributes(next);
    setHasChanges(true);
    setOpenId(newAttr.id);
  };

  const appendAttribute = (newAttr: AttributeType) => {
    const next = [...attributes, newAttr];
    setAttributes(next);
    setHasChanges(true);
    setOpenId(newAttr.id);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setWizardTemplateId(null);
    setWizardGroupTitle("");
    setWizardAdditionalLabel("Sim, adicionar");
    setWizardAdditionalPrice("10,00");
    setWizardQuantityLabel("Unidade");
    setWizardQuantityPrice("5,00");
    setWizardQuantityMin("");
    setWizardQuantityMax("");
    setWizardColorHexes(["#ffffff", "#000000"]);
    setWizardColorWithPrice(false);
    setWizardCustomPlaceholder("");
    setWizardCustomPrice("");
  };

  const openWizard = () => {
    resetWizard();
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setTimeout(() => resetWizard(), 180);
  };

  const handleWizardTemplateSelect = (templateId: QuickTemplateId) => {
    setWizardTemplateId(templateId);

    if (templateId === "additional-yes-no") {
      setWizardGroupTitle("Adicionar item extra?");
      setWizardAdditionalLabel("Sim, adicionar");
      setWizardAdditionalPrice("10,00");
      setWizardColorWithPrice(false);
    }

    if (templateId === "quantity") {
      setWizardGroupTitle("Quantidade extra");
      setWizardQuantityLabel("Unidade");
      setWizardQuantityPrice("5,00");
      setWizardQuantityMin("");
      setWizardQuantityMax("");
      setWizardColorWithPrice(false);
    }

    if (templateId === "color") {
      setWizardGroupTitle("Escolha uma cor");
      setWizardColorHexes(["#ffffff", "#000000"]);
      setWizardColorWithPrice(false);
    }

    if (templateId === "customer-name") {
      setWizardGroupTitle("Nome para personalização");
      setWizardCustomPlaceholder("Ex: Nome da criança");
      setWizardCustomPrice("");
      setWizardColorWithPrice(false);
    }

    if (templateId === "customer-image") {
      setWizardGroupTitle("Envie a imagem para personalização");
      setWizardCustomPlaceholder("Ex: Envie a foto aqui");
      setWizardCustomPrice("");
      setWizardColorWithPrice(false);
    }
  };

  const toggleWizardColor = (hex: string) => {
    setWizardColorHexes((prev) => {
      const normalized = hex.toLowerCase();
      const exists = prev.some((entry) => entry.toLowerCase() === normalized);
      if (exists) {
        const next = prev.filter((entry) => entry.toLowerCase() !== normalized);
        return next.length > 0 ? next : [hex];
      }
      return [...prev, hex];
    });
  };

  const buildWizardAttribute = (): AttributeType | null => {
    const template = QUICK_ATTRIBUTE_TEMPLATES.find((item) => item.id === wizardTemplateId);
    if (!template) return null;

    const attribute = template.build();
    const cleanTitle = wizardGroupTitle.trim();
    if (cleanTitle) attribute.title = cleanTitle;

    if (wizardTemplateId === "additional-yes-no") {
      attribute.selectType = "radio";
      attribute.priceType = "on";
      attribute.variations = [
        { id: shortId(), title: "Não, obrigado", price: 0 },
        {
          id: shortId(),
          title: wizardAdditionalLabel.trim() || "Sim, adicionar",
          price: moneyStringToNumber(realMoneyNumber(wizardAdditionalPrice || "0")),
        },
      ];
    }

    if (wizardTemplateId === "quantity") {
      attribute.selectType = "quantity";
      attribute.priceType = "on";
      attribute.variations = [
        {
          id: shortId(),
          title: wizardQuantityLabel.trim() || "Unidade",
          price: moneyStringToNumber(realMoneyNumber(wizardQuantityPrice || "0")),
          minQuantity: Math.max(0, Number(wizardQuantityMin) || 0),
          maxQuantity: Math.max(0, Number(wizardQuantityMax) || 0),
        },
      ];
    }

    if (wizardTemplateId === "color") {
      const selectedColors = wizardColorHexes.length ? wizardColorHexes : ["#ffffff"];
      attribute.selectType = "color";
      attribute.priceType = wizardColorWithPrice ? "on" : "off";
      attribute.variations = selectedColors.map((hex) => {
        const color = COLOR_OPTIONS.find((entry) => entry.hex.toLowerCase() === hex.toLowerCase());
        return {
          id: shortId(),
          title: color?.name ?? "Cor",
          color: hex,
          price: 0,
        };
      });
    }

    if (wizardTemplateId === "customer-name") {
      (attribute as any).selectType = "text";
      (attribute as any).priceType = "off";
      (attribute as any).variations = [];
      (attribute as any).placeholder = wizardCustomPlaceholder || "Ex: Nome da criança";
      (attribute as any).customPrice = realMoneyNumber(wizardCustomPrice || "");
    }

    if (wizardTemplateId === "customer-image") {
      (attribute as any).selectType = "image";
      (attribute as any).priceType = "off";
      (attribute as any).variations = [];
      (attribute as any).placeholder = wizardCustomPlaceholder || "Ex: Envie a foto aqui";
      (attribute as any).customPrice = realMoneyNumber(wizardCustomPrice || "");
    }

    return attribute;
  };

  const createAttributeFromWizard = () => {
    const attribute = buildWizardAttribute();
    if (!attribute) return;
    appendAttribute(attribute);
    closeWizard();
  };

  const removeAttribute = (id: string) => {
    const next = attributes.filter((a) => a.id !== id);
    setAttributes(next);
    setHasChanges(true);
    setConfirmDelete(null);
    if (openId === id) setOpenId(null);
  };

  const updateAttribute = (id: string, value: Partial<AttributeType>) => {
    const next = attributes.map((a) => (a.id === id ? { ...a, ...value } : a));
    setAttributes(next);
    setHasChanges(true);
  };

  const addVariation = (attrId: string) => {
    const attr = attributes.find((a) => a.id === attrId);
    if (!attr) return;
    const newVar = { id: shortId(), title: "", price: 0, minQuantity: 0, maxQuantity: 0 };
    updateAttribute(attrId, { variations: [...(attr.variations || []), newVar] });
  };

  const updateVariation = (attrId: string, varId: string, value: any) => {
    const attr = attributes.find((a) => a.id === attrId);
    if (!attr) return;
    const vars = (attr.variations || []).map((v: any) =>
      v.id === varId ? { ...v, ...value } : v
    );
    updateAttribute(attrId, { variations: vars });
  };

  const removeVariation = (attrId: string, varId: string) => {
    const attr = attributes.find((a) => a.id === attrId);
    if (!attr) return;
    const vars = (attr.variations || []).filter((v: any) => v.id !== varId);
    updateAttribute(attrId, { variations: vars });
    setConfirmDeleteVar(null);
  };

  const selectedWizardTemplate = QUICK_ATTRIBUTE_TEMPLATES.find(
    (template) => template.id === wizardTemplateId
  );
  const canAdvanceToConfig = !!wizardTemplateId;
  const canAdvanceToReview = canAdvanceToConfig && wizardGroupTitle.trim().length > 0;

  return (
    <div className="space-y-3">
      {hasChanges && (
        <div className="sticky top-0 z-10 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-amber-800">Você tem alterações não salvas</span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full justify-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 sm:w-auto"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <p className="text-lg font-semibold text-zinc-900">Variações e adicionais</p>
          <p className="text-base text-zinc-600 mt-1">
            Escolha o formato de criação: rápido por assistente ou completo no modo manual.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={openWizard}
            className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-4 text-left transition-colors hover:bg-yellow-100"
          >
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-base">
              <Sparkles size={17} />
              Assistente passo a passo
            </div>
            <p className="text-sm text-zinc-700 mt-1.5">
              Abre um modal guiado com 3 passos.
            </p>
          </button>

          <button
            type="button"
            onClick={addAttribute}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-left transition-colors hover:bg-zinc-50"
          >
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-base">
              <Plus size={18} />
              Criar manualmente
            </div>
            <p className="text-sm text-zinc-700 mt-1.5">
              Controle total para configurar tudo do seu jeito.
            </p>
          </button>
        </div>
      </div>

      <Modal
        status={wizardOpen}
        close={closeWizard}
        title="Assistente de criação de adicionais"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {WIZARD_STEPS.map((item) => {
              const isDone = wizardStep > item.step;
              const isActive = wizardStep === item.step;
              return (
                <div
                  key={item.step}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-yellow-300 bg-yellow-50 text-yellow-900"
                      : isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500"
                  }`}
                >
                  {item.step}. {item.label}
                </div>
              );
            })}
          </div>

          {wizardStep === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                Selecione um modelo para iniciar.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {QUICK_ATTRIBUTE_TEMPLATES.map((template) => {
                  const active = wizardTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleWizardTemplateSelect(template.id as QuickTemplateId)}
                      className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                        active
                          ? "border-yellow-300 bg-yellow-50"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5">
                          {renderSelectTypeIcon(template.iconType, active, "colorful")}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{template.title}</p>
                          <p className="text-xs text-zinc-600 mt-1">{template.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Nome do grupo
                </label>
                <input
                  type="text"
                  value={wizardGroupTitle}
                  onChange={(e) => setWizardGroupTitle(e.target.value)}
                  placeholder="Ex: Adicional de balões"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                />
              </div>

              {wizardTemplateId === "additional-yes-no" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                      Texto da opção positiva
                    </label>
                    <input
                      type="text"
                      value={wizardAdditionalLabel}
                      onChange={(e) => setWizardAdditionalLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                      Preço da opção
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-zinc-500">R$</span>
                      <input
                        type="text"
                        value={wizardAdditionalPrice}
                        onChange={(e) => setWizardAdditionalPrice(realMoneyNumber(e.target.value))}
                        className="w-full px-2 py-2 border border-zinc-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-yellow-400 outline-none sm:w-28"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardTemplateId === "quantity" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                        Nome da opção
                      </label>
                      <input
                        type="text"
                        value={wizardQuantityLabel}
                        onChange={(e) => setWizardQuantityLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                        Preço por unidade
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-zinc-500">R$</span>
                        <input
                          type="text"
                          value={wizardQuantityPrice}
                          onChange={(e) => setWizardQuantityPrice(realMoneyNumber(e.target.value))}
                          className="w-28 px-2 py-2 border border-zinc-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                        Quantidade mínima
                      </label>
                      <input
                        type="number"
                        value={wizardQuantityMin}
                        onChange={(e) => setWizardQuantityMin(e.target.value)}
                        min={0}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                        Quantidade máxima
                      </label>
                      <input
                        type="number"
                        value={wizardQuantityMax}
                        onChange={(e) => setWizardQuantityMax(e.target.value)}
                        min={0}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardTemplateId === "color" && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-700 mb-1.5">Cores iniciais</p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {COLOR_OPTIONS.map((color) => {
                        const selected = wizardColorHexes.some(
                          (hex) => hex.toLowerCase() === color.hex.toLowerCase()
                        );

                        return (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => toggleWizardColor(color.hex)}
                            className={`relative h-9 rounded-md border-2 transition-colors ${
                              selected ? "border-yellow-400" : "border-zinc-200 hover:border-zinc-300"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {color.hex === "#ffffff" && (
                              <span className="absolute inset-0 rounded-md border border-zinc-300" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={wizardColorWithPrice}
                      onChange={(e) => setWizardColorWithPrice(e.target.checked)}
                    />
                    Definir preço por cor
                  </label>
                </div>
              )}

              {(wizardTemplateId === "customer-name" || wizardTemplateId === "customer-image") && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                      Texto de ajuda
                    </label>
                    <input
                      type="text"
                      value={wizardCustomPlaceholder}
                      onChange={(e) => setWizardCustomPlaceholder(e.target.value)}
                      placeholder={
                        wizardTemplateId === "customer-name"
                          ? "Ex: Nome da criança"
                          : "Ex: Envie a foto aqui"
                      }
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                      Taxa de personalização
                      <span className="ml-1 font-normal text-zinc-500">opcional</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-zinc-500">R$</span>
                      <input
                        type="text"
                        value={wizardCustomPrice}
                        onChange={(e) => setWizardCustomPrice(realMoneyNumber(e.target.value))}
                        placeholder="0,00"
                        className="w-28 px-2 py-2 border border-zinc-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-sm font-semibold text-zinc-900">
                Revise antes de criar
              </p>
              <p className="text-sm text-zinc-700">
                Modelo: <span className="font-medium">{selectedWizardTemplate?.title ?? "-"}</span>
              </p>
              <p className="text-sm text-zinc-700">
                Grupo: <span className="font-medium">{wizardGroupTitle || "-"}</span>
              </p>
              {wizardTemplateId === "additional-yes-no" && (
                <p className="text-sm text-zinc-700">
                  Opção positiva:{" "}
                  <span className="font-medium">
                    {wizardAdditionalLabel || "Sim, adicionar"} (R$ {wizardAdditionalPrice || "0,00"})
                  </span>
                </p>
              )}
              {wizardTemplateId === "quantity" && (
                <p className="text-sm text-zinc-700">
                  Quantidade:{" "}
                  <span className="font-medium">
                    {wizardQuantityLabel || "Unidade"} (R$ {wizardQuantityPrice || "0,00"}) min {wizardQuantityMin} / max {wizardQuantityMax}
                  </span>
                </p>
              )}
              {wizardTemplateId === "color" && (
                <p className="text-sm text-zinc-700">
                  Cores selecionadas:{" "}
                  <span className="font-medium">{wizardColorHexes.length}</span>
                </p>
              )}
              {(wizardTemplateId === "customer-name" || wizardTemplateId === "customer-image") && (
                <p className="text-sm text-zinc-700">
                  Entrada do cliente:{" "}
                  <span className="font-medium">
                    {wizardTemplateId === "customer-name" ? "Texto" : "Imagem"}
                    {wizardCustomPrice ? ` (taxa R$ ${wizardCustomPrice})` : ""}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => (wizardStep === 1 ? closeWizard() : setWizardStep((prev) => (prev - 1) as 1 | 2 | 3))}
              className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 sm:w-auto"
            >
              {wizardStep === 1 ? "Cancelar" : "Voltar"}
            </button>

            {wizardStep < 3 ? (
              <button
                type="button"
                onClick={() => setWizardStep((prev) => (prev + 1) as 1 | 2 | 3)}
                disabled={(wizardStep === 1 && !canAdvanceToConfig) || (wizardStep === 2 && !canAdvanceToReview)}
                className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-400 hover:bg-yellow-500 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 sm:w-auto"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={createAttributeFromWizard}
                className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white sm:w-auto"
              >
                Criar grupo
              </button>
            )}
          </div>
        </div>
      </Modal>

      {attributes.map((attr) => {
        const isOpen = openId === attr.id;
        const varCount = attr.variations?.length ?? 0;
        const selectTypeLabel =
          attr.selectType === "radio"
            ? "Seleção única"
            : attr.selectType === "checkbox"
            ? "Múltipla escolha"
            : attr.selectType === "quantity"
            ? "Por quantidade"
            : attr.selectType === "color"
            ? "Seleção de cor"
            : attr.selectType === "text"
            ? "Texto personalizado"
            : "Envio de imagem";
        const supportsPriceType = attr.selectType !== "text" && attr.selectType !== "image";

        return (
          <div
            key={attr.id}
            className={`border rounded-xl transition-all ${
              isOpen ? "border-yellow-300 bg-yellow-50/40" : "border-zinc-200 bg-white"
            }`}
          >
            <div
              className="flex items-start gap-3 px-4 py-3 cursor-pointer select-none sm:items-center"
              onClick={() => setOpenId(isOpen ? null : attr.id)}
            >
              <GripVertical size={16} className="text-yellow-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base text-zinc-900 break-words">
                  {attr.title || "Grupo sem nome"}
                </div>
                <div className="mt-0.5 text-sm leading-5 text-zinc-600 break-words">
                  {(attr.selectType === "text" || attr.selectType === "image") ? (
                    selectTypeLabel
                  ) : (
                    <>
                      {varCount} {varCount === 1 ? "opção" : "opções"} · {selectTypeLabel}
                      {attr.priceType === "on" ? " · Com preços" : ""}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                {confirmDelete === attr.id ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                      className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAttribute(attr.id); }}
                      className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                    >
                      Excluir
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(attr.id); }}
                    className="p-2 text-yellow-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                {isOpen ? (
                  <ChevronUp size={16} className="text-yellow-700" />
                ) : (
                  <ChevronDown size={16} className="text-yellow-700" />
                )}
              </div>
            </div>

            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-zinc-100">
                <div className="pt-4">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                    Nome do grupo <span className="ml-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span>
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={attr.title ?? ""}
                      onChange={(e) => updateAttribute(attr.id, { title: e.target.value })}
                      placeholder="Ex: Tamanho, Sabor, Adicional de balões..."
                      className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
                    />
                    <div className="sm:self-auto self-end">
                      <EmojiPicker onSelect={(emoji) => updateAttribute(attr.id, { title: (attr.title ?? "") + emoji })} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-base font-semibold text-zinc-800">
                      Como o cliente vai escolher
                    </label>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {PRIMARY_SELECT_TYPES.map((st) => {
                        const active = attr.selectType === st.value;
                        return (
                          <button
                            key={st.value}
                            type="button"
                            onClick={() => updateAttribute(attr.id, { selectType: st.value })}
                            className={`w-full px-3 py-3 rounded-lg border text-left transition-all ${
                              active
                                ? "border-yellow-300 bg-yellow-50 text-zinc-900"
                                : "border-zinc-200 text-zinc-700 hover:border-zinc-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {renderSelectTypeIcon(st.value, active)}
                              <div>
                                <div className="font-semibold text-sm leading-tight">{st.label}</div>
                                <div className="text-xs text-zinc-500">{st.summary}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <details
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                      open={attr.selectType === "text" || attr.selectType === "image"}
                    >
                      <summary className="flex items-center justify-between gap-2 cursor-pointer text-sm font-semibold text-zinc-700">
                        Tipos avançados
                        <span className="text-xs font-medium text-zinc-500">
                          Texto e imagem
                        </span>
                      </summary>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {ADVANCED_SELECT_TYPES.map((st) => {
                          const active = attr.selectType === st.value;
                          return (
                            <button
                              key={st.value}
                              type="button"
                              onClick={() => updateAttribute(attr.id, { selectType: st.value })}
                              className={`w-full px-3 py-3 rounded-lg border text-left transition-all ${
                                active
                                  ? "border-yellow-300 bg-yellow-50 text-zinc-900"
                                  : "border-zinc-200 text-zinc-700 hover:border-zinc-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {renderSelectTypeIcon(st.value, active)}
                                <div>
                                  <div className="font-semibold text-sm leading-tight">{st.label}</div>
                                  <div className="text-xs text-zinc-500">{st.summary}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </details>

                    {attr.selectType === "checkbox" && (
                      <div className="pt-1">
                        <label className="block text-sm text-zinc-600 mb-1">
                          Limite de seleção (0 = sem limite)
                        </label>
                        <input
                          type="number"
                          value={attr.limit ?? 0}
                          onChange={(e) => updateAttribute(attr.id, { limit: Number(e.target.value) || 0 })}
                          min={0}
                          className="w-28 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {supportsPriceType && (
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                        {attr.selectType === "color" ? "Preço nas cores" : "Preço nas opções"}
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.id, { priceType: "on" })}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            attr.priceType === "on"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 text-zinc-600 bg-white hover:border-zinc-300"
                          }`}
                        >
                          Com preço
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.id, { priceType: "off" })}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            attr.priceType === "off"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700"
                              : "border-zinc-200 text-zinc-600 bg-white hover:border-zinc-300"
                          }`}
                        >
                          Sem preço
                        </button>
                      </div>
                    </div>
                  )}

                  {(attr.selectType === "text" || attr.selectType === "image") && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                          Placeholder <span className="font-normal text-zinc-500">opcional</span>
                        </label>
                        <input
                          type="text"
                          value={(attr as any).placeholder ?? ""}
                          onChange={(e) => updateAttribute(attr.id, { placeholder: e.target.value } as any)}
                          placeholder={attr.selectType === "text" ? "Ex: Digite o nome aqui..." : "Ex: Envie a foto aqui..."}
                          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                          Taxa de personalização <span className="font-normal text-zinc-500">opcional</span>
                        </label>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                          <span className="text-sm text-zinc-500">R$</span>
                          <input
                            type="text"
                            value={(attr as any).customPrice ?? ""}
                            onChange={(e) => updateAttribute(attr.id, { customPrice: realMoneyNumber(e.target.value) } as any)}
                            placeholder="0,00"
                            className="w-full sm:w-28 px-2 py-2 text-sm text-right border border-zinc-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-3 text-sm text-zinc-600">
                        {attr.selectType === "text" ? (
                          <div className="flex items-start gap-2">
                            <Type size={14} className="mt-0.5 shrink-0" />
                            <span>O cliente verá um campo para texto livre.</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Upload size={14} className="mt-0.5 shrink-0" />
                            <span>O cliente poderá enviar uma imagem neste grupo.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {attr.selectType !== "text" && attr.selectType !== "image" && (
                <div>
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-sm font-semibold text-zinc-700">
                      {attr.selectType === "color" ? "Cores" : "Opções"} ({varCount})
                    </label>
                    <button
                      type="button"
                      onClick={() => addVariation(attr.id)}
                      className="inline-flex w-full items-center justify-center gap-1 px-2.5 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors sm:w-auto"
                    >
                      <Plus size={14} />
                      {attr.selectType === "color" ? "Adicionar cor" : "Adicionar opção"}
                    </button>
                  </div>

                  {varCount === 0 && (
                    <div className="text-center py-6 bg-white border border-dashed border-zinc-200 rounded-lg">
                      <p className="text-base text-zinc-500 mb-2">Nenhuma opção adicionada</p>
                      <button
                        type="button"
                        onClick={() => addVariation(attr.id)}
                        className="text-sm text-amber-700 hover:text-amber-800 font-semibold"
                      >
                        Adicionar primeira opção
                      </button>
                    </div>
                  )}

                  {varCount > 0 && (
                    <div className="space-y-2">
                      {(attr.variations || []).map((v: any, vi: number) => (
                        <div
                          key={v.id ?? vi}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-3 shadow-sm"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-zinc-900">
                                {attr.selectType === "color" ? `Cor ${vi + 1}` : `Opção ${vi + 1}`}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {attr.selectType === "quantity"
                                  ? "Defina nome, limites e valor por unidade."
                                  : attr.selectType === "checkbox"
                                  ? "Esta opção pode ser marcada com outras."
                                  : attr.selectType === "color"
                                  ? "Escolha a cor e o nome exibido para o cliente."
                                  : "Edite o nome, a imagem e o preço desta opção."}
                              </div>
                            </div>

                            {confirmDeleteVar === v.id ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteVar(null)}
                                  className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-500"
                                >
                                  Não
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeVariation(attr.id, v.id)}
                                  className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white"
                                >
                                  Excluir
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteVar(v.id)}
                                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 shrink-0"
                                aria-label={`Excluir opção ${vi + 1}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          {attr.selectType === "color" ? (
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Cor
                              </label>
                              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                                <ColorPicker
                                  onSelect={(name, hex) =>
                                    updateVariation(attr.id, v.id, { title: name, color: hex })
                                  }
                                  buttonClassName="h-11 w-11 overflow-hidden rounded-xl border-2 border-zinc-300 shrink-0 transition-colors hover:border-yellow-400"
                                  title="Selecionar cor"
                                  trigger={
                                    <span
                                      className="relative block h-full w-full"
                                      style={{ backgroundColor: v.color || "#ffffff" }}
                                    >
                                      {String(v.color || "#ffffff").toLowerCase() === "#ffffff" && (
                                        <span className="absolute inset-0 border border-zinc-300" />
                                      )}
                                    </span>
                                  }
                                />
                                <input
                                  type="text"
                                  value={v.title ?? ""}
                                  onChange={(e) => updateVariation(attr.id, v.id, { title: e.target.value })}
                                  placeholder="Nome da cor (ex: Vermelho, Azul...)"
                                  className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-0 py-2 text-sm outline-none focus:ring-0"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Nome da opção
                              </label>
                          <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 sm:flex-row sm:items-start">
                                <ImagePicker
                                  value={v.image}
                                  gallery={galleryMedia}
                                  productId={product?.id}
                                  onChange={(imgId, newMedia) => {
                                    const selectedMedia =
                                      newMedia ??
                                      (imgId !== null && imgId !== undefined
                                        ? galleryMedia.find((m) => Number(m.id) === Number(imgId))
                                        : undefined);

                                    const normalizedImage =
                                      selectedMedia
                                        ? normalizeVariationImageValue(selectedMedia)
                                        : imgId ?? "";

                                    updateVariation(attr.id, v.id, { image: normalizedImage });

                                    if (
                                      selectedMedia &&
                                      !galleryMedia.find((m) => Number(m.id) === Number(selectedMedia.id))
                                    ) {
                                      setGalleryMedia((prev) => [...prev, selectedMedia]);
                                    }
                                  }}
                                />
                                <input
                                  type="text"
                                  value={v.title ?? ""}
                                  onChange={(e) => updateVariation(attr.id, v.id, { title: e.target.value })}
                                  placeholder="Nome da opção (ex: Sim, Não, P, M, G...)"
                                  className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-0 py-2 text-sm outline-none focus:ring-0"
                                />
                                <div className="self-end shrink-0 sm:self-auto">
                                  <EmojiPicker onSelect={(emoji) => updateVariation(attr.id, v.id, { title: (v.title ?? "") + emoji })} />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-3 grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center">
                          {attr.selectType === "checkbox" && (
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 sm:justify-start sm:border-0 sm:bg-transparent sm:p-0 shrink-0">
                              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Mín.</span>
                              <input
                                key={`${v.id}-min-${v.minQuantity}`}
                                type="number"
                                defaultValue={v.minQuantity ?? 0}
                                onBlur={(e) => updateVariation(attr.id, v.id, { minQuantity: Math.max(0, parseInt(e.target.value) || 0) })}
                                placeholder="0"
                                min={0}
                                className="w-20 sm:w-14 px-2 py-1 text-sm text-right border border-zinc-200 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                              />
                            </div>
                          )}

                          {attr.selectType === "quantity" && (
                            <div className="grid grid-cols-1 gap-2 shrink-0 sm:grid-cols-2">
                              <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 sm:justify-start sm:border-0 sm:bg-transparent sm:p-0">
                                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Mín.</span>
                                <input
                                  key={`${v.id}-min-${v.minQuantity}`}
                                  type="number"
                                  defaultValue={v.minQuantity ?? 0}
                                  onBlur={(e) => updateVariation(attr.id, v.id, { minQuantity: Math.max(0, parseInt(e.target.value) || 0) })}
                                  placeholder="0"
                                  min={0}
                                  className="w-20 sm:w-14 px-2 py-1 text-sm text-right border border-zinc-200 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 sm:justify-start sm:border-0 sm:bg-transparent sm:p-0">
                                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Máx.</span>
                                <input
                                  key={`${v.id}-max-${v.maxQuantity}`}
                                  type="number"
                                  defaultValue={v.maxQuantity ?? 0}
                                  onBlur={(e) => updateVariation(attr.id, v.id, { maxQuantity: Math.max(0, parseInt(e.target.value) || 0) })}
                                  placeholder="0"
                                  min={0}
                                  className="w-20 sm:w-14 px-2 py-1 text-sm text-right border border-zinc-200 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                                />
                              </div>
                            </div>
                          )}

                          {attr.priceType === "on" && (
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 sm:justify-start sm:border-0 sm:bg-transparent sm:p-0 shrink-0">
                              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Preço</span>
                              <input
                                type="text"
                                value={v.price ?? ""}
                                onChange={(e) => updateVariation(attr.id, v.id, { price: realMoneyNumber(e.target.value) })}
                                placeholder="0,00"
                                className="w-24 sm:w-20 px-2 py-1 text-sm text-right border border-zinc-200 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                              />
                            </div>
                          )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
