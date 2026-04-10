import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  User, Mail, Phone, Hash, Building2, MapPin, Landmark,
  ChevronDown, ChevronUp, Pencil, X, Check,
} from "lucide-react";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { RecipientType, BankAccountTypeRecipient } from "@/src/models/Recipient";
import { getStore } from "@/src/contexts/AuthContext";
import { toast } from "react-toastify";
import { formatDate } from "@/src/helper";
import { formatCpfCnpj } from "@/src/components/utils/FormMasks";

type FieldDef = {
  key: string;
  label: string;
  value: string;
  type?: string;
  editable?: boolean;
  format?: (v: string) => string;
};

function getCompletionCount(fields?: FieldDef[]) {
  if (!fields?.length) return { filled: 0, total: 0 };
  const filled = fields.filter((field) => {
    const value = String(field.value ?? "").trim();
    return value.length > 0;
  }).length;
  return { filled, total: fields.length };
}

function FieldRow({ field, editMode, onChange }: {
  field: FieldDef;
  editMode: boolean;
  onChange: (key: string, val: string) => void;
}) {
  const canEdit = editMode && field.editable !== false;
  const displayVal = field.format ? field.format(field.value) : field.value;

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3.5 last:mb-0 sm:grid sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-4">
      <span className="text-sm font-medium text-zinc-500">{field.label}</span>
      {canEdit ? (
        <input
          type={field.type === "date" ? "date" : "text"}
          className="mt-1 w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-yellow-400 bg-white sm:mt-0"
          value={field.type === "date" ? (field.value || "").split("T")[0] : field.value}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      ) : (
        <span className={`mt-1 text-sm font-medium sm:mt-0 ${displayVal && displayVal !== "" ? "text-zinc-900" : "text-zinc-300 italic"}`}>
          {displayVal || "Não preenchido"}
        </span>
      )}
    </div>
  );
}

function SectionCard({ icon, iconColor, title, description, fields, onSave, saveLabel, children, defaultOpen = false }: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description?: string;
  fields?: FieldDef[];
  onSave?: (fields: Record<string, string>) => Promise<void>;
  saveLabel?: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localFields, setLocalFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (fields) {
      const map: Record<string, string> = {};
      fields.forEach((f) => { map[f.key] = f.value; });
      setLocalFields(map);
    }
  }, [fields]);

  const handleChange = (key: string, val: string) => {
    setLocalFields((prev) => ({ ...prev, [key]: val }));
  };

  const startEditing = () => {
    setOpen(true);
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try { await onSave(localFields); setEditMode(false); } catch {}
    setSaving(false);
  };

  const handleCancel = () => {
    if (fields) {
      const map: Record<string, string> = {};
      fields.forEach((f) => { map[f.key] = f.value; });
      setLocalFields(map);
    }
    setEditMode(false);
  };

  const hasEditable = fields?.some((f) => f.editable !== false);
  const completion = getCompletionCount(fields);

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
      <div
        className="flex items-start justify-between gap-3 px-4 py-4 cursor-pointer hover:bg-zinc-50/50 transition-colors sm:px-5"
        onClick={() => setOpen(!open)}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className={`p-2.5 rounded-lg ${iconColor}`}>{icon}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-semibold text-zinc-900 sm:text-lg break-words">{title}</h3>
              {!!completion.total && (
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
                  {completion.filled}/{completion.total} preenchidos
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hasEditable && onSave && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {!editMode ? (
                <button
                  onClick={startEditing}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-cyan-50 transition-colors"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={handleCancel} className="text-sm text-zinc-500 hover:text-zinc-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors">
                    <X size={14} /> Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving} className="text-sm text-white bg-yellow-500 hover:bg-yellow-600 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <Check size={14} /> {saving ? "Salvando..." : (saveLabel || "Salvar")}
                  </button>
                </div>
              )}
            </div>
          )}
          {open ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
        </div>
      </div>
      {open && (
        <div className="border-t border-zinc-100 px-4 pb-5 sm:px-5">
          {hasEditable && onSave && (
            <div className="flex flex-col gap-2 border-b border-zinc-100 py-3 sm:hidden" onClick={(e) => e.stopPropagation()}>
              {!editMode ? (
                <button
                  onClick={startEditing}
                  className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-cyan-600 transition-colors hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <Pencil size={15} />
                  Editar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-yellow-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
                  >
                    <Check size={15} />
                    {saving ? "Salvando..." : (saveLabel || "Salvar")}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <X size={15} />
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
          {fields ? (
            <div className="space-y-3 pt-3">
              {fields.map((f) => (
                <FieldRow key={f.key} field={{ ...f, value: localFields[f.key] ?? f.value }} editMode={editMode} onChange={handleChange} />
              ))}
            </div>
          ) : children}
        </div>
      )}
    </div>
  );
}

export default function UserEdit({
  user,
  simpleMode = false,
}: {
  user: UserType;
  simpleMode?: boolean;
}) {
  const api = useMemo(() => new Api(), []);
  const [content, setContent] = useState<RecipientType | null>(null);
  const [storeId, setStoreId] = useState<any>();
  const [bankData, setBankData] = useState<BankAccountTypeRecipient>({} as BankAccountTypeRecipient);

  const buildFromUser = useCallback((): RecipientType => {
    const userAddr = (user as any)?.address?.[0];
    const userPhone = user?.phone?.replace(/\D/g, "") || "";
    const doc = user?.cpf || user?.document || "";
    const isPJ = doc.replace(/\D/g, "").length === 14;
    return {
      recipient: null, id: undefined as any, store_id: undefined as any,
      partner_id: "", code: "", type_enum: isPJ ? "PJ" : "PF",
      type: isPJ ? "company" : "individual", name: user?.name ?? "",
      email: user?.email ?? "", document: doc, company_name: null,
      trading_name: null, birth_date: user?.date ?? "", monthly_income: "",
      professional_occupation: null,
      addresses: userAddr ? [{ id: 0, street: userAddr.street ?? "", complementary: userAddr.complement ?? "", street_number: String(userAddr.number ?? ""), neighborhood: userAddr.neighborhood ?? "", city: userAddr.city ?? "", state: userAddr.state ?? "", zip_code: userAddr.zipCode ?? "", reference_point: "" }] : [],
      phones: userPhone.length >= 10 ? [{ id: 0, area_code: userPhone.slice(0, 2), number: userPhone.slice(2) }] : [],
      config: {}, partners: [], annual_revenue: null, created_at: "", updated_at: "",
    };
  }, [user]);

  const getRecipientCode = useCallback(async (sid: string) => {
    try {
      await api.bridge({ method: "POST", url: "info/recipients/sync" }).catch(() => {});
      const res: any = await api.bridge({ method: "GET", url: `info/recipient/${sid}` });
      if (!res?.response || !res?.data) { setContent(buildFromUser()); return; }
      const d = res.data;
      setContent({
        recipient: null, id: d.id, store_id: d.store_id, partner_id: d.partner_id,
        code: d.code ?? "", type_enum: d.type_enum ?? "", type: d.type ?? "individual",
        name: d.name ?? "", email: d.email ?? "", document: d.document ?? "",
        company_name: d.company_name ?? null, trading_name: d.trading_name ?? null,
        birth_date: d.birth_date ?? "", monthly_income: d.monthly_income ?? "",
        professional_occupation: d.professional_occupation ?? null,
        addresses: d.address ? [{ id: 0, street: d.address.street ?? "", complementary: d.address.complementary ?? "", street_number: d.address.street_number ?? "", neighborhood: d.address.neighborhood ?? "", city: d.address.city ?? "", state: d.address.state ?? "", zip_code: d.address.zip_code ?? "", reference_point: d.address.reference_point ?? "" }] : [],
        phones: d.phone ? [{ id: 0, area_code: d.phone.area_code ?? "", number: d.phone.number ?? "" }] : [],
        config: {}, partners: [], annual_revenue: null, created_at: "", updated_at: "",
        bank_account: d.bank ? { holder_name: d.bank.holder_name ?? "", holder_type: d.bank.holder_type ?? "individual", holder_document: d.bank.holder_document ?? "", bank: d.bank.bank ?? "", branch_number: d.bank.branch_number ?? "", branch_check_digit: d.bank.branch_check_digit ?? "", account_number: d.bank.account_number ?? "", account_check_digit: d.bank.account_check_digit ?? "", type: d.bank.type ?? "checking" } : undefined,
      });
    } catch { setContent(buildFromUser()); }
  }, [api, buildFromUser]);

  const fetchBankData = useCallback(async () => {
    try {
      const sid = getStore();
      const res: any = await api.bridge({ method: "get", url: `/withdraw/${sid}` });
      const wd = res?.[0] ?? res?.data?.[0] ?? res?.data ?? null;
      if (wd?.bank || wd?.holder_name) {
        setBankData({ title: wd.holder_name ?? "", bank: wd.bank ?? "", branch_number: wd.branch_number ?? "", branch_check_digit: wd.branch_check_digit ?? "", account_number: wd.account_number ?? "", account_check_digit: wd.account_check_digit ?? "" });
      } else if (content?.bank_account) {
        setBankData({ title: content.bank_account.holder_name ?? "", bank: content.bank_account.bank ?? "", branch_number: content.bank_account.branch_number ?? "", branch_check_digit: content.bank_account.branch_check_digit ?? "", account_number: content.bank_account.account_number ?? "", account_check_digit: content.bank_account.account_check_digit ?? "" });
      }
    } catch {}
  }, [api, content]);

  useEffect(() => { if (typeof window !== "undefined") setStoreId(getStore()); }, []);
  useEffect(() => { if (storeId) getRecipientCode(storeId); }, [getRecipientCode, storeId]);
  useEffect(() => { if (content) { fetchBankData(); } }, [content, fetchBankData]);

  const phone = content?.phones?.[0];
  const phoneDisplay = phone ? `(${phone.area_code}) ${phone.number}` : "";
  const addr = content?.addresses?.[0];

  const saveBasicInfo = async (fields: Record<string, string>) => {
    if (!content?.id) { toast.warning("Conclua seus dados financeiros primeiro."); return; }
    const phoneParts = fields.phone?.match(/\((\d{2})\)\s*(\d{4,5})-?(\d{4})/);
    const payload: any = { email: fields.email, monthly_income: fields.monthly_income };
    if (phoneParts) { payload.phone = { area_code: phoneParts[1], number: phoneParts[2] + phoneParts[3] }; }
    const res = await api.bridge({ method: "put", url: `info/recipient/${content.id}/update`, data: payload });
    if (res) toast.success("Dados atualizados!"); else toast.error("Erro ao atualizar.");
  };

  const savePersonalData = async (fields: Record<string, string>) => {
    if (!content?.id) { toast.warning("Conclua seus dados financeiros primeiro."); return; }
    const birthDate = fields.birth_date ? fields.birth_date.split("T")[0] : null;
    let monthlyIncome: number | null = null;
    if (fields.monthly_income) {
      const raw = fields.monthly_income.replace(/[^\d,.\-]/g, "").replace(/\./g, "").replace(",", ".");
      const n = Number(raw);
      monthlyIncome = isNaN(n) ? null : n;
    }
    const a = content?.addresses?.[0];
    const payload = {
      name: fields.name, birth_date: birthDate, monthly_income: monthlyIncome,
      professional_occupation: fields.professional_occupation,
      address: a ? { id: a.id, street: fields.street ?? a.street, street_number: fields.street_number ?? a.street_number, neighborhood: fields.neighborhood ?? a.neighborhood, complementary: fields.complementary ?? a.complementary, state: fields.state ?? a.state, city: fields.city ?? a.city, zip_code: fields.zip_code ?? a.zip_code, reference_point: fields.reference_point ?? a.reference_point } : null,
    };
    const res: any = await api.bridge({ method: "put", url: `info/recipients/${content.id}`, data: payload });
    if (res?.response) toast.success("Dados atualizados!"); else toast.error("Erro ao atualizar.");
  };

  if (!content) return <div className="text-zinc-400 text-sm py-8 text-center">Carregando dados do recebedor...</div>;

  const bankReady = Boolean(bankData.bank && bankData.account_number);
  const addressReady = Boolean(addr?.street && addr?.city && addr?.state);
  const statusTone = content.code
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-cyan-50/60 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center shadow-sm">
            <User size={24} className="text-cyan-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-zinc-900 font-display">{content.name || user.name || "Recebedor"}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusTone}`}>
                {content.code ? "Ativo" : "Pendente"}
              </span>
            </div>
            {!simpleMode && (
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Confira os dados principais e atualize o que estiver faltando.
              </p>
            )}
            <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
              {content.code && <span className="text-xs text-zinc-400 flex items-center gap-1"><Hash size={12} />{content.code}</span>}
              <span className="text-xs text-zinc-400 flex items-center gap-1"><Mail size={12} />{content.email}</span>
              {phoneDisplay && <span className="text-xs text-zinc-400 flex items-center gap-1"><Phone size={12} />{phoneDisplay}</span>}
              <span className="text-xs text-zinc-400 flex items-center gap-1"><Building2 size={12} />{content.type_enum === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}</span>
            </div>
          </div>
        </div>
        <div className={`mt-4 grid grid-cols-1 gap-3 ${simpleMode ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          <div className="rounded-xl border border-zinc-200/80 bg-white/90 px-3.5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Status</span>
            <div className="mt-1 text-sm font-semibold text-zinc-900">
              {content.code ? "Cadastro financeiro pronto" : "Cadastro ainda pendente"}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-white/90 px-3.5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Endereço</span>
            <div className="mt-1 text-sm font-semibold text-zinc-900">
              {addressReady ? `${addr?.city}/${addr?.state}` : "Ainda incompleto"}
            </div>
          </div>
          {!simpleMode && (
            <div className="rounded-xl border border-zinc-200/80 bg-white/90 px-3.5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Conta bancária</span>
              <div className="mt-1 text-sm font-semibold text-zinc-900">
                {bankReady ? `Banco ${bankData.bank}` : "Ainda não informada"}
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {bankReady ? "Conta pronta para receber." : "Cadastre a conta na aba Conta bancária."}
              </p>
            </div>
          )}
        </div>
      </div>

      <SectionCard icon={<Mail size={18} />} iconColor="bg-cyan-50 text-cyan-600" title="Informações de contato" description={simpleMode ? undefined : "Dados usados pela plataforma para validar o recebedor e facilitar contato em caso de pendência."} defaultOpen={true}
        fields={[
          { key: "email", label: "E-mail", value: content.email ?? "", editable: true },
          { key: "phone", label: "Telefone", value: phoneDisplay, editable: true },
          { key: "document", label: "CPF/CNPJ", value: content.document ?? "", editable: false, format: formatCpfCnpj },
        ]}
        onSave={saveBasicInfo}
      />

      <SectionCard icon={<User size={18} />} iconColor="bg-yellow-50 text-yellow-600" title={content.type_enum === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"} description={simpleMode ? undefined : "Dados do titular ou responsável financeiro da loja."} defaultOpen={false}
        fields={[
          { key: "name", label: "Nome do recebedor", value: content.name ?? "", editable: true },
          { key: "birth_date", label: "Data de nascimento", value: content.birth_date ?? "", editable: true, type: "date", format: (v: string) => v ? formatDate(v) : "" },
          { key: "monthly_income", label: "Renda mensal", value: content.monthly_income ? String(content.monthly_income) : "", editable: true, format: (v: string) => v ? "R$ " + v : "" },
          { key: "professional_occupation", label: "Ocupação profissional", value: content.professional_occupation ?? "", editable: true },
        ]}
        onSave={savePersonalData}
      />

      <SectionCard icon={<MapPin size={18} />} iconColor="bg-emerald-50 text-emerald-600" title="Endereço" description={simpleMode ? undefined : "Use o endereço principal da operação ou do responsável financeiro, com CEP e número conferidos."} defaultOpen={false}
        fields={[
          { key: "street", label: "Rua", value: addr?.street ?? "", editable: true },
          { key: "street_number", label: "Número", value: addr?.street_number ?? "", editable: true },
          { key: "neighborhood", label: "Bairro", value: addr?.neighborhood ?? "", editable: true },
          { key: "complementary", label: "Complemento", value: addr?.complementary ?? "", editable: true },
          { key: "city", label: "Cidade", value: addr?.city ?? "", editable: true },
          { key: "state", label: "Estado", value: addr?.state ?? "", editable: true },
          { key: "zip_code", label: "CEP", value: addr?.zip_code ?? "", editable: true },
          { key: "reference_point", label: "Ponto de referência", value: addr?.reference_point ?? "", editable: true },
        ]}
        onSave={savePersonalData}
      />

      {!simpleMode && (
        <SectionCard
          icon={<Landmark size={18} />}
          iconColor="bg-purple-50 text-purple-600"
          title="Conta bancária"
          description="Confira aqui a conta cadastrada para receber os valores da loja."
          defaultOpen={false}
        >
          <div className="space-y-3 pt-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3.5">
                <div className="text-sm font-medium text-zinc-500">Titular</div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {bankData.title || "Ainda não informado"}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3.5">
                <div className="text-sm font-medium text-zinc-500">Banco</div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {bankData.bank || "Ainda não informado"}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3.5">
                <div className="text-sm font-medium text-zinc-500">Agência</div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {bankData.branch_number || "Ainda não informada"}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3.5">
                <div className="text-sm font-medium text-zinc-500">Conta</div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {bankData.account_number || "Ainda não informada"}
                </div>
              </div>
            </div>
            <Link
              href="/painel/conta"
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
            >
              Abrir conta bancária
            </Link>
          </div>
        </SectionCard>
      )}

    </div>
  );
}
