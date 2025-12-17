"use client";

import { AttributeType, VariationProductOrderType } from "@/src/models/product";
import Checkbox from "@/src/components/ui/form/CheckboxUI";
import QtdInput from "@/src/components/ui/form/QtdUI";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";

interface ProductAttributesProps {
  attributes: AttributeType[];
  activeVariations: any;
  updateOrder: (
    item: VariationProductOrderType,
    attribute: AttributeType
  ) => void;
}

export default function ProductAttributes({
  attributes,
  activeVariations,
  updateOrder,
}: ProductAttributesProps) {
  const formatMoney = (value: any): string => {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(/\./g, "").replace(",", "."))
        : Number(value);
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (!Array.isArray(attributes)) return null;

  return (
    <>
      {attributes.map((attribute, index) => (
        <div key={index} className="md:pt-4">
          <div className="font-title text-zinc-900 font-bold py-4 text-sm lg:text-lg">
            {attribute.title}
          </div>

          <div className="border-b">
            {attribute?.variations?.map((item: any, key) => (
              <label
                key={key}
                className="flex border-t py-2 gap-4 items-center"
              >
                {(attribute.selectType === "radio" ||
                  attribute.selectType === "checkbox") && (
                  <div className="w-fit">
                    <div
                      onClick={() =>
                        updateOrder(
                          {
                            id: item.id,
                            title: item.title ?? "",
                            price: item.price,
                            quantity: 1,
                          },
                          attribute
                        )
                      }
                    >
                      <Checkbox
                        checked={!!activeVariations[item.id]}
                        type={attribute.selectType}
                      />
                    </div>
                  </div>
                )}

                {!!item?.image (item?.image) && (
                  <div
                    onClick={() => (item?.image)}
                    className="aspect-[4/3] cursor-pointer bg-zinc-100 w-[4.5rem] relative"
                  >
                    <Img
                      src={getImage((item?.image), "thumb")}
                      className="rounded absolute w-full h-full inset-0 object-contain"
                    />
                  </div>
                )}

                <div
                  className="w-full py-1 cursor-pointer"
                  onClick={() =>
                    updateOrder(
                      {
                        id: item.id,
                        title: item.title ?? "",
                        price: item.price,
                        quantity: 1,
                      },
                      attribute
                    )
                  }
                >
                  {item.title}
                </div>

                <div className="w-fit py-1 whitespace-nowrap">
                  {!!item?.price ? `R$ ${formatMoney(item.price)}` : ""}
                </div>

                {attribute.selectType === "quantity" && (
                  <div className="w-fit">
                    <QtdInput
                      value={0}
                      emitQtd={(value: number) =>
                        updateOrder(
                          {
                            id: item.id,
                            title: item.title ?? "",
                            price: item.price,
                            quantity: value ?? 1,
                          },
                          attribute
                        )
                      }
                      className="max-w-[8rem]"
                    />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
