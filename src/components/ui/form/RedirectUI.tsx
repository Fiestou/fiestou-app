import { useEffect, useState } from "react";

interface RedirectType {
  name?: string;
  onChange?: Function;
  type?: string;
  className?: string;
  id?: string;
  value?: any;
  placeholder?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  readonly?: boolean;
}

export default function Redirect(attr: RedirectType) {
  const [redirect, setRedirect] = useState(
    (attr.value ?? {}) as {
      url?: string;
      label?: string;
      target?: boolean;
    }
  );

  const handleRedirect = (value: Object) => {
    !!attr?.onChange ? attr?.onChange({ ...attr.value, ...value }) : {};
  };

  useEffect(() => {
    setRedirect(attr.value);
  }, [attr]);

  return (
    <>
      <div className="border hover:border-zinc-400 focus-within:border-zinc-500 ease border-zinc-300 rounded-md grid">
        <div className="grid md:flex gap-2">
          <input
            name={`${attr?.name}_url`}
            id={`${attr?.id ?? attr?.name}_url`}
            type={attr?.type ?? "text"}
            className="form-control border-0 text-sm p-[.9rem] w-full"
            placeholder="Link. Ex: https://exemple.com.br"
            onChange={(e) => handleRedirect({ url: e.target.value })}
            defaultValue={redirect?.url}
          />
          <div className="border-l"></div>
          <input
            name={`${attr?.name}_url`}
            id={`${attr?.id ?? attr?.name}_url`}
            type={attr?.type ?? "text"}
            className="form-control border-0 text-center text-sm p-[.9rem] max-w-[14rem]"
            placeholder="Texto. Ex: Acessar agora!"
            onChange={(e) => handleRedirect({ label: e.target.value })}
            defaultValue={redirect?.label}
          />
        </div>
      </div>
      <label className="text-[.8rem]">
        <div
          onClick={() => handleRedirect({ target: !redirect.target })}
          className="flex items-center w-full gap-1 py-1"
        >
          <input
            name={`${attr?.name}_target`}
            id={`${attr?.id ?? attr?.name}_target`}
            type="checkbox"
            defaultChecked={redirect?.target}
            className="scale-[.9]"
          />
          <span className="">Abrir em nova aba?</span>
        </div>
      </label>
      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  );
}
