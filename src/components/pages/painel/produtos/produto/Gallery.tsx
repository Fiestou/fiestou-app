import { Label } from "@/src/components/ui/form";
import FileInput from "@/src/components/ui/form/FileInputUI";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";

const formInitial = {
  sended: false,
  loading: false,
};

export default function Gallery({
  product,
  emitProduct,
}: {
  product?: number;
  emitProduct: Function;
}) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [placeholders, setPlaceholders] = useState(0 as number);
  const [deleting, setDeleting] = useState([] as Array<any>);
  const [handleGallery, setHandleGallery] = useState([] as Array<any>);

  const removeGalleryItem = async (media: any) => {
    setDeleting([...deleting, media.id]);

    let request: any = await api.bridge({
      url: `products/remove-gallery`,
      data: {
        id: product ?? "",
        medias: [media.id],
      },
    });

    setDeleting(deleting.filter((item: any) => item != media.id));
    setHandleGallery(handleGallery.filter((item: any) => item.id != media.id));
  };

  const submitGallery = async (e: any) => {
    setPlaceholders(e.target.files.length);

    let request: any = await api.bridge({
      url: `products/upload-gallery`,
      data: {
        product: product ?? "",
        medias: e.target.files,
      },
      opts: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    });

    const handle = request.data;

    emitProduct(handle.product);
    setHandleGallery([...handleGallery, ...handle.medias]);
    setPlaceholders(0);
  };

  const getGallery = async () => {
    let request: any = await api.bridge({
      method: "get",
      url: `products/gallery/${product}`,
    });

    console.log(request.data);

    setHandleGallery(request.data);
  };

  useEffect(() => {
    if (!!product) {
      getGallery();
    }
  }, [product]);

  return (
    <div>
      <Label>Fotos</Label>

      <div className="group aspect-[4/2] md:aspect-[8/2] relative">
        <div className="rounded-xl text-center border-2 border-dashed h-full border-zinc-300 bg-zinc-50 group-hover:bg-zinc-100 ease flex items-center justify-center gap-4 p-6">
          <div>
            <Icon icon="fa-image" className="text-4xl md:text-7xl" />
            <div className="text-sm md:text-base">
              Arraste uma imagem aqui ou <b>clique para buscar</b>
            </div>
          </div>
        </div>

        <input
          id=""
          name="files"
          type="FILE"
          className={`cursor-pointer absolute inset-0 w-full h-full opacity-0 placeholder-zinc-300`}
          accept="image/png, image/gif, image/jpeg, image/webp"
          onChange={(e: any) => submitGallery(e)}
          multiple
        />
      </div>

      <div className="grid gap-4 grid-cols-5 mt-4">
        {!!handleGallery.length &&
          handleGallery
            .filter((item) => !item.remove)
            .map((item: any, key: any) => (
              <div
                key={key}
                className={`${
                  deleting.includes(item.id) ? "animate-pulse" : ""
                } w-full group`}
              >
                <div className="relative rounded-md bg-zinc-100 overflow-hidden aspect-square">
                  <img
                    src={
                      !!item.base_url ? getImage(item, "thumb") : item.base64
                    }
                    className="absolute object-contain h-full inset-0 w-full"
                  />
                  {!deleting.includes(item.id) && (
                    <button
                      onClick={() => removeGalleryItem(item)}
                      className="opacity-0 group-hover:opacity-100 ease absolute top-0 right-0 m-1 p-3 rounded-full bg-zinc-200 hover:bg-red-600 text-zinc-500 hover:text-white"
                      type="button"
                    >
                      <Icon
                        icon="fa-times"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                    </button>
                  )}
                </div>
              </div>
            ))}

        {Array.from({ length: placeholders }).map((_, key: any) => (
          <div key={key} className={`animate-pulse w-full`}>
            <div className="relative rounded-md bg-zinc-100 aspect-square">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Icon icon="fa-spinner-third" className="animate-spin" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
