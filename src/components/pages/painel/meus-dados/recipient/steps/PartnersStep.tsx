import { Button, Input } from "@/src/components/ui/form";
import { RecipientPartner } from "@/src/models/Recipient";

interface Props {
  partners: RecipientPartner[];
  onChange: (index: number, field: keyof RecipientPartner, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function PartnersStep({ partners, onChange, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-6">
      {partners.map((p, i) => (
        <div key={`partner-${i}`} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Sócio {i + 1}</p>
            {partners.length > 1 && (
              <button type="button" className="text-sm text-red-600" onClick={() => onRemove(i)}>remover</button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Input name={`p-name-${i}`} placeholder="Nome completo" value={p.name} onChange={(e) => onChange(i, "name", e.target.value)} required />
            <Input name={`p-email-${i}`} placeholder="Email" value={p.email ?? ""} onChange={(e) => onChange(i, "email", e.target.value)} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Input name={`p-doc-${i}`} placeholder="CPF" value={p.document} onChange={(e) => onChange(i, "document", e.target.value)} required />
            <Input name={`p-birth-${i}`} type="date" placeholder="Nascimento" value={p.birth_date ?? ""} onChange={(e) => onChange(i, "birth_date", e.target.value)} />
            <Input name={`p-income-${i}`} type="number" placeholder="Renda mensal" value={p.monthly_income ?? ""} onChange={(e) => onChange(i, "monthly_income", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <Input name={`p-job-${i}`} placeholder="Profissão/cargo" value={p.professional_occupation ?? ""} onChange={(e) => onChange(i, "professional_occupation", e.target.value)} />
          <label className="flex items-center gap-3 text-sm text-zinc-700">
            <input type="checkbox" checked={Boolean(p.self_declared_legal_representative)} onChange={(e) => onChange(i, "self_declared_legal_representative", e.target.checked)} />
            É representante legal
          </label>
        </div>
      ))}
      <Button style="btn-light" type="button" onClick={onAdd}>Adicionar sócio</Button>
    </div>
  );
}
