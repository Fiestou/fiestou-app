import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { decode as base64Decode } from "base-64";
import { getSession } from "next-auth/react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { SocialAuth } from "@/src/components/pages/acesso/NextAuth";
import { Button, Input, Label } from "@/src/components/ui/form";
import { PasswordRules } from "@/src/components/ui/PasswordRules";
import { RecaptchaNotice } from "@/src/components/ui/RecaptchaNotice";
import { registerClient } from "@/src/services/auth";
import { useEmailValidation } from "@/src/hooks/useEmailValidation";
import { usePasswordValidation } from "@/src/hooks/usePasswordValidation";
import { formatName } from "@/src/components/utils/FormMasks";

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

  const [defaultRequest, registerRequest] = await Promise.all([
    api.content({ method: "get", url: "default" }),
    api.content({ method: "get", url: "register" }),
  ]);

  return {
    props: {
      Register: registerRequest?.data?.Register ?? {},
      DataSeo:
        registerRequest?.data?.DataSeo ?? defaultRequest?.data?.DataSeo ?? {},
      Scripts:
        registerRequest?.data?.Scripts ?? defaultRequest?.data?.Scripts ?? {},
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

  const emailValidation = useEmailValidation({ checkAvailability: false });
  const passwordValidation = usePasswordValidation();
  const email = emailValidation.email;
  const setEmail = emailValidation.setEmail;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const refEmail = useMemo(() => {
    const value = (router.query.ref as string) ?? "";
    if (!value) {
      return "";
    }

    try {
      return base64Decode(value);
    } catch {
      return "";
    }
  }, [router.query.ref]);

  useEffect(() => {
    if (refEmail && !email) {
      setEmail(refEmail);
    }
  }, [email, refEmail, setEmail]);

  const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();

  const canSubmit =
    firstName.trim().length > 1 &&
    lastName.trim().length > 1 &&
    emailValidation.isValid &&
    passwordValidation.isValid &&
    !loading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    if (!executeRecaptcha) {
      setSubmitError("Não foi possível validar a segurança agora. Tente novamente.");
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const recaptchaToken = await executeRecaptcha("register");

      const result = await registerClient(api, {
        name: fullName,
        email,
        password: passwordValidation.password,
        re_password: passwordValidation.repeat,
        recaptcha_token: recaptchaToken,
        type: "client",
      });

      if (result.response) {
        window.location.href = "/acesso?modal=register";
        return;
      }

      setSubmitError(result.message || result.error || "Não foi possível criar sua conta.");
    } catch {
      setSubmitError("Não foi possível criar sua conta agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Template
      scripts={Scripts}
      metaPage={{ title: `Criar conta | ${DataSeo?.site_text}`, url: "cadastre-se" }}
      header={{ template: "clean", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <div className="container-medium">
        <div className="relative py-6 md:py-20">
          <div className="mb-10 lg:-mb-5">
            <Link href="/acesso" className="flex items-center gap-2 text-zinc-900 md:text-lg">
              <Icon icon="fa-long-arrow-left" />
              <span className="font-bold font-title">voltar</span>
            </Link>
          </div>

          <div className="mx-auto max-w-md">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
              <div className="text-center">
                <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
                  Cadastro de cliente
                </span>
                <h1 className="mt-4 font-title text-3xl font-bold text-zinc-900 md:text-4xl">
                  Crie sua conta em minutos
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 md:text-base">
                  Use seu e-mail e senha ou, se preferir, continue com Google.
                </p>
              </div>

              <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="form-group">
                    <Label>Nome</Label>
                    <Input
                      value={firstName}
                      onChange={(e: any) => setFirstName(formatName(e.target.value))}
                      placeholder="Seu nome"
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <Label>Sobrenome</Label>
                    <Input
                      value={lastName}
                      onChange={(e: any) => setLastName(formatName(e.target.value))}
                      placeholder="Seu sobrenome"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <Label>E-mail</Label>
                  <Input
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    type="email"
                    placeholder="voce@icloud.com"
                    autoComplete="email"
                    required
                  />
                  {emailValidation.error && (
                    <span className="text-sm text-red-500">{emailValidation.error}</span>
                  )}
                </div>

                <div className="form-group">
                  <Label>Senha</Label>
                  <Input
                    value={passwordValidation.password}
                    onChange={(e: any) => passwordValidation.setPassword(e.target.value)}
                    type="password"
                    placeholder="Crie sua senha"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>Confirmar senha</Label>
                  <Input
                    value={passwordValidation.repeat}
                    onChange={(e: any) => passwordValidation.setRepeat(e.target.value)}
                    type="password"
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <PasswordRules
                  rules={passwordValidation.rules}
                  errors={passwordValidation.errors}
                  completed={passwordValidation.completed}
                />

                {Register?.terms_text && (
                  <div
                    className="text-xs leading-relaxed text-zinc-500"
                    dangerouslySetInnerHTML={{ __html: Register.terms_text }}
                  />
                )}

                <RecaptchaNotice />

                {submitError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                    {submitError}
                  </div>
                )}

                <Button disable={!canSubmit} loading={loading}>
                  Criar minha conta
                </Button>
              </form>

              <div className="my-6 flex items-center gap-4 text-sm text-zinc-400">
                <div className="h-px w-full bg-zinc-200" />
                <span>ou</span>
                <div className="h-px w-full bg-zinc-200" />
              </div>

              <SocialAuth googleLabel="Continuar com Google" />

              <div className="pt-6 text-center text-sm text-zinc-600">
                Já tem uma conta?{" "}
                <Link className="font-semibold text-zinc-900 underline" href="/acesso">
                  Fazer login
                </Link>
              </div>
            </div>
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
