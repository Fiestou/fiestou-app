import FileInput from "@/src/components/ui/form/FileInputUI";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";

interface CoverSectionProps {
  form: any;
  handleStore: (data: any) => void;
  handleSubmitCover: (e: React.FormEvent) => void;
  handleCover: {
    preview: string | null;
    files?: File[];
  };
  handleCoverPreview: (e: any) => Promise<string | null>;
  handleCoverRemove: () => void;
  renderAction: (key: string) => JSX.Element;
}

export default function CoverSection({
  form,
  handleStore,
  handleSubmitCover,
  handleCover,
  handleCoverPreview,
  handleCoverRemove,
  renderAction,
}: CoverSectionProps) {
  return (
    <form
      onSubmit={handleSubmitCover}
      method="POST"
      encType="multipart/form-data"
      className="grid gap-2 border-b pb-8 mb-0"
    >
      <div className="flex items-center pb-2">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Imagem de capa
          </h4>
        </div>
        <div className="w-fit">{renderAction("cover")}</div>
      </div>

      {form.edit === "cover" ? (
        <FileInput
          name="cover"
          id="cover"
          onChange={async (e: void) =>
            handleStore({
              cover: { files: await handleCoverPreview(e) },
            })
          }
          aspect="aspect-[6/2.5]"
          loading={form.loading}
          remove={handleCoverRemove}
          preview={handleCover.preview ?? undefined}
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

      <div className="text-sm">
        Tamanho mínimo recomendado: 1024 x 480px — PNG ou JPEG
      </div>
    </form>
  );
}
