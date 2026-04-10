export type AddressKind = "home" | "school";

export interface AddressType {
  zipCode: string;
  street?: string;
  number: number | string;
  neighborhood?: string;
  complement?: string;
  city?: string;
  state?: string;
  country?: string;
  main?: boolean;
  addressKind?: AddressKind | string;
  locationName?: string;
  reference?: string;
}

export function getAddressKind(value?: any): AddressKind {
  const raw = String(
    value?.addressKind ??
      value?.address_kind ??
      value?.type ??
      value?.locationType ??
      ""
  )
    .trim()
    .toLowerCase();

  if (["school", "escola", "venue", "event", "local"].includes(raw)) {
    return "school";
  }

  return "home";
}

export function getAddressKindLabel(value?: any): string {
  return getAddressKind(value) === "school" ? "Locais de Evento" : "Casa";
}

export function getAddressKindIcon(value?: any): string {
  return getAddressKind(value) === "school" ? "fa-school" : "fa-home";
}

export function normalizeAddressShape(address?: any): AddressType {
  const safe = address && typeof address === "object" ? address : {};

  return {
    zipCode: String(safe?.zipCode ?? safe?.zip_code ?? "").trim(),
    street: String(safe?.street ?? safe?.line_1 ?? "").trim(),
    number: String(safe?.number ?? safe?.street_number ?? "").trim(),
    neighborhood: String(safe?.neighborhood ?? "").trim(),
    complement: String(safe?.complement ?? safe?.complementary ?? "").trim(),
    city: String(safe?.city ?? "").trim(),
    state: String(safe?.state ?? safe?.uf ?? "").trim().toUpperCase(),
    country: String(safe?.country ?? "Brasil").trim() || "Brasil",
    main: !!safe?.main,
    addressKind: getAddressKind(safe),
    locationName: String(
      safe?.locationName ?? safe?.location_name ?? safe?.place_name ?? ""
    ).trim(),
    reference: String(
      safe?.reference ?? safe?.reference_point ?? ""
    ).trim(),
  };
}

export function isSchoolAddress(value?: any): boolean {
  return getAddressKind(value) === "school";
}
