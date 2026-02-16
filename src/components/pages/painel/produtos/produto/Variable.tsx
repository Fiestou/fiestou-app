import { AttributeType, ProductType } from "@/src/models/product";
import { useEffect, useState, useCallback, useRef } from "react";
import { shortId, realMoneyNumber, getImage } from "@/src/helper";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, ImageIcon, X, Smile, Type, Upload, CircleDot, CheckSquare, Hash, Palette } from "lucide-react";
import Api from "@/src/services/api";

interface MediaItem {
  id: number;
  base_url?: string;
  details?: any;
  [key: string]: any;
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

const SELECT_TYPES = [
  { value: "radio", label: "Seleção única", desc: "Cliente escolhe 1 opção" },
  { value: "checkbox", label: "Múltipla escolha", desc: "Cliente pode marcar várias" },
  { value: "quantity", label: "Por quantidade", desc: "Cliente define a qtde" },
  { value: "color", label: "Seleção de cor", desc: "Cliente escolhe uma cor" },
  { value: "text", label: "Texto personalizado", desc: "Cliente digita um texto" },
  { value: "image", label: "Envio de imagem", desc: "Cliente envia uma foto" },
];

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

function ImagePicker({
  value,
  gallery,
  onChange,
  productId,
}: {
  value?: string | number;
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

  const selected = gallery.find((m) => m.id == value);
  const thumb = selected ? getImage(selected, "thumb") : null;

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
          <img
            src={thumb}
            alt=""
            onClick={() => setOpen(!open)}
            className="w-8 h-8 rounded-md object-cover cursor-pointer border border-zinc-200 hover:border-yellow-400 transition-colors"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={8} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-8 h-8 rounded-md border border-dashed border-zinc-300 hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center transition-colors ${uploading ? "opacity-50" : ""}`}
          title="Adicionar imagem"
          disabled={uploading}
        >
          {uploading ? (
            <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon size={14} className="text-zinc-400" />
          )}
        </button>
      )}

      {open && (
        <div className="absolute z-20 top-10 left-0 bg-white rounded-lg shadow-lg border border-zinc-200 p-2 w-52">
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {gallery.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onChange(m.id); setOpen(false); }}
                  className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-colors ${
                    m.id == value ? "border-yellow-400" : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <img src={getImage(m, "thumb")} alt="" className="w-full h-full object-cover" />
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
        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
          open ? "bg-yellow-100 text-yellow-600" : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
        }`}
        title="Inserir emoji"
      >
        <Smile size={15} />
      </button>

      {open && (
        <div className="absolute z-30 top-9 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-zinc-200 w-64">
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
          <div className="p-2 grid grid-cols-8 gap-0.5 max-h-36 overflow-y-auto">
            {EMOJI_CATEGORIES[tab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onSelect(emoji); setOpen(false); }}
                className="w-7 h-7 flex items-center justify-center text-base hover:bg-zinc-100 rounded-md transition-colors"
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
            : `w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                open
                  ? "bg-yellow-100 text-amber-600"
                  : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
              }`
        }
        title={title}
      >
        {trigger ?? <Palette size={iconSize} />}
      </button>

      {open && (
        <div className="absolute z-30 top-9 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-zinc-200 w-64 p-3">
          <div className="grid grid-cols-5 gap-2">
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
  const api = new Api();
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteVar, setConfirmDeleteVar] = useState<string | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchGallery = useCallback(async () => {
    if (!product?.id) return;
    try {
      const res: any = await api.bridge({
        method: "get",
        url: `products/gallery/${product.id}`,
      });
      setGalleryMedia(res?.data ?? []);
    } catch {}
  }, [product?.id]);

  useEffect(() => {
    fetchGallery();
  }, [product?.id]);

  useEffect(() => {
    const next = normalizeAttributes(product?.attributes ?? []);
    if (JSON.stringify(next) !== JSON.stringify(attributes)) {
      setAttributes(next);
    }
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
    const newVar = { id: shortId(), title: "", price: 0 };
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

  return (
    <div className="space-y-3">
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-amber-800">Você tem alterações não salvas</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      )}

      <button
        type="button"
        onClick={addAttribute}
        className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
      >
        <Plus size={20} />
        Adicionar Grupo de Variações
      </button>

      {attributes.map((attr) => {
        const isOpen = openId === attr.id;
        const varCount = attr.variations?.length ?? 0;

        return (
          <div
            key={attr.id}
            className={`border rounded-xl transition-all ${
              isOpen ? "border-yellow-300 bg-yellow-50/40" : "border-zinc-200 bg-white"
            }`}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
              onClick={() => setOpenId(isOpen ? null : attr.id)}
            >
              <GripVertical size={16} className="text-zinc-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-zinc-900 truncate">
                  {attr.title || "Grupo sem nome"}
                </div>
                <div className="text-xs text-zinc-400">
                  {(attr.selectType === "text" || attr.selectType === "image") ? (
                    attr.selectType === "text" ? "Texto personalizado" : "Envio de imagem"
                  ) : (
                    <>
                      {varCount} {varCount === 1 ? "opção" : "opções"} · {
                        attr.selectType === "radio" ? "Seleção única" :
                        attr.selectType === "checkbox" ? "Múltipla escolha" : "Quantidade"
                      }
                      {attr.priceType === "on" ? " · Com preços" : ""}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {confirmDelete === attr.id ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                      className="px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAttribute(attr.id); }}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                    >
                      Excluir
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(attr.id); }}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {isOpen ? (
                  <ChevronUp size={16} className="text-zinc-400" />
                ) : (
                  <ChevronDown size={16} className="text-zinc-400" />
                )}
              </div>
            </div>

            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-zinc-100">
                <div className="pt-4">
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Nome do grupo <span className="ml-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={attr.title ?? ""}
                      onChange={(e) => updateAttribute(attr.id, { title: e.target.value })}
                      placeholder="Ex: Tamanho, Sabor, Adicional de balões..."
                      className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
                    />
                    <EmojiPicker onSelect={(emoji) => updateAttribute(attr.id, { title: (attr.title ?? "") + emoji })} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                      Tipo de seleção
                    </label>
                    <div className="space-y-1.5">
                      {SELECT_TYPES.map((st) => (
                        <button
                          key={st.value}
                          type="button"
                          onClick={() => updateAttribute(attr.id, { selectType: st.value })}
                          className={`w-full px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                            attr.selectType === st.value
                              ? "border-yellow-300 bg-yellow-50 text-zinc-900"
                              : "border-zinc-200 text-zinc-600 hover:border-zinc-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {st.value === "radio" && <CircleDot size={15} className={attr.selectType === st.value ? "text-amber-600" : "text-zinc-400"} />}
                            {st.value === "checkbox" && <CheckSquare size={15} className={attr.selectType === st.value ? "text-amber-600" : "text-zinc-400"} />}
                            {st.value === "quantity" && <Hash size={15} className={attr.selectType === st.value ? "text-amber-600" : "text-zinc-400"} />}
                            {st.value === "color" && <Palette size={15} className={attr.selectType === st.value ? "text-amber-600" : "text-zinc-400"} />}
                            {st.value === "text" && <Type size={15} className={attr.selectType === st.value ? "text-amber-600" : "text-zinc-400"} />}
                            {st.value === "image" && <Upload size={15} className={attr.selectType === st.value ? "text-amber-600" : "text-zinc-400"} />}
                            <div>
                              <div className="font-medium text-xs">{st.label}</div>
                              <div className="text-[10px] text-zinc-400">{st.desc}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {attr.selectType === "checkbox" && (
                      <div className="mt-2">
                        <label className="block text-xs text-zinc-500 mb-1">Limite de seleção (0 = sem limite)</label>
                        <input
                          type="number"
                          value={attr.limit ?? 0}
                          onChange={(e) => updateAttribute(attr.id, { limit: Number(e.target.value) || 0 })}
                          min={0}
                          className="w-24 px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {attr.selectType !== "text" && attr.selectType !== "image" && attr.selectType !== "color" && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                        Preços nas opções
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.id, { priceType: "on" })}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            attr.priceType === "on"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 text-zinc-500 bg-white hover:border-zinc-300"
                          }`}
                        >
                          Com preços
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.id, { priceType: "off" })}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            attr.priceType === "off"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700"
                              : "border-zinc-200 text-zinc-500 bg-white hover:border-zinc-300"
                          }`}
                        >
                          Sem preços
                        </button>
                      </div>
                    </div>
                  )}

                  {attr.selectType === "color" && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                        Preços nas cores
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.id, { priceType: "on" })}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            attr.priceType === "on"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 text-zinc-500 bg-white hover:border-zinc-300"
                          }`}
                        >
                          Com preços
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttribute(attr.id, { priceType: "off" })}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            attr.priceType === "off"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700"
                              : "border-zinc-200 text-zinc-500 bg-white hover:border-zinc-300"
                          }`}
                        >
                          Sem preços
                        </button>
                      </div>
                    </div>
                  )}

                  {(attr.selectType === "text" || attr.selectType === "image") && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                          Placeholder <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span>
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
                        <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                          Taxa de personalização <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-400">R$</span>
                          <input
                            type="text"
                            value={(attr as any).customPrice ?? ""}
                            onChange={(e) => updateAttribute(attr.id, { customPrice: realMoneyNumber(e.target.value) } as any)}
                            placeholder="0,00"
                            className="w-28 px-2 py-2 text-sm text-right border border-zinc-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="bg-zinc-50 rounded-lg p-3 text-xs text-zinc-500">
                        {attr.selectType === "text" ? (
                          <div className="flex items-start gap-2">
                            <Type size={14} className="mt-0.5 shrink-0" />
                            <span>O cliente vai ver um campo de texto na página do produto. Exemplo: &quot;Qual o nome do aniversariante?&quot;</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Upload size={14} className="mt-0.5 shrink-0" />
                            <span>O cliente vai poder enviar uma imagem na página do produto. Exemplo: &quot;Envie a foto para o topo do bolo&quot;</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {attr.selectType !== "text" && attr.selectType !== "image" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-zinc-600">
                      {attr.selectType === "color" ? "Cores" : "Opções"} ({varCount})
                    </label>
                    <button
                      type="button"
                      onClick={() => addVariation(attr.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                    >
                      <Plus size={14} />
                      {attr.selectType === "color" ? "Adicionar cor" : "Adicionar opção"}
                    </button>
                  </div>

                  {varCount === 0 && (
                    <div className="text-center py-6 bg-white border border-dashed border-zinc-200 rounded-lg">
                      <p className="text-sm text-zinc-400 mb-2">Nenhuma opção adicionada</p>
                      <button
                        type="button"
                        onClick={() => addVariation(attr.id)}
                        className="text-xs text-amber-700 hover:text-amber-800 font-medium"
                      >
                        Adicionar primeira opção
                      </button>
                    </div>
                  )}

                  {varCount > 0 && (
                    <div className="space-y-2">
                      {(attr.variations || []).map((v: any, vi: number) => (
                        <div key={v.id ?? vi} className="flex items-center gap-2 bg-white rounded-lg border border-zinc-200 px-3 py-2">
                          {attr.selectType === "color" ? (
                            <>
                              <ColorPicker
                                onSelect={(name, hex) =>
                                  updateVariation(attr.id, v.id, { title: name, color: hex })
                                }
                                buttonClassName="w-9 h-9 rounded-md border-2 border-zinc-300 shrink-0 overflow-hidden transition-colors hover:border-yellow-400"
                                title="Selecionar cor"
                                trigger={
                                  <span
                                    className="relative block w-full h-full"
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
                                className="flex-1 px-2 py-1 text-sm border-0 focus:ring-0 outline-none bg-transparent min-w-0"
                              />
                            </>
                          ) : (
                            <>
                              <ImagePicker
                                value={v.image}
                                gallery={galleryMedia}
                                productId={product?.id}
                                onChange={(imgId, newMedia) => {
                                  updateVariation(attr.id, v.id, { image: imgId ?? "" });
                                  if (newMedia && !galleryMedia.find((m) => m.id === newMedia.id)) {
                                    setGalleryMedia((prev) => [...prev, newMedia]);
                                  }
                                }}
                              />
                              <input
                                type="text"
                                value={v.title ?? ""}
                                onChange={(e) => updateVariation(attr.id, v.id, { title: e.target.value })}
                                placeholder="Nome da opção (ex: Sim, Não, P, M, G...)"
                                className="flex-1 px-2 py-1 text-sm border-0 focus:ring-0 outline-none bg-transparent min-w-0"
                              />
                              <EmojiPicker onSelect={(emoji) => updateVariation(attr.id, v.id, { title: (v.title ?? "") + emoji })} />
                            </>
                          )}

                          {(attr.selectType === "checkbox" || attr.selectType === "quantity") && (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-zinc-400">Min:</span>
                              <input
                                type="number"
                                value={v.minQuantity ?? 0}
                                onChange={(e) => updateVariation(attr.id, v.id, { minQuantity: Number(e.target.value) || 0 })}
                                placeholder="0"
                                min={0}
                                className="w-14 px-2 py-1 text-sm text-right border border-zinc-200 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                              />
                            </div>
                          )}

                          {attr.priceType === "on" && (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-zinc-400">R$</span>
                              <input
                                type="text"
                                value={v.price ?? ""}
                                onChange={(e) => updateVariation(attr.id, v.id, { price: realMoneyNumber(e.target.value) })}
                                placeholder="0,00"
                                className="w-20 px-2 py-1 text-sm text-right border border-zinc-200 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                              />
                            </div>
                          )}

                          {confirmDeleteVar === v.id ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteVar(null)}
                                className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-100 rounded"
                              >
                                Não
                              </button>
                              <button
                                type="button"
                                onClick={() => removeVariation(attr.id, v.id)}
                                className="px-1.5 py-0.5 text-[10px] font-medium text-white bg-red-500 rounded"
                              >
                                Sim
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteVar(v.id)}
                              className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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
