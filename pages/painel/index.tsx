import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getUser } from "@/src/contexts/AuthContext";
import { UserType } from "@/src/models/user";
import Template from "@/src/template";
import { AuthContext } from "@/src/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { Chart } from "@/src/components/utils/Chart";
import DobleIcon from "@/src/icons/fontAwesome/FDobleIcon";
import Api from "@/src/services/api";
import { BalanceType } from "@/src/models/order";
import { PARTNER_MENU } from "@/src/default/header/Painel";
import RecipientModal from "@/src/components/pages/painel/meus-dados/RecipientModal";
import { RecipientEntity, RecipientStatusResponse } from "@/src/models/recipient";
import { getRecipientStatus } from "@/src/services/recipients";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.call(
    {
      method: 'post',
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "home-partner",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  let content = request?.data?.query?.page ?? {};

  return {
    props: {
      content: content[0] ?? {},
    },
  };
}

export default function Parceiro({ content }: { content: any }) {
  const { UserLogout } = useContext(AuthContext);

  const api = new Api();

  const [balance, setBalance] = useState({} as BalanceType);
  const getBalance = async () => {
    let request: any = await api.bridge({
      method: "post",
      url: "stores/balance",
    });

    const handle = request.data;

    setBalance({
      cash: handle?.cash || 0,
      payments: handle?.payments || 0,
      promises: handle?.promises || 0,
      orders: handle?.orders || 0,
    });
  };

  const [orders, setOrders] = useState([] as Array<any>);
  const getOrders = async () => {
    let request: any = await api.bridge({
      method: "post",
      url: "suborders/list",
      data: { limit: 10 },
    });

    setOrders(Array.isArray(request?.data) ? request.data : []);
  };

  const [period, setPeriod] = useState("month" as string);

  const [user, setUser] = useState({} as UserType);

  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [recipientStatus, setRecipientStatus] = useState<RecipientStatusResponse | null>(null);

  // Verificar status do cadastro PagMe
  const checkPagarmeStatus = async () => {
    try {
      const status = await getRecipientStatus();
      setRecipientStatus(status);
    } catch (error) {
      console.log("Erro ao verificar status PagMe:", error);
    }
  };

  const handleRecipientCompleted = (data: RecipientEntity) => {
    setRecipientStatus({
      completed: true,
      recipient: data,
    });
  };

  useEffect(() => {
    if (!!window) {
      getOrders();
      getBalance();
      checkPagarmeStatus();
      setUser(getUser);
    }
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const hasOrders = safeOrders.length > 0;

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
      {/* Painel do lojista a o acessar a loja */}
      <section className="">
        <div className="container-medium py-6 lg:py-16">
          <div className="grid sm:flex items-center gap-8 lg:gap-20 pb-8 lg:pb-10">
            <div className="w-full">
              <div className="font-title max-w-[38rem] font-bold text-2xl md:text-5xl flex gap-4 items-center mb-2 text-zinc-900">
                Olá, {user.name}
              </div>
              <div>Bem-vindo ao portal do lojista no Fiestou!</div>
            </div>
            <div className="w-fit">
              <div className="flex gap-4 items-center justify-center">
                <div>
                  <DobleIcon icon="fa-piggy-bank" />
                </div>
                <div className="pl-2">
                  <div className="text-xs md:text-base">Em caixa</div>
                  <h4 className="text-zinc-900 -mb-1 font-bold text-2xl lg:text-5xl leading-none whitespace-nowrap">
                    <span className="text-base lg:text-2xl">R$</span>{" "}
                    {moneyFormat(balance.cash)}
                  </h4>
                  <div className="pt-3">
                    {/* <Button
                      href="/painel/saques"
                      className="btn w-full p-2 pl-3 pr-5 text-sm text-nowrap"
                    >
                      <Icon icon="fa-hand-holding-usd" />
                      Solicitar saque
                    </Button> */}
                    {recipientStatus && !recipientStatus.completed && (
                      <Button
                        type="button"
                        onClick={() => setRecipientModalOpen(true)}
                        className="mt-2  w-full p-2 pl-3 pr-5 text-sm text-nowrap bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-red-500"
                        style=""
                      >
                        <Icon icon="fa-file-signature" className="mr-2" />
                        Finalizar cadastro Pagar.me
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:flex items-start gap-8 xl:gap-20">
            <div className="hidden lg:block lg:w-full lg:max-w-[24rem] pb-8 -mx-4 lg:mx-0 order-1 md:order-2 relative overflow-x-auto no-scrollbar">
              <div className="max-w-full flex lg:grid items-start gap-4 px-4 lg:px-0">
                {PARTNER_MENU.map((item: any, key: any) => (
                  <Link
                    passHref
                    href={item.url}
                    key={key}
                    className="group min-w-[11rem] bg-zinc-100 hover:bg-yellow-300 ease rounded-lg p-3 lg:p-6 grid lg:flex gap-4 items-center"
                  >
                    <div className="w-full lg:max-w-[2rem] h-[2rem] text-[1.75rem] leading-none text-zinc-900 relative">
                      <Icon
                        icon={item.icon}
                        className="lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:absolute"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="font-bold text-zinc-900 font-title text-base whitespace-nowrap lg:text-lg">
                        {item.name}
                      </div>
                      <div className="text-sm group-hover:text-zinc-900 ease">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="text-center self-center pt-4">
                  <div
                    onClick={() => UserLogout()}
                    className="cursor-pointer  p-5 font-semibold whitespace-nowrap border border-red-500 py-4 px-[26px] rounded-[7px] bg-red-500 text-white hover:bg-red-600 transition duration-300"
                  >
                    Sair da conta
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full order-2 md:order-1">
              <div className="flex gap-4 items-start">
                <div className="w-3/4 md:w-full">
                  <div className="w-full flex gap-4">
                    <div className="w-full grid border-l-2 pl-2 border-lime-500">
                      <div className="pb-1 md:pb-1 text-xs :text-base leading-tight">
                        Pagamentos
                        <br />
                        recebidos
                      </div>
                      <h4 className="text-zinc-900 -mb-1 font-bold text-xl md:text-3xl leading-none whitespace-nowrap">
                        <span className="text-base lg:text-lg">R$</span>{" "}
                        {moneyFormat(balance.payments)}
                      </h4>
                    </div>
                    <div className="w-full grid border-l-2 pl-2 border-red-500">
                      <div className="pb-1 md:pb-1 text-xs :text-base leading-tight">
                        Promessas
                        <br />
                        de pagamento
                      </div>
                      <h4 className="text-zinc-900 -mb-1 font-bold text-xl md:text-3xl leading-none whitespace-nowrap">
                        <span className="text-base lg:text-lg">R$</span>{" "}
                        {moneyFormat(balance.promises)}
                      </h4>
                    </div>
                  </div>
                  <div className="hidden md:block text-xs pt-4 max-w-[19rem]">
                    *Os pagamentos são transferidos automaticamente para sua
                    conta bancária. Saiba mais
                  </div>
                </div>
                <div className="w-1/4 md:w-full grid md:max-w-[10rem]">
                  <div className="w-full grid border-l-2 pl-2 border-yellow-300">
                    <div className="pb-1 md:pb-1 text-xs :text-base leading-tight">
                      Pedidos
                      <br />
                      realizados
                    </div>
                    <h4 className="text-zinc-900 -mb-1 font-bold text-xl md:text-3xl leading-none whitespace-nowrap">
                      {balance.orders}
                    </h4>
                  </div>
                  <div className="hidden md:block text-xs pt-4">
                    *Número de pedidos nos últimos 30 dias
                  </div>
                </div>
              </div>
              <div className="py-8 md:pb-12">
                <hr />
              </div>

              <div>
                <div className="flex gap-4 mb-4 items-center">
                  <div className="w-full font-title font-bold text-2xl lgxt-zinc-900 whitespace-nowrap text-zinc-900">
                    Visão geral
                  </div>
                  <div>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="p-2 bg-zinc-100 rounded-md min-w-[8rem]"
                    >
                      <option value="month">Mês</option>
                      <option value="semester">Semestre</option>
                      <option value="year">Ano</option>
                    </select>
                  </div>
                </div>
                <div className="bg-zinc-50 rounded-md py-6 px-2 flex justify-center">
                  <Chart period={period} />
                </div>
              </div>
              <div className="py-16">
                <div className="flex gap-4 mb-4  max-w-full items-center">
                  <div className="w-full font-title font-bold text-2xl lgxt-zinc-900 whitespace-nowrap text-zinc-900">
                    Últimos pedidos
                  </div>
                  <div>
                    <Button
                      style="btn-link"
                      className="whitespace-nowrap"
                      href="/painel/pedidos"
                    >
                      Ver todos
                    </Button>
                  </div>
                </div>

          {hasOrders ? (
            safeOrders.map((suborder: any, key: any) => (
              <div
                key={key}
                className="grid lg:flex border-t py-4 lg:py-8 gap-2 lg:gap-8 text-zinc-900 bg-opacity-5 ease items-center"
                    >
                      <div className="w-full lg:w-1/12">
                        <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                          pedido:
                        </span>
                        #{suborder.order.id}
                      </div>
                      <div className="w-full">
                        <div className="whitespace-nowrap text-sm pb-2 md:pb-0">
                          <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                            data:
                          </span>
                          {getExtenseData(suborder.created_at)}
                        </div>
                        <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                          cliente:
                        </span>
                        <span className="font-bold">{suborder.user.name}</span>
                      </div>
                      <div className="w-full lg:w-3/12 whitespace-nowrap">
                        <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                          valor:
                        </span>
                        <span className="font-bold">
                          R$ {moneyFormat(suborder.total)}
                        </span>
                      </div>
                      <div className="w-full lg:w-4/12">
                        <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                          status:
                        </span>

                        {suborder.order?.metadata?.payment_status == "paid" ? (
                          <div className="px-2 inline-block text-sm py-2 rounded-md bg-green-200 text-green-900">
                            Pago
                          </div>
                        ) : (
                          <div className="px-2 inline-block text-sm py-2 rounded-md bg-zinc-100 text-zinc-500">
                            Em aberto
                          </div>
                        )}
                      </div>
                      <div className="w-full lg:w-fit grid">
                        <Button
                          href={`/painel/pedidos/${suborder.id}`}
                          style="btn-light"
                          className="text-zinc-900 py-2 px-3 mt-4 lg:mt-0 text-sm whitespace-nowrap"
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 border-t">
                    Ops! Ainda não temos pedidos para listar
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <RecipientModal
        open={recipientModalOpen}
        onClose={() => setRecipientModalOpen(false)}
        status={recipientStatus}
        onCompleted={handleRecipientCompleted}
      />
    </Template>
  );
}