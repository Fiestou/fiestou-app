import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Modal from "@/src/components/utils/Modal";
import { Button, Input, Select } from "@/src/components/ui/form";
import {
  RecipientAddress,
  RecipientBankAccount,
  RecipientConfig,
  RecipientEntity,
  RecipientPartner,
  RecipientPhone,
  RecipientStatusResponse,
  RecipientTypeEnum,
} from "@/src/models/recipient";
import { toast } from "react-toastify";
import { saveRecipientDraft } from "@/src/services/recipients";

interface RecipientModalProps {
  open: boolean;
  onClose: () => void;
  status?: RecipientStatusResponse | null;
  onCompleted?: (recipient: RecipientEntity) => void;
}

const createAddress = (): RecipientAddress => ({
  type: "Recipient",
  street: "",
  street_number: "",
  neighborhood: "",
  city: "",
  state: "",
  zip_code: "",
  complementary: "",
  reference_point: "",
  partner_document: "",
});

const createPhone = (): RecipientPhone => ({
  type: "Recipient",
  area_code: "",
  number: "",
  partner_document: "",
});

const createPartner = (): RecipientPartner => ({
  name: "",
  email: "",
  document: "",
  birth_date: "",
  monthly_income: null,
  professional_occupation: "",
  self_declared_legal_representative: false,
});

const createConfig = (): RecipientConfig => ({
  transfer_enabled: true,
  transfer_interval: "semanal",
  transfer_day: 5,
  anticipation_enabled: false,
  anticipation_type: null,
  anticipation_volume_percentage: "",
  anticipation_days: "",
  anticipation_delay: "",
});

const createBankAccount = (): RecipientBankAccount => ({
  bank: "",
  branch_number: "",
  branch_check_digit: "",
  account_number: "",
  account_check_digit: "",
  holder_name: "",
  holder_type: "individual",
  holder_document: "",
  type: "checking",
});

const buildInitialForm = (): RecipientEntity => ({
  type_enum: "PJ",
  email: "",
  document: "",
  name: "",
  company_name: "",
  trading_name: "",
  annual_revenue: null,
  birth_date: "",
  monthly_income: null,
  professional_occupation: "",
  type: "",
  addresses: [createAddress()],
  phones: [createPhone()],
  partners: [],
  configs: createConfig(),
  bank_account: createBankAccount(),
});

const steps = [
  { id: "type", label: "Tipo do cadastro" },
  { id: "identity", label: "Dados gerais" },
  { id: "contact", label: "Contatos e endereço" },
  { id: "bank", label: "Dados bancários" },
  { id: "partners", label: "Sócios", only: "PJ" as RecipientTypeEnum },
] as const;

type Step = (typeof steps)[number];

type StepId = Step["id"];

export default function RecipientModal({
  open,
  onClose,
  status,
  onCompleted,
}: RecipientModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<RecipientEntity>(buildInitialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Previne erro de hidratação SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const visibleSteps = useMemo(() => {
    return steps.filter(
      (step) => !("only" in step) || step.only === formData.type_enum
    );
  }, [formData.type_enum]);

  const currentStep =
    visibleSteps[Math.min(stepIndex, visibleSteps.length - 1)];

  useEffect(() => {
    if (!open) {
      return;
    }

    if (status?.recipient) {
      const recipient = status.recipient;
      const remoteConfig =
        (recipient as RecipientEntity).configs ?? recipient.config ?? null;
      setFormData({
        ...buildInitialForm(),
        ...recipient,
        addresses: recipient.addresses?.length
          ? recipient.addresses
          : [createAddress()],
        phones: recipient.phones?.length ? recipient.phones : [createPhone()],
        partners:
          recipient.partners?.map((partner) => ({
            ...partner,
            self_declared_legal_representative: Boolean(
              partner.self_declared_legal_representative
            ),
          })) ?? [],
        configs: remoteConfig
          ? {
              ...createConfig(),
              ...remoteConfig,
              transfer_enabled: Boolean(remoteConfig.transfer_enabled),
              anticipation_enabled: Boolean(remoteConfig.anticipation_enabled),
            }
          : createConfig(),
        bank_account: recipient.bank_account
          ? { ...createBankAccount(), ...recipient.bank_account }
          : createBankAccount(),
      });
      setStepIndex(0);
      setStepError(null);
      return;
    }

    setFormData(buildInitialForm());
    setStepIndex(0);
    setStepError(null);
  }, [open, status]);

  useEffect(() => {
    if (formData.type_enum === "PJ" && formData.partners.length === 0) {
      setFormData((prev) => ({ ...prev, partners: [createPartner()] }));
    }
  }, [formData.type_enum, formData.partners.length]);

  const updateField = (field: keyof RecipientEntity, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (
    index: number,
    field: keyof RecipientAddress,
    value: string
  ) => {
    setFormData((prev) => {
      const addresses = prev.addresses.map((address, idx) =>
        idx === index ? { ...address, [field]: value } : address
      );
      return { ...prev, addresses };
    });
  };

  const updatePhone = (
    index: number,
    field: keyof RecipientPhone,
    value: string
  ) => {
    setFormData((prev) => {
      const phones = prev.phones.map((phone, idx) =>
        idx === index ? { ...phone, [field]: value } : phone
      );
      return { ...prev, phones };
    });
  };

  const updatePartner = (
    index: number,
    field: keyof RecipientPartner,
    value: any
  ) => {
    setFormData((prev) => {
      const partners = prev.partners.map((partner, idx) => {
        if (idx !== index) return partner;
        return { ...partner, [field]: value };
      });
      return { ...prev, partners };
    });
  };

  // Função updateConfig comentada - removida etapa de configurações financeiras
  // const updateConfig = (field: keyof RecipientConfig, value: any) => {
  //   setFormData((prev) => ({ ...prev, configs: { ...prev.configs, [field]: value } }));
  // };

  const updateBankAccount = (field: keyof RecipientBankAccount, value: any) => {
    setFormData((prev) => ({
      ...prev,
      bank_account: prev.bank_account
        ? { ...prev.bank_account, [field]: value }
        : createBankAccount(),
    }));
  };

  const addAddress = () =>
    updateField("addresses", [...formData.addresses, createAddress()]);
  const removeAddress = (index: number) => {
    if (formData.addresses.length === 1) return;
    updateField(
      "addresses",
      formData.addresses.filter((_, idx) => idx !== index)
    );
  };

  const addPhone = () =>
    updateField("phones", [...formData.phones, createPhone()]);
  const removePhone = (index: number) => {
    if (formData.phones.length === 1) return;
    updateField(
      "phones",
      formData.phones.filter((_, idx) => idx !== index)
    );
  };

  const addPartner = () =>
    updateField("partners", [...formData.partners, createPartner()]);
  const removePartner = (index: number) => {
    updateField(
      "partners",
      formData.partners.filter((_, idx) => idx !== index)
    );
  };

  const validateStep = (stepId: StepId): string | null => {
    if (stepId === "type" && !formData.type_enum) {
      return "Selecione se o cadastro será PJ ou PF.";
    }

    if (stepId === "identity") {
      if (!formData.email || !formData.document) {
        return "Email e documento são obrigatórios.";
      }

      if (formData.type_enum === "PF") {
        if (!formData.name || !formData.birth_date) {
          return "Preencha nome completo e data de nascimento.";
        }
      } else {
        if (
          !formData.company_name ||
          !formData.trading_name ||
          !formData.name
        ) {
          return "Informe razão social, nome fantasia e representante legal.";
        }
      }
    }

    if (stepId === "contact") {
      const hasInvalidAddress = formData.addresses.some(
        (address) =>
          !address.street.trim() ||
          !address.street_number.trim() ||
          !address.neighborhood.trim() ||
          !address.city.trim() ||
          !address.state.trim() ||
          !address.zip_code.trim()
      );

      if (hasInvalidAddress) {
        return "Preencha todos os campos de endereço.";
      }

      const hasInvalidPhone = formData.phones.some(
        (phone) => !phone.area_code.trim() || !phone.number.trim()
      );

      if (hasInvalidPhone) {
        return "Informe DDD e telefone.";
      }
    }

    if (stepId === "bank") {
      if (!formData.bank_account) {
        return "Dados bancários são obrigatórios.";
      }

      const bank = formData.bank_account;
      if (
        !bank.bank.trim() ||
        !bank.branch_number.trim() ||
        !bank.account_number.trim() ||
        !bank.account_check_digit.trim() ||
        !bank.holder_name.trim() ||
        !bank.holder_document.trim()
      ) {
        return "Preencha todos os campos obrigatórios da conta bancária.";
      }
    }

    if (stepId === "partners" && formData.type_enum === "PJ") {
      if (formData.partners.length === 0) {
        return "Cadastros PJ precisam de pelo menos um sócio.";
      }

      const invalidPartner = formData.partners.some(
        (partner) => !partner.name.trim() || !partner.document.trim()
      );
      if (invalidPartner) {
        return "Complete nome e CPF/CNPJ de todos os sócios.";
      }
    }

    return null;
  };

  const handleNext = () => {
    const validation = validateStep(currentStep.id);
    if (validation) {
      setStepError(validation);
      return;
    }

    setStepError(null);

    if (stepIndex < visibleSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    setStepError(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const payload: RecipientEntity = {
      ...formData,
      annual_revenue: formData.annual_revenue ?? null,
      monthly_income: formData.monthly_income ?? null,
      addresses: formData.addresses.map((address) => ({
        ...address,
        partner_document: address.partner_document?.trim() || undefined,
      })),
      phones: formData.phones.map((phone) => ({
        ...phone,
        partner_document: phone.partner_document?.trim() || undefined,
      })),
      partners:
        formData.type_enum === "PJ"
          ? formData.partners.map((partner) => ({
              ...partner,
              monthly_income: partner.monthly_income ?? null,
              self_declared_legal_representative: Boolean(
                partner.self_declared_legal_representative
              ),
            }))
          : [],
      configs: {
        ...formData.configs,
        transfer_day: formData.configs.transfer_day ?? null,
        anticipation_type: formData.configs.anticipation_type ?? null,
        anticipation_volume_percentage:
          formData.configs.anticipation_volume_percentage?.trim() || null,
        anticipation_days: formData.configs.anticipation_days?.trim() || null,
        anticipation_delay: formData.configs.anticipation_delay?.trim() || null,
      },
      bank_account: formData.bank_account
        ? {
            ...formData.bank_account,
            branch_check_digit:
              formData.bank_account.branch_check_digit?.trim() || undefined,
          }
        : undefined,
    };

    setIsSubmitting(true);
    try {
      // TODO: Substituir saveRecipientDraft por chamada real ao backend (Aguardando Backend)
      const savedRecipient = await saveRecipientDraft(payload);
      toast.success("Dados enviados para análise.");
      onCompleted?.(savedRecipient);
      onClose();
    } catch (error) {
      toast.error("Não foi possível salvar o cadastro agora.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleSteps.map((step, index) => {
        const isActive = index === stepIndex;
        const isDone = index < stepIndex;
        return (
          <div key={step.id} className="flex items-center gap-2 text-sm">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : isDone
                  ? "bg-green-500 text-white"
                  : "bg-white text-zinc-600"
              }`}
            >
              {index + 1}
            </span>
            <span className={`${isActive ? "font-semibold" : "text-zinc-500"}`}>
              {step.label}
            </span>
            {index !== visibleSteps.length - 1 && (
              <span className="text-zinc-300">/</span>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTypeStep = () => (
    <div className="space-y-4">
      <p className="text-zinc-600">
        Escolha se você irá cadastrar como Pessoa Jurídica (PJ) ou Pessoa Física
        (PF). Isso muda os dados que a Pagar.me exige para liberar seus
        pagamentos.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["PJ", "PF"].map((type) => {
          const active = formData.type_enum === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() =>
                updateField("type_enum", type as RecipientTypeEnum)
              }
              className={`border rounded-lg p-5 text-left transition-colors ${
                active
                  ? "border-red-500 bg-red-50"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <p className="text-lg font-semibold">
                {type === "PJ"
                  ? "Quero vender como empresa"
                  : "Quero vender como pessoa física"}
              </p>
              <p className="text-sm text-zinc-500 mt-2">
                {type === "PJ"
                  ? "Ideal para CNPJ com emissão de notas, permite adicionar sócios e responsáveis."
                  : "Para autônomos e MEIs que ainda vendem com CPF."}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderIdentityStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Input
          name="email"
          placeholder="Email principal"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
        />
        <Input
          name="document"
          placeholder={formData.type_enum === "PJ" ? "CNPJ" : "CPF"}
          value={formData.document}
          onChange={(event) => updateField("document", event.target.value)}
          required
        />
      </div>

      {formData.type_enum === "PJ" ? (
        <div className="grid gap-4">
          <Input
            name="company_name"
            placeholder="Razão social"
            value={formData.company_name ?? ""}
            onChange={(event) =>
              updateField("company_name", event.target.value)
            }
            required
          />
          <Input
            name="trading_name"
            placeholder="Nome fantasia"
            value={formData.trading_name ?? ""}
            onChange={(event) =>
              updateField("trading_name", event.target.value)
            }
            required
          />
          <Input
            name="annual_revenue"
            type="number"
            placeholder="Faturamento anual aproximado"
            value={formData.annual_revenue ?? ""}
            onChange={(event) =>
              updateField(
                "annual_revenue",
                event.target.value ? Number(event.target.value) : null
              )
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          <Input
            name="birth_date"
            type="date"
            placeholder="Data de nascimento"
            value={formData.birth_date ?? ""}
            onChange={(event) => updateField("birth_date", event.target.value)}
            required
          />
          <Input
            name="monthly_income"
            type="number"
            placeholder="Renda mensal"
            value={formData.monthly_income ?? ""}
            onChange={(event) =>
              updateField(
                "monthly_income",
                event.target.value ? Number(event.target.value) : null
              )
            }
          />
        </div>
      )}

      <Input
        name="name"
        placeholder={
          formData.type_enum === "PJ"
            ? "Nome do responsável legal"
            : "Nome completo"
        }
        value={formData.name}
        onChange={(event) => updateField("name", event.target.value)}
        required
      />

      <Input
        name="professional_occupation"
        placeholder={
          formData.type_enum === "PJ" ? "Cargo do responsável" : "Profissão"
        }
        value={formData.professional_occupation ?? ""}
        onChange={(event) =>
          updateField("professional_occupation", event.target.value)
        }
      />
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      {formData.addresses.map((address, index) => (
        <div
          key={`address-${index}`}
          className="border rounded-lg p-4 space-y-3"
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold">Endereço {index + 1}</p>
            {formData.addresses.length > 1 && (
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => removeAddress(index)}
              >
                remover
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Select
              name={`address-type-${index}`}
              value={address.type ?? "Recipient"}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updateAddress(
                  index,
                  "type",
                  event.target.value as RecipientAddress["type"]
                )
              }
              options={[
                { value: "Recipient", name: "Endereço principal" },
                { value: "Partner", name: "Endereço de sócio" },
              ]}
            />
            <Input
              name={`address-zip-${index}`}
              placeholder="CEP"
              value={address.zip_code}
              onChange={(event) =>
                updateAddress(index, "zip_code", event.target.value)
              }
              required
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              name={`address-street-${index}`}
              placeholder="Rua"
              value={address.street}
              onChange={(event) =>
                updateAddress(index, "street", event.target.value)
              }
              required
            />
            <Input
              name={`address-number-${index}`}
              placeholder="Número"
              value={address.street_number}
              onChange={(event) =>
                updateAddress(index, "street_number", event.target.value)
              }
              required
            />
            <Input
              name={`address-complement-${index}`}
              placeholder="Complemento"
              value={address.complementary ?? ""}
              onChange={(event) =>
                updateAddress(index, "complementary", event.target.value)
              }
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              name={`address-neighborhood-${index}`}
              placeholder="Bairro"
              value={address.neighborhood}
              onChange={(event) =>
                updateAddress(index, "neighborhood", event.target.value)
              }
              required
            />
            <Input
              name={`address-city-${index}`}
              placeholder="Cidade"
              value={address.city}
              onChange={(event) =>
                updateAddress(index, "city", event.target.value)
              }
              required
            />
            <Input
              name={`address-state-${index}`}
              placeholder="UF"
              value={address.state}
              onChange={(event) =>
                updateAddress(index, "state", event.target.value.toUpperCase())
              }
              maxLength={2}
              required
            />
          </div>
        </div>
      ))}
      <Button style="btn-light" type="button" onClick={addAddress}>
        Adicionar outro endereço
      </Button>
    </div>
  );

  const renderPhones = () => (
    <div className="space-y-6">
      {formData.phones.map((phone, index) => (
        <div key={`phone-${index}`} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Telefone {index + 1}</p>
            {formData.phones.length > 1 && (
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => removePhone(index)}
              >
                remover
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Select
              name={`phone-type-${index}`}
              value={phone.type ?? "Recipient"}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updatePhone(
                  index,
                  "type",
                  event.target.value as RecipientPhone["type"]
                )
              }
              options={[
                { value: "Recipient", name: "Principal" },
                { value: "Partner", name: "Sócio" },
              ]}
            />
            <Input
              name={`phone-area-code-${index}`}
              placeholder="DDD"
              value={phone.area_code}
              onChange={(event) =>
                updatePhone(index, "area_code", event.target.value)
              }
              required
            />
            <Input
              name={`phone-number-${index}`}
              placeholder="Número"
              value={phone.number}
              onChange={(event) =>
                updatePhone(index, "number", event.target.value)
              }
              required
            />
          </div>
        </div>
      ))}
      <Button style="btn-light" type="button" onClick={addPhone}>
        Adicionar outro telefone
      </Button>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-10">
      {renderAddresses()}
      {renderPhones()}
    </div>
  );

  const renderBankStep = () => {
    const bank = formData.bank_account || createBankAccount();

    return (
      <div className="space-y-6">
        <p className="text-zinc-600">
          Informe os dados da conta bancária onde você receberá os pagamentos. A
          conta deve estar no nome do titular do cadastro (CPF/CNPJ).
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            name="bank"
            value={bank.bank}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateBankAccount("bank", event.target.value)
            }
            options={[
              { value: "", name: "Selecione o banco" },
              { value: "001", name: "001 - Banco do Brasil" },
              { value: "033", name: "033 - Santander" },
              { value: "104", name: "104 - Caixa Econômica" },
              { value: "237", name: "237 - Bradesco" },
              { value: "341", name: "341 - Itaú" },
              { value: "260", name: "260 - Nu Pagamentos (Nubank)" },
              { value: "077", name: "077 - Banco Inter" },
              { value: "212", name: "212 - Banco Original" },
              { value: "336", name: "336 - Banco C6" },
              { value: "290", name: "290 - Pagseguro" },
              { value: "323", name: "323 - Mercado Pago" },
            ]}
            required
          />
          <Select
            name="type"
            value={bank.type}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateBankAccount(
                "type",
                event.target.value as "checking" | "savings"
              )
            }
            options={[
              { value: "checking", name: "Conta Corrente" },
              { value: "savings", name: "Conta Poupança" },
            ]}
            required
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Input
            name="branch_number"
            placeholder="Número da agência"
            value={bank.branch_number}
            onChange={(event) =>
              updateBankAccount("branch_number", event.target.value)
            }
            required
          />
          <Input
            name="branch_check_digit"
            placeholder="Dígito da agência"
            value={bank.branch_check_digit ?? ""}
            onChange={(event) =>
              updateBankAccount("branch_check_digit", event.target.value)
            }
            maxLength={2}
          />
          <div className="col-span-1" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            name="account_number"
            placeholder="Número da conta (sem dígito)"
            value={bank.account_number}
            onChange={(event) =>
              updateBankAccount("account_number", event.target.value)
            }
            required
          />
          <Input
            name="account_check_digit"
            placeholder="Dígito verificador da conta"
            value={bank.account_check_digit}
            onChange={(event) =>
              updateBankAccount("account_check_digit", event.target.value)
            }
            maxLength={5}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            name="holder_name"
            placeholder="Nome completo do titular"
            value={bank.holder_name}
            onChange={(event) =>
              updateBankAccount("holder_name", event.target.value)
            }
            required
          />
          <Input
            name="holder_document"
            placeholder={
              formData.type_enum === "PJ" ? "CNPJ do titular" : "CPF do titular"
            }
            value={bank.holder_document}
            onChange={(event) =>
              updateBankAccount("holder_document", event.target.value)
            }
            required
          />
        </div>

        <Select
          name="holder_type"
          value={bank.holder_type}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            updateBankAccount(
              "holder_type",
              event.target.value as "individual" | "company"
            )
          }
          options={[
            { value: "individual", name: "Pessoa Física" },
            { value: "company", name: "Pessoa Jurídica" },
          ]}
          required
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Atenção:</p>
          <p>
            Os dados bancários devem pertencer ao mesmo CPF/CNPJ informado no
            cadastro. A Pagar.me pode solicitar comprovantes adicionais antes de
            liberar os repasses.
          </p>
        </div>
      </div>
    );
  };

  const renderPartnersStep = () => (
    <div className="space-y-6">
      {formData.partners.map((partner, index) => (
        <div
          key={`partner-${index}`}
          className="border rounded-lg p-4 space-y-3"
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold">Sócio {index + 1}</p>
            {formData.partners.length > 1 && (
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => removePartner(index)}
              >
                remover
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              name={`partner-name-${index}`}
              placeholder="Nome completo"
              value={partner.name}
              onChange={(event) =>
                updatePartner(index, "name", event.target.value)
              }
              required
            />
            <Input
              name={`partner-email-${index}`}
              placeholder="Email"
              value={partner.email ?? ""}
              onChange={(event) =>
                updatePartner(index, "email", event.target.value)
              }
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              name={`partner-document-${index}`}
              placeholder="CPF"
              value={partner.document}
              onChange={(event) =>
                updatePartner(index, "document", event.target.value)
              }
              required
            />
            <Input
              name={`partner-birth-${index}`}
              type="date"
              placeholder="Nascimento"
              value={partner.birth_date ?? ""}
              onChange={(event) =>
                updatePartner(index, "birth_date", event.target.value)
              }
            />
            <Input
              name={`partner-income-${index}`}
              type="number"
              placeholder="Renda mensal"
              value={partner.monthly_income ?? ""}
              onChange={(event) =>
                updatePartner(
                  index,
                  "monthly_income",
                  event.target.value ? Number(event.target.value) : null
                )
              }
            />
          </div>
          <Input
            name={`partner-occupation-${index}`}
            placeholder="Profissão / cargo"
            value={partner.professional_occupation ?? ""}
            onChange={(event) =>
              updatePartner(
                index,
                "professional_occupation",
                event.target.value
              )
            }
          />
          <label className="flex items-center gap-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={Boolean(partner.self_declared_legal_representative)}
              onChange={(event) =>
                updatePartner(
                  index,
                  "self_declared_legal_representative",
                  event.target.checked
                )
              }
            />
            É representante legal da empresa
          </label>
        </div>
      ))}
      <Button style="btn-light" type="button" onClick={addPartner}>
        Adicionar outro sócio
      </Button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep.id) {
      case "type":
        return renderTypeStep();
      case "identity":
        return renderIdentityStep();
      case "contact":
        return renderContactStep();
      case "bank":
        return renderBankStep();
      case "partners":
        return renderPartnersStep();
      default:
        return null;
    }
  };

  // Não renderiza até estar montado no cliente (evita erro de hidratação)
  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      status={open}
      close={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      title="Concluir cadastro na Pagar.me"
      fullscreen={true}
    >
      <div className="flex flex-col gap-6">
        <StepIndicator />

        {stepError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
            {stepError}
          </div>
        )}

        {renderStepContent()}

        <div className="flex justify-between pt-4">
          <Button
            style="btn-outline-light"
            type="button"
            disable={stepIndex === 0 || isSubmitting}
            onClick={handlePrev}
          >
            Voltar
          </Button>
          <Button
            style={
              stepIndex === visibleSteps.length - 1
                ? "btn-success"
                : "btn-yellow"
            }
            type="button"
            loading={isSubmitting}
            onClick={handleNext}
          >
            {stepIndex === visibleSteps.length - 1
              ? "Enviar para análise"
              : "Continuar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
