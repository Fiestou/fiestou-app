import { Button, Input, Label } from "@/src/components/ui/form";
import ButtonTextIcon from "@/src/components/ui/buttonTextIcon";
import UserIcon from "@/src/icons/UserIcon";
import CompanyIcon from "@/src/icons/CompanyIcon";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { maskCPF, partialCPFOk, maskCNPJ, partialCNPJOk } from "@/src/components/utils/masks";
import * as React from "react";

interface Props {
  store: any;
  setStore: (v: any) => void;
  backStep: () => void;
  nextStep: () => void;
}

export default function Step2PersonType({ store, setStore, backStep, nextStep }: Props) {
  const personType = store?.personType as "pf" | "pj" | undefined;

  const cpfDigits = (store?.cpf || "").replace(/\D/g, "");
  const cnpjDigits = (store?.cnpj || "").replace(/\D/g, "");

  const isValid = () => {
    if (!personType) return false;
    if (personType === "pf") return cpfDigits.length === 11;
    return cnpjDigits.length === 14 && (store?.razaoSocial || "").trim().length > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="w-full relative">
        <button className="absolute -left-36" type="button" onClick={backStep}>
          <div className="flex items-center h-fit text-lg gap-2 text-zinc-900">
            <Icon icon="fa-long-arrow-left" />
            <div className="font-bold font-title">voltar</div>
          </div>
        </button>
      </div>

      <div className="text-center mb-2">
        <h3 className="font-title text-zinc-900 font-bold text-4xl">Sobre seu negócio</h3>
        <p className="pt-2 text-zinc-500">Escolha o tipo e informe o documento.</p>
      </div>

      <div className="flex gap-6 justify-center items-center">
        <ButtonTextIcon
          title="Pessoa Física"
          icon={<UserIcon />}
          active={personType === "pf"}
          onSelect={() => setStore({ personType: "pf" })}
        />
        <ButtonTextIcon
          title="Pessoa Jurídica"
          icon={<CompanyIcon />}
          active={personType === "pj"}
          onSelect={() => setStore({ personType: "pj" })}
        />
      </div>

      {personType === "pf" && (
        <div className="form-group">
          <Label>CPF</Label>
          <Input
            inputMode="numeric"
            pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
            maxLength={14}
            placeholder="000.000.000-00"
            value={store?.cpf || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const masked = maskCPF(e.target.value);
              if (!partialCPFOk(masked)) return;
              setStore({ cpf: masked, document: masked.replace(/\D/g, "") });
            }}
            required
          />
        </div>
      )}

      {personType === "pj" && (
        <>
          <div className="form-group">
            <Label>CNPJ</Label>
            <Input
              inputMode="numeric"
              pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
              maxLength={18}
              placeholder="00.000.000/0000-00"
              value={store?.cnpj || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const masked = maskCNPJ(e.target.value);
                if (!partialCNPJOk(masked)) return;
                setStore({ cnpj: masked, document: masked.replace(/\D/g, "") });
              }}
              required
            />
          </div>
          <div className="form-group">
            <Label>Razão Social</Label>
            <Input
              placeholder="Nome registrado da empresa"
              value={store?.razaoSocial || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStore({ razaoSocial: e.target.value })
              }
              required
            />
          </div>
        </>
      )}

      <div className="flex justify-between mt-4">
        <Button className="w-full" type="submit" disable={!isValid()}>
          Avançar
        </Button>
      </div>

      <div className="text-center pt-2 text-sm text-zinc-400">Etapa 2 de 3</div>
    </form>
  );
}
