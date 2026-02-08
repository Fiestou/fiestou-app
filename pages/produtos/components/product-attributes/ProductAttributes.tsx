"use client";

import { AttributeType, VariationProductOrderType } from "@/src/models/product";
import Checkbox from "@/src/components/ui/form/CheckboxUI";
import QtdInput from "@/src/components/ui/form/QtdUI";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import { formatMoney } from "@/src/components/utils/Currency";

interface ProductAttributesProps {
  attributes: AttributeType[];
  activeVariations: any;
  getImageAttr: (imageID: number) => any;
  navegateImageCarousel: (imageID: number) => void;
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
  if (!Array.isArray(attributes)) return null;

  return (
    <>
      {attributes.map((attribute, index) => (
        <div key={index} className="md:pt-4">
          <div className="font-title text-zinc-900 font-bold py-4 text-sm lg:text-lg">
            {attribute.title}
          </div>

          <div className="border-b rounded-md overflow-hidden">
            {attribute.variations?.map((item: any, key) => {
              const isChecked =
                activeVariations
                  ?.find((attr: any) => attr.id === attribute.id)
                  ?.variations?.some((v: any) => v.id === item.id) ?? false;

              return (
                <label
                  key={key}
                  className={`
                    flex items-center gap-4 py-3 px-2 border-t cursor-pointer
                    transition-colors duration-200
                    ${
                      isChecked
                        ? "bg-yellow-100 border-yellow-200"
                        : "bg-white hover:bg-zinc-50"
                    }
                  `}
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
                  {(attribute.selectType === "radio" ||
                    attribute.selectType === "checkbox") && (
                    <div className="w-fit">
                      <Checkbox
                        checked={isChecked}
                        type={attribute.selectType}
                      />
                    </div>
                  )}

                  {!!item?.image && (
                    <div className="aspect-[4/3] bg-zinc-100 w-[4.5rem] relative rounded">
                      <Img
                        src={getImage(item.image, "thumb")}
                        className="absolute inset-0 w-full h-full object-contain rounded"
                      />
                    </div>
                  )}

                  <div className="flex-1 py-1 text-zinc-900">{item.title}</div>

                  <div className="w-fit py-1 whitespace-nowrap text-sm text-zinc-700">
                    {!!item?.price && `R$ ${formatMoney(item.price)}`}
                  </div>

                  {attribute.selectType === "quantity" && (
                    <div className="w-fit">
                      <QtdInput
                        value={
                          activeVariations
                            ?.find((a: any) => a.id === attribute.id)
                            ?.variations?.find((v: any) => v.id === item.id)
                            ?.quantity ?? 0
                        }
                        emitQtd={(value: number) =>
                          updateOrder(
                            {
                              id: item.id,
                              title: item.title ?? "",
                              price: item.price,
                              quantity: value,
                            },
                            attribute
                          )
                        }
                        className="max-w-[8rem]"
                      />
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
