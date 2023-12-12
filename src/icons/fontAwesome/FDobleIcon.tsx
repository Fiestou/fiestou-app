import Icon from "@/src/icons/fontAwesome/FIcon";

export default function FDobleIcon({ icon }: { icon: string }) {
  return (
    <div className="p-8 text-yellow-400 relative">
      <Icon
        icon={icon ?? "fa-hand-point-up"}
        className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
      />
      <Icon
        icon={icon ?? "fa-hand-point-up"}
        type="fa"
        className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
      />
    </div>
  );
}
