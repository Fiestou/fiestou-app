interface LabelType {
  for?: string;
  style?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Label(attr: LabelType) {
  const style: any = {
    float: "absolute text-sm top-0 -mt-[.6rem] px-1 mx-1 bg-white z-[1]",
    block: "font-bold mb-0 md:mb-1 block text-sm md:text-base",
    light: "text-sm mb-1",
  };

  return (
    <label
      {...(!!attr?.for ? { for: attr?.for } : {})}
      className={`${style[attr?.style ?? "block"]} ${
        attr?.className ?? ""
      } text-zinc-900 whitespace-nowrap`}
    >
      {attr?.children}
    </label>
  );
}
