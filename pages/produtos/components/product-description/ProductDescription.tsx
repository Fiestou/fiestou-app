"use client";

import { useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";
import { getSummary } from "@/src/helper";

interface ProductDescriptionProps {
  product: ProductType;
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  const [resume, setResume] = useState(false);

  if (!product) return null;

  return (
    <div className="grid gap-2">
      {/* Subtítulo */}
      {!!product.subtitle && (
        <div
          onClick={() => setResume(!resume)}
          className="cursor-pointer break-words w-full whitespace-pre-wrap font-semibold text-zinc-900"
        >
          {product.subtitle}
          {resume && (
            <div className="inline-block w-0">
              <Icon
                icon="fa-chevron-up"
                type="far"
                className="text-xs pl-1"
              />
            </div>
          )}
        </div>
      )}

      {/* Descrição */}
      {!!product.description && (
        <div>
          <div
            className="break-words whitespace-pre-wrap inline-block"
            dangerouslySetInnerHTML={{
              __html: resume
                ? product.description
                : getSummary(product.description, 100),
            }}
          ></div>

          {!resume && (
            <div
              onClick={() => setResume(true)}
              className="pt-2 text-cyan-500 underline cursor-pointer"
            >
              ler mais
            </div>
          )}
        </div>
      )}
    </div>
  );
}
