import { useEffect, useState } from "react";
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

function FieldRow({ field, editMode, onChange }: {
  field: FieldDef;
  editMode: boolean;
  onChange: (key: string, val: string) => void;
}) {
  const canEdit = editMode && field.editable !== false;
  const displayVal = field.format ? field.format(field.value) : field.value;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-zinc-100 last:border-0 gap-1 sm:gap-0">
      <span className="text-sm text-zinc-500 sm:w-48 shrink-0">{field.label}</span>
      {canEdit ? (
        <input
          type={field.type === "date" ? "date" : "text"}
          className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-yellow-400 bg-white"
          value={field.type === "date" ? (field.value || "").split("T")[0] : field.value}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      ) : (
        <span className={`text-sm font-medium ${displayVal && displayVal !== "" ? "text-zinc-900" : "text-zinc-300 italic"}`}>
          {displayVal || "Não preenchido"}
        </span>
      )}
    </div>
  );
}

function SectionCard({ icon, iconColor, title, fields, onSave, saveLabel, children, defaultOpen = false }: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
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

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-zinc-50/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>
          <h3 className="font-semibold text-zinc-900 font-display">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {open && hasEditable && onSave && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-cyan-50 transition-colors"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              ) : (
                <>
                  <button onClick={handleCancel} className="text-sm text-zinc-500 hover:text-zinc-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors">
                    <X size={14} /> Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving} className="text-sm text-white bg-yellow-500 hover:bg-yellow-600 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    <Check size={14} /> {saving ? "Salvando..." : (saveLabel || "Salvar")}
                  </button>
                </>
              )}
            </div>
          )}
          {open ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
        </div>
      </div>
      {open && (
        <div className="px-5 pb-5 border-t border-zinc-100">
          {fields ? (
            <div className="pt-2">
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

export default function UserEdit({ user }: { user: UserType }) {
  const api = new Api();
  const [content, setContent] = useState<RecipientType | null>(null);
  const [storeId, setStoreId] = useState<any>();
  const [bankData, setBankData] = useState<BankAccountTypeRecipient>({} as BankAccountTypeRecipient);

  const buildFromUser = (): RecipientType => {
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
  };

  const getRecipientCode = async (sid: string) => {
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
  };

  const fetchBankData = async () => {
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
  };

  useEffect(() => { if (typeof window !== "undefined") setStoreId(getStore()); }, []);
  useEffect(() => { if (storeId) getRecipientCode(storeId); }, [storeId]);
  useEffect(() => { if (content) { fetchBankData(); } }, [content]);

  const phone = content?.phones?.[0];
  const phoneDisplay = phone ? `(${phone.area_code}) ${phone.number}` : "";
  const addr = content?.addresses?.[0];

  const saveBasicInfo = async (fields: Record<string, string>) => {
    if (!content?.id) { toast.warning("Conclua o cadastro no Pagar.me primeiro."); return; }
    const phoneParts = fields.phone?.match(/\((\d{2})\)\s*(\d{4,5})-?(\d{4})/);
    const payload: any = { email: fields.email, monthly_income: fields.monthly_income };
    if (phoneParts) { payload.phone = { area_code: phoneParts[1], number: phoneParts[2] + phoneParts[3] }; }
    const res = await api.bridge({ method: "put", url: `info/recipient/${content.id}/update`, data: payload });
    if (res) toast.success("Dados atualizados!"); else toast.error("Erro ao atualizar.");
  };

  const savePersonalData = async (fields: Record<string, string>) => {
    if (!content?.id) { toast.warning("Conclua o cadastro no Pagar.me primeiro."); return; }
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

  const saveBankData = async (fields: Record<string, string>) => {
    if (!content?.id) { toast.warning("Conclua o cadastro no Pagar.me primeiro."); return; }
    const sid = getStore();
    const payload = { bank: fields.bank, branch_number: fields.branch_number, branch_check_digit: fields.branch_check_digit, account_number: fields.account_number, account_check_digit: fields.account_check_digit, holder_name: fields.title };
    const check: any = await api.bridge({ method: "get", url: `/withdraw/${sid}` });
    const wd = check?.[0] ?? check?.data?.[0] ?? null;
    if (wd?.id) {
      const res: any = await api.bridge({ method: "post", url: "/withdraw/update", data: { id: wd.id, store: sid, ...payload } });
      if (res?.response) toast.success("Dados bancários atualizados!"); else toast.error("Erro ao atualizar.");
    } else {
      const res: any = await api.bridge({ method: "post", url: "/withdraw/register", data: { store: sid, recipient_id: content.id, ...payload, split_payment: 1, is_split: 1 } });
      if (res?.response) toast.success("Dados bancários salvos!"); else toast.error("Erro ao salvar.");
    }
  };

  if (!content) return <div className="text-zinc-400 text-sm py-8 text-center">Carregando dados do recebedor...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center">
            <User size={24} className="text-cyan-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-zinc-900 font-display">{content.name || user.name || "Recebedor"}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${content.code ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                {content.code ? "Ativo" : "Pendente"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              {content.code && <span className="text-xs text-zinc-400 flex items-center gap-1"><Hash size={12} />{content.code}</span>}
              <span className="text-xs text-zinc-400 flex items-center gap-1"><Mail size={12} />{content.email}</span>
              {phoneDisplay && <span className="text-xs text-zinc-400 flex items-center gap-1"><Phone size={12} />{phoneDisplay}</span>}
              <span className="text-xs text-zinc-400 flex items-center gap-1"><Building2 size={12} />{content.type_enum === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}</span>
            </div>
          </div>
        </div>
      </div>

      <SectionCard icon={<Mail size={18} />} iconColor="bg-cyan-50 text-cyan-600" title="Informações de contato" defaultOpen={true}
        fields={[
          { key: "email", label: "E-mail", value: content.email ?? "", editable: true },
          { key: "phone", label: "Telefone", value: phoneDisplay, editable: true },
          { key: "document", label: "CPF/CNPJ", value: content.document ?? "", editable: false, format: formatCpfCnpj },
        ]}
        onSave={saveBasicInfo}
      />

      <SectionCard icon={<User size={18} />} iconColor="bg-yellow-50 text-yellow-600" title={content.type_enum === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"} defaultOpen={false}
        fields={[
          { key: "name", label: "Nome do recebedor", value: content.name ?? "", editable: true },
          { key: "birth_date", label: "Data de nascimento", value: content.birth_date ?? "", editable: true, type: "date", format: (v: string) => v ? formatDate(v) : "" },
          { key: "monthly_income", label: "Renda mensal", value: content.monthly_income ? String(content.monthly_income) : "", editable: true, format: (v: string) => v ? "R$ " + v : "" },
          { key: "professional_occupation", label: "Ocupação profissional", value: content.professional_occupation ?? "", editable: true },
        ]}
        onSave={savePersonalData}
      />

      <SectionCard icon={<MapPin size={18} />} iconColor="bg-emerald-50 text-emerald-600" title="Endereço" defaultOpen={false}
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

      <SectionCard icon={<Landmark size={18} />} iconColor="bg-purple-50 text-purple-600" title="Conta bancária" defaultOpen={false}
        fields={[
          { key: "title", label: "Nome do titular", value: bankData.title ?? "", editable: true },
          { key: "bank", label: "Código do banco", value: bankData.bank ?? "", editable: true },
          { key: "branch_number", label: "Número da agência", value: bankData.branch_number ?? "", editable: true },
          { key: "branch_check_digit", label: "Dígito da agência", value: bankData.branch_check_digit ?? "", editable: true },
          { key: "account_number", label: "Número da conta", value: bankData.account_number ?? "", editable: true },
          { key: "account_check_digit", label: "Dígito da conta", value: bankData.account_check_digit ?? "", editable: true },
        ]}
        onSave={saveBankData}
      />

    </div>
  );
}
