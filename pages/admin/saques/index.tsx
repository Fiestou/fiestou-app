import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { getExtenseData, moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import FilterWithdraw from "@/src/components/admin/withdraw/filter-withdraw/FilterWithdraw";

export default function Saque() {
  const api = new Api();

  const [origin, setOrigin] = useState("todos");
  const [withdrawList, setWithdrawList] = useState([] as Array<any>);
  const [loading, setLoading] = useState(true);

  const getWithdraw = async () => {
    setLoading(true);
    let request: any = await api.bridge({
      method: "post",
      url: "withdraw/list",
    });
    if (request?.data) {
      setWithdrawList(request.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      getWithdraw();
    }
  }, []);

  const filtered = withdrawList.filter(
    (itm: any) => origin === "todos" || String(itm.status) === origin
  );

  const totalValue = withdrawList.reduce(
    (sum: number, i: any) => sum + Number(i.value || 0),
    0
  );
  const pendingCount = withdrawList.filter((i: any) => i.status == 0).length;
  const approvedCount = withdrawList.filter((i: any) => i.status == 1).length;
  const deniedCount = withdrawList.filter(
    (i: any) => i.status != 0 && i.status != 1
  ).length;

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
              { url: "/admin/saques", name: "Saques" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Solicitações de Saque
            </h1>
            <FilterWithdraw value={origin} onChange={setOrigin} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-2xl font-bold text-zinc-900">
                {withdrawList.length}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Em análise</p>
              <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Aprovados</p>
              <p className="text-2xl font-bold text-green-600">
                {approvedCount}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Valor total</p>
              <p className="text-2xl font-bold text-zinc-900">
                R$ {moneyFormat(totalValue)}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_8rem_1fr_8rem_4rem] gap-4 px-5 py-3 bg-zinc-50 border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div>Código</div>
                <div>Valor</div>
                <div>Solicitado em</div>
                <div className="text-center">Status</div>
                <div></div>
              </div>
              {filtered.length > 0 ? (
                filtered.map((item: any, key: any) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_8rem_1fr_8rem_4rem] gap-4 px-5 py-4 border-b last:border-0 hover:bg-zinc-50 transition-colors items-center"
                  >
                    <div className="font-medium text-zinc-900">{item.code}</div>
                    <div className="text-sm font-medium text-zinc-900">
                      R$ {moneyFormat(item.value)}
                    </div>
                    <div className="text-sm text-zinc-600">
                      {getExtenseData(item.created_at)}
                    </div>
                    <div className="text-center">
                      {item.status == 1 ? (
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-green-100 text-green-700">
                          Aprovado
                        </span>
                      ) : item.status == 0 ? (
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                          Em análise
                        </span>
                      ) : (
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
                          Negado
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <Link
                        href={`saques/${item?.code}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-blue-100 hover:text-blue-600 transition-colors text-zinc-500"
                      >
                        <Icon icon="fa-eye" type="far" className="text-xs" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-400">
                  <Icon
                    icon="fa-inbox"
                    type="far"
                    className="text-3xl mb-2"
                  />
                  <p>Nenhuma solicitação encontrada</p>
                </div>
              )}
            </div>
          )}
          <div className="pt-3 text-sm text-zinc-400">
            Mostrando {filtered.length} solicitações
          </div>
        </div>
      </section>
    </Template>
  );
}
