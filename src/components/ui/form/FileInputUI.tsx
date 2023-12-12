import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "../../utils/ImgBase";

interface FileInputType {
  name?: string;
  aspect?: string;
  onChange?: Function;
  remove?: Function;
  id?: string;
  preview?: string;
  loading?: boolean;
  multiple?: boolean;
  placeholder?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  readonly?: boolean;
  min?: string | number;
  max?: string | number;
  size?: number;
  rounded?: boolean;
}

export default function FileInput(attr: FileInputType) {
  return (
    <div
      className={`group ${attr?.aspect ?? "aspect-[5/2]"} ${
        attr?.rounded ? "rounded-full" : "rounded-xl"
      } relative overflow-hidden bg-zinc-100`}
    >
      {!!attr?.preview ? (
        <>
          <Img
            src={attr?.preview}
            className={`${attr?.loading ? "blur-md" : ""}
              ${
                !!attr?.rounded ? "object-cover" : "object-contain"
              } absolute h-full inset-0 w-full`}
          />
          {!attr?.loading && (
            <button
              type="button"
              onClick={(e) => (!!attr?.remove ? attr?.remove(e) : {})}
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
                <span className="text-sm md:text-base">
                  {attr?.placeholder}
                </span>
              ) : (
                <>
                  <Icon icon="fa-image" className="text-4xl md:text-7xl" />
                  <div className="text-sm md:text-base">
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
            onChange={(e) => (!!attr?.onChange ? attr?.onChange(e) : {})}
            {...(!!attr?.multiple ? { multiple: true } : {})}
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
