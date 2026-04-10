import { Button, Input, Label } from "@/src/components/ui/form";
import { formatName } from "@/src/components/utils/FormMasks";

interface Props {
  preUser: { name: string; email: string; phone: string } | null;
  store: any;
  setStore: (value: any) => void;
  nextStep: () => void;
}

function splitFullName(fullName: string) {
  const normalized = String(fullName ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) return { firstName: "", lastName: "" };
  const parts = normalized.split(" ");
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function joinFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
}

export default function Step1UserData({ preUser, store, setStore, nextStep }: Props) {
  const currentName = store?.name ?? preUser?.name ?? "";
  const { firstName, lastName } = splitFullName(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mb-10">
        <h3 className="font-title text-zinc-900 font-bold text-4xl">Vamos começar!</h3>
        <p className="pt-2 text-zinc-500">Confirme seu nome. O restante você completa depois no painel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-group">
          <Label>Nome</Label>
          <Input
            value={firstName}
            onChange={(e: any) =>
              setStore({ name: joinFullName(formatName(e.target.value), lastName) })
            }
            placeholder="Seu nome"
            autoComplete="given-name"
            required
          />
        </div>

        <div className="form-group">
          <Label>Sobrenome</Label>
          <Input
            value={lastName}
            onChange={(e: any) =>
              setStore({ name: joinFullName(firstName, formatName(e.target.value)) })
            }
            placeholder="Seu sobrenome"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div className="grid mt-8">
        <Button type="submit">Avançar</Button>
      </div>
      <div className="text-center pt-4 text-sm text-zinc-400">Etapa 1 de 3</div>
    </form>
  );
}
