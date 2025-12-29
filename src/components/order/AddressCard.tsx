interface AddressCardProps {
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    country?: string;
    complement?: string;
  };
  title?: string;
}

export default function AddressCard({ address, title = "Endereço de entrega" }: AddressCardProps) {
  if (!address) return null;

  return (
    <div className="grid gap-2">
      <div className="text-zinc-900 font-bold">{title}</div>
      <div className="text-sm">
        {(address.street || address.number) && (
          <div>
            {address.street}{address.number ? `, ${address.number}` : ''}
          </div>
        )}
        {address.neighborhood && <div>{address.neighborhood}</div>}
        {address.zipCode && <div>CEP: {address.zipCode}</div>}
        {(address.city || address.state) && (
          <div>
            {address.city}{address.state ? ` | ${address.state}` : ''}{address.country ? ` - ${address.country}` : ''}
          </div>
        )}
        {address.complement && <div>complemento: {address.complement}</div>}
      </div>
    </div>
  );
}
