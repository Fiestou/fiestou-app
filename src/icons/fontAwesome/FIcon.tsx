import Style from "./fontAwesomeIcons";

interface FontAwesomeType {
  icon: string;
  type?: string;
  className?: string;
}

export default function FIcon(icon: FontAwesomeType) {
  return (
    <i className={`${icon.type ?? "fal"} ${icon.icon} ${icon.className ?? ""}`}>
      <style jsx>{`
        .${icon.icon}:before {
          content: "${Style(icon.icon)}";
        }
      `}</style>
    </i>
  );
}
