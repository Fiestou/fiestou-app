// Define o tipo Dimensions corretamente
type DimensionsValue = {
  weightKg?: number;
  widthCm?: number;
  heightCm?: number;
  lengthCm?: number;
};

// Tipagem das props do componente
type DimensionsProps = {
  value: DimensionsValue;
  onChange: (value: DimensionsValue) => void;
};

export default function Dimensions({ value, onChange }: DimensionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span>Peso (kg)</span>
        <input
          type="number"
          step="0.01"
          value={value.weightKg ?? ""}
          onChange={e =>
            onChange({ ...value, weightKg: Number(e.target.value) })
          }
          className="input"
        />
      </label>

      <label>
        <span>Largura (cm)</span>
        <input
          type="number"
          step="0.1"
          value={value.widthCm ?? ""}
          onChange={e =>
            onChange({ ...value, widthCm: Number(e.target.value) })
          }
          className="input"
        />
      </label>

      {/* Você pode continuar com altura e comprimento aqui */}
    </div>
  );
}
