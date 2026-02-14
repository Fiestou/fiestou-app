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
    <div className="space-y-4">
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

        if (attribute.selectType === "color") {
          return (
            <ColorInput
              key={index}
              attribute={attribute}
              activeVariations={activeVariations}
              updateOrder={updateOrder}
            />
          );
        }

        return (
          <div key={index} className="border border-zinc-200 rounded-lg p-4 bg-white">
            <div className="font-medium text-sm text-zinc-900 mb-3">
              {attribute.title}
            </div>

            <div className="space-y-2">
              {attribute.variations?.map((item: any, key) => {
                const isChecked =
                  activeVariations
                    ?.find((attr: any) => attr.id === attribute.id)
                    ?.variations?.some((v: any) => v.id === item.id) ?? false;

                return (
                  <label
                    key={key}
                    className={`
                      flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer
                      transition-all duration-200 border
                      ${
                        isChecked
                          ? "bg-yellow-50 border-yellow-300 shadow-sm"
                          : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
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
                      <div className="shrink-0">
                        <Checkbox
                          checked={isChecked}
                          type={attribute.selectType}
                        />
                      </div>
                    )}

                    {!!item?.image && (
                      <div className="w-12 h-12 bg-zinc-100 relative rounded-md shrink-0">
                        <Img
                          src={getImage(item.image, "thumb")}
                          className="absolute inset-0 w-full h-full object-contain rounded-md"
                        />
                      </div>
                    )}

                    <div className="flex-1 text-sm text-zinc-900">{item.title}</div>

                    {!!item?.price && (
                      <div className="shrink-0 text-sm font-medium text-emerald-600">
                        + R$ {formatMoney(item.price)}
                      </div>
                    )}

                    {attribute.selectType === "quantity" && (
                      <div className="shrink-0">
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
                          className="max-w-[7rem]"
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
    </div>
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
  const customPriceRaw = (attribute as any).customPrice;
  const customPrice = typeof customPriceRaw === "string" ? parseFloat(customPriceRaw.replace(",", ".")) : Number(customPriceRaw || 0);

  return (
    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium text-sm text-zinc-900">{attribute.title}</label>
        {!!customPrice && customPrice > 0 && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            + R$ {formatMoney(customPrice)}
          </span>
        )}
      </div>
      <textarea
        value={currentValue}
        onChange={(e) =>
          updateOrder(
            {
              id: attribute.id + "_text",
              title: attribute.title,
              value: e.target.value,
              price: customPrice,
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
  const customPriceRaw = (attribute as any).customPrice;
  const customPrice = typeof customPriceRaw === "string" ? parseFloat(customPriceRaw.replace(",", ".")) : Number(customPriceRaw || 0);

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
              price: customPrice,
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
    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <label className="font-medium text-sm text-zinc-900">{attribute.title}</label>
        {!!customPrice && customPrice > 0 && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            + R$ {formatMoney(customPrice)}
          </span>
        )}
      </div>
      {displayPreview ? (
        <div className="relative inline-block">
          <img
            src={displayPreview}
            alt="Preview"
            className="max-h-32 rounded-lg object-contain border border-zinc-200"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
          >
            <X size={12} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center gap-2 py-8 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/30 transition-all">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <Upload size={20} className="text-yellow-600" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-zinc-700 block">
              {(attribute as any).placeholder || "Clique para enviar"}
            </span>
            <span className="text-xs text-zinc-400 mt-1 block">JPG, PNG ou WEBP (max 10MB)</span>
          </div>
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
  );
}

function ColorInput({
  attribute,
  activeVariations,
  updateOrder,
}: {
  attribute: AttributeType;
  activeVariations: any;
  updateOrder: (item: VariationProductOrderType, attribute: AttributeType) => void;
}) {
  return (
    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
      <div className="font-medium text-sm text-zinc-900 mb-3">
        {attribute.title}
      </div>
      <div className="flex flex-wrap gap-2">
        {attribute.variations?.map((item: any, key) => {
          const isChecked =
            activeVariations
              ?.find((attr: any) => attr.id === attribute.id)
              ?.variations?.some((v: any) => v.id === item.id) ?? false;

          return (
            <button
              key={key}
              type="button"
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
              className={`
                relative flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all
                ${
                  isChecked
                    ? "border-yellow-400 bg-yellow-50 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }
              `}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: item.color || "#ffffff" }}
              />
              <span className="text-xs font-medium text-zinc-700">{item.title}</span>
              {!!item?.price && (
                <span className="text-xs font-semibold text-emerald-600">
                  + R$ {formatMoney(item.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
