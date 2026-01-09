import { Button } from "@/src/components/ui/form";
import ButtonTextIcon from "@/src/components/ui/buttonTextIcon";
import UserIcon from "@/src/icons/UserIcon";
import CompanyIcon from "@/src/icons/CompanyIcon";
import Icon from "@/src/icons/fontAwesome/FIcon"; // ← para o voltar de cima
import * as React from "react";

interface Props {
  store: any;
  setStore: (v: any) => void;
  backStep: () => void;
  nextStep: () => void; // decide PF/PJ no pai
}

export default function Step2PersonType({ store, setStore, backStep, nextStep }: Props) {
  const personType = store?.personType as "pf" | "pj" | undefined;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (personType) nextStep();
      }}
      className="flex flex-col gap-6"
    >
      {/* Voltar de cima (igual ao seu snippet) */}
      <div className="w-full relative ">
        <button className="absolute -left-36" type="button" onClick={backStep}>
          <div className="flex items-center h-fit text-lg gap-2 text-zinc-900">
            <Icon icon="fa-long-arrow-left" />
            <div className="font-bold font-title">voltar</div>
          </div>
        </button>
      </div>

      <div className="text-center mb-6 md:mb-10">
        <h3 className="font-title text-zinc-900 font-bold text-4xl">Sobre seu negócio</h3>
        <p className="pt-2">Preencha as informações de cadastro da sua loja.</p>
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

      <div className="flex justify-between mt-8">
        <Button className="w-full" type="submit" disable={!personType}>
          Avançar
        </Button>
      </div>

      <div className="text-center pt-4 text-sm">Etapa 2 de 3</div>
    </form>
  );
}
