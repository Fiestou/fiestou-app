interface BadgeType {
  style?: string;
  size?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Badge(attr: BadgeType) {
  const style: any = {
    success: "bg-zinc-300 text-black ",
    light: "text-zinc-900",
  };

  const size: any = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div
      className={`${style[attr?.style ?? "success"]} ${
        size[attr?.size ?? "sm"]
      } ${attr?.className ?? ""} inline-block rounded-md py-1`}
    >
      {attr?.children}
    </div>
  );
}
