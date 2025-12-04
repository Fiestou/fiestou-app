import React from "react";
import { Input } from "@/src/components/ui/form";

type StoreLocation = {
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  city?: string;
  state?: string;
  country?: string;
};

type FormLocationProps = {
  form: {
    edit: string;
    loading?: boolean;
  };
  store: StoreLocation | null;
  handleStore: (data: Partial<StoreLocation>) => void;
  handleZipCode: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  renderAction: (key: string) => React.ReactNode;
};

export default function FormLocation({
  form,
  store,
  handleStore,
  handleZipCode,
  handleSubmit,
  renderAction,
}: FormLocationProps) {
  return (
    <form
      onSubmit={handleSubmit}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      {/* Header */}
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Localização
          </h4>
        </div>
        <div className="w-fit">{renderAction("location")}</div>
      </div>

      <div className="w-full">
        {/* --- MODO EDIÇÃO --- */}
        {form.edit === "location" ? (
          <div className="grid gap-2">

            {/* CEP */}
            <Input
              name="cep"
              onChange={(e) => handleZipCode(e.target.value)}
              required
              value={store?.zipCode ?? ""}
              placeholder="CEP"
            />

            {/* Rua + Número */}
            <div className="flex gap-2">
              <div className="w-full">
                <Input
                  name="rua"
                  readOnly
                  required
                  value={store?.street ?? ""}
                  placeholder="Rua"
                />
              </div>

              <div className="w-[10rem]">
                <Input
                  name="numero"
                  onChange={(e) =>
                    handleStore({ number: e.target.value })
                  }
                  required
                  value={store?.number ?? ""}
                  placeholder="Número"
                />
              </div>
            </div>

            {/* Bairro + Complemento */}
            <div className="flex gap-2">
              <div className="w-full">
                <Input
                  name="bairro"
                  readOnly
                  required
                  value={store?.neighborhood ?? ""}
                  placeholder="Bairro"
                />
              </div>

              <div className="w-full">
                <Input
                  name="complemento"
                  onChange={(e) =>
                    handleStore({ complement: e.target.value })
                  }
                  value={store?.complement ?? ""}
                  placeholder="Complemento"
                />
              </div>
            </div>

            {/* Cidade + Estado */}
            <div className="flex gap-2">
              <div className="w-full">
                <Input
                  name="cidade"
                  readOnly
                  required
                  value={store?.city ?? ""}
                  placeholder="Cidade"
                />
              </div>

              <div className="w-[10rem]">
                <Input
                  name="estado"
                  readOnly
                  required
                  value={store?.state ?? ""}
                  placeholder="UF"
                />
              </div>
            </div>
          </div>
        ) : (

          /* --- MODO VISUALIZAÇÃO --- */
          store?.zipCode ? (
            <>
              <div>
                {store.street}, {store.number}
              </div>
              <div>
                {store.neighborhood} - {store.city} | {store.state}
              </div>
              <div>
                CEP: {store.zipCode} | {store.country}
              </div>
            </>
          ) : (
            "Informe a localização da sua loja"
          )
        )}
      </div>
    </form>
  );
}
