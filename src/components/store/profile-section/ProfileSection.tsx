import FileInput from "@/src/components/ui/form/FileInputUI";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";

interface ProfileSectionProps {
  form: any;
  handleStore: (data: any) => void;

  handleSubmitProfile: (e: React.FormEvent) => void;

  handleProfile: {
    preview: string | null;
    files?: File[];
  };

  handleProfilePreview: (e: any) => Promise<string | null>;
  handleProfileRemove: () => void;

  renderAction: (key: string, actions?: any) => JSX.Element;
}

export default function ProfileSection({
  form,
  handleStore,
  handleSubmitProfile,
  handleProfile,
  handleProfilePreview,
  handleProfileRemove,
  renderAction,
}: ProfileSectionProps) {
  return (
    <form
      onSubmit={handleSubmitProfile}
      method="POST"
      encType="multipart/form-data"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center gap-6">
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
              remove={handleProfileRemove}
              preview={handleProfile.preview ?? undefined}
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
