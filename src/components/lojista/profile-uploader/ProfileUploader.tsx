import FileInput from "@/src/components/ui/form/FileInputUI";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface ProfileUploaderProps {
  form: {
    edit: string;
    loading: boolean;
  };

  handleSubmitProfile: (e: React.FormEvent) => void;
  handleStore: (value: any) => void;

  handleProfilePreview: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => Promise<string>;
  handleProfileRemove: () => void;

  handleProfile: {
    preview: string;
    remove: number;
  };

  renderAction: (
    type: string,
    opts?: { save?: string; edit?: string }
  ) => JSX.Element;
}

export default function ProfileUploader({
  form,
  handleSubmitProfile,
  handleStore,
  handleProfilePreview,
  handleProfileRemove,
  handleProfile,
  renderAction,
}: ProfileUploaderProps) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview separado
    const preview = await handleProfilePreview(e);

    // Enviar o File REAL pro store
    handleStore({
      profile: {
        files: file,
        preview,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmitProfile}
      method="POST"
      encType="multipart/form-data"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="w-[5rem]">
          {form.edit === "profile" ? (
            <FileInput
              name="profile"
              id="profile"
              onChange={handleChange}
              rounded
              aspect="aspect-square"
              loading={form.loading}
              remove={handleProfileRemove}
              preview={handleProfile.preview}
            />
          ) : (
            <>
              {handleProfile.preview ? (
                <div className="aspect-square border-zinc-900 border-2 relative rounded-full overflow-hidden">
                  <Img
                    src={handleProfile.preview}
                    className={`${
                      form.loading ? "blur-lg" : ""
                    } absolute object-cover h-full inset-0 w-full`}
                  />
                </div>
              ) : (
                <div className="aspect-square border-zinc-900 text-zinc-900 border-2 relative rounded-full overflow-hidden">
                  <Icon
                    icon="fa-user"
                    className="text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Ações */}
        <div className="w-fit">
          {renderAction("profile", {
            save: "Enviar",
            edit: "Alterar foto de perfil",
          })}
        </div>
      </div>
    </form>
  );
}
