import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "../../utils/ImgBase";
import { useState } from "react";

interface MediaFieldType {
  name?: string;
  aspect?: string;
  onChange?: Function;
  id?: string;
  preview?: string;
  loading?: boolean;
  placeholder?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  readonly?: boolean;
  min?: string | number;
  max?: string | number;
  size?: number;
  rounded?: boolean;
}

export default function MediaField(attr: MediaFieldType) {
  const [handle, setHandle] = useState({
    remove: 0,
    preview: attr?.preview ?? "",
  });

  const handleRemove = async (e: any) => {
    setHandle({
      preview: "",
      remove: handle.remove,
    });

    if (!!attr?.onChange) attr?.onChange(handle);
  };

  const handlePreview = async (e: any) => {
    const file = e.target.files[0];

    const base64: any = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const fileData = { base64, fileName: file.name };

    setHandle({ ...handle, preview: fileData.base64 });

    if (!!attr?.onChange) attr?.onChange(fileData);

    return fileData;
  };

  return (
    <div
      className={`group ${attr?.aspect ?? "aspect-[5/2]"} ${
        attr?.rounded ? "rounded-full" : "rounded-xl"
      } relative overflow-hidden bg-zinc-100`}
    >
      {!!handle?.preview ? (
        <>
          <Img
            src={handle?.preview}
            className={`${
              attr?.loading ? "blur-md" : ""
            } absolute object-contain h-full inset-0 w-full`}
          />
          {!attr?.loading && (
            <button
              type="button"
              onClick={(e) => handleRemove(e)}
              className={`${
                !!attr?.rounded
                  ? "bottom-0 left-1/2 -translate-x-1/2 mb-1 p-4"
                  : "top-0 right-0 m-3 p-5"
              } absolute bg-zinc-200 hover:bg-zinc-300 ease z-10 rounded-full`}
            >
              <Icon
                icon="fa-trash-alt"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </button>
          )}
        </>
      ) : (
        <>
          <div
            className={`${
              attr?.rounded ? "rounded-full" : "rounded-xl"
            } text-center border-2 border-dashed h-full border-zinc-300 flex items-center justify-center gap-4 p-6`}
          >
            <div>
              {attr?.placeholder ? (
                attr?.placeholder
              ) : (
                <>
                  <Icon icon="fa-image" className="text-7xl" />
                  <div>
                    Arraste uma imagem aqui ou <b>clique para buscar</b>
                  </div>
                </>
              )}
            </div>
          </div>

          <input
            name={attr?.name}
            id={attr?.id ?? attr?.name}
            type="file"
            placeholder={attr?.placeholder}
            className={`cursor-pointer absolute inset-0 w-full h-full opacity-0 ${
              attr?.errorMessage
                ? "border-red-500 placeholder-red-300"
                : "placeholder-zinc-300"
            }`}
            accept="image/png, image/gif, image/jpeg, image/webp"
            onChange={(e) => handlePreview(e)}
            {...(!!attr?.required ? { required: true } : {})}
          />
        </>
      )}

      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </div>
  );
}
