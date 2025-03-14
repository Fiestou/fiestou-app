import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { getExtenseData, moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Saque() {
  const api = new Api();

  const [origin, setOrigin] = useState("todos");

  const [withdrawList, setWithdrawList] = useState([] as Array<any>);
  const getWithdraw = async () => {
    let request: any = await api.bridge({
      method: 'post',
      url: "withdraw/list",
    });

    setWithdrawList(request.data);
  };

  useEffect(() => {
    if (!!window) {
      getWithdraw();
    }
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
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/saques", name: "Saques" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="w-full flex items-center">
              <Link passHref href="/admin/saques">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                <span className="font-title font-bold">Saque</span>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-fit">
              <div>
                <button
                  type="button"
                  className="rounded-xl whitespace-nowrap border py-4 text-zinc-900 font-semibold px-8"
                >
                  Filtrar{" "}
                  <Icon
                    icon="fa-chevron-down"
                    type="far"
                    className="text-xs ml-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border">
            <div className="flex bg-zinc-100 p-8 gap-8 font-bold text-zinc-900 font-title">
              <div className="w-full">Código</div>
              <div className="w-[32rem]">Valor</div>
              <div className="w-[48rem]">Solicitado em</div>
              <div className="w-[32rem]">Status</div>
              <div className="w-[16rem]"></div>
            </div>
            {!!withdrawList?.length &&
              withdrawList
                .filter((itm: any) => itm.origin == origin || origin == "todos")
                .map((item: any, key: any) => (
                  <div
                    key={key}
                    className="flex border-t p-8 gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                  >
                    <div className="w-full">
                      <div>{item.code}</div>
                    </div>
                    <div className="w-[32rem]">
                      <div className="py-2">R$ {moneyFormat(item.value)}</div>
                    </div>
                    <div className="w-[48rem]">
                      <div>{getExtenseData(item.created_at)}</div>
                    </div>
                    <div className="w-[32rem] text-center">
                      {item.status == 1 ? (
                        <div className="rounded-md bg-green-100 text-green-900 py-2">
                          Aprovado
                        </div>
                      ) : item.status == 0 ? (
                        <div className="rounded-md bg-blue-100 text-blue-900 py-2">
                          Em análise
                        </div>
                      ) : (
                        <div className="rounded-md bg-zinc-100 py-2">
                          Negado
                        </div>
                      )}
                    </div>
                    <div className="w-[16rem] text-center flex gap-2">
                      <Link
                        href={`saques/${item?.code}`}
                        className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3"
                      >
                        <Icon icon="fa-eye" type="far" />
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
          <div className="pt-4">Mostrando 1 página de 1 com 4 produtos</div>
        </div>
      </section>
    </Template>
  );
}
