import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { formatName } from "@/src/components/utils/FormMasks";
import Icon from "@/src/icons/fontAwesome/FIcon"; // ← ícone do voltar
import * as React from "react";

type Categorie = {
  id: number | string;
  name: string;
  icon?: string | null;
};

interface Props {
  store: any;
  setStore: (patch: any) => void;
  elements: Categorie[];
  submitStore: (e: React.FormEvent) => void;
  backStep?: () => void;
  stepLabel?: string;
  title?: string;
  subtitle?: string;
}

export default function StepFinalReview({
  store,
  setStore,
  elements,
  submitStore,
  backStep,
  stepLabel = "Etapa 3 de 3",
  title = "Quase lá!",
  subtitle = "Revise os seus dados antes de finalizar o cadastro.",
}: Props) {
  const selectOptions = React.useMemo(
    () => [
      { value: "", name: "Selecione um segmento", disabled: true },
      ...elements.map((el) => ({
        value: el.id.toString(),
        name: el.name,
      })),
    ],
    [elements]
  );

  const selectedSegment = React.useMemo(() => {
    const id = store?.segmentId ?? store?.segment;
    if (id == null || id === "") return null;
    return elements.find((el) => el.id.toString() === String(id)) ?? null;
  }, [elements, store?.segmentId, store?.segment]);

  return (
    <div className="block">
      {/* Voltar de cima */}
      {backStep && (
        <div className="w-full relative ">
          <button className="absolute -left-36" type="button" onClick={backStep}>
            <div className="flex items-center h-fit text-lg gap-2 text-zinc-900">
              <Icon icon="fa-long-arrow-left" />
              <div className="font-bold font-title">voltar</div>
            </div>
          </button>
        </div>
      )}

      <div className="text-center mb-4 md:mb-10">
        <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
          {title}
        </h3>
        <div className="pt-2">{subtitle}</div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitStore(e);
        }}
      >
        <div className="form-group">
          <Label>Nome da Sua Loja</Label>
          <Input
            name="nome-fantasia"
            placeholder="Nome da loja ou empresa"
            required
            value={store?.title || ""}
            onChange={(e) => {
              const value = formatName(e.target.value);
              setStore({ title: value, companyName: value });
            }}
          />
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <Label>Segmento</Label>
          <Select
            name="segment"
            value={
              store?.segmentId?.toString() ??
              (/^\d+$/.test(String(store?.segment ?? "")) ? String(store?.segment) : "")
            }
            options={selectOptions}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const val = e.target.value;
              if (!val) return;
              const found = elements.find((el) => el.id.toString() === val);
              setStore({ segmentId: val, segment: found?.name });
            }}
          />

          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            {selectedSegment?.icon && (
              <img
                src={selectedSegment.icon}
                alt={selectedSegment.name}
                className="w-4 h-4 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <span>Segmento selecionado: {selectedSegment?.name ?? "Nenhum"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <Label>Você possui serviço de entrega?</Label>
          <div className="flex mt-1 gap-4">
            <Label className="block w-full border p-3 rounded-md cursor-pointer">
              <input
                className="mr-2"
                type="radio"
                name="entrega"
                checked={store?.hasDelivery === true}
                onChange={() => setStore({ hasDelivery: true })}
              />
              Sim
            </Label>

            <Label className="block w-full border p-3 rounded-md cursor-pointer">
              <input
                className="mr-2"
                type="radio"
                name="entrega"
                checked={store?.hasDelivery === false}
                onChange={() => setStore({ hasDelivery: false })}
              />
              Não
            </Label>
          </div>
        </div>

        <Button className="w-full" type="submit" disable={store?.__loading}>
          Finalizar Cadastro
        </Button>
      </form>

      <div className="text-center pt-4 text-sm">{stepLabel}</div>
    </div>
  );
}
