import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import PaginatedTable from "./components/PaginatedTable";
import { GetServerSideProps } from "next";

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

interface OrderPageProps {
  initialOrders: Order[];
  timestamp: number;
}

interface ApiResponse {
  data?: Order[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  const api = new Api();
  try {
    const request = await api.bridge({
      method: "post",
      url: "orders/list",
      data: { _nonce: Date.now() }
    }) as ApiResponse;

    return {
      props: {
        initialOrders: Array.isArray(request?.data) ? request.data : [],
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      props: {
        initialOrders: [],
        timestamp: Date.now(),
      },
    };
  }
};

export default function Order({ initialOrders, timestamp }: OrderPageProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const api = new Api();
      const response = await api.bridge({
        method: "post",
        url: "orders/list",
        data: { _nonce: Date.now() }
      }) as ApiResponse;

      if (response?.data && Array.isArray(response.data)) {
        setOrders(response.data);
        setLoading(false);
      } else {
        throw new Error("Formato de dados inválido");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Não foi possível carregar os pedidos. Por favor, tente novamente.");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(initialOrders);
      setLoading(false);
      setError(null);
    } else {
      fetchOrders();
    }
  }, [timestamp]);
  
  useEffect(() => {
    if (retryCount > 0) {
      fetchOrders();
    }
  }, [retryCount]);
  
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };
  
  const handleHardRefresh = () => {
    router.replace(`/admin/pedidos?t=${Date.now()}`);
  };

  const columns = [
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
      selector: (row: Order) => (
        moneyFormat(row.metadata?.amount_total || 0)
      )
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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Carregando pedidos...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center">
              <p>{error}</p>
              <div className="mt-4 flex justify-center gap-4">
                <button 
                  className="bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded"
                  onClick={handleRetry}
                >
                  <Icon icon="fa-redo" type="fas" className="mr-2" />
                  Tentar novamente
                </button>
                <button 
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded"
                  onClick={handleHardRefresh}
                >
                  <Icon icon="fa-sync-alt" type="fas" className="mr-2" />
                  Recarregar página
                </button>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <Icon icon="fa-inbox" type="far" className="text-4xl text-gray-400 mb-2" />
              <p className="text-gray-600">Nenhum pedido encontrado</p>
              <button 
                className="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded"
                onClick={handleRetry}
              >
                <Icon icon="fa-redo" type="fas" className="mr-2" />
                Verificar novamente
              </button>
            </div>
          ) : (
            <PaginatedTable 
              data={orders} 
              columns={columns} 
              itemsPerPage={6}
              key={`orders-table-${orders.length}-${timestamp}`}
            />
          )}
        </div>
      </section>
    </Template>
  );
} 