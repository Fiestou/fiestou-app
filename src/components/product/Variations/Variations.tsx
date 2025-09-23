import { useForm, Controller } from "react-hook-form";

type VariationValue = {
  id: string;
  name: string;
  priceDelta?: number;
};

type VariationGroup = {
  id: string;
  name: string;
  values: VariationValue[];
};

type VariationsProps = {
  groups: VariationGroup[];
  onChange: (values: Record<string, string>) => void;
  formatCurrency?: (value: number) => string;
};

export default function Variations({
  groups,
  onChange,
  formatCurrency = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
}: VariationsProps) {
  const { control, watch } = useForm({
    defaultValues: groups.reduce(
      (acc, g) => ({ ...acc, [g.id]: "" }),
      {} as Record<string, string>
    ),
  });

  const values = watch();

  // Chama o onChange sempre que houver mudança
  React.useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.id}>
          <h4 className="font-medium">{g.name}</h4>
          <div className="flex gap-2 mt-2">
            {g.values.map((v) => (
              <Controller
                key={v.id}
                name={g.id}
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(v.id)}
                    className={`px-3 py-1 rounded ${
                      field.value === v.id ? "ring" : "border"
                    }`}
                  >
                    {v.name}{" "}
                    {v.priceDelta
                      ? `+ ${formatCurrency(v.priceDelta)}`
                      : ""}
                  </button>
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
import React from "react";