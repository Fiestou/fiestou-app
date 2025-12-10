import { Input } from "../../ui/form";

export default function StoreLocationForm({
  editing,
  zipCode,
  street,
  number,
  neighborhood,
  complement,
  city,
  state,
  country,
  actions,
  onSubmit,
  onChangeZipCode,
  onChangeField,
  store,
}: {
  editing: boolean;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  city: string;
  state: string;
  country: string;
  store?: any;

  actions: React.ReactNode;
  onSubmit: (e: any) => void;
  onChangeZipCode: (value: string) => void;
  onChangeField: (field: string, value: string) => void;
}) {
  // Máscara para o CEP -> #####-###
  const maskZipCode = (value: string) => {
    return value
      .replace(/\D/g, "") // remove tudo que não for número
      .replace(/^(\d{5})(\d)/, "$1-$2") // coloca o traço após 5 dígitos
      .slice(0, 9); // limita em 9 caracteres
  };

  const handleZipCode = (value: string) => {
    const masked = maskZipCode(value);
    const numeric = masked.replace(/\D/g, "");

    // Atualiza o valor visível com máscara
    onChangeZipCode(masked);

    // Se completou 8 dígitos, dispara consulta no pai (numeric)
    if (numeric.length === 8) {
      onChangeZipCode(numeric);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      {/* Título + Ações */}
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Localização
          </h4>
        </div>
        <div className="w-fit">{actions}</div>
      </div>

      {/* Conteúdo */}
      <div className="w-full">
        {editing ? (
          <div className="grid gap-2">
            {/* CEP */}
            <Input
              name="cep"
              onChange={(e: any) => handleZipCode(e.target.value)}
              required
              value={zipCode} // já vem mascarado do pai
              placeholder="CEP"
            />

            {/* Rua + Número */}
            <div className="flex gap-2">
              <Input
                name="rua"
                readOnly
                required
                value={street}
                placeholder="Rua"
                className="w-full"
              />
              <Input
                name="numero"
                onChange={(e: any) => onChangeField("number", e.target.value)}
                required
                value={number}
                placeholder="Número"
                className="w-[10rem]"
              />
            </div>

            {/* Bairro + Complemento */}
            <div className="flex gap-2">
              <Input
                name="bairro"
                readOnly
                required
                value={neighborhood}
                placeholder="Bairro"
                className="w-full"
              />
              <Input
                name="complemento"
                onChange={(e: any) =>
                  onChangeField("complement", e.target.value)
                }
                value={complement}
                placeholder="Complemento"
                className="w-full"
              />
            </div>

            {/* Cidade + Estado */}
            <div className="flex gap-2">
              <Input
                name="cidade"
                readOnly
                required
                value={city}
                placeholder="Cidade"
                className="w-full"
              />
              <Input
                name="estado"
                readOnly
                required
                value={state}
                placeholder="UF"
                className="w-[10rem]"
              />
            </div>
          </div>
        ) : zipCode ? (
          <>
            <div>
              {street}, {number}
            </div>
            <div>
              {neighborhood} - {city} | {state}
            </div>
            <div>
              CEP: {zipCode} | {country}
            </div>
          </>
        ) : (
          "Informe a localização da sua loja"
        )}
      </div>
    </form>
  );
}
