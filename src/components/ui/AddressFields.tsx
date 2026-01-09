import { Input, Label } from "@/src/components/ui/form";

// Máscara de CEP
const maskCEP = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => (p2 ? `${p1}-${p2}` : p1));

export interface AddressData {
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  referencePoint?: string;
}

interface AddressFieldsProps {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
  showReferencePoint?: boolean;
}

export function AddressFields({ data, onChange, showReferencePoint = true }: AddressFieldsProps) {
  return (
    <>
      <div className="form-group">
        <Label>Rua</Label>
        <Input
          value={data.street || ""}
          onChange={(e: any) => onChange("street", e.target.value)}
          placeholder="Ex.: Av. Brasil"
        />
      </div>

      <div className="form-group grid grid-cols-2 gap-4">
        <div>
          <Label>Número</Label>
          <Input
            value={data.number || ""}
            onChange={(e: any) => onChange("number", e.target.value)}
            placeholder="Ex.: 123"
          />
        </div>
        <div>
          <Label>Bairro</Label>
          <Input
            value={data.neighborhood || ""}
            onChange={(e: any) => onChange("neighborhood", e.target.value)}
            placeholder="Ex.: Centro"
          />
        </div>
      </div>

      <div className="form-group">
        <Label>Complemento</Label>
        <Input
          value={data.complement || ""}
          onChange={(e: any) => onChange("complement", e.target.value)}
          placeholder="Apto, bloco, sala…"
        />
      </div>

      <div className="form-group grid grid-cols-2 gap-4">
        <div>
          <Label>Cidade</Label>
          <Input
            value={data.city || ""}
            onChange={(e: any) => onChange("city", e.target.value)}
            placeholder="Cidade"
          />
        </div>
        <div>
          <Label>Estado</Label>
          <Input
            value={data.state || ""}
            onChange={(e: any) => onChange("state", e.target.value)}
            placeholder="UF"
            maxLength={2}
          />
        </div>
      </div>

      <div className={`form-group grid gap-4 ${showReferencePoint ? "grid-cols-2" : ""}`}>
        <div>
          <Label>CEP</Label>
          <Input
            inputMode="numeric"
            pattern="\d{5}-\d{3}"
            maxLength={9}
            placeholder="00000-000"
            value={data.zipcode || ""}
            onChange={(e: any) => onChange("zipcode", maskCEP(e.target.value))}
          />
        </div>
        {showReferencePoint && (
          <div>
            <Label>Ponto de referência</Label>
            <Input
              value={data.referencePoint || ""}
              onChange={(e: any) => onChange("referencePoint", e.target.value)}
              placeholder="Perto de…"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default AddressFields;
