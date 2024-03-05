import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { decode as base64_decode } from "base-64";
import { AuthContext } from "@/src/contexts/AuthContext";
import { Button, Input, Label } from "@/src/components/ui/form";

interface QueryType {
  ref?: string;
}

const FormInitialType = {
  sended: false,
  loading: false,
  email: "",
  password: "",
  alert: "",
};

export default function Login() {
  const { SignIn } = useContext(AuthContext);

  /* FORM */
  const router = useRouter();
  const query: QueryType = router.query;

  if (!!query.ref) FormInitialType.email = base64_decode(query.ref);

  const [form, setForm] = useState(FormInitialType);

  const setFormValue = (value: any) => {
    setForm({ ...form, ...value });
  };

  useEffect(() => {
    if (!!window && !query.ref) window.location.href = "/acesso";
  }, [query.ref]);
  /* --- */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormValue({ loading: true, alert: "" });

    const request: any = await SignIn({
      email: form.email,
      password: form.password,
    });

    if (request.status == 200 && !!request?.user?.email) {
      if (request?.user?.person == "partner") {
        router.push("/painel");
      } else {
        router.push("/dashboard");
      }
    } else if (request.status == 422) {
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

  return (
    <Template
      metaPage={{
        title: `Login`,
        description: "",
        url: `login`,
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
        <div className="relative py-20">
          <div className="hidden md:block mb-10 lg:-mb-5">
            <Link passHref href="/acesso">
              <div className="flex items-center h-fit md:text-lg gap-2 text-zinc-900">
                <Icon icon="fa-long-arrow-left" />
                <div className="font-bold font-title">Voltar</div>
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
                <div className="text-center mb-14 md:mb-10">
                  <h3 className="font-title text-zinc-900 font-bold text-3xl md:text-4xl text-center">
                    Bem vindo ao Fiestou
                  </h3>
                  <div className="pt-2 text-sm md:text-base">
                    Entre na sua conta ou faça seu cadastro
                  </div>
                </div>

                <div className="flex pb-4 md:py-4">
                  <div className="w-full text-zinc-900">{form.email}</div>
                  <Link
                    href="/acesso"
                    className="underline text-zinc-900 text-sm font-semibold whitespace-nowrap"
                  >
                    Alterar e-mail
                  </Link>
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

                <div className="flex py-4 items-center gap-10">
                  <label className="text-sm flex gap-2 leading-tight w-full">
                    <div className="pt-[2px]">
                      <input type="checkbox" />
                    </div>
                    <div className="">Continuar conectado</div>
                  </label>
                  <div>
                    <Link
                      href="/recuperar"
                      className="underline text-zinc-900 text-sm font-semibold whitespace-nowrap"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>

                {!!form.alert && (
                  <div className="py-3 pl-4 bg-red-50 text-red-600 rounded-md text-center">
                    {form.alert}
                  </div>
                )}

                <div className="form-group">
                  <Button loading={form.loading}>Acessar</Button>
                </div>

                <div className="text-center pt-4 text-sm">
                  Ainda não possue cadastro na plataforma?
                  <br />
                  <Link
                    passHref
                    className="underline text-zinc-900"
                    href="/acesso"
                  >
                    Cadastre-se
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}
