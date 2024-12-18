import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { useEffect, useState } from "react";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { BankAccountType, UserType } from "@/src/models/user";
import Img from "@/src/components/utils/ImgBase";
import FileInput from "@/src/components/ui/form/FileInputUI";
import { getExtenseData } from "@/src/helper";
import HelpCard from "@/src/components/common/HelpCard";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

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
              value: "bank",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  let page: any = request?.data?.query?.page[0] ?? {};

  return {
    props: {
      page: page,
    },
  };
}

const formInitial = {
  edit: -1,
  loading: false,
};

export default function Conta({ page }: { page: any }) {
  const api = new Api();

  const [content, setContent] = useState({} as UserType);
  const [user, setUser] = useState({} as UserType);

  const [banks, setBanks] = useState([] as Array<BankAccountType>);
  const handleBankAccounts = (value: any, key: any) => {
    setBanks((banks: Array<BankAccountType>) =>
      banks.map((bank: BankAccountType, index: any) =>
        index == key
          ? {
              ...bank,
              ...value,
            }
          : bank
      )
    );
  };

  const getUserData = async () => {
    const request: any = await api.bridge({
      method: "get",
      url: "users/get",
    });

    if (request.response) {
      setUser(request.data);
      setContent(request.data);
      setBanks(request.data.bankAccounts);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle: UserType = { ...content, id: user.id, bankAccounts: banks };

    const request: any = await api.bridge({
      url: "users/update",
      data: handle,
    });

    if (request.response) {
      setContent(handle);
      setBanks(handle?.bankAccounts ?? ([] as Array<BankAccountType>));
    }

    handleForm({ edit: -1, loading: false });
  };

  const addAccount = () => {
    let accounts = (content?.bankAccounts ?? []).filter(
      (bank: BankAccountType) => bank
    );

    accounts.push({} as BankAccountType);

    setBanks(accounts);

    handleForm({ edit: accounts.length - 1 });
  };

  const renderAction = (
    key: number,
    label?: { edit?: string; save?: string; cancel?: string }
  ) => {
    return form.edit == key ? (
      <div className="flex gap-10">
        <Button
          onClick={(e: any) => {
            handleForm({ edit: -1 });
            setBanks(content?.bankAccounts ?? []);
          }}
          type="button"
          style="btn-link"
        >
          {label?.cancel ? label.cancel : "Cancelar"}
        </Button>
        <Button
          loading={form.edit == key && form.loading}
          className="py-2 px-4"
        >
          {label?.save ? label.save : "Salvar"}
        </Button>
      </div>
    ) : !form.loading ? (
      <Button
        onClick={(e: any) => {
          handleForm({ edit: key });
          setBanks(content?.bankAccounts ?? []);
        }}
        type="button"
        style="btn-link"
      >
        {label?.edit ? label.edit : "Editar"}
      </Button>
    ) : (
      <button type="button" className="p-0 font-bold opacity-50">
        {label?.edit ? label.edit : "Editar"}
      </button>
    );
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
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/conta", name: "Conta bancária" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="w-full flex items-center">
              <Link passHref href="/painel">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                <span className="font-title font-bold">Conta bancária</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {!!user?.id && (
        <section className="pt-6">
          <div className="container-medium pb-12">
            <div className="grid md:flex align-top gap-10 lg:gap-20">
              <div className="w-full">
                {!!banks.length ? (
                  <div className="grid">
                    {banks.map((bank: BankAccountType, key: any) => (
                      <form
                        key={key}
                        onSubmit={(e: any) => handleSubmit(e)}
                        method="POST"
                        className="border-t py-4 md:py-8"
                      >
                        <div className="flex items-center">
                          <div className="w-full">
                            <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                              {!!bank.title ? bank.title : "Nova conta"}
                            </h4>
                          </div>
                          <div className="w-fit">{renderAction(key)}</div>
                        </div>
                        <div className="w-full pt-4">
                          {form.edit == key ? (
                            <div className="grid gap-2">
                              <Input
                                onChange={(e: any) =>
                                  handleBankAccounts(
                                    {
                                      title: e.target.value,
                                    },
                                    key
                                  )
                                }
                                required
                                value={bank.title}
                                placeholder="Apelido/Nome da conta"
                              />
                              <div className="flex gap-2">
                                <div className="w-1/3">
                                  <Input
                                    onChange={(e: any) =>
                                      handleBankAccounts(
                                        {
                                          agence: e.target.value,
                                        },
                                        key
                                      )
                                    }
                                    required
                                    value={bank.agence}
                                    placeholder="Agência"
                                  />
                                </div>
                                <div className="w-full">
                                  <Input
                                    onChange={(e: any) =>
                                      handleBankAccounts(
                                        {
                                          accountNumber: e.target.value,
                                        },
                                        key
                                      )
                                    }
                                    required
                                    value={bank.accountNumber}
                                    placeholder="Número da conta"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="w-1/3">
                                  <Select
                                    name="op"
                                    onChange={(e: any) =>
                                      handleBankAccounts(
                                        {
                                          operation:
                                            e.target.value ?? "conta-corrente",
                                        },
                                        key
                                      )
                                    }
                                    required
                                    value={bank.operation ?? "conta-corrente"}
                                    options={[
                                      {
                                        name: "Conta Corrente",
                                        value: "conta-corrente",
                                      },
                                      {
                                        name: "Conta Poupança",
                                        value: "conta-poupanca",
                                      },
                                    ]}
                                  />
                                </div>
                                <div className="w-full">
                                  <Input
                                    onChange={(e: any) =>
                                      handleBankAccounts(
                                        {
                                          bank: e.target.value,
                                        },
                                        key
                                      )
                                    }
                                    required
                                    value={bank.bank}
                                    placeholder="Banco"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            "Conta corrente " + bank.accountNumber
                          )}
                        </div>
                      </form>
                    ))}
                  </div>
                ) : (
                  <div className="border-b py-4">Sem contas cadastradas</div>
                )}
                {form.edit == -1 && (
                  <div className="grid md:block py-6 border-t">
                    <Button type="button" onClick={() => addAccount()}>
                      Adicionar uma conta
                    </Button>
                  </div>
                )}
              </div>
              <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
                <HelpCard list={page.help_list} />
              </div>
            </div>
          </div>
        </section>
      )}
    </Template>
  );
}
