import { clean } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useRouter } from "next/router";

interface ButtonType {
  name?: string;
  onClick?: Function;
  type?: string;
  className?: string;
  style?: string;
  id?: string;
  href?: string;
  target?: string;
  loading?: boolean | false;
  alt?: string;
  title?: string;
  between?: boolean;
  disable?: boolean;
  othersAttrs?: any;
  children: React.ReactNode;
}

export default function Button(attr: ButtonType) {
  const router = useRouter();

  let alt = !!attr?.alt ? attr?.alt : clean(String(attr?.children));
  let title = !!attr?.title ? attr?.title : clean(String(attr?.children));

  const style: any = {
    "btn-yellow": `btn bg-yellow-300 text-zinc-900 border border-transparent ${
      !attr?.disable ? "hover:bg-yellow-400" : "opacity-75"
    }`,
    "btn-success": `btn bg-green-500 text-white border border-transparent ${
      !attr?.disable ? "hover:bg-green-600" : "opacity-75"
    }`,
    "btn-white": `btn bg-white text-zinc-900 border border-transparent ${
      !attr?.disable ? "hover:bg-zinc-100" : "opacity-75"
    }`,
    "btn-light": `btn bg-zinc-100 text-zinc-900 border border-transparent ${
      !attr?.disable ? "hover:bg-zinc-200" : "opacity-75"
    }`,
    "btn-danger": `btn bg-red-500 text-white border border-transparent ${
      !attr?.disable ? "hover:bg-red-700" : "opacity-75"
    }`,
    "btn-dark": `btn bg-zinc-900 text-white border border-transparent ${
      !attr?.disable ? "hover:bg-zinc-800" : "opacity-75"
    }`,
    "btn-link": `text-zinc-900 underline font-bold p-0 border border-transparent`,
    "btn-transparent": `font-bold p-0 border border-transparent`,
    "btn-outline-light": `border text-zinc-900 ${
      !attr?.disable ? "hover:border-zinc-300 hover:bg-zinc-50" : "opacity-75"
    }`,
  };

  const renderChildren = () => (
    <>
      <span
        className={`${
          attr?.loading ? "opacity-0" : ""
        } h-full flex items-center w-100 ${
          attr?.between ? "justify-between" : "justify-center"
        } gap-2`}
      >
        {attr?.children}
      </span>
      {!attr?.href && attr?.loading && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2`}
        >
          <Icon icon="fa-spinner-third" className="animate-spin" />
        </div>
      )}
    </>
  );

  const attrs = {
    ...(!!attr?.id ? { id: attr?.id } : {}),
    ...(!!attr?.name ? { id: attr?.name } : {}),
    className: `btn ${style[attr?.style ?? "btn-yellow"]} ${
      attr?.className ?? ""
    }`,
    alt: alt ?? "",
    title: title ?? "",
    ...(!!alt || !!title ? { "aria-label": alt ?? title } : {}),
  };

  return !attr?.href ? (
    <button
      {...attrs}
      {...attr?.othersAttrs}
      type={`${
        !!attr?.loading || !!attr?.disable ? "button" : attr?.type ?? "submit"
      }`}
      onClick={(e) =>
        !attr?.disable && !!attr?.onClick ? attr?.onClick(e) : {}
      }
    >
      {renderChildren()}
    </button>
  ) : (
    <Link
      {...attrs}
      {...attr?.othersAttrs}
      href={!!attr?.href && !attr?.disable ? attr?.href : "#"}
      passHref
      target={!!attr?.target && !attr?.disable ? attr?.target : "_self"}
      onClick={(e) =>
        !attr?.disable && !!attr?.onClick ? attr?.onClick(e) : {}
      }
    >
      {renderChildren()}
    </Link>
  );
}
