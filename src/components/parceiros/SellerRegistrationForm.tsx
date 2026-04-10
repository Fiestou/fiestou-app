import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Button, Input, Label } from "@/src/components/ui/form";
import { formatPhone } from "@/pages/cadastre-se/components/FormMasks";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { formatName, validateEmail } from "@/src/components/utils/FormMasks";
import { preRegisterPartner, completePartnerRegister } from "@/src/services/partner";
import { maskCPF, partialCPFOk, maskCNPJ, partialCNPJOk } from "@/src/components/utils/masks";
import Api from "@/src/services/api";

const FormInitialType = {
    sended: false,
    loading: false,
};

export default function SellerRegistrationForm() {
    const router = useRouter();

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
        <form onSubmit={handleSubmit} name="seja-parceiro" id="seja-parceiro" method="POST" className="w-full">
            <div className="bg-white text-zinc-900 rounded-2xl p-4 md:p-8 grid gap-4 shadow-sm">
                <div>
                    <h2 className="font-bold font-title text-2xl md:text-3xl text-center md:pb-4">Cadastre seu negócio</h2>
                    
                    <div className="form-group pb-2 text-left">
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

                    <div className="form-group text-left">
                        <Label style="light">{personType === "pf" ? "Nome Completo" : "Nome / Razão Social"}</Label>
                        <Input
                            onChange={(e: any) => setName(formatName(e.target.value))}
                            name="nome"
                            placeholder="Digite o nome completo da loja ou empresa"
                            value={name}
                            required
                        />
                    </div>
                    
                    <div className="form-group text-left">
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

                    <div className="form-group text-left">
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
                        {errorMail && <label className="text-red-500 text-sm mt-1">{errorMail}</label>}
                    </div>
                    <div className="form-group text-left">
                        <Label style="light">Celular (com DDD)</Label>
                        <Input
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(formatPhone(e.target.value))}
                            name="phone"
                            placeholder="(00) 00000-0000"
                            value={phone}
                            required
                        />
                    </div>
                    <div className="form-group text-left">
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

                    <div className="form-group text-left">
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
                    <div className="form-group text-zinc-500 py-1 text-sm leading-tight text-left">
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
    );
}
