import { Button, Input } from "@/src/components/ui/form";
import List from "@/src/components/ui/form/ListUI";
import Options from "@/src/components/ui/form/OptionsUI";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const formInitial = {
  sended: false,
  loading: false,
};

export default function Sistema() {
  const api = new Api();
  const router = useRouter();
  const [form, setForm] = useState(formInitial);
  const handleForm = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [roles, setRoles] = useState({} as any);
  const handleRoles = (value: Object) => {
    setRoles((data: any) => ({ ...data, ...value }));
  };

  const getRoles = async () => {
    const request: any = await api.bridge({
      method: "get",
      url: "admin/content/get",
      data: {
        type: "roles",
        slug: "roles",
      },
    });

    if (request.response) {
      setRoles(request.data);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const request: any = await api.bridge({
      method: 'post',
      url: "admin/content/register",
      data: {
        type: "roles",
        slug: "roles",
        title: "roles",
        model: "roles",
        content: roles,
      },
    });

    handleForm({ loading: false, sended: request.response });
  };

  useEffect(() => {
    getRoles();
  }, []);

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      {!!roles?.id ? (
        <>
          <section className="">
            <div className="container-medium pt-12 pb-8 md:py-12">
              <div className="flex">
                <div className="w-full">Produtos {">"} Title</div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="underline">Precisa de ajuda?</div>{" "}
                  <Icon icon="fa-question-circle" />
                </div>
              </div>
              <div className="flex items-center mt-10">
                <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                  Regras de negócio
                </div>
              </div>
            </div>
          </section>
          <section className="">
            <div className="container-medium pb-12">
              <form
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
                method="POST"
              >
                <div className="flex gap-20">
                  <div className="w-full grid gap-8">
                    <div className="grid gap-6">
                      <div className="border-t pt-4 pb-2">
                        <h4 className="text-2xl text-zinc-900 pb-6">
                          Valores de split
                        </h4>
                        <div className="grid gap-8">
                          <div className="">
                            <div className="flex gap-2 items-end">
                              <label className="text-zinc-900 font-bold">
                                Comissão da plataforma
                              </label>
                              <span className="text-xs pb-[3px]">(em %)</span>
                            </div>
                            <Input
                              type="text"
                              name="comissao_plataforma"
                              onChange={(e: any) =>
                                handleRoles({
                                  platformCommission: e.target.value,
                                })
                              }
                              value={roles.platformCommission}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4 pb-2">
                        <h4 className="text-2xl text-zinc-900 pb-6">
                          Valores de entrega
                        </h4>
                        <div className="grid gap-8">
                          <div className="">
                            <div className="flex gap-2 items-end">
                              <label className="text-zinc-900 font-bold">
                                Valor de KM rodado
                              </label>
                              <span className="text-xs pb-[3px]">
                                (valor fixo/km)
                              </span>
                            </div>
                            <Input
                              type="text"
                              name="valor_km"
                              onChange={(e: any) =>
                                handleRoles({ kmPrice: e.target.value })
                              }
                              value={roles.kmPrice}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4 pb-2">
                        <h4 className="text-2xl text-zinc-900 pb-6">Planos</h4>
                        <List
                          mainField="plan_title"
                          items={roles.plans}
                          onChange={(value: any) =>
                            handleRoles({ plans: value })
                          }
                          form={[
                            {
                              label: "Título",
                              name: "plan_title",
                              type: "input",
                            },
                            {
                              label: "Valor",
                              name: "plan_price",
                              type: "input",
                            },
                            {
                              label: "Descrição",
                              name: "plan_description",
                              type: "textarea",
                            },
                            {
                              label: "Recursos",
                              name: "plan_resources",
                              type: "textarea",
                            },
                            {
                              label: "Link do produto",
                              name: "plan_url",
                              type: "input",
                            },
                          ]}
                        />
                      </div>
                    </div>
                    <div className="flex border-t pt-4 items-center gap-4">
                      <div className="w-full">
                        <Link
                          passHref
                          href="/painel/produtos/"
                          className="text-zinc-900"
                        >
                          Cancelar
                        </Link>
                      </div>
                      <div>
                        <Button loading={form.loading} className="px-10">
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full max-w-[20rem]"></div>
                </div>
              </form>
            </div>
          </section>
        </>
      ) : (
        <></>
      )}
    </Template>
  );
}
