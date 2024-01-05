export default function Checkbox({
  type,
  checked,
}: {
  type?: string;
  checked: boolean;
}) {
  return (
    <label
      className={`block border ${
        type == "radio" ? "rounded-full" : "rounded"
      } ease p-1 group/item cursor-pointer`}
    >
      <div
        className={`${
          type == "radio" ? "rounded-full" : "rounded-[2px]"
        } ease p-[6px] ${
          checked && "bg-yellow-400"
        } group-hover/item:bg-zinc-200`}
      ></div>
    </label>
  );
}
