import Api from "@/src/services/api";
import { BankAccountType, UserType } from "@/src/models/user";
import { useRouter } from "next/router";
import Template from "@/src/template";
import Link from "next/link";
import { Button, Label, Select } from "@/src/components/ui/form";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { useEffect, useState } from "react";
import { WithdrawType } from "@/src/models/withdraw";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

const formInitial = {
  placeholder: true,
  sended: false,
  loading: false,
};

export default function Saque({ user }: { user: UserType }) {
  const api = new Api();

  const router = useRouter();
  const { slug } = router.query;

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [partner, setPartner] = useState({} as UserType);

  const [withdraw, setWithdraw] = useState({} as WithdrawType);
  const handleWithdraw = (value: any) => {
    setWithdraw({ ...withdraw, ...value });
  };

  const [bankAccount, setBankAccount] = useState({} as BankAccountType);

  const getWithdraw = async () => {
    handleForm({ placeholder: true });

    const request: any = await api.bridge({
      method: "post",
      url: "withdraw/get",
      data: {
        slug: slug,
      },
    });

    setPartner(request.data.partner);
    setBankAccount(request.data.withdraw?.bankAccount);
    setWithdraw(request.data.withdraw);

    handleForm({ placeholder: false });
  };

  const submitWithdraw = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const request: any = await api.bridge({
      method: "post",
      url: "withdraw/update",
      data: withdraw,
    });

    handleForm({ loading: false });
  };

  useEffect(() => {
    if (!!slug) {
      getWithdraw();
    }
  }, [slug]);

  const statusLabel =
    withdraw?.status == 1
      ? "Aprovado"
      : withdraw?.status == 0
      ? "Em análise"
      : "Negado";

  const statusColor =
    withdraw?.status == 1
      ? "bg-green-100 text-green-700"
      : withdraw?.status == 0
      ? "bg-blue-100 text-blue-700"
      : "bg-red-100 text-red-700";

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "admin",
          position: "solid",
        }}
      >
        <section>
          <div className="container-medium pt-8">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/saques", name: "Saques" },
                { url: `/admin/saques/${slug}`, name: `#${withdraw?.id || ""}` },
              ]}
            />
          </div>
        </section>

        <section>
          <div className="container-medium py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-title font-bold text-3xl text-zinc-900">
                Pedido de Saque
              </h1>
              <span
                className={`inline-block text-sm px-4 py-1.5 rounded-full font-medium ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>

            {form.placeholder ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
                <span className="ml-3 text-zinc-500">Carregando...</span>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_20rem] gap-6">
                <div className="grid gap-6">
                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                      Informações do Saque
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-zinc-500">Código</p>
                        <p className="text-lg font-medium text-zinc-900">
                          #{withdraw?.id ?? ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Valor</p>
                        <p className="text-lg font-medium text-zinc-900">
                          R$ {moneyFormat(withdraw?.value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Solicitado em</p>
                        <p className="text-sm text-zinc-700">
                          {getExtenseData(withdraw?.created_at)}
                        </p>
                      </div>
                      {withdraw?.status != 0 && (
                        <div>
                          <p className="text-sm text-zinc-500">
                            {withdraw?.status == 1 ? "Aprovado" : "Negado"} em
                          </p>
                          <p className="text-sm text-zinc-700">
                            {getExtenseData(withdraw?.updated_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                      Conta Bancária
                    </h3>
                    <div className="grid gap-0 text-sm">
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                        <span className="text-zinc-500">Banco</span>
                        <span className="text-zinc-900">{bankAccount?.bank ?? "-"}</span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                        <span className="text-zinc-500">Conta</span>
                        <span className="text-zinc-900">{bankAccount?.accountNumber ?? "-"}</span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                        <span className="text-zinc-500">Agência</span>
                        <span className="text-zinc-900">{bankAccount?.agence ?? "-"}</span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                        <span className="text-zinc-500">Operação</span>
                        <span className="text-zinc-900">{bankAccount?.operation ?? "-"}</span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                        <span className="text-zinc-500">Descrição</span>
                        <span className="text-zinc-900">{bankAccount?.title ?? "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                      Dados do Parceiro
                    </h3>
                    <div className="grid gap-0 text-sm">
                      {partner?.name && (
                        <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                          <span className="text-zinc-500">Nome</span>
                          <span className="text-zinc-900">{partner.name}</span>
                        </div>
                      )}
                      {partner?.email && (
                        <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                          <span className="text-zinc-500">E-mail</span>
                          <span className="text-zinc-900">{partner.email}</span>
                        </div>
                      )}
                      {partner?.phone && (
                        <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                          <span className="text-zinc-500">Telefone</span>
                          <span className="text-zinc-900">{partner.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-white border rounded-xl p-6 sticky top-24">
                    {withdraw?.status == 0 ? (
                      <form onSubmit={(e: any) => submitWithdraw(e)}>
                        <div className="mb-4">
                          <Label style="float">Status</Label>
                          <Select
                            name="status"
                            value={withdraw?.status}
                            onChange={(e: any) =>
                              handleWithdraw({ status: e.target.value })
                            }
                            options={[
                              { name: "Aguardando análise", value: 0 },
                              { name: "Aprovado", value: 1 },
                              { name: "Negado", value: 2 },
                            ]}
                          />
                        </div>
                        <Button loading={form.loading} className="w-full py-3">
                          Salvar
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center">
                        <span
                          className={`inline-block text-sm px-4 py-1.5 rounded-full font-medium ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                        <p className="text-sm text-zinc-500 mt-2">
                          {getExtenseData(withdraw?.updated_at)}
                        </p>
                      </div>
                    )}
                    <Link
                      href="/admin/saques"
                      className="block text-center text-sm text-zinc-500 hover:text-zinc-700 mt-4"
                    >
                      Voltar para saques
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </Template>
    )
  );
}
