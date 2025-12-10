import React from "react";
import { Select } from "../../ui/form";
import { Group } from "@/src/types/filtros"; // << CORRETO

interface StoreSegmentFormProps {
  store: any;
  form: any;
  name: string;
  groupOptions: Group[];
  storeTypes: Array<{ id: any; title: string }>;

  renderAction: (field: string) => React.ReactNode;

  handleSubmit: (e: React.FormEvent) => void;
  handleStore: (data: any) => void;
}

export default function StoreSegmentForm({
  store,
  form,
  groupOptions,
  storeTypes,
  renderAction,
  handleSubmit,
  handleStore,
}: StoreSegmentFormProps) {
  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
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
            options={
              groupOptions?.map((item) => ({
                name: item.name,
                value: item.id,
              })) ?? []
            }
          />
        ) : (
          storeTypes?.find((item) => item.id == store?.segment)?.title ??
          "Informe o segmento da sua loja"
        )}
      </div>
    </form>
  );
}
