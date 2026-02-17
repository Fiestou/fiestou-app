import { Button, Input, Label } from "@/src/components/ui/form";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import Api from "@/src/services/api";
import Cookies from "js-cookie";
import { UserType } from "@/src/models/user";
import { AuthContext } from "@/src/contexts/AuthContext";
import { CheckMail } from "@/src/models/CheckEmail";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

export async function getServerSideProps(ctx: any) {
  const session: any = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/acesso",
        permanent: false,
      },
    };
  }

  return {
    props: {
      auth: session.user,
    },
  };
}

function CompletarContent({ auth }: any) {
  const { UserLogout } = useContext(AuthContext);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const expires = { expires: 14 };

  const api = new Api();

  const [loading, setLoading] = useState(false as boolean);

  const [data, setData] = useState({} as any);
  const handleData = (value: any) => {
    setData({ ...data, ...value });
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.error("reCAPTCHA not loaded");
      return;
    }

    setLoading(true);

    // Gera o token reCAPTCHA v3
    const recaptchaToken = await executeRecaptcha("complete_registration");

    const checkmail: CheckMail = await api.bridge({
      method: "post",
      url: "auth/checkin",
      data: { ref: data.email},
    }) as CheckMail;

    delete data["image"];

    const request: any = await api.bridge({
      method: 'post',
      url: "users/update",
      data: { ...data, origin: "complete", type: checkmail.user.type, recaptcha_token: recaptchaToken },
    });

    if (!!request.response) {
      const user: UserType = request.data;

      Cookies.set("fiestou.user", JSON.stringify(user), expires);

      window.location.href = "/painel";
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(auth);
  }, [auth]);

  return (
    <Template
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
            <div
              onClick={() => UserLogout()}
              className="cursor-pointer flex items-center h-fit md:text-lg gap-2 text-zinc-900"
            >
              <Icon icon="fa-long-arrow-left" />
              <div className="font-bold font-title">voltar</div>
            </div>
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
                    Complete seu cadastro
                  </h3>
                  <div className="pt-2">
                    Insira as informações que faltam para o seu cadastro
                  </div>
                </div>

                <div className="form-group">
                  <Label>Nome</Label>
                  <Input
                    defaultValue={data.name}
                    onChange={(e: any) => handleData({ name: e.target.value })}
                    type="text"
                    name="nome"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    defaultValue={data.email}
                    type="email"
                    name="email"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <Label>Celular</Label>
                  <Input
                    defaultValue={data.phone}
                    onChange={(e: any) => handleData({ phone: e.target.value })}
                    type="text"
                    name="celular"
                    required
                  />
                  <div className="text-sm">
                    * Usaremos seu contato apenas para notificações de pedidos.
                  </div>
                </div>

                <div className="text-xs text-center text-gray-500 pt-4">
                  Este site é protegido pelo reCAPTCHA e aplica a{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener" className="underline">
                    Política de Privacidade
                  </a>{" "}
                  e os{" "}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer noopener" className="underline">
                    Termos de Serviço
                  </a>{" "}
                  do Google.
                </div>

                <div className="form-group">
                  <Button loading={loading}>
                    Cadastrar agora
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default function Completar(props: any) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      language="pt-BR"
    >
      <CompletarContent {...props} />
    </GoogleReCaptchaProvider>
  );
}
