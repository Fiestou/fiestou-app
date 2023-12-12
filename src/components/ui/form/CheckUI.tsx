interface CheckType {
  name?: string;
  onChange?: Function;
  onClick?: Function;
  prevent?: boolean;
  className?: string;
  checked?: boolean;
  id?: string;
  defaultValue?: string | number;
  value?: string | number;
  text?: string;
  errorMessage?: string | boolean;
  focus?: any;
  required?: boolean;
  readonly?: boolean;
  children: React.ReactNode;
}

export default function Check(attr: CheckType) {
  return (
    <>
      <div
        onClick={(e) => {
          !!attr?.onClick ? attr?.onClick(e) : {};
        }}
        className={`checkcustom relative whitespace-nowrap text-center ${
          attr?.errorMessage ? "border-red-500 text-red-500" : "text-zinc-500"
        } ${!!attr?.readonly ? "opacity-50" : ""}`}
      >
        <div
          className={`${
            attr?.className ?? ""
          } cursor-pointer w-full h-full flex items-center gap-1 mb-0 py-2 px-3 text-sm md:text-[1rem] ease border rounded-md border-zinc-300 focus:border-zinc-800 hover:border-zinc-500 text-zinc-600 ${
            !!attr?.checked ? "border-zinc-800" : ""
          }`}
        >
          {attr?.children}
        </div>
      </div>
      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  );
}
