interface OrderStatusBadgeProps {
  status: number;
  metadataStatus?: string;
}

export default function OrderStatusBadge({ status, metadataStatus }: OrderStatusBadgeProps) {
  if (status === -1) {
    return (
      <div className="bg-zinc-100 text-zinc-700 rounded text-sm inline-block px-2 py-1">
        processando
      </div>
    );
  }

  if (status === 1) {
    return (
      <div className="bg-green-100 text-green-700 rounded text-sm inline-block px-2 py-1">
        pago
      </div>
    );
  }

  if (status === -2 || metadataStatus === "expired") {
    return (
      <div className="bg-red-100 text-red-700 rounded text-sm inline-block px-2 py-1">
        cancelado
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 text-yellow-700 rounded text-sm inline-block px-2 py-1">
      em aberto
    </div>
  );
}
