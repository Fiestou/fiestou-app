import Api from "@/src/services/api";
import Template from "@/src/template";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { clean, getImage, moneyFormat } from "@/src/helper";
import { formatPhone } from "@/pages/cadastre-se/components/FormMasks";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { formatName, validateEmail } from "@/src/components/utils/FormMasks";

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
    redirect: "/parceiros/cadastro",
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
    const api = new Api();
    const router = useRouter();

    const [collapseFaq, setCollapseFaq] = useState(0);

    const [form, setForm] = useState(FormInitialType);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [repeat, setRepeat] = useState("");
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [errorMail, setErrorMail] = useState<string | null>(null);

    const validatePassword = (pwd: string): string[] => {
        const errors: string[] = [];

        if (pwd.length < 8) {
            errors.push("Mínimo de 8 caracteres");
        }
        if (!/[A-Z]/.test(pwd)) {
            errors.push("Pelo menos uma letra maiúscula");
        }
        if (!/[0-9]/.test(pwd)) {
            errors.push("Pelo menos um número");
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(pwd)) {
            errors.push("Pelo menos um caractere especial");
        }

        return errors;
    };

    const validateAndSetPasswordErrors = (currentPassword: string, currentRepeat: string): boolean => {
        const errors = validatePassword(currentPassword);

        if (currentPassword !== currentRepeat && currentRepeat.length > 0) {
            errors.push("As senhas devem ser iguais!");
        }

        setPasswordErrors(errors);
        return errors.length === 0;
    };

    const checkFormValidity = () => {
        const arePasswordsValid = validateAndSetPasswordErrors(password, repeat);
        const isNameValid = name.trim() !== "";
        const isEmailValid = email.trim() !== "" && validateEmail(email);
        const isPhoneValid = phone.replace(/\D/g, '').length >= 11;

        setIsFormValid(arePasswordsValid && isNameValid && isEmailValid && isPhoneValid);
    };

    useEffect(() => {
        if (errorMail) {
            setTimeout(() => {
                setErrorMail("");
            }, 30000)
        }
    }, [errorMail])

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isFormValid) {
            toast.error("Por favor, preencha todos os campos corretamente.");
            return;
        }

        setForm({ ...form, loading: true });
        setErrorMail(null);

        try {
            const cleanedPhone = phone.replace(/\D/g, '');

            if (cleanedPhone.length < 11) {
                toast.error("Número de telefone inválido");
                return;
            }

            const data: any = await api.bridge({
                method: 'post',
                url: "auth/pre-register",
                data: {
                    name: name,
                    email: email,
                    phone: cleanedPhone,
                    password: password,
                    remember: repeat,
                    person: "partner",
                },
            });

            if (data.response) {
                toast.success(data.message || "Pré-cadastro realizado com sucesso!");
                router.push({
                    pathname: form.redirect,
                    query: { ref: data.hash },
                });
            } else {
                toast.error(data.message || "Ocorreu um erro ao processar sua solicitação.");
            }
        } catch (error: any) {
            console.error("Erro na requisição de pré-cadastro:", error);
            setForm((prevForm) => ({ ...prevForm, loading: false }));

            if (error.response && error.response.data) {
                const { status, data: responseData } = error.response;

                if (status === 422) {
                    if (responseData.errors && responseData.errors.email) {
                        const emailErrMsg = responseData.errors.email[0];
                        setErrorMail(emailErrMsg);
                        toast.error(emailErrMsg);
                    } else if (responseData.errors) {
                        const firstError = Object.values(responseData.errors).flat()[0];
                        toast.error(firstError as string || "Por favor, corrija os campos indicados.");
                    } else {
                        toast.error(responseData.message || "Dados inválidos. Verifique e tente novamente.");
                    }
                } else if (status === 409) {
                    const errorMessage = responseData.message || responseData.errors?.email?.[0] || "Endereço de e-mail já cadastrado. Tente um outro!";
                    setErrorMail(errorMessage);
                    toast.error(errorMessage);
                } else {
                    toast.error(responseData.message || "Ocorreu um erro inesperado. Tente novamente mais tarde.");
                }
            } else {
                toast.error("Falha na conexão com o servidor. Verifique sua internet ou tente novamente.");
            }
        } finally {
            setForm((prevForm) => ({ ...prevForm, loading: false }));
        }
    };

    return (
        <Template
            scripts={Scripts}
            metaPage={{
                title: `Seja um parceiro | ${DataSeo?.site_text}`,
                image: !!getImage(Partner?.main_cover)
                    ? getImage(Partner?.main_cover)
                    : "",
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
            <section
                className="bg-cyan-500 pt-16 md:pt-24 relative"
                style={{ backgroundColor: "#2dc3ff" }}
            >
                {getImage(Partner?.main_cover, "default") && (
                    <>
                        {!!Partner?.main_cover && (
                            <Img
                                size="7xl"
                                src={getImage(Partner?.main_cover, "default")}
                                className="hidden md:block absolute w-full bottom-0 left-0"
                            />
                        )}
                        {!!Partner?.main_cover_mobile && (
                            <Img
                                size="7xl"
                                src={getImage(Partner?.main_cover_mobile, "default")}
                                className="md:hidden absolute w-full bottom-0 left-0"
                            />
                        )}
                    </>
                )}

                <div className="min-h-[70vh] md:min-h-[80vh]">
                    <div className="container-medium relative py-4 md:py-14 text-white">
                        <div className="grid gap-4 md:flex">
                            <div className="w-full">
                                <h1
                                    className="font-title text-underline font-bold text-4xl lg:text-6xl mb-2 md:mb-4"
                                    dangerouslySetInnerHTML={{ __html: Partner?.main_text }}
                                ></h1>
                                <div
                                    className="text-lg text-underline md:text-3xl md:max-w-xl"
                                    dangerouslySetInnerHTML={{
                                        __html: Partner?.main_description,
                                    }}
                                ></div>
                            </div>
                            <div className="w-full md:max-w-[26rem] mb-32 md:mb-10">
                                <form
                                    onSubmit={(e) => {
                                        handleSubmit(e);
                                    }}
                                    name="seja-parceiro"
                                    id="seja-parceiro"
                                    method="POST"
                                >
                                    <div className="bg-white text-zinc-900 rounded-2xl p-4 md:p-8 grid gap-4">
                                        <div>
                                            <h2
                                                className="font-bold font-title text-2xl md:text-3xl text-center md:pb-4"
                                                dangerouslySetInnerHTML={{
                                                    __html: Partner?.form_title,
                                                }}
                                            ></h2>
                                            <div className="form-group">
                                                <Label style="light">Nome</Label>
                                                <Input
                                                    onChange={(e: any) => {
                                                        setName(formatName(e.target.value));
                                                    }}
                                                    name="nome"
                                                    placeholder="Digite o nome completo"
                                                    value={name}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <Label style="light">E-mail</Label>
                                                <Input
                                                    onChange={(e: any) => {
                                                        const newValue = e.target.value.toLowerCase();
                                                        setEmail(newValue);

                                                        if (newValue.trim() === "") {
                                                            setErrorMail(null);
                                                        } else if (!validateEmail(newValue)) {
                                                            setErrorMail("Formato de e-mail inválido");
                                                        } else {
                                                            setErrorMail(null);
                                                        }
                                                    }}
                                                    value={email}
                                                    type="email"
                                                    name="email"
                                                    placeholder="Informe seu melhor e-mail"
                                                    required
                                                />
                                                {errorMail && (
                                                    <label className="text-red-500">{errorMail}</label>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <Label style="light">Celular (com DDD)</Label>
                                                <Input
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setPhone(formatPhone(e.target.value));
                                                        checkFormValidity();
                                                    }}
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
                                                        checkFormValidity();
                                                    }}
                                                    type="password"
                                                    name="senha"
                                                    placeholder="Crie sua senha"
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
                                                        checkFormValidity();
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
                                            <div
                                                className="form-group text-zinc-500 py-1 text-sm leading-tight"
                                                dangerouslySetInnerHTML={{
                                                    __html: Partner?.form_term,
                                                }}
                                            ></div>

                                            <div className="form-group">
                                                <Button loading={form.loading}
                                                    disable={!isFormValid}>
                                                    {Partner?.form_button}
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

            <section className="pt-14 md:pt-20 pb-5 md:pb-20 relative overflow-hidden">
                <div className="container-medium">
                    <div className="max-w-xl mx-auto text-center pb-10 md:pb-14">
                        <span>{Partner?.works_title}</span>
                        <h2
                            className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
                            dangerouslySetInnerHTML={{
                                __html: Partner?.works_text,
                            }}
                        ></h2>
                    </div>

                    <Swiper
                        spaceBetween={16}
                        modules={[Navigation]}
                        breakpoints={{
                            0: {
                                slidesPerView: 1.25,
                            },
                            640: {
                                slidesPerView: 2.5,
                            },
                            1024: {
                                slidesPerView: 4,
                            },
                        }}
                        className="swiper-equal swiper-visible"
                    >
                        {!!Partner?.works_list &&
                            Partner?.works_list.map((item: any, key: any) => (
                                <SwiperSlide key={key}>
                                    <div className="border h-full rounded-lg p-6 md:p-10">
                                        <div className="p-8 text-yellow-400 relative">
                                            <Icon
                                                icon={item.work_image ?? "fa-hand-point-up"}
                                                className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                                            />
                                            <Icon
                                                icon={item.work_image ?? "fa-hand-point-up"}
                                                type="fa"
                                                className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                                            />
                                        </div>
                                        <div className="pt-6">
                                            <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                                                {item.work_title}
                                            </h3>
                                            <div>{item.work_description}</div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                    </Swiper>
                </div>
            </section>

            <section className="md:py-14 relative overflow-hidden">
                <div className="max-w-[88rem] pb-6 pt-14 md:p-14 md:py-20 mx-auto bg-zinc-100">
                    <div className="container-medium">
                        <div className="max-w-xl mx-auto text-center pb-10 md:pb-14">
                            <span>{Partner?.plain_title}</span>
                            <h2
                                className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
                                dangerouslySetInnerHTML={{
                                    __html: Partner?.plain_text,
                                }}
                            ></h2>
                            <div
                                className="pt-4"
                                dangerouslySetInnerHTML={{
                                    __html: Partner?.plain_description,
                                }}
                            ></div>
                        </div>
                        <div className="grid md:flex gap-6 md:gap-16">
                            {!!Roles?.plans?.length &&
                                Roles?.plans.map((item: any, key: any) => (
                                    <div
                                        className={`${key % 2 == 0 ? "bg-white" : "bg-zinc-900 text-white"
                                            } w-full flex flex-col gap-7 p-6 md:p-10 rounded-xl`}
                                        key={key}
                                    >
                                        <div
                                            className={`${key % 2 == 0 ? "text-zinc-900" : ""
                                                } w-full h-fit grid gap-1 md:gap-3 border-b pb-7`}
                                        >
                                            <div className="font-bold">{item?.plan_title}</div>
                                            <div className="font-title font-bold text-3xl md:text-5xl">
                                                R$ {moneyFormat(item?.plan_price)}/mês
                                            </div>
                                            <div className="text-sm">{item?.plan_description}</div>
                                        </div>
                                        <div className="w-full h-full">
                                            <div className="grid gap-4">
                                                {!!item?.plan_resources?.split(";")?.length &&
                                                    item.plan_resources
                                                        .split(";")
                                                        .filter((item: any) => !!item)
                                                        .map((item: any, key: any) => (
                                                            <div key={key} className="flex gap-3">
                                                                <div>
                                                                    <Icon
                                                                        icon="fa-check"
                                                                        className="text-green-500"
                                                                    />
                                                                </div>
                                                                <div className="w-full">{item}</div>
                                                            </div>
                                                        ))}
                                            </div>
                                        </div>
                                        <div className="text-center mt-4 grid">
                                            <Button target="_blank" href={item?.plan_url}>
                                                Selecionar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-10 md:py-14">
                <div className="container-medium">
                    <div className="grid lg:flex justify-center">
                        <div className="w-full">
                            <div className="max-w-xl pb-4 md:pb-14">
                                <span>{Partner?.faq_title}</span>
                                <h2
                                    className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4"
                                    dangerouslySetInnerHTML={{
                                        __html: Partner?.faq_text,
                                    }}
                                ></h2>
                                <div
                                    className="pt-4"
                                    dangerouslySetInnerHTML={{
                                        __html: Partner?.faq_description,
                                    }}
                                ></div>
                                <Img
                                    src="/images/default-arrow.png"
                                    className="w-auto mt-8 rotate-45 md:rotate-0"
                                />
                            </div>
                        </div>
                        <div className="w-full lg:max-w-[40rem]">
                            {!!Partner?.faq_list &&
                                Partner?.faq_list.map((item: any, key: any) => (
                                    <div key={key} className="border-b py-4">
                                        <div
                                            onClick={() =>
                                                setCollapseFaq(key != collapseFaq ? key : -1)
                                            }
                                            className="flex font-bold text-zinc-900 text-lg cursor-pointer"
                                        >
                                            <span className="w-full">{item.answer_question}</span>
                                            <div>
                                                <Icon
                                                    icon="fa-chevron-down"
                                                    type="far"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                        {collapseFaq == key && (
                                            <div
                                                className="pt-4 text-sm leading-normal"
                                                dangerouslySetInnerHTML={{
                                                    __html: item.answer_text,
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="container-medium py-10 md:py-20">
                    <div className="bg-zinc-100 rounded-xl grid lg:flex items-center relative overflow-hidden">
                        <div className="w-full grid gap-6 p-6 md:p-16 text-zinc-900">
                            <h4
                                className="font-title font-bold max-w-[30rem] text-4xl"
                                dangerouslySetInnerHTML={{
                                    __html: Partner?.cta_text,
                                }}
                            ></h4>
                            <div
                                className="max-w-[24rem]"
                                dangerouslySetInnerHTML={{
                                    __html: Partner?.cta_description,
                                }}
                            ></div>
                            <div className="pt-2">
                                <Button href="#">{Partner?.cta_button}</Button>
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="aspect-square relative">
                                {!!getImage(Partner?.cta_image, "xl") && (
                                    <Img
                                        src={getImage(Partner?.cta_image, "xl")}
                                        className="w-full h-full object-contain absolute inset-0"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Template>
    );
}