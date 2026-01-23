interface OrderStatusBadgeProps {
  status: number | string;
  metadataStatus?: string;
  statusText?: string;
}

export default function OrderStatusBadge({ status, metadataStatus, statusText }: OrderStatusBadgeProps) {
  // Normaliza status para numero
  const numStatus = typeof status === 'string' ?
    (status === 'paid' ? 1 : status === 'expired' ? -2 : parseInt(status) || 0) :
    status;

  if (numStatus === -1) {
    return (
      <div className="bg-zinc-100 text-zinc-700 rounded text-sm inline-block px-2 py-1">
        {statusText || "processando"}
      </div>
    );
  }

  if (numStatus === 1) {
    return (
      <div className="bg-green-100 text-green-700 rounded text-sm inline-block px-2 py-1">
        {statusText || "pago"}
      </div>
    );
  }

  if (numStatus === -2 || metadataStatus === "expired") {
    return (
      <div className="bg-red-100 text-red-700 rounded text-sm inline-block px-2 py-1">
        {statusText || "cancelado"}
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 text-yellow-700 rounded text-sm inline-block px-2 py-1">
      {statusText || "em aberto"}
    </div>
  );
}
