import React from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Input from "@/src/components/ui/form/InputUI";
import MultiSelect from "@/src/components/ui/form/MultiSelectUi";
interface StoreDeliveryFormProps {
  store: any;
  form: any;

  deliveryRegionsOptions: Array<{ label: string; value: any }>;

  renderAction: (field: string) => React.ReactNode;

  handleSubmit: (e: React.FormEvent) => void;
  handleStore: (data: any) => void;
}

export default function StoreDeliveryForm({
  store,
  form,
  deliveryRegionsOptions,
  renderAction,
  handleSubmit,
  handleStore,
}: StoreDeliveryFormProps) {
  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      method="POST"
      className="grid gap-4 border-b pb-8 mb-0"
    >
      {/* HEADER */}
      <div className="flex items-center">
        <div className="w-full">
          <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
            Valores de entrega
          </h4>
        </div>
        <div className="w-fit">{renderAction("frete")}</div>
      </div>

      {/* CONTENT / EDIT MODE */}
      <div className="w-full">
        {form.edit === "frete" ? (
          <div className="grid gap-4">
            {/* Possui entrega? */}
            <div className="grid gap-2">
              <label className="font-medium">
                Você possui serviço de entrega?
              </label>
              <div className="flex gap-4">
                {/* SIM */}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_delivery_fee_active"
                    value="1"
                    checked={!!store?.is_delivery_fee_active}
                    onChange={(e) =>
                      handleStore({
                        is_delivery_fee_active: Number(e.target.value),
                      })
                    }
                  />
                  <span>Sim</span>
                </label>

                {/* NÃO */}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="is_delivery_fee_active"
                    value="0"
                    checked={!store?.is_delivery_fee_active}
                    onChange={(e) =>
                      handleStore({
                        is_delivery_fee_active: Number(e.target.value),
                      })
                    }
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>

            {/* Valor por KM */}
            <div className="grid gap-2">
              <label className="font-medium">Valor do KM rodado</label>
              <div className="relative">
                <Input
                  type="text"
                  className="w-full"
                  value={store?.default_delivery_fee}
                  onChange={(e) =>
                    handleStore({
                      default_delivery_fee: e.target.value,
                    })
                  }
                />

                {/* Tooltip */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-help group">
                  <Icon icon="fa-info-circle" className="text-zinc-400" />
                  <div className="absolute hidden group-hover:block right-0 bg-zinc-800 text-white p-2 rounded text-sm w-48">
                    Valor cobrado por quilômetro rodado na entrega
                  </div>
                </div>
              </div>
            </div>

            {/* Região de atendimento */}
            <div className="grid gap-2">
              <label className="font-medium">Região de atendimento</label>
              <MultiSelect
                name="deliveryRegions"
                placeholder="Selecione as regiões"
                value={store?.deliveryRegions}
                onChange={(values) =>
                  handleStore({
                    deliveryRegions: values,
                  })
                }
                options={deliveryRegionsOptions}
                className="min-h-[46px] relative"
                isMulti
              />
            </div>
          </div>
        ) : (
          <>Informe as regras do frete</>
        )}
      </div>
    </form>
  );
}
