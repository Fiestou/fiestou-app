import { Button, Input } from "@/src/components/ui/form";
import List from "@/src/components/ui/form/ListUI";
import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

const formInitial = {
  sended: false,
  loading: false,
};

export default function Sistema() {
  const api = new Api();
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
      method: "post",
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
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/sistema", name: "Regras de Negócio" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Regras de Negócio
            </h1>
          </div>

          {!!roles?.id ? (
            <form onSubmit={handleSubmit} method="POST">
              <div className="grid lg:grid-cols-[1fr_16rem] gap-6">
                <div className="grid gap-6">
                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-zinc-900 mb-4">
                      Valores de split
                    </h4>
                    <div>
                      <div className="flex gap-2 items-end mb-2">
                        <label className="text-sm text-zinc-700 font-medium">
                          Comissão da plataforma
                        </label>
                        <span className="text-xs text-zinc-400">(em %)</span>
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

                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-zinc-900 mb-4">
                      Valores de entrega
                    </h4>
                    <div>
                      <div className="flex gap-2 items-end mb-2">
                        <label className="text-sm text-zinc-700 font-medium">
                          Valor de KM rodado
                        </label>
                        <span className="text-xs text-zinc-400">
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

                  <div className="bg-white border rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-zinc-900 mb-4">
                      Planos
                    </h4>
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

                <div>
                  <div className="bg-white border rounded-xl p-6 sticky top-24">
                    <Button loading={form.loading} className="w-full py-3">
                      Salvar alterações
                    </Button>
                    {form.sended && (
                      <p className="text-sm text-green-600 mt-3 text-center">
                        Salvo com sucesso
                      </p>
                    )}
                    <Link
                      href="/admin"
                      className="block text-center text-sm text-zinc-500 hover:text-zinc-700 mt-3"
                    >
                      Voltar
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
