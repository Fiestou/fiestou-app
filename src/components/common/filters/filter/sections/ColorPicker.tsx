import Colors from "../../../../ui/form/ColorsUI";
import { Label } from "../../../../ui/form";

export default function ColorPicker({
  value, onChange,
}: { value: string[]; onChange: (v: string[]) => void; }) {
  return (
    <div className="pb-6">
      <Label>Cores</Label>
      <div className="flex gap-1 pt-1 pb-2">
        <Colors name="cores" value={value} onChange={onChange} />
      </div>
    </div>
  );
}
