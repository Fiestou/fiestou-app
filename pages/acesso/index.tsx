import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useContext, useEffect, useState } from "react";
import { encode as base64_encode } from "base-64";
import { Button, Input, Label } from "@/src/components/ui/form";
import Modal from "@/src/components/utils/Modal";
import { UserType } from "@/src/models/user";
import { SocialAuth } from "@/src/components/pages/acesso/NextAuth";
import { getSession } from "next-auth/react";
import { AuthContext } from "@/src/contexts/AuthContext";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

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

// Componente interno que usa o hook useGoogleReCaptcha
function AcessoContent({ modal, DataSeo, Scripts }: AcessoProps) {
  const api = new Api();

  const router = useRouter();
  const { SignIn } = useContext(AuthContext);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [modalStatus, setModalStatus] = useState(!!modal as boolean);
  const [modalType, setModalType] = useState(modal as string);
  const [user, setUser] = useState({} as UserType);

  const [form, setForm] = useState(formInitial);

  const setFormValue = (value: any) => {
    setForm({ ...form, ...value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.error("reCAPTCHA not loaded");
      return;
    }

    setFormValue({ loading: true, alert: "" });

    // Gera o token reCAPTCHA v3
     const token = await executeRecaptcha('register');

    const request: any = await SignIn({
      email: form.email,
      password: form.password,
      recaptcha_token: token,
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
      setTimeout(() => {
        setFormValue({
          alert: "",
        });
      }, 3000);
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
                    Bem vindo ao Fiestou
                  </h3>
                  <div className="pt-2 text-sm md:text-base">
                    Entre na sua conta ou faça seu cadastro
                  </div>
                </div>

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    onChange={(e: any) => {
                      setFormValue({ email: e.target.value });
                    }}
                    type="text"
                    name="email"
                    placeholder="Informe seu e-mail"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>Senha</Label>
                  <Input
                    onChange={(e: any) => {
                      setFormValue({ password: e.target.value });
                    }}
                    type="password"
                    name="senha"
                    placeholder="Insira sua senha"
                  />
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
                  <Button loading={form.loading}>Fazer Login</Button>
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
                  <SocialAuth showFacebook={true} />
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
                  Não possui cadastro?
                  <Link
                    className="underline text-yellow-600 font-bold"
                    href="/cadastre-se"
                  >
                    {" "}
                    Cadastre-se
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
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
                Para fazer seu primeiro acesso, confirme seu cadastro através da
                mensagem que enviamos no e-mail cadastrado.
              </>
            ) : modalType == "await" ? (
              <>
                Nossa equipe esta analisando seu cadastro. Responderemos via
                e-mail em breve.
              </>
            ) : (
              <>
                Não recebeu o link? Verifique sua caixa de span, lixeira ou
                <Link
                  href="/recuperar"
                  className="text-cyan-500 underline px-2"
                >
                  recupere sua senha
                </Link>
                para receber o link novamente
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
    </Template>
  );
}

// Componente exportado que envolve com o Provider do reCAPTCHA
export default function Acesso(props: AcessoProps) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      language="pt-BR"
    >
      <AcessoContent {...props} />
    </GoogleReCaptchaProvider>
  );
}
