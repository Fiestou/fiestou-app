import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

interface StoreHeaderProps {
  title: string;
  breadcrumbs: { url: string; name: string }[];
}

export default function StoreHeader({ title, breadcrumbs }: StoreHeaderProps) {
  return (
    <section>
      <div className="container-medium pt-12">
        <div className="pb-4">
          <Breadcrumbs links={breadcrumbs} />
        </div>

        <div className="grid md:flex gap-4 items-center w-full">
          <div className="w-full flex items-center">
            <Link passHref href="/painel">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-6 text-2xl text-zinc-900"
              />
            </Link>

            <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              <span className="font-title font-bold">{title}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
