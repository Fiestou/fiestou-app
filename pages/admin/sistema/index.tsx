import { Button, Input } from "@/src/components/ui/form";
import List from "@/src/components/ui/form/ListUI";
import Options from "@/src/components/ui/form/OptionsUI";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  const request: any = await api.graph(
    {
      url: "content/graph",
      data: [
        {
          model: "roles",
        },
      ],
    },
    ctx
  );

  const roles = request?.data?.query?.roles ?? [];

  return {
    props: {
      roles: roles[0] ?? {},
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
};

export default function Sistema({ roles }: { roles: any }) {
  const api = new Api();
  const router = useRouter();

  // console.log(roles, "<<--");

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [data, setData] = useState(roles);
  const handleData = (value: Object) => {
    setData((data: any) => ({ ...data, ...value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const request: any = await api.graph({
      url: "content/graph",
      data: [
        {
          method: "register",
          model: "roles",
          title: "roles",
          slug: "roles",
          content: data,
        },
      ],
    });

    handleForm({ loading: false, sended: request.response });
  };

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
                            handleData({ platformCommission: e.target.value })
                          }
                          value={data.platformCommission}
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
                            handleData({ kmPrice: e.target.value })
                          }
                          value={data.kmPrice}
                          required
                        />
                      </div>
                      <div className="">
                        <div className="flex gap-2 items-end">
                          <label className="text-zinc-900 font-bold">
                            Região de atendimento
                          </label>
                          <span className="text-xs pb-[3px]">
                            (separe os intrvalos de cep por vírgula)
                          </span>
                        </div>
                        <Input
                          placeholder="58000001...58999999"
                          type="text"
                          name="areas"
                          onChange={(e: any) =>
                            handleData({ areas: e.target.value })
                          }
                          value={data.areas}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 pb-6">Planos</h4>
                    <List
                      mainField="plan_title"
                      items={data.plans}
                      onChange={(value: any) => handleData({ plans: value })}
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
    </Template>
  );
}
