import { getOrderStatusPresentation } from "@/src/services/order-status";

interface OrderStatusBadgeProps {
  status: number | string;
  metadataStatus?: string;
  paymentStatus?: string;
  paidAt?: string;
  statusText?: string;
}

export default function OrderStatusBadge({ status, metadataStatus, paymentStatus, paidAt, statusText }: OrderStatusBadgeProps) {
  const statusData = getOrderStatusPresentation({
    status,
    statusText,
    metadata: {
      status: metadataStatus,
      payment_status: paymentStatus,
      paid_at: paidAt,
    },
  });

  return (
    <div className={`${statusData.badgeClassName} rounded text-sm inline-block px-2 py-1`}>
      {statusData.label}
    </div>
  );
}
