import { getImage } from "@/src/helper";
import Api from "@/src/services/api";
import Img from "@/src/components/utils/ImgBase";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Upload, X, Star, GripVertical, ImagePlus, Loader2 } from "lucide-react";

interface MediaItem {
  id: number;
  base_url?: string;
  base64?: string;
  details?: any;
  [key: string]: any;
}

export default function Gallery({
  product,
  emitProduct,
}: {
  product?: number | string;
  emitProduct: Function;
}) {
  const api = useMemo(() => new Api(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(0);
  const [deleting, setDeleting] = useState<Set<number>>(new Set());
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const getGallery = useCallback(async () => {
    if (!product) return;
    const res: any = await api.bridge({
      method: "get",
      url: `products/gallery/${product}`,
    });
    setGallery(res?.data ?? []);
  }, [api, product]);

  useEffect(() => {
    if (product) getGallery();
  }, [getGallery, product]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(files.length);

    try {
      const res: any = await api.bridge({
        method: "post",
        url: "products/upload-gallery",
        data: {
          product: product ?? "",
          medias: files,
        },
        opts: {
          headers: { "Content-Type": "multipart/form-data" },
        },
      });

      const handle = res?.data;
      if (handle?.product) emitProduct(handle.product);
      if (handle?.medias) setGallery((prev) => [...prev, ...handle.medias]);
    } catch {}

    setUploading(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeItem = async (media: MediaItem) => {
    setDeleting((prev) => new Set(prev).add(media.id));

    try {
      await api.bridge({
        method: "post",
        url: "products/remove-gallery",
        data: { id: product ?? "", medias: [media.id] },
      });

      setGallery((prev) => prev.filter((m) => m.id !== media.id));
    } catch {}

    setDeleting((prev) => {
      const next = new Set(prev);
      next.delete(media.id);
      return next;
    });
  };

  const saveOrder = async (newGallery: MediaItem[]) => {
    if (!product) return;
    const order = newGallery.map((m) => m.id);
    await api.bridge({
      method: "post",
      url: "products/reorder-gallery",
      data: { product_id: product, order },
    });
  };

  const setCover = (idx: number) => {
    if (idx === 0) return;
    const item = gallery[idx];
    const next = [item, ...gallery.filter((_, i) => i !== idx)];
    setGallery(next);
    saveOrder(next);
  };

  const onDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setDragOverIdx(idx);
  };

  const onDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    const next = [...gallery];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setGallery(next);
    saveOrder(next);

    setDragIdx(null);
    setDragOverIdx(null);
  };

  const onDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const getThumb = (item: MediaItem) => {
    if (item.base_url) return getImage(item, "thumb");
    if (item.base64) return item.base64;
    return "";
  };

  return (
    <div>
      {gallery.length > 0 && (
        <div className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-sm font-semibold text-zinc-900">
                {gallery.length} {gallery.length === 1 ? "imagem" : "imagens"} na galeria
              </span>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                No celular, a primeira imagem fica como capa. Toque em uma ação abaixo da foto ou arraste para reordenar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 sm:w-auto"
            >
              <ImagePlus size={16} />
              Adicionar imagens
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/80 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600">
              <span className="block font-semibold text-zinc-900">1ª imagem = capa</span>
              A capa é a foto principal que aparece primeiro para o cliente.
            </div>
            <div className="rounded-xl border border-white/80 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600">
              <span className="block font-semibold text-zinc-900">Arraste para reordenar</span>
              Mudar a ordem aqui também reorganiza a galeria pública do produto.
            </div>
            <div className="rounded-xl border border-white/80 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600">
              <span className="block font-semibold text-zinc-900">Remoção rápida</span>
              O botão vermelho remove a imagem atual sem sair dessa tela.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {gallery.map((item, idx) => {
          const isCover = idx === 0;
          const isDeleting = deleting.has(item.id);
          const isDragging = dragIdx === idx;
          const isDragOver = dragOverIdx === idx;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={() => onDrop(idx)}
              onDragEnd={onDragEnd}
              className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-grab active:cursor-grabbing ${
                isCover
                  ? "border-yellow-400 ring-2 ring-yellow-200"
                  : isDragOver
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-zinc-200 hover:border-zinc-300"
              } ${isDragging ? "opacity-40 scale-95" : ""} ${
                isDeleting ? "animate-pulse pointer-events-none" : ""
              }`}
            >
              <Img
                src={getThumb(item)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />

              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <div className="rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                  {idx + 1}
                </div>
                <div className="rounded-full bg-black/55 p-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-90 transition-opacity">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>
              </div>

              {isCover && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  <Star size={10} fill="white" />
                  CAPA
                </div>
              )}

              <div className="absolute inset-x-2 bottom-2 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {isCover ? (
                  <div className="flex-1 rounded-lg bg-white/95 px-2.5 py-2 text-center text-[11px] font-semibold text-zinc-700 shadow-sm">
                    Capa principal
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCover(idx)}
                    className="flex-1 rounded-lg bg-white/95 px-2.5 py-2 text-[11px] font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-yellow-500 hover:text-white"
                  >
                    Definir capa
                  </button>
                )}

                {!isDeleting && (
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="rounded-lg bg-red-500 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`uploading-${i}`} className="relative rounded-xl overflow-hidden aspect-square border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-zinc-400" />
          </div>
        ))}
      </div>

      {gallery.length === 0 && uploading === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 hover:border-yellow-400 bg-zinc-50 hover:bg-yellow-50/50 rounded-2xl p-8 text-center transition-all cursor-pointer group"
        >
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-zinc-100 group-hover:bg-yellow-100 rounded-full transition-colors">
              <Upload size={28} className="text-zinc-400 group-hover:text-yellow-600 transition-colors" />
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-700 mb-1">
            Arraste imagens aqui ou clique para selecionar
          </p>
          <p className="text-xs text-zinc-400">
            JPG, PNG, GIF ou WebP - max 6MB por imagem
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/gif,image/jpeg,image/webp"
        onChange={handleUpload}
        multiple
        className="hidden"
      />
    </div>
  );
}
