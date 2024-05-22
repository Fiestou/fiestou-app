import { useEffect, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface QtdType {
  value: number;
  min?: number;
  max?: number;
  emitQtd: Function;
  className?: string;
}

export default function QtdInput(attr: QtdType) {
  const [quantity, setQuantity] = useState(0 as number);

  const onUp = () => {
    let value: number = (quantity ?? 0) + 1;

    if (!!attr?.max) value = value <= attr?.max ? value : quantity;

    setQuantity(value);
  };

  const onDown = () => {
    let value: number = (quantity ?? 0) - 1;
    value = value >= 0 ? value : 0;

    setQuantity(value);
  };

  const onChange = (value: number) => {
    let handle: number = value >= 0 ? value : 0;

    if (!!attr?.max) value = value <= attr?.max ? value : quantity;

    setQuantity(handle);
  };

  useEffect(() => {
    setQuantity(attr.value);
  }, [attr.value]);

  useEffect(() => {
    attr.emitQtd(quantity);
  }, [quantity]);

  return (
    <div className={`w-full border rounded ${attr?.className}`}>
      <div className="flex px-2 py-1">
        <button type="button" onClick={() => (quantity > 0 ? onDown() : {})}>
          <Icon icon="fa-minus" className="text-cyan-500" />
        </button>
        <div className="w-full grid">
          <input
            type="text"
            onChange={(e: any) => onChange(parseInt(e.target.value))}
            value={!!quantity ? quantity : 0}
            className="text-center w-full appearance-none"
          />
        </div>
        <button type="button" onClick={() => onUp()}>
          <Icon icon="fa-plus" className="text-cyan-500" />
        </button>
      </div>
    </div>
  );
}
