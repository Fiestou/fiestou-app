import { useEffect, useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import Api from "@/src/services/api";
import { Input, Select } from "@/src/components/ui/form";
import { BankAccountType, UserType } from "@/src/models/user";
import HelpCard from "@/src/components/common/HelpCard";
import { PainelLayout, PageHeader, EmptyState } from "@/src/components/painel";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  let request: any = await api.call(
    {
      method: "post",
      url: "request/graph",
      data: [{ model: "page", filter: [{ key: "slug", value: "bank", compare: "=" }] }],
    },
    ctx
  );
  let page: any = request?.data?.query?.page[0] ?? {};
  return { props: { page } };
}

const formInitial = { edit: -1, loading: false };

export default function Conta({ page }: { page: any }) {
  const api = new Api();
  const [content, setContent] = useState({} as UserType);
  const [user, setUser] = useState({} as UserType);
  const [banks, setBanks] = useState<BankAccountType[]>([]);
  const [form, setForm] = useState(formInitial);

  const handleForm = (value: any) => setForm({ ...form, ...value });

  const handleBankAccounts = (value: any, key: any) => {
    setBanks((prev) =>
      prev.map((bank, index) => (index == key ? { ...bank, ...value } : bank))
    );
  };

  const getUserData = async () => {
    const request: any = await api.bridge({ method: "get", url: "users/get" });
    if (request.response) {
      setUser(request.data);
      setContent(request.data);
      setBanks(request.data.bankAccounts || []);
    }
  };

  useEffect(() => { getUserData(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    handleForm({ loading: true });
    const handle: UserType = { ...content, id: user.id, bankAccounts: banks };
    const request: any = await api.bridge({ method: "post", url: "users/update", data: handle });
    if (request.response) {
      setContent(handle);
      setBanks(handle?.bankAccounts ?? []);
    }
    handleForm({ edit: -1, loading: false });
  };

  const addAccount = () => {
    let accounts = (content?.bankAccounts ?? []).filter((b: any) => b);
    accounts.push({} as BankAccountType);
    setBanks(accounts);
    handleForm({ edit: accounts.length - 1 });
  };

  return (
    <PainelLayout>
      <PageHeader
        title="Minha Conta"
        description="Gerencie suas contas bancarias"
        actions={
          form.edit === -1 ? (
            <button
              type="button"
              onClick={addAccount}
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Nova conta
            </button>
          ) : undefined
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {Array.isArray(banks) && banks.length > 0 ? (
            <div className="grid gap-4">
              {banks.map((bank: BankAccountType, key: any) => (
                <form
                  key={key}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-xl border border-zinc-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {bank.title || "Nova Conta"}
                    </h3>
                    {form.edit === key ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleForm({ edit: -1 });
                            setBanks(content?.bankAccounts ?? []);
                          }}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={form.loading}
                          className="px-4 py-1.5 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {form.loading ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleForm({ edit: key });
                          setBanks(content?.bankAccounts ?? []);
                        }}
                        disabled={form.loading}
                        className="px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {form.edit === key ? (
                    <div className="grid gap-3">
                      <Input
                        onChange={(e: any) => handleBankAccounts({ title: e.target.value }, key)}
                        required
                        value={bank.title}
                        placeholder="Apelido/Nome da conta"
                      />
                      <div className="grid sm:grid-cols-[1fr_2fr] gap-3">
                        <Input
                          onChange={(e: any) => handleBankAccounts({ agence: e.target.value }, key)}
                          required
                          value={bank.agence}
                          placeholder="Agência"
                        />
                        <Input
                          onChange={(e: any) => handleBankAccounts({ accountNumber: e.target.value }, key)}
                          required
                          value={bank.accountNumber}
                          placeholder="Número da conta"
                        />
                      </div>
                      <div className="grid sm:grid-cols-[1fr_2fr] gap-3">
                        <Select
                          name="op"
                          onChange={(e: any) => handleBankAccounts({ operation: e.target.value ?? "conta-corrente" }, key)}
                          required
                          value={bank.operation ?? "conta-corrente"}
                          options={[
                            { name: "Conta Corrente", value: "conta-corrente" },
                            { name: "Conta Poupança", value: "conta-poupanca" },
                          ]}
                        />
                        <Input
                          onChange={(e: any) => handleBankAccounts({ bank: e.target.value }, key)}
                          required
                          value={bank.bank}
                          placeholder="Banco"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-zinc-400" />
                        <span>Conta Corrente: {bank.accountNumber}</span>
                      </div>
                      {bank.bank && <div className="mt-1 ml-[22px] text-zinc-400">Banco: {bank.bank}</div>}
                    </div>
                  )}
                </form>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200">
              <EmptyState
                icon={<CreditCard size={32} />}
                title="Sem contas cadastradas"
                description="Adicione uma conta bancária para receber seus pagamentos"
                action={
                  <button
                    type="button"
                    onClick={addAccount}
                    className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Adicionar conta
                  </button>
                }
              />
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <HelpCard list={page.help_list} />
        </div>
      </div>
    </PainelLayout>
  );
}
