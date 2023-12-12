import Icon from "@/src/icons/fontAwesome/FIcon";

export default function ButtonLoader() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
      <Icon icon="fa-spinner-third" className="animate-spin" />
    </div>
  );
}
