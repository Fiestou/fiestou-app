import { RecipientTypeEnum } from "@/src/models/Recipient";

interface Props {
  value: RecipientTypeEnum;
  onChange: (type: RecipientTypeEnum) => void;
}

export default function TypeStep({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">Escolha quem vai receber os valores da loja.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["PJ", "PF"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`border rounded-xl p-4 sm:p-5 text-left transition-colors ${
              value === type ? "border-red-500 bg-red-50" : "border-zinc-200 hover:border-zinc-400"
            }`}
          >
            <p className="text-base font-semibold sm:text-lg">
              {type === "PJ" ? "Empresa (CNPJ)" : "Pessoa física (CPF)"}
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              {type === "PJ" ? "Use o CNPJ da loja." : "Use o CPF do responsável."}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
