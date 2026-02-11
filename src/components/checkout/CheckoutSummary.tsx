import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "@/src/components/ui/form";
import { dateBRFormat, moneyFormat, isCEPInRegion } from "@/src/helper";
import DeliveryPriceSummary, { DeliverySummaryEntry } from "./DeliveryPriceSummary";
import { CartType } from "@/src/models/cart";
import { AddressType } from "@/src/models/address";

interface CheckoutSummaryProps {
  resume: {
    subtotal: number;
    total: number;
    startDate: string | null;
    endDate: string | null;
  };
  listCart: CartType[];
  schedule: string;
  formattedAddressZip: string;
  loadingDeliveryPrice: boolean;
  deliverySummary: {
    entries: DeliverySummaryEntry[];
    total: number;
    missingStoreIds: number[];
  };
  missingStoresNames: string[];
  address: AddressType;
  phone: string;
  isPhoneValid: boolean;
  formLoading: boolean;
  termsContent?: { term_description: string }[];
  storesList?: any[];
}

export default function CheckoutSummary({
  resume,
  listCart,
  schedule,
  formattedAddressZip,
  loadingDeliveryPrice,
  deliverySummary,
  missingStoresNames,
  address,
  phone,
  isPhoneValid,
  formLoading,
  termsContent,
  storesList,
}: CheckoutSummaryProps) {
  const canSubmit =
    !!address?.street &&
    !!address?.complement &&
    !!address?.number &&
    !!schedule &&
    !!address?.zipCode &&
    !!isCEPInRegion(address?.zipCode) &&
    isPhoneValid;

  return (
    <div className="w-full lg:w-1/3 xl:w-[55%] lg:max-w-md">
      <div className="sticky top-4">
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="font-title font-bold text-zinc-900 text-xl lg:text-2xl mb-4 lg:mb-6">
            Resumo
          </div>

          <div className="space-y-4">
            {/* Data da Locação */}
            <div className="flex items-start justify-between gap-4">
              <div className="font-semibold text-sm text-zinc-900 flex items-center">
                <Icon
                  icon="fa-calendar"
                  className="text-sm mr-2 opacity-75 flex-shrink-0"
                />
                <span>Data da locação</span>
              </div>
              <div className="text-right text-sm">
                <div>
                  {dateBRFormat(resume.startDate)}{" "}
                  {resume.endDate != resume.startDate
                    ? `- ${dateBRFormat(resume.endDate)}`
                    : ""}
                </div>
                {schedule && (
                  <div className="text-yellow-600 font-medium">{schedule}</div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-300"></div>

            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Subtotal ({listCart.length}{" "}
                {listCart.length == 1 ? "item" : "itens"})
              </div>
              <div className="font-medium">R$ {moneyFormat(resume.subtotal)}</div>
            </div>

            <div className="border-t border-gray-300"></div>

            {/* Frete */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="font-semibold text-sm text-zinc-900 flex items-center">
                  <Icon
                    icon="fa-truck"
                    className="text-sm mr-2 opacity-75 flex-shrink-0"
                  />
                  <span>
                    Frete {formattedAddressZip && `(${formattedAddressZip})`}
                  </span>
                </div>
                <div className="text-right font-medium text-sm text-zinc-900">
                  {loadingDeliveryPrice
                    ? "Calculando..."
                    : deliverySummary.entries.length
                    ? `R$ ${moneyFormat(deliverySummary.total)}`
                    : formattedAddressZip
                    ? "—"
                    : "Informe o CEP"}
                </div>
              </div>
              <DeliveryPriceSummary
                entries={deliverySummary.entries}
                missingStoresNames={missingStoresNames}
                formattedZip={formattedAddressZip}
                loading={loadingDeliveryPrice}
              />
            </div>

            <div className="border-t border-gray-300"></div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-lg font-bold text-zinc-900">TOTAL</div>
              <div className="text-2xl lg:text-3xl text-zinc-900 font-bold">
                R$ {moneyFormat(resume.total)}
              </div>
            </div>

            {/* Regras de locacao por loja */}
            {storesList?.some((s: any) => s.rental_rules?.enabled) && (
              <div className="bg-gray-100 rounded-lg p-4 space-y-3 text-sm">
                {storesList.filter((s: any) => s.rental_rules?.enabled).map((s: any) => {
                  const rules = s.rental_rules;
                  const parts: string[] = [];
                  const returnLabels: any = { same_day: "mesmo dia", next_day: "dia seguinte", "24h": "24 horas", "48h": "48 horas" };
                  const returnText = rules.return_period === "custom" ? rules.return_period_custom : returnLabels[rules.return_period];
                  if (returnText) parts.push(`devolução: ${returnText}`);
                  if (rules.deposit_enabled) parts.push(rules.deposit_type === "fixed" ? `caução de R$ ${rules.deposit_value}` : `caução de ${rules.deposit_value}% do valor`);
                  if (rules.cancellation_deadline) {
                    let cancel = `cancelamento até ${rules.cancellation_deadline}h antes`;
                    if (rules.cancellation_fee) cancel += ` (multa de ${rules.cancellation_fee}%)`;
                    parts.push(cancel);
                  }
                  if (rules.late_fee_enabled && rules.late_fee_value) parts.push(`multa por atraso: R$ ${rules.late_fee_value}/dia`);
                  return (
                    <div key={s.id} className="flex gap-3">
                      <div className="pt-1">
                        <input type="checkbox" required className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                      </div>
                      <div className="text-sm leading-relaxed">
                        <span>Li e aceito as regras de locação de <strong>{s.title}</strong></span>
                        {parts.length > 0 && <span>: {parts.join(", ")}.</span>}
                        {!!rules.additional_rules && <p className="text-zinc-500 mt-1">{rules.additional_rules}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Botão de Confirmar */}
            <div className="pt-4">
              {canSubmit ? (
                <Button
                  loading={formLoading}
                  style="btn-success"
                  className="w-full py-4 text-base font-semibold"
                >
                  Confirmar e efetuar pagamento
                </Button>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-green-500/40 text-white border border-transparent py-4 text-base font-semibold rounded-lg cursor-not-allowed"
                >
                  Confirmar e efetuar pagamento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
