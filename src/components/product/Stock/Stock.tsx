type StockProps = {
  sku?: string;
  availableQty: number;
  reservedQty?: number;
  onUpdate?: (qty: number) => Promise<void>;
};

export default function Stock({ sku, availableQty, onUpdate }: StockProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(availableQty);

  const save = async () => {
    try {
      if (onUpdate) {
        await onUpdate(value); // usa o callback da prop
      }
      setEditing(false);
    } catch (e) {
      /* tratar erro */
    }
  };

  return (
    <>
      <div>
        Em estoque: <strong>{availableQty}</strong>
      </div>

      {editing ? (
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="input"
          />
          <button onClick={save} className="btn">Salvar</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="btn-ghost mt-2">
          Ajustar estoque
        </button>
      )}
    </>
  );
}
import { useState } from 'react';