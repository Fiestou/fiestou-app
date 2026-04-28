import { Button } from "@/src/components/ui/form";
import { getZipCode, justNumber } from "@/src/helper";
import {
  AddressKind,
  AddressType,
  getAddressKind,
  normalizeAddressShape,
} from "@/src/models/address";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useMemo, useState } from "react";
import { formatCep } from "../../utils/FormMasks";

type AddressCheckoutFormProps = {
  address?: AddressType;
  onChange: (address: Partial<AddressType>) => void;
  saveToProfile?: boolean;
  onChangeSaveToProfile?: (value: boolean) => void;
  kindSelectorMode?: "cards" | "summary";
  kindSummaryMessage?: string;
};

const ADDRESS_KIND_OPTIONS: Array<{
  value: AddressKind;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    value: "school",
    title: "Locais de Evento",
    description: "Escolas e locais de evento",
    icon: "fa-school",
  },
  {
    value: "home",
    title: "Casa",
    description: "Endereço residencial",
    icon: "fa-home",
  },
];

export default function AddressCheckoutForm(attrs: AddressCheckoutFormProps) {
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const address = useMemo(
    () => normalizeAddressShape(attrs.address),
    [attrs.address]
  );
  const addressKind = getAddressKind(address);
  const kindSelectorMode = attrs.kindSelectorMode ?? "cards";

  const handlePatch = (patch: Partial<AddressType>) => {
    attrs.onChange(patch);
  };

  const handleZipCodeLookup = async () => {
    const rawZipCode = justNumber(address.zipCode ?? "");

    if (rawZipCode.length !== 8) {
      return;
    }

    setLoadingZipCode(true);
    const location = await getZipCode(rawZipCode);
    setLoadingZipCode(false);

    if (!location?.erro) {
      handlePatch({
        zipCode: formatCep(rawZipCode),
        street: location.logradouro || "",
        neighborhood: location.bairro || "",
        city: location.localidade || "",
        state: location.uf || "",
        country: "Brasil",
        main: true,
      });
    }
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900">
          Entrega em escolas, salões, parques e outros locais de João Pessoa.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          Informe o CEP e a Fiestou preenche rua, bairro, cidade e UF automaticamente. Se a
          entrega for em escola ou evento, adicione o nome do local.
        </p>
      </div>

      {kindSelectorMode === "cards" ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Onde será a entrega?</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Escolha entre Locais de Evento e Casa antes de preencher o endereço.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {ADDRESS_KIND_OPTIONS.map((option) => {
              const selected = addressKind === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handlePatch({
                      addressKind: option.value,
                      locationName: option.value === "home" ? "" : address.locationName,
                    })
                  }
                  className={`rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                    selected
                      ? "border-yellow-400 bg-yellow-50 shadow-sm"
                      : "border-zinc-200 bg-zinc-50 hover:border-yellow-200 hover:bg-yellow-50/70"
                  }`}
                  aria-pressed={selected}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        selected
                          ? "border-yellow-200 bg-yellow-100 text-yellow-700"
                          : "border-yellow-100 bg-white text-yellow-600"
                      }`}
                    >
                      <Icon icon={option.icon} className="text-base" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900">{option.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700">
              <Icon
                icon={addressKind === "school" ? "fa-school" : "fa-home"}
                className="text-base"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900">
                Local selecionado: {addressKind === "school" ? "Locais de Evento" : "Casa"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {attrs.kindSummaryMessage ||
                  "Você pode trocar entre Locais de Evento e Casa no bloco de entrega abaixo."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <input
          name="cep"
          onChange={(event: any) =>
            handlePatch({ zipCode: formatCep(event.target.value) })
          }
          required
          value={formatCep(address.zipCode ?? "")}
          placeholder="CEP"
          className="form-control pr-[3rem]"
          onBlur={() => handleZipCodeLookup()}
        />
        <Button
          className="absolute right-0 top-1/2 mr-1 -translate-y-1/2 p-3"
          loading={loadingZipCode}
          disable={loadingZipCode}
          onClick={() =>
            justNumber(address.zipCode ?? "")
              ? handleZipCodeLookup()
              : alert("Por favor, informe o CEP antes de buscar!")
          }
        >
          <Icon icon="fa-search" />
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="w-full">
          <input
            name="rua"
            required
            value={address.street ?? ""}
            placeholder={addressKind === "school" ? "Rua ou avenida do local" : "Rua"}
            onChange={(event: any) => handlePatch({ street: event.target.value })}
            className="form-control"
          />
        </div>
        <div className="w-[10rem]">
          <input
            name="numero"
            required
            value={String(address.number ?? "")}
            placeholder="Número"
            onChange={(event: any) => handlePatch({ number: event.target.value })}
            className="form-control"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="w-full">
          <input
            name="bairro"
            required
            value={address.neighborhood ?? ""}
            placeholder="Bairro"
            onChange={(event: any) => handlePatch({ neighborhood: event.target.value })}
            className="form-control"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="w-full">
          <input
            name="cidade"
            required
            value={address.city ?? ""}
            placeholder="Cidade"
            onChange={(event: any) => handlePatch({ city: event.target.value })}
            className="form-control"
          />
        </div>
        <div className="w-[10rem]">
          <input
            name="estado"
            required
            value={address.state ?? ""}
            placeholder="UF"
            onChange={(event: any) =>
              handlePatch({ state: String(event.target.value ?? "").toUpperCase() })
            }
            className="form-control"
          />
        </div>
      </div>

      {addressKind === "school" && (
        <div className="w-full">
          <input
            name="locationName"
            required
            value={address.locationName ?? ""}
            placeholder="Nome do local. Ex: Escola ABC, Parque da Lagoa, Shopping XPTO..."
            onChange={(event: any) => handlePatch({ locationName: event.target.value })}
            className="form-control"
          />
        </div>
      )}

      <div className="w-full">
        <input
          name="complemento"
          required
          value={address.complement ?? ""}
          placeholder={
            addressKind === "school"
              ? "Complemento. Ex: bloco, recepção, portão, quadra, salão..."
              : "Complemento. Ex: Ap, Casa, Condomínio, etc..."
          }
          onChange={(event: any) => handlePatch({ complement: event.target.value })}
          className="form-control"
        />
      </div>

      {typeof attrs.onChangeSaveToProfile === "function" && (
        <label className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            className="mt-1"
            checked={!!attrs.saveToProfile}
            onChange={(event) => attrs.onChangeSaveToProfile?.(event.target.checked)}
          />
          <span>Salvar este endereço no meu painel de cliente para usar de novo depois.</span>
        </label>
      )}
    </div>
  );
}
