import { getImage } from "@/src/helper";
import Api from "@/src/services/api";
import { useEffect, useRef, useState, useCallback } from "react";
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
  const api = new Api();
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
  }, [product]);

  useEffect(() => {
    if (product) getGallery();
  }, [product]);

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
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-zinc-500">
            {gallery.length} {gallery.length === 1 ? "imagem" : "imagens"} - arraste para reordenar
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            <ImagePlus size={14} />
            Adicionar
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
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
              <img
                src={getThumb(item)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-70 transition-opacity">
                <GripVertical size={16} className="text-white drop-shadow" />
              </div>

              {isCover && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <Star size={10} fill="white" />
                  CAPA
                </div>
              )}

              {!isCover && !isDeleting && (
                <button
                  type="button"
                  onClick={() => setCover(idx)}
                  className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-yellow-500 hover:text-white text-zinc-600 text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1"
                >
                  <Star size={10} />
                  Capa
                </button>
              )}

              {!isDeleting && (
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-sm"
                >
                  <X size={12} />
                </button>
              )}
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
          className="border-2 border-dashed border-zinc-300 hover:border-yellow-400 bg-zinc-50 hover:bg-yellow-50/50 rounded-xl p-10 text-center transition-all cursor-pointer group"
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
