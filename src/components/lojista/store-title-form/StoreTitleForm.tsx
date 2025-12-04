import { Input } from "@/src/components/ui/form";

interface StoreTitleFormProps {
  form: {
    edit: string;
  };

  store: any;
  oldStore: any;

  handleSubmit: (e: any) => void;
  handleStore: (value: any) => void;

  renderAction: (type: string) => JSX.Element;
}

export default function StoreTitleForm({
  form,
  store,
  oldStore,
  handleSubmit,
  handleStore,
  renderAction,
}: StoreTitleFormProps) {
  return (
    <form
      onSubmit={(e: any) => handleSubmit(e)}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      {/* Header */}
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Nome do estabelecimento
          </h4>
        </div>
        <div className="w-fit">{renderAction("title")}</div>
      </div>

      {/* Content */}
      <div className="w-full">
        {form.edit === "title" ? (
          <Input
            onChange={(e: any) => handleStore({ title: e.target.value })}
            value={store?.title}
            placeholder="Digite o nome aqui"
          />
        ) : (
          oldStore?.title ?? "Informe o nome da sua loja"
        )}
      </div>
    </form>
  );
}
