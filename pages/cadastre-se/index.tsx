import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { encode as base64_encode, decode as base64_decode } from "base-64";
import { Button, Input, Label } from "@/src/components/ui/form";
import HCaptchaComponent from "@/src/components/utils/HCaptchaComponent";
import { CheckMail } from "@/src/models/CheckEmail";
import { formatName, formatPhone, formatCpfCnpj, formatCep, validateEmail } from "./components/FormMasks";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({
    url: "register",
  });

  const Register = request?.data?.Register ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      Register: Register,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

interface PageQueryType {
  ref?: string;
}

const FormInitialType = {
  sended: false,
  loading: false,
  redirect: "login",
};

export default function CadastreSe({
  Register,
  DataSeo,
  Scripts,
}: {
  Register: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();
  const router = useRouter();

  const query: PageQueryType = router.query;

  const roles = [
    {
      code: "number",
      label: "É necessário que a senha possua pelo menos um número.",
    },
    { code: "min", label: "A senha precisa ter pelo menos 6 caracteres." },
    { code: "equal", label: "As senhas precisam ser iguais." },
  ];
  const [errors, setErrors] = useState([] as Array<string>);
  const [complete, setComplete] = useState([] as Array<string>);

  const [form, setForm] = useState(FormInitialType);
  const [email, setEmail] = useState(base64_decode(query.ref ?? "") as string);
  const [name, setName] = useState("" as string);
  const [phone, setPhone] = useState("" as string);
  const [date, setDate] = useState("" as string);
  const [password, setPassword] = useState("" as string);
  const [repeat, setRepeat] = useState("" as string);

  const [token, setToken] = useState("" as string);
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [errorMail, setErrorMail] = useState<string>("");
  const [emailValid, setEmailValid] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, 200);

    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    if (debouncedEmail) {
      checkEmail(debouncedEmail);
    }
  }, [debouncedEmail]);

  const checkEmail = async (email: string) => {
    // Validar formato do email antes de fazer a requisição
    if (!validateEmail(email)) {
      setEmailValid(false);
      return false;
    }
    setEmailValid(true);

    const data: CheckMail = await api.bridge({
      method: "post",
      url: "auth/checkin",
      data: { ref: email },
    }) as CheckMail;

    if (data.response && data.user) {
      setErrorMail("O email já está vinculado a um usuário.")
      return false;
    }

    return true;
  }

  useEffect(()=>{
    if (errorMail){
      setTimeout(()=>{
        setErrorMail("");
      }, 30000)
    }
  }, [errorMail])

  useEffect(() => {
    if (password) {
      let handleErrors = errors;
      let handleComplete = complete;

      if (password == repeat) {
        handleErrors = handleErrors.filter((role) => role != "equal");
        handleComplete = [...handleComplete, "equal"];
      } else {
        handleErrors = [...handleErrors, "equal"];
        handleComplete = handleComplete.filter((role) => role != "equal");
      }

      if (/\d/.test(password)) {
        handleErrors = handleErrors.filter((role) => role != "number");
        handleComplete = [...handleComplete, "number"];
      } else {
        handleErrors = [...handleErrors, "number"];
        handleComplete = handleComplete.filter((role) => role != "number");
      }

      if (password.length >= 6) {
        handleErrors = handleErrors.filter((role) => role != "min");
        handleComplete = [...handleComplete, "min"];
      } else {
        handleErrors = [...handleErrors, "min"];
        handleComplete = handleComplete.filter((role) => role != "min");
      }

      setErrors(handleErrors);
      setComplete(handleComplete);
    }
  }, [password, repeat]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!await checkEmail(email)){
      return;
    }
    
    setForm({ ...form, loading: true });

    // Remover formatação dos campos antes de enviar para a API
    const phoneClean = phone.replace(/\D/g, "");

    const data: any = await api.bridge({
      url: "auth/register",
      data: {
        name: name,
        // date: date,
        email: email,
        phone: phoneClean, // Envia o telefone sem formatação
        person: "client",
        password: password,
        re_password: repeat,
      },
    });
    
    if (data.response) {
      window.location.href = "/acesso?modal=register";
    } else {
      setForm({ ...form, sended: data.response });
    }
  };

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Cadastre-se | ${DataSeo?.site_text}`,
        url: "cadastre-se",
      }}
      header={{
        template: "clean",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <div className="container-medium">
        <div className="relative py-6 md:py-20">
          <div className="mb-10 lg:-mb-5">
            <Link passHref href="/acesso">
              <div className="flex items-center h-fit md:text-lg gap-2 text-zinc-900">
                <Icon icon="fa-long-arrow-left" />
                <div className="font-bold font-title">voltar</div>
              </div>
            </Link>
          </div>
          <div className="">
            <div className="max-w-md mx-auto">
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
                method="POST"
              >
                <div className="text-center mb-8 md:mb-10">
                  <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                    Bem vindo ao Fiestou
                  </h3>
                  <div className="pt-2">
                    Entre na sua conta ou faça seu cadastro
                  </div>
                </div>

                <div className="form-group">
                  <Label>Nome</Label>
                  <Input
                    value={name}
                    onChange={(e: any) => setName(formatName(e.target.value))}
                    type="text"
                    name="nome"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                {/* <div className="form-group">
                  <Label>Data de nascimento</Label>
                  <Input
                    onChange={(e: any) => setDate(e.target.value)}
                    type="date"
                    name="nascimento"
                    required
                  />
                </div> */}

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    onChange={(e: any) => setEmail(e.target.value.toLowerCase())}
                    value={email}
                    type="email"
                    name="email"
                    placeholder="Informe seu melhor e-mail"
                    required
                  />
                  {errorMail && (
                    <label className="text-red-500">{errorMail}</label>
                  )}
                  {!emailValid && email && (
                    <label className="text-red-500">Formato de e-mail inválido</label>
                  )}
                </div>

                <div className="form-group">
                  <Label>Celular</Label>
                  <Input
                    value={phone}
                    onChange={(e: any) => setPhone(formatPhone(e.target.value))}
                    type="text"
                    name="celular"
                    placeholder="(00) 9 0000-0000"
                    required
                  />
                  <div className="text-sm">
                    * Usaremos seu contato apenas para notificações de pedidos.
                  </div>
                </div>

                <div className="form-group">
                  <Label>Senha</Label>
                  <Input
                    onChange={(e: any) => setPassword(e.target.value)}
                    type="password"
                    name="senha"
                    placeholder="Crie sua senha"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>Repita a senha</Label>
                  <Input
                    onChange={(e: any) => setRepeat(e.target.value)}
                    type="password"
                    name="confirm_senha"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="border p-4 rounded grid text-sm">
                    {roles.map((role: any, key: any) => (
                      <div key={key} className="flex items-center gap-1">
                        <div className="relative p-2">
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            {!!errors.includes(role.code) ? (
                              <Icon icon="fa-times" className="text-red-500" />
                            ) : !!complete.includes(role.code) ? (
                              <Icon
                                icon="fa-check"
                                className="text-green-500"
                              />
                            ) : (
                              <Icon icon="fa-minus" />
                            )}
                          </span>
                        </div>
                        <div>{role.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {!!Register?.terms_text && (
                  <div
                    className="mt-4 text-xs leading-tight"
                    dangerouslySetInnerHTML={{ __html: Register?.terms_text }}
                  ></div>
                )}

                <div className="flex justify-center pt-4">
                  <HCaptchaComponent
                    onVerify={(token: string) => setToken(token)}
                  />
                </div>

                <div className="form-group">
                  <Button
                    disable={(!!errors.length && !!complete.length) || !token}
                    loading={form.loading}
                  >
                    Cadastrar agora
                  </Button>
                </div>

                <div className="text-center pt-4 text-sm">
                  Já possue cadastro na plataforma?
                  <br />
                  <Link
                    passHref
                    className="underline text-zinc-900"
                    href="/acesso"
                  >
                    Fazer Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style global jsx>
        {`
          p a {
            color: #00a7eb;
            text-decoration: underline;
          }
        `}
      </style>
    </Template>
  );
}