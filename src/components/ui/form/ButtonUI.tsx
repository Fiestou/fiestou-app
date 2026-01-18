import { clean } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "dark"
  | "white"
  | "light"
  | "outlineLight"
  | "link"
  | "transparent";

interface ButtonType {
  name?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
  style?: string;
  id?: string;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  loading?: boolean;
  checked?: boolean;
  alt?: string;
  title?: string;
  between?: boolean;
  disable?: boolean;
  othersAttrs?: React.HTMLAttributes<HTMLElement>;
  children: React.ReactNode;
  variant?: Variant;
}

export default function Button(attr: ButtonType) {
  const router = useRouter();

  const alt = attr?.alt ?? clean(String(attr?.children ?? ""));
  const title = attr?.title ?? clean(String(attr?.children ?? ""));

  // mapeia Variant → sua classe antiga
  const variantToLegacyStyle: Record<Variant, string> = {
    primary: "btn-dark", // preto
    secondary: "btn-light", // cinza claro
    success: "btn-success",
    danger: "btn-danger",
    dark: "btn-dark",
    white: "btn-white",
    light: "btn-light",
    outlineLight: "btn-outline-light",
    link: "btn-link",
    transparent: "btn-transparent",
  };

  // classes originais com hover/desabilitado
  const styles: Record<string, string> = {
    "btn-yellow": `btn bg-yellow-300 text-zinc-900 border border-transparent ${
      !attr?.disable ? "hover:bg-yellow-400" : "opacity-75 cursor-not-allowed"
    }`,
    "btn-success": `btn bg-green-500 text-white border border-transparent ${
      !attr?.disable ? "hover:bg-green-600" : "opacity-75 cursor-not-allowed"
    }`,
    "btn-white": `btn bg-white text-zinc-900 border border-transparent ${
      !attr?.disable ? "hover:bg-zinc-100" : "opacity-75 cursor-not-allowed"
    }`,
    "btn-light": `btn bg-zinc-100 text-zinc-900 border border-transparent ${
      !attr?.disable ? "hover:bg-zinc-200" : "opacity-75 cursor-not-allowed"
    }`,
    "btn-danger": `btn bg-red-500 text-white border border-transparent ${
      !attr?.disable ? "hover:bg-red-700" : "opacity-75 cursor-not-allowed"
    }`,
    "btn-dark": `btn bg-zinc-900 text-white border border-transparent ${
      !attr?.disable ? "hover:bg-zinc-800" : "opacity-75 cursor-not-allowed"
    }`,
    "btn-link": `text-zinc-900 underline font-bold p-0 border border-transparent`,
    "btn-transparent": `font-bold p-0 border border-transparent`,
    "btn-outline-light": `border text-zinc-900 ${
      !attr?.disable
        ? "hover:border-zinc-300 hover:bg-zinc-50"
        : "opacity-75 cursor-not-allowed"
    }`,
  };

  // escolhe a classe final: variant > style > default
  const legacyKey =
    (attr?.variant && variantToLegacyStyle[attr.variant]) ||
    attr?.style ||
    "btn-yellow";

  const className = `btn ${styles[legacyKey]} ${attr?.className ?? ""}`;

  const renderChildren = () => (
    <>
      <span
        className={`${
          attr?.loading || attr?.checked ? "opacity-0" : ""
        } h-full flex items-center w-100 ${
          attr?.between ? "justify-between" : "justify-center"
        } gap-2`}
      >
        {attr?.children}
      </span>
      {attr?.checked ? (
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
          <Icon icon="fa-check-circle" type="fal" className="text-2xl" />
        </div>
      ) : (
        !attr?.href &&
        attr?.loading && (
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <Icon icon="fa-spinner-third" className="animate-spin" />
          </div>
        )
      )}
    </>
  );

  const commonAttrs = {
    id: attr?.id ?? attr?.name,
    className,
    alt: alt ?? "",
    title: title ?? "",
    "aria-label": alt || title ? alt ?? title : undefined,
    rel: attr?.rel,
    ...(attr?.othersAttrs || {}),
  };

  if (!attr?.href) {
    return (
      <button
        {...(commonAttrs as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        type={
          attr?.loading || attr?.checked || attr?.disable
            ? "button"
            : attr?.type ?? "submit"
        }
        onClick={(e) =>
          !attr?.disable && attr?.onClick ? attr.onClick(e) : undefined
        }
      >
        {renderChildren()}
      </button>
    );
  }

  // Next.js Link aceita className / onClick diretamente (Next 13+)
  return (
    <Link
      {...(commonAttrs as any)}
      href={!attr?.disable ? attr.href : "#"}
      target={!attr?.disable ? attr?.target ?? "_self" : "_self"}
      onClick={(e) =>
        !attr?.disable && attr?.onClick ? attr.onClick(e) : undefined
      }
    >
      {renderChildren()}
    </Link>
  );
}
