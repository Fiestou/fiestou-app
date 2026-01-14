import { Button, Input, Label } from "@/src/components/ui/form";
import InfoBox from "@/src/components/ui/Infobox";
import { maskCNPJ, partialCNPJOk } from "@/src/components/utils/masks";
import QuestionIcon from "@/src/icons/QuestionIcon";
import Icon from "@/src/icons/fontAwesome/FIcon"; // ← botão voltar (topo)
import * as React from "react";

interface Props {
    store: any;
    setStore: (value: any) => void;
    nextStep: () => void;
    backStep: () => void;
}

export default function Step3PJBusiness({ store, setStore, nextStep, backStep }: Props) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                nextStep();
            }}
            className="flex flex-col gap-6"
        >
            {/* Voltar de cima */}
            <div className="w-full relative ">
                <button className="absolute -left-36" type="button" onClick={backStep}>
                    <div className="flex items-center h-fit text-lg gap-2 text-zinc-900">
                        <Icon icon="fa-long-arrow-left" />
                        <div className="font-bold font-title">voltar</div>
                    </div>
                </button>
            </div>

            <div className="text-center mb-10">
                <h3 className="font-title text-zinc-900 font-bold text-4xl">Sobre a sua empresa</h3>
                <p className="pt-2">Preencha as informações de cadastro da sua loja.</p>
            </div>

            <InfoBox
                title="Por que isso é importante?"
                subscription="Realizamos o pagamento aos fornecedores automaticamente por meio de split de pagamento, com o valor sendo creditado diretamente em sua conta. Saiba mais:"
                icon={QuestionIcon()}
            />

            <div className="form-group">
                <Label>CNPJ</Label>
                <Input
                    name="cnpj"
                    inputMode="numeric"
                    pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
                    maxLength={18}
                    placeholder="00.000.000/0000-00"
                    value={store?.cnpj || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const masked = maskCNPJ(e.target.value);
                        if (!partialCNPJOk(masked)) return;
                        setStore({ cnpj: masked });
                    }}
                    required
                />
            </div>

            <div className="form-group">
                <Label>Razão Social</Label>
                <Input
                    name="razaoSocial"
                    placeholder="Nome registrado da empresa"
                    value={store?.razaoSocial || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setStore({ razaoSocial: e.target.value })
                    }
                    required
                />
            </div>

            <div className="flex justify-between mt-2">
                <Button className="w-full" type="submit">Avançar</Button>
            </div>

            <div className="text-center pt-4 text-sm text-zinc-500">Etapa 3 de 4</div>
        </form>
    );
}
