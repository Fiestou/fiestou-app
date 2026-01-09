import { RecipientTypeEnum } from "@/src/models/Recipient";

interface Props {
  value: RecipientTypeEnum;
  onChange: (type: RecipientTypeEnum) => void;
}

export default function TypeStep({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-zinc-600">Escolha se irá cadastrar como PJ ou PF.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["PJ", "PF"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`border rounded-lg p-5 text-left transition-colors ${
              value === type ? "border-red-500 bg-red-50" : "border-zinc-200 hover:border-zinc-400"
            }`}
          >
            <p className="text-lg font-semibold">
              {type === "PJ" ? "Vender como empresa" : "Vender como pessoa física"}
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              {type === "PJ" ? "CNPJ com emissão de notas, permite sócios." : "Para autônomos e MEIs com CPF."}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
