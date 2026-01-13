import { useEffect, useMemo, useState } from "react";
import Modal from "@/src/components/utils/Modal";
import { Button } from "@/src/components/ui/form";
import { AddressType, RecipientEntity, RecipientStatusResponse, RecipientType, RecipientTypeEnum, PhoneType } from "@/src/models/Recipient";
import { UserType } from "@/src/models/user";
import { toast } from "react-toastify";
import { justNumber } from "@/src/helper";
import { createRecipient } from "@/src/services/recipients";

import { STEPS, buildInitialForm, createAddress, createPhone, createPartner, createConfig, createBankAccount, validateStep, Step } from "./recipient/helpers";
import { StepIndicator, TypeStep, IdentityStep, ContactStep, BankStep, PartnersStep } from "./recipient/steps";

interface Props {
  open: boolean;
  onClose: () => void;
  status?: RecipientStatusResponse | null;
  onCompleted?: (recipient: RecipientType) => void;
  user?: UserType;
  store?: any;
}

export default function RecipientModal({ open, onClose, status, onCompleted, user, store }: Props) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<RecipientEntity>(buildInitialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Determina tipo baseado no documento (user ou store)
  const userType: RecipientTypeEnum = useMemo(() => {
    const doc = user?.cpf || user?.document || store?.document || "";
    const cleanDoc = justNumber(doc);
    return cleanDoc.length === 14 ? "PJ" : "PF";
  }, [user?.cpf, user?.document, store?.document]);

  useEffect(() => setMounted(true), []);

  // Verifica se já tem documento definido para pular step de tipo
  const hasDocument = useMemo(() => {
    const doc = user?.cpf || user?.document || store?.document || "";
    return justNumber(doc).length >= 11;
  }, [user?.cpf, user?.document, store?.document]);

  const visibleSteps = useMemo(() => {
    return STEPS.filter((s) => {
      // Pula step de tipo se já tem documento
      if (s.id === "type" && hasDocument) return false;
      // Filtra steps exclusivos de PJ/PF
      if ("only" in s && s.only !== formData.type_enum) return false;
      return true;
    });
  }, [formData.type_enum, hasDocument]);
  const currentStep = visibleSteps[Math.min(stepIndex, visibleSteps.length - 1)];

  // Carrega dados quando modal abre
  useEffect(() => {
    if (!open) return;

    if (status?.recipient) {
      const r = status.recipient as RecipientType;
      const cfg = (r as any).configs ?? r.config ?? null;

      setFormData({
        ...buildInitialForm(),
        type_enum: userType,
        email: user?.email || r.email || "",
        document: user?.cpf || user?.document || r.document || "",
        name: user?.name || r.name || "",
        birth_date: user?.date || r.birth_date || "",
        company_name: userType === "PJ" ? (r.company_name ?? store?.companyName ?? "") : null,
        trading_name: userType === "PJ" ? (r.trading_name ?? store?.title ?? "") : null,
        annual_revenue: r.annual_revenue ? Number(r.annual_revenue) : null,
        monthly_income: r.monthly_income ? Number(r.monthly_income) : null,
        professional_occupation: r.professional_occupation || "",
        addresses: r.addresses?.map((a: AddressType) => ({
          id: a.id, type: "Recipient" as const, partner_document: a.partner_document ?? "",
          street: a.street ?? "", complementary: a.complementary ?? "", street_number: a.street_number ?? "",
          neighborhood: a.neighborhood ?? "", city: a.city ?? "", state: a.state ?? "",
          zip_code: a.zip_code ?? "", reference_point: a.reference_point ?? "",
        })) ?? [createAddress()],
        phones: r.phones?.map((p: PhoneType) => ({
          id: p.id, type: "Recipient" as const, partner_document: p.partner_document ?? "",
          area_code: p.area_code ?? "", number: p.number ?? "",
        })) ?? [createPhone()],
        partners: r.partners?.map((p: any) => ({
          id: p.id, name: p.name, email: p.email, document: p.document, birth_date: p.birth_date,
          monthly_income: p.monthly_income ? Number(p.monthly_income) : null,
          professional_occupation: p.professional_occupation,
          self_declared_legal_representative: Boolean(p.self_declared_legal_representative),
        })) ?? [],
        configs: cfg ? { ...createConfig(), ...cfg, transfer_enabled: Boolean(cfg.transfer_enabled), anticipation_enabled: Boolean(cfg.anticipation_enabled) } : createConfig(),
        bank_account: r.bank_account ? {
          ...createBankAccount(),
          bank: r.bank_account.bank ?? "", branch_number: r.bank_account.branch_number ?? "",
          branch_check_digit: r.bank_account.branch_check_digit ?? "", account_number: r.bank_account.account_number ?? "",
          account_check_digit: r.bank_account.account_check_digit ?? "", holder_name: r.bank_account.holder_name ?? "",
          holder_type: userType === "PJ" ? "company" : "individual",
          holder_document: r.bank_account.holder_document ?? "",
          type: (r.bank_account.type as "checking" | "savings") ?? "checking",
        } : (() => { const acc = createBankAccount(); acc.holder_type = userType === "PJ" ? "company" : "individual"; return acc; })(),
      });
    } else {
      // Inicializa form com dados do usuário/store mesmo sem recipient
      // Preenche endereço automaticamente se usuário tiver
      const userAddr = user?.address?.[0];
      const initialAddresses = userAddr ? [{
        id: undefined,
        type: "Recipient" as const,
        partner_document: "",
        street: userAddr.street || "",
        complementary: userAddr.complement || "",
        street_number: String(userAddr.number || ""),
        neighborhood: userAddr.neighborhood || "",
        city: userAddr.city || "",
        state: userAddr.state || "",
        zip_code: userAddr.zipCode || "",
        reference_point: "",
      }] : [createAddress()];

      // Preenche telefone automaticamente se usuário tiver
      const userPhone = user?.phone?.replace(/\D/g, "") || "";
      const initialPhones = userPhone.length >= 10 ? [{
        id: undefined,
        type: "Recipient" as const,
        partner_document: "",
        area_code: userPhone.slice(0, 2),
        number: userPhone.slice(2),
      }] : [createPhone()];

      // Preenche conta bancária automaticamente se usuário tiver
      const userBank = (user as any)?.bankAccounts?.[0];
      const initialBank = userBank ? {
        ...createBankAccount(),
        bank: userBank.bank || "",
        branch_number: userBank.agence || "",
        branch_check_digit: userBank.agenceDigit || "",
        account_number: userBank.accountNumber || "",
        account_check_digit: userBank.accountDigit || "",
        holder_name: userBank.title || user?.name || "",
        holder_type: (userType === "PJ" ? "company" : "individual") as "individual" | "company",
        holder_document: user?.cpf || user?.document || store?.document || "",
        type: (userBank.type === "savings" ? "savings" : "checking") as "checking" | "savings",
      } : (() => { const acc = createBankAccount(); acc.holder_type = userType === "PJ" ? "company" : "individual"; return acc; })();

      setFormData({
        ...buildInitialForm(),
        type_enum: userType,
        email: user?.email || "",
        document: user?.cpf || user?.document || store?.document || "",
        name: user?.name || "",
        birth_date: user?.date || "",
        company_name: userType === "PJ" ? (store?.companyName || store?.title || "") : null,
        trading_name: userType === "PJ" ? (store?.title || "") : null,
        addresses: initialAddresses,
        phones: initialPhones,
        bank_account: initialBank,
        // Para PJ, garantir que tenha pelo menos um sócio
        partners: userType === "PJ" ? [createPartner()] : [],
      });
    }
    setStepIndex(0);
    setStepError(null);
  }, [open, status, userType, user, store]);

  // Adiciona sócio automaticamente para PJ
  useEffect(() => {
    if (formData.type_enum === "PJ" && formData.partners.length === 0) {
      setFormData((prev) => ({ ...prev, partners: [createPartner()] }));
    }
  }, [formData.type_enum, formData.partners.length]);

  // Helpers de atualização
  const updateField = (field: keyof RecipientEntity, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));
  const updateAddress = (i: number, field: any, value: string) => setFormData((prev) => ({ ...prev, addresses: prev.addresses.map((a, idx) => idx === i ? { ...a, [field]: value } : a) }));
  const updatePhone = (i: number, field: any, value: string) => setFormData((prev) => ({ ...prev, phones: prev.phones.map((p, idx) => idx === i ? { ...p, [field]: value } : p) }));
  const updatePartner = (i: number, field: any, value: any) => setFormData((prev) => ({ ...prev, partners: prev.partners.map((p, idx) => idx === i ? { ...p, [field]: value } : p) }));
  const updateBank = (field: any, value: any) => setFormData((prev) => ({ ...prev, bank_account: prev.bank_account ? { ...prev.bank_account, [field]: value } : createBankAccount() }));

  const addAddress = () => updateField("addresses", [...formData.addresses, createAddress()]);
  const removeAddress = (i: number) => { if (formData.addresses.length > 1) updateField("addresses", formData.addresses.filter((_, idx) => idx !== i)); };
  const addPhone = () => updateField("phones", [...formData.phones, createPhone()]);
  const removePhone = (i: number) => { if (formData.phones.length > 1) updateField("phones", formData.phones.filter((_, idx) => idx !== i)); };
  const addPartner = () => updateField("partners", [...formData.partners, createPartner()]);
  const removePartner = (i: number) => updateField("partners", formData.partners.filter((_, idx) => idx !== i));

  const handleNext = () => {
    const err = validateStep(currentStep.id, formData);
    if (err) { setStepError(err); return; }
    setStepError(null);
    if (stepIndex < visibleSteps.length - 1) setStepIndex(stepIndex + 1);
    else handleSubmit();
  };

  const handlePrev = () => { setStepError(null); setStepIndex((prev) => Math.max(prev - 1, 0)); };

  const handleSubmit = async () => {
    const payload: RecipientEntity = {
      ...formData,
      email: formData.email.trim(),
      document: justNumber(formData.document),
      name: formData.name.trim(),
      company_name: formData.type_enum === "PJ" ? formData.company_name || "" : null,
      trading_name: formData.type_enum === "PJ" ? formData.trading_name || "" : null,
      addresses: formData.addresses.map((a) => ({ ...a, zip_code: a.zip_code || "", city: a.city || "", state: a.state || "", type: a.type || "Recipient" })),
      phones: formData.phones.map((p) => ({ ...p, type: p.type || "Recipient" })),
      partners: formData.type_enum === "PJ" ? formData.partners.map((p) => ({ ...p, document: justNumber(p.document), monthly_income: p.monthly_income ?? null, self_declared_legal_representative: Boolean(p.self_declared_legal_representative) })) : [],
      configs: { ...formData.configs, transfer_day: formData.configs.transfer_day ?? null, anticipation_type: formData.configs.anticipation_type ?? null, anticipation_volume_percentage: formData.configs.anticipation_volume_percentage?.trim() || null, anticipation_days: formData.configs.anticipation_days?.trim() || null, anticipation_delay: formData.configs.anticipation_delay?.trim() || null },
      bank_account: { ...formData.bank_account, holder_type: formData.type_enum === "PJ" ? "company" : "individual", branch_check_digit: formData.bank_account.branch_check_digit?.trim() || "", holder_document: justNumber(formData.bank_account.holder_document || "") },
    };

    setSubmitting(true);
    try {
      const saved = await createRecipient(payload);
      toast.success("Dados enviados para análise.");
      onCompleted?.(saved);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep.id) {
      case "type": return <TypeStep value={formData.type_enum} onChange={(v) => updateField("type_enum", v)} />;
      case "identity": return <IdentityStep data={formData} onChange={updateField} />;
      case "contact": return <ContactStep addresses={formData.addresses} phones={formData.phones} onAddressChange={updateAddress} onPhoneChange={updatePhone} onAddAddress={addAddress} onRemoveAddress={removeAddress} onAddPhone={addPhone} onRemovePhone={removePhone} />;
      case "bank": return <BankStep bank={formData.bank_account || createBankAccount()} typeEnum={formData.type_enum} onChange={updateBank} />;
      case "partners": return <PartnersStep partners={formData.partners} onChange={updatePartner} onAdd={addPartner} onRemove={removePartner} />;
      default: return null;
    }
  };

  if (!mounted) return null;

  return (
    <Modal status={open} close={() => !submitting && onClose()} title="Cadastro Pagar.me" fullscreen>
      <div className="flex flex-col gap-6">
        <StepIndicator steps={visibleSteps as Step[]} currentIndex={stepIndex} />

        {stepError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">{stepError}</div>}

        {renderStep()}

        <div className="flex justify-between pt-4">
          <Button style="btn-outline-light" type="button" disable={stepIndex === 0 || submitting} onClick={handlePrev}>Voltar</Button>
          <Button style={stepIndex === visibleSteps.length - 1 ? "btn-success" : "btn-yellow"} type="button" loading={submitting} onClick={handleNext}>
            {stepIndex === visibleSteps.length - 1 ? "Enviar para análise" : "Continuar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
