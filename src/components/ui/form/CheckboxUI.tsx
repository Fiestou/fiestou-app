export default function Checkbox({ type }: { type?: string }) {
  return (
    <label className={` ${type == "radio" ? "rounded-full" : "rounded"} ease`}>
      <div
        className={`${
          type == "radio" ? "rounded-full" : "rounded-[2px]"
        } ease p-[6px]`}
      ></div>
    </label>
  );
}
