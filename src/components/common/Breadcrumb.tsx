import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";

export default function Breadcrumbs({ links }: { links: Array<any> }) {
  return (
    <div className="flex gap-2 text-sm opacity-70">
      {[{ url: "/", name: "Início" }, ...(links ?? [])].map((link, key) => (
        <div key={key} className="flex items-center">
          {!!key && (
            <div className="mr-2 text-[.5rem] leading-none">
              <Icon icon="fa-chevron-right" type="far" />
            </div>
          )}
          <Link href={link.url} className="hover:underline">
            {link.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
