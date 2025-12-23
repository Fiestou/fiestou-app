// src/components/checkout/PaymentPanel.tsx
import { Button } from "@/src/components/ui/form";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import {
  CopyClipboard,
  dateBRFormat,
  documentIsValid,
  getBrazilianStates,
  justNumber,
  moneyFormat,
} from "@/src/helper";
import { CardType, OrderType, PaymentType, PixType } from "@/src/models/order";
import { UserType } from "@/src/models/user";
import { AddressType } from "@/src/models/address";
import { useEffect } from "react";

interface FormInitialType {
  sended: boolean;
  loading: boolean;
  feedback: string;
}

interface PaymentPanelProps {
  order: OrderType;
  productsCount: number;
  deliveryPrice?: number;
  form: FormInitialType;
  handleForm: (value: Partial<FormInitialType>) => void;
  pix: PixType;
  boleto: any;
  expire: string;
  user: UserType;
  card: CardType;
  payment: PaymentType;
  installments: number;
  address: AddressType;
  useOrderAddress: boolean;
  errorZipCode: boolean;
  handleCard: (value: Partial<CardType>) => void;
  handlePayment: (value: Partial<PaymentType>) => void;
  handleCustomer: (value: Partial<UserType>) => void;
  handleAddress: (value: Partial<AddressType>) => void;
  handleZipCode: () => void;
  setInstallments: (value: number) => void;
  setUseOrderAddress: (value: boolean) => void;
}

export const PaymentPanel = ({
  order,
  productsCount,
  deliveryPrice,
  form,
  handleForm,
  pix,
  boleto,
  expire,
  user,
  card,
  payment,
  installments,
  address,
  useOrderAddress,
  errorZipCode,
  handleCard,
  handlePayment,
  handleCustomer,
  handleAddress,
  handleZipCode,
  setInstallments,
  setUseOrderAddress,
}: PaymentPanelProps) => {
  const hasPixOrBoleto = pix.status || boleto?.status;

  useEffect(() => {
   console.log('PaymentPanel - Recalculo do total do pedido', { productsCount, order, deliveryPrice });
  }, [productsCount,order,deliveryPrice]);

  return (
    <div className="rounded-2xl bg-zinc-100 p-4 md:p-8 relative">
      <div className="hidden md:block font-title font-bold text-zinc-900 text-xl mb-4">
        Resumo
      </div>

      <PaymentSummaryCard
        productsCount={productsCount}
        order={order}
        deliveryPrice={deliveryPrice}
      />

      <FeedbackAlert
        visible={!form.sended && !!form.feedback}
        message={form.feedback}
        onClose={() => handleForm({ feedback: "" })}
      />

      <PixBoletoCard pix={pix} boleto={boleto} expire={expire} />

      {!hasPixOrBoleto && (
        <>
          <PaymentMethodOptions
            user={user}
            card={card}
            payment={payment}
            installments={installments}
            address={address}
            useOrderAddress={useOrderAddress}
            errorZipCode={errorZipCode}
            handleCard={handleCard}
            handlePayment={handlePayment}
            handleCustomer={handleCustomer}
            handleAddress={handleAddress}
            handleZipCode={handleZipCode}
            setInstallments={setInstallments}
            setUseOrderAddress={setUseOrderAddress}
          />

          <div className="grid mt-4">
            <Button
              loading={form.loading}
              checked={form.sended || pix.status}
              style="btn-success"
              className="py-6 px-3"
            >
              Confirmar e pagar
            </Button>
          </div>
        </>
      )}

      {form.loading && (
        <div className="absolute inset-0 w-full h-full bg-white opacity-50 cursor-wait" />
      )}

      <div className="mt-4 border-t pt-4 flex justify-center">
        <Img
          src="/images/pagarme/selo-flags.png"
          className="w-full max-w-[16rem]"
        />
      </div>
    </div>
  );
};

const PaymentSummaryCard = ({
  productsCount,
  order,
  deliveryPrice,
}: {
  productsCount: number;
  order: OrderType;
  deliveryPrice?: number;
}) => {
  // Calcula o subtotal: total do pedido - valor do frete
  const freightValue = order.delivery?.price ?? deliveryPrice ?? 0;
  const subtotal = (order.total || 0) - freightValue;

  return (
    <div className="grid text-sm gap-2 mb-2 py-2">
      <div className="flex gap-2">
        <div className="w-full">
          Subtotal ({productsCount} {productsCount === 1 ? "item" : "itens"})
        </div>
        <div className="whitespace-nowrap">
          R$ {moneyFormat(subtotal)}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-full">Entrega</div>
        <div className="whitespace-nowrap">
          {!!freightValue
            ? `R$ ${moneyFormat(freightValue)}`
            : "Gratuita"}
        </div>
      </div>
      <div className="border-t"></div>
      <div className="flex gap-2">
        <div className="w-full text-zinc-900 font-bold">Total</div>
        <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
          R$ {moneyFormat(order.total)}
        </div>
      </div>
    </div>
  );
};

const FeedbackAlert = ({
  visible,
  message,
  onClose,
}: {
  visible: boolean;
  message?: string;
  onClose: () => void;
}) =>
  !visible ? null : (
    <div className="p-4 bg-red-500 text-white rounded-xl mb-4 flex justify-between gap-4">
      <span className="leading-tight text-sm">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-600"
      >
        <Icon icon="fa-times" />
      </button>
    </div>
  );

const PixBoletoCard = ({
  pix,
  boleto,
  expire,
}: {
  pix: PixType;
  boleto: any;
  expire: string;
}) => {
  if (boleto?.status) {
    return (
      <div className="bg-white rounded-xl p-4 text-center mb-4">
        <div className="mb-4">
          <div className="text-sm">Vencimento para:</div>
          <div className="text-xl text-zinc-900 font-bold">
            {dateBRFormat(boleto?.due_at)}
          </div>
        </div>
        <div className="w-full max-w-[16rem] mx-auto grid gap-2">
          <div>Disponível para download</div>
          <div>
            <a
              rel="noreferrer"
              href={boleto?.pdf}
              target="_blank"
              className="font-semibold inline-block mx-auto py-2 px-4 border rounded-md hover:underline border-cyan-600 text-cyan-600 hover:border-cyan-800 hover:text-cyan-800 ease"
            >
              Baixar boleto
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (pix?.status) {
    return (
      <div className="bg-white rounded-xl p-4 mb-4">
        <div className="text-center mb-4">
          <div className="text-sm">Expira em:</div>
          <div className="text-3xl text-zinc-900 font-bold">{expire}</div>
        </div>
        <div className="w-full max-w-[16rem] mx-auto">
          {!!pix.qrcode ? (
            <img src={pix.qrcode} className="w-full" />
          ) : (
            <div className="aspect-square border rounded" />
          )}
        </div>
        <div className="px-3 pt-6">
          <div className="px-4 py-3 bg-zinc-100 rounded">
            <div className="text-sm line-clamp-3 break-all">{pix.code}</div>
          </div>
          <div className="text-center">
            <input
              type="text"
              id="pix-code"
              value={pix.code ?? ""}
              readOnly
              className="absolute h-0 w-0 opacity-0 overflow-hidden"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  if (pix?.code) {
                    navigator.clipboard.writeText(String(pix.code));
                    return;
                  }
                } catch (e) {
                  // fallthrough to helper
                }

                CopyClipboard("pix-code");
              }}
              className="font-semibold pt-3 pb-2 text-cyan-600"
            >
              <Icon icon="fa-copy" className="mr-2" />
              COPIAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

interface PaymentMethodOptionsProps {
  user: UserType;
  card: CardType;
  payment: PaymentType;
  installments: number;
  address: AddressType;
  useOrderAddress: boolean;
  errorZipCode: boolean;
  handleCard: (value: Partial<CardType>) => void;
  handlePayment: (value: Partial<PaymentType>) => void;
  handleCustomer: (value: Partial<UserType>) => void;
  handleAddress: (value: Partial<AddressType>) => void;
  handleZipCode: () => void;
  setInstallments: (value: number) => void;
  setUseOrderAddress: (value: boolean) => void;
}

const PaymentMethodOptions = ({
  user,
  card,
  payment,
  installments,
  address,
  useOrderAddress,
  errorZipCode,
  handleCard,
  handlePayment,
  handleCustomer,
  handleAddress,
  handleZipCode,
  setInstallments,
  setUseOrderAddress,
}: PaymentMethodOptionsProps) => (
  <div className="bg-white rounded-xl grid">
    {!user?.phone && (
      <div className="p-3 md:p-4 grid gap-4 border-b">
        <div className="form-group mt-1">
          <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
            Celular para contato
          </label>
          <input
            type="text"
            onChange={(e: any) =>
              handleCustomer({
                phone: justNumber(e.target.value).toString(),
              })
            }
            value={user?.phone ?? ""}
            required
            className="form-control"
          />
        </div>
      </div>
    )}

    <div>
      <MethodOptionHeader
        label="CARTÃO DE CRÉDITO"
        icon="/images/pagarme/card-icon.png"
        selected={payment.payment_method === "credit_card"}
        onClick={() => handlePayment({ payment_method: "credit_card" })}
      />
      {payment.payment_method === "credit_card" && (
        <CardPaymentForm
          card={card}
          address={address}
          useOrderAddress={useOrderAddress}
          errorZipCode={errorZipCode}
          installments={installments}
          handleCard={handleCard}
          handleAddress={handleAddress}
          handleZipCode={handleZipCode}
          setInstallments={setInstallments}
          setUseOrderAddress={setUseOrderAddress}
        />
      )}
    </div>

    <div className="border-t">
      <MethodOptionHeader
        label="BOLETO"
        icon="/images/pagarme/document-icon.png"
        selected={payment.payment_method === "boleto"}
        onClick={() => handlePayment({ payment_method: "boleto" })}
      />
      {payment.payment_method === "boleto" && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 grid gap-4">
          <div className="bg-zinc-100 py-2 px-3 text-xs rounded-md">
            * Ao confirmar, será gerado um boleto para pagamento.
          </div>
        </div>
      )}
    </div>

    <div className="border-t">
      <MethodOptionHeader
        label="PIX"
        icon="/images/pagarme/pix-icon.png"
        selected={payment.payment_method === "pix"}
        onClick={() => handlePayment({ payment_method: "pix" })}
      />
      {payment.payment_method === "pix" && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 grid gap-4">
          {((user?.document ?? "").toString().length < 12) && (
            <div className="form-group mt-1">
              <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
                CPF/CNPJ
              </label>
              <input
                type="tel"
                onChange={(e: any) =>
                  handleCustomer({
                    cpf: justNumber(e.target.value).toString(),
                    document: justNumber(e.target.value).toString(),
                  })
                }
                placeholder="Digite seu CPF ou CNPJ..."
                value={user?.document ?? ""}
                required
                className="form-control placeholder:italic"
              />
              {(user?.document ?? "").length > 10 &&
                !documentIsValid(user?.document) && (
                  <div className="text-[0.75rem] opacity-50">
                    * Insira um documento válido
                  </div>
                )}
            </div>
          )}

          <div className="bg-zinc-100 py-2 px-3 text-xs rounded-md">
            * Ao confirmar, será gerado um código para pagamento via pix.
            Utilize o QRcode ou o código {"“copiar e colar”"} para efetuar o
            pagamento no aplicativo do seu banco.
          </div>
        </div>
      )}
    </div>
  </div>
);

const MethodOptionHeader = ({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="p-3 md:p-4 cursor-pointer flex gap-2 items-center"
  >
    <div
      className={`border ${
        selected ? "border-zinc-400" : "border-zinc-300"
      } w-[1rem] rounded-full h-[1rem] relative`}
    >
      {selected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[.5rem] h-[.5rem] bg-yellow-400 rounded-full" />
      )}
    </div>
    <div className="leading-tight text-zinc-900 font-semibold flex items-center gap-1">
      <Img src={icon} className="w-[1.75rem]" />
      <div className="w-full">{label}</div>
    </div>
  </div>
);

interface CardPaymentFormProps {
  card: CardType;
  address: AddressType;
  useOrderAddress: boolean;
  errorZipCode: boolean;
  installments: number;
  handleCard: (value: Partial<CardType>) => void;
  handleAddress: (value: Partial<AddressType>) => void;
  handleZipCode: () => void;
  setInstallments: (value: number) => void;
  setUseOrderAddress: (value: boolean) => void;
}

const CardPaymentForm = ({
  card,
  address,
  useOrderAddress,
  errorZipCode,
  installments,
  handleCard,
  handleAddress,
  handleZipCode,
  setInstallments,
  setUseOrderAddress,
}: CardPaymentFormProps) => (
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
          onChange={(e: any) =>
            handleCard({
              holder_name: e.target.value,
            })
          }
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
          onChange={(e: any) =>
            handleCard({
              holder_document: justNumber(e.target.value).toString(),
            })
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
      <div className="grid md:grid-cols-4 items-end gap-x-4 gap-y-3">
        <div className="form-group col-span-4">
          <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
            CEP
          </label>
          <input
            required
            value={address.zipCode ?? ""}
            className="form-control"
            onChange={(e: any) =>
              handleAddress({ zipCode: e.target.value as any })
            }
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
            onChange={(e: any) => handleAddress({ street: e.target.value })}
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
            onChange={(e: any) =>
              handleAddress({ number: justNumber(e.target.value) as any })
            }
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
                onChange={(e: any) => handleAddress({ state: e.target.value })}
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
                onChange={(e: any) => handleAddress({ city: e.target.value })}
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
    )}

    <div className="flex gap-1 text-xs mt-2">
      <input
        type="checkbox"
        onChange={(e: any) => setUseOrderAddress(e.target.checked)}
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
        onChange={(e: any) =>
          handleCard({
            number: justNumber(e.target.value).toString(),
          })
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
              id="expiry_month"
              name="expiry_month"
              required
              onChange={(e: any) =>
                handleCard({
                  exp_month: justNumber(e.target.value),
                })
              }
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
              id="expiry_year"
              name="expiry_year"
              required
              onChange={(e: any) =>
                handleCard({
                  exp_year: justNumber(e.target.value),
                })
              }
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
          onChange={(e: any) =>
            handleCard({
              cvv: justNumber(e.target.value).toString(),
            })
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
          onChange={(e: any) =>
            setInstallments(
              parseInt(justNumber(e.target.value), 10) || 1
            )
          }
          value={installments}
        >
          {[1, 2, 3, 4, 5].map((option) => (
            <option key={option} value={option}>
              {option}x
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);
