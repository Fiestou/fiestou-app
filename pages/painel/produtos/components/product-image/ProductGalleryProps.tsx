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

const ProductGallery: React.FC<ProductGalleryProps> = ({
  data,
  handleData,
}) => {
  return (
    <div>
      <div className="form-group">
        <Gallery
          product={data?.id}
          emitProduct={(productID: number) => handleData({ id: productID })}
        />
      </div>
    </div>
  );
};
export default ProductGallery;