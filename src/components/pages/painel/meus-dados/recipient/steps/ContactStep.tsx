import { ChangeEvent } from "react";
import { Button, Input, Select } from "@/src/components/ui/form";
import { RecipientAddress, RecipientPhone } from "@/src/models/Recipient";

interface Props {
  addresses: RecipientAddress[];
  phones: RecipientPhone[];
  onAddressChange: (index: number, field: keyof RecipientAddress, value: string) => void;
  onPhoneChange: (index: number, field: keyof RecipientPhone, value: string) => void;
  onAddAddress: () => void;
  onRemoveAddress: (index: number) => void;
  onAddPhone: () => void;
  onRemovePhone: (index: number) => void;
}

export default function ContactStep({
  addresses, phones,
  onAddressChange, onPhoneChange,
  onAddAddress, onRemoveAddress,
  onAddPhone, onRemovePhone,
}: Props) {
  return (
    <div className="space-y-10">
      {/* Endereços */}
      <div className="space-y-6">
        {addresses.map((addr, i) => (
          <div key={`addr-${i}`} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Endereço {i + 1}</p>
              {addresses.length > 1 && (
                <button type="button" className="text-sm text-red-600" onClick={() => onRemoveAddress(i)}>remover</button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Select
                name={`addr-type-${i}`}
                value={addr.type ?? "Recipient"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onAddressChange(i, "type", e.target.value as any)}
                options={[{ value: "Recipient", name: "Principal" }, { value: "Partner", name: "Sócio" }]}
              />
              <Input name={`addr-zip-${i}`} placeholder="CEP" value={addr.zip_code} onChange={(e) => onAddressChange(i, "zip_code", e.target.value)} required />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <Input name={`addr-street-${i}`} placeholder="Rua" value={addr.street} onChange={(e) => onAddressChange(i, "street", e.target.value)} required />
              <Input name={`addr-num-${i}`} placeholder="Número" value={addr.street_number} onChange={(e) => onAddressChange(i, "street_number", e.target.value)} required />
              <Input name={`addr-comp-${i}`} placeholder="Complemento" value={addr.complementary ?? ""} onChange={(e) => onAddressChange(i, "complementary", e.target.value)} />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <Input name={`addr-neigh-${i}`} placeholder="Bairro" value={addr.neighborhood} onChange={(e) => onAddressChange(i, "neighborhood", e.target.value)} required />
              <Input name={`addr-city-${i}`} placeholder="Cidade" value={addr.city} onChange={(e) => onAddressChange(i, "city", e.target.value)} required />
              <Input name={`addr-state-${i}`} placeholder="UF" value={addr.state} onChange={(e) => onAddressChange(i, "state", e.target.value.toUpperCase())} maxLength={2} required />
            </div>
          </div>
        ))}
        <Button style="btn-light" type="button" onClick={onAddAddress}>Adicionar endereço</Button>
      </div>

      {/* Telefones */}
      <div className="space-y-6">
        {phones.map((phone, i) => (
          <div key={`phone-${i}`} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Telefone {i + 1}</p>
              {phones.length > 1 && (
                <button type="button" className="text-sm text-red-600" onClick={() => onRemovePhone(i)}>remover</button>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <Select
                name={`phone-type-${i}`}
                value={phone.type ?? "Recipient"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onPhoneChange(i, "type", e.target.value as any)}
                options={[{ value: "Recipient", name: "Principal" }, { value: "Partner", name: "Sócio" }]}
              />
              <Input name={`phone-ddd-${i}`} placeholder="DDD" value={phone.area_code} onChange={(e) => onPhoneChange(i, "area_code", e.target.value)} required />
              <Input name={`phone-num-${i}`} placeholder="Número" value={phone.number} onChange={(e) => onPhoneChange(i, "number", e.target.value)} required />
            </div>
          </div>
        ))}
        <Button style="btn-light" type="button" onClick={onAddPhone}>Adicionar telefone</Button>
      </div>
    </div>
  );
}
