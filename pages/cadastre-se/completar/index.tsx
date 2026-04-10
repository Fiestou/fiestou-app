import { Button, Input, Label } from "@/src/components/ui/form";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { AuthContext } from "@/src/contexts/AuthContext";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { setUserCookie } from "@/src/services/authCookies";
import { formatName } from "@/src/components/utils/FormMasks";

function splitFullName(fullName: string) {
  const normalized = String(fullName ?? "").trim().replace(/\s+/g, " ");

  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(" ");

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function joinFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
}

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

  const api = new Api();

  const [loading, setLoading] = useState(false as boolean);

  const [data, setData] = useState({} as any);
  const handleData = (value: any) => {
    setData({ ...data, ...value });
  };
  const { firstName, lastName } = splitFullName(data.name ?? auth?.name ?? "");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.error("reCAPTCHA not loaded");
      return;
    }

    setLoading(true);

    // Gera o token reCAPTCHA v3
    const recaptchaToken = await executeRecaptcha("complete_registration");

    delete data["image"];

    const request: any = await api.bridge({
      method: 'post',
      url: "users/update",
      data: { ...data, origin: "complete", recaptcha_token: recaptchaToken },
    });

    if (!!request.response) {
      const user: UserType = request.data;

      setUserCookie(user);

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
                    Falta pouco
                  </h3>
                  <div className="pt-2">
                    Confirme seus dados para continuar.
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="form-group">
                    <Label>Nome</Label>
                    <Input
                      value={firstName}
                      onChange={(e: any) =>
                        handleData({
                          name: joinFullName(
                            formatName(e.target.value),
                            lastName,
                          ),
                        })
                      }
                      type="text"
                      name="nome"
                      placeholder="Seu nome"
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <Label>Sobrenome</Label>
                    <Input
                      value={lastName}
                      onChange={(e: any) =>
                        handleData({
                          name: joinFullName(
                            firstName,
                            formatName(e.target.value),
                          ),
                        })
                      }
                      type="text"
                      name="sobrenome"
                      placeholder="Seu sobrenome"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    value={data.email ?? ""}
                    type="email"
                    name="email"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <Label>Celular</Label>
                  <Input
                    value={data.phone ?? ""}
                    onChange={(e: any) => handleData({ phone: e.target.value })}
                    type="text"
                    name="celular"
                    required
                  />
                  <div className="text-sm">
                    Usaremos esse número apenas para avisos sobre pedidos.
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
                    Concluir cadastro
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
