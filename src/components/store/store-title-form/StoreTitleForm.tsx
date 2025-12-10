import { Input } from "@/src/components/ui/form";

export default function StoreTitleForm({
  editing,
  title,
  oldTitle,
  onChange,
  onSubmit,
  actions,
}: {
  editing: boolean;
  title: string;
  oldTitle: string;
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
            Nome do estabelecimento
          </h4>
        </div>
        <div className="w-fit">{actions}</div>
      </div>

      <div className="w-full">
        {editing ? (
          <Input
            onChange={(e: any) => onChange(e.target.value)}
            value={title}
            placeholder="Digite o nome aqui"
          />
        ) : (
          oldTitle || "Informe o nome da sua loja"
        )}
      </div>
    </form>
  );
}
