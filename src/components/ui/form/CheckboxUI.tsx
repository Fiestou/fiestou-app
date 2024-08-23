export default function Checkbox({
  type,
  checked,
}: {
  type?: string;
  checked: boolean;
}) {
  return (
    <label
      className={`block border border-zinc-300 ${
        type == "radio" ? "rounded-full" : "rounded"
      } ease p-1 group/item cursor-pointer hover:border-yellow-400`}
    >
      <div
        className={`${
          type == "radio" ? "rounded-full" : "rounded-[2px]"
        } ease p-[6px] ${checked && "bg-yellow-400"}`}
      ></div>
    </label>
  );
}
