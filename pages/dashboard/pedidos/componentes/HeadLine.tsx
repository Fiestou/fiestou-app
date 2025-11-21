import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";

export const HeadLine = ({ orderId }: { orderId: number }) => (
  <div className="md:pb-6 md:border-b">
    <div className="pb-4">
      <Breadcrumbs
        links={[
          { url: "/dashboard", name: "Dashboard" },
          { url: "/dashboard/pedidos", name: "Pedidos" },
          {
            url: `/dashboard/pedidos/${orderId}`,
            name: "Pedido",
          },
        ]}
      />
    </div>
    <div className="flex items-center">
      <Link passHref href={`/dashboard/pedidos/${orderId}`}>
        <Icon
          icon="fa-long-arrow-left"
          className="mr-4 md:mr-6 text-2xl text-zinc-900"
        />
      </Link>
      <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900">
        Pagamento
      </div>
    </div>
  </div>
);