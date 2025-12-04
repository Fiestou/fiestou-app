import { FC } from "react";
import { TextArea } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/form";

interface StoreFormDescriptionProps {
  form: {
    edit: string;
  };
  store: any;
  oldStore: any;
  renderAction: (field: string) => JSX.Element;
  handleStore: (data: any) => void;
  handleSubmit: (e: any) => void;
}

const StoreFormDescription: FC<StoreFormDescriptionProps> = ({
  form,
  store,
  oldStore,
  renderAction,
  handleStore,
  handleSubmit,
}) => {
  return (
    <form
      onSubmit={(e: any) => handleSubmit(e)}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Descrição
          </h4>
        </div>
        <div className="w-fit">{renderAction("description")}</div>
      </div>

      <div className="w-full">
        {form.edit === "description" ? (
          <TextArea
            onChange={(e: any) => handleStore({ description: e.target.value })}
            value={store?.description}
            placeholder="Digite sua descrição aqui"
          />
        ) : (
          oldStore?.description ?? "Insira uma descrição para sua loja"
        )}
      </div>
    </form>
  );
};

export default StoreFormDescription;
