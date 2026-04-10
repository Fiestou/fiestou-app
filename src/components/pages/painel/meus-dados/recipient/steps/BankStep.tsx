import { ChangeEvent } from "react";
import { Input, Select } from "@/src/components/ui/form";
import { RecipientBankAccount, RecipientTypeEnum } from "@/src/models/Recipient";
import { BANK_OPTIONS } from "../helpers";

interface Props {
  bank: RecipientBankAccount;
  typeEnum: RecipientTypeEnum;
  onChange: (field: keyof RecipientBankAccount, value: any) => void;
}

export default function BankStep({ bank, typeEnum, onChange }: Props) {
  const isPJ = typeEnum === "PJ";

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">Informe a conta onde sua loja vai receber.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <Select
          name="bank"
          value={bank.bank}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange("bank", e.target.value)}
          options={BANK_OPTIONS}
          required
        />
        <Select
          name="type"
          value={bank.type}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange("type", e.target.value as "checking" | "savings")}
          options={[{ value: "checking", name: "Conta Corrente" }, { value: "savings", name: "Poupança" }]}
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Input name="branch_number" placeholder="Agência" value={bank.branch_number} onChange={(e) => onChange("branch_number", e.target.value)} required />
        <Input name="branch_check_digit" placeholder="Dígito agência" value={bank.branch_check_digit ?? ""} onChange={(e) => onChange("branch_check_digit", e.target.value)} maxLength={2} />
        <div />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input name="account_number" placeholder="Conta (sem dígito)" value={bank.account_number} onChange={(e) => onChange("account_number", e.target.value)} required />
        <Input name="account_check_digit" placeholder="Dígito conta" value={bank.account_check_digit} onChange={(e) => onChange("account_check_digit", e.target.value)} maxLength={5} required />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input name="holder_name" placeholder="Nome do titular" value={bank.holder_name} onChange={(e) => onChange("holder_name", e.target.value)} required />
        <Input name="holder_document" placeholder={isPJ ? "CNPJ titular" : "CPF titular"} value={bank.holder_document} onChange={(e) => onChange("holder_document", e.target.value)} required />
      </div>

      <Select
        name="holder_type"
        value={bank.holder_type}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange("holder_type", e.target.value as "individual" | "company")}
        options={[{ value: "individual", name: "Pessoa Física" }, { value: "company", name: "Pessoa Jurídica" }]}
        required
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm leading-relaxed text-yellow-800">
        <p className="font-semibold mb-1">Importante</p>
        <p>Use uma conta no mesmo CPF ou CNPJ do cadastro.</p>
      </div>
    </div>
  );
}
