import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useContext, useEffect, useState } from "react";
import { Button, Input, Label } from "@/src/components/ui/form";
import Modal from "@/src/components/utils/Modal";
import { SocialAuth } from "@/src/components/pages/acesso/NextAuth";
import { getSession } from "next-auth/react";
import { AuthContext } from "@/src/contexts/AuthContext";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  const session: any = await getSession(ctx);

  if (!!session?.user?.email) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  let request: any = await api.content({ method: "get", url: `default` });

  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      modal: ctx.query?.modal ?? "",
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
  email: "",
  password: "",
  alert: "",
};

interface AcessoProps {
  modal?: string;
  DataSeo: any;
  Scripts: any;
}

function AcessoContent({ modal, DataSeo, Scripts }: AcessoProps) {
  const router = useRouter();
  const { SignIn } = useContext(AuthContext);

  const [modalStatus, setModalStatus] = useState(() => Boolean(modal));
  const [modalType] = useState(modal as string);

  const [form, setForm] = useState(formInitial);
  const [showPassword, setShowPassword] = useState(false);

  const setFormValue = (value: any) => {
    setForm((current) => ({ ...current, ...value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormValue({ loading: true, alert: "" });

    const request: any = await SignIn({
      email: form.email,
      password: form.password,
    });

    if (request.status == 422) {
      setFormValue({
        loading: false,
        sended: false,
        alert: request.error,
      });
    } else {
      setFormValue({
        loading: false,
        sended: false,
      });
    }
  };

  useEffect(() => {
    if (form.alert) {
      const timeout = setTimeout(() => {
        setForm((current) => ({
          ...current,
          alert: "",
        }));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [form.alert]);

  // Verifica se foi redirecionado por sessão expirada
  const isSessionExpired = router.query?.expired === "1";

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Acesso | ${DataSeo?.site_text}`,
        url: `acesso`,
      }}
      header={{
        template: "clean",
        position: "solid",
        backHistory: "/",
      }}
      footer={{
        template: "clean",
      }}
    >
      <div className="container-medium">
        <div className="relative py-20">
          <div className="hidden md:block mb-10 lg:-mb-5">
            <Link passHref href="/">
              <div className="flex items-center h-fit md:text-lg gap-2 text-zinc-900">
                <Icon icon="fa-long-arrow-left" />
                <div className="font-bold font-title">voltar</div>
              </div>
            </Link>
          </div>
          <div className="">
            <div className="max-w-md mx-auto">
              {/* Aviso de sessão expirada */}
              {isSessionExpired && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 text-yellow-700">
                    <Icon icon="fa-exclamation-triangle" />
                    <span className="font-semibold">Sua sessão expirou</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Por favor, faça login novamente para continuar.
                  </p>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
                method="POST"
              >
                <div className="text-center mb-8 md:mb-10">
                  <h3 className="font-title text-zinc-900 font-bold text-3xl md:text-4xl text-center">
                    Entre na sua conta
                  </h3>
                  <div className="pt-2 text-sm md:text-base">
                    Use seu e-mail e senha ou continue com Google.
                  </div>
                </div>

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    onChange={(e: any) => {
                      setFormValue({ email: e.target.value });
                    }}
                    type="email"
                    name="email"
                    placeholder="Informe seu e-mail"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>Senha</Label>
                  <div className="relative">
                    <Input
                      onChange={(e: any) => {
                        setFormValue({ password: e.target.value });
                      }}
                      type={showPassword ? "text" : "password"}
                      name="senha"
                      placeholder="Insira sua senha"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <Icon icon={showPassword ? "fa-eye-slash" : "fa-eye"} />
                    </button>
                  </div>
                </div>
                <div>
                  <Link
                    href="/recuperar"
                    className="underline text-zinc-900 text-sm font-semibold whitespace-nowrap"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="form-group">
                  <Button loading={form.loading}>Entrar</Button>
                </div>

                {form.alert && (
                  <div className="py-3 pl-4 bg-red-50 text-red-600 rounded-md text-center mt-2">
                    {form.alert}
                  </div>
                )}

                <div className="flex items-center gap-4 my-6">
                  <div className="border-t w-full"></div>
                  <div>OU</div>
                  <div className="border-t w-full"></div>
                </div>

                <div className="form-group">
                  <SocialAuth googleLabel="Continuar com Google" />
                </div>

                <div className="hidden form-group text-center text-sm pt-4">
                  Quer se cadastrar como parceiro?{" "}
                  <Link
                    href="/parceiros/cadastro"
                    className="text-blue-400 underline"
                  >
                    Clique aqui
                  </Link>
                </div>
                <div className="text-center pt-4 text-sm">
                  Ainda não tem conta?{" "}
                  <Link
                    className="underline text-yellow-600 font-bold"
                    href="/cadastre-se"
                  >
                    Criar conta
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {modalStatus && (
        <Modal status={modalStatus} close={() => setModalStatus(false)} size="sm">
          <div className="text-center max-w-[22rem] mx-auto py-4 grid">
            <div className="relative mb-2">
              <Icon
                icon="fa-envelope-open-text"
                type="fa"
                className="text-[3.5rem] mt-1 text-yellow-300 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
              />
              <Icon
                icon="fa-envelope-open-text"
                className="text-6xl text-yellow-400 relative"
              />
            </div>
            <h4 className="font-title text-zinc-900 text-2xl md:text-3xl font-bold py-3">
              {modalType == "register"
                ? "Sua conta foi criada!"
                : modalType == "await"
                  ? "Cadastro em análise!"
                  : "Confirme seu endereço de e-mail!"}
            </h4>
            <div className="pt-2">
              {modalType == "register" ? (
                <>
                  Enviamos um e-mail para confirmar seu cadastro. Depois disso,
                  você já pode entrar na sua conta.
                </>
              ) : modalType == "await" ? (
                <>
                  Nossa equipe está analisando seu cadastro. Você receberá uma
                  resposta por e-mail.
                </>
              ) : (
                <>
                  Não recebeu o link? Verifique spam e lixeira ou
                  <Link
                    href="/recuperar"
                    className="text-cyan-500 underline px-2"
                  >
                    peça um novo link
                  </Link>
                  para continuar.
                </>
              )}
            </div>
            {modalType != "await" && (
              <Button onClick={() => setModalStatus(false)} className="mt-6">
                Fazer login
              </Button>
            )}
          </div>
        </Modal>
      )}
    </Template>
  );
}

export default function Acesso(props: AcessoProps) {
  return <AcessoContent {...props} />;
}
