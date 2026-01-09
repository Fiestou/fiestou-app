import { Button, Input, Label } from "@/src/components/ui/form";
import Template from "@/src/template";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useState } from "react";
import Api from "@/src/services/api";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content(
    {
      method: 'get',
      url: "default",
    },
    ctx
  );

  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

const formInitial = {
  sended: false,
  loading: false,
  email: "",
};

interface RecuperarProps {
  DataSeo: any;
  Scripts: any;
}

function RecuperarContent({ DataSeo, Scripts }: RecuperarProps) {
  const api = new Api();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm({ ...form, ...value });
  };

  const [email, setEmail] = useState("" as string);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.error("reCAPTCHA not loaded");
      return;
    }

    setFormValue({ loading: true });

    // Gera o token reCAPTCHA v3
    const recaptchaToken = await executeRecaptcha("recovery");

    const request: any = await api.bridge({
      method: "post",
      url: "auth/recovery",
      data: { email: email, recaptcha_token: recaptchaToken },
    });

    if (request.response) {
      setFormValue({ loading: false, sended: request.response });
    } else {
      setFormValue({ loading: false });
    }
  };

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Recuperar senha | ${DataSeo?.site_text}`,
        url: `recuperar`,
      }}
      header={{
        template: "clean",
        position: "solid",
        backHistory: "/acesso",
      }}
      footer={{
        template: "clean",
      }}
    >
      <div className="container-medium">
        <div className="relative py-10 md:py-20">
          <div className="hidden md:block mb-10 lg:-mb-5">
            <Link passHref href="/acesso">
              <div className="flex items-center h-fit md:text-lg gap-2 text-zinc-900">
                <Icon icon="fa-long-arrow-left" />
                <div className="font-bold font-title">voltar</div>
              </div>
            </Link>
          </div>
          <div className="">
            <div className="max-w-md mx-auto">
              {!!form.sended ? (
                <>
                  <div className="text-center mb-8 md:mb-10">
                    <h3 className="font-title text-zinc-900 font-bold text-2xl md:text-3xl text-center">
                      Recuperação enviada
                    </h3>
                    <div className="pt-4 text-sm md:text-base">
                      Enviamos um link de redefinir senha
                      <br /> para o seu e-mail. Basta acessá-lo para iniciar a
                      redefinição.
                    </div>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                  method="POST"
                >
                  <div className="text-center mb-8 md:mb-10">
                    <h3 className="font-title text-zinc-900 font-bold text-3xl md:text-4xl text-center">
                      Recuperar de senha
                    </h3>
                    <div className="pt-2 text-sm md:text-base">
                      Informe o e-mail usado no seu cadastro.
                    </div>
                  </div>

                  <div className="form-group">
                    <Label>E-mail</Label>
                    <Input
                      onChange={(e: any) => {
                        setEmail(e.target.value);
                      }}
                      type="email"
                      name="email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <Button loading={form.loading}>Enviar</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default function Recuperar(props: RecuperarProps) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      language="pt-BR"
    >
      <RecuperarContent {...props} />
    </GoogleReCaptchaProvider>
  );
}
