import Api from "@/src/services/api";
import Template from "@/src/template";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { clean, getImage } from "@/src/helper";
import { formatPhone } from "@/pages/cadastre-se/components/FormMasks";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { formatName, validateEmail } from "@/src/components/utils/FormMasks";
import { preRegisterPartner, completePartnerRegister } from "@/src/services/partner";
import { maskCPF, partialCPFOk, maskCNPJ, partialCNPJOk } from "@/src/components/utils/masks";

export async function getStaticProps(ctx: any) {
    const api = new Api();
    let request: any = await api.content({ method: 'get', url: `become-partner` });
    const Partner = request?.data?.Partner ?? {};
    const Roles = request?.data?.Roles ?? {};
    const HeaderFooter = request?.data?.HeaderFooter ?? {};
    const DataSeo = request?.data?.DataSeo ?? {};
    const Scripts = request?.data?.Scripts ?? {};

    return {
        props: {
            Partner: Partner,
            Roles: Roles,
            HeaderFooter: HeaderFooter,
            DataSeo: DataSeo,
            Scripts: Scripts,
        },
    };
}

const FormInitialType = {
    sended: false,
    loading: false,
};

export default function SejaParceiro({
    Partner,
    Roles,
    HeaderFooter,
    DataSeo,
    Scripts,
}: {
    Partner: any;
    Roles: any;
    HeaderFooter: any;
    DataSeo: any;
    Scripts: any;
}) {
    const router = useRouter();
    const [collapseFaq, setCollapseFaq] = useState(0);

    const [form, setForm] = useState(FormInitialType);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [repeat, setRepeat] = useState("");
    const [personType, setPersonType] = useState<"pf" | "pj">("pf");
    const [document, setDocument] = useState("");
    
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [errorMail, setErrorMail] = useState<string | null>(null);

    const validatePassword = useCallback((pwd: string): string[] => {
        const errors: string[] = [];
        if (pwd.length < 8) errors.push("Mínimo de 8 caracteres");
        if (!/[A-Z]/.test(pwd)) errors.push("Pelo menos uma letra maiúscula");
        if (!/[0-9]/.test(pwd)) errors.push("Pelo menos um número");
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(pwd)) errors.push("Pelo menos um caractere especial");
        return errors;
    }, []);

    const validateAndSetPasswordErrors = useCallback((currentPassword: string, currentRepeat: string): boolean => {
        const errors = validatePassword(currentPassword);
        if (currentPassword !== currentRepeat && currentRepeat.length > 0) {
            errors.push("As senhas devem ser iguais!");
        }
        setPasswordErrors(errors);
        return errors.length === 0;
    }, [validatePassword]);

    useEffect(() => {
        const arePasswordsValid = validateAndSetPasswordErrors(password, repeat);
        const isNameValid = name.trim() !== "";
        const isEmailValid = email.trim() !== "" && validateEmail(email);
        const isPhoneValid = phone.replace(/\D/g, '').length >= 11;
        const documentLen = document.replace(/\D/g, "").length;
        const isDocumentValid = personType === "pf" ? documentLen === 11 : documentLen === 14;

        setIsFormValid(arePasswordsValid && isNameValid && isEmailValid && isPhoneValid && isDocumentValid);
    }, [email, name, password, phone, repeat, personType, document, validateAndSetPasswordErrors]);

    useEffect(() => {
        if (errorMail) {
            setTimeout(() => { setErrorMail(""); }, 30000)
        }
    }, [errorMail])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error("Por favor, preencha todos os campos corretamente.");
            return;
        }

        setForm((prev) => ({ ...prev, loading: true }));
        setErrorMail(null);
        let localError = false;

        const api = new Api();

        try {
            const cleanedPhone = phone.replace(/\D/g, '');
            if (cleanedPhone.length < 11) {
                toast.error("Número de telefone inválido");
                localError = true;
                return;
            }

            const emailClean = email.trim().toLowerCase();
            const nameTrim = name.trim();

            const preResp = await preRegisterPartner(api, {
                name: nameTrim,
                email: emailClean,
                phone: cleanedPhone,
                password,
            });

            if (!preResp?.response && (preResp as any)?.code !== "email_already_registered") {
                toast.error(preResp?.message || preResp?.error || "Não foi possível criar sua conta.");
                localError = true;
                return;
            }

            const storeResp = await completePartnerRegister(api, {
                name: nameTrim,
                email: emailClean,
                phone: cleanedPhone,
                password,
                personType: personType,
                document: document.replace(/\D/g, ""),
                companyName: nameTrim,
                hasDelivery: false,
                segment: "",
                segmentId: undefined,
                street: "",
                number: "",
                neighborhood: "",
                complement: "",
                state: "",
                city: "",
                zipcode: "",
            });

            if (storeResp?.response) {
                toast.success("Cadastro realizado! Entre com seu e-mail e senha.");
                router.push("/acesso");
            } else {
                toast.error(storeResp?.error || "Erro ao finalizar cadastro. Tente novamente.");
                localError = true;
            }
        } catch (error: any) {
            toast.error(error?.message || "Ocorreu um erro ao processar sua solicitação.");
            localError = true;
        } finally {
            if (!localError) {
                try { sessionStorage.removeItem("preCadastro"); } catch {}
            }
            setForm((prev) => ({ ...prev, loading: false }));
        }
    };

    return (
        <Template
            scripts={Scripts}
            metaPage={{
                title: `Seja um parceiro | ${DataSeo?.site_text || "Fiestou"}`,
                image: !!getImage(Partner?.main_cover) ? getImage(Partner?.main_cover) : "",
                description: clean(Partner?.main_description),
                url: `parceiros/seja-parceiro/`,
            }}
            header={{
                template: "default",
                position: "fixed",
                background: "bg-transparent",
                content: HeaderFooter,
            }}
            footer={{
                template: "default",
                content: HeaderFooter,
            }}
        >
            <section className="bg-cyan-500 pt-16 md:pt-24 relative" style={{ backgroundColor: "#2dc3ff" }}>
                {getImage(Partner?.main_cover, "default") && (
                    <>
                        {!!Partner?.main_cover && <Img size="7xl" src={getImage(Partner?.main_cover, "default")} className="hidden md:block absolute w-full bottom-0 left-0" />}
                        {!!Partner?.main_cover_mobile && <Img size="7xl" src={getImage(Partner?.main_cover_mobile, "default")} className="md:hidden absolute w-full bottom-0 left-0" />}
                    </>
                )}

                <div className="min-h-[70vh] md:min-h-[80vh]">
                    <div className="container-medium relative py-4 md:py-14 text-white">
                        <div className="grid gap-4 md:flex">
                            <div className="w-full">
                                <h1 className="font-title text-underline font-bold text-4xl lg:text-6xl mb-2 md:mb-4">Clicou, Cadastrou, Faturou!</h1>
                                <span className="text-lg text-underline md:text-3xl md:max-w-xl">Não perca tempo! Entre na plataforma.</span>
                            </div>
                            <div className="w-full md:max-w-[26rem] mb-32 md:mb-10">
                                <form onSubmit={handleSubmit} name="seja-parceiro" id="seja-parceiro" method="POST">
                                    <div className="bg-white text-zinc-900 rounded-2xl p-4 md:p-8 grid gap-4 shadow-sm">
                                        <div>
                                            <h2 className="font-bold font-title text-2xl md:text-3xl text-center md:pb-4">Cadastre seu negócio</h2>
                                            
                                            <div className="form-group pb-2">
                                                <Label style="light">Tipo de Negócio</Label>
                                                <div className="flex gap-6 mt-1.5 ml-1">
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input type="radio" className="accent-cyan-500" value="pf" checked={personType === "pf"} onChange={() => { setPersonType("pf"); setDocument(""); }} />
                                                        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">Pessoa Física</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input type="radio" className="accent-cyan-500" value="pj" checked={personType === "pj"} onChange={() => { setPersonType("pj"); setDocument(""); }} />
                                                        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">Pessoa Jurídica</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <Label style="light">{personType === "pf" ? "Nome Completo" : "Nome / Razão Social"}</Label>
                                                <Input
                                                    onChange={(e: any) => setName(formatName(e.target.value))}
                                                    name="nome"
                                                    placeholder="Digite o nome completo da loja ou empresa"
                                                    value={name}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <Label style="light">{personType === "pf" ? "CPF" : "CNPJ"}</Label>
                                                <Input
                                                    onChange={(e: any) => {
                                                        const val = e.target.value;
                                                        if (personType === "pf") {
                                                            const masked = maskCPF(val);
                                                            if (partialCPFOk(masked)) setDocument(masked);
                                                        } else {
                                                            const masked = maskCNPJ(val);
                                                            if (partialCNPJOk(masked)) setDocument(masked);
                                                        }
                                                    }}
                                                    name="document"
                                                    placeholder={personType === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                                                    value={document}
                                                    inputMode="numeric"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <Label style="light">E-mail</Label>
                                                <Input
                                                    onChange={(e: any) => {
                                                        const newValue = e.target.value.toLowerCase();
                                                        setEmail(newValue);
                                                        if (newValue.trim() === "") setErrorMail(null);
                                                        else if (!validateEmail(newValue)) setErrorMail("Formato de e-mail inválido");
                                                        else setErrorMail(null);
                                                    }}
                                                    value={email}
                                                    type="email"
                                                    name="email"
                                                    placeholder="Informe seu melhor e-mail para acesso"
                                                    required
                                                />
                                                {errorMail && <label className="text-red-500">{errorMail}</label>}
                                            </div>
                                            <div className="form-group">
                                                <Label style="light">Celular (com DDD)</Label>
                                                <Input
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(formatPhone(e.target.value))}
                                                    name="phone"
                                                    placeholder="(00) 00000-0000"
                                                    value={phone}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <Label style="light">Senha</Label>
                                                <Input
                                                    onChange={(e: any) => {
                                                        setPassword(e.target.value);
                                                        validateAndSetPasswordErrors(e.target.value, repeat);
                                                    }}
                                                    type="password"
                                                    name="senha"
                                                    placeholder="Crie sua senha de acesso"
                                                    required
                                                    value={password}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <Label style="light">Repita a senha</Label>
                                                <Input
                                                    onChange={(e: any) => {
                                                        setRepeat(e.target.value);
                                                        validateAndSetPasswordErrors(password, e.target.value);
                                                    }}
                                                    type="password"
                                                    name="confirm_senha"
                                                    placeholder="Confirme sua senha"
                                                    required
                                                    value={repeat}
                                                />

                                                <ul className="text-xs text-red-500 mt-1 list-disc list-inside">
                                                    <li className={password.length >= 8 ? 'text-green-600' : ''}>Mínimo de 8 caracteres</li>
                                                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>Pelo menos uma letra maiúscula</li>
                                                    <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>Pelo menos um número</li>
                                                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password) ? 'text-green-600' : ''}>Pelo menos um caractere especial</li>
                                                    <li className={
                                                        password === repeat && password.length > 0 && repeat.length > 0
                                                            ? 'text-green-600'
                                                            : (passwordErrors.includes("As senhas devem ser iguais!") ? 'text-red-500' : '')
                                                    }>
                                                        As senhas devem ser iguais
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="form-group text-zinc-500 py-1 text-sm leading-tight">
                                                Ao cadastrar você concorda com os nossos termos e fica pronto para completar o perfil na plataforma.
                                            </div>

                                            <div className="form-group mt-2">
                                                <Button loading={form.loading} disable={!isFormValid}>
                                                    Finalizar Cadastro
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Swiper Sec */}
            <section className="py-8 md:pt-20 relative overflow-hidden">
                <div className="container-medium">
                    <div className="max-w-3xl mx-auto text-center pb-6 md:pb-14">
                        <h2 className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2"
                        >A parceria certa para o seu negócio</h2>
                    </div>

                    <div className="px-4 py-6">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 4 },
                                1280: { slidesPerView: 4 },
                            }}
                            className="custom-swiper"
                        >
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-bags-shopping" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-bags-shopping" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Venda Online</h3>
                                        <span className="text-gray-600 text-justify">Tenha a sua propiá loja virtual focada para o setor de festa. Alcance mais clientes.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-analytics" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-analytics" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Tenha acesso aos dados</h3>
                                        <span className="text-gray-600 text-justify">Relatórios de resultado de vendas. Porcentagem de cada categoria vendida e muito mais.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-box-alt" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-box-alt" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Acompanhe os pedidos</h3>
                                        <span className="text-gray-600 text-justify">Siga cada etapa de entrega do seu produto. Notifique o cliente também para acompanhar a entrega.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="border h-full rounded-lg p-6 md:p-10">
                                    <div className="p-8 text-yellow-400 relative">
                                        <Icon icon="fa-headset" className="text-6xl absolute top-1/2 left-0 -translate-y-1/2" />
                                        <Icon icon="fa-headset" type="fa" className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2" />
                                    </div>
                                    <div className="pt-6">
                                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">Suporte</h3>
                                        <span className="text-gray-600 text-justify">Estamos disponível para tirara suas dúvidas, pode nos enviar e-mail, ligar que estamos pronto para tirar as dúvidas.</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </section>

            <section className="md:py-14 relative overflow-hidden">
                <div className="max-w-[88rem] pb-6 pt-14 md:p-14 md:py-20 mx-auto bg-zinc-100">
                    <div className="container-medium">
                        <div className="max-w-xl mx-auto text-center pb-10 md:pb-14">
                            <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">Conheça os nossas opções</h2>
                        </div>
                        <div className="grid md:flex gap-6 md:gap-16">
                            <div className="bg-white w-full flex flex-col gap-7 p-6 md:p-10 rounded-xl">
                                <div className="text-zinc-900 w-full h-fit grid gap-1 md:gap-3 border-b pb-7">
                                    <div className="font-bold">Plano Simples</div>
                                    <div className="font-title font-bold text-3xl md:text-5xl">R$ 0,00/mês</div>
                                    <div className="text-sm">Plataforma para empresas independentes do tamanho, vender os produtos e serviços de festa.</div>
                                </div>
                                <div className="w-full h-full">
                                    <div className="grid gap-4">
                                        <div className="flex gap-3">
                                            <div><Icon icon="fa-check" className="text-green-500" /></div>
                                            <span className="w-full">
                                                10% em cada venda realizada na plataforma do Fiestou Customização da página Sem limites em números de produtos cadastrados. Transferência automática nos pagamentos. Ou seja, recebe o dinheiro da venda na hora.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-10 md:py-14">
                <div className="container-medium">
                    <div className="grid lg:flex justify-center">
                        <div className="w-full">
                            <div className="max-w-xl pb-4 md:pb-14 flex flex-wrap justify-center">
                                <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4">Entenda como funciona</h2>
                                <Img src="/images/default-arrow.png" className="w-auto mt-8 rotate-45 md:rotate-0" />
                            </div>
                        </div>
                        <div className="w-full lg:max-w-[40rem] flex flex-col justify-end">
                            <div className="border-b py-4">
                                <div onClick={() => setCollapseFaq(collapseFaq !== 0 ? 0 : -1)} className="flex font-bold text-zinc-900 text-lg cursor-pointer">
                                    <span className="w-full">Já posso me cadastrar?</span>
                                    <div><Icon icon="fa-chevron-down" type="far" className="text-sm" /></div>
                                </div>
                                {collapseFaq === 0 && <div className="pt-4 text-sm leading-normal">Pode, mas ainda não começamos a dar o acesso. Mas com o cadastro vamos notificar quando estivermos pronto</div>}
                            </div>
                            <div className="border-b py-4">
                                <div onClick={() => setCollapseFaq(collapseFaq !== 1 ? 1 : -1)} className="flex font-bold text-zinc-900 text-lg cursor-pointer">
                                    <span className="w-full">O que é o Fiestou?</span>
                                    <div><Icon icon="fa-chevron-down" type="far" className="text-sm" /></div>
                                </div>
                                {collapseFaq === 1 && <div className="pt-4 text-sm leading-normal">É uma plataforma que permite empresas do setor de festas, vender os produtos e serviços na internet.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </Template>
    );
}
