interface BadgeType {
  style?: string;
  size?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Badge(attr: BadgeType) {
  const style: any = {
    success: "bg-green-500 text-white",
    light: "bg-zinc-100 text-zinc-900",
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
      } ${attr?.className ?? ""} inline-block rounded-md px-2 py-1`}
    >
      {attr?.children}
    </div>
  );
}
