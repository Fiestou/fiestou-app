import shortUUID from "short-uuid";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button, Input, Select } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { getExtenseData, moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Modal from "@/src/components/utils/Modal";
import { useRouter } from "next/router";
import { WithdrawType } from "@/src/models/withdraw";
import { UserType } from "@/src/models/user";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "withdraw",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  let content: any = request?.data?.query?.page[0] ?? [];

  request = await api.bridge(
    {
      url: "users/get",
    },
    ctx
  );

  const user: any = request?.data ?? {};

  const bankAccounts = (user?.bankAccounts ?? []).map((item: any) => {
    return {
      value: JSON.stringify(item),
      name: item.title,
    };
  });

  return {
    props: {
      user: user,
      content: content ?? {},
      bankAccounts: bankAccounts,
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
};

export default function Saque({
  user,
  content,
  bankAccounts,
}: {
  user: UserType;
  content: any;
  bankAccounts: any;
}) {
  const api = new Api();
  const router = useRouter();

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [modalWD, setModalWD] = useState(false as boolean);
  const [origin, setOrigin] = useState("todos");

  const [withdraw, setWithdraw] = useState({
    code: "",
    value: 0,
  } as WithdrawType);
  const handleWithdraw = (value: any) => {
    setWithdraw((wd: any) => ({ ...wd, ...value }));
  };

  const [withdrawList, setWithdrawList] = useState([] as Array<any>);
  const getWithdraw = async () => {
    let request: any = await api.bridge({
      url: "withdraw/list",
    });

    setWithdrawList(request.data);
  };

  useEffect(() => {
    if (!!window) {
      getWithdraw();
    }
  }, []);

  const RegisterWithdraw = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

    const handle: WithdrawType = {
      ...withdraw,
      code: shortUUID.generate(),
    };

    const request: any = await api.bridge({
      url: "withdraw/register",
      data: handle,
    });

    if (!!request?.response) {
      router.reload();

      setModalWD(false);
      setFormValue({ loading: false });
    }
  };

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
      <Modal
        status={modalWD}
        title="Solicitação de saque"
        close={() => setModalWD(false)}
      >
        <div className="grid gap-6 items-start">
          {!!withdrawList?.filter((item: any) => item.status == 0)?.length ? (
            <div className="rounded-md text-center text-sm bg-yellow-100 text-yellow-900 py-3 px-4">
              É necessário aguardar a conclusão da última solicitação para
              realizar outras.
            </div>
          ) : (
            <>
              <div className="grid gap-1 text-sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.modal_instruction,
                  }}
                ></div>
              </div>
              <form
                onSubmit={(e) => RegisterWithdraw(e)}
                className="grid gap-4"
              >
                <div>
                  <Input
                    onChange={(e: any) =>
                      handleWithdraw({ value: e.target.value })
                    }
                    placeholder="R$"
                    required
                    className="h-14 text-center"
                  />
                </div>

                <div>
                  <Select
                    onChange={(e: any) =>
                      handleWithdraw({ bankAccount: e.target.value })
                    }
                    required
                    className="h-14 text-center"
                    name={"account"}
                    options={[
                      { value: "", name: "Conta bancária" },
                      ...bankAccounts,
                    ]}
                  />
                </div>

                <Button loading={form.loading}>Confirmar</Button>
              </form>
            </>
          )}
        </div>
      </Modal>
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/saques", name: "Saques" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="w-full flex items-center">
              <Link passHref href="/painel/">
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
              <div className="w-full grid">
                <Button
                  type="button"
                  onClick={() => setModalWD(true)}
                  className="whitespace-nowrap pl-5"
                >
                  <Icon icon="fa-hand-holding-usd" />
                  Solicitar saque
                </Button>
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
                  </div>
                ))}
          </div>
          <div className="pt-4">Mostrando 1 página de 1 com 4 produtos</div>
        </div>
      </section>
    </Template>
  );
}
