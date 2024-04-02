import Icon from "@/src/icons/fontAwesome/FIcon";

export default function FDobleIcon({
  icon,
  size,
}: {
  icon: string;
  size?: string;
}) {
  const text: any = {
    base: ["text-6xl", "text-5xl"],
    sm: ["text-5xl", "text-4xl"],
  };

  return (
    <div className="p-8 text-yellow-400 relative">
      <Icon
        icon={icon ?? "fa-hand-point-up"}
        className={`${
          text[size ?? "base"][0]
        } absolute top-1/2 left-0 -translate-y-1/2`}
      />
      <Icon
        icon={icon ?? "fa-hand-point-up"}
        type="fa"
        className={`${
          text[size ?? "base"][1]
        } mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2`}
      />
    </div>
  );
}
