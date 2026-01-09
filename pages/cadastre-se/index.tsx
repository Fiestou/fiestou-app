import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { decode as base64_decode } from "base-64";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button, Input, Label } from "@/src/components/ui/form";
import { PasswordRules } from "@/src/components/ui/PasswordRules";
import { RecaptchaNotice } from "@/src/components/ui/RecaptchaNotice";
import { usePasswordValidation } from "@/src/hooks/usePasswordValidation";
import { useEmailValidation } from "@/src/hooks/useEmailValidation";
import { registerClient } from "@/src/services/auth";
import { formatName, formatPhone } from "@/src/components/utils/FormMasks";

export async function getServerSideProps() {
  const api = new Api();

  const request: any = await api.content({ method: "get", url: "register" });

  return {
    props: {
      Register: request?.data?.Register ?? {},
      DataSeo: request?.data?.DataSeo ?? {},
      Scripts: request?.data?.Scripts ?? {},
    },
  };
}

interface Props {
  Register: any;
  DataSeo: any;
  Scripts: any;
}

function CadastreSeContent({ Register, DataSeo, Scripts }: Props) {
  const api = new Api();
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Hooks de validação
  const emailValidation = useEmailValidation();
  const passwordValidation = usePasswordValidation();

  // Estado do form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Inicializa email se veio por query
  const refEmail = base64_decode((router.query.ref as string) ?? "");
  if (refEmail && !emailValidation.email) {
    emailValidation.setEmail(refEmail);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailValidation.isValid) return;
    if (!passwordValidation.isValid) return;
    if (!executeRecaptcha) {
      console.error("reCAPTCHA não carregado");
      return;
    }

    setLoading(true);

    const recaptchaToken = await executeRecaptcha("register");

    const result = await registerClient(api, {
      name,
      email: emailValidation.email,
      phone,
      password: passwordValidation.password,
      re_password: passwordValidation.repeat,
      recaptcha_token: recaptchaToken,
    });

    setLoading(false);

    if (result.response) {
      window.location.href = "/acesso?modal=register";
    }
  };

  const canSubmit =
    name.trim() &&
    emailValidation.isValid &&
    passwordValidation.isValid &&
    phone.replace(/\D/g, "").length >= 10;

  return (
    <Template
      scripts={Scripts}
      metaPage={{ title: `Cadastre-se | ${DataSeo?.site_text}`, url: "cadastre-se" }}
      header={{ template: "clean", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <div className="container-medium">
        <div className="relative py-6 md:py-20">
          {/* Voltar */}
          <div className="mb-10 lg:-mb-5">
            <Link href="/acesso" className="flex items-center gap-2 text-zinc-900 md:text-lg">
              <Icon icon="fa-long-arrow-left" />
              <span className="font-bold font-title">voltar</span>
            </Link>
          </div>

          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="text-center mb-8 md:mb-10">
                <h3 className="font-title text-zinc-900 font-bold text-4xl">Bem vindo ao Fiestou</h3>
                <p className="pt-2">Entre na sua conta ou faça seu cadastro</p>
              </div>

              {/* Nome */}
              <div className="form-group">
                <Label>Nome</Label>
                <Input
                  value={name}
                  onChange={(e: any) => setName(formatName(e.target.value))}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <Label>E-mail</Label>
                <Input
                  value={emailValidation.email}
                  onChange={(e: any) => emailValidation.setEmail(e.target.value)}
                  type="email"
                  placeholder="Informe seu melhor e-mail"
                  required
                />
                {emailValidation.error && (
                  <span className="text-red-500 text-sm">{emailValidation.error}</span>
                )}
              </div>

              {/* Telefone */}
              <div className="form-group">
                <Label>Celular</Label>
                <Input
                  value={phone}
                  onChange={(e: any) => setPhone(formatPhone(e.target.value))}
                  placeholder="(00) 9 0000-0000"
                  required
                />
                <span className="text-sm">* Usaremos seu contato apenas para notificações de pedidos.</span>
              </div>

              {/* Senha */}
              <div className="form-group">
                <Label>Senha</Label>
                <Input
                  value={passwordValidation.password}
                  onChange={(e: any) => passwordValidation.setPassword(e.target.value)}
                  type="password"
                  placeholder="Crie sua senha"
                  required
                />
              </div>

              {/* Confirmar senha */}
              <div className="form-group">
                <Label>Repita a senha</Label>
                <Input
                  value={passwordValidation.repeat}
                  onChange={(e: any) => passwordValidation.setRepeat(e.target.value)}
                  type="password"
                  placeholder="Confirme sua senha"
                  required
                />
              </div>

              {/* Regras de senha */}
              <div className="form-group">
                <PasswordRules
                  rules={passwordValidation.rules}
                  errors={passwordValidation.errors}
                  completed={passwordValidation.completed}
                />
              </div>

              {/* Termos */}
              {Register?.terms_text && (
                <div
                  className="mt-4 text-xs leading-tight"
                  dangerouslySetInnerHTML={{ __html: Register.terms_text }}
                />
              )}

              <RecaptchaNotice />

              {/* Submit */}
              <div className="form-group">
                <Button disable={!canSubmit} loading={loading}>
                  Cadastrar agora
                </Button>
              </div>

              {/* Link login */}
              <div className="text-center pt-4 text-sm">
                Já possui cadastro na plataforma?
                <br />
                <Link href="/acesso" className="underline text-zinc-900">
                  Fazer Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default function CadastreSe(props: Props) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      language="pt-BR"
    >
      <CadastreSeContent {...props} />
    </GoogleReCaptchaProvider>
  );
}
