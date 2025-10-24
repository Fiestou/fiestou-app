import { Button, Input, Label } from "@/src/components/ui/form";
import { maskDate, partialDateOk, maskCPF, partialCPFOk } from "@/src/components/utils/masks";

interface Props {
  preUser: { name: string; email: string; phone: string } | null;
  store: any;
  setStore: (value: any) => void;
  nextStep: () => void;
}

export default function Step1UserData({ preUser, store, setStore, nextStep }: Props) {

  const maskCEP = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => (p2 ? `${p1}-${p2}` : p1));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const defaults = {
          street: "Não Preenchido",
          number: "Não Preenchido",
          neighborhood: "Não Preenchido",
          complement: "Não Preenchido",
          state: "Não Preenchido",
          city: "Não Preenchido",
          zipcode: "Não Preenchido",
          referencePoint: "Não Preenchido",
        };

        const withDefaults = Object.fromEntries(
          Object.entries(defaults).map(([k, v]) => [k, store?.[k]?.toString().trim() || v])
        );

        setStore({ ...store, ...withDefaults });
        nextStep();
      }}
    >
      <div className="text-center mb-10">
        <h3 className="font-title text-zinc-900 font-bold text-4xl">Cadastro de parceiro</h3>
        <p className="pt-2">Preencha as informações de cadastro da sua loja.</p>
      </div>

      <div className="form-group">
        <Label>Nome completo</Label>
        <Input
          name="nome"
          value={store?.name ?? preUser?.name ?? ""}
          onChange={(e) => setStore({ name: e.target.value })}
          placeholder="Nome completo"
          required
        />
      </div>

      <div className="form-group">
        <Label>Data de nascimento</Label>
        <Input
          name="birth"
          inputMode="numeric"
          pattern="\d{2}/\d{2}/\d{4}"
          maxLength={10}
          placeholder="DD/MM/AAAA"
          value={store?.birth || ""}
          onChange={(e) => {
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
          name="cpf"
          inputMode="numeric"
          pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
          maxLength={14}
          placeholder="000.000.000-00"
          value={store?.cpf || ""}
          onChange={(e) => {
            const masked = maskCPF(e.target.value);
            if (!partialCPFOk(masked)) return;
            const digits = masked.replace(/\D/g, "");
            setStore({ cpf: masked, document: digits });
          }}
          required
        />
      </div>

      {/* Endereço */}
      <div className="form-group">
        <Label>Rua</Label>
        <Input
          value={store?.street || ""}
          onChange={(e) => setStore({ street: e.target.value })}
          placeholder="Ex.: Av. Brasil"
        />
      </div>

      <div className="form-group grid grid-cols-2 gap-4">
        <div>
          <Label>Número</Label>
          <Input
            value={store?.number || ""}
            onChange={(e) => setStore({ number: e.target.value })}
            placeholder="Ex.: 123"
          />
        </div>
        <div>
          <Label>Bairro</Label>
          <Input
            value={store?.neighborhood || ""}
            onChange={(e) => setStore({ neighborhood: e.target.value })}
            placeholder="Ex.: Centro"
          />
        </div>
      </div>

      <div className="form-group">
        <Label>Complemento</Label>
        <Input
          value={store?.complement || ""}
          onChange={(e) => setStore({ complement: e.target.value })}
          placeholder="Apto, bloco, sala…"
        />
      </div>

      <div className="form-group grid grid-cols-2 gap-4">
        <div>
          <Label>Cidade</Label>
          <Input
            value={store?.city || ""}
            onChange={(e) => setStore({ city: e.target.value })}
            placeholder="Cidade"
          />
        </div>
        <div>
          <Label>Estado</Label>
          <Input
            value={store?.state || ""}
            onChange={(e) => setStore({ state: e.target.value })}
            placeholder="UF"
          />
        </div>
      </div>

      <div className="form-group grid grid-cols-2 gap-4">
        <div>
          <Label>CEP</Label>
          <Input
            inputMode="numeric"
            pattern="\d{5}-\d{3}"
            maxLength={9}
            placeholder="00000-000"
            value={store?.zipcode || ""}
            onChange={(e) => setStore({ zipcode: maskCEP(e.target.value) })}
          />
        </div>
        <div>
          <Label>Ponto de referência</Label>
          <Input
            value={store?.referencePoint || ""}
            onChange={(e) => setStore({ referencePoint: e.target.value })}
            placeholder="Perto de…"
          />
        </div>
      </div>

      <div className="grid mt-8">
        <Button type="submit">Avançar</Button>
      </div>
      <div className="text-center pt-4 text-sm">Etapa 1 de 3</div>
    </form>
  );
}