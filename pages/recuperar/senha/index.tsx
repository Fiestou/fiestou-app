import { Button, Input, Label } from "@/src/components/ui/form";
import Template from "@/src/template";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";

export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page as DataSeo",
          filter: [
            {
              key: "slug",
              value: "seo",
              compare: "=",
            },
          ],
        },
        {
          model: "page as Scripts",
          filter: [
            {
              key: "slug",
              value: "scripts",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  const DataSeo = request?.data?.query?.DataSeo ?? [];
  const Scripts = request?.data?.query?.Scripts ?? [];

  return {
    props: {
      DataSeo: DataSeo[0] ?? {},
      Scripts: Scripts[0] ?? {},
    },
    revalidate: 60 * 60 * 60,
  };
}

const formInitial = {
  sended: false,
  loading: false,
  email: "",
};

export default function Senha({
  DataSeo,
  Scripts,
}: {
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();
  const router = useRouter();

  const query: any = router.query;

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm({ ...form, ...value });
  };

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

  const [password, setPassword] = useState("" as string);
  const [repeat, setRepeat] = useState("" as string);

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

    if (
      !errors.length &&
      !!complete.length &&
      !!query?.token &&
      !!query?.email
    ) {
      setFormValue({ loading: true });

      const request: any = await api.bridge({
        method: "post",
        url: "auth/redefine",
        data: {
          password: password,
          repeat: repeat,
          token: query.token,
          email: query.email,
        },
      });

      console.log(request, "submit");

      if (!!request.response) {
        window.location.href = "/acesso";
      } else {
        setFormValue({ loading: false });
      }
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
        <div className="relative py-20">
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
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
                method="POST"
              >
                <div className="text-center mb-8 md:mb-10">
                  <h3 className="font-title text-zinc-900 font-bold text-3xl md:text-4xl text-center">
                    Redefinir senha
                  </h3>
                  <div className="pt-2 text-sm md:text-base">
                    Escolha uma senha segura para seguir
                  </div>
                </div>

                <div className="form-group">
                  <Label>Nova senha</Label>
                  <Input
                    onChange={(e: any) => {
                      setPassword(e.target.value);
                    }}
                    type="password"
                    name="password"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label>Repita a senha</Label>
                  <Input
                    onChange={(e: any) => {
                      setRepeat(e.target.value);
                    }}
                    type="password"
                    name="re_password"
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

                <div className="form-group">
                  <Button
                    disable={!!errors.length && !!complete.length}
                    loading={form.loading}
                  >
                    Enviar
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
