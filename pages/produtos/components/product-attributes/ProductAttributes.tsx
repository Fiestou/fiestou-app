"use client";

import { AttributeType, VariationProductOrderType } from "@/src/models/product";
import Checkbox from "@/src/components/ui/form/CheckboxUI";
import QtdInput from "@/src/components/ui/form/QtdUI";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import { formatMoney } from "@/src/components/utils/Currency";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Api from "@/src/services/api";

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
      {attributes.map((attribute, index) => {
        if (attribute.selectType === "text") {
          return (
            <TextInput
              key={index}
              attribute={attribute}
              activeVariations={activeVariations}
              updateOrder={updateOrder}
            />
          );
        }

        if (attribute.selectType === "image") {
          return (
            <ImageInput
              key={index}
              attribute={attribute}
              activeVariations={activeVariations}
              updateOrder={updateOrder}
            />
          );
        }

        return (
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
        );
      })}
    </>
  );
}

function TextInput({
  attribute,
  activeVariations,
  updateOrder,
}: {
  attribute: AttributeType;
  activeVariations: any;
  updateOrder: (item: VariationProductOrderType, attribute: AttributeType) => void;
}) {
  const existing = activeVariations?.find((a: any) => a.id === attribute.id);
  const currentValue = existing?.variations?.[0]?.value ?? "";
  const customPrice = (attribute as any).customPrice;

  return (
    <div className="md:pt-4">
      <div className="font-title text-zinc-900 font-bold py-4 text-sm lg:text-lg flex items-center gap-2">
        {attribute.title}
        {!!customPrice && customPrice > 0 && (
          <span className="text-xs font-normal text-zinc-500">+ R$ {formatMoney(customPrice)}</span>
        )}
      </div>
      <div className="border rounded-lg p-3">
        <textarea
          value={currentValue}
          onChange={(e) =>
            updateOrder(
              {
                id: attribute.id + "_text",
                title: attribute.title,
                value: e.target.value,
                price: customPrice || 0,
                quantity: 1,
              },
              { ...attribute, selectType: "text" }
            )
          }
          placeholder={(attribute as any).placeholder || "Digite aqui..."}
          rows={3}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none"
        />
      </div>
    </div>
  );
}

function ImageInput({
  attribute,
  activeVariations,
  updateOrder,
}: {
  attribute: AttributeType;
  activeVariations: any;
  updateOrder: (item: VariationProductOrderType, attribute: AttributeType) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const existing = activeVariations?.find((a: any) => a.id === attribute.id);
  const currentValue = existing?.variations?.[0]?.value ?? "";
  const customPrice = (attribute as any).customPrice;

  const displayPreview = preview || currentValue || null;

  const handleFile = async (file: File) => {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const api = new Api();

        const res: any = await api.bridge({
          method: "post",
          url: "files/upload-base64",
          data: {
            index: "custom",
            dir: "personalizados",
            medias: [{ base64, fileName: file.name.replace(/\.[^/.]+$/, "") }],
          },
        });

        const uploaded = res?.data?.[0];
        if (uploaded?.status && uploaded?.media) {
          const imgUrl = getImage(uploaded.media, "default") || uploaded.media?.permanent_url || base64;

          updateOrder(
            {
              id: attribute.id + "_image",
              title: attribute.title,
              value: imgUrl,
              price: customPrice || 0,
              quantity: 1,
            },
            { ...attribute, selectType: "image" }
          );
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    updateOrder(
      {
        id: attribute.id + "_image",
        title: attribute.title,
        value: "",
        price: 0,
        quantity: 0,
      },
      { ...attribute, selectType: "image" }
    );
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="md:pt-4">
      <div className="font-title text-zinc-900 font-bold py-4 text-sm lg:text-lg flex items-center gap-2">
        {attribute.title}
        {!!customPrice && customPrice > 0 && (
          <span className="text-xs font-normal text-zinc-500">+ R$ {formatMoney(customPrice)}</span>
        )}
      </div>
      <div className="border rounded-lg p-4">
        {displayPreview ? (
          <div className="relative inline-block">
            <img
              src={displayPreview}
              alt="Preview"
              className="max-h-40 rounded-lg object-contain border border-zinc-200"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/30 transition-colors">
            <Upload size={24} className="text-zinc-400" />
            <span className="text-sm text-zinc-500">
              {(attribute as any).placeholder || "Clique para enviar uma imagem"}
            </span>
            <span className="text-xs text-zinc-400">JPG, PNG ou WEBP (max 10MB)</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
