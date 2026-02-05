"use client";

import React from "react";
import { Label } from "@/src/components/ui/form";
import { Select } from "@/src/components/ui/form";
import { ProductType } from "@/src/models/product";

interface TransportSectionProps {
  data: ProductType;
  handleData: (value: Partial<ProductType>) => void;
  realMoneyNumber: (value: string) => string;
}

const TransportSection: React.FC<TransportSectionProps> = ({
  data,
  handleData,
  realMoneyNumber,
}) => {
  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">Transporte</h4>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="form-group">
          <Label>Tipo de entrega</Label>
          <Select
            value={data?.delivery_type ?? "delivery"}
            name="delivery_type"
            options={[
              { name: "Entrega", value: "delivery" },
              { name: "Retirada na loja", value: "pickup" },
              { name: "Ambos", value: "both" },
            ]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleData({ delivery_type: e.target.value as any })
            }
          />
        </div>

        {/* Produto frágil */}
        <div className="form-group">
          <Label>Produto frágil?</Label>
          <Select
            value={data?.fragility ?? "yes"}
            name="fragilidade"
            options={[
              { name: "Sim", value: "yes" },
              { name: "Não", value: "no" },
            ]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleData({ fragility: e.target.value })
            }
          />
        </div>

        {/* Veículo */}
        <div className="form-group">
          <Label>Veículo</Label>
          <Select
            value={data?.vehicle ?? ""}
            name="veiculo"
            options={[
              { name: "Moto", value: "motorbike" },
              { name: "Carro", value: "car" },
              { name: "Caminhonete", value: "pickup" },
              { name: "Caminhão", value: "truck" },
            ]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleData({ vehicle: e.target.value })
            }
          />
        </div>

        {/* Valor de KM rodado */}
        <div className="form-group">
          <Label>Valor de KM rodado</Label>
          <input
            value={data?.freeTax ? data.freeTax : ""}
            type="text"
            name="freeTax"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleData({ freeTax: realMoneyNumber(e.target.value) })
            }
            placeholder="R$ 00.00"
            className="form-control"
          />
        </div>

        {/* Montagem */}
        <div className="form-group">
          <Label>Montagem</Label>
          <Select
            value={data?.assembly ?? ""}
            name="montagem"
            options={[
              { name: "Fornecer", value: "on" },
              { name: "Não fornecer", value: "off" },
            ]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleData({ assembly: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default TransportSection;
