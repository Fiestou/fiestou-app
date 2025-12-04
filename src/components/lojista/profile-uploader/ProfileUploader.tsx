import FileInput from "@/src/components/ui/form/FileInputUI";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface ProfileUploaderProps {
  form: {
    edit: string;
    loading: boolean;
  };

  handleSubmitProfile: (e: any) => void;
  handleStore: (value: any) => void;

  handleProfilePreview: (e: any) => Promise<any>;
  handleProfileRemove: (e: any) => void;

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
  return (
    <form
      onSubmit={(e: any) => handleSubmitProfile(e)}
      method="POST"
      acceptCharset="UTF-8"
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
              onChange={async (e: any) => {
                handleStore({
                  profile: {
                    files: await handleProfilePreview(e),
                  },
                });
              }}
              rounded
              placeholder="Abrir"
              aspect="aspect-square"
              loading={form.loading}
              remove={(e: any) => handleProfileRemove(e)}
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
