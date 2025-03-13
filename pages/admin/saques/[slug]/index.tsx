import Api from "@/src/services/api";
import { BankAccountType, UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import HelpCard from "@/src/components/common/HelpCard";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { Button, Label, Select } from "@/src/components/ui/form";
import { getExtenseData, moneyFormat, print_r } from "@/src/helper";
import { useEffect, useState } from "react";
import { WithdrawType } from "@/src/models/withdraw";

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

    console.log(withdraw, "submitWithdraw");

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

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "admin",
          position: "solid",
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
              <Link passHref href="/admin/saques">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                Pedido de saque
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="container-medium pb-12">
            <div className="grid md:flex items-start gap-10 md:gap-24">
              <div className="w-full grid gap-4">
                <div>
                  <div className="font-bold text-zinc-900 text-xl">
                    #{withdraw?.id ?? ""}
                  </div>
                </div>

                <div>
                  <div className="text-sm">Valor:</div>
                  <div className="text-xl">
                    R$ {moneyFormat(withdraw?.value)}
                  </div>
                </div>

                <div>
                  <div className="text-sm">Conta bancária:</div>
                  <div className="">
                    <div className="bg-zinc-100 grid grid-cols-2 py-1 px-2 rounded">
                      <div>Banco</div>
                      <div>{bankAccount?.bank ?? ""}</div>
                    </div>
                    <div className="grid grid-cols-2 py-1 px-2">
                      <div>Conta bancária</div>
                      <div>{bankAccount?.accountNumber ?? ""}</div>
                    </div>
                    <div className="bg-zinc-100 grid grid-cols-2 py-1 px-2 rounded">
                      <div>Agência</div>
                      <div>{bankAccount?.agence ?? ""}</div>
                    </div>
                    <div className="grid grid-cols-2 py-1 px-2">
                      <div>Operação</div>
                      <div>{bankAccount?.operation ?? ""}</div>
                    </div>
                    <div className="bg-zinc-100 grid grid-cols-2 py-1 px-2 rounded">
                      <div>Descrição da conta</div>
                      <div>{bankAccount?.title ?? ""}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm">Usuário:</div>
                  {Object.entries(partner).map((item: any, key: any) => (
                    <div key={key} className="flex gap-2 border-b py-2">
                      <div className="font-semibold">{item[0]}:</div>{" "}
                      <pre className="whitespace-pre-wrap">
                        {print_r(item[1])}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-[24rem] grid gap-4">
                <form className="grid" onSubmit={(e: any) => submitWithdraw(e)}>
                  <Button loading={form.loading}>Salvar</Button>
                </form>

                <div>
                  <div className="">Solicitado em</div>
                  <div className="text-xl">
                    {getExtenseData(withdraw?.created_at)}
                  </div>
                </div>

                {withdraw?.status == 0 ? (
                  <div className="form-group">
                    <Label style="float">Status</Label>
                    <Select
                      name="status"
                      value={withdraw?.status}
                      onChange={(e: any) =>
                        handleWithdraw({ status: e.target.value })
                      }
                      options={[
                        { name: "Aguardando análise", value: 0 },
                        { name: "Negado", value: 2 },
                        { name: "Aprovado", value: 1 },
                      ]}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="">
                      {withdraw?.status == 1 ? "Aprovado" : "Negado"} em
                    </div>
                    <div className="text-xl">
                      {getExtenseData(withdraw?.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
