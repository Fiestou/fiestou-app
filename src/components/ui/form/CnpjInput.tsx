import React from "react";
import { Input } from "@/src/components/ui/form"; // ou input do seu projeto
import { formatCNPJ, justNumber } from "@/src/helper/cnpj";

type CnpjInputProps = {
  value: string; // valor sem máscara (apenas dígitos) — p.ex.: "12345678000195"
  onChange: (raw: string) => void; // recebe valor sem máscara
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function CnpjInput({
  value,
  onChange,
  name = "cnpj",
  id = "cnpj",
  placeholder = "CNPJ",
  className,
  disabled = false,
}: CnpjInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = justNumber(e.target.value);
    onChange(raw);
  };

  return (
    <Input
      name={name}
      id={id}
      placeholder={placeholder}
      value={formatCNPJ(value ?? "")}
      onChange={handleChange}
      maxLength={18} // máscara ocupa até 18 caracteres
      className={className}
      disabled={disabled}
    />
  );
}
