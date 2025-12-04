import { Select } from "../../ui/form";

interface SegmentFormProps {
  store: any;
  form: any;
  groupOptions: any[];
  storeTypes: any[];
  handleStore: (data: any) => void;
  handleSubmit: (e: any) => void;
  renderAction: (field: string) => React.ReactNode;
}

export default function SegmentForm({
  store,
  form,
  groupOptions,
  storeTypes,
  handleStore,
  handleSubmit,
  renderAction,
}: SegmentFormProps) {
  return (
    <form
      onSubmit={(e: any) => handleSubmit(e)}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Segmento
          </h4>
        </div>
        <div className="w-fit">{renderAction("segment")}</div>
      </div>

      <div className="w-full">
        {form.edit === "segment" ? (
          <Select
            onChange={(e: any) => handleStore({ segment: e.target.value })}
            value={store?.segment}
            placeholder="Selecione seu segmento"
            name="lojaTipo"
            options={groupOptions.map((item: any) => ({
              name: item.title,
              value: item.id,
            }))}
          />
        ) : (
          storeTypes.find((item) => item.id == store?.segment)?.title ??
          "Informe o segmento da sua loja"
        )}
      </div>
    </form>
  );
}
