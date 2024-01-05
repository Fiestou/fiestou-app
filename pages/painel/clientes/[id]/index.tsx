import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import HelpCard from "@/src/components/common/HelpCard";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { Button, Select } from "@/src/components/ui/form";
import { getExtenseData, moneyFormat, print_r } from "@/src/helper";
import { useEffect, useState } from "react";
import UserEditAdmin from "@/src/components/shared/UserEditAdmin";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const { id } = ctx.query;
  const store = ctx.req.cookies["fiestou.store"] ?? 0;

  return {
    props: {
      id: id,
      store: store,
    },
  };
}

export default function Cliente({ id, store }: { id: number; store: number }) {
  const api = new Api();

  const [user, setUser] = useState({} as UserType);
  const [orders, setOrders] = useState([] as any);

  const getUser = async () => {
    let request: any = await api.bridge({
      url: "stores/customers",
      data: {
        id: id,
        store: store,
      },
    });

    setUser(request.data);
  };

  const getOrders = async () => {
    let request: any = await api.bridge({
      url: "suborders/list",
      data: {
        customer: id,
      },
    });

    setOrders(request.data);
  };

  useEffect(() => {
    if (!!window) {
      getUser();
      getOrders();
    }
  }, []);

  return (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="pb-6">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/clientes", name: "Clientes" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="w-full flex items-center">
              <Link passHref href="/painel/clientes">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                <span className="font-title font-bold">Cliente</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium pt-6">
          <div className="grid lg:flex gap-10 lg:gap-20">
            <div className="w-full">
              <div className="grid gap-4 border-b pb-8 mb-8">
                <h3 className="text-xl md:text-2xl text-zinc-950">
                  {user.name}
                </h3>
                {!!user?.created_at && (
                  <div>
                    Primeira interação em {getExtenseData(user?.created_at)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl text-zinc-950 mb-6">
                  Compras
                </h3>
                <div className="grid gap-6">
                  {orders.map((suborder: any, key: any) => (
                    <div
                      key={key}
                      className="p-4 md:p-6 border rounded-md lg:rounded-2xl grid gap-2"
                    >
                      <div className="flex justify-between font-bold text-zinc-950">
                        <div>#{suborder.order.id}</div>
                        <div>R$ {moneyFormat(suborder.total)}</div>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <div>{getExtenseData(suborder.created_at)}</div>
                        <div></div>
                      </div>

                      <div className="flex gap-4 pt-4 text-sm">
                        {suborder.order?.metadata?.payment_status == "paid" ? (
                          <div className="inline-block text-sm py-3 px-5 rounded-md bg-green-400 text-white">
                            pago
                          </div>
                        ) : (
                          <div className="inline-block text-sm py-3 px-5 rounded-md bg-zinc-100 text-zinc-500">
                            processando
                          </div>
                        )}
                        <div className="rounded-lg py-3 px-5 font-bold text-zinc-950 bg-yellow-200">
                          Por enviar
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
              <div className="rounded-2xl border p-4 lg:p-8 grid gap-2">
                <div>
                  <div className="font-title font-bold lg:text-xl text-zinc-900 pb-2">
                    Dados do cliente
                  </div>
                  <div className="grid text-zinc-500 gap-1">
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                    <span>{user.phone}</span>
                    <span>{user.cpf}</span>
                  </div>
                </div>
                <div className="my-6 border-dashed border-t"></div>
                <div>
                  <div className="font-title font-bold lg:text-xl text-zinc-900 pb-2">
                    Endereço de cobrança
                  </div>
                  {(user?.address ?? []).map((item: any, key: any) => (
                    <div key={key}>
                      <div>
                        {item?.street}, {item?.number}
                      </div>
                      <div>{item?.neighborhood}</div>
                      <div>CEP: {item?.zipCode}</div>
                      <div>
                        {item?.city} | {item?.state}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <UserEditAdmin user={user} /> */}
    </Template>
  );
}
