import { Button, Input, Label } from "@/src/components/ui/form";
import { AddressFields } from "@/src/components/ui/AddressFields";
import { maskDate, partialDateOk, maskCPF, partialCPFOk } from "@/src/components/utils/masks";

interface Props {
  preUser: { name: string; email: string; phone: string } | null;
  store: any;
  setStore: (value: any) => void;
  nextStep: () => void;
}

const ADDRESS_DEFAULTS = {
  street: "Não Preenchido",
  number: "Não Preenchido",
  neighborhood: "Não Preenchido",
  complement: "Não Preenchido",
  state: "Não Preenchido",
  city: "Não Preenchido",
  zipcode: "Não Preenchido",
  referencePoint: "Não Preenchido",
};

export default function Step1UserData({ preUser, store, setStore, nextStep }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aplica defaults para campos vazios
    const withDefaults = Object.fromEntries(
      Object.entries(ADDRESS_DEFAULTS).map(([k, v]) => [k, store?.[k]?.toString().trim() || v])
    );

    setStore({ ...store, ...withDefaults });
    nextStep();
  };

  const handleAddressChange = (field: string, value: string) => {
    setStore({ [field]: value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mb-10">
        <h3 className="font-title text-zinc-900 font-bold text-4xl">Cadastro de parceiro</h3>
        <p className="pt-2">Preencha as informações de cadastro da sua loja.</p>
      </div>

      {/* Dados pessoais */}
      <div className="form-group">
        <Label>Nome completo</Label>
        <Input
          value={store?.name ?? preUser?.name ?? ""}
          onChange={(e: any) => setStore({ name: e.target.value })}
          placeholder="Nome completo"
          required
        />
      </div>

      <div className="form-group">
        <Label>Data de nascimento</Label>
        <Input
          inputMode="numeric"
          pattern="\d{2}/\d{2}/\d{4}"
          maxLength={10}
          placeholder="DD/MM/AAAA"
          value={store?.birth || ""}
          onChange={(e: any) => {
            const masked = maskDate(e.target.value);
            if (!partialDateOk(masked)) return;
            setStore({ birth: masked });
          }}
          required
        />
      </div>

      <div className="form-group">
        <Label>CPF</Label>
        <Input
          inputMode="numeric"
          pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
          maxLength={14}
          placeholder="000.000.000-00"
          value={store?.cpf || ""}
          onChange={(e: any) => {
            const masked = maskCPF(e.target.value);
            if (!partialCPFOk(masked)) return;
            setStore({ cpf: masked, document: masked.replace(/\D/g, "") });
          }}
          required
        />
      </div>

      {/* Endereço */}
      <AddressFields
        data={store}
        onChange={handleAddressChange}
        showReferencePoint={true}
      />

      <div className="grid mt-8">
        <Button type="submit">Avançar</Button>
      </div>
      <div className="text-center pt-4 text-sm">Etapa 1 de 3</div>
    </form>
  );
}
