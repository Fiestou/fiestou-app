import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import PaginatedTable from "@/src/components/pages/paginated-table/PaginatedTable";

interface Order {
  id: number;
  created_at: string;
  user: string;
  metadata?: {
    amount_total: number;
  };
  status: string;
  partnerName: string;
  partnerEmail: string;
  userName: string;
  userEmail: string;
  storeId: number;
}

type ApiResponse = {
  data: Order[];
};

interface Column {
  name: string;
  width?: string;
  sortable?: boolean;
  sortKey?: string;
  selector: (row: Order) => React.ReactNode;
}

export default function Order({ initialOrders = [] }: { initialOrders?: Order[] }) {
  const api = new Api();
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const getOrders = async () => {
    try {
      const request = (await api.bridge({
        method: "post",
        url: "orders/list",
      })) as ApiResponse;

      if (request?.data) {
        setOrders(request.data);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos", error);
    }
  };

  useEffect(() => {
    if (initialOrders.length === 0) {
      getOrders();
    }
  }, [initialOrders]);

  const columns: Column[] = [
    {
      name: "Pedido",
      width: "10rem",
      sortable: true,
      sortKey: "id",
      selector: (row: Order) => '#' + row.id,
    },
    {
      name: "Parceiro",
      width: "40rem",
      sortable: true,
      sortKey: "partnerName",
      selector: (row: Order) => (
        <div className="user-info">
          <strong>{row.partnerName}</strong><br />
          {row.partnerEmail}
        </div>
      ),
    },
    {
      name: "Data",
      width: "30rem",
      sortable: true,
      sortKey: "created_at",
      selector: (row: Order) =>
        new Date(row.created_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      name: "Cliente",
      width: "50rem",
      sortable: true,
      sortKey: "user",
      selector: (row: Order) => (
        <div className="user-info">
          <strong>{row.userName}</strong><br />
          {row.userEmail}
        </div>
      ),
    },
    {
      name: "Total (R$)",
      width: "30rem",
      sortable: true,
      sortKey: "amount_total",
      selector: (row: Order) => moneyFormat(row.metadata?.amount_total || 0),
    },
    {
      name: "Status",
      width: "40rem",
      selector: (row: Order) => (
        <div
          className={`rounded-md text-center py-2 ${
            row.status === "paid" ? "bg-green-200" : "bg-yellow-200"
          }`}
        >
          {row.status === "paid" ? "Pago" : "Em Aberto"}
        </div>
      ),
    },
    {
      name: "Ações",
      width: "5rem",
      selector: (row: Order) => (
        <Link
          title="Detalhes"
          href={`/admin/pedidos/${row.id}`}
          className="rounded-md bg-zinc-100 hover:bg-blue-300 ease py-2 px-3"
        >
          <Icon icon="fa-eye" type="far" />
        </Link>
      ),
    },
  ];

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section>
        <div className="container-medium pt-12" style={{ maxWidth: "100rem" }}>
          <div className="flex">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/pedidos", name: "Pedidos" },
              ]}
            />
          </div>
          <div className="flex mt-10 items-center">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Pedidos
              </div>
            </div>
            <div className="flex gap-6 w-fit">
              <button
                type="button"
                className="rounded-xl border py-4 text-zinc-900 font-semibold px-8"
              >
                Filtrar <Icon icon="fa-chevron-down" type="far" className="text-xs ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6">
        <div className="container-medium pb-12" style={{ maxWidth: "100rem" }}>
          <PaginatedTable data={orders} columns={columns} itemsPerPage={6} />
        </div>
      </section>
    </Template>
  );
}

export async function getStaticProps() {
  const api = new Api();
  try {
    const request = (await api.bridge({
      method: "post",
      url: "orders/list",
    })) as ApiResponse;
    return {
      props: {
        initialOrders: request?.data || [],
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Erro ao buscar pedidos no getStaticProps", error);
    return {
      props: {
        initialOrders: [],
      },
      revalidate: 60,
    };
  }
}