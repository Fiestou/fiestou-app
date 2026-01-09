import { Button, Input, Label } from "@/src/components/ui/form";
import { maskCPF, partialCPFOk } from "@/src/components/utils/masks";


interface Props {
  store: any;
  setStore: (value: any) => void;
  nextStep: () => void;
  backStep: () => void;
}

export default function Step3PFAddress({ store, setStore, nextStep, backStep }: Props) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); nextStep(); }}
      className="flex flex-col gap-6"
    >
      <div className="text-center mb-10">
        <h3 className="font-title text-zinc-900 font-bold text-4xl">Seus dados (PF)</h3>
        <p className="pt-2">Preencha as informações de pessoa física.</p>
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
            setStore({ cpf: masked });
          }}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <Label>Cidade</Label>
          <Input
            value={store?.city || ""}
            onChange={(e) => setStore({ city: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <Label>Estado</Label>
          <Input
            value={store?.state || ""}
            onChange={(e) => setStore({ state: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-between mt-2">
        <Button variant="secondary" onClick={(e) => { e.preventDefault(); backStep(); }}>
          Voltar
        </Button>
        <Button type="submit">Avançar</Button>
      </div>

      <div className="text-center pt-4 text-sm">Etapa 3 de 4</div>
    </form>
  );
}
