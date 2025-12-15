import { TextArea } from "@/src/components/ui/form";

export default function StoreDescriptionForm({
  editing,
  description,
  oldDescription,
  onChange,
  onSubmit,
  actions,
}: {
  editing: boolean;
  description: string;
  oldDescription: string;
  onChange: (value: string) => void;
  onSubmit: (e: any) => void;
  actions: React.ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Descrição
          </h4>
        </div>
        <div className="w-fit">{actions}</div>
      </div>

      <div className="w-full">
        {editing ? (
          <TextArea
            onChange={(e: any) => onChange(e.target.value)}
            value={description}
            placeholder="Digite sua descrição aqui"
          />
        ) : (
          oldDescription || "Insira uma descrição para sua loja"
        )}
      </div>
    </form>
  );
}
