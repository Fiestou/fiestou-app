import { Input } from "@/src/components/ui/form";
import { RecipientEntity } from "@/src/models/Recipient";

interface Props {
  data: RecipientEntity;
  onChange: (field: keyof RecipientEntity, value: any) => void;
}

export default function IdentityStep({ data, onChange }: Props) {
  const isPJ = data.type_enum === "PJ";

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Input name="email" placeholder="Email principal" value={data.email} onChange={(e) => onChange("email", e.target.value)} required />
        <Input name="document" placeholder={isPJ ? "CNPJ" : "CPF"} value={data.document} onChange={(e) => onChange("document", e.target.value)} required />
      </div>

      {isPJ ? (
        <div className="grid gap-4">
          <Input name="company_name" placeholder="Razão social" value={data.company_name ?? ""} onChange={(e) => onChange("company_name", e.target.value)} required />
          <Input name="trading_name" placeholder="Nome fantasia" value={data.trading_name ?? ""} onChange={(e) => onChange("trading_name", e.target.value)} required />
          <Input name="annual_revenue" type="number" placeholder="Faturamento anual (R$)" value={data.annual_revenue ?? ""} onChange={(e) => onChange("annual_revenue", e.target.value ? Number(e.target.value) : null)} required />
        </div>
      ) : (
        <div className="grid gap-4">
          <Input name="birth_date" type="date" placeholder="Nascimento" value={data.birth_date ?? ""} onChange={(e) => onChange("birth_date", e.target.value)} required />
          <Input name="monthly_income" type="number" placeholder="Renda mensal" value={data.monthly_income ?? ""} onChange={(e) => onChange("monthly_income", e.target.value ? Number(e.target.value) : null)} />
        </div>
      )}

      <Input name="name" placeholder={isPJ ? "Nome do responsável legal" : "Nome completo"} value={data.name} onChange={(e) => onChange("name", e.target.value)} required />
      <Input name="professional_occupation" placeholder={isPJ ? "Cargo do responsável" : "Profissão"} value={data.professional_occupation ?? ""} onChange={(e) => onChange("professional_occupation", e.target.value)} />
    </div>
  );
}
