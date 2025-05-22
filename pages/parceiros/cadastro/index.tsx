import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { UserType } from "@/src/models/user";
import { StoreType } from "@/src/models/store";
import { getZipCode, justNumber } from "@/src/helper";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { Element } from "@/src/store/filter";
import { formatCpfCnpj } from "../../cadastre-se/components/FormMasks";

interface PreUserDataResponse {
    response: boolean;
    preUser: {
        email: string;
        person: string;
        name: string | null;
        document?: string | null;
    } | null;
    elements: Element[];
    message?: string;
}

type CompleteRegisterApiResponse = {
    response: boolean;
    data?: StoreType;
    groups?: any[];
    elements?: Element[];
    error?: string;
};

type SelectOption = {
    value: string;
    name: string | React.ReactNode;
    disabled?: boolean;
    icon?: string;
};

const FormInitialType = {
    sended: false,
    loading: false,
    redirect: "acesso",
};

export default function Cadastro() {
    const api = new Api();
    const router = useRouter();
    const { ref } = router.query;

    const [step, setStep] = useState(1);
    const [form, setForm] = useState(FormInitialType);
    const [store, setStore] = useState<StoreType>({} as StoreType);
    const [elements, setElements] = useState<Element[]>([]);
    const [preUser, setPreUser] = useState<{
        email: string;
        person: string;
        name: string | null;
        document?: string | null;
    } | null>(null);
    const [loadingPreUser, setLoadingPreUser] = useState(true);
    const [preUserError, setPreUserError] = useState<string | null>(null);
    const [maskedDocument, setMaskedDocument] = useState('');

    useEffect(() => {
        if (preUser?.document) {
            setMaskedDocument(formatCpfCnpj(preUser.document));
            handleStore({ document: preUser.document });
        }
    }, [preUser?.document]);
   
    useEffect(() => {
        const fetchPreUserData = async () => {
            if (ref && typeof ref === 'string') {
                try {
                    setLoadingPreUser(true);
                    const response = await api.bridge<PreUserDataResponse>({
                        method: 'get',
                        url: `auth/pre-register/${ref}`,
                    });
                    
                    if (response.response && response.preUser) {
                        setPreUser(response.preUser);
                        setElements(response.elements || []);                       
                        setStore(prevStore => ({
                            ...prevStore,
                            email: response.preUser?.email || '',
                        }));
                        setPreUserError(null);
                    } else {
                        console.warn("Erro ao buscar dados do preUser ou hash inválido:", response.message);
                        setPreUserError(response.message || "Hash inválido ou dados de pré-registro não encontrados.");
                        setPreUser(null);
                    }
                } catch (error) {
                    console.error("Erro na chamada da API para buscar dados do preUser:", error);
                    setPreUserError("Erro ao carregar dados de pré-registro. Verifique o link e tente novamente.");
                    setPreUser(null);
                } finally {
                    setLoadingPreUser(false);
                }
            } else {
                console.warn("Hash não encontrado na query string.");
                setPreUserError("Link de registro inválido ou ausente. Verifique o URL.");
                setPreUser(null);
                setLoadingPreUser(false);
            }
        };
        
        if (ref && preUser === null && preUserError === null) {
            fetchPreUserData();
        }
    }, [ref, api, preUser, preUserError]);

    const handleUser = (value: Partial<{
        email: string;
        person: string;
        name: string | null;
        document?: string | null;
    }>) => {
        setPreUser(prevUser => {
            const currentPreUser = prevUser || {};
            return { ...currentPreUser, ...value } as {
                email: string;
                person: string;
                name: string | null;
                document?: string | null;
            };
        });
    };

    const handleStore = (value: Object) => {
        setStore(prevStore => ({ ...prevStore, ...value }));
    };

    const submitStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setForm({ ...form, loading: true });
        
        if (!preUser?.email) {
            console.error("Email do usuário não disponível para cadastro completo.");
            setForm({ ...form, loading: false });
            return;
        }

        try {
            const dataToSend = {
                email: preUser.email,
                document: store.document,
                companyName: store.companyName || store.title,
                hasDelivery: store.hasDelivery,               
                phone: store.phone,
                zipCode: store.zipCode,
                street: store.street,
                number: store.number,
                complement: store.complement,
                neighborhood: store.neighborhood,
                city: store.city,
                state: store.state,
                country: store.country,
                segment: store.segment,
            };
            
            const request = await api.bridge<CompleteRegisterApiResponse>({
                method: 'post',
                url: "stores/complete-register",
                data: dataToSend
            });

            if (request.response) {
                setStep(prevStep => prevStep + 1);
            } else {
                console.warn("Resposta da API indica falha no cadastro:", request.error);
                alert(`Erro no cadastro: ${request.error || "Ocorreu um erro desconhecido."}`);
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            alert("Ocorreu um erro ao tentar finalizar o cadastro. Tente novamente mais tarde.");
        } finally {
            setForm({ ...form, loading: false });
        }
    };

    const handleZipCode = async (zipCode: string) => {
        const location = await getZipCode(zipCode);

        if (!!location) {
            let address = { ...store };
            address["zipCode"] = zipCode;
            address["street"] = location.logradouro;
            address["neighborhood"] = location.bairro;
            address["city"] = location.localidade;
            address["state"] = location.uf;
            address["country"] = "Brasil";
            handleStore(address);
        } else {
            console.warn("CEP inválido ou não encontrado.");
        }
    };

    const backStep = (e: any) => {
        e.preventDefault();
        if (step == 1) {
            router.push({ pathname: "/parceiros/seja-parceiro" });
        } else {
            setStep(prevStep => prevStep - 1);
        }
    };
    
    const segmentOptions = useMemo(() => {
        const options: SelectOption[] = [
            { value: "", name: "Selecione um segmento", disabled: true },
            ...elements.map(element => ({
                value: element.id.toString(),
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
                        <span>{element.name}</span>
                    </div>
                ),
                disabled: false,
            }))
        ];
        return options;
    }, [elements]);
    
    useEffect(() => { }, [elements]);
    
    if (loadingPreUser) {
        return (
            <Template header={{ template: "clean", position: "solid" }}>
                <div className="container-medium py-20 text-center">
                    Carregando informações de pré-registro...
                </div>
            </Template>
        );
    }

    if (preUserError) {
        return (
            <Template header={{ template: "clean", position: "solid" }}>
                <div className="container-medium py-20 text-center text-red-600">
                    <p>{preUserError}</p>
                    <Link href="/parceiros/seja-parceiro">
                        <Button className="mt-4">Voltar para página de parceria</Button>
                    </Link>
                </div>
            </Template>
        );
    }
    
    if (!preUser) {
        return (
            <Template header={{ template: "clean", position: "solid" }}>
                <div className="container-medium py-20 text-center text-red-600">
                    <p>Não foi possível carregar os dados do usuário. O link pode ser inválido ou já foi utilizado.</p>
                    <Link href="/parceiros/seja-parceiro">
                        <Button className="mt-4">Voltar para página de parceria</Button>
                    </Link>
                </div>
            </Template>
        );
    }

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
                                        <Label>CPF ou CNPJ</Label>
                                        <Input
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const unmaskedValue = justNumber(e.target.value);
                                                if (unmaskedValue.length > 14)
                                                    return;                                                    
                                                const formattedValue = formatCpfCnpj(unmaskedValue);
                                                setMaskedDocument(formattedValue);
                                                handleStore({ document: unmaskedValue });
                                            }}
                                            name="documento"
                                            placeholder="Informe o documento"
                                            required
                                            value={maskedDocument}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>Nome fantasia</Label>
                                        <Input
                                            onChange={(e: any) => {
                                                const value = e.target.value;
                                                handleStore({
                                                    title: value,
                                                    companyName: value,
                                                });
                                            }}
                                            name="nome-fantasia"
                                            placeholder="O nome pelo qual a sua empresa é conhecida"
                                            required
                                            value={store?.title || ""}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>Segmento</Label>
                                        <Select
                                            onChange={(e: any) => {
                                                if (!e.target.value) return;
                                                const selected = elements.find(el => el.id.toString() === e.target.value);
                                                handleStore({ segment: selected?.name });
                                            }}
                                            value={store?.segment?.toString() || ""}
                                            placeholder={!store?.segment ? "Selecione seu segmento" : ""}
                                            name="segment"
                                            options={elements.map((element) => ({
                                                name: element.name,
                                                value: element.id.toString(),
                                                icon: element.icon,
                                            }))}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            Segmento selecionado: {elements.find(el => el.id === Number(store?.segment))?.name || "Nenhum"}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <Label>Você possui serviço de entrega?</Label>
                                        <div className="flex mt-1 gap-4">
                                            <Label className="block w-full border p-3 rounded-md">
                                                <input
                                                    onChange={(e: any) => {
                                                        handleStore({ hasDelivery: true });
                                                    }}
                                                    name="entrega"
                                                    checked={store?.hasDelivery === true}
                                                    className="mr-2"
                                                    type="radio"
                                                />
                                                Sim
                                            </Label>
                                            <Label className="block w-full border p-3 rounded-md">
                                                <input
                                                    onChange={(e: any) => {
                                                        handleStore({ hasDelivery: false });
                                                    }}
                                                    name="entrega"
                                                    checked={store?.hasDelivery === false}
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
                            <div
                                className={step == 2 ? "block" : "absolute overflow-hidden h-0"}
                            >
                                <form
                                    onSubmit={(e: any) => {
                                        submitStep(e);
                                    }}
                                    method="POST"
                                >
                                    <div className="text-center mb-4 md:mb-10">
                                        <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                                            Informações de contato
                                        </h3>
                                        <div className="pt-2">
                                            Precisamos de algumas informações para entrarmos em contato com você.
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <Label>Telefone</Label>
                                        <Input
                                            onChange={(e: any) => {
                                                handleStore({ phone: justNumber(e.target.value) });
                                            }}
                                            name="telefone"
                                            placeholder="(XX) XXXXX-XXXX"
                                            required
                                            value={store?.phone || ""}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>CEP</Label>
                                        <Input
                                            onBlur={(e: any) => {
                                                const zip = justNumber(e.target.value);
                                                handleZipCode(zip);
                                            }}
                                            onChange={(e: any) => {
                                                const value = justNumber(e.target.value);
                                                handleStore({ zipCode: value });
                                            }}
                                            name="cep"
                                            placeholder="00000-000"
                                            required
                                            value={store?.zipCode || ""}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <Label>Rua</Label>
                                        <Input
                                            onChange={(e: any) => {
                                                handleStore({ street: e.target.value });
                                            }}
                                            name="rua"
                                            placeholder="Rua, Avenida..."
                                            required
                                            value={store?.street || ""}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <Label>Número</Label>
                                            <Input
                                                onChange={(e: any) => {
                                                    handleStore({ number: e.target.value });
                                                }}
                                                name="numero"
                                                placeholder="Número"
                                                required
                                                value={store?.number || ""}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <Label>Complemento</Label>
                                            <Input
                                                onChange={(e: any) => {
                                                    handleStore({ complement: e.target.value });
                                                }}
                                                name="complemento"
                                                placeholder="Apto, Sala..."
                                                value={store?.complement || ""}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <Label>Bairro</Label>
                                        <Input
                                            onChange={(e: any) => {
                                                handleStore({ neighborhood: e.target.value });
                                            }}
                                            name="bairro"
                                            placeholder="Bairro"
                                            required
                                            value={store?.neighborhood || ""}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <Label>Cidade</Label>
                                            <Input
                                                onChange={(e: any) => {
                                                    handleStore({ city: e.target.value });
                                                }}
                                                name="cidade"
                                                placeholder="Cidade"
                                                required
                                                value={store?.city || ""}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <Label>Estado</Label>
                                            <Input
                                                onChange={(e: any) => {
                                                    handleStore({ state: e.target.value });
                                                }}
                                                name="estado"
                                                placeholder="Estado"
                                                required
                                                value={store?.state || ""}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid mt-8">
                                        <Button loading={form.loading}>Avançar</Button>
                                    </div>
                                </form>
                                <div className="text-center pt-4 text-sm">Etapa 2 de 3</div>
                            </div>
                            <div
                                className={step == 3 ? "block" : "absolute overflow-hidden h-0"}
                            >
                                <div className="text-center mb-4 md:mb-10">
                                    <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                                        Quase lá!
                                    </h3>
                                    <div className="pt-2">
                                        Revise os seus dados antes de finalizar o cadastro.
                                    </div>
                                </div>

                                <div className="py-4">
                                    <h5 className="font-bold text-lg text-zinc-900 mb-2">Dados da Empresa:</h5>
                                    <p><strong>CPF ou CNPJ:</strong> {store?.document}</p>
                                    <p><strong>Nome Fantasia:</strong> {store?.title}</p>
                                    <p><strong>Segmento:</strong> {elements.find(el => el.id === Number(store?.segment))?.name || "Não informado"}</p>
                                    <p><strong>Possui Entrega:</strong> {store?.hasDelivery ? 'Sim' : 'Não'}</p>
                                </div>

                                <div className="py-4">
                                    <h5 className="font-bold text-lg text-zinc-900 mb-2">Informações de Contato:</h5>
                                    <p><strong>Telefone:</strong> {store?.phone}</p>
                                    <p><strong>Endereço:</strong> {store?.street}, {store?.number} {store?.complement && ` - ${store?.complement}`} - {store?.neighborhood}, {store?.city} - {store?.state}, {store?.zipCode} - {store?.country}</p>
                                </div>

                                <div className="grid mt-8">
                                    <Button loading={form.loading} onClick={submitStep}>
                                        Finalizar Cadastro
                                    </Button>
                                </div>
                                <div className="text-center pt-4 text-sm">Etapa 3 de 3</div>
                            </div>
                            <div
                                className={step == 4 ? "block" : "absolute overflow-hidden h-0"}
                            >
                                <div className="text-center py-12">
                                    <Icon icon="fa-check-circle" />
                                    <h3 className="font-title text-zinc-900 font-bold text-3xl mt-4">
                                        Cadastro realizado com sucesso!
                                    </h3>
                                    <p className="mt-2">
                                        Em breve, nossa equipe entrará em contato para validar suas informações.
                                    </p>
                                    <div className="mt-6">
                                        <Link href="/acesso">
                                            <Button>Ir para a página de acesso</Button>
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