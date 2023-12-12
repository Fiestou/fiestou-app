import Style from "./bootstrapIcons";

interface BootstrapIconsType {
  icon: string;
  type?: string;
  className?: string;
}

export default function BIcon(icon: BootstrapIconsType) {
  return (
    <i className={`bi ${icon.icon} ${icon.type ?? ""} ${icon.className ?? ""}`}>
      <style jsx>{`
        .${icon.icon}:before {
          content: "${Style(icon.icon)}";
        }
      `}</style>
    </i>
  );
}
