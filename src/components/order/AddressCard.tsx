import { getAddressKindLabel, isSchoolAddress, normalizeAddressShape } from "@/src/models/address";

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
    addressKind?: string;
    locationName?: string;
  };
  title?: string;
}

export default function AddressCard({ address, title = "Endereço de entrega" }: AddressCardProps) {
  if (!address) return null;

  const normalizedAddress = normalizeAddressShape(address);

  return (
    <div className="grid gap-2">
      <div className="text-zinc-900 font-bold">{title}</div>
      <div className="text-sm">
        <div>
          {getAddressKindLabel(normalizedAddress)}
          {normalizedAddress.locationName ? ` | ${normalizedAddress.locationName}` : ""}
        </div>
        {(normalizedAddress.street || normalizedAddress.number) && (
          <div>
            {normalizedAddress.street}{normalizedAddress.number ? `, ${normalizedAddress.number}` : ''}
          </div>
        )}
        {normalizedAddress.neighborhood && <div>{normalizedAddress.neighborhood}</div>}
        {normalizedAddress.zipCode && <div>CEP: {normalizedAddress.zipCode}</div>}
        {(normalizedAddress.city || normalizedAddress.state) && (
          <div>
            {normalizedAddress.city}{normalizedAddress.state ? ` | ${normalizedAddress.state}` : ''}{normalizedAddress.country ? ` - ${normalizedAddress.country}` : ''}
          </div>
        )}
        {normalizedAddress.complement && <div>Complemento: {normalizedAddress.complement}</div>}
        {isSchoolAddress(normalizedAddress) && !normalizedAddress.locationName && (
          <div>Nome do local não informado</div>
        )}
      </div>
    </div>
  );
}
