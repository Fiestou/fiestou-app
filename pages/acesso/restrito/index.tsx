import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { decode as base64_decode } from "base-64";
import { FormEvent, useContext, useState } from "react";
import { Button, Input, Label } from "@/src/components/ui/form";
import { AuthContext } from "@/src/contexts/AuthContext";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface PageQueryType {
  ref: string | "";
}

const FormInitialType = {
  sended: false,
  loading: false,
  email: "",
  password: "",
};

function RestritoContent() {
  const { SignIn } = useContext(AuthContext);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const router = useRouter();
  const { ref } = router.query as unknown as PageQueryType;

  if (!!ref) FormInitialType.email = base64_decode(ref);

  const [form, setForm] = useState(FormInitialType);

  const setFormValue = (value: any) => {
    setForm({ ...form, ...value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.error("reCAPTCHA not loaded");
      return;
    }

    setFormValue({ loading: true });

    // Gera o token reCAPTCHA v3
    const recaptchaToken = await executeRecaptcha("admin_login");

    const request = await SignIn({
      email: form.email,
      password: form.password,
      recaptcha_token: recaptchaToken,
    });

    if (!request.user) {
      setFormValue({ loading: false, sended: false });
    }
  };

  return (
    <Template
      header={{
        template: "clean",
        position: "solid",
        background: "bg-zinc-900",
      }}
      footer={{
        template: "clean",
      }}
    >
      <div className="container-medium">
        <div className="py-6 md:py-20">
          <div className="max-w-md mx-auto">
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
              method="POST"
            >
              <div className="text-center mb-4 md:mb-10">
                <h3 className="font-title text-zinc-900 font-bold text-4xl text-center">
                  Restrito
                </h3>
                <div className="pt-2">
                  Entre na sua conta ou faça seu cadastro
                </div>
              </div>

              <div className="form-group">
                <Label>E-mail</Label>
                <Input
                  onChange={(e: any) => {
                    setFormValue({ email: e.target.value });
                  }}
                  value={form.email ?? ""}
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
                  placeholder="*******"
                  required
                />
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
                <Button loading={form.loading}>Acessar</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default function Restrito() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      language="pt-BR"
    >
      <RestritoContent />
    </GoogleReCaptchaProvider>
  );
}
