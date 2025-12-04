import React from "react";
import { Input } from "@/src/components/ui/form";

type FormBusinessProps = {
  form: {
    edit: string;
    loading?: boolean;
  };
  store: {
    document?: string;
    companyName?: string;
  } | null;
  oldStore?: {
    document?: string;
    companyName?: string;
  } | null;
  handleStore: (data: { document?: string; companyName?: string }) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  renderAction: (key: string) => React.ReactNode;
  justNumber: (value: string) => string;
};

// --- máscara de CNPJ ---
function maskCNPJ(value: string) {
  const v = value.replace(/\D/g, "");
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

export default function FormBusiness({
  form,
  store,
  oldStore,
  handleStore,
  handleSubmit,
  renderAction,
  justNumber,
}: FormBusinessProps) {
  const cnpjValue = store?.document ? maskCNPJ(store.document) : "";

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Empresa
          </h4>
        </div>
        <div className="w-fit">{renderAction("business")}</div>
      </div>

      <div className="w-full">
        {form.edit === "business" ? (
          <div className="grid gap-2">
            {/* CNPJ */}
            <Input
              name="cnpj"
              onChange={(e) =>
                handleStore({
                  document: justNumber(e.target.value),
                })
              }
              value={cnpjValue}
              required
              placeholder="CNPJ: 00.000.000/0000-00"
            />

            {/* Nome jurídico */}
            <Input
              name="nome"
              onChange={(e) => handleStore({ companyName: e.target.value })}
              value={store?.companyName ?? ""}
              required
              placeholder="Nome jurídico"
            />
          </div>
        ) : store?.document || store?.companyName ? (
          <>
            <div>CNPJ: {maskCNPJ(store?.document ?? "")}</div>
            <div>Nome jurídico: {store?.companyName}</div>
          </>
        ) : (
          "Insira os dados da empresa"
        )}
      </div>
    </form>
  );
}
