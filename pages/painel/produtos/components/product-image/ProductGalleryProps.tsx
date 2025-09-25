"use client";

import React from "react";
import Gallery from "@/src/components/pages/painel/produtos/produto/Gallery"; // ajuste o caminho conforme seu projeto

interface ProductType {
  id?: number | string;
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  category?: (string | number)[];
}

interface ProductGalleryProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  data,
  handleData,
}) => {
  return (
    <div className="border-t pt-4 pb-2">
      <div className="form-group">
        <Gallery
          product={data.id}
          emitProduct={(productID: number) => handleData({ id: productID })}
        />
      </div>
    </div>
  );
};
