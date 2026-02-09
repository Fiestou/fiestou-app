import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { useRouter } from "next/router";
import Template from "@/src/template";
import { useEffect, useState } from "react";
import UserEditAdmin from "@/src/components/shared/UserEditAdmin";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const { id } = ctx.query;

  return {
    props: {
      id: id,
    },
  };
}

export default function AdminPartner({ id }: any) {
  const router = useRouter();
  const api = new Api();

  const [partner, setPartner] = useState({} as UserType);
  const [pagarme, setPagarme] = useState<any>(null);
  const [pagarmeLoading, setPagarmeLoading] = useState(false);

  const getPartner = async () => {
    const request: any = await api.bridge({
      method: "get",
      url: "users/get",
      data: {
        ref: id,
        type: "partner",
      },
    });

    if (request.response) {
      setPartner(request.data);
    }
  };

  const getPaymentInfo = async () => {
    setPagarmeLoading(true);
    const request: any = await api.bridge({
      method: "get",
      url: "admin/partner/payment",
      data: { user_id: id },
    });

    if (request.response) {
      setPagarme(request.data);
    }
    setPagarmeLoading(false);
  };

  useEffect(() => {
    getPartner();
    getPaymentInfo();
  }, []);

  if (router.isFallback) {
    return null;
  }

  const maskDocument = (doc: string) => {
    if (!doc) return "";
    const cleaned = doc.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `***${cleaned.slice(3, 9)}**`;
    }
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.***.***/****-${cleaned.slice(12)}`;
    }
    return doc;
  };

  const bankNames: Record<string, string> = {
    "001": "Banco do Brasil",
    "033": "Santander",
    "104": "Caixa Econômica",
    "237": "Bradesco",
    "341": "Itaú",
    "260": "Nubank",
    "077": "Inter",
    "336": "C6 Bank",
    "290": "PagBank",
    "403": "Cora",
    "756": "Sicoob",
  };

  return (
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
              { url: "/admin/parceiros", name: "Parceiros" },
              { url: `/admin/parceiros/${id}`, name: partner?.name || "Editar" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              {partner?.name || "Parceiro"}
            </h1>
          </div>

          {!!partner && (
            <UserEditAdmin user={partner} redirect="/admin/parceiros" />
          )}

          <div className="mt-6">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                Pagar.me - Dados do Recebedor
              </h3>

              {pagarmeLoading ? (
                <div className="flex items-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-zinc-400"></div>
                  <span className="ml-2 text-sm text-zinc-500">Carregando...</span>
                </div>
              ) : !pagarme ? (
                <p className="text-sm text-zinc-400 py-4">Não foi possível carregar dados de pagamento</p>
              ) : !pagarme.has_store ? (
                <div className="py-4">
                  <span className="inline-block text-xs px-3 py-1.5 rounded-full font-medium bg-red-100 text-red-700">
                    Sem loja cadastrada
                  </span>
                  <p className="text-sm text-zinc-400 mt-2">
                    Este parceiro ainda não possui uma loja vinculada.
                  </p>
                </div>
              ) : !pagarme.pagarme_registered ? (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block text-xs px-3 py-1.5 rounded-full font-medium bg-amber-100 text-amber-700">
                      Cadastro pendente
                    </span>
                    {pagarme.store_name && (
                      <span className="text-sm text-zinc-500">Loja: {pagarme.store_name}</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">
                    O parceiro ainda não completou o cadastro no Pagar.me.
                  </p>
                </div>
              ) : (
                <div className="grid gap-0 text-sm">
                  <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                    <span className="text-zinc-500">Status</span>
                    <span className="text-green-600 font-medium">Cadastrado</span>
                  </div>
                  <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                    <span className="text-zinc-500">ID Recebedor</span>
                    <span className="text-zinc-900 font-mono text-xs">{pagarme.recipient?.code}</span>
                  </div>
                  <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                    <span className="text-zinc-500">Tipo</span>
                    <span className="text-zinc-900">
                      {pagarme.recipient?.type_enum === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                    <span className="text-zinc-500">Nome/Razão Social</span>
                    <span className="text-zinc-900">
                      {pagarme.recipient?.company_name || pagarme.recipient?.name}
                    </span>
                  </div>
                  {pagarme.recipient?.trading_name && (
                    <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                      <span className="text-zinc-500">Nome Fantasia</span>
                      <span className="text-zinc-900">{pagarme.recipient.trading_name}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                    <span className="text-zinc-500">Documento</span>
                    <span className="text-zinc-900">{maskDocument(pagarme.recipient?.document)}</span>
                  </div>
                  <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                    <span className="text-zinc-500">E-mail</span>
                    <span className="text-zinc-900">{pagarme.recipient?.email}</span>
                  </div>

                  {pagarme.phone?.number && (
                    <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                      <span className="text-zinc-500">Telefone</span>
                      <span className="text-zinc-900">
                        ({pagarme.phone.area_code}) {pagarme.phone.number}
                      </span>
                    </div>
                  )}

                  {pagarme.address?.street && (
                    <>
                      <div className="border-t my-2"></div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                        <span className="text-zinc-500">Endereço</span>
                        <span className="text-zinc-900">
                          {pagarme.address.street}, {pagarme.address.street_number} - {pagarme.address.neighborhood}
                        </span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                        <span className="text-zinc-500">Cidade/UF</span>
                        <span className="text-zinc-900">
                          {pagarme.address.city} / {pagarme.address.state}
                        </span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                        <span className="text-zinc-500">CEP</span>
                        <span className="text-zinc-900">{pagarme.address.zip_code}</span>
                      </div>
                    </>
                  )}

                  {pagarme.bank?.bank && (
                    <>
                      <div className="border-t my-2"></div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                        <span className="text-zinc-500">Banco</span>
                        <span className="text-zinc-900">
                          {bankNames[pagarme.bank.bank] || pagarme.bank.bank}
                        </span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                        <span className="text-zinc-500">Agência</span>
                        <span className="text-zinc-900">{pagarme.bank.branch_number}</span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                        <span className="text-zinc-500">Conta</span>
                        <span className="text-zinc-900">
                          {pagarme.bank.account_number}
                          {pagarme.bank.type === "checking" ? " (Corrente)" : " (Poupança)"}
                        </span>
                      </div>
                      <div className="grid grid-cols-[10rem_1fr] py-2.5 px-3">
                        <span className="text-zinc-500">Titular</span>
                        <span className="text-zinc-900">{pagarme.bank.holder_name}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
