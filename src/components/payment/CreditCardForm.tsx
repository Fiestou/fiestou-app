import { justNumber, documentIsValid, getBrazilianStates } from "@/src/helper";
import { CardType } from "@/src/models/order";
import { AddressType } from "@/src/models/address";

interface CreditCardFormProps {
  card: CardType;
  address: AddressType;
  useOrderAddress: boolean;
  errorZipCode: boolean;
  installments: number;
  maxInstallments?: number;
  handleCard: (value: Partial<CardType>) => void;
  handleAddress: (value: Partial<AddressType>) => void;
  handleZipCode: () => void;
  setInstallments: (value: number) => void;
  setUseOrderAddress: (value: boolean) => void;
}

export default function CreditCardForm({
  card,
  address,
  useOrderAddress,
  errorZipCode,
  installments,
  maxInstallments = 5,
  handleCard,
  handleAddress,
  handleZipCode,
  setInstallments,
  setUseOrderAddress,
}: CreditCardFormProps) {
  return (
    <div className="px-3 md:px-4 pb-3 md:pb-4 grid gap-4">
      <div className="bg-zinc-100 mb-2 py-2 px-3 text-xs rounded-md">
        * Os dados de pagamento não ficam salvos em nossa base de dados
      </div>

      {/* Titular + Documento */}
      <div className="grid grid-cols-2 items-start gap-4">
        <div className="form-group">
          <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
            Titular
          </label>
          <input
            type="text"
            onChange={(e) => handleCard({ holder_name: e.target.value })}
            value={card?.holder_name ?? ""}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
            CPF/CNPJ
          </label>
          <input
            type="tel"
            onChange={(e) =>
              handleCard({ holder_document: justNumber(e.target.value).toString() })
            }
            value={card?.holder_document ?? ""}
            required
            className="form-control"
          />
          {(card?.holder_document ?? "").length > 8 &&
            !documentIsValid(card?.holder_document) && (
              <div className="text-[0.7rem] opacity-65">
                * Insira um documento válido
              </div>
            )}
        </div>
      </div>

      {/* Endereço de faturamento (opcional) */}
      {!useOrderAddress && (
        <BillingAddressForm
          address={address}
          errorZipCode={errorZipCode}
          handleAddress={handleAddress}
          handleZipCode={handleZipCode}
        />
      )}

      <div className="flex gap-1 text-xs mt-2">
        <input
          type="checkbox"
          onChange={(e) => setUseOrderAddress(e.target.checked)}
          checked={useOrderAddress}
        />
        <span>Usar endereço de entrega para faturamento</span>
      </div>

      <div className="border-t mb-5 mt-4" />

      {/* Dados do cartão */}
      <div className="form-group">
        <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
          Número do Cartão
        </label>
        <input
          type="tel"
          onChange={(e) =>
            handleCard({ number: justNumber(e.target.value).toString() })
          }
          value={card?.number ?? ""}
          required
          className="form-control appearance-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="form-group">
          <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
            Validade
          </label>
          <div className="flex items-center px-1 border border-zinc-300 rounded-lg">
            <div className="w-[5rem]">
              <select
                required
                onChange={(e) => handleCard({ exp_month: justNumber(e.target.value) })}
                className="form-control px-2 border-0 text-sm appearance-none"
              >
                <option value="">Mês</option>
                {Array.from({ length: 12 }, (_, i) =>
                  (i + 1).toString().padStart(2, "0")
                ).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-fit px-1">/</div>
            <div className="w-full">
              <select
                required
                onChange={(e) => handleCard({ exp_year: justNumber(e.target.value) })}
                className="form-control px-2 border-0 text-sm appearance-none"
              >
                <option value="">Ano</option>
                {Array.from(
                  { length: 21 },
                  (_, index) => new Date().getFullYear() + index
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
            CVV/CVC
          </label>
          <input
            type="tel"
            onChange={(e) =>
              handleCard({ cvv: justNumber(e.target.value).toString() })
            }
            value={card?.cvv ?? ""}
            required
            className="form-control appearance-none"
          />
        </div>

        <div className="form-group">
          <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
            Parcelas
          </label>
          <select
            required
            className="form-control appearance-none"
            onChange={(e) =>
              setInstallments(parseInt(justNumber(e.target.value), 10) || 1)
            }
            value={installments}
          >
            {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((option) => (
              <option key={option} value={option}>
                {option}x
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function BillingAddressForm({
  address,
  errorZipCode,
  handleAddress,
  handleZipCode,
}: {
  address: AddressType;
  errorZipCode: boolean;
  handleAddress: (value: Partial<AddressType>) => void;
  handleZipCode: () => void;
}) {
  return (
    <div className="grid md:grid-cols-4 items-end gap-x-4 gap-y-3">
      <div className="form-group col-span-4">
        <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
          CEP
        </label>
        <input
          required
          value={address.zipCode ?? ""}
          className="form-control"
          onChange={(e) => handleAddress({ zipCode: e.target.value as any })}
          onBlur={handleZipCode}
        />
      </div>

      <div className="form-group col-span-3">
        <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
          Rua
        </label>
        <input
          required
          value={address.street ?? ""}
          className="form-control"
          onChange={(e) => handleAddress({ street: e.target.value })}
        />
      </div>

      <div className="form-group col-span-1">
        <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
          Número
        </label>
        <input
          required
          value={address.number ?? ""}
          className="form-control"
          onChange={(e) => handleAddress({ number: justNumber(e.target.value) as any })}
        />
      </div>

      {errorZipCode ? (
        <>
          <div className="form-group col-span-1">
            <label className="float">Estado</label>
            <select
              required
              value={address.state ?? ""}
              className="form-control"
              onChange={(e) => handleAddress({ state: e.target.value })}
            >
              <option value="">UF</option>
              {getBrazilianStates.map((uf: string) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-span-3">
            <label className="float">Cidade</label>
            <input
              required
              value={address.city ?? ""}
              className="form-control"
              onChange={(e) => handleAddress({ city: e.target.value })}
            />
          </div>
        </>
      ) : (
        <>
          {address?.zipCode && address?.city && (
            <div className="col-span-4 mt-2 text-xs text-center bg-gray-100 rounded-md py-2 text-gray-950">
              {address?.city}
              {address?.state && ` - ${address?.state}`}
              {address?.country && (
                <span className="font-bold">, {address?.country}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
