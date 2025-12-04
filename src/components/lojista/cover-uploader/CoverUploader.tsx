import FileInput from "@/src/components/ui/form/FileInputUI";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface CoverUploaderProps {
  form: {
    edit: string;
    loading: boolean;
  };
  handleSubmitCover: (e: any) => void;
  renderAction: (type: string) => JSX.Element;
  handleStore: (value: any) => void;
  handleCoverPreview: (e: any) => Promise<any>;
  handleCoverRemove: (e: any) => void;

  handleCover: {
    preview: string;
    remove: number;
  };
  storeCover: any;
}

export default function CoverUploader({
  form,
  handleSubmitCover,
  renderAction,
  handleStore,
  handleCoverPreview,
  handleCoverRemove,
  handleCover,
  storeCover,
}: CoverUploaderProps) {
  return (
    <form
      onSubmit={(e: any) => handleSubmitCover(e)}
      method="POST"
      acceptCharset="UTF-8"
      encType="multipart/form-data"
      className="grid gap-2 border-b pb-8 mb-0"
    >
      {/* Header */}
      <div className="flex items-center pb-2">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Imagem de capa
          </h4>
        </div>
        <div className="w-fit">{renderAction("cover")}</div>
      </div>

      {/* Upload or Preview */}
      {form.edit === "cover" ? (
        <FileInput
          name="cover"
          id="cover"
          onChange={async (e: any) => {
            handleStore({
              cover: {
                files: await handleCoverPreview(e),
              },
            });
          }}
          aspect="aspect-[6/2.5]"
          loading={form.loading}
          remove={(e: any) => handleCoverRemove(e)}
          preview={handleCover.preview}
        />
      ) : (
        <div className="aspect-[6/2.5] relative rounded-xl overflow-hidden bg-zinc-100">
          {!!handleCover.preview ? (
            <Img
              src={handleCover.preview}
              className={`${
                form.loading ? "blur-lg" : ""
              } absolute object-cover h-full inset-0 w-full`}
            />
          ) : (
            <Icon
              icon="fa-image"
              className="text-7xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25"
            />
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-sm">
        Tamanho mínimo recomendado: 1024 x 480px — Formatos recomendados: PNG,
        JPEG
      </div>
    </form>
  );
}
