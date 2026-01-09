import { ReactNode, useEffect, useState } from "react";

interface ButtonTextIconProps {
  icon?: ReactNode;
  title: string;
  /** Controlado externamente (opcional) */
  active?: boolean;
  /** Desabilita o botão */
  disabled?: boolean;
  /** Callback semântico: mudou o estado selecionado */
  onSelect?: (value: boolean) => void;
  /** Callback de clique “cru” (para compatibilidade com quem usa onClick) */
  onClick?: () => void;
}

/**
 * Comportamento:
 * - Se `active` for passado, o componente se comporta como CONTROLADO.
 * - Se `active` não for passado, ele é NÃO CONTROLADO (usa estado interno).
 */
export default function ButtonTextIcon({
  icon,
  title,
  disabled = false,
  onSelect,
  onClick,
  active,
}: ButtonTextIconProps) {
  const isControlled = typeof active === "boolean";

  // estado interno para modo não controlado
  const [innerActive, setInnerActive] = useState<boolean>(!!active);

  // sincroniza quando o prop `active` muda
  useEffect(() => {
    if (isControlled) setInnerActive(!!active);
  }, [active, isControlled]);

  const current = isControlled ? !!active : innerActive;

  const handleClick = () => {
    if (disabled) return;

    const next = !current;

    // dispara o clique "cru" (se o chamador quiser só saber do click)
    onClick?.();

    // no modo não controlado, atualiza o estado interno
    if (!isControlled) {
      setInnerActive(next);
    }

    // semântica de seleção/toggle
    onSelect?.(next);
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      type="button"
      data-selected={current}
      aria-pressed={current}
      className={`p-4 flex flex-col justify-center items-center shadow-lg rounded-lg gap-4 w-[246px] h-[148px] transition-colors duration-200
        ${current ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <p className="text-lg font-medium">{title}</p>
      {icon}
    </button>
  );
}
