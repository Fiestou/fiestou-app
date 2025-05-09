import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { UserType } from "@/src/models/user";
import { StoreType } from "@/src/models/store";
import { getZipCode, justNumber } from "@/src/helper";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { Element } from "@/src/store/filter";

type SelectOption = {
    name: string | React.ReactNode;
    value: string;
    disabled?: boolean;
};

const formatOptions = (elements: Element[]): SelectOption[] => {
    return [
        { name: 'Selecione um segmento', value: '' },
        ...elements.map(element => ({
            name: (
                <div className="flex items-center gap-2">
                    {element.icon && (
                        <img
                            src={element.icon}
                            alt={element.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    )}
                    {element.name}
                </div>
            ),
            value: element.id.toString()
        }))
    ];
};

const FormInitialType = {
    sended: false,
    loading: false,
    redirect: "acesso",
};

export default function Cadastro({ preUser }: { preUser: UserType }) {
    const api = new Api();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState(FormInitialType);
    const [user, setUser] = useState(preUser);
    const [store, setStore] = useState({} as StoreType);
    const [elements, setElements] = useState<Element[]>([]);

    type ApiResponse<T = any> = {
        response: boolean;
        data: T;
        elements?: {
            id: number;
            name: string;
            icon: string;
        }[];
    };

    useEffect(() => {
        const fetchElements = async () => {
            try {
                const response = await api.call<ApiResponse>({
                    method: 'post',
                    url: 'stores/complete-register', // Mantém o endpoint correto
                    data: { email: user.email }
                });
                console.log("Resposta da API:", response); // Adicionado console.log

                if (response.data?.elements) {
                    setElements(response.data.elements);
                    console.log("Elementos recebidos:", response.data.elements); // Adicionado console.log
                } else {
                  console.warn("Elementos não recebidos. Data:", response.data)
                }
            } catch (error) {
                console.error('Erro ao buscar segmentos:', error);
            }
        };

        if (user?.email) {
            fetchElements();
        }
    }, [user?.email]);

    const handleUser = (value: Object) => {
        setUser({ ...user, ...value });
    };

    const handleStore = (value: Object) => {
        setStore({ ...store, ...value });
    };

    const submitStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setForm({ ...form, loading: true });

        try {
            const request = await api.bridge<ApiResponse>({
                method: 'post',
                url: "stores/complete-register", // Mantém o endpoint correto
                data: { ...store, ...user }
            });
            console.log("Resposta do submitStep:", request); // Adicionado console.log

            if (request.response) {
                setStep(step + 1);
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
        } finally {
            setForm({ ...form, loading: false });
        }
    };

    const handleZipCode = async (zipCode: string) => {
        const location = await getZipCode(zipCode);

        if (!!location) {
            let address = store;
            address["zipCode"] = zipCode;
            address["street"] = location.logradouro;
            address["neighborhood"] = location.bairro;
            address["city"] = location.localidade;
            address["state"] = location.uf;
            address["country"] = "Brasil";
            handleStore(address);
        }
    };

    const backStep = (e: any) => {
        e.preventDefault();
        if (step == 1) {
            router.push({ pathname: "/parceiros/seja-parceiro" });
        } else {
            setStep(step - 1);
        }
    };

    return (
        <Template
            header={{
                template: "clean",
                position: "solid",
            }}
        >
            <div className="container-medium">
                <div className="grid grid-cols-4 py-6 md:py-20">
                    <div>
                        {step > 1 && step < 4 && (
                            <button type="button" onClick={backStep}>
                                <div className="flex items-center h-fit text-lg gap-2 text-zinc-900">
                                    <Icon icon="fa-long-arrow-left" />
                                    <div className="font-bold font-title">voltar</div>
                                </div>
                            </button>
                        )}
                    </div>
                    <div className="col-span-4 md:col-span-2">
                        <div className="max-w-md mx-auto">
                            {/* STEP1 */}
                            <div
                                className={step == 1 ? "block" : "absolute overflow-hidden h-0"}
                            >
                                <form
                                    onSubmit={(e: any) => {
                                        submitStep(e);
                                    }}
                                    method="POST"
                                >
                                    <div className="text-center mb-4 md:mb-10">
                                        <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                                            Sobre a sua empresa
                                        </h3>
                                        <div className="pt-2">
                                            Preencha as informações de cadastro da sua loja.
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <Label>CPF/CNPJ</Label>
                                        <Input
                                            onChange={(e: any) =>
                                                handleStore({ document: e.target.value })
                                            }
                                            name="documento"
                                            placeholder="00000000000"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>Nome fantasia</Label>
                                        <Input
                                            onChange={(e: any) =>
                                                handleStore({
                                                    title: e.target.value,
                                                    companyName: e.target.value,
                                                })
                                            }
                                            name="nome-fantasia"
                                            placeholder="O nome pelo qual a sua empresa é conhecida"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>Segmento</Label>
                                        <Select
                                            onChange={(e: any) => {
                                                const selected = elements.find(el => el.id.toString() === e.target.value);
                                                handleStore({
                                                    segment: selected?.name || '',
                                                    segmentId: selected?.id,
                                                });
                                            }}
                                            value={store?.segment ? elements.find(el => el.name === store.segment)?.id?.toString() : ""}
                                            name="segment"
                                            options={formatOptions(elements)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>Você possui serviço de entrega?</Label>
                                        <div className="flex mt-1 gap-4">
                                            <Label className="block w-full border p-3 rounded-md">
                                                <input
                                                    onChange={(e: any) =>
                                                        handleStore({ hasDelivery: true })
                                                    }
                                                    name="entrega"
                                                    checked={store?.hasDelivery}
                                                    className="mr-2"
                                                    type="radio"
                                                />
                                                Sim
                                            </Label>
                                            <Label className="block w-full border p-3 rounded-md">
                                                <input
                                                    onChange={(e: any) =>
                                                        handleStore({ hasDelivery: false })
                                                    }
                                                    name="entrega"
                                                    checked={!store?.hasDelivery}
                                                    className="mr-2"
                                                    type="radio"
                                                />
                                                Não
                                            </Label>
                                        </div>
                                    </div>

                                    <div className="grid mt-8">
                                        <Button loading={form.loading}>Avançar</Button>
                                    </div>
                                </form>
                                <div className="text-center pt-4 text-sm">Etapa 1 de 3</div>
                            </div>

                            {/* STEP2 */}
                            <div
                                className={step == 2 ? "block" : "absolute overflow-hidden h-0"}
                            >
                                <form
                                    onSubmit={(e: any) => {
                                        submitStep(e);
                                    }}
                                >
                                    <div className="text-center mb-4 md:mb-10">
                                        <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                                            Endereço da sua empresa
                                        </h3>
                                        <div className="pt-2">Endereço da sua empresa</div>
                                    </div>

                                    <div className="form-group">
                                        <Label>CEP</Label>
                                        <Input
                                            required
                                            onChange={(e: any) => handleZipCode(e.target.value)}
                                            name="cep"
                                            placeholder="00000-000"
                                        />
                                    </div>

                                    <div className="flex gap-8">
                                        <div className="w-full form-group">
                                            <Label>Endereço</Label>
                                            <Input
                                                readonly
                                                name="endereco"
                                                value={store?.street}
                                                placeholder="Ex: Avenida Brasil"
                                            />
                                        </div>
                                        <div className="w-[10rem] form-group">
                                            <Label>Número</Label>
                                            <Input
                                                onChange={(e: any) =>
                                                    handleStore({ number: justNumber(e.target.value) })
                                                }
                                                required
                                                name="numero"
                                                value={store?.number}
                                                placeholder="Ex: 123"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="form-group">
                                            <Label>Bairro</Label>
                                            <Input
                                                readonly
                                                name="bairro"
                                                value={store?.neighborhood}
                                                placeholder="Ex: Centro"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <Label>Complemento (Opcional)</Label>
                                            <Input
                                                onChange={(e: any) =>
                                                    handleStore({ complement: e.target.value })
                                                }
                                                value={store?.complement}
                                                name="complemento"
                                                placeholder="Ex: Sala 1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="form-group">
                                            <Label>Estado</Label>
                                            <Input
                                                readonly
                                                name="estado"
                                                value={store?.state}
                                                placeholder="UF"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <Label>Cidade</Label>
                                            <Input
                                                readonly
                                                name="cidade"
                                                value={store?.city}
                                                placeholder="Cidade do seu negócio"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid mt-8">
                                        <Button loading={form.loading}>Avançar</Button>
                                    </div>
                                </form>

                                <div className="text-center pt-4 text-sm">Etapa 2 de 3</div>
                            </div>

                            {/* STEP3 */}
                            <div
                                className={step == 3 ? "block" : "absolute overflow-hidden h-0"}
                            >
                                <form
                                    onSubmit={(e: any) => {
                                        submitStep(e);
                                    }}
                                >
                                    <div className="text-center mb-4 md:mb-10">
                                        <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                                            Sobre o dono
                                        </h3>
                                        <div className="pt-2">
                                            Preencha as informações de cadastro da sua loja.
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <Label>Nome completo</Label>
                                        <Input
                                            required
                                            onChange={(e: any) =>
                                                handleUser({ name: e.target.value })
                                            }
                                            value={user.name ?? ""}
                                            name="nome"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>E-mail</Label>
                                        <Input
                                            readonly
                                            name="email"
                                            type="email"
                                            value={user.email ?? ""}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>Celular (com DDD)</Label>
                                        <Input readonly name="celular" value={user?.phone ?? ""} />
                                    </div>

                                    <div className="form-group">
                                        <Label>CPF</Label>
                                        <Input
                                            required
                                            onChange={(e: any) =>
                                                handleUser({ cpf: justNumber(e.target.value) })
                                            }
                                            name="cpf"
                                            value={user?.cpf ?? ""}
                                        />
                                    </div>

                                    <div className="grid mt-8">
                                        <Button loading={form.loading}>Avançar</Button>
                                    </div>
                                </form>
                                <div className="text-center pt-4 text-sm">Etapa 3 de 3</div>
                            </div>

                            {/* STEP4 */}
                            <div
                                className={step == 4 ? "block" : "absolute overflow-hidden h-0"}
                            >
                                <div className="text-center mb-4 md:mb-10">
                                    <div className="relative text-6xl mb-6 text-yellow-300">
                                        <Icon icon="fa-thumbs-up" />
                                        <Icon
                                            icon="fa-thumbs-up"
                                            type="fa"
                                            className="text-yellow-300 text-5xl absolute bottom-0 left-1/2 -translate-x-1/2 mb-1 opacity-50"
                                        />
                                    </div>
                                    <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                                        Cadastro realizado :)
                                    </h3>
                                    <div className="pt-2 text-xl font-bold text-zinc-900">
                                        Confira os próximos passos.
                                    </div>

                                    <div className="grid gap-6 my-8">
                                        <div className="flex text-left gap-4">
                                            <div>
                                                <Icon
                                                    icon="fa-check"
                                                    type="fa"
                                                    className="text-yellow-400"
                                                />
                                            </div>
                                            <div className="w-full">
                                                Analisaremos o seu cadastro. Normalmente respondemos em
                                                até 1 dia.
                                            </div>
                                        </div>

                                        <div className="flex text-left gap-4">
                                            <div>
                                                <Icon
                                                    icon="fa-check"
                                                    type="fa"
                                                    className="text-yellow-400"
                                                />
                                            </div>
                                            <div className="w-full">
                                                Você receberá confirmação por e-mail junto com o
                                                contrato.
                                            </div>
                                        </div>
                                        <div className="flex text-left gap-4">
                                            <div>
                                                <Icon
                                                    icon="fa-check"
                                                    type="fa"
                                                    className="text-yellow-400"
                                                />
                                            </div>
                                            <div className="w-full">
                                                Depois de assinar o contrato, iremos te ajudar a
                                                configurar a sua loja
                                            </div>
                                        </div>
                                        <div className="flex text-left gap-4">
                                            <div>
                                                <Icon
                                                    icon="fa-check"
                                                    type="fa"
                                                    className="text-yellow-400"
                                                />
                                            </div>
                                            <div className="w-full">
                                                Para usar a loja você precisará escolher um dos planos.
                                            </div>
                                        </div>
                                        <div className="flex text-left gap-4">
                                            <div>
                                                <Icon
                                                    icon="fa-check"
                                                    type="fa"
                                                    className="text-yellow-400"
                                                />
                                            </div>
                                            <div className="w-full">
                                                Fique tranquilo, não possuímos fidelidade. Cancele o
                                                plano quando desejar.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid">
                                        <Link
                                            href="/"
                                            className="btn bg-yellow-300 relative text-zinc-900"
                                        >
                                            Confirmar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Template>
  );
}