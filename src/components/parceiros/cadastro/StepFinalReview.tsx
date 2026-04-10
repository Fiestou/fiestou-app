import Image from "next/image";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { formatName } from "@/src/components/utils/FormMasks";
import Icon from "@/src/icons/fontAwesome/FIcon";
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
}

export default function StepFinalReview({
  store,
  setStore,
  elements,
  submitStore,
  backStep,
}: Props) {
  const selectOptions = React.useMemo(
    () => [
      { value: "", name: "Selecione um segmento", disabled: true },
      ...elements.map((el) => ({ value: el.id.toString(), name: el.name })),
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
      {backStep && (
        <div className="w-full relative">
          <button className="absolute -left-36" type="button" onClick={backStep}>
            <div className="flex items-center h-fit text-lg gap-2 text-zinc-900">
              <Icon icon="fa-long-arrow-left" />
              <div className="font-bold font-title">voltar</div>
            </div>
          </button>
        </div>
      )}

      <div className="text-center mb-4 md:mb-10">
        <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">Quase lá!</h3>
        <div className="pt-2 text-zinc-500">Dê um nome à sua loja e escolha o segmento.</div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submitStore(e); }}>
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

          {selectedSegment && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              {selectedSegment?.icon && (
                <Image
                  src={selectedSegment.icon}
                  alt={selectedSegment.name}
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <span>Segmento selecionado: {selectedSegment.name}</span>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          <strong>Importante:</strong> sua loja e seus produtos só ficarão visíveis para clientes após você completar todos os dados no painel e confirmar sua conta no Pagar.me.
        </div>

        <Button className="w-full" type="submit" disable={store?.__loading}>
          Finalizar Cadastro
        </Button>
      </form>

      <div className="text-center pt-4 text-sm text-zinc-400">Etapa 3 de 3</div>
    </div>
  );
}
